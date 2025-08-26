"use client"

import type React from "react"

import { useState, createContext, useContext } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, BellRing, X, Clock, Users, AlertCircle, CheckCircle, Settings } from "lucide-react"

export interface Notification {
  id: string
  type:
    | "shift_posted"
    | "shift_claimed"
    | "shift_approved"
    | "shift_rejected"
    | "shift_reminder"
    | "shift_cancelled"
    | "shift_completed"
  title: string
  message: string
  timestamp: string
  read: boolean
  urgent: boolean
  actionable: boolean
  metadata?: {
    shiftId?: number
    workerId?: string
    businessId?: string
    role?: string
    time?: string
    date?: string
  }
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "shift_claimed",
      title: "New Shift Application",
      message: "Sarah Johnson applied for your Server shift today at 6:00 PM",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      read: false,
      urgent: true,
      actionable: true,
      metadata: {
        shiftId: 1,
        workerId: "worker-1",
        role: "Server",
        time: "6:00 PM - 11:00 PM",
        date: "Today",
      },
    },
    {
      id: "2",
      type: "shift_approved",
      title: "Shift Approved!",
      message: "You've been approved for the Line Cook shift at Downtown Diner tomorrow",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      read: false,
      urgent: false,
      actionable: false,
      metadata: {
        shiftId: 2,
        businessId: "business-1",
        role: "Line Cook",
        time: "11:00 AM - 3:00 PM",
        date: "Tomorrow",
      },
    },
    {
      id: "3",
      type: "shift_reminder",
      title: "Shift Starting Soon",
      message: "Your Server shift at Downtown Diner starts in 30 minutes",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: true,
      urgent: true,
      actionable: false,
      metadata: {
        shiftId: 1,
        businessId: "business-1",
        role: "Server",
        time: "6:00 PM - 11:00 PM",
        date: "Today",
      },
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const addNotification = (notificationData: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    }
    setNotifications((prev) => [newNotification, ...prev])

    // Show toast notification
    showToast(newNotification)
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const showToast = (notification: Notification) => {
    // In a real app, this would trigger a toast notification
    console.log("Toast notification:", notification.title)
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications()
  const [showNotifications, setShowNotifications] = useState(false)

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "shift_posted":
        return <Bell className="w-4 h-4 text-blue-600" />
      case "shift_claimed":
        return <Users className="w-4 h-4 text-orange-600" />
      case "shift_approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "shift_rejected":
        return <X className="w-4 h-4 text-red-600" />
      case "shift_reminder":
        return <Clock className="w-4 h-4 text-purple-600" />
      case "shift_cancelled":
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case "shift_completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {unreadCount > 0 ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Notifications</DialogTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No notifications</h3>
              <p className="text-sm text-muted-foreground">You'll see updates about your shifts here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-colors ${
                    !notification.read ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50"
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4
                              className={`text-sm font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              {notification.urgent && (
                                <Badge variant="destructive" className="text-xs">
                                  Urgent
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeNotification(notification.id)
                            }}
                            className="flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    shiftReminders: true,
    newShiftAlerts: true,
    applicationUpdates: true,
    marketingEmails: false,
  })

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Notification Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notification Preferences</DialogTitle>
          <DialogDescription>Choose how you want to be notified about shift updates</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium">Delivery Methods</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="push" className="text-sm">
                  Push Notifications
                </Label>
                <Switch
                  id="push"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="email" className="text-sm">
                  Email Notifications
                </Label>
                <Switch
                  id="email"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sms" className="text-sm">
                  SMS Notifications
                </Label>
                <Switch
                  id="sms"
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Notification Types</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="reminders" className="text-sm">
                  Shift Reminders
                </Label>
                <Switch
                  id="reminders"
                  checked={settings.shiftReminders}
                  onCheckedChange={(checked) => handleSettingChange("shiftReminders", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="newShifts" className="text-sm">
                  New Shift Alerts
                </Label>
                <Switch
                  id="newShifts"
                  checked={settings.newShiftAlerts}
                  onCheckedChange={(checked) => handleSettingChange("newShiftAlerts", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="applications" className="text-sm">
                  Application Updates
                </Label>
                <Switch
                  id="applications"
                  checked={settings.applicationUpdates}
                  onCheckedChange={(checked) => handleSettingChange("applicationUpdates", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="marketing" className="text-sm">
                  Marketing Emails
                </Label>
                <Switch
                  id="marketing"
                  checked={settings.marketingEmails}
                  onCheckedChange={(checked) => handleSettingChange("marketingEmails", checked)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button>Save Preferences</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook for triggering notifications based on actions
export function useNotificationTriggers() {
  const { addNotification } = useNotifications()

  const triggerShiftPosted = (shiftData: { role: string; time: string; date: string; pay: string }) => {
    addNotification({
      type: "shift_posted",
      title: "New Shift Available",
      message: `${shiftData.role} shift posted for ${shiftData.date} at ${shiftData.pay}`,
      urgent: false,
      actionable: true,
      metadata: {
        role: shiftData.role,
        time: shiftData.time,
        date: shiftData.date,
      },
    })
  }

  const triggerShiftClaimed = (workerName: string, shiftData: { role: string; time: string; date: string }) => {
    addNotification({
      type: "shift_claimed",
      title: "Shift Application Received",
      message: `${workerName} applied for your ${shiftData.role} shift on ${shiftData.date}`,
      urgent: true,
      actionable: true,
      metadata: {
        role: shiftData.role,
        time: shiftData.time,
        date: shiftData.date,
      },
    })
  }

  const triggerShiftApproved = (businessName: string, shiftData: { role: string; time: string; date: string }) => {
    addNotification({
      type: "shift_approved",
      title: "Shift Approved!",
      message: `You've been approved for the ${shiftData.role} shift at ${businessName}`,
      urgent: false,
      actionable: false,
      metadata: {
        role: shiftData.role,
        time: shiftData.time,
        date: shiftData.date,
      },
    })
  }

  const triggerShiftRejected = (businessName: string, shiftData: { role: string; time: string; date: string }) => {
    addNotification({
      type: "shift_rejected",
      title: "Application Not Selected",
      message: `Your application for the ${shiftData.role} shift at ${businessName} was not selected`,
      urgent: false,
      actionable: false,
      metadata: {
        role: shiftData.role,
        time: shiftData.time,
        date: shiftData.date,
      },
    })
  }

  const triggerShiftReminder = (
    shiftData: { role: string; time: string; businessName: string },
    minutesUntil: number,
  ) => {
    addNotification({
      type: "shift_reminder",
      title: "Shift Starting Soon",
      message: `Your ${shiftData.role} shift at ${shiftData.businessName} starts in ${minutesUntil} minutes`,
      urgent: true,
      actionable: false,
      metadata: {
        role: shiftData.role,
        time: shiftData.time,
      },
    })
  }

  const triggerShiftCancelled = (shiftData: { role: string; time: string; date: string; businessName: string }) => {
    addNotification({
      type: "shift_cancelled",
      title: "Shift Cancelled",
      message: `The ${shiftData.role} shift at ${shiftData.businessName} on ${shiftData.date} has been cancelled`,
      urgent: true,
      actionable: false,
      metadata: {
        role: shiftData.role,
        time: shiftData.time,
        date: shiftData.date,
      },
    })
  }

  return {
    triggerShiftPosted,
    triggerShiftClaimed,
    triggerShiftApproved,
    triggerShiftRejected,
    triggerShiftReminder,
    triggerShiftCancelled,
  }
}
