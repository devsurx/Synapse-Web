"use client"

import { cn } from "@/lib/utils"
import { Leaf } from "lucide-react"

interface FocusVisualProps {
  progress: number
  isRunning: boolean
  mode: "focus" | "break"
}

// drifting spores scattered around the center of the glow
const SPORES = [
  { x: 50, y: 40, size: "size-1", dur: 5, delay: 0, dx: 12 },
  { x: 44, y: 48, size: "size-1.5", dur: 6.2, delay: 1.3, dx: -16 },
  { x: 58, y: 46, size: "size-1", dur: 5.6, delay: 2.5, dx: 8 },
  { x: 42, y: 36, size: "size-1", dur: 6.6, delay: 0.6, dx: -8 },
  { x: 62, y: 37, size: "size-1.5", dur: 5.9, delay: 3.1, dx: 14 },
  { x: 40, y: 56, size: "size-1", dur: 6.4, delay: 1.9, dx: -12 },
  { x: 60, y: 55, size: "size-1", dur: 5.5, delay: 4.2, dx: 10 },
]

/**
 * A plant that grows with session progress: stem rises, leaves unfurl,
 * and a warm/sage glow breathes behind it while running.
 */
export function FocusVisual({ progress, isRunning, mode }: FocusVisualProps) {
  const p = Math.min(Math.max(progress, 0), 1)
  const stemHeight = 26 + p * 78 // 26 -> 104
  const stemTopY = 150 - stemHeight
  const leafScale = 0.35 + p * 0.65
  const bloom = p > 0.7

  const sporeColor = mode === "focus" ? "oklch(0.76 0.11 150)" : "oklch(0.82 0.13 76)"
  const sporeOpacity = isRunning ? 0.55 : 0.3

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* Seamless ambient glow: edge-to-edge radial gradients that fade to
          transparent, cross-fading between modes. Unlike blurred boxes these
          have no element edges, so nothing can clip into a visible box —
          especially on narrow phone screens. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 transition-opacity duration-1000",
          mode === "focus" ? "opacity-100" : "opacity-0",
        )}
        style={{
          background:
            "radial-gradient(64% 48% at 50% 46%, oklch(0.76 0.11 150 / 0.22) 0%, oklch(0.76 0.11 150 / 0) 70%)",
        }}
      />
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 transition-opacity duration-1000",
          mode === "focus" ? "opacity-0" : "opacity-100",
        )}
        style={{
          background:
            "radial-gradient(64% 48% at 50% 46%, oklch(0.82 0.13 76 / 0.22) 0%, oklch(0.82 0.13 76 / 0) 70%)",
        }}
      />
      {/* layered breathing glow (desktop only — the gradient above carries mobile) */}
      <div
        aria-hidden
        className={cn(
          "absolute hidden aspect-square w-[62%] rounded-full blur-3xl transition-all duration-1000 sm:block",
          isRunning ? "opacity-90" : "opacity-50",
          mode === "focus" ? "bg-accent/25" : "bg-primary/25",
        )}
        style={{
          transform: `scale(${0.85 + p * 0.35})`,
          animation: isRunning ? "synapse-breathe 6s ease-in-out infinite" : undefined,
        }}
      />
      <div
        aria-hidden
        className={cn(
          "absolute hidden aspect-square w-[34%] rounded-full blur-2xl transition-opacity duration-1000 sm:block",
          mode === "focus" ? "bg-accent/30" : "bg-primary/30",
          isRunning ? "opacity-100" : "opacity-60",
        )}
      />

      {/* faint foliage anchors tucked inside the rounded corner (desktop only) */}
      <Leaf
        aria-hidden
        className="absolute left-1 top-1 hidden size-36 rotate-[135deg] text-accent/10 sm:block"
        strokeWidth={1}
        fill="currentColor"
      />
      <Leaf
        aria-hidden
        className="absolute bottom-1 right-1 hidden size-40 -rotate-45 text-primary/10 sm:block"
        strokeWidth={1}
        fill="currentColor"
      />

      {/* central light core the plant rises from */}
      <div
        aria-hidden
        className={cn(
          "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-1000",
          mode === "focus" ? "bg-accent/40" : "bg-primary/40",
        )}
        style={{
          width: `${12 + p * 24}px`,
          height: `${12 + p * 24}px`,
          boxShadow: isRunning
            ? `0 0 28px ${mode === "focus" ? "oklch(0.76 0.11 150 / 0.55)" : "oklch(0.82 0.13 76 / 0.55)"}`
            : "none",
          animation: isRunning ? "synapse-glow 3s ease-in-out infinite" : undefined,
        }}
      />

      {/* decorative halo ring around the center (desktop only) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 hidden aspect-square w-[68%] max-w-[260px] -translate-x-1/2 -translate-y-1/2 sm:block"
      >
        <div
          className="absolute inset-0 rounded-full border border-border/25"
          style={{ animation: "synapse-spin 42s linear infinite" }}
        >
          <span className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/60" />
          <span className="absolute bottom-0 left-1/2 size-1 -translate-x-1/2 translate-y-1/2 rounded-full bg-muted-foreground/40" />
          <span className="absolute left-0 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/40" />
          <span className="absolute right-0 top-1/2 size-1 translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/40" />
        </div>
        <div className="absolute inset-[7%] rounded-full border border-dashed border-border/20" />
      </div>

      {/* drifting spores to fill the empty middle */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[5]">
        {SPORES.map((spore) => (
          <span
            key={spore.x + "-" + spore.y}
            className={cn("absolute rounded-full", spore.size)}
            style={
              {
                left: `${spore.x}%`,
                top: `${spore.y}%`,
                background: sporeColor,
                ["--spore-x" as string]: `${spore.dx}px`,
                ["--spore-opacity" as string]: sporeOpacity,
                animation: `synapse-drift ${spore.dur}s ease-in-out ${spore.delay}s infinite`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* one-shot ring when a session begins */}
      {isRunning && (
        <div
          aria-hidden
          key="begin-ring"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div
            className={cn(
              "aspect-square w-[64%] rounded-full border-2",
              mode === "focus" ? "border-accent/30" : "border-primary/30",
            )}
            style={{ animation: "synapse-begin 1.2s ease-out both" }}
          />
        </div>
      )}

      <svg
        viewBox="0 0 160 160"
        className="relative z-10 h-[46%] max-h-56 w-auto sm:max-h-72"
        role="img"
        aria-label={`Focus plant, ${Math.round(p * 100)} percent grown`}
      >
        <defs>
          <linearGradient id="synapse-stem" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="oklch(0.6 0.11 150)" />
            <stop offset="100%" stopColor="oklch(0.82 0.12 150)" />
          </linearGradient>
          <radialGradient id="synapse-bloom" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.9 0.13 76)" />
            <stop offset="100%" stopColor="oklch(0.82 0.13 76 / 0)" />
          </radialGradient>
        </defs>

        {/* soil mound */}
        <ellipse cx="80" cy="148" rx="46" ry="8" fill="oklch(0.45 0.05 158)" opacity="0.45" />
        <path
          d="M42 148 h76"
          stroke="oklch(0.6 0.07 158)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />

        {/* stem */}
        <path
          d={`M80 150 Q80 ${stemTopY + stemHeight * 0.4} 80 ${stemTopY}`}
          stroke="url(#synapse-stem)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
        />

        {/* leaves */}
        <g
          className="transition-transform duration-700 ease-out"
          style={{ transformOrigin: `80px ${stemTopY + 18}px`, transform: `scale(${leafScale})` }}
        >
          <path
            d={`M80 ${stemTopY + 20} C 58 ${stemTopY + 12}, 52 ${stemTopY - 10}, 66 ${stemTopY - 20} C 78 ${stemTopY - 8}, 80 ${stemTopY + 6}, 80 ${stemTopY + 20} Z`}
            fill="url(#synapse-stem)"
          />
          <path
            d={`M80 ${stemTopY + 20} C 102 ${stemTopY + 12}, 108 ${stemTopY - 10}, 94 ${stemTopY - 20} C 82 ${stemTopY - 8}, 80 ${stemTopY + 6}, 80 ${stemTopY + 20} Z`}
            fill="url(#synapse-stem)"
          />
        </g>

        {/* bloom appears near completion */}
        {bloom && (
          <g className="animate-in fade-in zoom-in duration-700">
            <circle cx="80" cy={stemTopY - 6} r="16" fill="url(#synapse-bloom)" />
            <circle cx="80" cy={stemTopY - 6} r="6" fill="oklch(0.88 0.13 76)" />
          </g>
        )}
      </svg>

      <div
        key={isRunning ? "running" : "stopped"}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center sm:bottom-8"
      >
        <p
          className={cn(
            "flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.2em]",
            "animate-in fade-in slide-in-from-bottom-2 duration-500",
            isRunning
              ? mode === "focus"
                ? "text-accent"
                : "text-primary"
              : "text-muted-foreground",
          )}
        >
          <span className="relative inline-flex items-center justify-center" aria-hidden>
            {isRunning && (
              <span
                className={cn(
                  "absolute size-6 rounded-full",
                  mode === "focus" ? "bg-accent/30" : "bg-primary/30",
                )}
                style={{ animation: "synapse-glow 2.4s ease-in-out infinite" }}
              />
            )}
            <Leaf
              className={cn(
                "relative size-4 transition-colors",
                isRunning &&
                  cn(
                    mode === "focus" ? "text-accent" : "text-primary",
                    "[animation:synapse-leaf_2.4s_ease-in-out_infinite]",
                  ),
              )}
              strokeWidth={2}
            />
          </span>
          {mode === "focus" ? "Deep Work" : "Recover"}
        </p>
        <p className="mt-1 text-sm text-foreground/70">
          {p >= 1 ? (
            <span className="animate-in fade-in zoom-in duration-700">Fully grown</span>
          ) : isRunning ? (
            <span className="inline-block animate-pulse">Growing…</span>
          ) : (
            <span className="animate-in fade-in duration-500">Ready to grow</span>
          )}
        </p>
      </div>
    </div>
  )
}
