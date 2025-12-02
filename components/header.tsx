"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Menu,
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
  HeadphonesIcon,
  Users,
  Info,
  Briefcase,
  FileText,
  ScrollText,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [teamModalOpen, setTeamModalOpen] = useState(false)
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

          <div className="hidden md:flex items-center gap-4">
            {/* Hamburger menu for sidebar */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                  <button
                    onClick={() => {
                      handleProductClick("echoai")
                      setSidebarOpen(false)
                    }}
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors text-left"
                  >
                    <Bot className="h-4 w-4" />
                    EchoAI
                  </button>
                  <button
                    onClick={() => {
                      handleProductClick("daywise")
                      setSidebarOpen(false)
                    }}
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors text-left"
                  >
                    <Calendar className="h-4 w-4" />
                    DayWise
                  </button>
                  <Link
                    href="#pricing"
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <CreditCard className="h-4 w-4" />
                    Pricing
                  </Link>
                  <Link
                    href="#faq"
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <HelpCircle className="h-4 w-4" />
                    FAQ
                  </Link>
                  <Dialog open={teamModalOpen} onOpenChange={setTeamModalOpen}>
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-2 text-sm hover:text-accent transition-colors text-left">
                        <Users className="h-4 w-4" />
                        Our Team
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Meet Our Team</DialogTitle>
                        <DialogDescription>The talented people behind Strata Systems</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-6 py-4">
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold text-foreground">CEO and Founder</h3>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                            <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                              <User className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Velocity</p>
                              <p className="text-sm text-muted-foreground">Chief Executive Officer</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold text-foreground">COO and Co-Founder</h3>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                            <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                              <User className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Bhulux</p>
                              <p className="text-sm text-muted-foreground">Chief Operating Officer</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold text-foreground">CTO</h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                              <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                                <User className="h-6 w-6 text-accent" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">Lucas</p>
                                <p className="text-sm text-muted-foreground">Chief Technology Officer</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                              <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                                <User className="h-6 w-6 text-accent" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">Tyler</p>
                                <p className="text-sm text-muted-foreground">Chief Technology Officer</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Link
                    href="/support"
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <HeadphonesIcon className="h-4 w-4" />
                    Support
                  </Link>
                  <Link
                    href="/about"
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Info className="h-4 w-4" />
                    About
                  </Link>
                  <Link
                    href="/careers"
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Briefcase className="h-4 w-4" />
                    Careers
                  </Link>
                  <Link
                    href="/privacy"
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <FileText className="h-4 w-4" />
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <ScrollText className="h-4 w-4" />
                    Terms of Service
                  </Link>
                </div>
              </SheetContent>
            </Sheet>

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
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                  <button
                    onClick={() => {
                      handleProductClick("echoai")
                      setSidebarOpen(false)
                    }}
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors text-left"
                  >
                    <Bot className="h-4 w-4" />
                    EchoAI
                  </button>
                  <button
                    onClick={() => {
                      handleProductClick("daywise")
                      setSidebarOpen(false)
                    }}
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors text-left"
                  >
                    <Calendar className="h-4 w-4" />
                    DayWise
                  </button>
                  <Link
                    href="#pricing"
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <CreditCard className="h-4 w-4" />
                    Pricing
                  </Link>
                  <Link
                    href="#faq"
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <HelpCircle className="h-4 w-4" />
                    FAQ
                  </Link>
                  <Dialog open={teamModalOpen} onOpenChange={setTeamModalOpen}>
                    <DialogTrigger asChild>
                      <button className="flex items-center gap-2 text-sm hover:text-accent transition-colors text-left">
                        <Users className="h-4 w-4" />
                        Our Team
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Meet Our Team</DialogTitle>
                        <DialogDescription>The talented people behind Strata Systems</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-6 py-4">
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold text-foreground">CEO and Founder</h3>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                            <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                              <User className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Velocity</p>
                              <p className="text-sm text-muted-foreground">Chief Executive Officer</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold text-foreground">COO and Co-Founder</h3>
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                            <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                              <User className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">Bhulux</p>
                              <p className="text-sm text-muted-foreground">Chief Operating Officer</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-lg font-semibold text-foreground">CTO</h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                              <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                                <User className="h-6 w-6 text-accent" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">Lucas</p>
                                <p className="text-sm text-muted-foreground">Chief Technology Officer</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                              <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                                <User className="h-6 w-6 text-accent" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">Tyler</p>
                                <p className="text-sm text-muted-foreground">Chief Technology Officer</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Link
                    href="/support"
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <HeadphonesIcon className="h-4 w-4" />
                    Support
                  </Link>
                  <Link
                    href="/about"
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Info className="h-4 w-4" />
                    About
                  </Link>
                  <Link
                    href="/careers"
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Briefcase className="h-4 w-4" />
                    Careers
                  </Link>
                  <Link
                    href="/privacy"
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <FileText className="h-4 w-4" />
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <ScrollText className="h-4 w-4" />
                    Terms of Service
                  </Link>

                  {user ? (
                    <div className="flex flex-col gap-2 pt-4 border-t border-border mt-4">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                      <Link href="/dashboard" onClick={() => setSidebarOpen(false)}>
                        <Button variant="ghost" className="text-foreground justify-start w-full">
                          <User className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/settings" onClick={() => setSidebarOpen(false)}>
                        <Button variant="ghost" className="text-foreground justify-start w-full">
                          <Settings className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setSidebarOpen(false)}>
                          <Button variant="ghost" className="text-accent justify-start w-full">
                            <Shield className="h-4 w-4 mr-2" />
                            Admin Panel
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        className="text-red-500 justify-start w-full"
                        onClick={() => {
                          handleSignOut()
                          setSidebarOpen(false)
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 pt-4 border-t border-border mt-4">
                      <Link href="/login" onClick={() => setSidebarOpen(false)}>
                        <Button variant="ghost" className="text-foreground justify-start w-full">
                          Log in
                        </Button>
                      </Link>
                      <Button
                        onClick={() => {
                          handleGetStarted()
                          setSidebarOpen(false)
                        }}
                        className="bg-foreground text-background hover:bg-foreground/90 w-full"
                      >
                        Get Started
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  )
}
