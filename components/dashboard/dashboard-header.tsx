"use client"

import { useState } from "react"
import { Bell, Flame } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AuthModal } from "@/components/auth/auth-modal"
import { useAuth } from "@/components/auth/auth-provider"

type DashboardHeaderProps = {
  greeting: string
  dateLabel: string
  streak: number
}

export function DashboardHeader({ greeting, dateLabel, streak }: DashboardHeaderProps) {
  const { user, loading } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)

  const displayName = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? null
  const firstName = displayName ? displayName.split(" ")[0] : null
  const avatarUrl = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? null
  const email = user?.email ?? null

  const initials = displayName
    ? displayName
        .split(" ")
        .map((part: string) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : email
      ? email[0].toUpperCase()
      : "GU"

  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {loading ? (
          <div className="size-12 rounded-full bg-muted animate-pulse" />
        ) : user ? (
          <Avatar className="size-12 border-2 border-brand-green/20">
            <AvatarImage src={avatarUrl ?? undefined} alt={firstName ?? "User"} />
            <AvatarFallback className="bg-brand-green/10 text-brand-green font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        ) : (
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="flex size-12 items-center justify-center rounded-full border-2 border-brand-green/20 bg-brand-green/10 text-brand-green transition-colors hover:bg-brand-green/20"
            aria-label="Sign in"
          >
            <span className="text-xs font-semibold">Sign In</span>
          </button>
        )}
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground">{dateLabel}</span>
          <h1 className="text-lg font-semibold leading-tight text-foreground">
            {greeting}{firstName ? `, ${firstName}` : ""}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge
          variant="secondary"
          className="gap-1 bg-brand-orange-soft text-brand-orange border-transparent"
        >
          <Flame className="size-3.5" />
          {streak} day{streak === 1 ? "" : "s"}
        </Badge>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent"
        >
          <Bell className="size-5" />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-brand-orange" />
        </button>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  )
}
