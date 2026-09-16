"use client"

import { Loader2, Sprout } from "lucide-react"
import { useState } from "react"
import { useAiStream } from "@/hooks/use-ai-stream"
import { cn } from "@/lib/utils"

export function Eli5Tab() {
  const [concept, setConcept] = useState("")
  const { text, isStreaming, error, send, reset } = useAiStream()

  const canSubmit = concept.trim().length > 0 && !isStreaming

  const submit = () => {
    if (!canSubmit) return
    send({
      feature: "eli5",
      messages: [{ role: "user", content: `Explain this like I'm 5: ${concept.trim()}` }],
    })
  }

  const showStream = isStreaming || text.length > 0

  return (
    <div className="flex h-full flex-col gap-4 px-6 py-6">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Sprout className="size-4" strokeWidth={2} />
        </span>
        <h2 className="font-serif text-2xl text-foreground">Explain Like I'm 5</h2>
      </div>

      <div className="flex flex-col gap-2">
        <input
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canSubmit) submit()
          }}
          placeholder="A hard idea, e.g. quantum entanglement"
          className="rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/50"
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
            {isStreaming ? <Loader2 className="size-4 animate-spin" /> : <Sprout className="size-4" />}
            {isStreaming ? "Breaking it down…" : "Explain simply"}
          </button>
          {showStream && (
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {showStream && (
        <div className="whitespace-pre-wrap rounded-xl border border-accent/25 bg-card/60 p-4 text-sm leading-relaxed text-foreground/90 animate-in fade-in duration-300">
          {text}
          {isStreaming && <span className="ml-0.5 inline-block animate-pulse">▍</span>}
        </div>
      )}

      {!showStream && (
        <p className="mt-2 text-xs text-muted-foreground/70">
          Paste a tricky topic and let Synapse grow simple seeds of understanding.
        </p>
      )}
    </div>
  )
}