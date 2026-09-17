"use client"

import { BookOpen, Brain, Layers, Sprout, Timer } from "lucide-react"
import { cn } from "@/lib/utils"

export type ViewId = "focus" | "feynman" | "eli5" | "flashcards" | "planner"

export const NAV_ITEMS: { id: ViewId; label: string; icon: typeof Brain }[] = [
  { id: "focus", label: "Focus", icon: Timer },
  { id: "feynman", label: "Feynman", icon: Brain },
  { id: "eli5", label: "ELI5", icon: Sprout },
  { id: "flashcards", label: "Flashcards", icon: Layers },
  { id: "planner", label: "Planner", icon: BookOpen },
]

interface BottomNavProps {
  active: ViewId
  onChange: (view: ViewId) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      aria-label="Learning tools"
      className="no-scrollbar sticky bottom-4 z-20 mx-auto flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-card/70 p-1.5 backdrop-blur"
    >
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex shrink-0 flex-col items-center gap-1 rounded-full px-3 py-2 text-xs font-medium transition-colors sm:px-4",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon
              className={cn("size-5", isActive && "text-primary")}
              strokeWidth={1.75}
            />
            {label}
          </button>
        )
      })}
    </nav>
  )
}
