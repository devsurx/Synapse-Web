"use client"

import { Download, Flame } from "lucide-react"
import { useEffect, useState } from "react"
import { APP_RELEASE_URL } from "./app-promo"
import { StoryShareButton } from "./story-export"
import { useIsMobileDevice } from "@/hooks/use-is-mobile"
import { getRank } from "@/lib/ranks"
import { getDayCounts, getStreak, readStats, subscribeStats } from "@/lib/stats"
import { cn } from "@/lib/utils"

const DAILY_GOAL_MIN = 120
const RING = 208
const RING_STROKE = 12
const RING_R = (RING - RING_STROKE) / 2
const RING_C = 2 * Math.PI * RING_R

/**
 * Live focus dashboard replacing the plant visual: today's minutes ringed
 * against a daily goal, streak / sessions / rank, and the story + app actions.
 * Deliberately chromeless — no cards or boxes, just airy content.
 */
export function FocusStats() {
  const isMobile = useIsMobileDevice()
  const [, setTick] = useState(0)

  useEffect(() => subscribeStats(() => setTick((t) => t + 1)), [])

  const today = getDayCounts(1)[0] ?? { minutes: 0, sessions: 0 }
  const streak = getStreak()
  // Totals re-read fresh on every stats tick.
  const { rank, next, progress, minutesIntoRank, minutesForNext } = getRank(
    readStats().focusMinutes,
  )

  const frac = Math.min(1, today.minutes / DAILY_GOAL_MIN)

  return (
    <div className="flex h-full flex-col items-center justify-center gap-7 px-6 py-8">
      {/* seamless ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute aspect-square w-[min(70vw,340px)] rounded-full bg-accent/10 blur-3xl"
        style={{ animation: "synapse-breathe 6s ease-in-out infinite" }}
      />

      {/* today's minutes ring */}
      <div className="relative animate-in fade-in zoom-in-95 duration-700">
        <svg width={RING} height={RING} viewBox={`0 0 ${RING} ${RING}`} role="img" aria-label={`${today.minutes} of ${DAILY_GOAL_MIN} goal minutes today`}>
          <defs>
            <linearGradient id="synapse-day-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="oklch(0.76 0.11 150)" />
              <stop offset="100%" stopColor="oklch(0.82 0.13 76)" />
            </linearGradient>
          </defs>
          <circle
            cx={RING / 2}
            cy={RING / 2}
            r={RING_R}
            fill="none"
            strokeWidth={RING_STROKE}
            style={{ stroke: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}
          />
          <circle
            cx={RING / 2}
            cy={RING / 2}
            r={RING_R}
            fill="none"
            stroke="url(#synapse-day-ring)"
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={RING_C}
            strokeDashoffset={RING_C * (1 - frac)}
            transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-serif text-6xl leading-none tabular-nums text-foreground">
            {today.minutes}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            min today
          </p>
        </div>
      </div>

      {/* streak / sessions / rank */}
      <div className="flex items-center gap-8 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
        <div className="flex flex-col items-center gap-1">
          <span className="flex items-center gap-1 text-lg font-semibold text-foreground tabular-nums">
            <Flame className={cn("size-4", streak > 0 ? "fill-current text-accent" : "text-muted-foreground/50")} />
            {streak}
          </span>
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">streak</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-semibold text-foreground tabular-nums">{today.sessions}</span>
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">sessions</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-semibold tabular-nums" style={{ color: rank.color }}>
            {rank.name}
          </span>
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">rank</span>
        </div>
      </div>

      {/* rank progress */}
      {next && (
        <div className="w-full max-w-[240px] animate-in fade-in duration-700 delay-200">
          <div className="h-1 overflow-hidden rounded-full" style={{ background: "color-mix(in oklab, var(--foreground) 10%, transparent)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.round(progress * 100)}%`, backgroundColor: next.color }}
            />
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {Math.max(0, minutesForNext - minutesIntoRank)}m to {next.name}
          </p>
        </div>
      )}

      {/* actions */}
      <div className="flex items-center gap-2 animate-in fade-in duration-700 delay-300">
        <StoryShareButton />
        {isMobile && (
          <a
            href={APP_RELEASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download the Android app"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <Download className="size-3.5" />
            App
          </a>
        )}
      </div>
    </div>
  )
}
