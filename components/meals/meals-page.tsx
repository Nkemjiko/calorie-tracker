"use client"

import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import {
  NIGERIAN_FOODS,
  FOOD_CATEGORIES,
  type FoodItem,
  type FoodCategory,
  type MealTime,
} from "@/lib/foods"
import { Input } from "@/components/ui/input"
import { BottomNav } from "@/components/dashboard/bottom-nav"
import { FoodCard } from "@/components/meals/food-card"
import { PortionDialog } from "@/components/meals/portion-dialog"
import { ActivePlateBar, type PlateItem } from "@/components/meals/active-plate-bar"
import { cn } from "@/lib/utils"

export function MealsPage() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<FoodCategory>("All")
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [plate, setPlate] = useState<PlateItem[]>([])

  const filteredFoods = useMemo(() => {
    return NIGERIAN_FOODS.filter((food) => {
      const matchesCategory = category === "All" || food.category === category
      const matchesQuery = food.name.toLowerCase().includes(query.trim().toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [query, category])

  const queuedCountByFood = useMemo(() => {
    return plate.reduce<Record<string, number>>((acc, item) => {
      acc[item.foodId] = (acc[item.foodId] ?? 0) + 1
      return acc
    }, {})
  }, [plate])

  function handleAdd(food: FoodItem) {
    setSelectedFood(food)
    setDialogOpen(true)
  }

  function handleConfirmPortion(food: FoodItem, portions: number, meal: MealTime) {
    setPlate((prev) => [
      ...prev,
      {
        key: `${food.id}-${Date.now()}`,
        foodId: food.id,
        name: food.name,
        portions,
        unit: food.unit,
        calories: Math.round(food.calories * portions),
        meal,
      },
    ])
  }

  function handleRemove(key: string) {
    setPlate((prev) => prev.filter((item) => item.key !== key))
  }

  function handleConfirmLog() {
    setPlate([])
  }

  return (
    <div className="flex min-h-dvh flex-col bg-secondary/40">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {/* Header + search */}
        <header className="sticky top-0 z-10 flex flex-col gap-3 bg-secondary/40 px-4 pb-3 pt-6 backdrop-blur">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Meals</h1>
            <p className="text-sm text-muted-foreground">Log your Nigerian favourites</p>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dishes..."
              className="h-11 rounded-full border-border bg-card pl-9 pr-9"
              aria-label="Search dishes"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FOOD_CATEGORIES.map((cat) => {
              const isActive = category === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "border-brand-green bg-brand-green text-white"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </header>

        {/* Food catalog */}
        <main className="flex-1 px-4 pb-40 pt-1">
          {filteredFoods.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredFoods.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  queuedCount={queuedCountByFood[food.id] ?? 0}
                  onAdd={handleAdd}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <p className="text-sm font-medium text-foreground">No dishes found</p>
              <p className="text-xs text-muted-foreground">Try a different search or filter.</p>
            </div>
          )}
        </main>
      </div>

      <ActivePlateBar items={plate} onRemove={handleRemove} onConfirm={handleConfirmLog} />

      <PortionDialog
        food={selectedFood}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={handleConfirmPortion}
      />

      <BottomNav />
    </div>
  )
}
