"use client"

import { useState } from "react"
import { Header } from "./header"
import { BottomNav, type ViewId } from "./bottom-nav"
import { IntroCarousel } from "./intro-carousel"
import { NamePrompt } from "./name-prompt"
import { ToolView } from "./tool-view"
import { FocusTimer } from "./focus-timer"
import { FocusVisual } from "./focus-visual"
import { useFocusTimer } from "@/hooks/use-focus-timer"
import { getUserName, setUserName } from "@/lib/profile"

export function SynapseApp() {
  const [view, setView] = useState<ViewId>("focus")
  const [userName, setUserNameState] = useState<string | null>(() => getUserName())
  const timer = useFocusTimer()

  const handleName = (name: string) => {
    setUserName(name)
    setUserNameState(name)
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
      {!userName && <NamePrompt onSubmit={handleName} />}
      {userName && <IntroCarousel userName={userName} />}
      <Header />
      {view === "focus" ? (
        <div className="grid h-full min-h-[70vh] flex-1 items-center gap-6 lg:grid-cols-[1.1fr_1fr]">
          <FocusTimer
            mode={timer.mode}
            setMode={timer.setMode}
            secondsLeft={timer.secondsLeft}
            isRunning={timer.isRunning}
            todaySessions={timer.todaySessions}
            durations={timer.durations}
            updateDuration={timer.updateDuration}
            toggle={timer.toggle}
            reset={timer.reset}
          />
          <FocusVisual progress={timer.progress} isRunning={timer.isRunning} mode={timer.mode} />
        </div>
      ) : (
        <ToolView view={view} />
      )}
      <BottomNav active={view} onChange={setView} />
    </main>
  )
}
