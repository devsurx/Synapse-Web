"use client"

import type { ViewId } from "./bottom-nav"
import { SquadTab } from "./squad"
import { ChatTab } from "./tools/chat-tab"
import { Eli5Tab } from "./tools/eli5-tab"
import { FeynmanTab } from "./tools/feynman-tab"
import { FlashcardsTab } from "./tools/flashcards-tab"
import { PlannerTab } from "./tools/planner-tab"

export function ToolView({ view }: { view: Exclude<ViewId, "focus"> }) {
  return (
    <>
      {view === "feynman" && <FeynmanTab />}
      {view === "eli5" && <Eli5Tab />}
      {view === "flashcards" && <FlashcardsTab />}
      {view === "chat" && <ChatTab />}
      {view === "planner" && <PlannerTab />}
      {view === "squad" && <SquadTab />}
    </>
  )
}