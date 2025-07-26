"use client"

import { useState, useEffect } from "react"
import type { Shift } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MessageSquare } from "lucide-react"

function getTimeSince(targetDate: Date) {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + "y ago"
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + "mo ago"
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + "d ago"
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + "h ago"
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + "m ago"
  return Math.floor(seconds) + "s ago"
}

export function ShiftCard({ shift, onClaim }: { shift: Shift; onClaim: (shiftId: string) => void }) {
  const [timeSince, setTimeSince] = useState(getTimeSince(new Date(shift.postedAt)))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSince(getTimeSince(new Date(shift.postedAt)))
    }, 5000)
    return () => clearInterval(interval)
  }, [shift.postedAt])

  return (
    <Card>
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="font-semibold">{shift.role}</h3>
            <div className="text-sm text-muted-foreground space-y-1 mt-1">
              <p>
                {new Date(shift.startDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p>
                {new Date(shift.startDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} -{" "}
                {new Date(shift.endDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </p>
              {shift.note && (
                <p className="flex items-center gap-1.5 pt-1">
                  <MessageSquare className="h-3.5 w-3.5" /> "{shift.note}"
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
          <Badge variant="secondary" className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Posted {timeSince}
          </Badge>
          <Button onClick={() => onClaim(shift.id)} className="w-full sm:w-auto">
            Claim Shift
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
