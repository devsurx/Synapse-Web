"use client"

import { getSupabase } from "./supabase"
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
