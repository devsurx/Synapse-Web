"use client"

import { useState } from "react"
import { useFocusTimer } from "@/hooks/use-focus-timer"
import { BottomNav, type ViewId } from "./bottom-nav"
import { FocusTimer } from "./focus-timer"
import { FocusVisual } from "./focus-visual"
import { Header } from "./header"
import { StreakBar } from "./streak-bar"
import { ToolView } from "./tool-view"

export function SynapseApp() {
  const [view, setView] = useState<ViewId>("focus")
  const timer = useFocusTimer()

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
      <Header />

      <div className="grid flex-1 gap-4 lg:grid-cols-2">
        {/* left: growth visual */}
        <section className="min-h-[320px] rounded-3xl border border-border bg-card/40 lg:min-h-0">
          <FocusVisual
            progress={timer.progress}
            isRunning={timer.isRunning}
            mode={timer.mode}
          />
        </section>

        {/* right: timer or selected tool */}
        <section className="min-h-[420px] rounded-3xl border border-border bg-card/40 lg:min-h-0">
          {view === "focus" ? (
            <FocusTimer
              mode={timer.mode}
              setMode={timer.setMode}
              secondsLeft={timer.secondsLeft}
              isRunning={timer.isRunning}
              sessions={timer.sessions}
              toggle={timer.toggle}
              reset={timer.reset}
            />
          ) : (
            <ToolView view={view} />
          )}
        </section>
      </div>

      <StreakBar />

      <BottomNav active={view} onChange={setView} />
    </main>
  )
}
