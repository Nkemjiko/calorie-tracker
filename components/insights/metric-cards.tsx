import { Flame, Timer, Zap, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

export type Metric = {
  label: string
  value: string
  delta: string
  trend: "up" | "down"
  icon: "calories" | "fasting" | "streak" | "weight"
}

const ICONS = {
  calories: Flame,
  fasting: Timer,
  streak: Zap,
  weight: TrendingDown,
} as const

export function MetricCards({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric) => {
        const Icon = ICONS[metric.icon]
        const positive = metric.trend === "up"
        return (
          <div
            key={metric.label}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                <Icon className="size-4.5" />
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  positive
                    ? "bg-brand-green/10 text-brand-green"
                    : "bg-brand-orange/10 text-brand-orange",
                )}
              >
                {metric.delta}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {metric.value}
              </span>
              <span className="text-xs text-muted-foreground">{metric.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
