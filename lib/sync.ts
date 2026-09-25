"use client"

import { getSupabase } from "./supabase"
import { loadJSON, PLANNER_BLOCKS_KEY, saveJSON } from "./tool-storage"
import type { FocusBlock } from "@/components/synapse/tools/planner-tab"

const SUPABASE_USER_ID_KEY = "synapse:supabase-user-id"
const DEVICE_ID_KEY = "synapse:device-id"

export interface AdminUser {
  id: number
  name: string
  focus_minutes: number
  sessions: number
  created_at: string
}

export interface AdminBlock {
  id: number
  user_id: number
  title: string
  duration_minutes: number
  note: string
  created_at: string
  users?: { name: string } | { name: string }[] | null
}

function getDeviceId(): string {
  if (typeof window === "undefined") return "server"
  try {
    let id = window.localStorage.getItem(DEVICE_ID_KEY)
    if (!id) {
      id = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.floor(Math.random() * 1e9)}`
      window.localStorage.setItem(DEVICE_ID_KEY, id)
    }
    return id
  } catch {
    return "unknown-device"
  }
}

function getStoredSupabaseUserId(): number | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(SUPABASE_USER_ID_KEY)
    const n = raw ? Number(raw) : NaN
    return Number.isFinite(n) && n > 0 ? n : null
  } catch {
    return null
  }
}

function storeSupabaseUserId(id: number) {
  try {
    window.localStorage.setItem(SUPABASE_USER_ID_KEY, String(id))
  } catch {}
}

function readLocalName(): string {
  if (typeof window === "undefined") return "Learner"
  try {
    return window.localStorage.getItem("synapse:user-name")?.trim().slice(0, 24) || "Learner"
  } catch {
    return "Learner"
  }
}

function readLocalStats(): { sessions: number; focusMinutes: number } {
  if (typeof window === "undefined") return { sessions: 0, focusMinutes: 0 }
  try {
    const raw = window.localStorage.getItem("synapse:user-stats")
    if (!raw) return { sessions: 0, focusMinutes: 0 }
    const parsed = JSON.parse(raw)
    return {
      sessions: typeof parsed.sessions === "number" ? parsed.sessions : 0,
      focusMinutes: typeof parsed.focusMinutes === "number" ? parsed.focusMinutes : 0,
    }
  } catch {
    return { sessions: 0, focusMinutes: 0 }
  }
}

/**
 * Ensure this browser has a row in public.users so /admin can list it.
 * Fire-and-forget — never throws, never blocks the UI.
 */
export async function ensureSupabaseUser(): Promise<number | null> {
  const sb = getSupabase()
  if (!sb) return null
  try {
    const existing = getStoredSupabaseUserId()
    const name = readLocalName()
    const stats = readLocalStats()
    void getDeviceId()

    if (existing) {
      await sb
        .from("users")
        .update({ name, focus_minutes: stats.focusMinutes, sessions: stats.sessions })
        .eq("id", existing)
      return existing
    }

    const { data, error } = await sb
      .from("users")
      .insert({ name, focus_minutes: stats.focusMinutes, sessions: stats.sessions })
      .select("id")
      .single()
    if (error || !data) return null
    storeSupabaseUserId(data.id)
    return data.id
  } catch {
    return null
  }
}

/** Push local totals + one session row after a focus session completes. */
export async function syncSessionToSupabase(minutes: number): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  try {
    const userId = (await ensureSupabaseUser()) ?? getStoredSupabaseUserId()
    if (!userId) return
    const stats = readLocalStats()
    await sb
      .from("users")
      .update({
        name: readLocalName(),
        focus_minutes: stats.focusMinutes,
        sessions: stats.sessions,
      })
      .eq("id", userId)
    await sb.from("sessions_log").insert({ user_id: userId, minutes })
  } catch {
    // best-effort only
  }
}

/** Replace this user's remote planner blocks (requires planner_blocks table). */
export async function syncPlannerBlocks(blocks: FocusBlock[]): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  try {
    const userId = (await ensureSupabaseUser()) ?? getStoredSupabaseUserId()
    if (!userId) return
    const { error: delError } = await sb.from("planner_blocks").delete().eq("user_id", userId)
    if (delError) return // table probably doesn't exist yet — stay local-only
    if (blocks.length === 0) return
    const rows = blocks.slice(0, 8).map((b) => ({
      user_id: userId,
      title: String(b.title ?? "").slice(0, 120),
      duration_minutes: Number.isFinite(b.durationMinutes) ? Math.round(b.durationMinutes) : 25,
      note: String(b.note ?? "").slice(0, 500),
    }))
    await sb.from("planner_blocks").insert(rows)
  } catch {
    // best-effort only
  }
}

export async function fetchAdminData(): Promise<{ users: AdminUser[]; blocks: AdminBlock[] }> {
  const sb = getSupabase()
  if (!sb) return { users: [], blocks: [] }
  try {
    const [{ data: users }, { data: blocks }] = await Promise.all([
      sb.from("users").select("id,name,focus_minutes,sessions,created_at").order("created_at", { ascending: false }).limit(200),
      sb
        .from("planner_blocks")
        .select("id,user_id,title,duration_minutes,note,created_at,users(name)")
        .order("created_at", { ascending: false })
        .limit(500),
    ])
    return {
      users: (users ?? []) as AdminUser[],
      blocks: (blocks ?? []) as AdminBlock[],
    }
  } catch {
    return { users: [], blocks: [] }
  }
}

function readRawLocalName(): string | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem("synapse:user-name")?.trim()
    return raw ? raw.slice(0, 24) : null
  } catch {
    return null
  }
}

/**
 * Runs on sign-in: links this device's cloud row to the account (or finds
 * the row already owned by it), merges focus totals upward, pushes local
 * planner blocks (or pulls remote ones onto a fresh device), and adopts the
 * account's display name when this device has none. Best-effort, never throws.
 */
export async function claimAndSyncAccount(): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  try {
    const {
      data: { user },
    } = await sb.auth.getUser()
    if (!user) return

    let rowId: number | null = null
    let remote = { sessions: 0, focusMinutes: 0, name: "" }

    // 1. Row already owned by this account?
    const owned = await sb
      .from("users")
      .select("id,name,focus_minutes,sessions")
      .eq("auth_id", user.id)
      .maybeSingle()
    if (!owned.error && owned.data) {
      rowId = owned.data.id
      remote = {
        sessions: owned.data.sessions ?? 0,
        focusMinutes: owned.data.focus_minutes ?? 0,
        name: owned.data.name ?? "",
      }
    } else {
      // 2. Claim this device's anonymous row, or create an owned one.
      const deviceId = getStoredSupabaseUserId()
      if (deviceId) {
        const claimed = await sb
          .from("users")
          .update({ auth_id: user.id })
          .eq("id", deviceId)
          .is("auth_id", null)
          .select("id,name,focus_minutes,sessions")
          .maybeSingle()
        if (!claimed.error && claimed.data) {
          rowId = claimed.data.id
          remote = {
            sessions: claimed.data.sessions ?? 0,
            focusMinutes: claimed.data.focus_minutes ?? 0,
            name: claimed.data.name ?? "",
          }
        }
      }
      if (rowId === null) {
        const local = readLocalStats()
        const inserted = await sb
          .from("users")
          .insert({
            auth_id: user.id,
            name: readLocalName(),
            focus_minutes: local.focusMinutes,
            sessions: local.sessions,
          })
          .select("id")
          .single()
        if (!inserted.error && inserted.data) rowId = inserted.data.id
      }
    }
    if (rowId === null) return
    storeSupabaseUserId(rowId)

    // 3. Merge totals upward and push to the owned row.
    const local = readLocalStats()
    const mergedSessions = Math.max(local.sessions, remote.sessions)
    const mergedMinutes = Math.max(local.focusMinutes, remote.focusMinutes)
    const name = readRawLocalName() ?? (remote.name && remote.name !== "Learner" ? remote.name : readLocalName())
    await sb
      .from("users")
      .update({ name, focus_minutes: mergedMinutes, sessions: mergedSessions })
      .eq("id", rowId)

    // 4. Fresh device adopts the account's totals, name, and blocks.
    if (local.sessions === 0 && local.focusMinutes === 0 && (remote.sessions > 0 || remote.focusMinutes > 0)) {
      const { adoptRemoteTotals } = await import("./stats")
      adoptRemoteTotals(remote.sessions, remote.focusMinutes)
      if (!readRawLocalName() && remote.name && remote.name !== "Learner") {
        try {
          window.localStorage.setItem("synapse:user-name", remote.name)
        } catch {}
      }
      const { data: remoteBlocks } = await sb
        .from("planner_blocks")
        .select("title,duration_minutes,note")
        .eq("user_id", rowId)
        .order("created_at", { ascending: true })
      if (remoteBlocks && remoteBlocks.length > 0) {
        saveJSON(
          PLANNER_BLOCKS_KEY,
          remoteBlocks.map((b) => ({
            title: b.title,
            durationMinutes: b.duration_minutes ?? 25,
            note: b.note ?? "",
          })),
        )
      }
      return
    }

    // 5. Device has its own plan — push it up as the account's current plan.
    const localBlocks = loadJSON<FocusBlock[]>(PLANNER_BLOCKS_KEY, [])
    if (localBlocks.length > 0) {
      await syncPlannerBlocks(localBlocks)
    }
  } catch {
    // best-effort only
  }
}
