"use client"

import { LogOut, UserRound, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useAccount } from "@/hooks/use-account"
import { isAuthAvailable, signIn, signOut, signUp } from "@/lib/auth"
import { cn } from "@/lib/utils"

type Mode = "signin" | "signup"

export const OPEN_ACCOUNT_EVENT = "synapse:open-account"

/** Lets other components (e.g. the guest sync reminder) open the modal. */
export function openAccountModal() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(OPEN_ACCOUNT_EVENT))
}

export function AccountButton() {
  const user = useAccount()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const open = () => {
      setError(null)
      setNotice(null)
      setOpen(true)
    }
    window.addEventListener(OPEN_ACCOUNT_EVENT, open)
    return () => window.removeEventListener(OPEN_ACCOUNT_EVENT, open)
  }, [])

  if (!isAuthAvailable()) return null

  const submit = async () => {
    if (!email.trim() || password.length < 6 || busy) return
    setBusy(true)
    setError(null)
    setNotice(null)
    const result = mode === "signin" ? await signIn(email.trim(), password) : await signUp(email.trim(), password)
    setBusy(false)
    if (result.error) {
      setError(result.error)
      return
    }
    if (result.confirmationPending) {
      setNotice("Account created — check your inbox for the confirmation link, then sign in.")
      setMode("signin")
      return
    }
    // Signed in: the account hook picks up the session and syncs.
    setOpen(false)
    setEmail("")
    setPassword("")
  }

  const handleSignOut = async () => {
    await signOut()
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null)
          setNotice(null)
          setOpen(true)
        }}
        title={user ? `Signed in as ${user.email} — progress syncs across devices` : "Sign in to sync progress across devices"}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors sm:px-4",
          user
            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
            : "border-border bg-card/60 text-muted-foreground hover:text-foreground",
        )}
      >
        <UserRound className="size-4" strokeWidth={1.75} />
        <span className="hidden max-w-32 truncate sm:inline">
          {user ? (user.email ?? "Account") : "Sign in"}
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Account"
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl">Account</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {user ? (
              <div className="mt-4 flex flex-col gap-3">
                <p className="text-sm">
                  Signed in as <span className="font-medium">{user.email}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Your name, focus totals, and planner blocks sync to this account and follow you across devices.
                </p>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex gap-1 rounded-full border border-border p-1 text-sm">
                  {(["signin", "signup"] as Mode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMode(m)
                        setError(null)
                        setNotice(null)
                      }}
                      className={cn(
                        "flex-1 rounded-full px-3 py-1.5 transition-colors",
                        mode === m ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {m === "signin" ? "Sign in" : "Create account"}
                    </button>
                  ))}
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void submit()
                  }}
                  placeholder="aishwarya@gmail.com"
                  autoComplete="email"
                  className="rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-accent/50"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void submit()
                  }}
                  placeholder="Password (min 6 characters)"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  className="rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-accent/50"
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
                <button
                  type="button"
                  onClick={() => void submit()}
                  disabled={busy || !email.trim() || password.length < 6}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
                >
                  {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
                </button>
                <p className="text-xs text-muted-foreground">
                  Signing in links this device to your account. Guests can keep using the app without an account.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
