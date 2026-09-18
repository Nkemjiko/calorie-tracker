"use client"

import { Droplets, Minus, Plus, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

type GoalsCardProps = {
  calorieGoal: number
  onCalorieGoalChange: (value: number) => void
  water: number
  waterGoal: number
  onWaterChange: (value: number) => void
}

export function GoalsCard({
  calorieGoal,
  onCalorieGoalChange,
  water,
  waterGoal,
  onWaterChange,
}: GoalsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
            <Target className="size-4" />
          </span>
          Daily goals
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Calorie target</span>
            <span className="text-sm font-semibold tabular-nums text-brand-green">
              {calorieGoal.toLocaleString()} kcal
            </span>
          </div>
          <Slider
            value={calorieGoal}
            min={1200}
            max={3500}
            step={50}
            onValueChange={(value) => onCalorieGoalChange(value as number)}
            className="[&_[data-slot=slider-range]]:bg-brand-green [&_[data-slot=slider-thumb]]:border-brand-green"
            aria-label="Daily calorie target"
          />
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>1,200</span>
            <span>3,500</span>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Droplets className="size-4 text-brand-orange" />
              Water intake
            </span>
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {water}
              <span className="text-muted-foreground"> / {waterGoal} cups</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: waterGoal }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-8 flex-1 rounded-md transition-colors",
                  i < water ? "bg-brand-orange" : "bg-brand-orange-soft"
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Remove a cup of water"
              onClick={() => onWaterChange(Math.max(0, water - 1))}
              disabled={water <= 0}
              className="size-10 shrink-0"
            >
              <Minus />
            </Button>
            <Button
              type="button"
              onClick={() => onWaterChange(Math.min(waterGoal, water + 1))}
              disabled={water >= waterGoal}
              className="h-10 flex-1 bg-brand-orange text-brand-orange-foreground hover:bg-brand-orange/90"
            >
              <Plus data-icon="inline-start" />
              Add a cup
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
