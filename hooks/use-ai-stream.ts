"use client"

import { useCallback, useRef, useState } from "react"
import type { AiFeature, ChatMessage } from "@/lib/openrouter"

type StreamState = "idle" | "streaming" | "error"

interface UseAiStreamOptions {
  onComplete?: (text: string) => void
}

export interface AiPayload {
  feature: AiFeature
  messages: ChatMessage[]
}

export function useAiStream({ onComplete }: UseAiStreamOptions = {}) {
  const [text, setText] = useState("")
  const [state, setState] = useState<StreamState>("idle")
  const [error, setError] = useState<string | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const send = useCallback(async (payload: AiPayload) => {
    setState("streaming")
    setError(null)
    setText("")

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || `Request failed (${res.status})`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let full = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split("\n\n")
        buffer = events.pop() || ""
        for (const event of events) {
          for (const line of event.split("\n")) {
            if (!line.startsWith("data:")) continue
            const data = line.slice(5).trim()
            if (data === "[DONE]") continue
            try {
              const json = JSON.parse(data)
              if (typeof json.text === "string") {
                full += json.text
                setText(full)
              }
              if (json.error) {
                setError(json.error)
              }
            } catch {}
          }
        }
      }

      setText(full)
      onCompleteRef.current?.(full)
      setState("idle")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setState("error")
    }
  }, [])

  const reset = useCallback(() => {
    setText("")
    setError(null)
    setState("idle")
  }, [])

  return { text, state, error, isStreaming: state === "streaming", send, reset }
}