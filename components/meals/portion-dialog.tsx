"use client"

import { useState, useEffect } from "react"
import { Minus, Plus } from "lucide-react"
import type { MealTime } from "@/lib/foods"
import { MEAL_TIMES } from "@/lib/foods"
import type { FoodRow } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type PortionDialogProps = {
  food: FoodRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (food: FoodRow, portions: number, meal: MealTime) => void
}

export function PortionDialog({ food, open, onOpenChange, onConfirm }: PortionDialogProps) {
  const [portions, setPortions] = useState(1)
  const [meal, setMeal] = useState<MealTime>("Lunch")

  useEffect(() => {
    if (open) {
      setPortions(1)
      setMeal("Lunch")
    }
  }, [open, food?.id])

  if (!food) return null

  const totalCalories = Math.round(food.base_calories * portions)
  const totalProtein = Math.round(food.protein_g * portions)
  const totalCarbs = Math.round(food.carbs_g * portions)
  const totalFat = Math.round(food.fat_g * portions)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>{food.name}</DialogTitle>
          <DialogDescription>
            {food.base_calories} kcal per {food.serving_unit} · adjust your portion
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">
          <div className="flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-10 rounded-full"
              onClick={() => setPortions((p) => Math.max(0.5, Math.round((p - 0.5) * 10) / 10))}
              aria-label="Decrease portion"
            >
              <Minus />
            </Button>
            <div className="flex min-w-24 flex-col items-center">
              <span className="text-3xl font-bold tabular-nums text-foreground">{portions}</span>
              <span className="text-xs text-muted-foreground">
                {food.serving_unit}
                {portions !== 1 ? "s" : ""}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-10 rounded-full"
              onClick={() => setPortions((p) => Math.min(5, Math.round((p + 0.5) * 10) / 10))}
              aria-label="Increase portion"
            >
              <Plus />
            </Button>
          </div>

          <Slider
            value={[portions]}
            min={0.5}
            max={5}
            step={0.5}
            onValueChange={(v) => setPortions(v[0])}
            aria-label="Portion size"
          />

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Meal</span>
            <Select value={meal} onValueChange={(v) => setMeal(v as MealTime)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {MEAL_TIMES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 gap-2 rounded-xl bg-secondary/60 p-3 text-center">
            <div className="flex flex-col">
              <span className="text-base font-bold text-brand-green tabular-nums">{totalCalories}</span>
              <span className="text-[10px] text-muted-foreground">kcal</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-foreground tabular-nums">{totalProtein}g</span>
              <span className="text-[10px] text-muted-foreground">Protein</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-foreground tabular-nums">{totalCarbs}g</span>
              <span className="text-[10px] text-muted-foreground">Carbs</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-foreground tabular-nums">{totalFat}g</span>
              <span className="text-[10px] text-muted-foreground">Fat</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            className="w-full bg-brand-orange text-white hover:bg-brand-orange/90"
            onClick={() => {
              onConfirm(food, portions, meal)
              onOpenChange(false)
            }}
          >
            Add to plate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
