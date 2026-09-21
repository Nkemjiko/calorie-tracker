"use client"

import { CalendarCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { WeeklyFastDay } from "@/lib/hooks/use-fasting"

type WeeklyConsistencyProps = {
  data: WeeklyFastDay[]
  streak: number
}

const FALLBACK: WeeklyFastDay[] = [
  { day: "M", hours: 0, goal: 16 },
  { day: "T", hours: 0, goal: 16 },
  { day: "W", hours: 0, goal: 16 },
  { day: "T", hours: 0, goal: 16 },
  { day: "F", hours: 0, goal: 16 },
  { day: "S", hours: 0, goal: 16 },
  { day: "S", hours: 0, goal: 16 },
]

export function WeeklyConsistency({ data, streak }: WeeklyConsistencyProps) {
  const week = data.length > 0 ? data : FALLBACK
  const completed = week.filter((d) => d.hours >= d.goal).length
  const maxHours = Math.max(...week.map((d) => Math.max(d.hours, d.goal)), 1)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
            <CalendarCheck className="size-4" />
          </span>
          This week
        </CardTitle>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {completed}
          <span className="text-muted-foreground"> / 7 fasts</span>
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2">
          {week.map((d, i) => {
            const met = d.hours >= d.goal
            const missed = d.hours === 0
            const heightPercent = Math.max(6, (d.hours / maxHours) * 100)
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-28 w-full items-end justify-center">
                  <div
                    className={cn(
                      "w-full max-w-8 rounded-md transition-all",
                      missed
                        ? "bg-muted"
                        : met
                          ? "bg-brand-green"
                          : "bg-brand-orange/70",
                    )}
                    style={{ height: `${missed ? 6 : heightPercent}%` }}
                    title={missed ? "Missed" : `${d.hours}h fast`}
                  />
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {d.day}
                </span>
              </div>
            )
          })}
        </div>

        {streak > 0 && (
          <div className="mt-3 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange-soft px-3 py-1 text-xs font-semibold text-brand-orange">
              {streak} day streak
            </span>
          </div>
        )}

        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-brand-green" />
            Goal met
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-brand-orange/70" />
            Partial
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-muted" />
            Missed
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
