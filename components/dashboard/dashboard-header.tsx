import { Bell, Flame } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

type DashboardHeaderProps = {
  greeting: string
  dateLabel: string
  streak: number
}

export function DashboardHeader({ greeting, dateLabel, streak }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Avatar className="size-12 border-2 border-brand-green/20">
          <AvatarImage src="/user-avatar.png" alt="Adaeze" />
          <AvatarFallback className="bg-brand-green/10 text-brand-green font-semibold">
            AD
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground">{dateLabel}</span>
          <h1 className="text-lg font-semibold leading-tight text-foreground">
            {greeting}, Adaeze
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
    </header>
  )
}
