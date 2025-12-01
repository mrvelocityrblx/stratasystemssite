"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Sparkles,
  Crown,
  Shield,
  Bot,
  Calendar,
  Home,
  CreditCard,
  HelpCircle,
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, userAccount, isAdmin, remainingGenerations, monthlyLimit, subscriptionActive, corporateRole } =
    useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut(auth)
  }

  const formatGenerations = () => {
    if (monthlyLimit === Number.POSITIVE_INFINITY) return "Unlimited"
    return `${remainingGenerations}/${monthlyLimit}`
  }

  const handleProductClick = (product: "echoai" | "daywise") => {
    if (!user) {
      router.push("/login")
    } else {
      router.push(`/${product}`)
    }
  }

  const handleGetStarted = () => {
    router.push("/signup")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Image
              src="/images/strata-logo.png"
              alt="Strata Systems Logo"
              width={48}
              height={48}
              className="object-contain"
            />
            Strata Systems
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#home"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <button
              onClick={() => handleProductClick("echoai")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bot className="h-4 w-4" />
              EchoAI
            </button>
            <button
              onClick={() => handleProductClick("daywise")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Calendar className="h-4 w-4" />
              DayWise
            </button>
            <Link
              href="#pricing"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              Pricing
            </Link>
            <Link
              href="#faq"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              FAQ
            </Link>
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-3">
                {/* Corporate role badge */}
                {corporateRole && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <Shield className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-xs font-medium text-blue-500">
                      {corporateRole === "corporate_developer" ? "Developer" : "Staff"}
                    </span>
                  </div>
                )}

                {/* Subscription badge */}
                {(subscriptionActive || isAdmin) && !corporateRole && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20">
                    <Crown className="h-3.5 w-3.5 text-accent" />
                    <span className="text-xs font-medium text-accent">Pro</span>
                  </div>
                )}

                {/* Generations counter */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary border border-border">
                  <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{formatGenerations()}</span>
                </div>

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-accent" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-foreground">{userAccount?.displayName || "User"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer text-accent">
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-500">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-foreground">
                    Log in
                  </Button>
                </Link>
                <Button onClick={handleGetStarted} className="bg-foreground text-background hover:bg-foreground/90">
                  Get Started
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button className="text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 flex flex-col gap-4">
            <Link
              href="#home"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <button
              onClick={() => handleProductClick("echoai")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
            >
              <Bot className="h-4 w-4" />
              EchoAI
            </button>
            <button
              onClick={() => handleProductClick("daywise")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
            >
              <Calendar className="h-4 w-4" />
              DayWise
            </button>
            <Link
              href="#pricing"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              Pricing
            </Link>
            <Link
              href="#faq"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              FAQ
            </Link>

            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              {user ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    {corporateRole && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                        <Shield className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-xs font-medium text-blue-500">
                          {corporateRole === "corporate_developer" ? "Developer" : "Staff"}
                        </span>
                      </div>
                    )}
                    {(subscriptionActive || isAdmin) && !corporateRole && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20">
                        <Crown className="h-3.5 w-3.5 text-accent" />
                        <span className="text-xs font-medium text-accent">Pro</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary border border-border">
                      <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">{formatGenerations()}</span>
                    </div>
                  </div>
                  <Link href="/dashboard">
                    <Button variant="ghost" className="text-foreground justify-start w-full">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/settings">
                    <Button variant="ghost" className="text-foreground justify-start w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin">
                      <Button variant="ghost" className="text-accent justify-start w-full">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" className="text-red-500 justify-start w-full" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="text-foreground justify-start w-full">
                      Log in
                    </Button>
                  </Link>
                  <Button onClick={handleGetStarted} className="bg-foreground text-background hover:bg-foreground/90">
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
