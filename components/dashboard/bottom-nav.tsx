"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Timer, TrendingUp, User, Utensils } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "meals", label: "Meals", icon: Utensils, href: "/meals" },
  { id: "fast", label: "Fast", icon: Timer, href: "/fast" },
  { id: "insights", label: "Insights", icon: TrendingUp, href: "/insights" },
  { id: "profile", label: "Profile", icon: User, href: "/" },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-20 mt-2 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive =
            item.id === "home"
              ? pathname === "/"
              : item.href !== "/" && pathname === item.href
          return (
            <li key={item.id} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex w-full flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors",
                  isActive ? "text-brand-green" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full transition-colors",
                    isActive && "bg-brand-green/10",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
