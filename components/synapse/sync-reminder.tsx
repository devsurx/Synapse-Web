"use client"

import { CloudUpload, X } from "lucide-react"
import { useState } from "react"
import { useAccount } from "@/hooks/use-account"
import { isAuthAvailable } from "@/lib/auth"
import { loadString, saveString } from "@/lib/tool-storage"
import { openAccountModal } from "./account-button"

const DISMISS_KEY = "synapse:sync-reminder-dismissed"

/**
 * Guest-only nudge: progress made signed out stays on this browser.
 * Hidden when sync isn't configured, when signed in, or after dismissal.
 */
export function SyncReminder() {
  const user = useAccount()
  const [dismissed, setDismissed] = useState(() => loadString(DISMISS_KEY) === "1")

  if (!isAuthAvailable() || user || dismissed) return null

  const dismiss = () => {
    setDismissed(true)
    saveString(DISMISS_KEY, "1")
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/[0.07] px-4 py-2.5 text-sm">
      <CloudUpload className="size-4 shrink-0 text-amber-300" strokeWidth={1.75} />
      <p className="min-w-0 flex-1 text-muted-foreground">
        You&apos;re browsing as a guest — progress only saves on this browser.{" "}
        <button
          type="button"
          onClick={openAccountModal}
          className="font-medium text-foreground underline decoration-amber-300/60 underline-offset-2 hover:decoration-amber-300"
        >
          Sign in to save it to your account
        </button>
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
