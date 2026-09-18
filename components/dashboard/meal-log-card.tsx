"use client"

import { useState } from "react"
import { Plus, Trash2, Utensils } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  NIGERIAN_FOODS,
  MEAL_TIMES,
  type MealTime,
} from "@/lib/foods"
import type { LoggedMeal } from "@/components/dashboard/dashboard"

type MealLogCardProps = {
  meals: LoggedMeal[]
  onAdd: (foodId: string, mealTime: MealTime) => void
  onRemove: (key: string) => void
}

export function MealLogCard({ meals, onAdd, onRemove }: MealLogCardProps) {
  const [foodId, setFoodId] = useState<string>("")
  const [mealTime, setMealTime] = useState<MealTime>("Breakfast")

  const handleAdd = () => {
    if (!foodId) return
    onAdd(foodId, mealTime)
    setFoodId("")
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
            <Utensils className="size-4" />
          </span>
          Today&apos;s meals
        </CardTitle>
        <Badge variant="secondary" className="tabular-nums">
          {meals.length} logged
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={foodId} onValueChange={(v) => setFoodId(v as string)}>
            <SelectTrigger className="w-full flex-1" aria-label="Choose a dish">
              <SelectValue placeholder="Choose a Nigerian dish" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Nigerian dishes</SelectLabel>
                {NIGERIAN_FOODS.map((food) => (
                  <SelectItem key={food.id} value={food.id}>
                    {food.name} · {food.calories} kcal
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={mealTime} onValueChange={(v) => setMealTime(v as MealTime)}>
            <SelectTrigger className="w-full sm:w-[140px]" aria-label="Meal time">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {MEAL_TIMES.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Button
            type="button"
            onClick={handleAdd}
            disabled={!foodId}
            className="bg-brand-orange text-brand-orange-foreground hover:bg-brand-orange/90 sm:w-auto"
          >
            <Plus data-icon="inline-start" />
            Add
          </Button>
        </div>

        {meals.length === 0 ? (
          <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-border py-8 text-center">
            <Utensils className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No meals logged yet</p>
            <p className="text-xs text-muted-foreground">
              Add your first Nigerian dish to start tracking.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {meals.map((meal) => (
              <li
                key={meal.key}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-sm font-semibold text-brand-green">
                  {meal.food.calories}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {meal.food.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {meal.mealTime} · {meal.food.portion} · {meal.food.calories} kcal
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${meal.food.name}`}
                  onClick={() => onRemove(meal.key)}
                  className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
