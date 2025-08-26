"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { icpService } from "@/lib/icp"
import { Principal } from "@dfinity/principal"

export function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({
    isClientReady: false,
    isAuthenticated: false,
    principal: null,
    error: null,
    logs: [],
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    checkDebugStatus()
  }, [])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugInfo(prev => ({
      ...prev,
      logs: [...prev.logs, `[${timestamp}] ${message}`]
    }))
  }

  const checkDebugStatus = async () => {
    addLog("🔍 Starting debug check...")
    try {
      await icpService.init()
      addLog("✅ ICP Service initialized")
      
      const isAuth = await icpService.isAuthenticated()
      addLog(`🔐 Authentication status: ${isAuth}`)
      
      const principal = icpService.getPrincipal()
      addLog(`👤 Principal: ${principal?.toString() || 'null'}`)
      
      setDebugInfo(prev => ({
        ...prev,
        isClientReady: true,
        isAuthenticated: isAuth,
        principal: principal?.toString() || null,
        error: null,
      }))
    } catch (error) {
      addLog(`❌ Debug check failed: ${error}`)
      setDebugInfo(prev => ({
        ...prev,
        error: error.toString(),
      }))
    }
  }

  const testDirectLogin = async () => {
    setIsLoading(true)
    addLog("🧪 Starting direct login test...")
    
    try {
      const success = await icpService.login()
      addLog(`📝 Login result: ${success}`)
      
      if (success) {
        const isAuth = await icpService.isAuthenticated()
        const principal = icpService.getPrincipal()
        
        addLog(`✅ Post-login auth status: ${isAuth}`)
        addLog(`👤 Post-login principal: ${principal?.toString()}`)
        
        setDebugInfo(prev => ({
          ...prev,
          isAuthenticated: isAuth,
          principal: principal?.toString() || null,
        }))
      }
    } catch (error) {
      addLog(`❌ Direct login failed: ${error}`)
      setDebugInfo(prev => ({
        ...prev,
        error: error.toString(),
      }))
    }
    
    setIsLoading(false)
  }

  const testDirectII = () => {
    addLog("🌐 Opening Internet Identity directly...")
    window.open('http://127.0.0.1:4943/?canisterId=uzt4z-lp777-77774-qaabq-cai', '_blank')
  }

  const clearLogs = () => {
    setDebugInfo(prev => ({ ...prev, logs: [] }))
  }

  const testHealthCheck = async () => {
    addLog("❤️ Testing backend health...")
    try {
      const healthy = await icpService.healthCheck()
      addLog(`📊 Backend health: ${healthy}`)
    } catch (error) {
      addLog(`❌ Health check failed: ${error}`)
    }
  }

  const testIIHealth = async () => {
    addLog("🌐 Testing Internet Identity health...")
    try {
      const healthy = await icpService.checkInternetIdentityHealth()
      addLog(`🌐 Internet Identity health: ${healthy}`)
    } catch (error) {
      addLog(`❌ II health check failed: ${error}`)
    }
  }

  const testAssetLoading = async () => {
    addLog("💬 Testing asset loading with canister ID...")
    try {
      const working = await icpService.testAssetLoading()
      addLog(`💾 Asset loading test: ${working ? '✅ PASS' : '❌ FAIL'}`)
    } catch (error) {
      addLog(`❌ Asset test failed: ${error}`)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🔧 Authentication Debug Panel</CardTitle>
        <CardDescription>Debugging Internet Identity authentication issues</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Client Ready:</p>
            <Badge variant={debugInfo.isClientReady ? "default" : "secondary"}>
              {debugInfo.isClientReady ? "✅ Ready" : "⏳ Initializing"}
            </Badge>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Authenticated:</p>
            <Badge variant={debugInfo.isAuthenticated ? "default" : "destructive"}>
              {debugInfo.isAuthenticated ? "✅ Yes" : "❌ No"}
            </Badge>
          </div>
        </div>

        {/* Principal Display */}
        {debugInfo.principal && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Principal:</p>
            <code className="text-xs bg-muted p-2 rounded block break-all">
              {debugInfo.principal}
            </code>
          </div>
        )}

        {/* Error Display */}
        {debugInfo.error && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-red-600">Error:</p>
            <code className="text-xs bg-red-50 text-red-700 p-2 rounded block">
              {debugInfo.error}
            </code>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={checkDebugStatus} variant="outline" size="sm">
            🔄 Refresh Status
          </Button>
          <Button onClick={testDirectLogin} disabled={isLoading} size="sm">
            {isLoading ? "⏳ Testing..." : "🧪 Test Login"}
          </Button>
          <Button onClick={testDirectII} variant="outline" size="sm">
            🌐 Open II Direct
          </Button>
          <Button onClick={testHealthCheck} variant="outline" size="sm">
            ❤️ Backend Health
          </Button>
          <Button onClick={testIIHealth} variant="outline" size="sm">
            🌐 II Health
          </Button>
          <Button onClick={testAssetLoading} variant="outline" size="sm">
            💾 Test Assets
          </Button>
        </div>

        {/* Logs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Debug Logs:</p>
            <Button onClick={clearLogs} variant="ghost" size="sm">
              🗑️ Clear
            </Button>
          </div>
          <div className="bg-black text-green-400 p-3 rounded text-xs font-mono h-48 overflow-y-auto">
            {debugInfo.logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              debugInfo.logs.map((log, i) => (
                <div key={i} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
