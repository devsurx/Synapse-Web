"use client"

import { Brain, Leaf, Timer, Users } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const INTRO_KEY = "synapse:intro-seen"

interface Slide {
  Icon: typeof Timer
  accent: string
  bg: string
  title: string
  body: string
  features?: { label: string; detail: string }[]
}

const slides: Slide[] = [
  {
    Icon: Timer,
    accent: "text-primary",
    bg: "bg-primary/15",
    title: "Train your attention",
    body: "Timed focus and break cycles — 25 minutes on, 5 off — that turn concentration into a daily habit.",
  },
  {
    Icon: Leaf,
    accent: "text-[#5cb85c]",
    bg: "bg-[#5cb85c]/15",
    title: "Watch progress grow",
    body: "Every session feeds a living plant that rises, unfurls, and blooms while you stay on task.",
  },
  {
    Icon: Brain,
    accent: "text-accent",
    bg: "bg-accent/15",
    title: "Study with AI",
    body: "Five quiet companions that stream answers in real time, using the model you choose.",
    features: [
      { label: "Feynman", detail: "Teach it back — graded, with your gaps surfaced." },
      { label: "ELI5", detail: "Any hard topic, retold so a ten-year-old gets it." },
      { label: "Flashcards", detail: "Paste notes, get a review-ready deck." },
      { label: "Chat", detail: "A co-pilot that keeps the thread with you." },
      { label: "Planner", detail: "Goals in, a realistic day plan out." },
    ],
  },
  {
    Icon: Users,
    accent: "text-blue-400",
    bg: "bg-blue-400/15",
    title: "Grow with squads",
    body: "Share streaks, nudge friends along, and keep each other coming back.",
  },
]

export function IntroCarousel({ userName, onDone }: { userName: string; onDone?: () => void }) {
  const [seen, setSeen] = useState(true)
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(false)
  const [touchX, setTouchX] = useState<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (typeof window === "undefined") return
    // Always show the intro on this device — don't gate on the seen flag.
    setSeen(false)
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  const go = useCallback((dir: 1 | -1) => {
    setCurrent((p) => {
      const next = p + dir
      if (next < 0) return 0
      if (next >= slides.length) return slides.length - 1
      return next
    })
  }, [])

  const finish = useCallback(() => {
    setVisible(false)
    setTimeout(() => {
      localStorage.setItem(INTRO_KEY, "1")
      setSeen(true)
      onDoneRef.current?.()
    }, 550)
  }, [])

  if (seen) return null

  const onTouchStart = (e: React.TouchEvent) => setTouchX(e.touches[0].clientX)
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX === null) return
    const dx = e.changedTouches[0].clientX - touchX
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
    setTouchX(null)
  }

  const isLast = current === slides.length - 1

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 flex flex-col items-center justify-center overflow-y-auto bg-background px-6 py-8 transition-opacity duration-700 ease-out",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 aspect-square w-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl"
          style={{ animation: "synapse-breathe 5s ease-in-out infinite" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <p className="mb-8 text-center font-serif text-xl text-accent">
          Welcome, {userName}
        </p>
          <div className="h-[min(460px,62vh)] overflow-hidden">
          <div
            ref={trackRef}
            className="flex h-full transition-transform duration-500 ease-out will-change-transform"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {slides.map(({ Icon, accent, bg, title, body, features }, i) => (
              <div key={i} className="flex h-full w-full shrink-0 flex-col items-center justify-center overflow-y-auto px-4 text-center">
                <div className={cn("mb-8 flex size-20 items-center justify-center rounded-2xl shadow-lg shadow-black/5 ring-1 ring-border", bg)}>
                  <Icon className={cn("size-9", accent)} strokeWidth={1.5} />
                </div>
                <h2 className="font-serif text-2xl text-foreground">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
                {features && (
                  <ul className="mt-6 w-full max-w-xs divide-y divide-border/60 text-left">
                    {features.map((f) => (
                      <li key={f.label} className="flex items-baseline gap-3 py-2">
                        <span aria-hidden className={cn("size-1 shrink-0 self-center rounded-full bg-current opacity-60", accent)} />
                        <p className="text-[13px] leading-relaxed">
                          <span className="font-medium text-foreground">{f.label}</span>
                          <span className="text-muted-foreground"> — {f.detail}</span>
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="font-mono text-[11px] tracking-[0.35em] text-muted-foreground/70">
            {current + 1}
            <span className="mx-1 text-muted-foreground/30">/</span>
            {slides.length}
          </p>
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setCurrent(i)}
                className={cn(
                  "size-2 rounded-full transition-all duration-300",
                  i === current ? "w-6 bg-foreground shadow-md shadow-foreground/20" : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
                )}
              />
            ))}
          </div>

          {isLast ? (
            <button
              type="button"
              onClick={finish}
              className="flex w-40 items-center justify-center rounded-full bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
            >
              Get Started
            </button>
          ) : (
            <button
              type="button"
              onClick={() => go(1)}
              className="flex w-40 items-center justify-center rounded-full border border-border px-8 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent/10"
            >
              Next
            </button>
          )}

          {!isLast && (
            <button
              type="button"
              onClick={finish}
              className="text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
