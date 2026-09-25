import { NextResponse } from "next/server"
import { ADMIN_COOKIE, adminToken, isAdminConfigured, isKeyValid } from "@/lib/admin-auth"

export async function POST(req: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin lock is not configured on the server." }, { status: 500 })
  }

  let key: unknown
  try {
    key = (await req.json())?.key
  } catch {
    key = undefined
  }

  if (!isKeyValid(key)) {
    // Small delay to slow down guessing.
    await new Promise((r) => setTimeout(r, 500))
    return NextResponse.json({ error: "Wrong key." }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, adminToken()!, {
    httpOnly: true,
    sameSite: "lax",
    path: "/admin",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
