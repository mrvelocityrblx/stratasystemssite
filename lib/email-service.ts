// Email verification service
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

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    // Save the code locally for verification
    saveVerificationCode(email, code)

    // Call the API endpoint to send the actual email
    const response = await fetch("/api/send-verification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
    })

    const data = await response.json()

    if (!data.success) {
      console.error("[v0] Failed to send email:", data.message)
      return false
    }

    console.log("[v0] Verification email sent successfully to:", email)
    return true
  } catch (error) {
    console.error("[v0] Failed to send verification email:", error)
    return false
  }
}
