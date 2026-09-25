"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import type { AdminBlock, AdminUser } from "@/lib/sync"
import { isSupabaseConfigured } from "@/lib/supabase"

interface LocalSnapshot {
  name: string
  sessions: number
  focusMinutes: number
  plannerGoals: string
  plannerBlocks: { title: string; durationMinutes: number; note: string }[]
  flashcards: { cards: { front: string; back: string }[] }[]
  feynmanCount: number
  eli5Concept: string
  eli5HasResult: boolean
}

function readLocalSnapshot(): LocalSnapshot {
  const empty: LocalSnapshot = {
    name: "",
    sessions: 0,
    focusMinutes: 0,
    plannerGoals: "",
    plannerBlocks: [],
    flashcards: [],
    feynmanCount: 0,
    eli5Concept: "",
    eli5HasResult: false,
  }
  if (typeof window === "undefined") return empty
  try {
    const get = (k: string) => window.localStorage.getItem(k)
    const parse = <T,>(raw: string | null, fb: T): T => {
      if (!raw) return fb
      try {
        return JSON.parse(raw) as T
      } catch {
        return fb
      }
    }
    const stats = parse<{ sessions?: number; focusMinutes?: number }>(get("synapse:user-stats"), {})
    return {
      name: get("synapse:user-name") ?? "",
      sessions: typeof stats.sessions === "number" ? stats.sessions : 0,
      focusMinutes: typeof stats.focusMinutes === "number" ? stats.focusMinutes : 0,
      plannerGoals: get("synapse:planner-goals") ?? "",
      plannerBlocks: parse(get("synapse:planner-blocks"), []),
      flashcards: parse(get("synapse:flashcards"), []),
      feynmanCount: parse<unknown[]>(get("synapse:feynman-history"), []).length,
      eli5Concept: get("synapse:eli5-concept") ?? "",
      eli5HasResult: Boolean(get("synapse:eli5-result")),
    }
  } catch {
    return empty
  }
}

function blockOwner(b: AdminBlock): string {
  const u = b.users
  if (!u) return `user #${b.user_id}`
  if (Array.isArray(u)) return u[0]?.name ?? `user #${b.user_id}`
  return u.name ?? `user #${b.user_id}`
}

export function AdminDashboard() {
  const [local, setLocal] = useState<LocalSnapshot | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [blocks, setBlocks] = useState<AdminBlock[]>([])
  const [loading, setLoading] = useState(false)
  const [limited, setLimited] = useState(false)
  const [remoteError, setRemoteError] = useState<string | null>(null)
  const supabaseOn = isSupabaseConfigured()

  const refresh = useCallback(async () => {
    setLocal(readLocalSnapshot())
    if (!isSupabaseConfigured()) {
      setUsers([])
      setBlocks([])
      return
    }
    setLoading(true)
    setRemoteError(null)
    try {
      // Server route: full view with the service-role key, RLS-limited without it.
      const res = await fetch("/api/admin/data")
      const data = (await res.json().catch(() => null)) as {
        users?: AdminUser[]
        blocks?: AdminBlock[]
        limited?: boolean
        reason?: string
        error?: string
      } | null
      if (!res.ok || !data) {
        setRemoteError(data?.error ?? "Could not load remote data.")
        return
      }
      setUsers(data.users ?? [])
      setBlocks(data.blocks ?? [])
      setLimited(Boolean(data.limited))
      if (data.limited && data.reason) setRemoteError(data.reason)
    } catch {
      setRemoteError("Could not reach the server.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const exportJson = () => {
    try {
      const payload = { exportedAt: new Date().toISOString(), local, remoteUsers: users, remoteBlocks: blocks }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "synapse-admin-export.json"
      a.click()
      URL.revokeObjectURL(url)
    } catch {}
  }

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
    } catch {}
    window.location.reload()
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl">Admin — user data</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {supabaseOn
              ? "Supabase connected — showing every synced user below, plus this device."
              : "Supabase not configured — showing this device only. Set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY and run supabase/schema.sql to see all devices."}
          </p>
          {limited && supabaseOn && (
            <p className="mt-1 text-xs text-amber-500">
              Limited view: signed-in users&apos; rows are hidden. Add SUPABASE_SERVICE_ROLE_KEY on the server for the
              full picture.
            </p>
          )}
          {remoteError && !limited && <p className="mt-1 text-xs text-destructive">{remoteError}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button
            type="button"
            onClick={exportJson}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Lock
          </button>
          <Link href="/" className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
            ← App
          </Link>
        </div>
      </div>

      {/* This device */}
      <section className="rounded-2xl border border-border bg-card/50 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">This device</h2>
        {!local ? (
          <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-lg font-medium">{local.name || "— (no name set yet)"}</p>
              <p className="mt-2 text-xs text-muted-foreground">Focus</p>
              <p className="text-sm">
                {local.sessions} sessions · {local.focusMinutes} min
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Planner goals</p>
              <p className="line-clamp-4 text-sm">{local.plannerGoals || "—"}</p>
              <p className="mt-2 text-xs text-muted-foreground">Flashcards / Feynman / ELI5</p>
              <p className="text-sm">
                {local.flashcards.length} decks · {local.feynmanCount} critiques ·{" "}
                {local.eli5HasResult ? `ELI5: ${local.eli5Concept || "saved"}` : "no ELI5 saved"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Focus blocks ({local.plannerBlocks.length})</p>
              {local.plannerBlocks.length === 0 ? (
                <p className="mt-1 text-sm text-muted-foreground">No saved blocks on this device.</p>
              ) : (
                <ul className="mt-2 flex flex-col gap-2">
                  {local.plannerBlocks.map((b, i) => (
                    <li key={i} className="rounded-xl border border-border bg-secondary/30 px-3 py-2 text-sm">
                      <span className="font-medium">{b.title}</span>{" "}
                      <span className="text-muted-foreground">· {b.durationMinutes}m</span>
                      {b.note && <span className="block text-xs text-muted-foreground">{b.note}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      {/* All users (Supabase) */}
      <section className="rounded-2xl border border-border bg-card/50 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          All users {users.length > 0 && `(${users.length})`}
        </h2>
        {!supabaseOn ? (
          <p className="mt-2 text-sm text-muted-foreground">Connect Supabase to list every user.</p>
        ) : users.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No users synced yet. Open the app on a device (set a name / complete a session) and refresh.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Sessions</th>
                  <th className="pb-2 pr-4">Focus min</th>
                  <th className="pb-2 pr-4">ID</th>
                  <th className="pb-2">First seen</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-border">
                    <td className="py-2 pr-4 font-medium">{u.name}</td>
                    <td className="py-2 pr-4">{u.sessions}</td>
                    <td className="py-2 pr-4">{u.focus_minutes}</td>
                    <td className="py-2 pr-4 text-muted-foreground">#{u.id}</td>
                    <td className="py-2 text-muted-foreground">{new Date(u.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* All focus blocks (Supabase) */}
      <section className="rounded-2xl border border-border bg-card/50 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          All focus blocks {blocks.length > 0 && `(${blocks.length})`}
        </h2>
        {!supabaseOn ? (
          <p className="mt-2 text-sm text-muted-foreground">Connect Supabase to list blocks across devices.</p>
        ) : blocks.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No blocks synced yet. If you just added the planner_blocks table, re-save a plan in the app.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th className="pb-2 pr-4">User</th>
                  <th className="pb-2 pr-4">Title</th>
                  <th className="pb-2 pr-4">Duration</th>
                  <th className="pb-2 pr-4">Note</th>
                  <th className="pb-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((b) => (
                  <tr key={b.id} className="border-t border-border align-top">
                    <td className="py-2 pr-4 font-medium">{blockOwner(b)}</td>
                    <td className="py-2 pr-4">{b.title}</td>
                    <td className="py-2 pr-4">{b.duration_minutes}m</td>
                    <td className="max-w-xs py-2 pr-4 text-muted-foreground">{b.note || "—"}</td>
                    <td className="py-2 text-muted-foreground">{new Date(b.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
