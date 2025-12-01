"use client"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Settings, LogOut, MessageSquare, Calendar, Shield, Crown, Home } from "lucide-react"
import { canAccessAdminPanel } from "@/lib/store"

export default function DashboardPage() {
  const {
    user,
    userAccount,
    loading,
    isAdmin,
    remainingGenerations,
    monthlyLimit,
    subscriptionActive,
    subscriptionDaysRemaining,
    signOut,
  } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const formatGenerations = () => {
    if (monthlyLimit === Number.POSITIVE_INFINITY) return "Unlimited"
    return remainingGenerations.toLocaleString()
  }

  const formatLimit = () => {
    if (monthlyLimit === Number.POSITIVE_INFINITY) return "Unlimited"
    return monthlyLimit.toLocaleString()
  }

  const getPlanDisplay = () => {
    if (isAdmin) return "Corporate Admin (Pro)"
    if (userAccount?.corporateRole === "corporate_developer") return "Corporate Developer (Pro)"
    if (userAccount?.corporateRole === "corporate_staff") return "Corporate Staff (Starter)"
    if (subscriptionActive) return userAccount?.plan === "pro" ? "Pro" : "Starter"
    return "Free"
  }

  const getLimitPeriod = () => {
    if (userAccount?.plan === "free" && !subscriptionActive && !userAccount?.corporateRole) {
      return "per day"
    }
    return "per month"
  }

  // Check if user can access admin panel
  const hasAdminPanelAccess = canAccessAdminPanel(user?.email || null)

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/strata-logo.png" alt="Strata Systems" width={40} height={40} className="rounded-lg" />
            <span className="text-xl font-bold text-foreground">Dashboard</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" title="Home">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Card */}
          <Card className="mb-8 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-2xl text-card-foreground">
                Welcome, {user.displayName || user.email}!
              </CardTitle>
              <CardDescription>Manage your account and access Strata Systems products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-lg font-semibold text-foreground flex items-center gap-2">
                    {getPlanDisplay()}
                    {(isAdmin || userAccount?.corporateRole) && <Crown className="h-4 w-4 text-yellow-500" />}
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Generations Remaining</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatGenerations()} / {formatLimit()}
                  </p>
                  <p className="text-xs text-muted-foreground">{getLimitPeriod()}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Subscription Status</p>
                  <p className="text-lg font-semibold text-foreground">
                    {subscriptionActive || userAccount?.corporateRole ? (
                      <span className="text-green-500">Active</span>
                    ) : (
                      <span className="text-muted-foreground">Free Tier</span>
                    )}
                  </p>
                  {subscriptionDaysRemaining !== null && subscriptionDaysRemaining > 0 && (
                    <p className="text-xs text-muted-foreground">{subscriptionDaysRemaining} days remaining</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/echoai">
              <Card className="border-border bg-card hover:bg-secondary/50 transition-colors cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-accent/10">
                      <MessageSquare className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">EchoAI</h3>
                      <p className="text-sm text-muted-foreground">AI-powered conversations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/daywise">
              <Card className="border-border bg-card hover:bg-secondary/50 transition-colors cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-green-500/10">
                      <Calendar className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">DayWise</h3>
                      <p className="text-sm text-muted-foreground">Smart scheduling assistant</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/settings">
              <Card className="border-border bg-card hover:bg-secondary/50 transition-colors cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-purple-500/10">
                      <Settings className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">Settings</h3>
                      <p className="text-sm text-muted-foreground">Manage your account</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Admin Panel - Only show if user has access */}
            {hasAdminPanelAccess && (
              <Link href="/admin">
                <Card className="border-border bg-card hover:bg-secondary/50 transition-colors cursor-pointer h-full border-yellow-500/30">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-yellow-500/10">
                        <Shield className="h-6 w-6 text-yellow-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                          Admin Panel
                          <Crown className="h-4 w-4 text-yellow-500" />
                        </h3>
                        <p className="text-sm text-muted-foreground">Manage users and system</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
