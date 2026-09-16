import { AI_FEATURES, type AiFeature, type ChatMessage } from "@/lib/openrouter"

export const runtime = "nodejs"
export const maxDuration = 60

const encoder = new TextEncoder()

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: "OpenRouter API key is not configured. Add OPENROUTER_API_KEY to your environment." },
      { status: 500 },
    )
  }

  let body: { feature?: AiFeature; messages?: ChatMessage[] }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 })
  }

  const { feature, messages } = body
  const config = feature ? AI_FEATURES[feature] : undefined
  const cleanMessages = Array.isArray(messages)
    ? messages.filter((m) => m && typeof m.content === "string" && m.content.trim().length > 0)
    : []

  if (!config || cleanMessages.length === 0) {
    return Response.json(
      { error: "A valid feature and a non-empty message history are required." },
      { status: 400 },
    )
  }

  const payload = {
    model: config.model,
    temperature: config.temperature,
    messages: [{ role: "system", content: config.system }, ...cleanMessages],
    stream: true,
  }

  let upstream: Response
  try {
    upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://github.com/devsurx/Synapse-Web",
        "X-Title": "Synapse",
      },
      body: JSON.stringify(payload),
    })
  } catch {
    return Response.json({ error: "Could not reach OpenRouter. Try again." }, { status: 502 })
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "")
    return Response.json(
      {
        error: `OpenRouter request failed (${upstream.status}).`,
        detail: detail.slice(0, 500),
      },
      { status: 502 },
    )
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""
          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith("data:")) continue
            const data = trimmed.slice(5).trim()
            if (data === "[DONE]") continue
            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta?.content
              if (typeof delta === "string" && delta.length > 0) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: delta })}\n\n`))
              }
            } catch {}
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
      } catch {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: "Stream interrupted. Please retry." })}\n\n`),
        )
      } finally {
        controller.close()
        reader.releaseLock()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}