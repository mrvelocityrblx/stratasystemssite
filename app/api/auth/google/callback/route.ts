import { NextResponse } from "next/server"
import { consumeOAuthState, exchangeGoogleCode, setSession } from "@/lib/google-auth"
import { isUserBanned, saveUser } from "@/lib/store"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const origin = url.origin
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  if (!code || !state || !(await consumeOAuthState(state))) return NextResponse.redirect(new URL("/login?error=oauth-state", origin))
  try {
    const user = await exchangeGoogleCode(code, url.origin)
    if (isUserBanned(user.email)) return NextResponse.redirect(new URL("/login?error=banned", origin))
    await setSession(user)
    saveUser({ uid: user.uid, email: user.email, displayName: user.displayName })
    return NextResponse.redirect(new URL("/", origin))
  } catch { return NextResponse.redirect(new URL("/login?error=oauth-failed", origin)) }
}
