"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { isMaintenanceMode, isCorporateAccount, getCorporateRole } from "@/lib/store"
import { useAuth } from "@/lib/auth-context"

interface MaintenanceWrapperProps {
  children: React.ReactNode
}

export function MaintenanceWrapper({ children }: MaintenanceWrapperProps) {
  const [inMaintenance, setInMaintenance] = useState(false)
  const [isCheckingMaintenance, setIsCheckingMaintenance] = useState(true)
  const { user } = useAuth()

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

  if (isCheckingMaintenance) {
    return null
  }

  if (inMaintenance) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="h-24 w-24 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-foreground mb-4">SITE IS UNDER MAINTENANCE</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            We're currently performing scheduled maintenance. Please check back soon.
          </p>
          <p className="text-muted-foreground text-sm mt-4">- Strata Systems Development Team</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
