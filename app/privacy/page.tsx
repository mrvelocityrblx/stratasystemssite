import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h1 className="text-5xl font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 1, 2025</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Strata Systems. We respect your privacy and are committed to protecting your personal data.
                This privacy policy will inform you about how we look after your personal data when you visit our
                website and use our services, and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">2. Data We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may collect, use, store and transfer different kinds of personal data about you:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Identity Data: name, username or similar identifier</li>
                <li>Contact Data: email address and telephone numbers</li>
                <li>Technical Data: IP address, browser type and version, time zone setting and location</li>
                <li>Profile Data: your username and password, purchases or orders made by you</li>
                <li>Usage Data: information about how you use our website and services</li>
                <li>
                  Marketing and Communications Data: your preferences in receiving marketing from us and communication
                  preferences
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">3. How We Use Your Data</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal
                data in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>To provide and maintain our services</li>
                <li>To notify you about changes to our services</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information so that we can improve our services</li>
                <li>To monitor the usage of our services</li>
                <li>To detect, prevent and address technical issues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">4. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We have put in place appropriate security measures to prevent your personal data from being accidentally
                lost, used or accessed in an unauthorized way, altered or disclosed. We use industry-standard encryption
                and security practices to protect your data. Access to your personal data is limited to employees,
                agents, contractors and other third parties who have a business need to know.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">5. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We will only retain your personal data for as long as necessary to fulfill the purposes we collected it
                for, including for the purposes of satisfying any legal, accounting, or reporting requirements. When we
                no longer need your data, we will securely delete or anonymize it.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">6. Your Legal Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Under certain circumstances, you have rights under data protection laws in relation to your personal
                data:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Right to access your personal data</li>
                <li>Right to request correction of your personal data</li>
                <li>Right to request erasure of your personal data</li>
                <li>Right to object to processing of your personal data</li>
                <li>Right to request restriction of processing your personal data</li>
                <li>Right to request transfer of your personal data</li>
                <li>Right to withdraw consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">7. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may use third-party service providers to help us operate our business and provide services to you.
                These third parties include Firebase for authentication and data storage, and AI service providers for
                our AI-powered features. These providers are bound by confidentiality agreements and are only permitted
                to process your data for specified purposes.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">8. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our service and hold certain
                information. Cookies are files with small amounts of data which may include an anonymous unique
                identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being
                sent.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">9. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
                Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy
                Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">10. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at stratasystemscorp@gmail.com or
                through our support page.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
