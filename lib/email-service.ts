// Email verification service using EmailJS or similar service
// For this implementation, we'll simulate sending verification codes

export interface VerificationCode {
  email: string
  code: string
  expiresAt: number
}

const VERIFICATION_CODES_KEY = "verification_codes"

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function saveVerificationCode(email: string, code: string): void {
  const codes = getVerificationCodes()
  const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

  codes[email] = { email, code, expiresAt }

  if (typeof window !== "undefined") {
    localStorage.setItem(VERIFICATION_CODES_KEY, JSON.stringify(codes))
  }
}

export function getVerificationCodes(): Record<string, VerificationCode> {
  if (typeof window === "undefined") return {}

  const stored = localStorage.getItem(VERIFICATION_CODES_KEY)
  if (!stored) return {}

  try {
    return JSON.parse(stored)
  } catch {
    return {}
  }
}

export function verifyCode(email: string, code: string): boolean {
  const codes = getVerificationCodes()
  const storedCode = codes[email]

  if (!storedCode) return false
  if (storedCode.expiresAt < Date.now()) {
    // Code expired
    delete codes[email]
    if (typeof window !== "undefined") {
      localStorage.setItem(VERIFICATION_CODES_KEY, JSON.stringify(codes))
    }
    return false
  }

  return storedCode.code === code
}

export function clearVerificationCode(email: string): void {
  const codes = getVerificationCodes()
  delete codes[email]

  if (typeof window !== "undefined") {
    localStorage.setItem(VERIFICATION_CODES_KEY, JSON.stringify(codes))
  }
}

// Simulate sending email (in production, use a real email service)
export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    // In a real implementation, you would call an API endpoint that sends the email
    // For now, we'll just save it locally and show it in the UI
    saveVerificationCode(email, code)

    console.log(`[Email Service] Verification code for ${email}: ${code}`)
    console.log(`From: stratasystemscorp@gmail.com`)
    console.log(`Subject: Verify your Strata Systems account`)

    return true
  } catch (error) {
    console.error("Failed to send verification email:", error)
    return false
  }
}
