"use client"

import { ArrowRight, Sprout } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const NAME_KEY = "synapse:user-name"

function loadName(): string {
  if (typeof window === "undefined") return ""
  try {
    return window.localStorage.getItem(NAME_KEY) || ""
  } catch {
    return ""
  }
}

interface NamePromptProps {
  onSubmit: (name: string) => void
}

export function NamePrompt({ onSubmit }: NamePromptProps) {
  const [value, setValue] = useState("")
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setValue(loadName())
    const t = setTimeout(() => setVisible(true), 120)
    return () => clearTimeout(t)
  }, [])

  const submit = () => {
    const name = value.trim()
    if (!name) return
    try {
      window.localStorage.setItem(NAME_KEY, name)
    } catch {}
    onSubmit(name)
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-background px-6 py-8 transition-opacity duration-400",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute left-1/2 top-1/2 aspect-square w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl"
          style={{ animation: "synapse-breathe 5s ease-in-out infinite" }}
        />
      </div>

      <div
        className="relative z-10 flex w-full max-w-md flex-col items-center rounded-3xl border border-border bg-card/60 p-6 text-center shadow-xl"
        style={{ animation: "intro-rise 0.55s cubic-bezier(0.16, 1, 0.3, 1) both" }}
      >
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-accent/15">
          <Sprout className="text-accent" size={28} strokeWidth={1.5} />
        </div>
        <h2 className="font-serif text-2xl text-foreground">What should we call you?</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Just your first name — no account, no password. We'll use it to welcome you and back your garden.
        </p>

        <form
          className="mt-7 w-full"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. Mira"
            maxLength={24}
            className="w-full rounded-full border border-border bg-secondary/40 px-5 py-3 text-center text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/50"
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
            <ArrowRight className="size-4" />
          </button>
        </form>
      </div>
    </div>
  )
}