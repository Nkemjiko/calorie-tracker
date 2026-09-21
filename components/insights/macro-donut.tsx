"use client"

import { useMemo } from "react"
import { Cell, Label, Pie, PieChart } from "recharts"
import { Lock } from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export type MacroSlice = {
  macro: string
  value: number
  color: string
}

const chartConfig = {
  value: { label: "Ratio" },
  Carbs: { label: "Carbs", color: "var(--brand-green)" },
  Protein: { label: "Protein", color: "var(--brand-orange)" },
  Fat: { label: "Fat", color: "var(--muted-foreground)" },
} satisfies ChartConfig

export function MacroDonut({ data, isPro = false }: { data: MacroSlice[]; isPro?: boolean }) {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data])

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-base font-semibold text-foreground">Macro Distribution</h2>
        <p className="text-xs text-muted-foreground">Average intake ratio</p>
      </div>

      <div className="relative flex items-center gap-4">
        <div className={isPro ? "" : "pointer-events-none select-none blur-sm"}>
          <ChartContainer config={chartConfig} className="aspect-square h-[150px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="macro"
                innerRadius={48}
                outerRadius={68}
                strokeWidth={4}
                stroke="var(--card)"
                isAnimationActive={false}
              >
                {data.map((slice) => (
                  <Cell key={slice.macro} fill={slice.color} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !("cx" in viewBox)) return null
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) - 4}
                          className="fill-foreground text-lg font-bold"
                        >
                          {total}g
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 14}
                          className="fill-muted-foreground text-[11px]"
                        >
                          avg / day
                        </tspan>
                      </text>
                    )
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          <ul className="flex flex-1 flex-col gap-3">
            {data.map((slice) => {
              const pct = total > 0 ? Math.round((slice.value / total) * 100) : 0
              return (
                <li key={slice.macro} className="flex items-center gap-2.5">
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: slice.color }}
                    aria-hidden
                  />
                  <span className="flex-1 text-sm text-foreground">{slice.macro}</span>
                  <span className="text-sm font-semibold text-foreground">{pct}%</span>
                </li>
              )
            })}
          </ul>
        </div>

        {!isPro && (
          <div className="absolute inset-0 flex items-center justify-center">
            <a
              href="/pro"
              className="flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background shadow-lg"
            >
              <Lock className="size-3" />
              Unlock Macros with Pro
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
