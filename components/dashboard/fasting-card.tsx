"use client"

import { Pause, Play, RotateCcw, Timer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProgressRing } from "@/components/dashboard/progress-ring"
import { FASTING_PROTOCOLS, type FastingProtocol } from "@/lib/foods"
import { cn } from "@/lib/utils"

type FastingCardProps = {
  protocol: FastingProtocol
  protocolId: string
  onProtocolChange: (id: string) => void
  running: boolean
  onToggle: () => void
  onReset: () => void
  elapsedSeconds: number
}

function formatDuration(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":")
}

export function FastingCard({
  protocol,
  protocolId,
  onProtocolChange,
  running,
  onToggle,
  onReset,
  elapsedSeconds,
}: FastingCardProps) {
  const targetSeconds = protocol.fastingHours * 3600
  const percent = (elapsedSeconds / targetSeconds) * 100
  const complete = elapsedSeconds >= targetSeconds
  const remaining = Math.max(0, targetSeconds - elapsedSeconds)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex size-8 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
            <Timer className="size-4" />
          </span>
          Fasting
        </CardTitle>
        <Select value={protocolId} onValueChange={(v) => onProtocolChange(v as string)}>
          <SelectTrigger size="sm" className="w-[132px]" aria-label="Fasting protocol">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {FASTING_PROTOCOLS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="flex flex-col items-center gap-5">
        <ProgressRing
          value={percent}
          size={216}
          strokeWidth={16}
          color={complete ? "var(--brand-orange)" : "var(--brand-green)"}
        >
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {running ? "Fasting" : complete ? "Goal reached" : "Ready to fast"}
          </span>
          <span className="mt-1 font-mono text-4xl font-semibold tabular-nums text-foreground">
            {formatDuration(elapsedSeconds)}
          </span>
          <span className="mt-1 text-sm text-muted-foreground">
            {complete
              ? `${protocol.fastingHours}h complete`
              : `${formatDuration(remaining)} to go`}
          </span>
        </ProgressRing>

        <div className="flex w-full flex-col items-center gap-1 text-center">
          <p className="text-sm font-medium text-foreground">
            {protocol.label} · {protocol.description}
          </p>
          <p className="text-xs text-muted-foreground">
            {protocol.fastingHours}h fasting window / {protocol.eatingHours}h eating window
          </p>
        </div>

        <div className="flex w-full items-center gap-3">
          <Button
            type="button"
            onClick={onToggle}
            className={cn(
              "h-11 flex-1 text-base font-semibold",
              running
                ? "bg-brand-orange text-brand-orange-foreground hover:bg-brand-orange/90"
                : "bg-brand-green text-primary-foreground hover:bg-brand-green/90"
            )}
          >
            {running ? (
              <>
                <Pause data-icon="inline-start" />
                Pause fast
              </>
            ) : (
              <>
                <Play data-icon="inline-start" />
                {elapsedSeconds > 0 ? "Resume fast" : "Start fast"}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            aria-label="Reset fast"
            className="size-11 shrink-0"
          >
            <RotateCcw />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
