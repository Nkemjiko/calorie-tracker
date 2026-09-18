"use client"

import { useEffect, useMemo, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { FastingCard } from "@/components/dashboard/fasting-card"
import { CalorieCard } from "@/components/dashboard/calorie-card"
import { GoalsCard } from "@/components/dashboard/goals-card"
import { MealLogCard } from "@/components/dashboard/meal-log-card"
import { BottomNav } from "@/components/dashboard/bottom-nav"
import {
  FASTING_PROTOCOLS,
  NIGERIAN_FOODS,
  type FoodItem,
  type MealTime,
} from "@/lib/foods"

export type LoggedMeal = {
  key: string
  food: FoodItem
  mealTime: MealTime
}

const WATER_GOAL = 8

function findFood(id: string) {
  return NIGERIAN_FOODS.find((f) => f.id === id)
}

function seedMeal(foodId: string, mealTime: MealTime): LoggedMeal {
  const food = findFood(foodId) as FoodItem
  return { key: `${foodId}-${mealTime}-seed`, food, mealTime }
}

export function Dashboard() {
  // Calorie + meal state
  const [meals, setMeals] = useState<LoggedMeal[]>(() => [
    seedMeal("akara", "Breakfast"),
    seedMeal("jollof", "Lunch"),
  ])
  const [calorieGoal, setCalorieGoal] = useState(2200)
  const [water, setWater] = useState(3)

  // Fasting state
  const [protocolId, setProtocolId] = useState("16-8")
  const [running, setRunning] = useState(false)
  const [baseElapsed, setBaseElapsed] = useState(6 * 3600 + 12 * 60) // resume mid-fast
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState<number>(Date.now())

  // Header date (set after mount to avoid hydration mismatch)
  const [dateLabel, setDateLabel] = useState("")
  const [greeting, setGreeting] = useState("Good day")

  useEffect(() => {
    const d = new Date()
    setDateLabel(
      d.toLocaleDateString("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    )
    const h = d.getHours()
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening")
  }, [])

  // Tick every second while fasting
  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [running])

  const elapsedSeconds =
    running && startedAt !== null
      ? baseElapsed + Math.floor((now - startedAt) / 1000)
      : baseElapsed

  const protocol =
    FASTING_PROTOCOLS.find((p) => p.id === protocolId) ?? FASTING_PROTOCOLS[1]

  const totals = useMemo(() => {
    return meals.reduce(
      (acc, m) => {
        acc.calories += m.food.calories
        acc.carbs += m.food.carbs
        acc.protein += m.food.protein
        acc.fat += m.food.fat
        return acc
      },
      { calories: 0, carbs: 0, protein: 0, fat: 0 }
    )
  }, [meals])

  const handleToggleFast = () => {
    if (running) {
      // pause: bank the elapsed time
      setBaseElapsed(elapsedSeconds)
      setStartedAt(null)
      setRunning(false)
    } else {
      setStartedAt(Date.now())
      setNow(Date.now())
      setRunning(true)
    }
  }

  const handleResetFast = () => {
    setRunning(false)
    setStartedAt(null)
    setBaseElapsed(0)
  }

  const handleAddMeal = (foodId: string, mealTime: MealTime) => {
    const food = findFood(foodId)
    if (!food) return
    setMeals((prev) => [
      { key: `${foodId}-${mealTime}-${Date.now()}`, food, mealTime },
      ...prev,
    ])
  }

  const handleRemoveMeal = (key: string) => {
    setMeals((prev) => prev.filter((m) => m.key !== key))
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-5">
        <DashboardHeader greeting={greeting} dateLabel={dateLabel} streak={12} />

        <FastingCard
          protocol={protocol}
          protocolId={protocolId}
          onProtocolChange={setProtocolId}
          running={running}
          onToggle={handleToggleFast}
          onReset={handleResetFast}
          elapsedSeconds={elapsedSeconds}
        />

        <CalorieCard
          consumed={totals.calories}
          goal={calorieGoal}
          macros={{ carbs: totals.carbs, protein: totals.protein, fat: totals.fat }}
        />

        <GoalsCard
          calorieGoal={calorieGoal}
          onCalorieGoalChange={setCalorieGoal}
          water={water}
          waterGoal={WATER_GOAL}
          onWaterChange={setWater}
        />

        <MealLogCard meals={meals} onAdd={handleAddMeal} onRemove={handleRemoveMeal} />
      </main>

      <BottomNav />
    </div>
  )
}
