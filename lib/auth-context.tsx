"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { getRemainingGenerations, getMonthlyLimit, isSubscriptionActive, getSubscriptionDaysRemaining, saveUser, type UserAccount } from "@/lib/store"
import type { GoogleAuthUser } from "@/lib/google-auth"

interface AuthContextType {
  user: GoogleAuthUser | null
  userAccount: UserAccount | null
  loading: boolean
  isAdmin: boolean
  remainingGenerations: number
  monthlyLimit: number
  subscriptionActive: boolean
  subscriptionDaysRemaining: number | null
  refreshGenerations: () => void
  signOut: () => Promise<void>
}
const AuthContext = createContext<AuthContextType>({ user: null, userAccount: null, loading: true, isAdmin: false, remainingGenerations: 1000, monthlyLimit: 1000, subscriptionActive: false, subscriptionDaysRemaining: null, refreshGenerations: () => {}, signOut: async () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GoogleAuthUser | null>(null)
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [remainingGenerations, setRemainingGenerations] = useState(1000)
  const [monthlyLimit, setMonthlyLimit] = useState(1000)
  const [subscriptionActive, setSubscriptionActive] = useState(false)
  const [subscriptionDaysRemaining, setSubscriptionDaysRemaining] = useState<number | null>(null)
  const refresh = (nextUser: GoogleAuthUser, account: UserAccount) => { setRemainingGenerations(getRemainingGenerations(nextUser.uid)); setMonthlyLimit(getMonthlyLimit(account)); setSubscriptionActive(isSubscriptionActive(account)); setSubscriptionDaysRemaining(getSubscriptionDaysRemaining(account)) }
  useEffect(() => { fetch("/api/auth/session").then((response) => response.json()).then(({ user: nextUser }) => { if (nextUser) { const account = saveUser(nextUser); setUser(nextUser); setUserAccount(account || null); if (account) refresh(nextUser, account) } }).finally(() => setLoading(false)) }, [])
  const signOut = async () => { await fetch("/api/auth/logout", { method: "POST" }); setUser(null); setUserAccount(null); setSubscriptionActive(false) }
  const refreshGenerations = () => { if (user && userAccount) refresh(user, userAccount) }
  return <AuthContext.Provider value={{ user, userAccount, loading, isAdmin: false, remainingGenerations, monthlyLimit, subscriptionActive, subscriptionDaysRemaining, refreshGenerations, signOut }}>{children}</AuthContext.Provider>
}
export function useAuth() { return useContext(AuthContext) }
