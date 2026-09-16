"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import type { TimerMode } from "@/hooks/use-focus-timer"

interface Snapshot {
  mode: TimerMode
  secondsLeft: number
  isRunning: boolean
  focusMin: number
  breakMin: number
  at: number
}

const SNAPSHOT_KEY = "synapse:popout-timer"

function readSnapshot(): Snapshot | null {
  try {
    const raw = window.localStorage.getItem(SNAPSHOT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed.secondsLeft !== "number") return null
    return {
      mode: parsed.mode === "break" ? "break" : "focus",
      secondsLeft: Math.max(0, Math.round(parsed.secondsLeft)),
      isRunning: parsed.isRunning === true,
      focusMin: typeof parsed.focusMin === "number" ? parsed.focusMin : 25,
      breakMin: typeof parsed.breakMin === "number" ? parsed.breakMin : 5,
      at: typeof parsed.at === "number" ? parsed.at : Date.now(),
    }
  } catch {
    return null
  }
}

function format(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")
  const s = (seconds % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

/**
 * Standalone mini timer for the pop-out window. Mirrors the main focus timer
 * live via BroadcastChannel, with a localStorage snapshot for fresh opens and
 * a 1s local tick so it stays smooth between broadcasts.
 */
export function PopoutTimer() {
  const [snap, setSnap] = useState<Snapshot | null>(null)

  useEffect(() => {
    setSnap(readSnapshot())
    let channel: BroadcastChannel | null = null
    try {
      channel = new BroadcastChannel("synapse:timer")
      channel.onmessage = (e) => {
        const d = e.data as Partial<Snapshot>
        if (typeof d.secondsLeft !== "number") return
        setSnap({
          mode: d.mode === "break" ? "break" : "focus",
          secondsLeft: Math.max(0, Math.round(d.secondsLeft)),
          isRunning: d.isRunning === true,
          focusMin: typeof d.focusMin === "number" ? d.focusMin : 25,
          breakMin: typeof d.breakMin === "number" ? d.breakMin : 5,
          at: Date.now(),
        })
      }
    } catch {
      channel = null
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === SNAPSHOT_KEY) setSnap(readSnapshot())
    }
    window.addEventListener("storage", onStorage)
    // Local tick keeps the display counting even if a broadcast is missed.
    const id = window.setInterval(() => {
      setSnap((prev) => {
        if (!prev || !prev.isRunning || prev.secondsLeft <= 0) return prev
        return { ...prev, secondsLeft: prev.secondsLeft - 1 }
      })
    }, 1000)
    return () => {
      try {
        channel?.close()
      } catch {}
      window.removeEventListener("storage", onStorage)
      window.clearInterval(id)
    }
  }, [])

  const mode: TimerMode = snap?.mode ?? "focus"
  const secondsLeft = snap?.secondsLeft ?? 25 * 60
  const isRunning = snap?.isRunning ?? false
  const total = ((mode === "focus" ? snap?.focusMin : snap?.breakMin) ?? 25) * 60
  const progress = total > 0 ? 1 - secondsLeft / total : 0

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-6 py-8 text-center">
      <p
        className={cn(
          "rounded-full border border-border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em]",
          mode === "focus" ? "text-accent" : "text-primary",
        )}
      >
        {mode === "focus" ? "Deep Work" : "Recover"}
        {isRunning ? " · Live" : " · Paused"}
      </p>
      <p
        className="font-serif text-7xl leading-none tracking-tight tabular-nums text-foreground"
        aria-live="polite"
      >
        {format(secondsLeft)}
      </p>
      <div className="h-1 w-48 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            mode === "focus" ? "bg-accent" : "bg-primary",
          )}
          style={{ width: `${Math.min(Math.max(progress * 100, 0), 100)}%` }}
        />
      </div>
      {!snap && (
        <p className="text-xs text-muted-foreground">
          Open this from Focus mode to sync the live timer.
        </p>
      )}
    </main>
  )
}
