"use client"

import { Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProgressRing } from "@/components/dashboard/progress-ring"
import { cn } from "@/lib/utils"

type FastTimerRingProps = {
  running: boolean
  elapsedSeconds: number
  targetSeconds: number
  startLabel: string
  endLabel: string
  onToggle: () => void
  disabled?: boolean
}

function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":")
}

export function FastTimerRing({
  running,
  elapsedSeconds,
  targetSeconds,
  startLabel,
  endLabel,
  onToggle,
  disabled,
}: FastTimerRingProps) {
  const percent = (elapsedSeconds / targetSeconds) * 100
  const complete = elapsedSeconds >= targetSeconds
  const remaining = Math.max(0, targetSeconds - elapsedSeconds)

  return (
    <div className="flex flex-col items-center gap-6">
      <ProgressRing
        value={percent}
        size={272}
        strokeWidth={20}
        color={complete ? "var(--brand-orange)" : "var(--brand-green)"}
      >
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {running ? (complete ? "Goal reached" : "Remaining") : "Ready to fast"}
        </span>
        <span className="mt-1 font-mono text-5xl font-semibold tabular-nums text-foreground">
          {formatDuration(running ? remaining : targetSeconds)}
        </span>
        <span className="mt-2 text-sm text-muted-foreground">
          {running ? `${formatDuration(elapsedSeconds)} elapsed` : "Tap start when you're ready"}
        </span>
        {running && (
          <span
            className={cn(
              "mt-2 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
              complete
                ? "bg-brand-orange-soft text-brand-orange"
                : "bg-brand-green/10 text-brand-green",
            )}
          >
            {Math.min(100, Math.round(percent))}% complete
          </span>
        )}
      </ProgressRing>

      <div className="grid w-full grid-cols-2 gap-3">
        <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-3">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Started
          </span>
          <span className="text-base font-semibold tabular-nums text-foreground">
            {running ? startLabel : "--:--"}
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-card px-3 py-3">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Goal ends
          </span>
          <span className="text-base font-semibold tabular-nums text-foreground">
            {running ? endLabel : "--:--"}
          </span>
        </div>
      </div>

      <Button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          "h-12 w-full text-base font-semibold",
          running
            ? "bg-brand-orange text-brand-orange-foreground hover:bg-brand-orange/90"
            : "bg-brand-green text-primary-foreground hover:bg-brand-green/90",
        )}
      >
        {running ? (
          <>
            <Square data-icon="inline-start" />
            End Fast
          </>
        ) : (
          <>
            <Play data-icon="inline-start" />
            Start Fast
          </>
        )}
      </Button>
    </div>
  )
}
