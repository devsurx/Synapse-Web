"use client"

import { Users } from "lucide-react"
import type { ViewId } from "./bottom-nav"
import { ChatTab } from "./tools/chat-tab"
import { Eli5Tab } from "./tools/eli5-tab"
import { FeynmanTab } from "./tools/feynman-tab"
import { FlashcardsTab } from "./tools/flashcards-tab"
import { PlannerTab } from "./tools/planner-tab"

function SquadPlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-border bg-secondary/60">
        <Users className="size-8 text-primary" strokeWidth={1.5} />
      </div>
      <h2 className="mt-6 font-serif text-4xl text-foreground">Squad</h2>
      <p className="mt-2 max-w-sm text-muted-foreground">Grow alongside your people.</p>
      <ul className="mt-8 flex w-full max-w-sm flex-col gap-3 text-left">
        {[
          "Share streaks and cheer each other on",
          "Join synced focus rooms",
          "Compare weekly progress",
        ].map((point) => (
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

export function ToolView({ view }: { view: Exclude<ViewId, "focus"> }) {
  return (
    <>
      {view === "feynman" && <FeynmanTab />}
      {view === "eli5" && <Eli5Tab />}
      {view === "flashcards" && <FlashcardsTab />}
      {view === "chat" && <ChatTab />}
      {view === "planner" && <PlannerTab />}
      {view === "squad" && <SquadPlaceholder />}
    </>
  )
}