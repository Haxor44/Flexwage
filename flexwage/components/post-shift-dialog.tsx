"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PostShiftDialogProps {
  children: React.ReactNode
  onPostShift: (values: { startDate: Date; endDate: Date; role: string; note?: string }) => void
}

export function PostShiftDialog({ children, onPostShift }: PostShiftDialogProps) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")
  const [role, setRole] = useState<string | undefined>()
  const [note, setNote] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) {
      setError("Please select a role for the shift.")
      return
    }
    const startDate = new Date(`${date}T${startTime}`)
    const endDate = new Date(`${date}T${endTime}`)

    if (endDate <= startDate) {
      setError("End time must be after start time.")
      return
    }
    setError("")
    onPostShift({ startDate, endDate, role, note })
    setOpen(false)
    // Reset form
    setNote("")
    setRole(undefined)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Post an Open Shift</DialogTitle>
            <DialogDescription>
              Fill in the details for the open shift. Workers with the matching role will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Barista">Barista</SelectItem>
                  <SelectItem value="Cashier">Cashier</SelectItem>
                  <SelectItem value="Shift Lead">Shift Lead</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="end-time">End Time</Label>
                <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
            {error && <p className="text-sm text-center text-red-500">{error}</p>}
            <div className="grid gap-2">
              <Label htmlFor="note">Optional Note</Label>
              <Textarea
                id="note"
                placeholder="e.g., Covering for Sarah, expecting a rush"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Post Shift</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
