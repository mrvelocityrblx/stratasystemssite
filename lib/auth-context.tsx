"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { auth } from "@/lib/firebase"
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from "firebase/auth"
import {
  saveUser,
  getRemainingGenerations,
  getMonthlyLimit,
  isSubscriptionActive,
  getSubscriptionDaysRemaining,
  hasAdminAccess,
  getCorporateRole,
  getForceAccessSession,
  clearForceAccessSession,
  getUserByEmail,
  type UserAccount,
  type CorporateRole,
} from "@/lib/store"

interface AuthContextType {
  user: User | null
  userAccount: UserAccount | null
  loading: boolean
  isAdmin: boolean
  corporateRole: CorporateRole
  remainingGenerations: number
  monthlyLimit: number
  subscriptionActive: boolean
  subscriptionDaysRemaining: number | null
  refreshGenerations: () => void
  isForceAccess: boolean
  clearForceAccess: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userAccount: null,
  loading: true,
  isAdmin: false,
  corporateRole: null,
  remainingGenerations: 1000,
  monthlyLimit: 1000,
  subscriptionActive: false,
  subscriptionDaysRemaining: null,
  refreshGenerations: () => {},
  isForceAccess: false,
  clearForceAccess: () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [remainingGenerations, setRemainingGenerations] = useState(1000)
  const [monthlyLimit, setMonthlyLimit] = useState(1000)
  const [subscriptionActive, setSubscriptionActive] = useState(false)
  const [subscriptionDaysRemaining, setSubscriptionDaysRemaining] = useState<number | null>(null)
  const [isForceAccess, setIsForceAccess] = useState(false)

  const refreshGenerations = () => {
    if (user && userAccount) {
      setRemainingGenerations(getRemainingGenerations(user.uid))
      setMonthlyLimit(getMonthlyLimit(userAccount))
    }
  }

  const clearForceAccess = () => {
    clearForceAccessSession()
    setIsForceAccess(false)
    setUser(null)
    setUserAccount(null)
    window.location.href = "/login"
  }

  const signOut = async () => {
    // Clear force access session first
    clearForceAccessSession()
    setIsForceAccess(false)

    // Sign out from Firebase
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error("Error signing out from Firebase:", error)
    }

    // Clear user state
    setUser(null)
    setUserAccount(null)
    setRemainingGenerations(1000)
    setMonthlyLimit(1000)
    setSubscriptionActive(false)
    setSubscriptionDaysRemaining(null)
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const accessEmail = urlParams.get("access")

    // Only use force access if we're actively accessing via URL parameter
    if (accessEmail) {
      const forceSession = getForceAccessSession()
      if (forceSession && forceSession.email === accessEmail) {
        // Create a mock user object for force access
        const mockUser = {
          uid: forceSession.uid,
          email: forceSession.email,
          displayName: forceSession.displayName,
        } as User

        setUser(mockUser)
        setIsForceAccess(true)

        // Get the user account from store
        const account = getUserByEmail(forceSession.email)
        if (account) {
          setUserAccount(account)
          setRemainingGenerations(getRemainingGenerations(forceSession.uid))
          setMonthlyLimit(getMonthlyLimit(account))
          setSubscriptionActive(isSubscriptionActive(account))
          setSubscriptionDaysRemaining(getSubscriptionDaysRemaining(account))
        }

        setLoading(false)
        return
      }
    }

    const forceSession = getForceAccessSession()
    if (forceSession && !accessEmail) {
      // Clear stale force access session on fresh page load
      clearForceAccessSession()
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        setIsForceAccess(false)

        // Save/update user in store
        const savedUser = saveUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.displayName,
        })
        setUserAccount(savedUser || null)

        if (savedUser) {
          setRemainingGenerations(getRemainingGenerations(firebaseUser.uid))
          setMonthlyLimit(getMonthlyLimit(savedUser))
          setSubscriptionActive(isSubscriptionActive(savedUser))
          setSubscriptionDaysRemaining(getSubscriptionDaysRemaining(savedUser))
        }
      } else {
        // No Firebase user and no valid force access - user is signed out
        setUser(null)
        setUserAccount(null)
        setIsForceAccess(false)
        setRemainingGenerations(1000)
        setMonthlyLimit(1000)
        setSubscriptionActive(false)
        setSubscriptionDaysRemaining(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const isAdmin = hasAdminAccess(user?.email || null)
  const corporateRole = getCorporateRole(user?.email || null)

  return (
    <AuthContext.Provider
      value={{
        user,
        userAccount,
        loading,
        isAdmin,
        corporateRole,
        remainingGenerations,
        monthlyLimit,
        subscriptionActive,
        subscriptionDaysRemaining,
        refreshGenerations,
        isForceAccess,
        clearForceAccess,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
