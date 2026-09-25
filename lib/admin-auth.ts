import { createHash, timingSafeEqual } from "crypto"

// Server-only: never import this module from client components.
// The key itself stays on the server; the browser only holds an
// opaque session token derived from it.

export const ADMIN_COOKIE = "synapse-admin"

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_KEY)
}

/** Opaque session token — unforgeable without knowing ADMIN_KEY. */
export function adminToken(): string | null {
  const key = process.env.ADMIN_KEY
  if (!key) return null
  return createHash("sha256").update(`synapse-admin:${key}`).digest("hex")
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

export function isKeyValid(candidate: unknown): boolean {
  const key = process.env.ADMIN_KEY
  if (!key || typeof candidate !== "string" || candidate.length === 0) return false
  return safeEqual(candidate, key)
}

export function isAdminRequestValid(cookieValue: string | undefined): boolean {
  const expected = adminToken()
  if (!expected || !cookieValue) return false
  return safeEqual(cookieValue, expected)
}
