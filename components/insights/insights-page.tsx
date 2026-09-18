"use client"

import { useState } from "react"
import { TrendingUp } from "lucide-react"
import { BottomNav } from "@/components/dashboard/bottom-nav"
import { PeriodSwitcher, type InsightPeriod } from "@/components/insights/period-switcher"
import { MetricCards, type Metric } from "@/components/insights/metric-cards"
import {
  CalorieFastingChart,
  type CalorieFastingPoint,
} from "@/components/insights/calorie-fasting-chart"
import { MacroDonut, type MacroSlice } from "@/components/insights/macro-donut"
import { TopFoods, type TopFood } from "@/components/insights/top-foods"

type PeriodData = {
  metrics: Metric[]
  chart: CalorieFastingPoint[]
  macros: MacroSlice[]
  topFoods: TopFood[]
}

const MACRO_COLORS = {
  carbs: "var(--brand-green)",
  protein: "var(--brand-orange)",
  fat: "var(--muted-foreground)",
}

const INSIGHTS: Record<InsightPeriod, PeriodData> = {
  weekly: {
    metrics: [
      { label: "Avg Daily Calories", value: "1,840", delta: "-8%", trend: "up", icon: "calories" },
      { label: "Total Fasting Hours", value: "112h", delta: "+6%", trend: "up", icon: "fasting" },
      { label: "Current Fasting Streak", value: "5 days", delta: "+2", trend: "up", icon: "streak" },
      { label: "Weight Change", value: "-0.8 kg", delta: "-1.1%", trend: "up", icon: "weight" },
    ],
    chart: [
      { label: "Mon", calories: 1920, fastingHours: 16 },
      { label: "Tue", calories: 1750, fastingHours: 18 },
      { label: "Wed", calories: 2180, fastingHours: 14 },
      { label: "Thu", calories: 1680, fastingHours: 16 },
      { label: "Fri", calories: 2050, fastingHours: 12 },
      { label: "Sat", calories: 1890, fastingHours: 18 },
      { label: "Sun", calories: 1610, fastingHours: 20 },
    ],
    macros: [
      { macro: "Carbs", value: 210, color: MACRO_COLORS.carbs },
      { macro: "Protein", value: 105, color: MACRO_COLORS.protein },
      { macro: "Fat", value: 58, color: MACRO_COLORS.fat },
    ],
    topFoods: [
      { id: "jollof", name: "Jollof Rice", count: 5, totalCalories: 2400 },
      { id: "egusi", name: "Egusi Soup", count: 4, totalCalories: 1680 },
      { id: "pounded-yam", name: "Pounded Yam", count: 4, totalCalories: 1400 },
      { id: "suya", name: "Beef Suya", count: 6, totalCalories: 1260 },
      { id: "dodo", name: "Fried Plantain (Dodo)", count: 3, totalCalories: 960 },
    ],
  },
  monthly: {
    metrics: [
      { label: "Avg Daily Calories", value: "1,910", delta: "-4%", trend: "up", icon: "calories" },
      { label: "Total Fasting Hours", value: "468h", delta: "+11%", trend: "up", icon: "fasting" },
      { label: "Current Fasting Streak", value: "5 days", delta: "+2", trend: "up", icon: "streak" },
      { label: "Weight Change", value: "-2.6 kg", delta: "-3.4%", trend: "up", icon: "weight" },
    ],
    chart: [
      { label: "W1", calories: 1980, fastingHours: 15 },
      { label: "W2", calories: 1870, fastingHours: 17 },
      { label: "W3", calories: 1920, fastingHours: 16 },
      { label: "W4", calories: 1810, fastingHours: 18 },
    ],
    macros: [
      { macro: "Carbs", value: 920, color: MACRO_COLORS.carbs },
      { macro: "Protein", value: 460, color: MACRO_COLORS.protein },
      { macro: "Fat", value: 250, color: MACRO_COLORS.fat },
    ],
    topFoods: [
      { id: "jollof", name: "Jollof Rice", count: 19, totalCalories: 9120 },
      { id: "egusi", name: "Egusi Soup", count: 16, totalCalories: 6720 },
      { id: "ofada", name: "Ofada Rice & Ayamase", count: 11, totalCalories: 5720 },
      { id: "pounded-yam", name: "Pounded Yam", count: 15, totalCalories: 5250 },
      { id: "suya", name: "Beef Suya", count: 22, totalCalories: 4620 },
    ],
  },
  all: {
    metrics: [
      { label: "Avg Daily Calories", value: "1,975", delta: "-2%", trend: "up", icon: "calories" },
      { label: "Total Fasting Hours", value: "2,140h", delta: "+24%", trend: "up", icon: "fasting" },
      { label: "Current Fasting Streak", value: "5 days", delta: "best 21", trend: "up", icon: "streak" },
      { label: "Weight Change", value: "-9.4 kg", delta: "-11%", trend: "up", icon: "weight" },
    ],
    chart: [
      { label: "Jan", calories: 2120, fastingHours: 12 },
      { label: "Feb", calories: 2040, fastingHours: 14 },
      { label: "Mar", calories: 1980, fastingHours: 15 },
      { label: "Apr", calories: 1930, fastingHours: 16 },
      { label: "May", calories: 1900, fastingHours: 17 },
      { label: "Jun", calories: 1850, fastingHours: 18 },
    ],
    macros: [
      { macro: "Carbs", value: 5400, color: MACRO_COLORS.carbs },
      { macro: "Protein", value: 2900, color: MACRO_COLORS.protein },
      { macro: "Fat", value: 1600, color: MACRO_COLORS.fat },
    ],
    topFoods: [
      { id: "jollof", name: "Jollof Rice", count: 86, totalCalories: 41280 },
      { id: "egusi", name: "Egusi Soup", count: 72, totalCalories: 30240 },
      { id: "pounded-yam", name: "Pounded Yam", count: 68, totalCalories: 23800 },
      { id: "ofada", name: "Ofada Rice & Ayamase", count: 41, totalCalories: 21320 },
      { id: "suya", name: "Beef Suya", count: 94, totalCalories: 19740 },
    ],
  },
}

export function InsightsPage() {
  const [period, setPeriod] = useState<InsightPeriod>("weekly")
  const data = INSIGHTS[period]

  return (
    <div className="flex min-h-dvh flex-col bg-secondary/40">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="flex flex-col gap-4 px-4 pb-2 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
              <TrendingUp className="size-5" />
            </span>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Insights</h1>
              <p className="text-sm text-muted-foreground">Your progress at a glance</p>
            </div>
          </div>

          <PeriodSwitcher active={period} onSelect={setPeriod} />
        </header>

        <main className="flex flex-1 flex-col gap-4 px-4 pb-8 pt-3">
          <MetricCards metrics={data.metrics} />
          <CalorieFastingChart data={data.chart} />
          <MacroDonut data={data.macros} />
          <TopFoods foods={data.topFoods} />
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
