"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect, useOptimistic, useTransition } from "react"
import type { User, Shift, Claim } from "@/lib/data"
import { getAdminData, approveClaim, rejectClaim, postShift as postShiftAction } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApprovalCard } from "@/components/approval-card"
import { PostShiftDialog } from "@/components/post-shift-dialog"
import { DashboardHeader } from "@/components/dashboard-header"
import { toast } from "sonner"
import { PlusCircle, BellRing } from "lucide-react"

type AdminData = {
  pendingClaims: Claim[]
  openShifts: Shift[]
  pendingShifts: Shift[]
  filledShifts: Shift[]
}

export function AdminDashboard({ user }: { user: User }) {
  const [data, setData] = useState<AdminData>({
    pendingClaims: [],
    openShifts: [],
    pendingShifts: [],
    filledShifts: [],
  })
  const [isPending, startTransition] = useTransition()

  const [optimisticData, setOptimisticData] = useOptimistic(
    data,
    (state, { newShift, updatedClaim }: { newShift?: Shift; updatedClaim?: Claim }) => {
      if (newShift) {
        return { ...state, openShifts: [newShift, ...state.openShifts] }
      }
      if (updatedClaim) {
        const newPendingShifts = state.pendingShifts.filter((s) => s.id !== updatedClaim.shift.id)
        if (updatedClaim.status === "Approved") {
          return {
            ...state,
            pendingClaims: state.pendingClaims.filter((c) => c.id !== updatedClaim.id),
            pendingShifts: newPendingShifts,
            filledShifts: [{ ...updatedClaim.shift, status: "Filled" }, ...state.filledShifts],
          }
        } else {
          // Rejected
          return {
            ...state,
            pendingClaims: state.pendingClaims.filter((c) => c.id !== updatedClaim.id),
            pendingShifts: newPendingShifts,
            openShifts: [{ ...updatedClaim.shift, status: "Open" }, ...state.openShifts],
          }
        }
      }
      return state
    },
  )

  useEffect(() => {
    async function loadData() {
      const adminData = await getAdminData(user.location)
      setData(adminData)
    }
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [user.location])

  const handleApproval = (claim: Claim, approved: boolean) => {
    startTransition(() => {
      setOptimisticData({ updatedClaim: { ...claim, status: approved ? "Approved" : "Rejected" } })
      ;(async () => {
        const action = approved ? approveClaim : rejectClaim
        const result = await action(claim.id)
        if (result.success) {
          toast.success(`Shift ${approved ? "approved" : "rejected"}.`)
        } else {
          toast.error(result.error)
        }
        const adminData = await getAdminData(user.location)
        setData(adminData)
      })()
    })
  }

  const handlePostShift = (values: { startDate: Date; endDate: Date; role: string; note?: string }) => {
    startTransition(() => {
      const newShiftData = { ...values, location: user.location, postedBy: user.id }
      const optimisticShift: Shift = {
        id: `temp-${Date.now()}`,
        ...newShiftData,
        status: "Open",
        postedAt: new Date(),
      }
      setOptimisticData({ newShift: optimisticShift })
      ;(async () => {
        const result = await postShiftAction(newShiftData)
        if (result.success) {
          toast.success("New shift posted!")
        } else {
          toast.error(result.error)
        }
        const adminData = await getAdminData(user.location)
        setData(adminData)
      })()
    })
  }

  return (
    <div className="space-y-6">
      <DashboardHeader title="Admin Dashboard" description={`Manage shifts for ${user.location}.`}>
        <PostShiftDialog onPostShift={handlePostShift}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Post Open Shift
          </Button>
        </PostShiftDialog>
      </DashboardHeader>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" />
            Pending Approvals
          </CardTitle>
          <CardDescription>Review shifts that have been claimed by workers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimisticData.pendingClaims.length > 0 ? (
              optimisticData.pendingClaims.map((claim) => (
                <ApprovalCard key={claim.id} claim={claim} onAction={handleApproval} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No pending approvals.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shift Management</CardTitle>
          <CardDescription>View all shifts and their current status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="open">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="open">Open ({optimisticData.openShifts.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({optimisticData.pendingShifts.length})</TabsTrigger>
              <TabsTrigger value="filled">Filled ({optimisticData.filledShifts.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="open" className="mt-4">
              <ShiftList shifts={optimisticData.openShifts} />
            </TabsContent>
            <TabsContent value="pending" className="mt-4">
              <ShiftList shifts={optimisticData.pendingShifts} />
            </TabsContent>
            <TabsContent value="filled" className="mt-4">
              <ShiftList shifts={optimisticData.filledShifts} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function ShiftList({ shifts }: { shifts: Shift[] }) {
  if (shifts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No shifts in this category.</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {shifts.map((shift) => (
        <div key={shift.id} className="flex items-center justify-between p-3 bg-muted rounded-md text-sm">
          <div>
            <p className="font-semibold">{shift.role}</p>
            <p className="text-muted-foreground">
              {new Date(shift.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })},{" "}
              {new Date(shift.startDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} -{" "}
              {new Date(shift.endDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </p>
          </div>
          <Badge variant="outline">{shift.status}</Badge>
        </div>
      ))}
    </div>
  )
}
