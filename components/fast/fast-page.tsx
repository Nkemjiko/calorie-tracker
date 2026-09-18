"use client"

import { useEffect, useMemo, useState } from "react"
import { Timer } from "lucide-react"
import { BottomNav } from "@/components/dashboard/bottom-nav"
import { ProtocolSelector } from "@/components/fast/protocol-selector"
import { FastTimerRing } from "@/components/fast/fast-timer-ring"
import { BiologicalState } from "@/components/fast/biological-state"
import { WeeklyConsistency } from "@/components/fast/weekly-consistency"
import { WaterTracker } from "@/components/fast/water-tracker"

export type FastProtocol = {
  id: string
  label: string
  fastingHours: number
}

const PROTOCOLS: FastProtocol[] = [
  { id: "16-8", label: "16:8", fastingHours: 16 },
  { id: "18-6", label: "18:6", fastingHours: 18 },
  { id: "20-4", label: "20:4", fastingHours: 20 },
  { id: "custom", label: "Custom", fastingHours: 14 },
]

const WATER_GOAL_ML = 2500

function formatClock(ts: number) {
  return new Date(ts).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function FastPage() {
  const [protocolId, setProtocolId] = useState("16-8")
  const [running, setRunning] = useState(false)
  // Time banked from a paused/previous fast session, in seconds.
  const [baseElapsed, setBaseElapsed] = useState(6 * 3600 + 12 * 60)
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState<number>(Date.now())
  const [mounted, setMounted] = useState(false)

  const [water, setWater] = useState(1500)

  const protocol = PROTOCOLS.find((p) => p.id === protocolId) ?? PROTOCOLS[0]
  const targetSeconds = protocol.fastingHours * 3600

  // Start an active fast on mount so the timer previews live, avoiding
  // hydration mismatch from Date-based values.
  useEffect(() => {
    const t = Date.now()
    setStartedAt(t - baseElapsed * 1000)
    setNow(t)
    setRunning(true)
    setMounted(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!running) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [running])

  const elapsedSeconds =
    running && startedAt !== null
      ? Math.floor((now - startedAt) / 1000)
      : baseElapsed

  const { startLabel, endLabel } = useMemo(() => {
    if (!running || startedAt === null) {
      return { startLabel: "--:--", endLabel: "--:--" }
    }
    return {
      startLabel: formatClock(startedAt),
      endLabel: formatClock(startedAt + targetSeconds * 1000),
    }
  }, [running, startedAt, targetSeconds])

  const handleToggle = () => {
    if (running) {
      setBaseElapsed(0)
      setStartedAt(null)
      setRunning(false)
    } else {
      const t = Date.now()
      setStartedAt(t)
      setNow(t)
      setBaseElapsed(0)
      setRunning(true)
    }
  }

  const handleProtocolChange = (id: string) => {
    setProtocolId(id)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-secondary/40">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="flex flex-col gap-4 px-4 pb-2 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-brand-green/10 text-brand-green">
              <Timer className="size-5" />
            </span>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Fast</h1>
              <p className="text-sm text-muted-foreground">Track your fasting window</p>
            </div>
          </div>

          <ProtocolSelector
            protocols={PROTOCOLS}
            activeId={protocolId}
            onSelect={handleProtocolChange}
          />
        </header>

        <main className="flex flex-1 flex-col gap-4 px-4 pb-8 pt-3">
          <FastTimerRing
            running={running}
            elapsedSeconds={mounted ? elapsedSeconds : baseElapsed}
            targetSeconds={targetSeconds}
            startLabel={startLabel}
            endLabel={endLabel}
            onToggle={handleToggle}
          />

          <BiologicalState elapsedSeconds={mounted ? elapsedSeconds : baseElapsed} />

          <WeeklyConsistency />

          <WaterTracker
            intake={water}
            goal={WATER_GOAL_ML}
            onAdd={(amount) => setWater((prev) => Math.min(WATER_GOAL_ML, prev + amount))}
          />
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
