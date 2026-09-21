export type FoodRow = {
  id: string;
  name: string;
  category: string;
  base_calories: number;
  serving_unit: string;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  is_verified: boolean;
};

export type MealLogRow = {
  id: string;
  user_id: string;
  food_id: string;
  serving_qty: number;
  total_calories: number;
  logged_at: string;
};

export type MealLogWithFood = MealLogRow & {
  food: FoodRow;
};

export type FastingSessionRow = {
  id: string;
  user_id: string;
  target_hours: number;
  start_time: string;
  end_time: string | null;
  status: "active" | "completed";
};

export type ProfileRow = {
  id: string;
  daily_calorie_target: number;
  fasting_goal_hours: number;
  weight_kg: number | null;
  target_weight_kg: number | null;
  created_at: string;
};
