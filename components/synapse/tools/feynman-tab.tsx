"use client"

import { History, Loader2, Sparkles, X } from "lucide-react"
import { useState } from "react"
import { useAiStream } from "@/hooks/use-ai-stream"
import { cn } from "@/lib/utils"
import { Markdown } from "../markdown"

interface HistoryEntry {
  concept: string
  critique: string
  at: number
}

const HISTORY_KEY = "synapse:feynman-history"

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(window.localStorage.getItem(HISTORY_KEY) || "[]")
  } catch {
    return []
  }
}

export function FeynmanTab() {
  const [concept, setConcept] = useState("")
  const [explanation, setExplanation] = useState("")
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory)
  const [active, setActive] = useState<HistoryEntry | null>(null)
  const { text, isStreaming, error, send, reset } = useAiStream({
    onComplete: (critique) => {
      const trimmed = concept.trim()
      if (!trimmed) return
      const entry = { concept: trimmed, critique, at: Date.now() }
      setHistory((prev) => {
        const next = [entry, ...prev].slice(0, 10)
        try {
          window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
        } catch {}
        return next
      })
      setActive(entry)
    },
  })

  const canSubmit = concept.trim().length > 0 && explanation.trim().length > 0 && !isStreaming

  const submit = () => {
    if (!canSubmit) return
    send({
      feature: "feynman",
      messages: [
        {
          role: "user",
          content: `Concept: ${concept.trim()}\n\nMy explanation:\n${explanation.trim()}`,
        },
      ],
    })
  }

  const showStream = isStreaming || text.length > 0

  return (
    <div className="flex h-full flex-col gap-4 px-6 py-6">
      <div className="flex items-center gap-2">
        <BrainIcon />
        <h2 className="font-serif text-2xl text-foreground">Feynman Mode</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="flex flex-col gap-3">
          <input
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Concept you're learning, e.g. Entropy"
            className="rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/50"
          />
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Write your explanation in plain language, as if teaching a child..."
            rows={5}
            className="resize-none rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/50"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              className={cn(
                "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40",
              )}
            >
              {isStreaming ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {isStreaming ? "Grading…" : "Grade it"}
            </button>
            {showStream && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
                Clear
              </button>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {showStream && (
            <div className="min-h-0 max-h-[40vh] flex-1 overflow-y-auto rounded-xl border border-accent/25 bg-card/60 p-4 animate-in fade-in duration-300">
              <Markdown>{text}</Markdown>
              {isStreaming && <span className="ml-0.5 inline-block animate-pulse">▍</span>}
            </div>
          )}
        </div>

        <aside className="hidden flex-col gap-2 lg:flex">
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground">
            <History className="size-3.5" />
            Past critiques
          </p>
          {history.length === 0 && (
            <p className="text-xs text-muted-foreground/70">Your past critiques will appear here.</p>
          )}
          <div className="flex flex-col gap-2 overflow-y-auto">
            {history.map((entry) => (
              <button
                key={entry.at}
                type="button"
                onClick={() => setActive(entry)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                  active?.at === entry.at
                    ? "border-accent/40 bg-accent/10 text-foreground"
                    : "border-border bg-card/40 text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="line-clamp-1 font-medium">{entry.concept}</span>
                <span className="line-clamp-2 mt-0.5 text-muted-foreground/80">{entry.critique}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

function BrainIcon() {
  return (
    <span className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
      <Sparkles className="size-4" strokeWidth={2} />
    </span>
  )
}