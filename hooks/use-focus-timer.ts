"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type TimerMode = "focus" | "break"

export const DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  break: 5 * 60,
}

export function useFocusTimer() {
  const [mode, setModeState] = useState<TimerMode>("focus")
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.focus)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return clear
  }, [isRunning, clear])

  // Handle completion as a side effect of reaching zero.
  useEffect(() => {
    if (secondsLeft !== 0 || !isRunning) return
    setIsRunning(false)
    setMode((current) => {
      const next: TimerMode = current === "focus" ? "break" : "focus"
      if (current === "focus") setSessions((s) => s + 1)
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, isRunning])

  const setMode = useCallback((next: TimerMode) => {
    setModeState(next)
    setIsRunning(false)
    setSecondsLeft(DURATIONS[next])
  }, [])

  const toggle = useCallback(() => {
    setSecondsLeft((prev) => (prev === 0 ? DURATIONS[mode] : prev))
    setIsRunning((r) => !r)
  }, [mode])

  const reset = useCallback(() => {
    setIsRunning(false)
    setSecondsLeft(DURATIONS[mode])
  }, [mode])

  const total = DURATIONS[mode]
  const progress = 1 - secondsLeft / total

  return {
    mode,
    setMode,
    secondsLeft,
    isRunning,
    sessions,
    progress,
    toggle,
    reset,
  }
}
