const PROFILE_KEY = "synapse:user-name"

export function getUserName(): string | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    const trimmed = raw.trim().slice(0, 24)
    return trimmed.length > 0 ? trimmed : null
  } catch {
    return null
  }
}

export function setUserName(name: string): string {
  const clean = name.trim().slice(0, 24)
  try {
    window.localStorage.setItem(PROFILE_KEY, clean)
  } catch {}
  // Best-effort cloud mirror so /admin can list this user when Supabase is set.
  try {
    void import("./sync").then((m) => m.ensureSupabaseUser())
  } catch {}
  return clean
}