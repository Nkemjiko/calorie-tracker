/*
# Add Pro tier columns to profiles

1. Overview
   Adds three columns to the `profiles` table to support freemium
   feature gating. Users on the free tier are limited to 3 AI meal
   photo scans per day; Pro users get unlimited scans.

2. Modified Tables
   - profiles
     - is_pro (boolean, default false) — whether the user has a Pro subscription
     - ai_scans_today (integer, default 0) — number of AI scans used today
     - last_scan_date (date, default CURRENT_DATE) — the date for which ai_scans_today applies

3. Security
   - No new tables. RLS already enabled on profiles.
   - Existing update_own_profile policy covers the scan count increment.
   - No policy changes needed.
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_pro boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_scans_today integer NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_scan_date date DEFAULT CURRENT_DATE;
