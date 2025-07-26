"use client"

import type { Claim } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Check, X, User, Calendar } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ApprovalCard({
  claim,
  onAction,
}: { claim: Claim; onAction: (claim: Claim, approved: boolean) => void }) {
  return (
    <Card>
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarFallback>{claim.claimedBy.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{claim.shift.role}</h3>
            <div className="text-sm text-muted-foreground space-y-1 mt-1">
              <p className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Claimed by {claim.claimedBy.name}
              </p>
              <p className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(claim.shift.startDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="w-full bg-transparent">
                <X className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Reject</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to reject this claim?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will notify the worker and make the shift available again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onAction(claim, false)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Reject Claim
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button className="w-full" onClick={() => onAction(claim, true)}>
            <Check className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Approve</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
