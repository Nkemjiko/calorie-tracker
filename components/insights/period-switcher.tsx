"use client"

import { cn } from "@/lib/utils"

export type InsightPeriod = "weekly" | "monthly" | "all"

const PERIODS: { id: InsightPeriod; label: string }[] = [
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "all", label: "All Time" },
]

export function PeriodSwitcher({
  active,
  onSelect,
}: {
  active: InsightPeriod
  onSelect: (id: InsightPeriod) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Analytics period"
      className="flex items-center gap-1 rounded-full border border-border bg-card p-1"
    >
      {PERIODS.map((period) => {
        const isActive = period.id === active
        return (
          <button
            key={period.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(period.id)}
            className={cn(
              "flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-brand-green text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {period.label}
          </button>
        )
      })}
    </div>
  )
}
