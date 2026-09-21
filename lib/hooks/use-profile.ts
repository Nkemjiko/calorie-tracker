"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ProfileRow } from "@/lib/types";

export function useProfile() {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (!data) {
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({ id: userData.user.id })
        .select("*")
        .single();
      setProfile((newProfile as ProfileRow) ?? null);
    } else {
      setProfile(data as ProfileRow);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(
    async (
      updates: Partial<
        Pick<
          ProfileRow,
          "daily_calorie_target" | "fasting_goal_hours" | "weight_kg" | "target_weight_kg"
        >
      >
    ) => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return { error: "Not authenticated" as const };

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userData.user.id)
        .select("*")
        .single();

      if (error) return { error: error.message as const };
      setProfile(data as ProfileRow);
      return { data: data as ProfileRow };
    },
    []
  );

  return { profile, loading, updateProfile, refetch: fetchProfile };
}
