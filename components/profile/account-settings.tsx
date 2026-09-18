import { Bell, ChevronRight, Download, HeartPulse, LogOut, Timer } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type SettingsItem = {
  id: string
  label: string
  hint?: string
  icon: LucideIcon
}

const ITEMS: SettingsItem[] = [
  { id: "notifications", label: "Notification Reminders", hint: "On", icon: Bell },
  { id: "fast-reminders", label: "Fast Reminders", hint: "16:8", icon: Timer },
  { id: "sync-health", label: "Sync Health Apps", hint: "Apple Health", icon: HeartPulse },
  { id: "export", label: "Export Data", icon: Download },
]

export function AccountSettings() {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="px-1 text-sm font-semibold text-foreground">Account &amp; settings</h3>

      <div className="flex flex-col rounded-2xl border border-border bg-card">
        {ITEMS.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/60",
                index !== ITEMS.length - 1 && "border-b border-border",
              )}
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-secondary text-foreground">
                <Icon className="size-4.5" />
              </span>
              <span className="flex-1 text-sm font-medium text-foreground">{item.label}</span>
              {item.hint ? (
                <span className="text-xs text-muted-foreground">{item.hint}</span>
              ) : null}
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className="flex items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
      >
        <LogOut className="size-4" />
        Log Out
      </button>
    </section>
  )
}
