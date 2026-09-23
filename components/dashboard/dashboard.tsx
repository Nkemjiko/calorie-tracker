"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { FastingCard } from "@/components/dashboard/fasting-card"
import { CalorieCard } from "@/components/dashboard/calorie-card"
import { GoalsCard } from "@/components/dashboard/goals-card"
import { MealLogCard } from "@/components/dashboard/meal-log-card"
import { BottomNav } from "@/components/dashboard/bottom-nav"
import { useAuth } from "@/components/auth/auth-provider"
import { AuthModal } from "@/components/auth/auth-modal"
import { useMeals } from "@/lib/hooks/use-meals"
import { useProfile } from "@/lib/hooks/use-profile"
import { useFasting } from "@/lib/hooks/use-fasting"
import { createClient } from "@/lib/supabase/client"
import type { FoodRow, MealLogWithFood } from "@/lib/types"
import type { MealTime } from "@/lib/foods"

export type LoggedMeal = {
  key: string
  food: FoodRow
  mealTime: MealTime
  logId?: string
}

const WATER_GOAL = 8

function inferMealTime(loggedAt: string): MealTime {
  const h = new Date(loggedAt).getHours()
  if (h < 11) return "Breakfast"
  if (h < 15) return "Lunch"
  if (h < 18) return "Snack"
  return "Dinner"
}

export function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const { meals: dbMeals, loading: mealsLoading, deleteMeal, refetch } = useMeals()
  const { profile, loading: profileLoading, updateProfile } = useProfile()
  const { activeSession, startFast, endFast } = useFasting()
  const [allFoods, setAllFoods] = useState<FoodRow[]>([])
  const [water, setWater] = useState(3)
  const [dateLabel, setDateLabel] = useState("")
  const [greeting, setGreeting] = useState("Good day")
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const d = new Date()
    setDateLabel(
      d.toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" })
    )
    const h = d.getHours()
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening")
  }, [])

  useEffect(() => {
    if (activeSession) {
      const timer = setInterval(() => setNow(Date.now()), 1000)
      return () => clearInterval(timer)
    }
  }, [activeSession])

  const elapsedSeconds = useMemo(() => {
    if (!activeSession) return 0
    return Math.floor((now - new Date(activeSession.start_time).getTime()) / 1000)
  }, [activeSession, now])

  const meals: LoggedMeal[] = useMemo(() => {
    return dbMeals.map((m: MealLogWithFood) => ({
      key: m.id,
      food: m.food,
      mealTime: inferMealTime(m.logged_at),
      logId: m.id,
    }))
  }, [dbMeals])

  const totals = useMemo(() => {
    return dbMeals.reduce(
      (acc, m) => {
        acc.calories += m.total_calories
        acc.carbs += (m.food?.carbs_g ?? 0) * m.serving_qty
        acc.protein += (m.food?.protein_g ?? 0) * m.serving_qty
        acc.fat += (m.food?.fat_g ?? 0) * m.serving_qty
        return acc
      },
      { calories: 0, carbs: 0, protein: 0, fat: 0 }
    )
  }, [dbMeals])

  const calorieGoal = profile?.daily_calorie_target ?? 2000

  const handleAddMeal = useCallback(async (foodId: string, mealTime: MealTime) => {
    const supabase = createClient()
    const food = allFoods.find((f) => f.id === foodId)
    if (!food) return
    const totalCalories = Math.round(food.base_calories)
    const { error } = await supabase.from("meal_logs").insert({
      food_id: foodId,
      serving_qty: 1,
      total_calories: totalCalories,
    })
    if (!error) {
      refetch()
    }
  }, [allFoods, refetch])

  const handleRemoveMeal = useCallback(async (key: string) => {
    await deleteMeal(key)
  }, [deleteMeal])

  const handleToggleFast = useCallback(async () => {
    if (activeSession) {
      await endFast()
    } else {
      await startFast(profile?.fasting_goal_hours ?? 16)
    }
  }, [activeSession, endFast, startFast, profile?.fasting_goal_hours])

  const showLoading = authLoading || mealsLoading || profileLoading

  if (showLoading) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="flex flex-col gap-2">
            <p className="text-2xl font-bold text-foreground">Welcome to NaijaFast</p>
            <p className="text-sm text-muted-foreground">
              Sign in to track your meals, fasting, and progress.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button
              size="lg"
              className="w-full bg-brand-green text-white hover:bg-brand-green/90"
              onClick={() => setAuthOpen(true)}
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => setAuthOpen(true)}
            >
              I already have an account
            </Button>
          </div>
        </div>
        <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      </>
    )
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-5">
        <DashboardHeader greeting={greeting} dateLabel={dateLabel} streak={0} />

        <FastingCard
          protocol={{
            id: "16-8",
            label: "16:8",
            description: "Most popular",
            fastingHours: activeSession?.target_hours ?? profile?.fasting_goal_hours ?? 16,
            eatingHours: 24 - (activeSession?.target_hours ?? profile?.fasting_goal_hours ?? 16),
          }}
          protocolId="16-8"
          onProtocolChange={() => {}}
          running={!!activeSession}
          onToggle={handleToggleFast}
          onReset={handleToggleFast}
          elapsedSeconds={elapsedSeconds}
        />

        <CalorieCard
          consumed={totals.calories}
          goal={calorieGoal}
          macros={{ carbs: totals.carbs, protein: totals.protein, fat: totals.fat }}
        />

        <GoalsCard
          calorieGoal={calorieGoal}
          onCalorieGoalChange={(v) => updateProfile({ daily_calorie_target: v })}
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
