"use client"

import { useEffect } from "react"

/**
 * Freezes all CSS animations while the tab is hidden so background tabs
 * cost as little CPU/GPU/RAM as possible.
 *
 * Paired with the `html[data-tab-hidden="true"] * { animation-play-state:
 * paused }` rule in globals.css. Visual-only: audio (rain rumble) keeps
 * playing and the focus timer keeps counting via its 1s interval.
 */
export function useTabVisible() {
  useEffect(() => {
    if (typeof document === "undefined") return
    const root = document.documentElement
    const sync = () => {
      if (document.hidden) {
        root.dataset.tabHidden = "true"
      } else {
        delete root.dataset.tabHidden
      }
    }
    sync()
    document.addEventListener("visibilitychange", sync)
    window.addEventListener("pagehide", sync)
    window.addEventListener("pageshow", sync)
    return () => {
      document.removeEventListener("visibilitychange", sync)
      window.removeEventListener("pagehide", sync)
      window.removeEventListener("pageshow", sync)
      delete root.dataset.tabHidden
    }
  }, [])
}
