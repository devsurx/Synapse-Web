"use client"

import type { ViewId } from "./bottom-nav"
import { cn } from "@/lib/utils"
import { Eli5Tab } from "./tools/eli5-tab"
import { FeynmanTab } from "./tools/feynman-tab"
import { FlashcardsTab } from "./tools/flashcards-tab"
import { PlannerTab } from "./tools/planner-tab"

type ToolId = Exclude<ViewId, "focus">

const TABS: { id: ToolId; El: () => React.JSX.Element }[] = [
  { id: "feynman", El: FeynmanTab },
  { id: "eli5", El: Eli5Tab },
  { id: "flashcards", El: FlashcardsTab },
  { id: "planner", El: PlannerTab },
]

/**
 * All tool tabs stay mounted — inactive ones are hidden with CSS instead of
 * unmounted, so drafts, results, and in-flight streams survive tab switches.
 * `contents` keeps the active tab's layout exactly as if the wrapper wasn't there.
 */
export function ToolView({ view }: { view: ToolId }) {
  return (
    <>
      {TABS.map(({ id, El }) => (
        <div key={id} className={cn(view === id ? "contents" : "hidden")}>
          <El />
        </div>
      ))}
    </>
  )
}
