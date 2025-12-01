import { SignupForm } from "@/components/signup-form"
import Image from "next/image"
import Link from "next/link"

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-3 mb-2">
            <Image
              src="/images/strata-logo.png"
              alt="Strata Systems Logo"
              width={56}
              height={56}
              className="object-contain"
            />
            <span className="text-2xl font-bold text-foreground">Strata Systems</span>
          </Link>
          <p className="text-muted-foreground text-sm">Create your account to get started</p>
        </div>

        {/* Signup Form */}
        <SignupForm />

        {/* Back to home */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          <Link href="/" className="text-accent hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}
