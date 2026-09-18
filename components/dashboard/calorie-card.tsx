"use client"

import { Flame } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ProgressRing } from "@/components/dashboard/progress-ring"
import { cn } from "@/lib/utils"

type Macro = {
  label: string
  value: number
  goal: number
  unit: string
  barClass: string
}

type CalorieCardProps = {
  consumed: number
  goal: number
  macros: {
    carbs: number
    protein: number
    fat: number
  }
}

const MACRO_GOALS = { carbs: 250, protein: 120, fat: 70 }

export function CalorieCard({ consumed, goal, macros }: CalorieCardProps) {
  const remaining = goal - consumed
  const percent = goal > 0 ? (consumed / goal) * 100 : 0
  const over = consumed > goal

  const macroRows: Macro[] = [
    {
      label: "Carbs",
      value: macros.carbs,
      goal: MACRO_GOALS.carbs,
      unit: "g",
      barClass:
        "[&_[data-slot=progress-indicator]]:bg-brand-orange [&_[data-slot=progress-track]]:bg-brand-orange-soft",
    },
    {
      label: "Protein",
      value: macros.protein,
      goal: MACRO_GOALS.protein,
      unit: "g",
      barClass:
        "[&_[data-slot=progress-indicator]]:bg-brand-green [&_[data-slot=progress-track]]:bg-brand-green-soft",
    },
    {
      label: "Fat",
      value: macros.fat,
      goal: MACRO_GOALS.fat,
      unit: "g",
      barClass:
        "[&_[data-slot=progress-indicator]]:bg-amber-500 [&_[data-slot=progress-track]]:bg-amber-100",
    },
  ]

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-orange-soft text-brand-orange">
            <Flame className="size-4" />
          </span>
          Calories
        </CardTitle>
        <span className="text-xs font-medium text-muted-foreground">
          Goal {goal.toLocaleString()} kcal
        </span>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="flex items-center gap-5">
          <ProgressRing
            value={Math.min(100, percent)}
            size={128}
            strokeWidth={12}
            color={over ? "var(--brand-orange)" : "var(--brand-green)"}
          >
            <span className="text-2xl font-semibold tabular-nums text-foreground">
              {consumed.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              eaten
            </span>
          </ProgressRing>

          <div className="flex flex-1 flex-col gap-3">
            <div className="flex flex-col">
              <span
                className={cn(
                  "text-2xl font-semibold tabular-nums",
                  over ? "text-brand-orange" : "text-brand-green"
                )}
              >
                {Math.abs(remaining).toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">
                kcal {over ? "over goal" : "remaining"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-muted/60 px-3 py-2">
                <p className="font-semibold text-foreground">{consumed.toLocaleString()}</p>
                <p className="text-muted-foreground">Consumed</p>
              </div>
              <div className="rounded-lg bg-muted/60 px-3 py-2">
                <p className="font-semibold text-foreground">{goal.toLocaleString()}</p>
                <p className="text-muted-foreground">Daily goal</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {macroRows.map((m) => {
            const pct = m.goal > 0 ? Math.min(100, (m.value / m.goal) * 100) : 0
            return (
              <div key={m.label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{m.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {Math.round(m.value)} / {m.goal}
                    {m.unit}
                  </span>
                </div>
                <Progress
                  value={pct}
                  className={cn("[&_[data-slot=progress-track]]:h-2.5", m.barClass)}
                />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
