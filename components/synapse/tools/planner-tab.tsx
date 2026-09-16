"use client"

import { BookOpen, Clock, Loader2, Sparkles, Trash2 } from "lucide-react"
import { useState } from "react"
import { useAiStream } from "@/hooks/use-ai-stream"
import { cn } from "@/lib/utils"

interface FocusBlock {
  title: string
  durationMinutes: number
  note: string
}

function extractBlocks(text: string): FocusBlock[] | null {
  const start = text.indexOf("[")
  const end = text.lastIndexOf("]")
  if (start === -1 || end === -1 || end <= start) return null
  try {
    const parsed: unknown = JSON.parse(text.slice(start, end + 1))
    if (!Array.isArray(parsed)) return null
    return parsed
      .filter(
        (item): item is FocusBlock =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as FocusBlock).title === "string",
      )
      .slice(0, 8)
  } catch {
    return null
  }
}

export function PlannerTab() {
  const [goals, setGoals] = useState("")
  const [blocks, setBlocks] = useState<FocusBlock[]>([])
  const { text, isStreaming, error, send, reset } = useAiStream({
    onComplete: (raw) => {
      const parsed = extractBlocks(raw)
      if (parsed) setBlocks(parsed)
    },
  })

  const canSubmit = goals.trim().length > 0 && !isStreaming

  const submit = () => {
    if (!canSubmit) return
    reset()
    setBlocks([])
    send({
      feature: "planner",
      messages: [
        {
          role: "user",
          content: `Plan my focus sessions for today.\n\nMy goals and constraints:\n${goals.trim()}`,
        },
      ],
    })
  }

  const totalMinutes = blocks.reduce((sum, block) => sum + block.durationMinutes, 0)

  return (
    <div className="flex h-full flex-col gap-4 px-6 py-6">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <BookOpen className="size-4" strokeWidth={2} />
        </span>
        <h2 className="font-serif text-2xl text-foreground">Planner</h2>
      </div>

      <textarea
        value={goals}
        onChange={(e) => setGoals(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canSubmit) submit()
        }}
        placeholder={`What do you want to get done today? Any time constraints?`}
        rows={3}
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
          {isStreaming ? "Planning…" : "Suggest focus blocks"}
        </button>
        {blocks.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setBlocks([])
              reset()
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Trash2 className="size-3.5" />
            Clear
          </button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isStreaming && text && (
        <p className="text-xs text-muted-foreground">
          Parsing your plan… <span className="inline-block animate-pulse">▍</span>
        </p>
      )}

      {blocks.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Today's sessions</p>
            <p className="flex items-center gap-1 text-xs text-foreground/80">
              <Clock className="size-3.5" />
              {Math.round(totalMinutes)} min total
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {blocks.map((block, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-border bg-card/50 px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
              >
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{block.title}</p>
                    <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                      {block.durationMinutes}m
                    </span>
                  </div>
                  {block.note && <p className="mt-1 text-xs text-muted-foreground">{block.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isStreaming && blocks.length === 0 && (
        <p className="mt-1 text-xs text-muted-foreground/70">
          Describe your day and let Synapse carve it into focused, doable blocks.
        </p>
      )}
    </div>
  )
}