import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { ADMIN_COOKIE, isAdminRequestValid } from "@/lib/admin-auth"

/**
 * Admin-only read of every user + focus block. Uses the service-role key
 * (bypasses RLS) when configured; otherwise falls back to the anon key,
 * which under the account RLS policies only sees unclaimed guest rows.
 * The admin cookie gate applies either way.
 */
export async function GET() {
  const store = await cookies()
  if (!isAdminRequestValid(store.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const key = serviceKey ?? anonKey
  if (!url || !key) {
    return NextResponse.json({ users: [], blocks: [], limited: true, reason: "Supabase is not configured." })
  }

  try {
    const sb = createClient(url, key)
    const [{ data: users, error: usersError }, { data: blocks, error: blocksError }] = await Promise.all([
      sb.from("users").select("id,name,focus_minutes,sessions,created_at").order("created_at", { ascending: false }).limit(200),
      sb
        .from("planner_blocks")
        .select("id,user_id,title,duration_minutes,note,created_at,users(name)")
        .order("created_at", { ascending: false })
        .limit(500),
    ])
    if (usersError || blocksError) {
      return NextResponse.json(
        { users: [], blocks: [], limited: true, reason: usersError?.message ?? blocksError?.message ?? "Query failed." },
        { status: 500 },
      )
    }
    return NextResponse.json({ users: users ?? [], blocks: blocks ?? [], limited: !serviceKey })
  } catch (e) {
    return NextResponse.json(
      { users: [], blocks: [], limited: true, reason: e instanceof Error ? e.message : "Query failed." },
      { status: 500 },
    )
  }
}
