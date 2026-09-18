"use client"

import { Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export type MetabolicStage = {
  id: string
  label: string
  startHour: number
}

// Absolute fasting hours at which each biological state typically begins.
export const METABOLIC_STAGES: MetabolicStage[] = [
  { id: "fed", label: "Fed State", startHour: 0 },
  { id: "sugar", label: "Blood Sugar Drops", startHour: 4 },
  { id: "burn", label: "Fat Burning", startHour: 10 },
  { id: "ketosis", label: "Ketosis", startHour: 14 },
  { id: "autophagy", label: "Autophagy", startHour: 18 },
]

type BiologicalStateProps = {
  elapsedSeconds: number
}

export function BiologicalState({ elapsedSeconds }: BiologicalStateProps) {
  const elapsedHours = elapsedSeconds / 3600
  const lastStart = METABOLIC_STAGES[METABOLIC_STAGES.length - 1].startHour
  const fillPercent = Math.min(100, (elapsedHours / lastStart) * 100)

  const currentIndex = METABOLIC_STAGES.reduce(
    (acc, stage, i) => (elapsedHours >= stage.startHour ? i : acc),
    0,
  )
  const current = METABOLIC_STAGES[currentIndex]

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
            <Activity className="size-4" />
          </span>
          Biological state
        </CardTitle>
        <span className="rounded-full bg-brand-green/10 px-2.5 py-1 text-xs font-semibold text-brand-green">
          {current.label}
        </span>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="relative mt-1">
          <div className="h-1.5 w-full rounded-full bg-muted" />
          <div
            className="absolute inset-y-0 left-0 h-1.5 rounded-full bg-brand-green transition-[width] duration-700 ease-out"
            style={{ width: `${fillPercent}%` }}
          />
          <div className="absolute inset-x-0 -top-1 flex justify-between">
            {METABOLIC_STAGES.map((stage, i) => {
              const reached = elapsedHours >= stage.startHour
              const isCurrent = i === currentIndex
              return (
                <span
                  key={stage.id}
                  className={cn(
                    "size-3.5 rounded-full border-2 transition-colors",
                    reached
                      ? "border-brand-green bg-brand-green"
                      : "border-border bg-card",
                    isCurrent && "ring-2 ring-brand-green/30",
                  )}
                />
              )
            })}
          </div>
        </div>

        <div className="flex justify-between gap-1">
          {METABOLIC_STAGES.map((stage, i) => (
            <div
              key={stage.id}
              className="flex flex-1 flex-col items-center gap-0.5 text-center"
            >
              <span
                className={cn(
                  "text-[10px] font-medium leading-tight",
                  i === currentIndex ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {stage.label}
              </span>
              <span className="text-[10px] tabular-nums text-muted-foreground">
                {stage.startHour}h
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
