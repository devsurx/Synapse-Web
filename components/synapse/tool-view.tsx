"use client"

import type { ViewId } from "./bottom-nav"
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
      {view === "planner" && <PlannerTab />}
    </>
  )
}