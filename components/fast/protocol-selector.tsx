"use client"

import { cn } from "@/lib/utils"
import type { FastProtocol } from "@/components/fast/fast-page"

type ProtocolSelectorProps = {
  protocols: FastProtocol[]
  activeId: string
  onSelect: (id: string) => void
  disabled?: boolean
}

export function ProtocolSelector({
  protocols,
  activeId,
  onSelect,
  disabled,
}: ProtocolSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Fasting protocol"
      className="flex items-center gap-1 rounded-full border border-border bg-card p-1"
    >
      {protocols.map((p) => {
        const isActive = p.id === activeId
        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onSelect(p.id)}
            className={cn(
              "flex-1 rounded-full px-3 py-2 text-sm font-semibold tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              isActive
                ? "bg-brand-green text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}
