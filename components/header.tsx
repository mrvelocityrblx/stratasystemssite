"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Menu,
  User,
  Shield,
  Calendar,
  Home,
  HelpCircle,
  Users,
  Briefcase,
  FileText,
  MessageSquare,
  Building2,
  Headphones,
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [teamModalOpen, setTeamModalOpen] = useState(false)
  const [showTeamDialog, setShowTeamDialog] = useState(false)
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

  const handleTeamClick = () => {
    setShowTeamDialog(true)
  }

  const handleFaqClick = (e: any) => {
    // Handle FAQ click event here
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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
                    <MessageSquare className="h-4 w-4" />
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
                    href="/about"
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Building2 className="h-4 w-4" />
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
                    href="/support"
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Headphones className="h-4 w-4" />
                    Support
                  </Link>
                  <button
                    onClick={() => {
                      handleTeamClick()
                      setSidebarOpen(false)
                    }}
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors text-left"
                  >
                    <Users className="h-4 w-4" />
                    Our Team
                  </button>
                  <Link
                    href="#faq"
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                    onClick={(e) => {
                      handleFaqClick(e)
                      setSidebarOpen(false)
                    }}
                  >
                    <HelpCircle className="h-4 w-4" />
                    FAQ
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
                    <FileText className="h-4 w-4" />
                    Terms of Service
                  </Link>
                  <Link
                    href="/security"
                    className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    Security
                  </Link>
                </div>
              </SheetContent>
            </Sheet>

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
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button variant="outline" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Team Members Dialog */}
      <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
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
                  <p className="font-medium text-foreground">Clay Worley</p>
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
                  <p className="font-medium text-foreground">Placeholder</p>
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
                    <p className="font-medium text-foreground">Placeholder</p>
                    <p className="text-sm text-muted-foreground">Chief Technology Officer</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                  <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <User className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Placeholder</p>
                    <p className="text-sm text-muted-foreground">Chief Technology Officer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Dialogs */}
      {/* Product dialogs code here */}
    </header>
  )
}
