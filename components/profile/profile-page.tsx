"use client"

import { useState } from "react"
import { User } from "lucide-react"
import { BottomNav } from "@/components/dashboard/bottom-nav"
import { UserHeaderCard } from "@/components/profile/user-header-card"
import { GoalsTargets, type GoalMetric } from "@/components/profile/goals-targets"
import {
  DietaryPreferences,
  type DietaryPreference,
} from "@/components/profile/dietary-preferences"
import { AccountSettings } from "@/components/profile/account-settings"

const GOAL_METRICS: GoalMetric[] = [
  { id: "starting-weight", label: "Starting Weight", value: "84.0 kg", icon: "start" },
  { id: "target-weight", label: "Target Weight", value: "72.0 kg", icon: "target" },
  { id: "calorie-target", label: "Daily Calorie Target", value: "1,800 kcal", icon: "calories" },
  { id: "primary-goal", label: "Primary Goal", value: "Weight Loss", icon: "goal" },
]

const INITIAL_PREFERENCES: DietaryPreference[] = [
  { id: "low-carb", label: "Low Carb", description: "Prioritise low-carb meals", enabled: true },
  { id: "high-protein", label: "High Protein", description: "Emphasise protein-rich foods", enabled: true },
  { id: "halal", label: "Halal", description: "Only show halal-friendly options", enabled: true },
  { id: "vegetarian", label: "Vegetarian", description: "Exclude meat from suggestions", enabled: false },
  { id: "gluten-free", label: "Gluten Free", description: "Avoid gluten-containing foods", enabled: false },
]

export function ProfilePage() {
  const [preferences, setPreferences] = useState<DietaryPreference[]>(INITIAL_PREFERENCES)

  const togglePreference = (id: string) => {
    setPreferences((prev) =>
      prev.map((preference) =>
        preference.id === id ? { ...preference, enabled: !preference.enabled } : preference,
      ),
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-secondary/40">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="flex items-center gap-3 px-4 pb-2 pt-6">
          <span className="flex size-11 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
            <User className="size-5" />
          </span>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground">Manage your goals &amp; account</p>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-5 px-4 pb-8 pt-3">
          <UserHeaderCard
            name="Amara Okafor"
            email="amara.okafor@gmail.com"
            avatarSrc="/images/profile-avatar.png"
            statusLabel="16:8 Intermittent Faster"
          />
          <GoalsTargets metrics={GOAL_METRICS} />
          <DietaryPreferences preferences={preferences} onToggle={togglePreference} />
          <AccountSettings />
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
