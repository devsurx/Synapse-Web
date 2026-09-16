"use client"

import { Minus, Plus, Settings2 } from "lucide-react"
import { useRef, useState } from "react"
import type { TimerMode } from "@/hooks/use-focus-timer"
import { cn } from "@/lib/utils"

interface TimerSettingsProps {
  focusMin: number
  breakMin: number
  onChange: (which: TimerMode, minutes: number) => void
}

const FOCUS_PRESETS = [15, 25, 50]
const BREAK_PRESETS = [5, 10, 15]

export function TimerSettings({ focusMin, breakMin, onChange }: TimerSettingsProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const step = (which: TimerMode, delta: number) => {
    const current = which === "focus" ? focusMin : breakMin
    const next = Math.min(Math.max(current + delta, 1), which === "focus" ? 180 : 60)
    onChange(which, next)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Timer settings"
        aria-expanded={open}
        className="inline-flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Settings2 className="size-5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            ref={panelRef}
            className="absolute right-0 bottom-12 z-40 w-72 rounded-2xl border border-border bg-card p-4 shadow-2xl animate-in zoom-in-95 fade-in duration-200"
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Session lengths
            </p>

            {(
              [
                ["focus", "Focus", focusMin, FOCUS_PRESETS],
                ["break", "Break", breakMin, BREAK_PRESETS],
              ] as const
            ).map(([which, label, value, presets]) => (
              <div key={which} className="mb-4 last:mb-0">
                <p className="mb-2 text-sm text-foreground">{label}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => step(which, -5)}
                    aria-label={`Decrease ${label.toLowerCase()} length`}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Minus className="size-4" />
                  </button>
                  <div className="flex-1 rounded-lg border border-border bg-secondary/40 px-2 py-1.5 text-center text-sm font-semibold tabular-nums text-foreground">
                    {value} min
                  </div>
                  <button
                    type="button"
                    onClick={() => step(which, 5)}
                    aria-label={`Increase ${label.toLowerCase()} length`}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {presets.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onChange(which, p)}
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                        value === p
                          ? "border-accent/40 bg-accent/10 text-accent"
                          : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {p}m
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}