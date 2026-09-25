"use client"

import { useState } from "react"

export function AdminLock({ notConfigured }: { notConfigured: boolean }) {
  const [keyInput, setKeyInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const unlock = async () => {
    if (!keyInput || busy) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: keyInput }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        setError(data?.error ?? "Wrong key.")
        return
      }
      window.location.reload()
    } catch {
      setError("Could not reach the server.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-4 px-6">
      <h1 className="font-serif text-3xl">Admin</h1>
      {notConfigured ? (
        <p className="text-sm text-muted-foreground">
          This area is locked, but no <code className="rounded bg-secondary px-1">ADMIN_KEY</code> is set on the
          server. Add it to the environment and redeploy to enable access.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">Enter the admin key to continue.</p>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void unlock()
            }}
            placeholder="Admin key"
            autoFocus
            className="rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:border-accent/50"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="button"
            onClick={() => void unlock()}
            disabled={busy || keyInput.length === 0}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            {busy ? "Checking…" : "Unlock"}
          </button>
        </>
      )}
      <a href="/" className="text-sm text-muted-foreground underline">
        ← Back to app
      </a>
    </main>
  )
}
