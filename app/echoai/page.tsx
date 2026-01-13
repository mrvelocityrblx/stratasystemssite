"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bot,
  Send,
  User,
  Loader2,
  ArrowLeft,
  Trash2,
  Sparkles,
  AlertTriangle,
  Crown,
  Home,
  History,
  Plus,
  MessageSquare,
  X,
  Power,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  incrementGeneration,
  getRemainingGenerations,
  getMonthlyLimit,
  getChatSessions,
  saveChatSession,
  deleteChatSession,
  isAIEnabled,
  type ChatSession,
} from "@/lib/store"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function EchoAIPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [generationsLeft, setGenerationsLeft] = useState(1000)
  const [limit, setLimit] = useState(1000)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { user, userAccount, loading, isAdmin, subscriptionActive, refreshGenerations } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  useEffect(() => {
    if (user && userAccount) {
      setGenerationsLeft(getRemainingGenerations(user.uid))
      setLimit(getMonthlyLimit(userAccount))
      setChatSessions(getChatSessions(user.uid))
    }
  }, [user, userAccount])

  useEffect(() => {
    const checkAI = () => {
      setAiEnabled(isAIEnabled())
    }
    checkAI()
    const interval = setInterval(checkAI, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  useEffect(() => {
    if (user && messages.length > 0) {
      const session: ChatSession = {
        id: currentSessionId || Date.now().toString(),
        title: messages[0]?.content.slice(0, 50) + (messages[0]?.content.length > 50 ? "..." : "") || "New Chat",
        messages: messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date().toISOString(),
        })),
        createdAt: currentSessionId
          ? chatSessions.find((s) => s.id === currentSessionId)?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (!currentSessionId) {
        setCurrentSessionId(session.id)
      }

      saveChatSession(user.uid, session)
      setChatSessions(getChatSessions(user.uid))
    }
  }, [messages, user])

  const formatGenerations = () => {
    if (limit === Number.POSITIVE_INFINITY) return "Unlimited"
    return generationsLeft.toLocaleString()
  }

  const formatLimit = () => {
    if (limit === Number.POSITIVE_INFINITY) return "Unlimited"
    return limit.toLocaleString()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !user) return

    if (!aiEnabled) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Our AI Application Has Been Turned Off - Strata Systems Development",
      }
      setMessages((prev) => [...prev, errorMessage])
      setInput("")
      return
    }

    if (limit !== Number.POSITIVE_INFINITY && generationsLeft <= 0) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "You've reached your monthly limit. Please upgrade to Pro for more generations or wait until next month.",
      }
      setMessages((prev) => [...prev, errorMessage])
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/echoai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userId: user.uid,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const result = incrementGeneration(user.uid)
      if (result.remaining !== Number.POSITIVE_INFINITY) {
        setGenerationsLeft(result.remaining)
      }
      refreshGenerations()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const startNewChat = () => {
    setMessages([])
    setCurrentSessionId(null)
    setShowHistory(false)
  }

  const loadSession = (session: ChatSession) => {
    setMessages(
      session.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
      })),
    )
    setCurrentSessionId(session.id)
    setShowHistory(false)
  }

  const deleteSession = (sessionId: string) => {
    if (user) {
      deleteChatSession(user.uid, sessionId)
      setChatSessions(getChatSessions(user.uid))
      if (currentSessionId === sessionId) {
        startNewChat()
      }
    }
  }

  const clearChat = () => {
    setMessages([])
    setCurrentSessionId(null)
  }

  const suggestedPrompts = [
    "Explain quantum computing in simple terms",
    "Help me write a professional email",
    "What are the best practices for React?",
    "Create a workout plan for beginners",
  ]

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-bold">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })
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

  const isLimitReached = limit !== Number.POSITIVE_INFINITY && generationsLeft <= 0
  const isLowGenerations = limit !== Number.POSITIVE_INFINITY && generationsLeft <= 100 && generationsLeft > 0

  if (!aiEnabled) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border bg-card sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Bot className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">EchoAI</h1>
                  <p className="text-xs text-muted-foreground">Conversational AI Assistant</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
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

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center">
            <div className="p-6 rounded-full bg-red-500/10 mb-6 inline-block">
              <Power className="h-16 w-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Our AI Application Has Been Turned Off</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              The AI service is currently unavailable. Please check back later.
            </p>
            <p className="text-muted-foreground text-sm mt-4">- Strata Systems Development</p>
            <Link href="/dashboard">
              <Button className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90">Return to Dashboard</Button>
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Bot className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">EchoAI</h1>
                <p className="text-xs text-muted-foreground">Conversational AI Assistant</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(subscriptionActive || isAdmin) && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20">
                <Crown className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs font-medium text-accent">Pro</span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">{formatGenerations()} left</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHistory(!showHistory)}
              className="text-muted-foreground hover:text-foreground"
              title="Chat history"
            >
              <History className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearChat}
              className="text-muted-foreground hover:text-foreground"
              title="Clear chat"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
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

      {isLowGenerations && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2">
          <div className="container mx-auto flex items-center gap-2 text-yellow-500 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>You have {generationsLeft.toLocaleString()} generations remaining this month.</span>
          </div>
        </div>
      )}

      {isLimitReached && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2">
          <div className="container mx-auto flex items-center gap-2 text-red-500 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>You've reached your monthly limit. Upgrade to Pro for more generations!</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {showHistory && (
          <div className="w-72 border-r border-border bg-card flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Chat History</h2>
              <Button variant="ghost" size="icon" onClick={startNewChat} title="New chat">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {chatSessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No chat history yet</p>
                ) : (
                  chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-secondary transition-colors ${
                        currentSessionId === session.id ? "bg-secondary" : ""
                      }`}
                      onClick={() => loadSession(session)}
                    >
                      <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-foreground truncate flex-1">{session.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteSession(session.id)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        <div className="flex-1 flex flex-col container mx-auto max-w-4xl px-4">
          <ScrollArea ref={scrollAreaRef} className="flex-1 py-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="p-4 rounded-full bg-accent/10 mb-6">
                  <Sparkles className="h-12 w-12 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to EchoAI</h2>
                <p className="text-muted-foreground text-center mb-8 max-w-md">
                  I'm your AI assistant powered by advanced language models. Ask me anything or try one of the
                  suggestions below.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                  {suggestedPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto py-3 px-4 text-left justify-start border-border bg-card hover:bg-secondary text-foreground"
                      onClick={() => {
                        setInput(prompt)
                        inputRef.current?.focus()
                      }}
                      disabled={isLimitReached}
                    >
                      <span className="line-clamp-2">{prompt}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-accent" />
                      </div>
                    )}
                    <Card
                      className={`max-w-[80%] p-4 ${
                        message.role === "user"
                          ? "bg-accent text-accent-foreground"
                          : "bg-card text-card-foreground border-border"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {renderMessageContent(message.content)}
                      </p>
                    </Card>
                    {message.role === "user" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-5 w-5 text-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-accent" />
                    </div>
                    <Card className="bg-card text-card-foreground border-border p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-accent" />
                        <span className="text-sm text-muted-foreground">EchoAI is thinking...</span>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="py-4 border-t border-border">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLimitReached ? "Monthly limit reached" : "Type your message..."}
                className="flex-1 bg-card border-border text-foreground placeholder:text-muted-foreground"
                disabled={isLoading || isLimitReached}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading || isLimitReached}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-3">
              EchoAI can make mistakes. Consider checking important information. ({formatGenerations()}/{formatLimit()}{" "}
              remaining this month)
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
