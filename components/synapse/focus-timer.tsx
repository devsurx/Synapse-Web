"use client"

import { ExternalLink, Pause, Play, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TimerMode } from "@/hooks/use-focus-timer"
import { TimerSettings } from "./timer-settings"

interface FocusTimerProps {
  mode: TimerMode
  setMode: (mode: TimerMode) => void
  secondsLeft: number
  isRunning: boolean
  todaySessions: number
  durations: { focus: number; break: number }
  updateDuration: (which: TimerMode, minutes: number) => void
  toggle: () => void
  reset: () => void
}

function format(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")
  const s = (seconds % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

export function FocusTimer({
  mode,
  setMode,
  secondsLeft,
  isRunning,
  todaySessions,
  durations,
  updateDuration,
  toggle,
  reset,
}: FocusTimerProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-6 py-10">
      {/* mode toggle */}
      <div className="inline-flex rounded-full border border-border bg-secondary/60 p-1">
        {(["focus", "break"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "rounded-full px-5 py-1.5 text-sm font-medium capitalize transition-colors",
              mode === m
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m} · {durations[m]}m
          </button>
        ))}
      </div>

      {/* time */}
      <div className="text-center">
        <p
          className="font-serif text-[clamp(4.5rem,12vw,8rem)] leading-none tracking-tight tabular-nums text-foreground"
          aria-live="polite"
        >
          {format(secondsLeft)}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          {todaySessions} focus {todaySessions === 1 ? "session" : "sessions"} today
        </p>
      </div>

      {/* controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-base font-semibold text-primary-foreground",
            "shadow-lg shadow-primary/20 transition-transform hover:scale-[1.03] active:scale-95",
          )}
        >
          {isRunning ? (
            <Pause className="size-5 fill-current" />
          ) : (
            <Play className="size-5 fill-current" />
          )}
          {isRunning ? "Pause" : "Begin"}
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label="Reset timer"
          className="inline-flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <RotateCcw className="size-5" />
        </button>
        <TimerSettings focusMin={durations.focus} breakMin={durations.break} onChange={updateDuration} />
        <button
          type="button"
          onClick={() => {
            window.open(
              "/popout",
              "synapse-timer-popout",
              "width=360,height=320,menubar=no,toolbar=no,location=no,status=no,resizable=yes",
            )
          }}
          aria-label="Pop out timer"
          title="Pop out timer"
          className="inline-flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ExternalLink className="size-5" />
        </button>
      </div>
    </div>
  )
}