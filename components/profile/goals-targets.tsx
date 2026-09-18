import { Flame, Pencil, Scale, Target, Trophy } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type GoalMetric = {
  id: string
  label: string
  value: string
  icon: "start" | "target" | "calories" | "goal"
}

const ICONS: Record<GoalMetric["icon"], LucideIcon> = {
  start: Scale,
  target: Target,
  calories: Flame,
  goal: Trophy,
}

export function GoalsTargets({ metrics }: { metrics: GoalMetric[] }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-foreground">Goals &amp; targets</h3>
        <button
          type="button"
          className="text-xs font-medium text-brand-green transition-colors hover:text-brand-green/80"
        >
          Edit all
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => {
          const Icon = ICONS[metric.icon]
          return (
            <button
              key={metric.id}
              type="button"
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-brand-green/40"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
                  <Icon className="size-4.5" />
                </span>
                <Pencil className="size-3.5 text-muted-foreground transition-colors group-hover:text-brand-green" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-lg font-bold tracking-tight text-foreground">
                  {metric.value}
                </span>
                <span className="text-xs text-muted-foreground">{metric.label}</span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
