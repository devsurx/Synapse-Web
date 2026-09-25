"use client"

import type { Session, User } from "@supabase/supabase-js"
import { getSupabase, isSupabaseConfigured } from "./supabase"

export type { User }

export function isAuthAvailable(): boolean {
  return isSupabaseConfigured()
}

export async function getSessionUser(): Promise<User | null> {
  const sb = getSupabase()
  if (!sb) return null
  try {
    const { data } = await sb.auth.getSession()
    return data.session?.user ?? null
  } catch {
    return null
  }
}

export interface AuthResult {
  user: User | null
  /** True when the account was created but email confirmation is still pending. */
  confirmationPending: boolean
  error: string | null
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  const sb = getSupabase()
  if (!sb) return { user: null, confirmationPending: false, error: "Sync is not configured." }
  try {
    const { data, error } = await sb.auth.signUp({ email, password })
    if (error) return { user: null, confirmationPending: false, error: error.message }
    // No session + a user object means "confirm your email" is enabled.
    if (!data.session && data.user) {
      return { user: null, confirmationPending: true, error: null }
    }
    return { user: data.user, confirmationPending: false, error: null }
  } catch (e) {
    return { user: null, confirmationPending: false, error: e instanceof Error ? e.message : "Sign-up failed." }
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const sb = getSupabase()
  if (!sb) return { user: null, confirmationPending: false, error: "Sync is not configured." }
  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password })
    if (error) return { user: null, confirmationPending: false, error: error.message }
    return { user: data.user, confirmationPending: false, error: null }
  } catch (e) {
    return { user: null, confirmationPending: false, error: e instanceof Error ? e.message : "Sign-in failed." }
  }
}

export async function signOut(): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  try {
    await sb.auth.signOut()
  } catch {}
}

export function onAuthChange(cb: (event: string, session: Session | null) => void): () => void {
  const sb = getSupabase()
  if (!sb) return () => {}
  const { data } = sb.auth.onAuthStateChange((event, session) => cb(event, session))
  return () => data.subscription.unsubscribe()
}
