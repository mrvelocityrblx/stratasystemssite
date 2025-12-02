import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Building2, Target, Users, Zap } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <div className="mx-auto max-w-7xl px-6 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-foreground mb-4">About Strata Systems</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We are building the future of AI-powered productivity tools, helping individuals and teams achieve more
              with intelligent automation.
            </p>
          </div>

          {/* Mission Section */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="flex flex-col gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-accent" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                At Strata Systems, our mission is to democratize access to cutting-edge AI technology. We believe that
                everyone should have access to powerful tools that enhance productivity, creativity, and decision-making
                capabilities.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                We envision a world where AI seamlessly integrates into daily workflows, eliminating repetitive tasks
                and empowering people to focus on what truly matters. Through innovative products like EchoAI and
                DayWise, we are making this vision a reality.
              </p>
            </div>
          </div>

          {/* Values Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-8">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg border border-border bg-card">
                <Building2 className="h-8 w-8 text-accent mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Innovation</h3>
                <p className="text-muted-foreground">
                  We constantly push the boundaries of what's possible with AI technology.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <Users className="h-8 w-8 text-accent mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">User-Centric</h3>
                <p className="text-muted-foreground">
                  Our users are at the heart of everything we build and every decision we make.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <Zap className="h-8 w-8 text-accent mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Excellence</h3>
                <p className="text-muted-foreground">
                  We strive for excellence in every aspect of our products and services.
                </p>
              </div>
            </div>
          </div>

          {/* Story Section */}
          <div className="bg-card rounded-lg border border-border p-8">
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Strata Systems was founded with a simple belief: artificial intelligence should be accessible,
                practical, and transformative for everyone. What started as a vision to create better productivity tools
                has evolved into a comprehensive suite of AI-powered solutions.
              </p>
              <p>
                Our flagship products, EchoAI and DayWise, represent our commitment to solving real-world problems with
                intelligent technology. EchoAI brings conversational AI to your fingertips, while DayWise revolutionizes
                how you manage your time and tasks.
              </p>
              <p>
                Today, we serve thousands of users worldwide, helping them work smarter, not harder. As we continue to
                grow, our commitment remains unchanged: to build AI tools that genuinely improve people's lives.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
