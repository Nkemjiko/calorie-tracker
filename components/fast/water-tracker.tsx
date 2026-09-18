"use client"

import { Droplets, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type WaterTrackerProps = {
  // Amounts in millilitres.
  intake: number
  goal: number
  onAdd: (amount: number) => void
}

const INCREMENTS = [250, 500]

function formatLitres(ml: number) {
  return `${(ml / 1000).toFixed(1)}L`
}

export function WaterTracker({ intake, goal, onAdd }: WaterTrackerProps) {
  const percent = Math.min(100, (intake / goal) * 100)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-orange-soft text-brand-orange">
            <Droplets className="size-4" />
          </span>
          Water
        </CardTitle>
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {formatLitres(intake)}
          <span className="text-muted-foreground"> / {formatLitres(goal)}</span>
        </span>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-brand-orange-soft">
          <div
            className="h-full rounded-full bg-brand-orange transition-[width] duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex items-center gap-3">
          {INCREMENTS.map((amount) => (
            <Button
              key={amount}
              type="button"
              variant="outline"
              onClick={() => onAdd(amount)}
              className="h-10 flex-1 font-semibold"
            >
              <Plus data-icon="inline-start" />
              {amount}ml
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
