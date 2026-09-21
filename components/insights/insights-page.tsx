"use client"

import { useState } from "react"
import { TrendingUp } from "lucide-react"
import { BottomNav } from "@/components/dashboard/bottom-nav"
import { PeriodSwitcher, type InsightPeriod } from "@/components/insights/period-switcher"
import { MetricCards } from "@/components/insights/metric-cards"
import { CalorieFastingChart } from "@/components/insights/calorie-fasting-chart"
import { MacroDonut } from "@/components/insights/macro-donut"
import { TopFoods } from "@/components/insights/top-foods"
import { useInsights } from "@/lib/hooks/use-insights"
import { useAuth } from "@/components/auth/auth-provider"

export function InsightsPage() {
  const { user, loading: authLoading } = useAuth()
  const [period, setPeriod] = useState<InsightPeriod>("weekly")
  const { data, loading } = useInsights(period)

  const showLoading = authLoading || loading

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
          {showLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="size-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
            </div>
          ) : !user ? (
            <div className="flex flex-col items-center gap-2 py-20 text-center">
              <p className="text-sm font-medium text-foreground">Sign in to see insights</p>
              <p className="text-xs text-muted-foreground">Your analytics will appear once you start logging meals and fasts.</p>
            </div>
          ) : (
            <>
              <MetricCards metrics={data.metrics} />
              <CalorieFastingChart data={data.chart} />
              <MacroDonut data={data.macros} />
              <TopFoods foods={data.topFoods} />
            </>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
