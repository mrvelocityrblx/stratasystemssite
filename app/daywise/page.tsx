"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import {
  Calendar,
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  ListOrdered,
  Lightbulb,
  Clock,
  Loader2,
  CheckCircle2,
  Circle,
  Wand2,
  AlertTriangle,
  Crown,
  Home,
  Flag,
  CalendarIcon,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { incrementGeneration, getRemainingGenerations, getMonthlyLimit } from "@/lib/store"

interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: "high" | "medium" | "low"
  duration?: string
  dueDate?: Date
  dueTime?: string
}

export default function DayWisePage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Review project proposal",
      completed: false,
      priority: "high",
      duration: "30 min",
      dueDate: new Date(),
      dueTime: "14:00",
    },
    {
      id: "2",
      title: "Team standup meeting",
      completed: true,
      priority: "medium",
      duration: "15 min",
      dueDate: new Date(),
      dueTime: "09:00",
    },
    { id: "3", title: "Update documentation", completed: false, priority: "low", duration: "1 hour" },
  ])
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("medium")
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(undefined)
  const [newTaskDueTime, setNewTaskDueTime] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeAiAction, setActiveAiAction] = useState<string | null>(null)
  const [breakdownTask, setBreakdownTask] = useState("")
  const [generationsLeft, setGenerationsLeft] = useState(1000)
  const [limit, setLimit] = useState(1000)
  const { user, userAccount, loading, isAdmin, subscriptionActive, refreshGenerations } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, user, router])

  // Update generations left when user changes
  useEffect(() => {
    if (user && userAccount) {
      setGenerationsLeft(getRemainingGenerations(user.uid))
      setLimit(getMonthlyLimit(userAccount))
    }
  }, [user, userAccount])

  const formatGenerations = () => {
    if (limit === Number.POSITIVE_INFINITY) return "Unlimited"
    return generationsLeft.toLocaleString()
  }

  const addTask = () => {
    if (!newTaskTitle.trim()) return
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      dueTime: newTaskDueTime || undefined,
    }
    setTasks((prev) => [...prev, newTask])
    setNewTaskTitle("")
    setNewTaskPriority("medium")
    setNewTaskDueDate(undefined)
    setNewTaskDueTime("")
  }

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const updateTaskPriority = (id: string, priority: "high" | "medium" | "low") => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, priority } : task)))
  }

  const handleAiAction = async (action: string, additionalData?: any) => {
    if (!user) return

    if (tasks.length === 0 && action !== "breakdown") {
      setAiResponse("Please add some tasks first to use this feature.")
      return
    }

    if (limit !== Number.POSITIVE_INFINITY && generationsLeft <= 0) {
      setAiResponse(
        "You've reached your monthly limit. Please upgrade to Pro for more generations or wait until next month.",
      )
      return
    }

    setIsLoading(true)
    setActiveAiAction(action)
    setAiResponse("")

    try {
      const response = await fetch("/api/daywise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          data: {
            tasks: tasks
              .filter((t) => !t.completed)
              .map((t) => ({
                ...t,
                dueDate: t.dueDate ? format(t.dueDate, "yyyy-MM-dd") : undefined,
              })),
            ...additionalData,
          },
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

      setAiResponse(data.result)
    } catch (error) {
      console.error("Error:", error)
      setAiResponse("Sorry, I encountered an error. Please try again.")
    } finally {
      setIsLoading(false)
      setActiveAiAction(null)
    }
  }

  const handleBreakdown = () => {
    if (!breakdownTask.trim()) return
    handleAiAction("breakdown", { task: breakdownTask })
    setBreakdownTask("")
  }

  const completedCount = tasks.filter((t) => t.completed).length
  const totalCount = tasks.length

  // Sort tasks by priority and due date
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime()
    }
    if (a.dueDate) return -1
    if (b.dueDate) return 1
    return 0
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-500 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-500 border-green-500/30"
      default:
        return "bg-muted text-muted-foreground"
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

  const isLimitReached = limit !== Number.POSITIVE_INFINITY && generationsLeft <= 0
  const isLowGenerations = limit !== Number.POSITIVE_INFINITY && generationsLeft <= 100 && generationsLeft > 0

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">DayWise</h1>
                <p className="text-xs text-muted-foreground">AI Productivity Assistant</p>
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

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tasks Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Task */}
            <Card className="border-border bg-card">
              <CardContent className="pt-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    addTask()
                  }}
                  className="space-y-4"
                >
                  <div className="flex gap-3">
                    <Input
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Add a new task..."
                      className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                    <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                      <Plus className="h-5 w-5 mr-1" />
                      Add
                    </Button>
                  </div>

                  {/* Task options */}
                  <div className="flex flex-wrap gap-3">
                    {/* Priority selector */}
                    <Select
                      value={newTaskPriority}
                      onValueChange={(v) => setNewTaskPriority(v as "high" | "medium" | "low")}
                    >
                      <SelectTrigger className="w-[140px] bg-input border-border">
                        <Flag className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            High
                          </span>
                        </SelectItem>
                        <SelectItem value="medium">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            Medium
                          </span>
                        </SelectItem>
                        <SelectItem value="low">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Low
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Due date picker */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-[180px] justify-start text-left font-normal bg-input border-border"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newTaskDueDate ? format(newTaskDueDate, "MMM d, yyyy") : "Due date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={newTaskDueDate}
                          onSelect={setNewTaskDueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    {/* Due time input */}
                    <Input
                      type="time"
                      value={newTaskDueTime}
                      onChange={(e) => setNewTaskDueTime(e.target.value)}
                      className="w-[130px] bg-input border-border"
                      placeholder="Due time"
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Task List */}
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-card-foreground">Today's Tasks</CardTitle>
                    <CardDescription>
                      {completedCount} of {totalCount} tasks completed
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all"
                        style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Circle className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No tasks yet. Add your first task above!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sortedTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border ${
                            task.completed
                              ? "bg-secondary/50 border-border"
                              : "bg-card border-border hover:border-accent/50"
                          } transition-colors`}
                        >
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => toggleTask(task.id)}
                            className="mt-0.5 border-muted-foreground data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm ${
                                task.completed ? "line-through text-muted-foreground" : "text-foreground"
                              }`}
                            >
                              {task.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {task.duration && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {task.duration}
                                </span>
                              )}
                              {task.dueDate && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  {format(task.dueDate, "MMM d")}
                                  {task.dueTime && ` at ${task.dueTime}`}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Priority selector for existing task */}
                            <Select
                              value={task.priority}
                              onValueChange={(v) => updateTaskPriority(task.id, v as "high" | "medium" | "low")}
                            >
                              <SelectTrigger
                                className={`w-[100px] h-7 text-xs border ${getPriorityColor(task.priority)}`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteTask(task.id)}
                              className="text-muted-foreground hover:text-red-500 h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* AI Assistant Section */}
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <CardTitle className="text-card-foreground">AI Assistant</CardTitle>
                </div>
                <CardDescription>
                  Let AI help you optimize your day ({formatGenerations()} generations left)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="prioritize" className="w-full">
                  <TabsList className="grid grid-cols-2 gap-2 bg-secondary/50 p-1 h-auto">
                    <TabsTrigger value="prioritize" className="text-xs py-2">
                      <ListOrdered className="h-4 w-4 mr-1" />
                      Prioritize
                    </TabsTrigger>
                    <TabsTrigger value="suggest" className="text-xs py-2">
                      <Lightbulb className="h-4 w-4 mr-1" />
                      Suggest
                    </TabsTrigger>
                    <TabsTrigger value="schedule" className="text-xs py-2">
                      <Clock className="h-4 w-4 mr-1" />
                      Schedule
                    </TabsTrigger>
                    <TabsTrigger value="breakdown" className="text-xs py-2">
                      <Wand2 className="h-4 w-4 mr-1" />
                      Breakdown
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="prioritize" className="mt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Let AI analyze and prioritize your tasks based on importance, urgency, and due dates.
                    </p>
                    <Button
                      onClick={() => handleAiAction("prioritize")}
                      disabled={isLoading || tasks.filter((t) => !t.completed).length === 0 || isLimitReached}
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      {isLoading && activeAiAction === "prioritize" ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <ListOrdered className="h-4 w-4 mr-2" />
                          Prioritize Tasks
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="suggest" className="mt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Get AI suggestions for additional tasks based on your current list.
                    </p>
                    <Button
                      onClick={() => handleAiAction("suggest")}
                      disabled={isLoading || tasks.length === 0 || isLimitReached}
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      {isLoading && activeAiAction === "suggest" ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Thinking...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="h-4 w-4 mr-2" />
                          Get Suggestions
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="schedule" className="mt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Create an optimized daily schedule based on your tasks and their due times.
                    </p>
                    <Button
                      onClick={() => handleAiAction("schedule")}
                      disabled={isLoading || tasks.filter((t) => !t.completed).length === 0 || isLimitReached}
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      {isLoading && activeAiAction === "schedule" ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          Create Schedule
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="breakdown" className="mt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Break down a complex task into smaller, actionable steps.
                    </p>
                    <div className="space-y-3">
                      <Input
                        value={breakdownTask}
                        onChange={(e) => setBreakdownTask(e.target.value)}
                        placeholder="Enter a task to break down..."
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                        disabled={isLimitReached}
                      />
                      <Button
                        onClick={handleBreakdown}
                        disabled={isLoading || !breakdownTask.trim() || isLimitReached}
                        className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        {isLoading && activeAiAction === "breakdown" ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Breaking down...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4 mr-2" />
                            Break Down Task
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* AI Response */}
            {aiResponse && (
              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <CardTitle className="text-card-foreground text-base">AI Response</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="prose prose-sm prose-invert max-w-none">
                      <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">{aiResponse}</p>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
