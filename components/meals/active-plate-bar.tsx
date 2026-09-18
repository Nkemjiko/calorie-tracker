"use client"

import { useState } from "react"
import { ChevronUp, Trash2, Check } from "lucide-react"
import type { MealTime } from "@/lib/foods"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

export type PlateItem = {
  key: string
  foodId: string
  name: string
  portions: number
  unit: string
  calories: number
  meal: MealTime
}

type ActivePlateBarProps = {
  items: PlateItem[]
  onRemove: (key: string) => void
  onConfirm: () => void
}

export function ActivePlateBar({ items, onRemove, onConfirm }: ActivePlateBarProps) {
  const [open, setOpen] = useState(false)

  if (items.length === 0) return null

  const totalCalories = items.reduce((sum, item) => sum + item.calories, 0)
  const itemLabel = `${items.length} item${items.length !== 1 ? "s" : ""}`

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-16 z-30 px-4">
      <div className="pointer-events-auto mx-auto max-w-md">
        <div className="flex items-center gap-2 rounded-2xl border border-brand-green/20 bg-brand-green p-2 pl-4 shadow-lg shadow-brand-green/20">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={<button type="button" className="flex flex-1 items-center gap-3 text-left text-white" />}
            >
              <span className="flex flex-col">
                <span className="text-sm font-semibold leading-tight">{itemLabel} queued</span>
                <span className="text-xs text-white/80">{totalCalories} kcal total</span>
              </span>
              <ChevronUp className="size-4 text-white/80" />
            </SheetTrigger>
            <SheetContent side="bottom" className="mx-auto max-w-md rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>Active plate</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 px-4 pb-4">
                <ul className="flex max-h-[45vh] flex-col gap-2 overflow-y-auto">
                  {items.map((item) => (
                    <li
                      key={item.key}
                      className="flex items-center justify-between gap-3 rounded-xl bg-secondary/60 p-3"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{item.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.portions} {item.unit}
                          {item.portions !== 1 ? "s" : ""} · {item.meal}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-semibold text-brand-green">
                          {item.calories} kcal
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive"
                          onClick={() => onRemove(item.key)}
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground tabular-nums">
                    {totalCalories} kcal
                  </span>
                </div>
                <Button
                  type="button"
                  className="w-full bg-brand-orange text-white hover:bg-brand-orange/90"
                  onClick={() => {
                    onConfirm()
                    setOpen(false)
                  }}
                >
                  <Check data-icon="inline-start" />
                  Confirm Log
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <Button
            type="button"
            className="shrink-0 bg-brand-orange text-white hover:bg-brand-orange/90"
            onClick={onConfirm}
          >
            <Check data-icon="inline-start" />
            Confirm Log
          </Button>
        </div>
      </div>
    </div>
  )
}
