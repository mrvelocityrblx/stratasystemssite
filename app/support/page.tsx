"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Send, Loader2, MessageSquare, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { createSupportTicket, getUserSupportTickets, type SupportTicket } from "@/lib/store"
import { Badge } from "@/components/ui/badge"

export default function SupportPage() {
  const { user, userAccount, loading } = useAuth()
  const router = useRouter()
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [userTickets, setUserTickets] = useState<SupportTicket[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
    if (user?.email) {
      setUserTickets(getUserSupportTickets(user.email))
    }
  }, [loading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !subject.trim() || !message.trim()) return

    setIsSubmitting(true)
    try {
      const success = createSupportTicket({
        userId: user.uid,
        userEmail: user.email || "",
        userName: userAccount?.displayName || "User",
        subject: subject.trim(),
        message: message.trim(),
        priority,
      })

      if (success) {
        setStatusMessage({ type: "success", text: "Support ticket submitted successfully!" })
        setSubject("")
        setMessage("")
        setPriority("medium")
        setUserTickets(getUserSupportTickets(user.email || ""))
      } else {
        setStatusMessage({ type: "error", text: "Failed to submit ticket. Please try again." })
      }
    } catch (error) {
      setStatusMessage({ type: "error", text: "An error occurred. Please try again." })
    }
    setIsSubmitting(false)
    setTimeout(() => setStatusMessage(null), 5000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "in_progress":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "resolved":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "closed":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "medium":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "low":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

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
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <MessageSquare className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Support</h1>
                <p className="text-xs text-muted-foreground">Get help from our team</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/">
              <Image
                src="/images/strata-logo.png"
                alt="Strata Systems Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              statusMessage.type === "success"
                ? "bg-green-500/10 border border-green-500/20 text-green-500"
                : "bg-red-500/10 border border-red-500/20 text-red-500"
            }`}
          >
            {statusMessage.type === "error" && <AlertCircle className="h-5 w-5" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Submit a Ticket</CardTitle>
              <CardDescription>Describe your issue and our support team will assist you</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of your issue"
                    className="bg-input border-border"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Provide details about your issue..."
                    className="bg-input border-border min-h-[150px]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || !subject.trim() || !message.trim()}
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Ticket
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">Your Tickets</CardTitle>
              <CardDescription>Track the status of your support requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {userTickets.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No tickets yet</p>
                ) : (
                  userTickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 rounded-lg border border-border bg-secondary/50 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-foreground text-sm">{ticket.subject}</h3>
                        <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("_", " ")}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{ticket.message}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                        <span className="text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
