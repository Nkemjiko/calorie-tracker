"use client"

import { Salad } from "lucide-react"
import { cn } from "@/lib/utils"

export type DietaryPreference = {
  id: string
  label: string
  description: string
  enabled: boolean
}

type DietaryPreferencesProps = {
  preferences: DietaryPreference[]
  onToggle: (id: string) => void
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        checked ? "bg-brand-green" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "inline-block size-5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  )
}

export function DietaryPreferences({ preferences, onToggle }: DietaryPreferencesProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <Salad className="size-4 text-brand-green" />
        <h3 className="text-sm font-semibold text-foreground">Dietary preferences</h3>
      </div>

      <div className="flex flex-col rounded-2xl border border-border bg-card">
        {preferences.map((preference, index) => (
          <div
            key={preference.id}
            className={cn(
              "flex items-center justify-between gap-4 px-4 py-3.5",
              index !== preferences.length - 1 && "border-b border-border",
            )}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">{preference.label}</span>
              <span className="text-xs text-muted-foreground">{preference.description}</span>
            </div>
            <Toggle
              checked={preference.enabled}
              onChange={() => onToggle(preference.id)}
              label={preference.label}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
