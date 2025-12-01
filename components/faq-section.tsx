import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is EchoAI and how does it work?",
    answer:
      "EchoAI is our advanced conversational AI model designed for natural language understanding and generation. It processes text inputs, understands context, and generates human-like responses. It can be integrated into chatbots, customer service platforms, and various applications via our API.",
  },
  {
    question: "How does DayWise help improve productivity?",
    answer:
      "DayWise is an intelligent productivity AI that analyzes your workflow patterns, automatically prioritizes tasks, and optimizes your schedule. It integrates with popular calendar and task management tools to provide smart recommendations and automate routine scheduling decisions.",
  },
  {
    question: "Can I use both EchoAI and DayWise together?",
    answer:
      "All our pricing plans include access to both EchoAI and DayWise. They're designed to work seamlessly together, allowing you to create powerful AI-driven workflows that combine conversational capabilities with intelligent scheduling and task management.",
  },
  {
    question: "What kind of support do you offer?",
    answer:
      "We offer tiered support based on your plan. Starter plans include email support with 48-hour response times. Pro plans get priority support with 4-hour response times and access to our developer community. Enterprise plans include 24/7 phone support and a dedicated account manager.",
  },
  {
    question: "Is there a free trial available?",
    answer:
      "Yes! We offer a 14-day free trial for both our Starter and Pro plans. You'll get full access to all features during the trial period with no credit card required. Enterprise trials are available upon request with custom terms.",
  },
  {
    question: "How secure is my data with Strata Systems?",
    answer:
      "Security is our top priority. We use enterprise-grade encryption for data at rest and in transit, comply with SOC 2 Type II and GDPR requirements, and never use your data to train our models without explicit consent. Enterprise plans include additional security features like SSO and audit logs.",
  },
]

export function FaqSection() {
  return (
    <section id="faq" className="py-20 px-6 bg-secondary/30">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Frequently asked questions</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about our AI products and services.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-border">
              <AccordionTrigger className="text-left text-foreground hover:text-accent hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
