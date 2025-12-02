import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h1 className="text-5xl font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 1, 2025</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Strata Systems services, you agree to be bound by these Terms of Service. If you
                disagree with any part of the terms, you may not access the service. These terms apply to all visitors,
                users, and others who access or use the service.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Strata Systems provides AI-powered productivity tools including EchoAI (conversational AI assistant) and
                DayWise (task management and scheduling). Our services are designed to enhance productivity and provide
                intelligent automation for various tasks. We reserve the right to modify, suspend, or discontinue any
                part of our services at any time.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you create an account with us, you must provide accurate, complete, and current information.
                Failure to do so constitutes a breach of the Terms. You are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Safeguarding your password and any other credentials used to access your account</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use of your account</li>
                <li>Ensuring your account information remains accurate and up-to-date</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">4. Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">You agree not to use our services to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit any harmful, threatening, abusive, or offensive content</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Interfere with or disrupt the service or servers or networks connected to the service</li>
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>
                  Reproduce, duplicate, copy, sell, resell, or exploit any portion of the service without permission
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">5. Subscription and Payments</h2>
              <p className="text-muted-foreground leading-relaxed">
                Some parts of our service are billed on a subscription basis. You will be billed in advance on a
                recurring basis (monthly or yearly). Subscription fees are non-refundable except as required by law. We
                reserve the right to change our subscription plans or adjust pricing with notice. Continued use of the
                service after price changes constitutes your agreement to pay the modified price.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">6. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                The service and its original content, features, and functionality are owned by Strata Systems and are
                protected by international copyright, trademark, patent, trade secret, and other intellectual property
                laws. You may not use our trademarks, logos, or branding without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">7. User Content</h2>
              <p className="text-muted-foreground leading-relaxed">
                You retain all rights to any content you submit, post, or display on or through the service. By
                submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce,
                modify, and display such content solely for the purpose of providing and improving our services. You
                represent that you have all necessary rights to grant us this license.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">8. AI-Generated Content</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our AI services generate content based on user inputs. While we strive for accuracy, AI-generated
                content may contain errors, inaccuracies, or inappropriate material. We do not guarantee the accuracy,
                completeness, or usefulness of any AI-generated content. You are responsible for reviewing and verifying
                any AI-generated content before use.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">9. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason,
                including breach of these Terms. Upon termination, your right to use the service will immediately cease.
                You may terminate your account at any time through your account settings or by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">10. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                In no event shall Strata Systems, nor its directors, employees, partners, agents, suppliers, or
                affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages,
                including loss of profits, data, use, goodwill, or other intangible losses, resulting from your access
                to or use of or inability to access or use the service.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">11. Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your use of the service is at your sole risk. The service is provided on an "AS IS" and "AS AVAILABLE"
                basis without warranties of any kind, either express or implied. We do not warrant that the service will
                be uninterrupted, timely, secure, or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">12. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed and construed in accordance with the laws applicable in your jurisdiction,
                without regard to its conflict of law provisions. Our failure to enforce any right or provision of these
                Terms will not be considered a waiver of those rights.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">13. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will
                provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material
                change will be determined at our sole discretion. Continued use of the service after changes become
                effective constitutes acceptance of the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">14. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us at stratasystemscorp@gmail.com or through
                our support page.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
