"use client"

import { useEffect, useState } from "react"
import { getSessionUser, onAuthChange, type User } from "@/lib/auth"
import { claimAndSyncAccount } from "@/lib/sync"
import { removeKey } from "@/lib/tool-storage"

const SUPABASE_USER_ID_KEY = "synapse:supabase-user-id"

/**
 * Tracks the signed-in user. On sign-in, links this device's cloud row to
 * the account and merges data; on sign-out, drops the linked row id so the
 * next session starts a fresh anonymous device row.
 */
export function useAccount(): User | null {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let alive = true
    getSessionUser().then((u) => {
      if (alive) setUser(u)
    })
    const unsub = onAuthChange((event, session) => {
      if (!alive) return
      setUser(session?.user ?? null)
      if (event === "SIGNED_IN" && session?.user) {
        void claimAndSyncAccount()
      } else if (event === "SIGNED_OUT") {
        removeKey(SUPABASE_USER_ID_KEY)
      }
    })
    return () => {
      alive = false
      unsub()
    }
  }, [])

  return user
}
