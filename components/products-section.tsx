"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Calendar, Check, Zap, Brain, Clock, ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export function ProductsSection() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const handleProductClick = (product: "echoai" | "daywise") => {
    if (loading) return

    if (!user) {
      // Not signed in, redirect to login
      router.push("/login")
    } else {
      // Signed in, go to the product
      router.push(`/${product}`)
    }
  }

  return (
    <section id="products" className="py-20 px-6 bg-secondary/30">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Flagship Models</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful AI solutions designed for a variety of real-world tasks with cutting-edge performance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* EchoAI Card */}
          <Card
            className="bg-card border-border hover:border-accent/50 transition-colors group cursor-pointer"
            onClick={() => handleProductClick("echoai")}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <MessageSquare className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-2xl text-foreground">EchoAI</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-accent"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleProductClick("echoai")
                  }}
                >
                  Launch <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <CardDescription className="text-muted-foreground text-base">
                Advanced conversational AI for seamless human-like interactions across all your applications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="h-5 w-5 text-accent" />
                  <span>Natural language understanding</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="h-5 w-5 text-accent" />
                  <span>Multi-language support</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="h-5 w-5 text-accent" />
                  <span>Context-aware responses</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="h-5 w-5 text-accent" />
                  <span>Real-time processing</span>
                </li>
              </ul>

              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <Zap className="h-5 w-5 mx-auto mb-2 text-accent" />
                  <p className="text-sm text-muted-foreground">Fast</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <Brain className="h-5 w-5 mx-auto mb-2 text-accent" />
                  <p className="text-sm text-muted-foreground">Smart</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <MessageSquare className="h-5 w-5 mx-auto mb-2 text-accent" />
                  <p className="text-sm text-muted-foreground">Natural</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DayWise Card */}
          <Card
            className="bg-card border-border hover:border-accent/50 transition-colors group cursor-pointer"
            onClick={() => handleProductClick("daywise")}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <Calendar className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-2xl text-foreground">DayWise</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-accent"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleProductClick("daywise")
                  }}
                >
                  Launch <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <CardDescription className="text-muted-foreground text-base">
                Intelligent productivity AI that optimizes your schedule and automates daily workflows.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="h-5 w-5 text-accent" />
                  <span>Smart scheduling</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="h-5 w-5 text-accent" />
                  <span>Task prioritization</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="h-5 w-5 text-accent" />
                  <span>Calendar integration</span>
                </li>
                <li className="flex items-center gap-3 text-foreground">
                  <Check className="h-5 w-5 text-accent" />
                  <span>Automated reminders</span>
                </li>
              </ul>

              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <Clock className="h-5 w-5 mx-auto mb-2 text-accent" />
                  <p className="text-sm text-muted-foreground">Efficient</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <Brain className="h-5 w-5 mx-auto mb-2 text-accent" />
                  <p className="text-sm text-muted-foreground">Adaptive</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary">
                  <Calendar className="h-5 w-5 mx-auto mb-2 text-accent" />
                  <p className="text-sm text-muted-foreground">Organized</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-foreground">20 days</p>
            <p className="text-muted-foreground mt-1">saved on daily tasks</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-foreground">98%</p>
            <p className="text-muted-foreground mt-1">accuracy rate</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-foreground">300%</p>
            <p className="text-muted-foreground mt-1">productivity increase</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-foreground">6x</p>
            <p className="text-muted-foreground mt-1">faster deployment</p>
          </div>
        </div>
      </div>
    </section>
  )
}
