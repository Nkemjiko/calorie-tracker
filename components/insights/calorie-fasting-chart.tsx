"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export type CalorieFastingPoint = {
  label: string
  calories: number
  fastingHours: number
}

const CALORIE_TARGET = 2000

const chartConfig = {
  calories: { label: "Calories", color: "var(--brand-green)" },
  fastingHours: { label: "Fasting (hrs)", color: "var(--brand-orange)" },
} satisfies ChartConfig

export function CalorieFastingChart({ data }: { data: CalorieFastingPoint[] }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold text-foreground">Calories & Fasting</h2>
          <p className="text-xs text-muted-foreground">Daily intake vs 2,000 kcal target</p>
        </div>
        <div className="flex flex-col gap-1.5 text-[11px]">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2.5 rounded-full bg-brand-green" aria-hidden />
            Calories
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-1 w-3 rounded-full bg-brand-orange" aria-hidden />
            Fasting hrs
          </span>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[220px] w-full">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={11}
          />
          <YAxis
            yAxisId="cal"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            width={44}
          />
          <YAxis yAxisId="hrs" orientation="right" hide domain={[0, 24]} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <ReferenceLine
            yAxisId="cal"
            y={CALORIE_TARGET}
            stroke="var(--muted-foreground)"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          <Bar
            yAxisId="cal"
            dataKey="calories"
            fill="var(--color-calories)"
            radius={[6, 6, 0, 0]}
            barSize={18}
            isAnimationActive={false}
          />
          <Line
            yAxisId="hrs"
            dataKey="fastingHours"
            type="monotone"
            stroke="var(--color-fastingHours)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "var(--color-fastingHours)" }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ChartContainer>
    </section>
  )
}
