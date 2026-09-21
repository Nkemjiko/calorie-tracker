"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FastingSessionRow } from "@/lib/types";

export type WeeklyFastDay = {
  day: string;
  hours: number;
  goal: number;
};

export function useFasting() {
  const [activeSession, setActiveSession] = useState<FastingSessionRow | null>(
    null
  );
  const [weeklyHistory, setWeeklyHistory] = useState<WeeklyFastDay[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchActive = useCallback(async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setActiveSession(null);
      return;
    }

    const { data } = await supabase
      .from("fasting_sessions")
      .select("*")
      .eq("status", "active")
      .order("start_time", { ascending: false })
      .limit(1)
      .maybeSingle();

    setActiveSession((data as FastingSessionRow | null) ?? null);
  }, []);

  const fetchWeekly = useCallback(async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setWeeklyHistory([]);
      return;
    }

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("fasting_sessions")
      .select("*")
      .eq("status", "completed")
      .gte("start_time", weekAgo.toISOString())
      .order("start_time", { ascending: true });

    const sessions = (data as FastingSessionRow[]) ?? [];
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const days: WeeklyFastDay[] = [];

    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const daySessions = sessions.filter((s) => {
        const start = new Date(s.start_time);
        const end = s.end_time ? new Date(s.end_time) : new Date();
        return start <= dayEnd && end >= day;
      });

      const hours = daySessions.reduce((acc, s) => {
        const start = new Date(s.start_time);
        const end = s.end_time ? new Date(s.end_time) : new Date();
        const dayStart = new Date(day);
        const dayEnd2 = new Date(dayEnd);
        const effStart = start > dayStart ? start : dayStart;
        const effEnd = end < dayEnd2 ? end : dayEnd2;
        return acc + Math.max(0, (effEnd.getTime() - effStart.getTime()) / 3600000);
      }, 0);

      days.push({
        day: dayLabels[day.getDay()][0],
        hours: Math.round(hours * 10) / 10,
        goal: 16,
      });
    }

    setWeeklyHistory(days);

    let currentStreak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].hours >= days[i].goal) {
        currentStreak++;
      } else {
        break;
      }
    }
    setStreak(currentStreak);
  }, []);

  const fetchAll = useCallback(async () => {
    await Promise.all([fetchActive(), fetchWeekly()]);
    setLoading(false);
  }, [fetchActive, fetchWeekly]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const startFast = useCallback(async (targetHours: number) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("fasting_sessions")
      .insert({ target_hours: targetHours, status: "active" })
      .select("*")
      .single();
    if (error) return { error: error.message as const };
    setActiveSession(data as FastingSessionRow);
    return { data: data as FastingSessionRow };
  }, []);

  const endFast = useCallback(async () => {
    if (!activeSession) return { error: "No active fast" as const };
    const supabase = createClient();
    const { error } = await supabase
      .from("fasting_sessions")
      .update({ end_time: new Date().toISOString(), status: "completed" })
      .eq("id", activeSession.id);
    if (error) return { error: error.message as const };
    setActiveSession(null);
    await fetchWeekly();
    return { success: true as const };
  }, [activeSession, fetchWeekly]);

  return {
    activeSession,
    weeklyHistory,
    streak,
    loading,
    startFast,
    endFast,
    refetch: fetchAll,
  };
}
