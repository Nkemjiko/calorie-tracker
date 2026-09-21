"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MealLogWithFood, FastingSessionRow } from "@/lib/types";
import type { InsightPeriod } from "@/components/insights/period-switcher";
import type { Metric } from "@/components/insights/metric-cards";
import type { CalorieFastingPoint } from "@/components/insights/calorie-fasting-chart";
import type { MacroSlice } from "@/components/insights/macro-donut";
import type { TopFood } from "@/components/insights/top-foods";

const MACRO_COLORS = {
  carbs: "var(--brand-green)",
  protein: "var(--brand-orange)",
  fat: "var(--muted-foreground)",
};

type InsightData = {
  metrics: Metric[];
  chart: CalorieFastingPoint[];
  macros: MacroSlice[];
  topFoods: TopFood[];
};

const EMPTY: InsightData = {
  metrics: [
    { label: "Avg Daily Calories", value: "0", delta: "—", trend: "up", icon: "calories" },
    { label: "Total Fasting Hours", value: "0h", delta: "—", trend: "up", icon: "fasting" },
    { label: "Current Fasting Streak", value: "0 days", delta: "—", trend: "up", icon: "streak" },
    { label: "Weight Change", value: "0 kg", delta: "—", trend: "up", icon: "weight" },
  ],
  chart: [],
  macros: [
    { macro: "Carbs", value: 0, color: MACRO_COLORS.carbs },
    { macro: "Protein", value: 0, color: MACRO_COLORS.protein },
    { macro: "Fat", value: 0, color: MACRO_COLORS.fat },
  ],
  topFoods: [],
};

function getPeriodRange(period: InsightPeriod): { start: Date; labels: string[] } {
  const now = new Date();
  if (period === "weekly") {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start, labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] };
  }
  if (period === "monthly") {
    const start = new Date(now);
    start.setDate(start.getDate() - 27);
    start.setHours(0, 0, 0, 0);
    return { start, labels: ["W1", "W2", "W3", "W4"] };
  }
  const start = new Date(now);
  start.setMonth(start.getMonth() - 5);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return { start, labels: [] };
}

export function useInsights(period: InsightPeriod) {
  const [data, setData] = useState<InsightData>(EMPTY);
  const [loading, setLoading] = useState(true);

  const fetchInsights = useCallback(async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setData(EMPTY);
      setLoading(false);
      return;
    }

    const { start } = getPeriodRange(period);
    const startISO = start.toISOString();

    const [mealsRes, fastsRes] = await Promise.all([
      supabase
        .from("meal_logs")
        .select("*, food(*)")
        .gte("logged_at", startISO)
        .order("logged_at", { ascending: true }),
      supabase
        .from("fasting_sessions")
        .select("*")
        .gte("start_time", startISO)
        .order("start_time", { ascending: true }),
    ]);

    const meals = (mealsRes.data as MealLogWithFood[]) ?? [];
    const fasts = (fastsRes.data as FastingSessionRow[]) ?? [];

    const now = new Date();

    // Build chart data
    let chart: CalorieFastingPoint[] = [];
    if (period === "weekly") {
      const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(day.getDate() - i);
        day.setHours(0, 0, 0, 0);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);

        const dayMeals = meals.filter((m) => {
          const t = new Date(m.logged_at);
          return t >= day && t <= dayEnd;
        });
        const calories = dayMeals.reduce((s, m) => s + m.total_calories, 0);

        const dayFasts = fasts.filter((s) => {
          const st = new Date(s.start_time);
          const en = s.end_time ? new Date(s.end_time) : new Date();
          return st <= dayEnd && en >= day;
        });
        const fastingHours = dayFasts.reduce((acc, s) => {
          const st = new Date(s.start_time);
          const en = s.end_time ? new Date(s.end_time) : new Date();
          const effStart = st > day ? st : day;
          const effEnd = en < dayEnd ? en : dayEnd;
          return acc + Math.max(0, (effEnd.getTime() - effStart.getTime()) / 3600000);
        }, 0);

        chart.push({
          label: dayLabels[day.getDay()].slice(0, 3),
          calories,
          fastingHours: Math.round(fastingHours * 10) / 10,
        });
      }
    } else if (period === "monthly") {
      for (let w = 0; w < 4; w++) {
        const wStart = new Date(now);
        wStart.setDate(wStart.getDate() - (27 - w * 7));
        wStart.setHours(0, 0, 0, 0);
        const wEnd = new Date(wStart);
        wEnd.setDate(wEnd.getDate() + 6);
        wEnd.setHours(23, 59, 59, 999);

        const wMeals = meals.filter((m) => {
          const t = new Date(m.logged_at);
          return t >= wStart && t <= wEnd;
        });
        const calories = wMeals.reduce((s, m) => s + m.total_calories, 0);

        const wFasts = fasts.filter((s) => {
          const st = new Date(s.start_time);
          const en = s.end_time ? new Date(s.end_time) : new Date();
          return st <= wEnd && en >= wStart;
        });
        const fastingHours = wFasts.reduce((acc, s) => {
          const st = new Date(s.start_time);
          const en = s.end_time ? new Date(s.end_time) : new Date();
          const effStart = st > wStart ? st : wStart;
          const effEnd = en < wEnd ? en : wEnd;
          return acc + Math.max(0, (effEnd.getTime() - effStart.getTime()) / 3600000);
        }, 0);

        chart.push({
          label: `W${w + 1}`,
          calories,
          fastingHours: Math.round(fastingHours * 10) / 10,
        });
      }
    } else {
      // all-time: group by month
      const months: Record<string, { calories: number; fastingHours: number }> = {};
      for (const m of meals) {
        const d = new Date(m.logged_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!months[key]) months[key] = { calories: 0, fastingHours: 0 };
        months[key].calories += m.total_calories;
      }
      for (const s of fasts) {
        const d = new Date(s.start_time);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!months[key]) months[key] = { calories: 0, fastingHours: 0 };
        const en = s.end_time ? new Date(s.end_time) : new Date();
        months[key].fastingHours += (en.getTime() - d.getTime()) / 3600000;
      }
      const sortedKeys = Object.keys(months).sort();
      const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      chart = sortedKeys.slice(-6).map((k) => {
        const mIdx = parseInt(k.split("-")[1]) - 1;
        return {
          label: monthLabels[mIdx],
          calories: months[k].calories,
          fastingHours: Math.round(months[k].fastingHours * 10) / 10,
        };
      });
    }

    // Metrics
    const totalCalories = meals.reduce((s, m) => s + m.total_calories, 0);
    const days = period === "weekly" ? 7 : period === "monthly" ? 28 : Math.max(1, Math.ceil((now.getTime() - start.getTime()) / 86400000));
    const avgCalories = days > 0 ? Math.round(totalCalories / days) : 0;

    const completedFasts = fasts.filter((f) => f.status === "completed");
    const totalFastingHours = completedFasts.reduce((acc, s) => {
      if (!s.end_time) return acc;
      return acc + (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / 3600000;
    }, 0);

    // Streak
    let streak = 0;
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 0; i < 7; i++) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      const dayFasts = fasts.filter((s) => {
        const st = new Date(s.start_time);
        const en = s.end_time ? new Date(s.end_time) : new Date();
        return st <= dayEnd && en >= day && s.status === "completed";
      });
      const hours = dayFasts.reduce((acc, s) => {
        const st = new Date(s.start_time);
        const en = s.end_time ? new Date(s.end_time) : new Date();
        const effStart = st > day ? st : day;
        const effEnd = en < dayEnd ? en : dayEnd;
        return acc + Math.max(0, (effEnd.getTime() - effStart.getTime()) / 3600000);
      }, 0);
      if (hours >= 14) streak++;
      else break;
    }

    const metrics: Metric[] = [
      { label: "Avg Daily Calories", value: avgCalories.toLocaleString(), delta: "—", trend: "up", icon: "calories" },
      { label: "Total Fasting Hours", value: `${Math.round(totalFastingHours)}h`, delta: "—", trend: "up", icon: "fasting" },
      { label: "Current Fasting Streak", value: `${streak} days`, delta: "—", trend: "up", icon: "streak" },
      { label: "Weight Change", value: "—", delta: "—", trend: "up", icon: "weight" },
    ];

    // Macros
    const macroTotals = meals.reduce(
      (acc, m) => {
        acc.carbs += (m.food?.carbs_g ?? 0) * m.serving_qty;
        acc.protein += (m.food?.protein_g ?? 0) * m.serving_qty;
        acc.fat += (m.food?.fat_g ?? 0) * m.serving_qty;
        return acc;
      },
      { carbs: 0, protein: 0, fat: 0 }
    );
    const macros: MacroSlice[] = [
      { macro: "Carbs", value: Math.round(macroTotals.carbs), color: MACRO_COLORS.carbs },
      { macro: "Protein", value: Math.round(macroTotals.protein), color: MACRO_COLORS.protein },
      { macro: "Fat", value: Math.round(macroTotals.fat), color: MACRO_COLORS.fat },
    ];

    // Top foods
    const foodMap: Record<string, { name: string; count: number; totalCalories: number }> = {};
    for (const m of meals) {
      const fid = m.food_id;
      const fname = m.food?.name ?? "Unknown";
      if (!foodMap[fid]) foodMap[fid] = { name: fname, count: 0, totalCalories: 0 };
      foodMap[fid].count += 1;
      foodMap[fid].totalCalories += m.total_calories;
    }
    const topFoods: TopFood[] = Object.entries(foodMap)
      .map(([id, v]) => ({ id, name: v.name, count: v.count, totalCalories: v.totalCalories }))
      .sort((a, b) => b.totalCalories - a.totalCalories)
      .slice(0, 5);

    setData({ metrics, chart, macros, topFoods });
    setLoading(false);
  }, [period]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return { data, loading, refetch: fetchInsights };
}
