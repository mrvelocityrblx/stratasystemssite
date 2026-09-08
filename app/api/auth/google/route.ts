import { NextResponse } from "next/server"
import { createOAuthState, getGoogleAuthorizationUrl } from "@/lib/google-auth"

export async function GET() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/login?error=google-config", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
  }
  const state = await createOAuthState()
  return NextResponse.redirect(getGoogleAuthorizationUrl(state))
}
