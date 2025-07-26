"use client"

import { useState, useEffect, useOptimistic, useTransition } from "react"
import type { User, Shift } from "@/lib/data"
import { getWorkerData, claimShift } from "@/lib/actions"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { ShiftCard } from "@/components/shift-card"
import { DashboardHeader } from "@/components/dashboard-header"
import { toast } from "sonner"
import { Briefcase, CalendarClock } from "lucide-react"

type WorkerData = {
  availableShifts: Shift[]
  myClaimedShifts: Shift[]
}

export function WorkerDashboard({ user }: { user: User }) {
  const [data, setData] = useState<WorkerData>({ availableShifts: [], myClaimedShifts: [] })
  const [isPending, startTransition] = useTransition()

  const [optimisticData, setOptimisticData] = useOptimistic(
    data,
    (state, { claimedShiftId }: { claimedShiftId: string }) => {
      return {
        ...state,
        availableShifts: state.availableShifts.filter((s) => s.id !== claimedShiftId),
      }
    },
  )

  useEffect(() => {
    async function loadData() {
      const workerData = await getWorkerData(user.id)
      setData(workerData)
    }
    loadData()
    const interval = setInterval(loadData, 5000) // Refresh data every 5 seconds
    return () => clearInterval(interval)
  }, [user.id])

  const handleClaimShift = (shiftId: string) => {
    startTransition(() => {
      setOptimisticData({ claimedShiftId: shiftId })
      ;(async () => {
        const result = await claimShift(shiftId, user.id)
        if (result.success) {
          toast.success("Shift claimed!", { description: "Your manager has been notified for approval." })
        } else {
          toast.error(result.error)
        }
        const workerData = await getWorkerData(user.id)
        setData(workerData)
      })()
    })
  }

  return (
    <div className="space-y-6">
      <DashboardHeader title={`Welcome, ${user.name}!`} description={`Here's what's happening at ${user.location}.`} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Available Shifts
            </CardTitle>
            <CardDescription>Claim an open shift that matches your role.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimisticData.availableShifts.length > 0 ? (
                optimisticData.availableShifts.map((shift) => (
                  <ShiftCard key={shift.id} shift={shift} onClaim={handleClaimShift} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No available shifts right now.</p>
                  <p>Check back later!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              My Upcoming Shifts
            </CardTitle>
            <CardDescription>Shifts you have successfully claimed.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {optimisticData.myClaimedShifts.length > 0 ? (
                optimisticData.myClaimedShifts.map((shift) => (
                  <div key={shift.id} className="p-3 bg-muted rounded-md text-sm">
                    <p className="font-semibold">{shift.role}</p>
                    <p className="text-muted-foreground">
                      {new Date(shift.startDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-muted-foreground">
                      {new Date(shift.startDate).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}{" "}
                      -{" "}
                      {new Date(shift.endDate).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No claimed shifts.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
