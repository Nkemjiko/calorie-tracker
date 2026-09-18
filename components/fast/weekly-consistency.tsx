"use client"

import { CalendarCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type DayFast = {
  day: string
  // Fasting hours completed that day; 0 means a missed day.
  hours: number
  goal: number
}

const WEEK: DayFast[] = [
  { day: "M", hours: 16, goal: 16 },
  { day: "T", hours: 17, goal: 16 },
  { day: "W", hours: 12, goal: 16 },
  { day: "T", hours: 16, goal: 16 },
  { day: "F", hours: 0, goal: 16 },
  { day: "S", hours: 18, goal: 16 },
  { day: "S", hours: 8, goal: 16 },
]

export function WeeklyConsistency() {
  const completed = WEEK.filter((d) => d.hours >= d.goal).length
  const maxHours = Math.max(...WEEK.map((d) => Math.max(d.hours, d.goal)))

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
          {WEEK.map((d, i) => {
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
