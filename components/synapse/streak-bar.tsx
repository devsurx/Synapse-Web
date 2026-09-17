"use client"

import { Flame } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { getDayCounts, getStreak } from "@/lib/stats"

function level(count: number) {
  if (count === 0) return "bg-secondary"
  if (count <= 2) return "bg-accent/40"
  if (count <= 4) return "bg-accent/70"
  return "bg-accent"
}

export function StreakBar() {
  const [days, setDays] = useState(() => getDayCounts(14))
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    setDays(getDayCounts(14))
    setStreak(getStreak())
    const onTick = () => {
      setDays(getDayCounts(14))
      setStreak(getStreak())
    }
    window.addEventListener("focus", onTick)
    const interval = window.setInterval(onTick, 60_000)
    return () => {
      window.removeEventListener("focus", onTick)
      window.clearInterval(interval)
    }
  }, [])

  const total = days.reduce((a, d) => a + d.sessions, 0)

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl border border-border bg-card/60 px-4 py-3 sm:px-5 sm:py-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">Last 14 days</p>
        <p className="text-xs text-muted-foreground">{total} sessions completed</p>
      </div>
      {streak > 0 && (
        <div className="flex items-center gap-1.5 text-sm text-accent">
          <Flame className="size-4 fill-current" />
          {streak}-day streak
        </div>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        {days.map((d, i) => (
          <span
            key={d.date}
            title={`${d.date}: ${d.sessions} sessions`}
            className={cn("size-3 rounded-full transition-colors", level(d.sessions))}
            style={i === days.length - 1 && d.sessions === 0 ? { boxShadow: "0 0 0 1.5px var(--border)" } : undefined}
          />
        ))}
      </div>
    </div>
  )
}