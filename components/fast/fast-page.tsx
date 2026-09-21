"use client"

import { useEffect, useMemo, useState } from "react"
import { Timer } from "lucide-react"
import { BottomNav } from "@/components/dashboard/bottom-nav"
import { ProtocolSelector } from "@/components/fast/protocol-selector"
import { FastTimerRing } from "@/components/fast/fast-timer-ring"
import { BiologicalState } from "@/components/fast/biological-state"
import { WeeklyConsistency } from "@/components/fast/weekly-consistency"
import { WaterTracker } from "@/components/fast/water-tracker"
import { useFasting } from "@/lib/hooks/use-fasting"
import { useAuth } from "@/components/auth/auth-provider"

export type FastProtocol = {
  id: string
  label: string
  fastingHours: number
}

const PROTOCOLS: FastProtocol[] = [
  { id: "14-10", label: "14:10", fastingHours: 14 },
  { id: "16-8", label: "16:8", fastingHours: 16 },
  { id: "18-6", label: "18:6", fastingHours: 18 },
  { id: "20-4", label: "20:4", fastingHours: 20 },
]

const WATER_GOAL_ML = 2500

function formatClock(ts: number) {
  return new Date(ts).toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function FastPage() {
  const { user, loading: authLoading } = useAuth()
  const { activeSession, weeklyHistory, streak, loading, startFast, endFast } = useFasting()
  const [protocolId, setProtocolId] = useState("16-8")
  const [now, setNow] = useState<number>(Date.now())
  const [mounted, setMounted] = useState(false)
  const [water, setWater] = useState(1500)
  const [actionLoading, setActionLoading] = useState(false)

  const protocol = PROTOCOLS.find((p) => p.id === protocolId) ?? PROTOCOLS[1]
  const targetHours = activeSession?.target_hours ?? protocol.fastingHours
  const targetSeconds = targetHours * 3600

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!activeSession) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [activeSession])

  const elapsedSeconds = useMemo(() => {
    if (!activeSession || !mounted) return 0
    const start = new Date(activeSession.start_time).getTime()
    return Math.floor((now - start) / 1000)
  }, [activeSession, now, mounted])

  const { startLabel, endLabel } = useMemo(() => {
    if (!activeSession) return { startLabel: "--:--", endLabel: "--:--" }
    const start = new Date(activeSession.start_time).getTime()
    return {
      startLabel: formatClock(start),
      endLabel: formatClock(start + targetSeconds * 1000),
    }
  }, [activeSession, targetSeconds])

  const handleToggle = async () => {
    if (actionLoading) return
    setActionLoading(true)
    if (activeSession) {
      await endFast()
    } else {
      await startFast(protocol.fastingHours)
    }
    setActionLoading(false)
  }

  const showLoading = authLoading || loading

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
            onSelect={setProtocolId}
            disabled={!!activeSession}
          />
        </header>

        <main className="flex flex-1 flex-col gap-4 px-4 pb-8 pt-3">
          {showLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="size-8 animate-spin rounded-full border-2 border-brand-green border-t-transparent" />
            </div>
          ) : !user ? (
            <div className="flex flex-col items-center gap-2 py-20 text-center">
              <p className="text-sm font-medium text-foreground">Sign in to start fasting</p>
              <p className="text-xs text-muted-foreground">Your fasting sessions will be saved automatically.</p>
            </div>
          ) : (
            <>
              <FastTimerRing
                running={!!activeSession}
                elapsedSeconds={elapsedSeconds}
                targetSeconds={targetSeconds}
                startLabel={startLabel}
                endLabel={endLabel}
                onToggle={handleToggle}
                disabled={actionLoading}
              />

              <BiologicalState elapsedSeconds={elapsedSeconds} />

              <WeeklyConsistency data={weeklyHistory} streak={streak} />

              <WaterTracker
                intake={water}
                goal={WATER_GOAL_ML}
                onAdd={(amount) => setWater((prev) => Math.min(WATER_GOAL_ML, prev + amount))}
              />
            </>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
