"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const CLOUDS = [
  { top: "6%", scale: 1.6, opacity: 0.5, duration: 46, delay: -8 },
  { top: "18%", scale: 2.3, opacity: 0.62, duration: 58, delay: -30 },
  { top: "4%", scale: 1.2, opacity: 0.4, duration: 40, delay: -20 },
  { top: "36%", scale: 1.9, opacity: 0.45, duration: 52, delay: -12 },
  { top: "56%", scale: 2.6, opacity: 0.38, duration: 64, delay: -44 },
  { top: "74%", scale: 1.9, opacity: 0.42, duration: 50, delay: -26 },
]

function Cloud({ opacity }: { opacity: number }) {
  return (
    <svg viewBox="0 0 120 56" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="cloudFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(120,128,150,0.95)" />
          <stop offset="100%" stopColor="rgba(60,66,82,0.95)" />
        </linearGradient>
      </defs>
      <g fill="url(#cloudFill)" opacity={opacity} style={{ filter: "blur(1.5px)" }}>
        <ellipse cx="26" cy="38" rx="24" ry="17" />
        <ellipse cx="52" cy="26" rx="28" ry="21" />
        <ellipse cx="82" cy="32" rx="25" ry="18" />
        <ellipse cx="100" cy="42" rx="18" ry="13" />
        <rect x="4" y="36" width="112" height="20" rx="10" />
      </g>
    </svg>
  )
}

interface Strike {
  id: number
  /** horizontal origin of the bolt, in % of viewport width */
  x: number
  /** peak brightness multiplier 0.7–1 */
  intensity: number
  main: string
  branch: string
}

/** Build a jagged bolt path in a 0–100 viewBox, descending from the clouds. */
function buildBolt(x: number, seed: number): { main: string; branch: string } {
  let rand = seed
  const next = () => {
    rand = (rand * 16807) % 2147483647
    return rand / 2147483647
  }
  const pts: string[] = []
  let cx = x
  let cy = -2
  pts.push(`M ${cx.toFixed(1)} ${cy.toFixed(1)}`)
  const segments = 8 + Math.floor(next() * 3)
  const endY = 42 + next() * 18
  const forkAt = 3 + Math.floor(next() * 3)
  let forkX = x
  let forkY = 0
  for (let i = 0; i < segments; i++) {
    cy += endY / segments
    cx += (next() - 0.5) * 7
    pts.push(`L ${cx.toFixed(1)} ${cy.toFixed(1)}`)
    if (i === forkAt) {
      forkX = cx
      forkY = cy
    }
  }
  const main = pts.join(" ")
  // a short fork splitting off mid-bolt, dimmer and thinner
  const bPts = [`M ${forkX.toFixed(1)} ${forkY.toFixed(1)}`]
  let bx = forkX
  let by = forkY
  for (let i = 0; i < 4; i++) {
    by += 4 + next() * 5
    bx += (next() - 0.35) * 8
    bPts.push(`L ${bx.toFixed(1)} ${by.toFixed(1)}`)
  }
  return { main, branch: bPts.join(" ") }
}

export function StormLayer({ enabled, flash }: { enabled: boolean; flash: number }) {
  const [visible, setVisible] = useState(enabled)
  const [strike, setStrike] = useState<Strike | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!enabled) {
      const id = setTimeout(() => {
        setVisible(false)
        setStrike(null)
      }, 2400)
      return () => clearTimeout(id)
    }
    setVisible(true)
    return undefined
  }, [enabled])

  useEffect(() => {
    if (flash === 0) return
    // Don't light up a background tab — the hook already skips scheduling
    // flashes there, this is a second guard for stale timeouts.
    if (typeof document !== "undefined" && document.hidden) return
    const x = 12 + Math.random() * 76
    const seed = Math.floor(Math.random() * 1_000_000) + 1
    const { main, branch } = buildBolt(x, seed)
    setStrike({
      id: flash,
      x,
      intensity: 0.7 + Math.random() * 0.3,
      main,
      branch,
    })
    if (timerRef.current) clearTimeout(timerRef.current)
    // Strike flicker lasts ~750ms; then the sky settles back to dark.
    timerRef.current = setTimeout(() => setStrike(null), 800)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [flash])

  const skyGlow = useMemo(() => {
    if (!strike) return undefined
    return {
      background: `radial-gradient(52% 38% at ${strike.x.toFixed(1)}% 0%, rgba(191,219,254,${(0.5 * strike.intensity).toFixed(2)}) 0%, rgba(147,197,253,${(0.22 * strike.intensity).toFixed(2)}) 34%, rgba(99,102,241,${(0.1 * strike.intensity).toFixed(2)}) 55%, transparent 72%), linear-gradient(to bottom, rgba(224,242,254,${(0.16 * strike.intensity).toFixed(2)}) 0%, transparent 46%)`,
    } as React.CSSProperties
  }, [strike])

  if (!visible) return null

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-0 z-30 overflow-hidden transition-opacity duration-[2400ms] ease-in-out",
        enabled ? "opacity-100" : "opacity-0",
      )}
    >
      {/* drifting storm clouds */}
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="absolute left-0 w-[34vw]"
          style={{
            top: c.top,
            opacity: c.opacity,
            transform: `scale(${c.scale})`,
            animation: `synapse-cloud-drift ${c.duration}s linear infinite`,
            animationDelay: `${c.delay}s`,
          }}
        >
          <Cloud opacity={1} />
        </div>
      ))}

      {/* rain streaks */}
      <div className="absolute inset-0 opacity-70 rain-layer" />
      <div className="absolute inset-0 opacity-40 rain-layer" style={{ animationDuration: "0.7s" }} />

      {/* lightning: localized sky illumination + a jagged bolt, never a full white wash */}
      {strike && (
        <div key={strike.id} className="absolute inset-0 mix-blend-screen">
          <div
            className="absolute inset-0"
            style={{
              ...skyGlow,
              animation: "synapse-lightning-glow 0.8s ease-out both",
            }}
          />
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            style={{ animation: "synapse-bolt-flicker 0.8s ease-out both" }}
          >
            {/* soft halo */}
            <path
              d={strike.main}
              fill="none"
              stroke="rgba(147,197,253,0.55)"
              strokeWidth="1.6"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{ filter: "blur(2.5px)" }}
            />
            <path
              d={strike.branch}
              fill="none"
              stroke="rgba(147,197,253,0.4)"
              strokeWidth="1.1"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{ filter: "blur(2px)" }}
            />
            {/* hot core */}
            <path
              d={strike.main}
              fill="none"
              stroke={`rgba(240,249,255,${(0.95 * strike.intensity).toFixed(2)})`}
              strokeWidth="0.55"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{ filter: "drop-shadow(0 0 3px rgba(191,219,254,0.9))" }}
            />
            <path
              d={strike.branch}
              fill="none"
              stroke="rgba(224,242,254,0.8)"
              strokeWidth="0.35"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}

      {/* vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 20%, transparent 30%, rgba(4,6,12,0.55) 100%)",
        }}
      />
    </div>
  )
}
