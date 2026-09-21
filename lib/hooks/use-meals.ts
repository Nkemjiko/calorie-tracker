"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MealLogWithFood, FoodRow } from "@/lib/types";

function startOfTodayUTC() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ).toISOString();
}

export function useMeals() {
  const [meals, setMeals] = useState<MealLogWithFood[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchToday = useCallback(async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setMeals([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("meal_logs")
      .select("*, food(*)")
      .gte("logged_at", startOfTodayUTC())
      .order("logged_at", { ascending: false });

    if (error) {
      setMeals([]);
    } else {
      setMeals((data as MealLogWithFood[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  const addMeal = useCallback(
    async (food: FoodRow, servingQty: number) => {
      const supabase = createClient();
      const totalCalories = Math.round(food.base_calories * servingQty);
      const { data, error } = await supabase
        .from("meal_logs")
        .insert({
          food_id: food.id,
          serving_qty: servingQty,
          total_calories: totalCalories,
        })
        .select("*, food(*)")
        .single();

      if (error) return { error: error.message as const };
      setMeals((prev) => [data as MealLogWithFood, ...prev]);
      return { data: data as MealLogWithFood };
    },
    []
  );

  const deleteMeal = useCallback(async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("meal_logs").delete().eq("id", id);
    if (!error) {
      setMeals((prev) => prev.filter((m) => m.id !== id));
    }
    return { error: error?.message ?? null };
  }, []);

  const totals = meals.reduce(
    (acc, m) => {
      acc.calories += m.total_calories;
      acc.protein += (m.food?.protein_g ?? 0) * m.serving_qty;
      acc.carbs += (m.food?.carbs_g ?? 0) * m.serving_qty;
      acc.fat += (m.food?.fat_g ?? 0) * m.serving_qty;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return { meals, loading, addMeal, deleteMeal, totals, refetch: fetchToday };
}
