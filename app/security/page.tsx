import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Shield, Lock, Key, Eye, AlertTriangle, CheckCircle } from "lucide-react"

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold text-foreground">Security</h1>
          </div>
          <p className="text-muted-foreground mb-8">Last updated: December 1, 2025</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6" />
                1. Our Commitment to Security
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                At Strata Systems, security is our top priority. We implement industry-leading security measures to
                protect your data and ensure the confidentiality, integrity, and availability of our services. This page
                outlines our security practices and the measures we take to keep your information safe.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Key className="h-6 w-6" />
                2. Data Encryption
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">Encryption in Transit:</strong> All data transmitted between your
                  device and our servers is encrypted using TLS 1.3 (Transport Layer Security), the latest and most
                  secure version of the protocol. This ensures that your data cannot be intercepted or read by
                  unauthorized parties during transmission.
                </p>
                <p>
                  <strong className="text-foreground">Encryption at Rest:</strong> All sensitive data stored in our
                  databases is encrypted using AES-256 encryption, a military-grade encryption standard. This includes
                  your personal information, account credentials, and any data you upload to our services.
                </p>
                <p>
                  <strong className="text-foreground">End-to-End Encryption:</strong> For certain sensitive
                  communications, we implement end-to-end encryption, ensuring that only you and your intended
                  recipients can access the content.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6" />
                3. Authentication & Access Control
              </h2>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  We use Firebase Authentication, a secure and reliable authentication service provided by Google. Our
                  authentication system includes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Secure password hashing using bcrypt with salt</li>
                  <li>Email verification to confirm account ownership</li>
                  <li>Multi-factor authentication (MFA) support</li>
                  <li>OAuth 2.0 integration for Google and Discord sign-in</li>
                  <li>Session management with automatic token expiration</li>
                  <li>Account lockout after multiple failed login attempts</li>
                  <li>IP-based rate limiting to prevent brute force attacks</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6" />
                4. Privacy & Data Protection
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">Data Minimization:</strong> We only collect the minimum amount of
                  data necessary to provide our services. We do not sell, rent, or share your personal data with third
                  parties for marketing purposes.
                </p>
                <p>
                  <strong className="text-foreground">Access Controls:</strong> Internal access to user data is strictly
                  limited on a need-to-know basis. All employees and contractors with data access must sign
                  confidentiality agreements and undergo regular security training.
                </p>
                <p>
                  <strong className="text-foreground">Data Retention:</strong> We retain your data only as long as
                  necessary to provide our services or as required by law. You can request deletion of your account and
                  associated data at any time.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">5. Infrastructure Security</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Our infrastructure is built on industry-leading cloud platforms with robust security measures:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Hosting:</strong> Vercel and Firebase Cloud, with 99.99% uptime
                    SLA
                  </li>
                  <li>
                    <strong className="text-foreground">DDoS Protection:</strong> Automatic protection against
                    distributed denial-of-service attacks
                  </li>
                  <li>
                    <strong className="text-foreground">Web Application Firewall (WAF):</strong> Real-time protection
                    against common web vulnerabilities
                  </li>
                  <li>
                    <strong className="text-foreground">Intrusion Detection:</strong> 24/7 monitoring for suspicious
                    activity and potential threats
                  </li>
                  <li>
                    <strong className="text-foreground">Regular Backups:</strong> Automated daily backups with
                    point-in-time recovery
                  </li>
                  <li>
                    <strong className="text-foreground">Disaster Recovery:</strong> Multi-region redundancy to ensure
                    service continuity
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">6. Application Security</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">Secure Development Practices:</strong> Our development team
                  follows OWASP (Open Web Application Security Project) guidelines and secure coding standards. All code
                  undergoes peer review and security testing before deployment.
                </p>
                <p>
                  <strong className="text-foreground">Vulnerability Management:</strong> We conduct regular security
                  audits and penetration testing to identify and address potential vulnerabilities. We also maintain an
                  active bug bounty program to encourage responsible disclosure of security issues.
                </p>
                <p>
                  <strong className="text-foreground">Dependency Management:</strong> All third-party libraries and
                  dependencies are regularly updated and scanned for known vulnerabilities using automated tools.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">7. AI Model Security</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">Data Isolation:</strong> Your conversations with our AI assistants
                  are isolated and not used to train models for other users. We use secure API connections to AI
                  providers with data processing agreements in place.
                </p>
                <p>
                  <strong className="text-foreground">Content Filtering:</strong> We implement automatic content
                  filtering to detect and block harmful, offensive, or inappropriate content in AI interactions.
                </p>
                <p>
                  <strong className="text-foreground">Prompt Injection Protection:</strong> Our systems include
                  safeguards against prompt injection attacks and other AI-specific security threats.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                8. Incident Response
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  We maintain a comprehensive incident response plan to quickly address any security breaches or data
                  incidents:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>24/7 security monitoring and alerting</li>
                  <li>Dedicated incident response team</li>
                  <li>Clear escalation procedures and communication protocols</li>
                  <li>User notification within 72 hours of any confirmed data breach</li>
                  <li>Post-incident analysis and security improvements</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">9. Compliance & Certifications</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>We are committed to maintaining compliance with applicable data protection regulations:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong className="text-foreground">GDPR:</strong> General Data Protection Regulation (EU)
                    compliance
                  </li>
                  <li>
                    <strong className="text-foreground">CCPA:</strong> California Consumer Privacy Act compliance
                  </li>
                  <li>
                    <strong className="text-foreground">SOC 2:</strong> Service Organization Control 2 Type II (in
                    progress)
                  </li>
                  <li>
                    <strong className="text-foreground">ISO 27001:</strong> Information Security Management System
                    certification (planned)
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="h-6 w-6" />
                10. Your Security Best Practices
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>While we implement robust security measures, your security also depends on your actions:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use a strong, unique password for your Strata Systems account</li>
                  <li>Enable multi-factor authentication when available</li>
                  <li>Never share your password or account credentials with others</li>
                  <li>Be cautious of phishing emails or suspicious links</li>
                  <li>Keep your devices and software up to date</li>
                  <li>Log out of your account when using shared or public computers</li>
                  <li>Report any suspicious activity or security concerns immediately</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">11. Third-Party Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We carefully vet all third-party services and ensure they meet our security standards. Our key partners
                include Firebase (Google), Vercel, Resend, and various AI providers. All partners are required to
                maintain appropriate security measures and undergo regular security assessments.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">12. Responsible Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you discover a security vulnerability in our services, please report it responsibly to
                stratasystemscorp@gmail.com. We appreciate the security research community's efforts to keep the
                internet safe and will work with you to address any valid security concerns. We ask that you do not
                publicly disclose the issue until we have had a chance to address it.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">13. Updates to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We regularly review and update our security practices to address new threats and incorporate the latest
                security technologies. This security page will be updated to reflect any significant changes. The "Last
                updated" date at the top indicates when the most recent changes were made.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-foreground mb-4">14. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about our security practices or would like to report a security concern, please
                contact our security team at stratasystemscorp@gmail.com or through our support page. For non-security
                inquiries, please refer to our general contact information.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
