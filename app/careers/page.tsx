import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Briefcase, MapPin, Clock, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CareersPage() {
  const openPositions = [
    {
      title: "Senior Full Stack Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      salary: "$120k - $180k",
      description:
        "Join our engineering team to build the next generation of AI-powered productivity tools. You'll work with cutting-edge technologies and shape the future of our platform.",
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      salary: "$100k - $140k",
      description:
        "Help us create beautiful, intuitive interfaces that make AI accessible to everyone. You'll work closely with engineering and product teams to deliver exceptional user experiences.",
    },
    {
      title: "AI/ML Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      salary: "$140k - $200k",
      description:
        "Push the boundaries of what's possible with AI. Work on training, fine-tuning, and deploying machine learning models that power our products.",
    },
    {
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Remote",
      type: "Full-time",
      salary: "$80k - $110k",
      description:
        "Be the voice of our customers and help them succeed with our products. You'll build relationships, provide support, and gather feedback to improve our offerings.",
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <div className="mx-auto max-w-7xl px-6 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-foreground mb-4">Join Our Team</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Help us build the future of AI-powered productivity. We're looking for talented, passionate people to join
              our growing team.
            </p>
          </div>

          {/* Why Work Here */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-8">Why Strata Systems?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="text-xl font-semibold text-foreground mb-2">Cutting-Edge Technology</h3>
                <p className="text-muted-foreground">
                  Work with the latest AI technologies and frameworks. We're always exploring new frontiers.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="text-xl font-semibold text-foreground mb-2">Remote-First Culture</h3>
                <p className="text-muted-foreground">
                  Work from anywhere in the world. We believe in flexibility and work-life balance.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="text-xl font-semibold text-foreground mb-2">Growth Opportunities</h3>
                <p className="text-muted-foreground">
                  Grow your skills and career with us. We invest in our team's professional development.
                </p>
              </div>
            </div>
          </div>

          {/* Open Positions */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8">Open Positions</h2>
            <div className="space-y-6">
              {openPositions.map((position, index) => (
                <div
                  key={index}
                  className="p-6 rounded-lg border border-border bg-card hover:border-accent transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-2xl font-semibold text-foreground mb-2">{position.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {position.department}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {position.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {position.type}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {position.salary}
                        </div>
                      </div>
                    </div>
                    <Link href="/support">
                      <Button className="whitespace-nowrap">Apply Now</Button>
                    </Link>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{position.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-accent/10 rounded-lg border border-accent/20 p-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Don't See a Perfect Fit?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We're always interested in hearing from talented people. Send us your resume and let us know what you're
              passionate about.
            </p>
            <Link href="/support">
              <Button size="lg" className="bg-accent hover:bg-accent/90">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
