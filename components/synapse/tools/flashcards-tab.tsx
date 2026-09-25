"use client"

import { Layers, Loader2, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useAiStream } from "@/hooks/use-ai-stream"
import { loadString, saveString } from "@/lib/tool-storage"
import { cn } from "@/lib/utils"

interface Card {
  front: string
  back: string
}

interface Deck {
  id: number
  cards: Card[]
  at: number
}

const DECK_KEY = "synapse:flashcards"
const NOTES_DRAFT_KEY = "synapse:flashcards-notes-draft"

function extractCards(text: string): Card[] | null {
  const start = text.indexOf("[")
  const end = text.lastIndexOf("]")
  if (start === -1 || end === -1 || end <= start) return null
  try {
    const parsed: unknown = JSON.parse(text.slice(start, end + 1))
    if (!Array.isArray(parsed)) return null
    return parsed
      .filter(
        (item): item is Card =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as Card).front === "string" &&
          typeof (item as Card).back === "string",
      )
      .slice(0, 20)
  } catch {
    return null
  }
}

function loadDecks(): Deck[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(window.localStorage.getItem(DECK_KEY) || "[]")
  } catch {
    return []
  }
}

export function FlashcardsTab() {
  const [notes, setNotes] = useState(() => loadString(NOTES_DRAFT_KEY))
  const [decks, setDecks] = useState<Deck[]>(loadDecks)
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null)
  const [deckOffset, setDeckOffset] = useState(0)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    saveString(NOTES_DRAFT_KEY, notes)
  }, [notes])
  const { text, isStreaming, error, send, reset } = useAiStream({
    onComplete: (raw) => {
      const cards = extractCards(raw)
      if (!cards || cards.length === 0) return
      const deck = { id: Date.now(), cards, at: Date.now() }
      setDecks((prev) => {
        const next = [deck, ...prev].slice(0, 8)
        try {
          window.localStorage.setItem(DECK_KEY, JSON.stringify(next))
        } catch {}
        return next
      })
    },
  })

  const canSubmit = notes.trim().length > 0 && !isStreaming

  const submit = () => {
    if (!canSubmit) return
    reset()
    send({
      feature: "flashcards",
      messages: [
        { role: "user", content: `Generate flashcards from these notes:\n\n${notes.trim()}` },
      ],
    })
  }

  const cards = activeDeck?.cards ?? (extractCards(text) ?? [])
  const current = cards[deckOffset] ?? null

  const showStreamingPreview = !activeDeck && (isStreaming || text.length > 0)

  return (
    <div className="flex h-full flex-col gap-4 px-6 py-6">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Layers className="size-4" strokeWidth={2} />
        </span>
        <h2 className="font-serif text-2xl text-foreground">Flashcards</h2>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canSubmit) submit()
        }}
        placeholder="Paste your notes or a Feynman explanation, then generate cards…"
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
          {isStreaming ? <Loader2 className="size-4 animate-spin" /> : <Layers className="size-4" />}
          {isStreaming ? "Generating…" : "Generate cards"}
        </button>
        {isStreaming && <p className="text-xs text-muted-foreground">{text.trim() || "Reading…"}</p>}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {showStreamingPreview && text.trim() && (
        <p className="text-xs text-muted-foreground">
          Parsing cards… <span className="inline-block animate-pulse">▍</span>
        </p>
      )}

      {current && (
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Card {deckOffset + 1} of {cards.length}
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveDeck(null)
                setDeckOffset(0)
                reset()
              }}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 transition-colors hover:text-foreground"
            >
              <Trash2 className="size-3.5" />
              Close deck
            </button>
          </div>

          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="flex flex-1 items-center justify-center rounded-2xl border border-border bg-card/60 p-6 transition-transform hover:scale-[1.01] active:scale-95"
          >
            <div
              className={cn(
                "text-center transition-all duration-300",
                flipped ? "text-foreground/90" : "text-foreground",
              )}
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {flipped ? "Answer" : "Question"}
              </p>
              <p className="mt-3 max-w-md text-lg leading-relaxed">{flipped ? current.back : current.front}</p>
            </div>
          </button>

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setDeckOffset((o) => Math.max(0, o - 1))}
              disabled={deckOffset === 0}
              className="rounded-full border border-border px-5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="rounded-full border border-accent/40 bg-accent/10 px-5 py-2 text-sm text-foreground transition-colors hover:bg-accent/20"
            >
              {flipped ? "Flip back" : "Reveal answer"}
            </button>
            <button
              type="button"
              onClick={() => {
                setDeckOffset((o) => Math.min(cards.length - 1, o + 1))
                setFlipped(false)
              }}
              disabled={deckOffset === cards.length - 1}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {!current && !showStreamingPreview && decks.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Saved decks</p>
          {decks.map((deck) => (
            <button
              key={deck.id}
              type="button"
              onClick={() => {
                setActiveDeck(deck)
                setDeckOffset(0)
                setFlipped(false)
              }}
              className="rounded-xl border border-border bg-card/40 px-4 py-3 text-left text-sm transition-colors hover:border-accent/40"
            >
              {deck.cards.length} cards · {new Date(deck.at).toLocaleDateString()}
            </button>
          ))}
        </div>
      )}

      {!current && !showStreamingPreview && decks.length === 0 && (
        <p className="text-xs text-muted-foreground/70">
          Paste notes and generate a deck. Review with active recall to make it stick.
        </p>
      )}
    </div>
  )
}