"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building2, Users, Clock, Star, CheckCircle, XCircle, Shield, LogIn, Loader2, Eye } from "lucide-react"
import { ShiftManagement, type Shift } from "@/components/shift-management"
import {
  NotificationProvider,
  NotificationBell,
  NotificationSettings,
  useNotificationTriggers,
} from "@/components/notification-system"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { DIDProfile } from "@/components/did-profile"
import { AuthDebug } from "@/components/auth-debug"
import { icpService, type UserProfile, type WorkerProfile, type BusinessProfile } from "@/lib/icp"
import { toast } from "sonner"
import { Principal } from "@dfinity/principal"

interface AuthState {
  isAuthenticated: boolean
  principal: Principal | null
  isLoading: boolean
}

interface ICPShift {
  id: string
  business_id: string
  role: string
  date: string
  start_time: string
  end_time: string
  pay_rate: number
  location: string
  description?: string
  requirements: string[]
  status: any
  assigned_worker?: string
  applicants: string[]
  is_urgent: boolean
  created_at: bigint
  updated_at: bigint
}

export default function HomePage() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    principal: null,
    isLoading: true,
  })
  const [userType, setUserType] = useState<"business" | "worker" | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    // Check if we're returning from Internet Identity auth
    const urlParams = new URLSearchParams(window.location.search);
    const authInProgress = localStorage.getItem('flexwage_auth_in_progress');
    
    if (authInProgress) {
      console.log('🔄 Detected return from Internet Identity, completing authentication...');
      localStorage.removeItem('flexwage_auth_in_progress');
      // Give a moment for the auth client to process the return
      setTimeout(() => {
        checkAuthStatus();
      }, 1000);
    } else {
      checkAuthStatus();
    }
  }, [])

  const checkAuthStatus = async () => {
    console.log('🔍 Starting auth status check...');
    try {
      console.log('⏳ Initializing ICP service...');
      await icpService.init()
      
      console.log('🔐 Checking authentication status...');
      const isAuthenticated = await icpService.isAuthenticated()
      const principal = icpService.getPrincipal()
      
      console.log('📊 Auth results:', { isAuthenticated, principal: principal?.toString() });

      setAuthState({
        isAuthenticated,
        principal,
        isLoading: false,
      })

      // If authenticated, try to load user profile
      if (isAuthenticated && principal) {
        console.log('👤 User is authenticated, loading profile...');
        try {
          const profile = await icpService.getUserProfile(principal)
          console.log('📄 Profile loaded:', profile);
          
          if (profile.user_type.Worker) {
            setUserType('worker')
            const workerProfile = await icpService.getWorkerProfile(profile.id)
            setUserProfile({ ...profile, ...workerProfile })
            console.log('👷 Worker profile loaded');
          } else {
            setUserType('business')
            const businessProfile = await icpService.getBusinessProfile(profile.id)
            setUserProfile({ ...profile, ...businessProfile })
            console.log('🏢 Business profile loaded');
          }
          setShowOnboarding(false)
        } catch (error) {
          // User profile doesn't exist yet, will need onboarding
          console.log('⚠️ User profile not found, will need onboarding:', error);
        }
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error)
      setAuthState({
        isAuthenticated: false,
        principal: null,
        isLoading: false,
      })
    }
  }

  const handleInternetIdentityLogin = async () => {
    console.log('📦 Login button clicked!');
    setAuthState((prev) => ({ ...prev, isLoading: true }))

    try {
      console.log('⏳ Calling icpService.login()...');
      const success = await icpService.login()
      console.log('📁 Login result:', success);
      
      if (success) {
        console.log('✅ Login successful, getting principal...');
        const principal = icpService.getPrincipal()
        console.log('👤 Principal obtained:', principal?.toString());
        
        setAuthState({
          isAuthenticated: true,
          principal,
          isLoading: false,
        })
        
        // Try to load existing user profile
        try {
          console.log('📄 Loading user profile...');
          const profile = await icpService.getUserProfile(principal!)
          console.log('📋 Profile loaded:', profile);
          
          if (profile.user_type.Worker) {
            setUserType('worker')
            const workerProfile = await icpService.getWorkerProfile(profile.id)
            setUserProfile({ ...profile, ...workerProfile })
            console.log('👷 Worker profile set');
          } else {
            setUserType('business')
            const businessProfile = await icpService.getBusinessProfile(profile.id)
            setUserProfile({ ...profile, ...businessProfile })
            console.log('🏢 Business profile set');
          }
          setShowOnboarding(false)
        } catch (error) {
          // User profile doesn't exist yet, will need onboarding
          console.log('🆆 User profile not found, will need onboarding:', error);
        }
      } else {
        console.log('❌ Login failed');
        setAuthState((prev) => ({ ...prev, isLoading: false }))
        toast.error('Login failed')
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      toast.error('Login failed')
    }
  }

  const handleLogout = async () => {
    try {
      await icpService.logout()
      setAuthState({
        isAuthenticated: false,
        principal: null,
        isLoading: false,
      })
      setUserType(null)
      setShowOnboarding(false)
      setUserProfile(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleUserTypeSelection = (type: "business" | "worker") => {
    setUserType(type)
    setShowOnboarding(true)
  }

  const handleOnboardingComplete = (profileData: any) => {
    setUserProfile(profileData)
    setShowOnboarding(false)
  }

  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">FW</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground">FlexWage</h1>
            <p className="text-lg text-muted-foreground">Fill shifts instantly. Work flexibly.</p>
            <p className="text-sm text-muted-foreground">
              Connect businesses with last-minute staffing needs to workers seeking flexible opportunities.
            </p>
          </div>

          <Card className="border-2">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 mx-auto text-primary mb-2" />
              <CardTitle>Secure Login</CardTitle>
              <CardDescription>Sign in with Internet Identity for secure, decentralized authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Why Internet Identity?</h4>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                      <li>• No passwords to remember</li>
                      <li>• Biometric authentication</li>
                      <li>• Complete privacy protection</li>
                      <li>• Decentralized and secure</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button onClick={handleInternetIdentityLogin} className="w-full" size="lg" disabled={authState.isLoading}>
                {authState.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Login with Internet Identity
                  </>
                )}
              </Button>
              
              {/* Development test button */}
              <Button 
                onClick={() => window.open('https://identity.ic0.app', '_blank')}
                variant="outline" 
                className="w-full" 
                size="sm"
              >
                🧪 Open Internet Identity
              </Button>
              
              <Button 
                onClick={async () => {
                  console.log('🔬 Testing ICP connections...');
                  
                  // Test anonymous connection
                  const anonymousTest = await icpService.testAnonymousConnection();
                  console.log('Anonymous connection test:', anonymousTest);
                  
                  // Test Internet Identity health
                  const iiHealth = await icpService.checkInternetIdentityHealth();
                  console.log('Internet Identity health:', iiHealth);
                  
                  alert(`Connection Tests:\nAnonymous backend: ${anonymousTest}\nInternet Identity: ${iiHealth}`);
                }}
                variant="outline" 
                className="w-full" 
                size="sm"
              >
                🔬 Test Backend Connection
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                New to Internet Identity?{" "}
                <a
                  href="https://identity.ic0.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Create your identity here
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Debug Panel */}
          <AuthDebug />

          <div className="text-center space-y-2">
            <h3 className="font-semibold text-foreground">How FlexWage Works</h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span>Businesses post last-minute shift openings</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>Workers claim shifts that fit their schedule</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>Get matched instantly for urgent staffing needs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <NotificationProvider>
      {!userType ? (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">FW</span>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">FlexWage</h1>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
              <p className="text-muted-foreground">Welcome! Choose your account type to get started.</p>
              {authState.principal && (
                <p className="text-xs text-muted-foreground">
                  Authenticated as: {authState.principal.toString().substring(0, 8)}...
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                onClick={() => handleUserTypeSelection("business")}
              >
                <CardHeader className="text-center">
                  <Building2 className="w-12 h-12 mx-auto text-primary mb-2" />
                  <CardTitle>I'm a Business</CardTitle>
                  <CardDescription>Post shifts and find qualified workers instantly</CardDescription>
                </CardHeader>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                onClick={() => handleUserTypeSelection("worker")}
              >
                <CardHeader className="text-center">
                  <Users className="w-12 h-12 mx-auto text-primary mb-2" />
                  <CardTitle>I'm a Worker</CardTitle>
                  <CardDescription>Find flexible shifts that fit your schedule</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      ) : showOnboarding ? (
        <OnboardingFlow userType={userType} onComplete={handleOnboardingComplete} />
      ) : userType === "business" ? (
        <BusinessDashboard userProfile={userProfile} onLogout={handleLogout} />
      ) : (
        <WorkerInterface userProfile={userProfile} onLogout={handleLogout} />
      )}
    </NotificationProvider>
  )
}

function BusinessDashboard({ userProfile, onLogout }: { userProfile: any; onLogout: () => void }) {
  const [shifts, setShifts] = useState<Shift[]>([
    {
      id: 1,
      role: "Server",
      date: "Today",
      time: "6:00 PM - 11:00 PM",
      pay: "$18/hr",
      location: userProfile?.businessName || "Downtown Diner",
      status: "open",
      applicants: [
        {
          id: 1,
          name: "Sarah Johnson",
          rating: 4.8,
          experience: "2 years serving",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        {
          id: 2,
          name: "Mike Chen",
          rating: 4.6,
          experience: "1 year serving",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        {
          id: 3,
          name: "Emma Davis",
          rating: 4.9,
          experience: "3 years serving",
          avatar: "/placeholder.svg?height=40&width=40",
        },
      ],
      description: "Busy dinner shift, experience with POS systems preferred",
      requirements: ["POS experience", "2+ years serving"],
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
      businessId: "business-1",
      estimatedDuration: "5 hours",
      isUrgent: true,
    },
    {
      id: 2,
      role: "Line Cook",
      date: "Tomorrow",
      time: "11:00 AM - 3:00 PM",
      pay: "$20/hr",
      location: userProfile?.businessName || "Downtown Diner",
      status: "approved",
      applicants: [],
      assignedWorker: { name: "Alex Rodriguez", rating: 4.7 },
      description: "Lunch prep and service, knife skills required",
      requirements: ["Knife skills", "Food safety certification"],
      createdAt: "2024-01-14T15:30:00Z",
      updatedAt: "2024-01-15T09:15:00Z",
      businessId: "business-1",
      estimatedDuration: "4 hours",
      isUrgent: false,
    },
  ])

  const notificationTriggers = useNotificationTriggers()

  const handleCreateShift = (shiftData: Partial<Shift>) => {
    const newShift: Shift = {
      id: shifts.length + 1,
      applicants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      businessId: "business-1",
      estimatedDuration: "4 hours",
      isUrgent: false,
      location: userProfile?.businessName || "Downtown Diner",
      ...shiftData,
    } as Shift
    setShifts([...shifts, newShift])

    if (newShift.status === "open") {
      notificationTriggers.triggerShiftPosted({
        role: newShift.role,
        time: newShift.time,
        date: newShift.date,
        pay: newShift.pay,
      })
    }
  }

  const handleUpdateShift = (id: number, updates: Partial<Shift>) => {
    setShifts(
      shifts.map((shift) => (shift.id === id ? { ...shift, ...updates, updatedAt: new Date().toISOString() } : shift)),
    )
  }

  const handleDeleteShift = (id: number) => {
    setShifts(shifts.filter((shift) => shift.id !== id))
  }

  const handleDuplicateShift = (id: number) => {
    const shiftToDuplicate = shifts.find((shift) => shift.id === id)
    if (shiftToDuplicate) {
      const duplicatedShift: Shift = {
        ...shiftToDuplicate,
        id: shifts.length + 1,
        status: "draft",
        applicants: [],
        assignedWorker: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setShifts([...shifts, duplicatedShift])
    }
  }

  const handleApproveApplicant = (shiftId: number, applicantId: number) => {
    const shift = shifts.find((s) => s.id === shiftId)
    const applicant = shift?.applicants.find((a) => a.id === applicantId)

    setShifts(
      shifts.map((shift) => {
        if (shift.id === shiftId) {
          const approvedApplicant = shift.applicants.find((a) => a.id === applicantId)
          return {
            ...shift,
            status: "approved" as const,
            assignedWorker: approvedApplicant,
            applicants: [],
            updatedAt: new Date().toISOString(),
          }
        }
        return shift
      }),
    )

    if (applicant && shift) {
      notificationTriggers.triggerShiftApproved(userProfile?.businessName || "Downtown Diner", {
        role: shift.role,
        time: shift.time,
        date: shift.date,
      })
    }
  }

  const handleRejectApplicant = (shiftId: number, applicantId: number) => {
    const shift = shifts.find((s) => s.id === shiftId)
    const applicant = shift?.applicants.find((a) => a.id === applicantId)

    setShifts(
      shifts.map((shift) => {
        if (shift.id === shiftId) {
          return {
            ...shift,
            applicants: shift.applicants.filter((a) => a.id !== applicantId),
            updatedAt: new Date().toISOString(),
          }
        }
        return shift
      }),
    )

    if (applicant && shift) {
      notificationTriggers.triggerShiftRejected(userProfile?.businessName || "Downtown Diner", {
        role: shift.role,
        time: shift.time,
        date: shift.date,
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Business Dashboard</h1>
              <p className="text-sm text-muted-foreground">{userProfile?.businessName || "Downtown Diner"}</p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationSettings />
              <NotificationBell />
              <Button variant="outline" size="sm" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Open Shifts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {shifts.filter((s) => s.status === "open").length}
                </div>
                <p className="text-xs text-muted-foreground">Need coverage</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {shifts.reduce((acc, shift) => acc + shift.applicants.length, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Waiting for review</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Filled Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {
                    shifts.filter(
                      (s) => ["approved", "in-progress", "completed"].includes(s.status) && s.date === "Today",
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">Successfully covered</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Fill Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">45m</div>
                <p className="text-xs text-muted-foreground">From post to approval</p>
              </CardContent>
            </Card>
          </div>

          <ShiftManagement
            shifts={shifts}
            onCreateShift={handleCreateShift}
            onUpdateShift={handleUpdateShift}
            onDeleteShift={handleDeleteShift}
            onDuplicateShift={handleDuplicateShift}
          />
        </div>
      </main>
    </div>
  )
}

function PostShiftForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    role: "",
    date: "",
    startTime: "",
    endTime: "",
    pay: "",
    location: "Downtown Diner",
    description: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      time: `${formData.startTime} - ${formData.endTime}`,
      pay: `$${formData.pay}/hr`,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
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
          <Label htmlFor="date">Date</Label>
          <Select value={formData.date} onValueChange={(value) => setFormData({ ...formData, date: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="Tomorrow">Tomorrow</SelectItem>
              <SelectItem value="This Weekend">This Weekend</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pay">Pay Rate</Label>
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
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
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
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Any specific requirements or notes..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full">
        Post Shift
      </Button>
    </form>
  )
}

function ApplicantsList({
  applicants,
  onApprove,
  onReject,
}: {
  applicants: any[]
  onApprove: (id: number) => void
  onReject: (id: number) => void
}) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium">Applicants ({applicants.length})</h4>
      {applicants.map((applicant) => (
        <div key={applicant.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={applicant.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {applicant.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{applicant.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {applicant.rating}
                </div>
                <span>•</span>
                <span>{applicant.experience}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReject(applicant.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Reject
            </Button>
            <Button size="sm" onClick={() => onApprove(applicant.id)} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

function WorkerInterface({ userProfile, onLogout }: { userProfile: any; onLogout: () => void }) {
  const [availableShifts, setAvailableShifts] = useState([
    {
      id: 1,
      role: "Server",
      business: "Downtown Diner",
      date: "Today",
      time: "6:00 PM - 11:00 PM",
      pay: "$18/hr",
      distance: "0.5 miles",
      description: "Busy dinner shift, experience with POS systems preferred",
      urgency: "high",
      postedTime: "2 hours ago",
      businessRating: 4.7,
      tips: "Good tips expected",
    },
    {
      id: 2,
      role: "Bartender",
      business: "Rooftop Lounge",
      date: "Tomorrow",
      time: "8:00 PM - 2:00 AM",
      pay: "$22/hr + tips",
      distance: "1.2 miles",
      description: "Weekend night shift, must have bartending experience",
      urgency: "medium",
      postedTime: "1 hour ago",
      businessRating: 4.5,
      tips: "High-volume bar",
    },
    {
      id: 3,
      role: "Cashier",
      business: "Corner Cafe",
      date: "Today",
      time: "2:00 PM - 6:00 PM",
      pay: "$16/hr",
      distance: "0.8 miles",
      description: "Afternoon shift, training provided",
      urgency: "low",
      postedTime: "30 minutes ago",
      businessRating: 4.3,
      tips: "Friendly environment",
    },
    {
      id: 4,
      role: "Line Cook",
      business: "Burger Palace",
      date: "Today",
      time: "11:00 AM - 4:00 PM",
      pay: "$19/hr",
      distance: "2.1 miles",
      description: "Lunch rush coverage needed, fast-paced kitchen",
      urgency: "high",
      postedTime: "45 minutes ago",
      businessRating: 4.2,
      tips: "Team-oriented workplace",
    },
  ])

  const [claimedShifts, setClaimedShifts] = useState<number[]>([])
  const [filterRole, setFilterRole] = useState<string>("all")
  const [filterDistance, setFilterDistance] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<"available" | "claimed">("available")

  const notificationTriggers = useNotificationTriggers()

  const handleClaimShift = (shiftId: number) => {
    const shift = availableShifts.find((s) => s.id === shiftId)
    setClaimedShifts([...claimedShifts, shiftId])

    if (shift) {
      notificationTriggers.triggerShiftClaimed(userProfile?.name || "David Martinez", {
        role: shift.role,
        time: shift.time,
        date: shift.date,
      })
    }
  }

  const filteredShifts = availableShifts.filter((shift) => {
    if (claimedShifts.includes(shift.id)) return false
    if (filterRole !== "all" && shift.role !== filterRole) return false
    if (filterDistance !== "all") {
      const distance = Number.parseFloat(shift.distance)
      if (filterDistance === "near" && distance > 1) return false
      if (filterDistance === "far" && distance <= 1) return false
    }
    return true
  })

  const myClaimedShifts = availableShifts.filter((shift) => claimedShifts.includes(shift.id))

  const workerProfileData = {
    name: userProfile?.name || "David Martinez",
    rating: 4.6,
    completedShifts: 23,
    skills: userProfile?.skills || ["Server", "Cashier", "Host/Hostess"],
    location: userProfile?.location || "Downtown Seattle",
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>
                  {workerProfileData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-semibold text-foreground">{workerProfileData.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {workerProfileData.rating}
                  </div>
                  <span>•</span>
                  <span>{workerProfileData.completedShifts} shifts</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationSettings />
              <NotificationBell />
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                Filter
              </Button>
              <Button variant="outline" size="sm" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </div>

          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <button
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === "available"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("available")}
            >
              Available ({filteredShifts.length})
            </button>
            <button
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === "claimed"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("claimed")}
            >
              My Claims ({myClaimedShifts.length})
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="border-t bg-muted/50 px-4 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Role</Label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="Server">Server</SelectItem>
                    <SelectItem value="Bartender">Bartender</SelectItem>
                    <SelectItem value="Cashier">Cashier</SelectItem>
                    <SelectItem value="Line Cook">Line Cook</SelectItem>
                    <SelectItem value="Host/Hostess">Host/Hostess</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Distance</Label>
                <Select value={filterDistance} onValueChange={setFilterDistance}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Distance</SelectItem>
                    <SelectItem value="near">Within 1 mile</SelectItem>
                    <SelectItem value="far">1+ miles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                Your Skills:
              </Badge>
              {workerProfileData.skills.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="px-4 py-4">
        {activeTab === "available" ? (
          <div className="space-y-4">
            {filteredShifts.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">No shifts available</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your filters or check back later</p>
              </div>
            ) : (
              filteredShifts.map((shift) => (
                <Card key={shift.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{shift.role}</h3>
                            {shift.urgency === "high" && (
                              <Badge variant="destructive" className="text-xs">
                                Urgent
                              </Badge>
                            )}
                            {workerProfileData.skills.includes(shift.role) && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                Your Skill
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground font-medium">{shift.business}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {shift.businessRating}
                            </div>
                            <span>•</span>
                            <span>{shift.postedTime}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{shift.pay}</div>
                          <div className="text-sm text-muted-foreground">{shift.distance}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-foreground">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">{shift.date}</span>
                          <span className="text-muted-foreground">• {shift.time}</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">{shift.description}</p>

                      {shift.tips && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            💡 {shift.tips}
                          </Badge>
                        </div>
                      )}

                      <Button className="w-full" onClick={() => handleClaimShift(shift.id)} size="lg">
                        Claim This Shift
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {myClaimedShifts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">No claimed shifts</h3>
                <p className="text-sm text-muted-foreground">Shifts you claim will appear here</p>
              </div>
            ) : (
              myClaimedShifts.map((shift) => (
                <Card key={shift.id} className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{shift.role}</h3>
                            <Badge className="text-xs">Claimed</Badge>
                          </div>
                          <p className="text-muted-foreground font-medium">{shift.business}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{shift.pay}</div>
                          <div className="text-sm text-muted-foreground">{shift.distance}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">
                          {shift.date} • {shift.time}
                        </span>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          <strong>Waiting for approval</strong> - The business will review your application and respond
                          soon.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
