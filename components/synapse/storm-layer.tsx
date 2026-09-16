"use client"

import { useEffect, useRef, useState } from "react"
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

export function StormLayer({ enabled, flash }: { enabled: boolean; flash: number }) {
  const [flashing, setFlashing] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (flash === 0) return
    setFlashing(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setFlashing(false), 900)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [flash])

  if (!enabled) return null

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {/* lightning flash */}
      <div
        className="absolute inset-0 bg-sky-100/45 mix-blend-screen transition-opacity duration-300"
        style={{ animation: flashing ? undefined : "synapse-lightning 0s none", opacity: flashing ? 0.9 : 0 }}
      />

      {/* slow thunder-gradient pulse on the flash card */}
      <div
        className={cn("absolute inset-0 bg-indigo-300/20 mix-blend-soft-light transition-opacity duration-[1400ms]")}
        style={{ opacity: flashing ? 0.7 : 0 }}
      />

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