"use client"

import { useState } from "react"
import { Home, Timer, TrendingUp, User, Utensils } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "meals", label: "Meals", icon: Utensils },
  { id: "fast", label: "Fast", icon: Timer },
  { id: "insights", label: "Insights", icon: TrendingUp },
  { id: "profile", label: "Profile", icon: User },
] as const

export function BottomNav() {
  const [active, setActive] = useState<string>("home")

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-20 mt-2 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <li key={item.id} className="flex-1">
              <button
                type="button"
                onClick={() => setActive(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex w-full flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors",
                  isActive
                    ? "text-brand-green"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full transition-colors",
                    isActive && "bg-brand-green/10"
                  )}
                >
                  <Icon className="size-5" />
                </span>
                {item.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
