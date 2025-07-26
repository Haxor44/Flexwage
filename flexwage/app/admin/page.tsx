import { AdminDashboard } from "@/components/admin-dashboard"
import { users } from "@/lib/data"
import { redirect } from "next/navigation"

export default function AdminPage({ searchParams }: { searchParams: { userId?: string } }) {
  const userId = searchParams.userId ? Number.parseInt(searchParams.userId, 10) : undefined

  if (!userId) {
    redirect("/login")
  }

  const user = users.find((u) => u.id === userId && u.role === "Admin")

  if (!user) {
    return redirect("/login?error=AdminNotFound")
  }

  return (
    <main className="bg-muted/40 min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <AdminDashboard user={user} />
    </main>
  )
}
