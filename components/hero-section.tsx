"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const { user } = useAuth()
  const router = useRouter()

  const handleGetStarted = () => {
    router.push("/signup")
  }

  return (
    <section id="home" className="pt-32 pb-20 px-6">
      <div className="mx-auto max-w-7xl text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-secondary/50 mb-8">
          <span className="w-2 h-2 rounded-full bg-accent"></span>
          <span className="text-sm text-muted-foreground">Introducing our latest AI models</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl mx-auto text-balance">
          The fastest and most powerful platform for building AI products
        </h1>

        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
          Build transformative AI experiences powered by industry-leading models and tools. Strata Systems delivers the
          intelligence your business needs.
        </p>

        {!user && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 px-8"
              onClick={handleGetStarted}
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
          <div className="text-lg font-semibold text-muted-foreground">TechCorp</div>
          <div className="text-lg font-semibold text-muted-foreground">Innovate</div>
          <div className="text-lg font-semibold text-muted-foreground">DataFlow</div>
          <div className="text-lg font-semibold text-muted-foreground">CloudBase</div>
        </div>
      </div>
    </section>
  )
}
