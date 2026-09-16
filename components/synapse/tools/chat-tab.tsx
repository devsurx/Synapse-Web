"use client"

import { Loader2, MessageCircle, Send, Trash2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useAiStream } from "@/hooks/use-ai-stream"
import type { ChatMessage } from "@/lib/openrouter"
import { cn } from "@/lib/utils"

const CHAT_KEY = "synapse:chat-history"

function loadChat(): ChatMessage[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(window.localStorage.getItem(CHAT_KEY) || "[]")
  } catch {
    return []
  }
}

export function ChatTab() {
  const [messages, setMessages] = useState<ChatMessage[]>(loadChat)
  const [draft, setDraft] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const { text, isStreaming, error, send } = useAiStream({
    onComplete: (reply) => {
      setMessages((prev) => {
        const next = [...prev, { role: "assistant", content: reply }]
        try {
          window.localStorage.setItem(CHAT_KEY, JSON.stringify(next))
        } catch {}
        return next
      })
    },
  })

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, text, isStreaming])

  const canSubmit = draft.trim().length > 0 && !isStreaming

  const submit = () => {
    if (!canSubmit) return
    const content = draft.trim()
    const history = [...messages, { role: "user" as const, content }]
    setMessages(history)
    setDraft("")
    try {
      window.localStorage.setItem(CHAT_KEY, JSON.stringify(history.slice(0, -1)))
    } catch {}
    send({ feature: "chat", messages: history })
  }

  const clear = () => {
    setMessages([])
    try {
      window.localStorage.removeItem(CHAT_KEY)
    } catch {}
  }

  return (
    <div className="flex h-full flex-col gap-4 px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <MessageCircle className="size-4" strokeWidth={2} />
          </span>
          <h2 className="font-serif text-2xl text-foreground">Study Chat</h2>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Trash2 className="size-3.5" />
            Clear history
          </button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex max-h-[340px] flex-1 flex-col gap-3 overflow-y-auto rounded-2xl border border-border bg-card/40 p-4"
      >
        {messages.length === 0 && !isStreaming && (
          <p className="m-auto text-center text-sm text-muted-foreground">
            Your neural co-pilot. Ask anything about what you're studying.
          </p>
        )}

        {messages.map((message, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed animate-in fade-in duration-300",
              message.role === "user"
                ? "self-end bg-primary text-primary-foreground"
                : "self-start border border-border bg-secondary/60 text-foreground/90",
            )}
          >
            {message.content}
          </div>
        ))}

        {isStreaming && text && (
          <div className="max-w-[85%] self-start whitespace-pre-wrap rounded-2xl border border-border bg-secondary/60 px-4 py-2.5 text-sm leading-relaxed text-foreground/90 animate-in fade-in duration-300">
            {text}
            <span className="ml-0.5 inline-block animate-pulse">▍</span>
          </div>
        )}
        {isStreaming && !text && (
          <div className="self-start rounded-2xl border border-border bg-secondary/60 px-4 py-2.5 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask your co-pilot…"
          className="flex-1 rounded-full border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/50"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="size-5" />
        </button>
      </form>
    </div>
  )
}