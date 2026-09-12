import { cookies } from "next/headers"

export interface CredentialUser {
  uid: string
  email: string
  displayName: string
}

const SESSION_COOKIE = "strata_credential_session"
const USERS_COOKIE = "strata_credential_users"

type StoredUser = CredentialUser & { passwordHash: string }

async function readUsers(): Promise<StoredUser[]> {
  const value = (await cookies()).get(USERS_COOKIE)?.value
  if (!value) return []
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as StoredUser[]
  } catch {
    return []
  }
}

async function writeUsers(users: StoredUser[]) {
  ;(await cookies()).set(USERS_COOKIE, Buffer.from(JSON.stringify(users)).toString("base64url"), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  })
}

async function hashPassword(password: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password))
  return Buffer.from(digest).toString("hex")
}

export async function registerCredentialUser(email: string, password: string, displayName: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const users = await readUsers()
  if (users.some((user) => user.email === normalizedEmail)) throw new Error("account-exists")
  const user: StoredUser = { uid: `user_${crypto.randomUUID()}`, email: normalizedEmail, displayName: displayName.trim() || normalizedEmail.split("@")[0], passwordHash: await hashPassword(password) }
  await writeUsers([...users, user])
  await setSession(user)
  return user
}

export async function authenticateCredentialUser(email: string, password: string) {
  const users = await readUsers()
  const user = users.find((candidate) => candidate.email === email.trim().toLowerCase())
  if (!user || user.passwordHash !== await hashPassword(password)) throw new Error("invalid-credentials")
  await setSession(user)
  return user
}

export async function setSession(user: StoredUser | CredentialUser) {
  const cookieStore = await cookies()
  const safeUser: CredentialUser = { uid: user.uid, email: user.email, displayName: user.displayName }
  cookieStore.set(SESSION_COOKIE, Buffer.from(JSON.stringify(safeUser)).toString("base64url"), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/" })
}

export async function getSession(): Promise<CredentialUser | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value
  if (!value) return null
  try { return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as CredentialUser } catch { return null }
}

export async function clearSession() { (await cookies()).delete(SESSION_COOKIE) }
export { SESSION_COOKIE }
