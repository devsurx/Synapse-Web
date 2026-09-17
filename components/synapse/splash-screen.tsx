"use client"

import Image from "next/image"
import { ArrowRight, Loader2, Sparkles } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/* 1. Boot splash — brand moment shown on every app start               */
/* ------------------------------------------------------------------ */

interface SplashScreenProps {
  onDone?: () => void
  /** ms before the fade-out starts */
  holdMs?: number
}

export function SplashScreen({ onDone, holdMs = 2000 }: SplashScreenProps) {
  const [phase, setPhase] = useState<"in" | "out" | "done">("in")
  const [progress, setProgress] = useState(0)
  const onDoneRef = useCallback(() => onDone?.(), [onDone])

  useEffect(() => {
    // Smooth fake progress bar that eases toward 100%.
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / holdMs)
      // ease-out curve so it feels fast at first, gentle at the end
      setProgress(Math.round((1 - Math.pow(1 - t, 2)) * 100))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const t1 = setTimeout(() => setPhase("out"), holdMs)
    const t2 = setTimeout(() => {
      setPhase("done")
      onDoneRef()
    }, holdMs + 550)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [holdMs, onDoneRef])

  const skip = useCallback(() => {
    setPhase((p) => {
      if (p !== "in") return p
      setTimeout(() => onDoneRef(), 450)
      return "out"
    })
  }, [onDoneRef])

  if (phase === "done") return null

  return (
    <div
      role="status"
      aria-label="Loading Synapse"
      onClick={skip}
      className="fixed inset-0 z-[60] flex cursor-pointer flex-col items-center justify-center bg-background px-6 transition-opacity duration-500"
      style={{ opacity: phase === "out" ? 0 : 1, pointerEvents: phase === "out" ? "none" : undefined }}
    >
      <div
        aria-hidden
        className="absolute aspect-square w-[min(70vw,420px)] rounded-full bg-accent/15 blur-3xl"
        style={{ animation: "synapse-breathe 4s ease-in-out infinite" }}
      />
      <div
        aria-hidden
        className="absolute aspect-square w-[min(46vw,260px)] rounded-full bg-primary/10 blur-3xl"
        style={{ animation: "synapse-breathe 5.5s ease-in-out infinite reverse" }}
      />

      <Image
        src="/logo.png"
        alt=""
        width={96}
        height={96}
        priority
        className="relative z-10 size-24 rounded-full object-cover shadow-2xl animate-in zoom-in-95 fade-in duration-500"
      />

      <p className="relative z-10 mt-6 font-serif text-4xl text-foreground animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">
        Synapse
      </p>
      <p className="relative z-10 mt-2 text-sm tracking-wide text-muted-foreground animate-in fade-in duration-700 delay-300">
        Focus &amp; Grow
      </p>

      {/* progress bar */}
      <div className="relative z-10 mt-10 h-1 w-44 overflow-hidden rounded-full bg-secondary animate-in fade-in duration-700 delay-300">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="relative z-10 mt-3 font-mono text-[11px] tracking-[0.3em] text-muted-foreground/60">
        {progress}%
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 2. Welcome — personal greeting before the intro carousel             */
/* ------------------------------------------------------------------ */

function greetingForHour(hour: number): string {
  if (hour < 5) return "Good night"
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

interface WelcomeScreenProps {
  userName: string
  onContinue: () => void
}

export function WelcomeScreen({ userName, onContinue }: WelcomeScreenProps) {
  const [visible, setVisible] = useState(false)
  const [greeting, setGreeting] = useState("Welcome")

  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()))
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background px-6 py-8 transition-opacity duration-500",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 aspect-square w-[min(70vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl"
          style={{ animation: "synapse-breathe 5s ease-in-out infinite" }}
        />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-6 flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Sparkles className="size-3.5 text-primary" />
          {greeting}
        </div>

        <Image
          src="/logo.png"
          alt=""
          width={72}
          height={72}
          className="size-[72px] rounded-full object-cover shadow-xl animate-in zoom-in-95 fade-in duration-500 delay-100"
        />

        <h1
          className="mt-6 font-serif text-3xl leading-tight text-foreground animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150 sm:text-4xl"
        >
          Welcome{userName ? `, ${userName}` : ""}
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground animate-in fade-in duration-500 delay-200">
          Glad you&apos;re here. Take a quick tour of how Synapse helps you focus,
          grow, and learn — it only takes a moment.
        </p>

        <button
          type="button"
          onClick={onContinue}
          autoFocus
          className="mt-8 inline-flex w-48 items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300"
        >
          Take the tour
          <ArrowRight className="size-4" />
        </button>
        <p className="mt-4 text-xs text-muted-foreground/60 animate-in fade-in duration-500 delay-300">
          4 short cards · skip anytime
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 3. Post-intro loader — bridge between carousel and the app           */
/* ------------------------------------------------------------------ */

const LOADING_TIPS = [
  "Watering your garden…",
  "Sharpening your focus timer…",
  "Waking up your study companions…",
]

interface AppLoadingScreenProps {
  onDone?: () => void
  /** ms the loader stays visible */
  holdMs?: number
}

export function AppLoadingScreen({ onDone, holdMs = 2200 }: AppLoadingScreenProps) {
  const [phase, setPhase] = useState<"in" | "out" | "done">("in")
  const [progress, setProgress] = useState(0)
  const [tipIndex, setTipIndex] = useState(0)
  const onDoneRef = useCallback(() => onDone?.(), [onDone])

  useEffect(() => {
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / holdMs)
      setProgress(Math.round((1 - Math.pow(1 - t, 2)) * 100))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const tipTimer = setInterval(
      () => setTipIndex((i) => (i + 1) % LOADING_TIPS.length),
      Math.max(700, holdMs / LOADING_TIPS.length),
    )
    const t1 = setTimeout(() => setPhase("out"), holdMs)
    const t2 = setTimeout(() => {
      setPhase("done")
      onDoneRef()
    }, holdMs + 500)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(tipTimer)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [holdMs, onDoneRef])

  if (phase === "done") return null

  return (
    <div
      role="status"
      aria-label="Preparing your workspace"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-6 transition-opacity duration-500"
      style={{ opacity: phase === "out" ? 0 : 1, pointerEvents: phase === "out" ? "none" : undefined }}
    >
      <div
        aria-hidden
        className="absolute aspect-square w-[min(60vw,360px)] rounded-full bg-primary/10 blur-3xl"
        style={{ animation: "synapse-breathe 4s ease-in-out infinite" }}
      />

      <div className="relative z-10 flex size-20 items-center justify-center rounded-3xl bg-accent/15 ring-1 ring-border">
        <Loader2 className="size-9 text-accent animate-spin [animation-duration:1.4s]" strokeWidth={1.5} />
      </div>

      <p className="relative z-10 mt-6 font-serif text-2xl text-foreground">
        Setting up your space
      </p>
      <p
        key={tipIndex}
        className="relative z-10 mt-2 h-5 text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-1 duration-300"
      >
        {LOADING_TIPS[tipIndex]}
      </p>

      <div className="relative z-10 mt-8 h-1 w-52 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="relative z-10 mt-3 font-mono text-[11px] tracking-[0.3em] text-muted-foreground/60">
        {progress}%
      </p>
    </div>
  )
}
