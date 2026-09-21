/*
# Add AI scan quota tracking to profiles

1. Overview
   Adds two columns to the `profiles` table to track daily AI meal
   photo scan usage. Each user is limited to 5 free scans per day.
   The scan_date column stores the date of the current scan window
   (YYYY-MM-DD), and scan_count stores how many scans have been used
   on that date. When the date changes, scan_count resets to 0.

2. Modified Tables
   - profiles
     - scan_count (int, default 0) — number of AI scans used today
     - scan_date (date, nullable) — the date for which scan_count applies

3. Security
   - No new tables. RLS already enabled on profiles.
   - The existing update_own_profile policy already allows users to
     update their own row, which covers the scan_count increment.
   - No policy changes needed.
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS scan_count int NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS scan_date date;
