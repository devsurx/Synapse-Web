import { cookies } from "next/headers"
import { ADMIN_COOKIE, isAdminConfigured, isAdminRequestValid } from "@/lib/admin-auth"
import { AdminDashboard } from "@/components/admin-dashboard"
import { AdminLock } from "@/components/admin-lock"

export const metadata = {
  title: "Admin — Synapse",
  robots: "noindex, nofollow",
}

export default async function AdminPage() {
  const store = await cookies()
  const authed = isAdminRequestValid(store.get(ADMIN_COOKIE)?.value)
  if (authed) return <AdminDashboard />
  return <AdminLock notConfigured={!isAdminConfigured()} />
}
