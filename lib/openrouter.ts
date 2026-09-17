export type AiFeature = "feynman" | "eli5" | "flashcards" | "planner"

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

// Free-only routing: openrouter/free picks a random free model per request,
// so usage can never cost anything. (Free tier: 50 req/day per account,
// 1,000/day once $10+ lifetime credits are purchased — free models stay $0.)
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || "openrouter/free"

export const AI_FEATURES: Record<
  AiFeature,
  { model: string; system: string; temperature: number }
> = {
  feynman: {
    model: process.env.OPENROUTER_MODEL_FEYNMAN || DEFAULT_MODEL,
    system:
      "You are Synapse's Feynman grader. Apply the Feynman technique: the user explains a concept in plain language and you critique it. Identify gaps, overclaims, and weak spots. Quote the questionable claims, explain why they are incomplete, and end with 3 probing follow-up questions the user should answer next. Keep the response structured and calm.",
    temperature: 0.4,
  },
  eli5: {
    model: process.env.OPENROUTER_MODEL_ELI5 || DEFAULT_MODEL,
    system:
      "You are Synapse's ELI5 teacher. Break complex concepts into simple, everyday analogies an intelligent 10-year-old could grasp. Start with a one-sentence summary, give a story-like analogy, then list 3 key takeaways. Keep it friendly and concrete.",
    temperature: 0.6,
  },
  flashcards: {
    model: process.env.OPENROUTER_MODEL_FLASHCARDS || DEFAULT_MODEL,
    system:
      "You convert study material into spaced-repetition flashcards. Return ONLY a JSON array of objects with exactly two fields, front and back. Front is a concise question or prompt; back is a short high-signal answer. Prefer atomic cards. Do not wrap in markdown fences and do not add any text outside the array.",
    temperature: 0.3,
  },
  planner: {
    model: process.env.OPENROUTER_MODEL_PLANNER || DEFAULT_MODEL,
    system:
      "You are Synapse's focus planner. Based on the user's goals and constraints, propose a realistic set of focus sessions for the day. Return ONLY a JSON array of objects with exactly three fields: title (string), durationMinutes (number between 15 and 120), and note (string, one sentence of advice). Do not wrap in markdown fences and do not add text outside the array.",
    temperature: 0.5,
  },
}