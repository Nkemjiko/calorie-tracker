"use client"

import { Plus } from "lucide-react"
import type { FoodRow } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type FoodCardProps = {
  food: FoodRow
  queuedCount: number
  onAdd: (food: FoodRow) => void
}

export function FoodCard({ food, queuedCount, onAdd }: FoodCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold leading-tight text-foreground">{food.name}</h3>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-brand-green">{food.base_calories} kcal</span> per {food.serving_unit}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAdd(food)}
            aria-label={`Add ${food.name}`}
            className={cn(
              "relative flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white shadow-sm transition-transform active:scale-90",
            )}
          >
            <Plus className="size-5" />
            {queuedCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-brand-green text-[10px] font-bold text-white ring-2 ring-card">
                {queuedCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="gap-1 font-normal">
            <span className="size-1.5 rounded-full bg-brand-green" />
            {food.protein_g}g Protein
          </Badge>
          <Badge variant="secondary" className="gap-1 font-normal">
            <span className="size-1.5 rounded-full bg-brand-orange" />
            {food.carbs_g}g Carbs
          </Badge>
          <Badge variant="secondary" className="gap-1 font-normal">
            <span className="size-1.5 rounded-full bg-amber-400" />
            {food.fat_g}g Fat
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
