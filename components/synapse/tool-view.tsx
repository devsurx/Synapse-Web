import { BookOpen, Brain, Layers, MessageCircle, Sprout, Users } from "lucide-react"
import type { ViewId } from "./bottom-nav"

interface ToolConfig {
  icon: typeof Brain
  title: string
  tagline: string
  points: string[]
}

const TOOLS: Record<Exclude<ViewId, "focus">, ToolConfig> = {
  feynman: {
    icon: Brain,
    title: "Feynman Mode",
    tagline: "Teach it back to truly learn it.",
    points: [
      "Explain a concept in plain language",
      "Synapse flags the gaps in your reasoning",
      "Refine until it clicks",
    ],
  },
  eli5: {
    icon: Sprout,
    title: "Explain Like I'm 5",
    tagline: "Break hard ideas into simple seeds.",
    points: [
      "Turn dense topics into everyday analogies",
      "Build intuition before the details",
      "Great for a quick warm-up",
    ],
  },
  flashcards: {
    icon: Layers,
    title: "Flashcards",
    tagline: "Spaced repetition that sticks.",
    points: [
      "Auto-generate cards from your notes",
      "Review only what you're about to forget",
      "Track recall strength over time",
    ],
  },
  chat: {
    icon: MessageCircle,
    title: "Study Chat",
    tagline: "A tutor that never sleeps.",
    points: [
      "Ask follow-up questions in context",
      "Get worked solutions step by step",
      "Save answers straight to your deck",
    ],
  },
  planner: {
    icon: BookOpen,
    title: "Planner",
    tagline: "Turn goals into focused sessions.",
    points: [
      "Map deadlines to daily study blocks",
      "Balance subjects automatically",
      "See your week at a glance",
    ],
  },
  squad: {
    icon: Users,
    title: "Squad",
    tagline: "Grow alongside your people.",
    points: [
      "Share streaks and cheer each other on",
      "Join synced focus rooms",
      "Compare weekly progress",
    ],
  },
}

export function ToolView({ view }: { view: Exclude<ViewId, "focus"> }) {
  const tool = TOOLS[view]
  const Icon = tool.icon
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-secondary/60">
        <Icon className="size-8 text-primary" strokeWidth={1.5} />
      </div>
      <h2 className="mt-6 font-serif text-4xl text-foreground">{tool.title}</h2>
      <p className="mt-2 max-w-sm text-muted-foreground">{tool.tagline}</p>
      <ul className="mt-8 flex w-full max-w-sm flex-col gap-3 text-left">
        {tool.points.map((point) => (
          <li
            key={point}
            className="flex items-center gap-3 rounded-xl border border-border bg-card/50 px-4 py-3 text-sm text-foreground/90"
          >
            <span className="size-1.5 shrink-0 rounded-full bg-accent" />
            {point}
          </li>
        ))}
      </ul>
      <span className="mt-8 rounded-full bg-secondary px-4 py-1.5 text-xs uppercase tracking-widest text-muted-foreground">
        Coming soon
      </span>
    </div>
  )
}
