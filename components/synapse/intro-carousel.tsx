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
    title: "Deep Focus Sessions",
    body: "25-minute focus and 5-minute break cycles that train your concentration over time.",
  },
  {
    Icon: Leaf,
    accent: "text-[#5cb85c]",
    bg: "bg-[#5cb85c]/15",
    title: "Watch Your Garden Grow",
    body: "A living plant that rises, blooms, and breathes while you stay on task.",
  },
  {
    Icon: Brain,
    accent: "text-accent",
    bg: "bg-accent/15",
    title: "AI Learning Toolkit",
    body: "Five study companions powered by your choice of models — all streaming in real time.",
    features: [
      { label: "Feynman", detail: "Explain a concept; Synapse grades it and finds the gaps." },
      { label: "ELI5", detail: "Turns any hard topic into a story a 10-year-old gets." },
      { label: "Flashcards", detail: "Pastes study notes and gets ready-to-review flashcard decks." },
      { label: "Chat", detail: "An always-on study co-pilot that remembers your thread." },
      { label: "Planner", detail: "Turns your goals into a realistic daily focus plan." },
    ],
  },
  {
    Icon: Users,
    accent: "text-blue-400",
    bg: "bg-blue-400/15",
    title: "Study Squads",
    body: "Share streaks, challenge friends, and grow together.",
  },
]

export function IntroCarousel() {
  const [seen, setSeen] = useState(true)
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(false)
  const [touchX, setTouchX] = useState<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    setSeen(localStorage.getItem(INTRO_KEY) === "1")
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
    }, 400)
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
        "fixed inset-0 z-40 flex flex-col items-center justify-center bg-background transition-opacity duration-400",
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
        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {slides.map(({ Icon, accent, bg, title, body, features }, i) => (
              <div key={i} className="flex w-full shrink-0 flex-col items-center text-center">
                <div className={cn("mb-8 flex size-20 items-center justify-center rounded-2xl", bg)}>
                  <Icon className={cn("size-9", accent)} strokeWidth={1.5} />
                </div>
                <h2 className="font-serif text-2xl text-foreground">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
                {features && (
                  <div className="mt-6 w-full max-w-sm space-y-2 text-left">
                    {features.map((f) => (
                      <div key={f.label} className="rounded-xl border border-border bg-card/50 px-4 py-2.5">
                        <span className={cn("text-sm font-semibold", accent)}>{f.label}</span>
                        <p className="text-xs leading-relaxed text-muted-foreground">{f.detail}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-5">
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setCurrent(i)}
                className={cn(
                  "size-2 rounded-full transition-all duration-300",
                  i === current ? "w-6 bg-foreground" : "bg-muted-foreground/30",
                )}
              />
            ))}
          </div>

          {isLast ? (
            <button
              type="button"
              onClick={finish}
              className="rounded-full bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
            >
              Get Started
            </button>
          ) : (
            <button
              type="button"
              onClick={() => go(1)}
              className="rounded-full border border-border px-8 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent/10"
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
