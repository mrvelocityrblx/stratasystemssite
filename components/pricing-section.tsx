"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const pricingPlans = {
  monthly: [
    {
      name: "Starter",
      price: "$10",
      period: "/month",
      description: "Perfect for individuals and small projects",
      features: [
        "Access to EchoAI Basic",
        "Access to DayWise Basic",
        "1,000 API calls/month",
        "Email support",
        "Basic analytics",
      ],
      popular: false,
    },
    {
      name: "Pro",
      price: "$35",
      period: "/month",
      description: "Best for growing teams and businesses",
      features: [
        "Access to EchoAI Pro",
        "Access to DayWise Pro",
        "50,000 API calls/month",
        "Priority support",
        "Advanced analytics",
        "Custom integrations",
        "Team collaboration",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with specific needs",
      features: [
        "Unlimited API calls",
        "Dedicated account manager",
        "Custom model training",
        "SLA guarantees",
        "On-premise deployment",
        "Advanced security",
        "24/7 phone support",
      ],
      popular: false,
    },
  ],
  yearly: [
    {
      name: "Starter",
      price: "$99.99",
      period: "/year",
      description: "Perfect for individuals and small projects",
      features: [
        "Access to EchoAI Basic",
        "Access to DayWise Basic",
        "1,000 API calls/month",
        "Email support",
        "Basic analytics",
      ],
      popular: false,
      savings: "Save $20",
    },
    {
      name: "Pro",
      price: "$210",
      period: "/year",
      description: "Best for growing teams and businesses",
      features: [
        "Access to EchoAI Pro",
        "Access to DayWise Pro",
        "50,000 API calls/month",
        "Priority support",
        "Advanced analytics",
        "Custom integrations",
        "Team collaboration",
      ],
      popular: true,
      savings: "Save $210",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with specific needs",
      features: [
        "Unlimited API calls",
        "Dedicated account manager",
        "Custom model training",
        "SLA guarantees",
        "On-premise deployment",
        "Advanced security",
        "24/7 phone support",
      ],
      popular: false,
    },
  ],
}

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const [showComingSoon, setShowComingSoon] = useState(false)
  const router = useRouter()

  const plans = pricingPlans[billingPeriod]

  const handlePlanClick = (planName: string) => {
    if (planName === "Enterprise") {
      router.push("/support")
    } else {
      setShowComingSoon(true)
    }
  }

  return (
    <section id="pricing" className="py-20 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Simple, transparent pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose the plan that fits your needs. All plans include access to both EchoAI and DayWise.
          </p>

          <div className="inline-flex items-center gap-2 bg-muted p-1 rounded-full">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                billingPeriod === "yearly"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`bg-card border-border relative ${plan.popular ? "border-accent ring-1 ring-accent" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-accent-foreground text-sm font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl text-foreground">{plan.name}</CardTitle>
                <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                {"savings" in plan && plan.savings && (
                  <span className="inline-block mt-2 text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                    {plan.savings}
                  </span>
                )}
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-foreground">
                      <Check className="h-5 w-5 text-accent flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handlePlanClick(plan.name)}
                  className={`w-full ${
                    plan.popular
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : "bg-foreground text-background hover:bg-foreground/90"
                  }`}
                >
                  {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <AlertDialog open={showComingSoon} onOpenChange={setShowComingSoon}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Coming Soon</AlertDialogTitle>
            <AlertDialogDescription>
              This is currently not up and running, please try again when we post an announcement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
