"use client"

const STATS_KEY = "synapse:user-stats"

export interface DayRecord {
  sessions: number
  minutes: number
}

export interface UserStats {
  sessions: number
  focusMinutes: number
  days: Record<string, DayRecord>
}

function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

function empty(): UserStats {
  return { sessions: 0, focusMinutes: 0, days: {} }
}

function load(): UserStats {
  if (typeof window === "undefined") return empty()
  try {
    const raw = window.localStorage.getItem(STATS_KEY)
    if (!raw) return empty()
    const parsed = JSON.parse(raw)
    if (typeof parsed?.sessions !== "number") return empty()
    return { ...empty(), ...parsed }
  } catch {
    return empty()
  }
}

function save(stats: UserStats) {
  try {
    window.localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch {}
  listeners.forEach((fn) => fn(stats))
}

let cached: UserStats | null = null
const listeners = new Set<(s: UserStats) => void>()

function getStats(): UserStats {
  if (!cached) cached = load()
  return cached
}

export function subscribeStats(fn: (s: UserStats) => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function readStats(): UserStats {
  return getStats()
}

export function recordSession(minutes: number) {
  const stats = getStats()
  const key = todayKey()
  const day = stats.days[key] ?? { sessions: 0, minutes: 0 }
  day.sessions += 1
  day.minutes += minutes
  stats.sessions += 1
  stats.focusMinutes += minutes
  stats.days[key] = day
  cached = stats
  save(stats)
  // Best-effort cloud mirror so /admin can list this user when Supabase is set.
  try {
    void import("./sync").then((m) => m.syncSessionToSupabase(minutes))
  } catch {}
}

export function getDayCounts(count: number): { date: string; sessions: number; minutes: number }[] {
  const stats = getStats()
  const result: { date: string; sessions: number; minutes: number }[] = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = todayKey(d)
    const day = stats.days[key] ?? { sessions: 0, minutes: 0 }
    result.push({ date: key, sessions: day.sessions, minutes: day.minutes })
  }
  return result
}

export function getStreak(): number {
  const days = getDayCounts(30)
  let streak = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].sessions > 0) {
      streak += 1
    } else if (i === days.length - 1) {
      continue
    } else {
      break
    }
  }
  return streak
}
