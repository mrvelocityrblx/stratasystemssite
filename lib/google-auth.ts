import { cookies } from "next/headers"

export interface GoogleAuthUser {
  uid: string
  email: string
  displayName: string
  photoURL: string | null
}

const SESSION_COOKIE = "strata_google_session"
const STATE_COOKIE = "strata_google_oauth_state"

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
}

export function getGoogleCallbackUrl() {
  return `${getBaseUrl()}/api/auth/google/callback`
}

export function getGoogleAuthorizationUrl(state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: getGoogleCallbackUrl(),
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function createOAuthState() {
  const state = crypto.randomUUID()
  const cookieStore = await cookies()
  cookieStore.set(STATE_COOKIE, state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 600, path: "/" })
  return state
}

export async function consumeOAuthState(state: string) {
  const cookieStore = await cookies()
  const savedState = cookieStore.get(STATE_COOKIE)?.value
  cookieStore.delete(STATE_COOKIE)
  return Boolean(savedState && state && savedState === state)
}

export async function exchangeGoogleCode(code: string): Promise<GoogleAuthUser> {
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: getGoogleCallbackUrl(),
      grant_type: "authorization_code",
    }),
  })
  if (!tokenResponse.ok) throw new Error("Google token exchange failed")
  const tokens = await tokenResponse.json()
  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  if (!profileResponse.ok) throw new Error("Google profile lookup failed")
  const profile = await profileResponse.json()
  if (!profile.sub || !profile.email) throw new Error("Google did not return a verified email")
  return { uid: `google_${profile.sub}`, email: profile.email, displayName: profile.name || profile.email.split("@")[0], photoURL: profile.picture || null }
}

export async function setSession(user: GoogleAuthUser) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, Buffer.from(JSON.stringify(user)).toString("base64url"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  })
}

export async function getSession(): Promise<GoogleAuthUser | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value
  if (!value) return null
  try { return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as GoogleAuthUser } catch { return null }
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE)
}

export { SESSION_COOKIE }
