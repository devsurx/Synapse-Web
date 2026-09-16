"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { recordSession, subscribeStats } from "@/lib/stats"

export type TimerMode = "focus" | "break"

export const DEFAULT_FOCUS_MIN = 25
export const DEFAULT_BREAK_MIN = 5

const DURATION_KEY = "synapse:timer-durations"

function clamp(n: number, lo: number, hi: number): number {
  if (typeof n !== "number" || Number.isNaN(n)) return lo
  return Math.min(Math.max(Math.round(n), lo), hi)
}

function loadDurations(): { focusMin: number; breakMin: number } {
  if (typeof window === "undefined") return { focusMin: DEFAULT_FOCUS_MIN, breakMin: DEFAULT_BREAK_MIN }
  try {
    const raw = window.localStorage.getItem(DURATION_KEY)
    if (!raw) return { focusMin: DEFAULT_FOCUS_MIN, breakMin: DEFAULT_BREAK_MIN }
    const parsed = JSON.parse(raw)
    return {
      focusMin: clamp(parsed.focusMin, 1, 180),
      breakMin: clamp(parsed.breakMin, 1, 60),
    }
  } catch {
    return { focusMin: DEFAULT_FOCUS_MIN, breakMin: DEFAULT_BREAK_MIN }
  }
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function useFocusTimer() {
  const [durations, setDurations] = useState({ focusMin: DEFAULT_FOCUS_MIN, breakMin: DEFAULT_BREAK_MIN })
  const [mode, setModeState] = useState<TimerMode>("focus")
  const [secondsLeft, setSecondsLeft] = useState(() => durations.focusMin * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [todaySessions, setTodaySessions] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completionHandledRef = useRef(false)
  const channelRef = useRef<BroadcastChannel | null>(null)

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    const unsub = subscribeStats((stats) => {
      setTodaySessions(stats.days[todayKey()]?.sessions ?? 0)
    })
    return unsub
  }, [])

  useEffect(() => {
    const saved = loadDurations()
    setDurations((prev) =>
      saved.focusMin !== prev.focusMin || saved.breakMin !== prev.breakMin ? saved : prev,
    )
  }, [])

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return clear
  }, [isRunning, clear])

  useEffect(() => {
    if (secondsLeft !== 0 || !isRunning) return
    if (completionHandledRef.current) return
    completionHandledRef.current = true
    setIsRunning(false)
    if (mode === "focus") {
      recordSession(durations.focusMin)
    }
    setModeState((current) => (current === "focus" ? "break" : "focus"))
    setSecondsLeft(durations.breakMin * 60)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, isRunning])

  useEffect(() => {
    if (secondsLeft === 0 && !isRunning && mode === "focus") {
      completionHandledRef.current = false
    }
  }, [mode, isRunning, secondsLeft])

  // Keep the pop-out mini timer in sync (live channel + snapshot for fresh opens).
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      channelRef.current ??= new BroadcastChannel("synapse:timer")
    } catch {
      channelRef.current = null
    }
    return () => {
      try {
        channelRef.current?.close()
      } catch {}
      channelRef.current = null
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const snapshot = {
      mode,
      secondsLeft,
      isRunning,
      focusMin: durations.focusMin,
      breakMin: durations.breakMin,
      at: Date.now(),
    }
    try {
      window.localStorage.setItem("synapse:popout-timer", JSON.stringify(snapshot))
    } catch {}
    try {
      channelRef.current?.postMessage(snapshot)
    } catch {}
  }, [mode, secondsLeft, isRunning, durations])

  const minutesFor = useCallback(
    (m: TimerMode) => (m === "focus" ? durations.focusMin : durations.breakMin),
    [durations],
  )

  const total = minutesFor(mode) * 60
  const progress = secondsLeft === 0 && !isRunning ? 0 : 1 - secondsLeft / total

  const setMode = useCallback(
    (next: TimerMode) => {
      setIsRunning(false)
      setModeState(next)
      setSecondsLeft(minutesFor(next) * 60)
      completionHandledRef.current = false
    },
    [minutesFor],
  )

  const toggle = useCallback(() => {
    setIsRunning((r) => {
      if (!r && secondsLeft === 0) {
        setSecondsLeft(minutesFor(mode) * 60)
        completionHandledRef.current = false
      }
      return !r
    })
  }, [secondsLeft, mode, minutesFor])

  const reset = useCallback(() => {
    setIsRunning(false)
    setSecondsLeft(minutesFor(mode) * 60)
    completionHandledRef.current = false
  }, [mode, minutesFor])

  const updateDuration = useCallback(
    (which: TimerMode, minutes: number) => {
      const safe = clamp(minutes, 1, which === "focus" ? 180 : 60)
      setDurations((prev) => {
        const next = { ...prev, [which === "focus" ? "focusMin" : "breakMin"]: safe }
        try {
          window.localStorage.setItem(DURATION_KEY, JSON.stringify(next))
        } catch {}
        return next
      })
      setIsRunning(false)
      if (mode === which) {
        setSecondsLeft(safe * 60)
        completionHandledRef.current = false
      }
    },
    [mode],
  )

  return {
    mode,
    setMode,
    secondsLeft,
    isRunning,
    todaySessions,
    progress,
    durations: {
      focus: durations.focusMin,
      break: durations.breakMin,
    },
    updateDuration,
    toggle,
    reset,
  }
}