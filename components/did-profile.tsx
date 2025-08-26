"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Shield, 
  Download, 
  Star, 
  Briefcase, 
  MapPin, 
  Calendar,
  DollarSign,
  Clock,
  Award,
  FileCheck,
  ExternalLink,
  Copy,
  CheckCircle2,
  User,
  Building2
} from "lucide-react"
import { icpService, type DIDDocument, type WorkHistory, type Rating } from "@/lib/icp"
import { toast } from "sonner"

interface DIDProfileProps {
  workerId: string
  workerName: string
  onClose?: () => void
  isPortableView?: boolean // For showing as a portable profile card
}

export function DIDProfile({ workerId, workerName, onClose, isPortableView = false }: DIDProfileProps) {
  const [didDocument, setDIDDocument] = useState<DIDDocument | null>(null)
  const [workHistory, setWorkHistory] = useState<WorkHistory[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadDIDData()
  }, [workerId])

  const loadDIDData = async () => {
    try {
      setIsLoading(true)
      
      // Load DID document, work history, and ratings in parallel
      const [didDoc, history, workerRatings] = await Promise.all([
        icpService.getWorkerDID(workerId),
        icpService.getWorkerHistory(workerId),
        icpService.getWorkerRatings(workerId)
      ])
      
      setDIDDocument(didDoc)
      setWorkHistory(history)
      setRatings(workerRatings)
    } catch (error) {
      console.error('Error loading DID data:', error)
      toast.error('Failed to load worker profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportDID = async () => {
    try {
      const exportedDID = await icpService.exportWorkerDID(workerId)
      
      // Create downloadable JSON file
      const dataStr = JSON.stringify(exportedDID, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `flexwage-did-${workerId.substring(0, 8)}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
      
      toast.success('DID document exported successfully!')
    } catch (error) {
      console.error('Error exporting DID:', error)
      toast.error('Failed to export DID document')
    }
  }

  const copyDIDLink = async () => {
    try {
      const didUrl = `${window.location.origin}/did/${workerId}`
      await navigator.clipboard.writeText(didUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('DID link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp)).toLocaleDateString()
  }

  const calculateTotalEarnings = () => {
    return workHistory.reduce((total, entry) => total + entry.pay_earned, 0)
  }

  const calculateTotalHours = () => {
    return workHistory.reduce((total, entry) => total + entry.hours_worked, 0)
  }

  const getAverageRating = () => {
    if (ratings.length === 0) return 0
    const sum = ratings.reduce((total, rating) => total + rating.rating, 0)
    return (sum / ratings.length).toFixed(1)
  }

  if (isLoading) {
    return (
      <Card className={isPortableView ? "max-w-2xl mx-auto" : ""}>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!didDocument) {
    return (
      <Card className={isPortableView ? "max-w-2xl mx-auto" : ""}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No DID Document Found</h3>
          <p className="text-sm text-muted-foreground text-center">
            This worker hasn't completed any verified work yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${isPortableView ? "max-w-4xl mx-auto" : ""}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src="/placeholder.svg?height=64&width=64" />
                <AvatarFallback className="text-lg">
                  {workerName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{workerName}</h2>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified DID
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span>{getAverageRating()} ({ratings.length} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{Number(didDocument.total_shifts)} shifts completed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Since {formatDate(didDocument.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <div className="text-xs font-mono bg-muted px-2 py-1 rounded">
                    DID: {workerId.substring(0, 16)}...
                  </div>
                  <Button variant="ghost" size="sm" onClick={copyDIDLink}>
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportDID}>
                <Download className="w-4 h-4 mr-2" />
                Export DID
              </Button>
              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{Number(didDocument.total_shifts)}</p>
                <p className="text-xs text-muted-foreground">Total Shifts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">${calculateTotalEarnings().toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{calculateTotalHours().toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Hours Worked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{getAverageRating()}</p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills & Details */}
      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="history">Work History</TabsTrigger>
          <TabsTrigger value="ratings">Reviews</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Verified Skills
              </CardTitle>
              <CardDescription>
                Skills verified through completed work assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {didDocument.skills_verified.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Work History
              </CardTitle>
              <CardDescription>
                Verified employment history with cryptographic integrity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {workHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No work history available</p>
              ) : (
                workHistory.map((entry, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{entry.role}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="w-4 h-4" />
                          <span>{entry.business_name}</span>
                          <MapPin className="w-4 h-4 ml-2" />
                          <span>{entry.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">${entry.pay_earned}</p>
                        <p className="text-sm text-muted-foreground">{entry.hours_worked}h</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{entry.date_worked}</span>
                      <div className="flex items-center gap-1">
                        <FileCheck className="w-3 h-3" />
                        <span>Verified: {entry.verification_hash.substring(0, 8)}...</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Reviews & Ratings
              </CardTitle>
              <CardDescription>
                Verified feedback from businesses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ratings.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No ratings available</p>
              ) : (
                ratings.map((rating, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < rating.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="font-semibold">{rating.rating}/5</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="w-4 h-4" />
                          <span>{rating.business_name}</span>
                          <span>•</span>
                          <span>{rating.role}</span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {rating.date_worked}
                      </div>
                    </div>
                    
                    {rating.comment && (
                      <p className="text-sm mt-2 p-3 bg-muted rounded">{rating.comment}</p>
                    )}
                    
                    <div className="flex items-center justify-end text-xs text-muted-foreground mt-2">
                      <FileCheck className="w-3 h-3 mr-1" />
                      <span>Verified: {rating.verification_hash.substring(0, 8)}...</span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                DID Technical Details
              </CardTitle>
              <CardDescription>
                Cryptographic verification and portability information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Worker ID</Label>
                  <div className="font-mono text-xs bg-muted p-2 rounded mt-1 break-all">
                    {didDocument.worker_id}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">DID Signature</Label>
                  <div className="font-mono text-xs bg-muted p-2 rounded mt-1 break-all">
                    {didDocument.signature}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <div className="text-sm mt-1">
                    {formatDate(didDocument.created_at)}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <div className="text-sm mt-1">
                    {formatDate(didDocument.updated_at)}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium">Portability Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Cryptographically signed work history</li>
                  <li>✓ Verifiable business ratings and reviews</li>
                  <li>✓ Skills certification through completed work</li>
                  <li>✓ Cross-platform identity portability</li>
                  <li>✓ Tamper-proof verification hashes</li>
                  <li>✓ Decentralized identity ownership</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Take Your Identity Anywhere</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      This DID document is portable and can be used across different platforms. 
                      Export it to prove your work history and ratings on other gig economy platforms.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
