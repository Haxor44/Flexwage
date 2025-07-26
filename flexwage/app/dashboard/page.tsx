import { WorkerDashboard } from "@/components/worker-dashboard"
import { users } from "@/lib/data"
import { redirect } from "next/navigation"

export default function DashboardPage({ searchParams }: { searchParams: { userId?: string } }) {
  const userId = searchParams.userId ? Number.parseInt(searchParams.userId, 10) : undefined

  if (!userId) {
    // If no user is specified, redirect to login
    redirect("/login")
  }

  const user = users.find((u) => u.id === userId && u.role !== "Admin")

  if (!user) {
    // If user not found or is an admin, handle error or redirect
    return redirect("/login?error=UserNotFound")
  }

  return (
    <main className="bg-muted/40 min-h-screen w-full p-4 sm:p-6 lg:p-8">
      <WorkerDashboard user={user} />
    </main>
  )
}
