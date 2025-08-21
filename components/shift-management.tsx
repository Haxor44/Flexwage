"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, DollarSign, MapPin, Users, Edit, Trash2, Copy, AlertCircle } from "lucide-react"

export interface Shift {
  id: number
  role: string
  date: string
  time: string
  pay: string
  location: string
  status: "draft" | "open" | "claimed" | "approved" | "in-progress" | "completed" | "cancelled"
  description: string
  requirements?: string[]
  applicants: any[]
  assignedWorker?: any
  createdAt: string
  updatedAt: string
  businessId: string
  estimatedDuration: string
  isUrgent: boolean
  template?: boolean
}

interface ShiftManagementProps {
  shifts: Shift[]
  onCreateShift: (shift: Partial<Shift>) => void
  onUpdateShift: (id: number, updates: Partial<Shift>) => void
  onDeleteShift: (id: number) => void
  onDuplicateShift: (id: number) => void
}

export function ShiftManagement({
  shifts,
  onCreateShift,
  onUpdateShift,
  onDeleteShift,
  onDuplicateShift,
}: ShiftManagementProps) {
  const [activeTab, setActiveTab] = useState("active")
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const activeShifts = shifts.filter((s) => ["open", "claimed", "approved", "in-progress"].includes(s.status))
  const completedShifts = shifts.filter((s) => ["completed", "cancelled"].includes(s.status))
  const draftShifts = shifts.filter((s) => s.status === "draft")

  const getStatusColor = (status: Shift["status"]) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "claimed":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "in-progress":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "draft":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: Shift["status"]) => {
    switch (status) {
      case "open":
        return "Open"
      case "claimed":
        return "Claimed"
      case "approved":
        return "Approved"
      case "in-progress":
        return "In Progress"
      case "completed":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      case "draft":
        return "Draft"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Shift Management</h2>
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>Create New Shift</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Shift</DialogTitle>
                <DialogDescription>Fill out the details for your new shift posting</DialogDescription>
              </DialogHeader>
              <ShiftForm
                onSubmit={(data) => {
                  onCreateShift(data)
                  setShowCreateDialog(false)
                }}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active ({activeShifts.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({draftShifts.length})</TabsTrigger>
          <TabsTrigger value="history">History ({completedShifts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeShifts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No active shifts</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Create your first shift to start finding workers
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>Create Shift</Button>
              </CardContent>
            </Card>
          ) : (
            activeShifts.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                onEdit={(shift) => {
                  setSelectedShift(shift)
                  setShowEditDialog(true)
                }}
                onDelete={onDeleteShift}
                onDuplicate={onDuplicateShift}
                onStatusChange={(id, status) => onUpdateShift(id, { status })}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          {draftShifts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Edit className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No draft shifts</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Draft shifts will appear here before you publish them
                </p>
              </CardContent>
            </Card>
          ) : (
            draftShifts.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                onEdit={(shift) => {
                  setSelectedShift(shift)
                  setShowEditDialog(true)
                }}
                onDelete={onDeleteShift}
                onDuplicate={onDuplicateShift}
                onStatusChange={(id, status) => onUpdateShift(id, { status })}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {completedShifts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No shift history</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Completed and cancelled shifts will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            completedShifts.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                onEdit={(shift) => {
                  setSelectedShift(shift)
                  setShowEditDialog(true)
                }}
                onDelete={onDeleteShift}
                onDuplicate={onDuplicateShift}
                onStatusChange={(id, status) => onUpdateShift(id, { status })}
                readonly
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Shift</DialogTitle>
            <DialogDescription>Update the details for this shift</DialogDescription>
          </DialogHeader>
          {selectedShift && (
            <ShiftForm
              initialData={selectedShift}
              onSubmit={(data) => {
                onUpdateShift(selectedShift.id, data)
                setShowEditDialog(false)
                setSelectedShift(null)
              }}
              onCancel={() => {
                setShowEditDialog(false)
                setSelectedShift(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ShiftCardProps {
  shift: Shift
  onEdit: (shift: Shift) => void
  onDelete: (id: number) => void
  onDuplicate: (id: number) => void
  onStatusChange: (id: number, status: Shift["status"]) => void
  readonly?: boolean
}

function ShiftCard({ shift, onEdit, onDelete, onDuplicate, onStatusChange, readonly = false }: ShiftCardProps) {
  const [showActions, setShowActions] = useState(false)

  const canEdit = !readonly && ["draft", "open"].includes(shift.status)
  const canCancel = !readonly && ["open", "claimed"].includes(shift.status)
  const canMarkInProgress = !readonly && shift.status === "approved"
  const canComplete = !readonly && shift.status === "in-progress"

  const getStatusColor = (status: Shift["status"]) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "claimed":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "in-progress":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "draft":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: Shift["status"]) => {
    switch (status) {
      case "open":
        return "Open"
      case "claimed":
        return "Claimed"
      case "approved":
        return "Approved"
      case "in-progress":
        return "In Progress"
      case "completed":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      case "draft":
        return "Draft"
      default:
        return status
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{shift.role}</h3>
              <Badge className={`text-xs ${getStatusColor(shift.status)}`}>{getStatusText(shift.status)}</Badge>
              {shift.isUrgent && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Urgent
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{shift.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{shift.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>{shift.pay}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{shift.location}</span>
              </div>
            </div>

            {shift.description && <p className="text-sm text-muted-foreground mb-3">{shift.description}</p>}

            {shift.assignedWorker && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">Assigned to {shift.assignedWorker.name}</span>
              </div>
            )}

            {shift.applicants.length > 0 && shift.status === "open" && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-blue-600 font-medium">
                  {shift.applicants.length} applicant{shift.applicants.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {!readonly && (
              <>
                {canEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(shift)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}

                {canMarkInProgress && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange(shift.id, "in-progress")}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    Start Shift
                  </Button>
                )}

                {canComplete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange(shift.id, "completed")}
                    className="text-green-600 hover:text-green-700"
                  >
                    Complete
                  </Button>
                )}

                {canCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onStatusChange(shift.id, "cancelled")}
                    className="text-red-600 hover:text-red-700"
                  >
                    Cancel
                  </Button>
                )}
              </>
            )}

            <Button variant="ghost" size="sm" onClick={() => onDuplicate(shift.id)}>
              <Copy className="w-4 h-4 mr-1" />
              Duplicate
            </Button>

            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(shift.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ShiftFormProps {
  initialData?: Partial<Shift>
  onSubmit: (data: Partial<Shift>) => void
  onCancel: () => void
}

function ShiftForm({ initialData, onSubmit, onCancel }: ShiftFormProps) {
  const [formData, setFormData] = useState({
    role: initialData?.role || "",
    date: initialData?.date || "",
    startTime: initialData?.time?.split(" - ")[0] || "",
    endTime: initialData?.time?.split(" - ")[1] || "",
    pay: initialData?.pay?.replace(/[$/hr]/g, "") || "",
    location: initialData?.location || "Downtown Diner",
    description: initialData?.description || "",
    isUrgent: initialData?.isUrgent || false,
    requirements: initialData?.requirements?.join(", ") || "",
    status: initialData?.status || "draft",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const submitData: Partial<Shift> = {
      ...formData,
      time: `${formData.startTime} - ${formData.endTime}`,
      pay: `$${formData.pay}/hr`,
      requirements: formData.requirements ? formData.requirements.split(",").map((r) => r.trim()) : [],
      updatedAt: new Date().toISOString(),
    }

    if (!initialData) {
      submitData.createdAt = new Date().toISOString()
      submitData.applicants = []
    }

    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="role">Role *</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Server">Server</SelectItem>
            <SelectItem value="Bartender">Bartender</SelectItem>
            <SelectItem value="Line Cook">Line Cook</SelectItem>
            <SelectItem value="Prep Cook">Prep Cook</SelectItem>
            <SelectItem value="Dishwasher">Dishwasher</SelectItem>
            <SelectItem value="Host/Hostess">Host/Hostess</SelectItem>
            <SelectItem value="Cashier">Cashier</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Select value={formData.date} onValueChange={(value) => setFormData({ ...formData, date: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="Tomorrow">Tomorrow</SelectItem>
              <SelectItem value="This Weekend">This Weekend</SelectItem>
              <SelectItem value="Next Week">Next Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pay">Pay Rate *</Label>
          <Input
            id="pay"
            type="number"
            placeholder="18"
            value={formData.pay}
            onChange={(e) => setFormData({ ...formData, pay: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time *</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time *</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Any specific requirements or notes..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="requirements">Requirements (comma-separated)</Label>
        <Input
          id="requirements"
          placeholder="POS experience, food safety certification"
          value={formData.requirements}
          onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isUrgent"
          checked={formData.isUrgent}
          onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
          className="rounded border-gray-300"
        />
        <Label htmlFor="isUrgent" className="text-sm">
          Mark as urgent
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value as Shift["status"] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Save as Draft</SelectItem>
            <SelectItem value="open">Publish Immediately</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {initialData ? "Update Shift" : "Create Shift"}
        </Button>
      </div>
    </form>
  )
}
