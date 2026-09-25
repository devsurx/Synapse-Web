"use client"

export function loadString(key: string, fallback = ""): string {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ?? fallback
  } catch {
    return fallback
  }
}

export function saveString(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {}
}

export function removeKey(key: string) {
  try {
    window.localStorage.removeItem(key)
  } catch {}
}

export function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

// Shared keys so the planner tab and the account-sync logic stay in sync.
export const PLANNER_GOALS_KEY = "synapse:planner-goals"
export const PLANNER_BLOCKS_KEY = "synapse:planner-blocks"
