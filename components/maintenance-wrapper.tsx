"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AlertTriangle, Lock } from "lucide-react"
import { isMaintenanceMode, isCorporateAccount, getCorporateRole } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const ADMIN_BYPASS_CODE = "7736635722"

interface MaintenanceWrapperProps {
  children: React.ReactNode
}

export function MaintenanceWrapper({ children }: MaintenanceWrapperProps) {
  const [inMaintenance, setInMaintenance] = useState(false)
  const [isCheckingMaintenance, setIsCheckingMaintenance] = useState(true)
  const [bypassed, setBypassed] = useState(false)
  const [showPasscode, setShowPasscode] = useState(false)
  const [passcode, setPasscode] = useState("")
  const [error, setError] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    const storedBypass = sessionStorage.getItem("maintenance_bypass")
    if (storedBypass === "true") {
      setBypassed(true)
    }
  }, [])

  useEffect(() => {
    const checkMaintenance = () => {
      const maintenance = isMaintenanceMode()

      // Allow corporate accounts and developers to bypass maintenance
      if (user?.email) {
        const isCorp = isCorporateAccount(user.email)
        const role = getCorporateRole(user.email)
        if (isCorp || role === "corporate_developer") {
          setInMaintenance(false)
          setIsCheckingMaintenance(false)
          return
        }
      }

      setInMaintenance(maintenance)
      setIsCheckingMaintenance(false)
    }

    checkMaintenance()

    // Check periodically for maintenance mode changes
    const interval = setInterval(checkMaintenance, 5000)
    return () => clearInterval(interval)
  }, [user])

  const handlePasscodeSubmit = () => {
    if (passcode === ADMIN_BYPASS_CODE) {
      sessionStorage.setItem("maintenance_bypass", "true")
      setBypassed(true)
      setError("")
    } else {
      setError("Invalid passcode")
      setPasscode("")
    }
  }

  if (isCheckingMaintenance) {
    return null
  }

  if (inMaintenance && !bypassed) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
        <div className="text-center">
          <AlertTriangle className="h-24 w-24 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-foreground mb-4">SITE IS UNDER MAINTENANCE</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            We're currently performing scheduled maintenance. Please check back soon.
          </p>
          <p className="text-muted-foreground text-sm mt-4">- Strata Systems Development Team</p>
        </div>

        <div className="fixed bottom-4 right-4">
          {!showPasscode ? (
            <button
              onClick={() => setShowPasscode(true)}
              className="text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors p-2"
              title="Admin Access"
            >
              <Lock className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex flex-col gap-2 bg-card border border-border rounded-lg p-3 shadow-lg">
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePasscodeSubmit()}
                  className="w-32 h-8 text-sm"
                />
                <Button size="sm" onClick={handlePasscodeSubmit} className="h-8">
                  Enter
                </Button>
              </div>
              {error && <p className="text-destructive text-xs">{error}</p>}
            </div>
          )}
        </div>
      </div>
    )
  }

  return <>{children}</>
}
