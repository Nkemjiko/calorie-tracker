/*
# Initial schema for nutrition & fasting tracker

1. Overview
   This migration sets up the core database for a multi-user nutrition and
   intermittent-fasting tracking app. Each user has a profile, a shared food
   catalog, and per-user meal logs and fasting sessions. Row Level Security
   (RLS) is enabled on every table so users can only read and modify their
   own data, while the shared food catalog is readable by all authenticated
   users.

2. New Tables
   - profiles
     - id (uuid, primary key, references auth.users) — one row per user
     - daily_calorie_target (int, default 2000) — user's daily calorie goal
     - fasting_goal_hours (int, default 16) — user's daily fasting goal
     - weight_kg (float) — user's current weight
     - target_weight_kg (float) — user's target weight
     - created_at (timestamptz, default now())
   - foods
     - id (uuid, primary key) — unique food identifier
     - name (text) — food name
     - category (text) — food category
     - base_calories (int) — calories per single serving
     - serving_unit (text) — unit label, e.g. "wrap", "cooking spoon",
       "piece", "plate", "slice"
     - protein_g (float) — grams of protein per serving
     - carbs_g (float) — grams of carbs per serving
     - fat_g (float) — grams of fat per serving
     - is_verified (boolean, default true) — whether the entry is verified
   - meal_logs
     - id (uuid, primary key) — unique log entry identifier
     - user_id (uuid, references profiles.id) — owning user
     - food_id (uuid, references foods.id) — logged food
     - serving_qty (float) — number of servings consumed
     - total_calories (int) — computed calories for this log entry
     - logged_at (timestamptz, default now()) — when the meal was logged
   - fasting_sessions
     - id (uuid, primary key) — unique session identifier
     - user_id (uuid, references profiles.id) — owning user
     - target_hours (int) — intended fasting duration
     - start_time (timestamptz) — when the fast began
     - end_time (timestamptz, nullable) — when the fast ended (null = active)
     - status (text, 'active' or 'completed') — current session state

3. Security (RLS)
   - RLS enabled on all four tables.
   - profiles: each authenticated user can SELECT and UPDATE only their own
     profile row. INSERT is allowed so a user can create their own profile.
   - foods: readable by all authenticated users (shared catalog). No
     insert/update/delete from the client — catalog is managed server-side.
   - meal_logs: full CRUD scoped to the owning user via auth.uid().
   - fasting_sessions: full CRUD scoped to the owning user via auth.uid().
   - Owner columns (user_id) default to auth.uid() so inserts that omit the
     owner still satisfy the INSERT policy's WITH CHECK.

4. Important Notes
   1. This schema assumes a sign-in flow exists (policies are scoped to
      `authenticated`). The frontend anon-key client cannot read or write
      protected tables until a user is signed in.
   2. The `foods` table is a shared catalog: only SELECT is granted to
      authenticated users. Writes must come through a server-side path
      (service role key or edge function).
   3. All policies use auth.uid() (never current_user) for ownership checks.
   4. Foreign keys cascade on delete: removing a user removes their
      meal_logs and fasting_sessions; removing a food removes its meal_logs.
*/

-- Enable the pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_calorie_target int NOT NULL DEFAULT 2000,
  fasting_goal_hours int NOT NULL DEFAULT 16,
  weight_kg float,
  target_weight_kg float,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- foods (shared catalog)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS foods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  base_calories int NOT NULL,
  serving_unit text NOT NULL,
  protein_g float NOT NULL DEFAULT 0,
  carbs_g float NOT NULL DEFAULT 0,
  fat_g float NOT NULL DEFAULT 0,
  is_verified boolean NOT NULL DEFAULT true
);

ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_all_foods" ON foods;
CREATE POLICY "read_all_foods"
  ON foods FOR SELECT
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- meal_logs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meal_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  food_id uuid NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  serving_qty float NOT NULL,
  total_calories int NOT NULL,
  logged_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_meal_logs" ON meal_logs;
CREATE POLICY "select_own_meal_logs"
  ON meal_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_meal_logs" ON meal_logs;
CREATE POLICY "insert_own_meal_logs"
  ON meal_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_meal_logs" ON meal_logs;
CREATE POLICY "update_own_meal_logs"
  ON meal_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_meal_logs" ON meal_logs;
CREATE POLICY "delete_own_meal_logs"
  ON meal_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- fasting_sessions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fasting_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  target_hours int NOT NULL,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed'))
);

ALTER TABLE fasting_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_fasting_sessions" ON fasting_sessions;
CREATE POLICY "select_own_fasting_sessions"
  ON fasting_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_fasting_sessions" ON fasting_sessions;
CREATE POLICY "insert_own_fasting_sessions"
  ON fasting_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_fasting_sessions" ON fasting_sessions;
CREATE POLICY "update_own_fasting_sessions"
  ON fasting_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_fasting_sessions" ON fasting_sessions;
CREATE POLICY "delete_own_fasting_sessions"
  ON fasting_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Indexes for common query patterns
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS meal_logs_user_id_idx ON meal_logs(user_id);
CREATE INDEX IF NOT EXISTS meal_logs_logged_at_idx ON meal_logs(logged_at);
CREATE INDEX IF NOT EXISTS fasting_sessions_user_id_idx ON fasting_sessions(user_id);
CREATE INDEX IF NOT EXISTS fasting_sessions_status_idx ON fasting_sessions(status);