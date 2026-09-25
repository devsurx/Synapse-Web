"use client"

import { useEffect, useState } from "react"
import { Header } from "./header"
import { BottomNav, type ViewId } from "./bottom-nav"
import { IntroCarousel } from "./intro-carousel"
import { NamePrompt } from "./name-prompt"
import { AppLoadingScreen, SplashScreen, WelcomeScreen } from "./splash-screen"
import { ToolView } from "./tool-view"
import { FocusTimer } from "./focus-timer"
import { FocusStats } from "./focus-stats"
import { useFocusTimer } from "@/hooks/use-focus-timer"
import { useTabVisible } from "@/hooks/use-tab-visible"
import { useAmbientRain } from "@/hooks/use-ambient-rain"
import { AppPromoPopup } from "./app-promo"
import { SyncReminder } from "./sync-reminder"
import { getUserName, setUserName } from "@/lib/profile"
import { cn } from "@/lib/utils"

type Phase = "splash" | "name" | "welcome" | "intro" | "loading" | "ready"

const INTRO_KEY = "synapse:intro-seen"
/** Sticky per-device switch: when set, this device replays onboarding every launch. */
const REPLAY_KEY = "synapse:replay-tour"

/**
 * Dev-only bypass: append ?tour=1 (or ?intro=1 / ?preview=1) to the URL to
 * replay the full onboarding (welcome + intro) even after it was seen.
 */
function isTourPreview(): boolean {
  if (typeof window === "undefined") return false
  try {
    const q = new URLSearchParams(window.location.search)
    if (q.has("tour") || q.has("intro") || q.has("preview")) return true
    // Sticky replay enabled earlier via ?replay=1 on this device.
    return window.localStorage.getItem(REPLAY_KEY) === "1"
  } catch {
    return false
  }
}

function hasSeenIntro(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(INTRO_KEY) === "1"
  } catch {
    return false
  }
}

export function SynapseApp() {
  const [view, setView] = useState<ViewId>("focus")
  const [userName, setUserNameState] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>("splash")
  const timer = useFocusTimer()
  const storm = useAmbientRain()
  // Pause all CSS animations while the tab runs in the background.
  useTabVisible()

  useEffect(() => {
    setUserNameState(getUserName())
    // ?replay=1 pins full-onboarding replay to this device (persists across
    // launches); ?replay=0 removes the pin again.
    try {
      const q = new URLSearchParams(window.location.search)
      if (q.get("replay") === "1") window.localStorage.setItem(REPLAY_KEY, "1")
      else if (q.get("replay") === "0") window.localStorage.removeItem(REPLAY_KEY)
    } catch {}
  }, [])

  const handleSplashDone = () => {
    // Dev preview bypasses the seen-flag so you can always replay the tour.
    if (isTourPreview()) {
      setPhase(getUserName() ? "welcome" : "name")
      return
    }
    // Brand-new users: name -> welcome -> intro. Returning users go
    // straight to a quick loader, skipping welcome + intro entirely.
    if (!getUserName()) {
      setPhase("name")
      return
    }
    setPhase(hasSeenIntro() ? "loading" : "welcome")
  }

  const handleName = (name: string) => {
    setUserName(name)
    setUserNameState(name)
    setPhase("welcome")
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:gap-6 sm:px-8 sm:py-8">
      {/* Opaque base layer while onboarding: covers the home screen during
          the gaps when one overlay has unmounted and the next is fading in,
          so the app chrome never flashes in between. Stays mounted with a
          fade so the final reveal of the app eases out smoothly. */}
      <div
        aria-hidden
        className={cn(
          "fixed inset-0 z-30 bg-background transition-opacity duration-700 ease-out",
          phase !== "ready" ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      {phase === "splash" && <SplashScreen onDone={handleSplashDone} />}
      {phase === "name" && <NamePrompt onSubmit={handleName} />}
      {phase === "welcome" && userName && (
        <WelcomeScreen userName={userName} onContinue={() => setPhase("intro")} />
      )}
      {phase === "intro" && userName && (
        <IntroCarousel
          userName={userName}
          onDone={() => setPhase("loading")}
          stormEnabled={storm.enabled}
          onStormChange={storm.setStorm}
        />
      )}
      {phase === "loading" && <AppLoadingScreen onDone={() => setPhase("ready")} />}
      <Header stormEnabled={storm.enabled} onStormToggle={storm.toggle} stormFlash={storm.flash} />
      {phase === "ready" && <SyncReminder />}
      {/* flex-1 pushes the nav to the viewport bottom on short tabs. */}
      <div className="flex flex-1 flex-col">
        {view === "focus" ? (
        <div className="grid h-full min-h-[60vh] flex-1 items-center gap-2 sm:min-h-[70vh] sm:gap-6 lg:grid-cols-[1.1fr_1fr]">
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
            <FocusStats />
        </div>
        ) : (
          <ToolView view={view} />
        )}
      </div>
      <BottomNav active={view} onChange={setView} />
      {phase === "ready" && <AppPromoPopup />}
    </main>
  )
}
