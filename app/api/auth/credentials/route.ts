import { NextResponse } from "next/server"
import { authenticateCredentialUser, registerCredentialUser } from "@/lib/credential-auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body.email === "string" ? body.email : ""
    const password = typeof body.password === "string" ? body.password : ""
    const displayName = typeof body.displayName === "string" ? body.displayName : ""
    if (!email.includes("@") || password.length < 8) return NextResponse.json({ error: "Enter a valid email and a password of at least 8 characters." }, { status: 400 })
    const user = body.mode === "signup" ? await registerCredentialUser(email, password, displayName) : await authenticateCredentialUser(email, password)
    return NextResponse.json({ user })
  } catch (error) {
    const code = error instanceof Error ? error.message : "auth-failed"
    const message = code === "account-exists" ? "An account with this email already exists." : "The email or password is incorrect."
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
