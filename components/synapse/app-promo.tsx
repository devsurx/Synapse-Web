"use client"

import { Download, Smartphone, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useIsMobileDevice } from "@/hooks/use-is-mobile"

export const APP_RELEASE_URL = "https://github.com/devsurx/Synapse/releases/tag/v0.5"

const DISMISS_KEY = "synapse:app-promo-dismissed"

function isDismissed(): boolean {
  if (typeof window === "undefined") return true
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "1"
  } catch {
    return true
  }
}

function dismiss() {
  try {
    window.localStorage.setItem(DISMISS_KEY, "1")
  } catch {}
}

/**
 * One-time popup inviting the user to download the mobile app.
 * Render only once the main app is ready; stays hidden forever after dismiss.
 */
export function AppPromoPopup() {
  const isMobile = useIsMobileDevice()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isDismissed()) return
    const t = setTimeout(() => setVisible(true), 1500)
    return () => clearTimeout(t)
  }, [])

  if (!isMobile || !visible) return null

  const close = () => {
    setVisible(false)
    dismiss()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Download the mobile app"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div className="relative flex w-full max-w-sm flex-col items-center rounded-3xl border border-border bg-card p-6 text-center shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300">
        <button
          type="button"
          onClick={close}
          aria-label="Dismiss"
          className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="size-4" />
        </button>
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-accent/15">
          <Smartphone className="size-8 text-accent" strokeWidth={1.5} />
        </div>
        <h2 className="font-serif text-2xl text-foreground">Take Synapse anywhere</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Get the mobile app for focus on the go — same timer, same garden, in your pocket.
        </p>
        <a
          href={APP_RELEASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
        >
          <Download className="size-4" />
          Download the app
        </a>
        <p className="mt-3 text-xs text-muted-foreground/70">Android only · v0.5 · free via GitHub Releases</p>
        <button
          type="button"
          onClick={close}
          className="mt-2 text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
