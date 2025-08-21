"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  User,
  Briefcase,
  Clock,
  Star,
  Camera,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Shield,
} from "lucide-react"

interface OnboardingData {
  // Common fields
  userType: "business" | "worker"
  name: string
  email: string
  phone: string
  location: string

  // Worker-specific fields
  skills?: string[]
  experience?: string
  availability?: string[]
  bio?: string

  // Business-specific fields
  businessName?: string
  businessType?: string
  businessSize?: string
  address?: string
  description?: string
}

interface OnboardingFlowProps {
  userType: "business" | "worker"
  onComplete: (data: OnboardingData) => void
}

export function OnboardingFlow({ userType, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<OnboardingData>({
    userType,
    name: "",
    email: "",
    phone: "",
    location: "",
    skills: [],
    availability: [],
  })

  const workerSteps = [
    { id: "personal", title: "Personal Info", description: "Tell us about yourself" },
    { id: "skills", title: "Skills & Experience", description: "What can you do?" },
    { id: "availability", title: "Availability", description: "When can you work?" },
    { id: "profile", title: "Complete Profile", description: "Finish your profile" },
  ]

  const businessSteps = [
    { id: "business", title: "Business Info", description: "About your business" },
    { id: "contact", title: "Contact Details", description: "How workers can reach you" },
    { id: "preferences", title: "Preferences", description: "Set your hiring preferences" },
    { id: "verification", title: "Verification", description: "Verify your business" },
  ]

  const steps = userType === "worker" ? workerSteps : businessSteps
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(formData)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateFormData = (updates: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const isStepValid = () => {
    const step = steps[currentStep]

    if (userType === "worker") {
      switch (step.id) {
        case "personal":
          return formData.name && formData.email && formData.location
        case "skills":
          return formData.skills && formData.skills.length > 0 && formData.experience
        case "availability":
          return formData.availability && formData.availability.length > 0
        case "profile":
          return true
        default:
          return false
      }
    } else {
      switch (step.id) {
        case "business":
          return formData.businessName && formData.businessType && formData.location
        case "contact":
          return formData.name && formData.email && formData.phone
        case "preferences":
          return true
        case "verification":
          return true
        default:
          return false
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">FW</span>
              </div>
              <h1 className="text-2xl font-bold">FlexWage</h1>
            </div>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {userType === "worker" ? (
              <WorkerOnboardingStep step={steps[currentStep].id} formData={formData} updateFormData={updateFormData} />
            ) : (
              <BusinessOnboardingStep
                step={steps[currentStep].id}
                formData={formData}
                updateFormData={updateFormData}
              />
            )}

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <Button onClick={handleNext} disabled={!isStepValid()}>
                {currentStep === steps.length - 1 ? "Complete Setup" : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function WorkerOnboardingStep({
  step,
  formData,
  updateFormData,
}: {
  step: string
  formData: OnboardingData
  updateFormData: (updates: Partial<OnboardingData>) => void
}) {
  const availableSkills = [
    "Server",
    "Bartender",
    "Line Cook",
    "Prep Cook",
    "Dishwasher",
    "Host/Hostess",
    "Cashier",
    "Barista",
    "Food Runner",
    "Busser",
    "Kitchen Assistant",
  ]

  const availabilityOptions = [
    "Monday Morning",
    "Monday Afternoon",
    "Monday Evening",
    "Tuesday Morning",
    "Tuesday Afternoon",
    "Tuesday Evening",
    "Wednesday Morning",
    "Wednesday Afternoon",
    "Wednesday Evening",
    "Thursday Morning",
    "Thursday Afternoon",
    "Thursday Evening",
    "Friday Morning",
    "Friday Afternoon",
    "Friday Evening",
    "Saturday Morning",
    "Saturday Afternoon",
    "Saturday Evening",
    "Sunday Morning",
    "Sunday Afternoon",
    "Sunday Evening",
  ]

  switch (step) {
    case "personal":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Select value={formData.location} onValueChange={(value) => updateFormData({ location: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Downtown Seattle">Downtown Seattle</SelectItem>
                <SelectItem value="Capitol Hill">Capitol Hill</SelectItem>
                <SelectItem value="Belltown">Belltown</SelectItem>
                <SelectItem value="Queen Anne">Queen Anne</SelectItem>
                <SelectItem value="South Lake Union">South Lake Union</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
            />
          </div>
        </div>
      )

    case "skills":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Skills & Experience</h3>
          </div>

          <div className="space-y-2">
            <Label>Select Your Skills *</Label>
            <p className="text-sm text-muted-foreground">Choose all that apply</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableSkills.map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox
                    id={skill}
                    checked={formData.skills?.includes(skill)}
                    onCheckedChange={(checked) => {
                      const currentSkills = formData.skills || []
                      if (checked) {
                        updateFormData({ skills: [...currentSkills, skill] })
                      } else {
                        updateFormData({ skills: currentSkills.filter((s) => s !== skill) })
                      }
                    }}
                  />
                  <Label htmlFor={skill} className="text-sm">
                    {skill}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience Level *</Label>
            <Select value={formData.experience} onValueChange={(value) => updateFormData({ experience: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entry Level (0-1 years)</SelectItem>
                <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                <SelectItem value="experienced">Experienced (3-5 years)</SelectItem>
                <SelectItem value="expert">Expert (5+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Brief Bio (Optional)</Label>
            <Textarea
              id="bio"
              placeholder="Tell businesses a bit about yourself and your work style..."
              value={formData.bio}
              onChange={(e) => updateFormData({ bio: e.target.value })}
              rows={3}
            />
          </div>
        </div>
      )

    case "availability":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Availability</h3>
          </div>

          <div className="space-y-2">
            <Label>When are you available to work? *</Label>
            <p className="text-sm text-muted-foreground">Select all time slots you're available</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {availabilityOptions.map((slot) => (
                <div key={slot} className="flex items-center space-x-2">
                  <Checkbox
                    id={slot}
                    checked={formData.availability?.includes(slot)}
                    onCheckedChange={(checked) => {
                      const currentAvailability = formData.availability || []
                      if (checked) {
                        updateFormData({ availability: [...currentAvailability, slot] })
                      } else {
                        updateFormData({ availability: currentAvailability.filter((a) => a !== slot) })
                      }
                    }}
                  />
                  <Label htmlFor={slot} className="text-sm">
                    {slot}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case "profile":
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Complete Your Profile</h3>
          </div>

          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder.svg?height=96&width=96" />
                <AvatarFallback className="text-2xl">
                  {formData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>

            <Button variant="outline" size="sm">
              <Camera className="w-4 h-4 mr-2" />
              Add Profile Photo
            </Button>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Profile Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span>{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span>{formData.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experience:</span>
                  <span className="capitalize">{formData.experience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Skills:</span>
                  <span>{formData.skills?.length} selected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Availability:</span>
                  <span>{formData.availability?.length} time slots</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-800">Ready to Start!</h4>
                <p className="text-sm text-green-700">
                  Your profile is complete. You'll start receiving shift notifications based on your skills and
                  availability.
                </p>
              </div>
            </div>
          </div>
        </div>
      )

    default:
      return null
  }
}

function BusinessOnboardingStep({
  step,
  formData,
  updateFormData,
}: {
  step: string
  formData: OnboardingData
  updateFormData: (updates: Partial<OnboardingData>) => void
}) {
  switch (step) {
    case "business":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Business Information</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              placeholder="Enter your business name"
              value={formData.businessName}
              onChange={(e) => updateFormData({ businessName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type *</Label>
              <Select value={formData.businessType} onValueChange={(value) => updateFormData({ businessType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="cafe">Cafe</SelectItem>
                  <SelectItem value="bar">Bar/Lounge</SelectItem>
                  <SelectItem value="fast-food">Fast Food</SelectItem>
                  <SelectItem value="catering">Catering</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessSize">Business Size</Label>
              <Select value={formData.businessSize} onValueChange={(value) => updateFormData({ businessSize: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (1-10 employees)</SelectItem>
                  <SelectItem value="medium">Medium (11-50 employees)</SelectItem>
                  <SelectItem value="large">Large (50+ employees)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Select value={formData.location} onValueChange={(value) => updateFormData({ location: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Downtown Seattle">Downtown Seattle</SelectItem>
                <SelectItem value="Capitol Hill">Capitol Hill</SelectItem>
                <SelectItem value="Belltown">Belltown</SelectItem>
                <SelectItem value="Queen Anne">Queen Anne</SelectItem>
                <SelectItem value="South Lake Union">South Lake Union</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Full Address</Label>
            <Input
              id="address"
              placeholder="123 Main St, Seattle, WA 98101"
              value={formData.address}
              onChange={(e) => updateFormData({ address: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Business Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your business, atmosphere, and what makes it special..."
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              rows={3}
            />
          </div>
        </div>
      )

    case "contact":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Contact Information</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="managerName">Manager/Contact Name *</Label>
            <Input
              id="managerName"
              placeholder="Enter the hiring manager's name"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="manager@business.com"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => updateFormData({ phone: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Contact Information Usage</h4>
                <p className="text-sm text-blue-700 mt-1">
                  This information will be shared with workers when they're approved for shifts. We'll also use it to
                  send you important notifications about shift applications.
                </p>
              </div>
            </div>
          </div>
        </div>
      )

    case "preferences":
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Hiring Preferences</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Notification Preferences</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="instant-notifications" defaultChecked />
                  <Label htmlFor="instant-notifications" className="text-sm">
                    Instant notifications for new applications
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="daily-summary" />
                  <Label htmlFor="daily-summary" className="text-sm">
                    Daily summary of shift activity
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="worker-reminders" defaultChecked />
                  <Label htmlFor="worker-reminders" className="text-sm">
                    Send shift reminders to workers
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Auto-Approval Settings</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="auto-approve" />
                  <Label htmlFor="auto-approve" className="text-sm">
                    Auto-approve workers with 4.5+ rating
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="priority-workers" />
                  <Label htmlFor="priority-workers" className="text-sm">
                    Give priority to workers you've hired before
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Quick Tip</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  You can change these preferences anytime in your account settings. Fast responses to applications help
                  you secure the best workers!
                </p>
              </div>
            </div>
          </div>
        </div>
      )

    case "verification":
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Business Verification</h3>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Business Profile Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Business:</span>
                  <span>{formData.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="capitalize">{formData.businessType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span>{formData.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact:</span>
                  <span>{formData.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h4 className="font-medium">Verification Steps</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Email Verification</p>
                  <p className="text-sm text-muted-foreground">We'll send a verification link to {formData.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Phone Verification</p>
                  <p className="text-sm text-muted-foreground">SMS verification code to {formData.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium">Business License (Optional)</p>
                  <p className="text-sm text-muted-foreground">Upload business license for verified badge</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium text-green-800">Ready to Post Shifts!</h4>
                <p className="text-sm text-green-700">
                  Your business profile is set up. You can start posting shifts immediately and workers in your area
                  will be notified.
                </p>
              </div>
            </div>
          </div>
        </div>
      )

    default:
      return null
  }
}
