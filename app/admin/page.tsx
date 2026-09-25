"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { fetchAdminData, type AdminBlock, type AdminUser } from "@/lib/sync"
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

const REQUIRED_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY ?? ""
const UNLOCK_SESSION_KEY = "synapse:admin-unlocked"

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

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(() => {
    if (!REQUIRED_KEY) return true
    if (typeof window === "undefined") return false
    try {
      return window.sessionStorage.getItem(UNLOCK_SESSION_KEY) === "1"
    } catch {
      return false
    }
  })
  const [keyInput, setKeyInput] = useState("")
  const [keyError, setKeyError] = useState(false)
  const [local, setLocal] = useState<LocalSnapshot | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [blocks, setBlocks] = useState<AdminBlock[]>([])
  const [loading, setLoading] = useState(false)
  const supabaseOn = isSupabaseConfigured()

  const refresh = useCallback(async () => {
    setLocal(readLocalSnapshot())
    if (!isSupabaseConfigured()) {
      setUsers([])
      setBlocks([])
      return
    }
    setLoading(true)
    try {
      const data = await fetchAdminData()
      setUsers(data.users)
      setBlocks(data.blocks)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (unlocked) void refresh()
  }, [unlocked, refresh])

  const unlock = () => {
    if (keyInput === REQUIRED_KEY) {
      setUnlocked(true)
      setKeyError(false)
      try {
        window.sessionStorage.setItem(UNLOCK_SESSION_KEY, "1")
      } catch {}
    } else {
      setKeyError(true)
    }
  }

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

  if (!unlocked) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-4 px-6">
        <h1 className="font-serif text-3xl">Admin</h1>
        <p className="text-sm text-muted-foreground">Enter the admin key to continue.</p>
        <input
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") unlock()
          }}
          placeholder="Admin key"
          className="rounded-xl border border-border bg-secondary/40 px-4 py-2.5 text-sm outline-none focus:border-accent/50"
        />
        {keyError && <p className="text-sm text-destructive">Wrong key.</p>}
        <button
          type="button"
          onClick={unlock}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
        >
          Unlock
        </button>
        <Link href="/" className="text-sm text-muted-foreground underline">
          ← Back to app
        </Link>
      </main>
    )
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
