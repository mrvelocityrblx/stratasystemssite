// Data store for user accounts, admin logs, generation tracking
// Uses localStorage to persist data across sessions

export type SubscriptionPlan = "free" | "starter" | "pro"

export type CorporateRole = "corporate_developer" | "corporate_staff" | "support_team" | null

export interface UserAccount {
  uid: string
  email: string
  displayName: string
  createdAt: string
  plan: "free" | "starter" | "pro"
  subscriptionEnd?: string
  banned?: boolean
  corporateRole?: CorporateRole
  customGenerationLimit?: number // Added custom generation limit field
}

export interface AdminLog {
  id: string
  type:
    | "account_created"
    | "account_banned"
    | "payment"
    | "login"
    | "subscription"
    | "role_change"
    | "role_request"
    | "account_deleted"
    | "account_accessed"
  email: string
  timestamp: string
  details?: string
}

export interface RoleRequest {
  id: string
  requestedBy: string // email of the developer who requested
  targetEmail: string // email to grant role to
  role: CorporateRole
  status: "pending" | "approved" | "rejected"
  createdAt: string
  processedAt?: string
}

export interface GenerationUsage {
  month: string // YYYY-MM format
  count: number
}

export interface DailyApiUsage {
  date: string // YYYY-MM-DD format
  count: number
}

export interface ImageGenerationUsage {
  date: string // YYYY-MM-DD format
  count: number
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  userId?: string // Added userId to track who sent the message
  userEmail?: string // Added userEmail for easier filtering
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface VerificationCode {
  email: string
  code: string
  expiresAt: string
  used: boolean
}

export interface BannedEmail {
  email: string
  bannedAt: string
  bannedBy: string
}

export interface UserCredential {
  email: string
  password: string
  createdAt: string
}

export interface ForceAccessSession {
  email: string
  uid: string
  displayName: string | null
  accessedAt: string
}

export interface SupportTicket {
  id: string
  userId: string
  userEmail: string
  userName: string
  subject: string
  message: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
  assignedTo?: string
  responses?: SupportResponse[]
}

export interface SupportResponse {
  id: string
  ticketId: string
  respondedBy: string
  message: string
  timestamp: string
  isStaff: boolean
}

export interface SiteSettings {
  aiEnabled: boolean
  maintenanceMode: boolean
  updatedAt: string
  updatedBy: string
}

interface Store {
  users: Record<string, UserAccount>
  adminLogs: AdminLog[]
  roleRequests: RoleRequest[]
  credentials: UserCredential[]
  chatMessages: ChatMessage[]
  supportTickets: SupportTicket[]
  // Added site settings to the store
  siteSettings: SiteSettings
}

const ADMIN_ACCOUNTS = [
  { email: "stratasystemscorp@gmail.com", password: "owNWeP-NGLmI8hN" },
  { email: "mrvelocity.rblx@gmail.com", password: "7736635722Cw" },
]

const PLAN_LIMITS: Record<SubscriptionPlan, number> = {
  free: 100, // 100 per day for free users
  starter: 100, // 100 per month for starter
  pro: 50000,
}

const CORPORATE_STAFF_GENERATIONS = 3000

const IMAGE_LIMITS = {
  free: 1,
  starter: 10,
  pro: Number.POSITIVE_INFINITY,
}

const BANNED_EMAILS_KEY = "strata_banned_emails"
const USER_CREDENTIALS_KEY = "strata_user_credentials"
const FORCE_ACCESS_KEY = "strata_force_access"
const SUPPORT_TICKETS_KEY = "strata_support_tickets"
const SITE_SETTINGS_KEY = "strata_site_settings"

const CHAT_FILTER_WORDS = [
  "fuck",
  "shit",
  "bitch",
  "damn",
  "ass",
  "hell",
  "bastard",
  "crap",
  "piss",
  "dick",
  "pussy",
  "cock",
  "nigger",
  "nigga",
  "faggot",
  "cunt",
  "whore",
  "slut",
]

const FORCE_ACCESS_SESSION: ForceAccessSession | null = null

// Initialize the data store
function getStore() {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem("strata_store")
  if (!data) {
    const initialStore: Store = {
      users: {} as Record<string, UserAccount>,
      adminLogs: [] as AdminLog[],
      generations: {} as Record<string, GenerationUsage>,
      dailyApiUsage: {} as Record<string, DailyApiUsage>,
      imageGenerations: {} as Record<string, ImageGenerationUsage>,
      chatSessions: {} as Record<string, ChatSession[]>,
      roleRequests: [] as RoleRequest[],
      credentials: [] as UserCredential[],
      chatMessages: [] as ChatMessage[],
      supportTickets: [] as SupportTicket[],
      siteSettings: { aiEnabled: true, maintenanceMode: false, updatedAt: "", updatedBy: "" }, // Initialize site settings
    }
    localStorage.setItem("strata_store", JSON.stringify(initialStore))
    return initialStore
  }
  const parsed = JSON.parse(data)
  // Ensure new fields exist
  if (!parsed.imageGenerations) parsed.imageGenerations = {}
  if (!parsed.chatSessions) parsed.chatSessions = {}
  if (!parsed.roleRequests) parsed.roleRequests = []
  if (!parsed.dailyApiUsage) parsed.dailyApiUsage = {}
  if (!parsed.credentials) parsed.credentials = []
  if (!parsed.chatMessages) parsed.chatMessages = []
  if (!parsed.supportTickets) parsed.supportTickets = []
  // Ensure site settings exist
  if (!parsed.siteSettings)
    parsed.siteSettings = { aiEnabled: true, maintenanceMode: false, updatedAt: "", updatedBy: "" }
  return parsed
}

function saveStore(store: any) {
  if (typeof window === "undefined") return
  localStorage.setItem("strata_store", JSON.stringify(store))
}

// User management
export function saveUser(user: { uid: string; email: string; displayName: string | null }) {
  const store = getStore()
  if (!store) return

  const isNewUser = !store.users[user.uid]
  const isCorporate = ADMIN_ACCOUNTS.some((admin) => admin.email.toLowerCase() === user.email.toLowerCase())

  const isBanned = isEmailBanned(user.email)

  store.users[user.uid] = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || store.users[user.uid]?.displayName || "User",
    createdAt: store.users[user.uid]?.createdAt || new Date().toISOString(),
    banned: isBanned || store.users[user.uid]?.banned || false,
    plan: isCorporate ? "pro" : store.users[user.uid]?.plan || "free",
    subscriptionEnd: isCorporate ? null : store.users[user.uid]?.subscriptionEnd || null,
    corporateRole: store.users[user.uid]?.corporateRole || null,
    customGenerationLimit: store.users[user.uid]?.customGenerationLimit || undefined,
  }

  // Log new account creation
  if (isNewUser) {
    store.adminLogs.unshift({
      id: Date.now().toString(),
      type: "account_created",
      email: user.email,
      timestamp: new Date().toISOString(),
      details: `New account created: ${user.displayName}`,
    })
  }

  saveStore(store)
  return store.users[user.uid]
}

export function getUser(uid: string): UserAccount | null {
  const store = getStore()
  if (!store) return null
  return store.users[uid] || null
}

export function getUserByEmail(email: string): UserAccount | null {
  const store = getStore()
  if (!store) return null
  return (
    Object.values(store.users as Record<string, UserAccount>).find(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    ) || null
  )
}

export function getAllUsers(): UserAccount[] {
  const store = getStore()
  if (!store) return []
  return Object.values(store.users)
}

export function isEmailBanned(email: string): boolean {
  const bannedEmails = getBannedEmails()
  return bannedEmails.some((b) => b.email.toLowerCase() === email.toLowerCase())
}

export function isUserBanned(email: string): boolean {
  return isEmailBanned(email)
}

export function banUser(email: string, bannedBy?: string): boolean {
  const store = getStore()
  if (!store) return false

  const user = Object.values(store.users as Record<string, UserAccount>).find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  )

  // Add to global ban store
  const bannedEmails = getBannedEmails()
  if (!bannedEmails.some((b) => b.email.toLowerCase() === email.toLowerCase())) {
    bannedEmails.push({
      email: email.toLowerCase(),
      bannedAt: new Date().toISOString(),
      bannedBy: bannedBy || "admin",
    })
    saveBannedEmails(bannedEmails)
  }

  if (user) {
    store.users[user.uid].banned = true
    store.adminLogs.unshift({
      id: Date.now().toString(),
      type: "account_banned",
      email: email,
      timestamp: new Date().toISOString(),
      details: `Account banned by ${bannedBy || "admin"}`,
    })
    saveStore(store)
  }

  return true
}

export function unbanUser(email: string): boolean {
  const store = getStore()
  if (!store) return false

  // Remove from global ban store
  const bannedEmails = getBannedEmails()
  const updatedBannedEmails = bannedEmails.filter((b) => b.email.toLowerCase() !== email.toLowerCase())
  saveBannedEmails(updatedBannedEmails)

  const user = Object.values(store.users as Record<string, UserAccount>).find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  )

  if (user) {
    store.users[user.uid].banned = false
    saveStore(store)
  }

  return true
}

export function deleteUserAccount(uid: string, adminEmail?: string): boolean {
  const store = getStore()
  if (!store || !store.users[uid]) return false

  const user = store.users[uid]

  // Prevent deletion of corporate accounts
  if (user.corporateRole || ADMIN_ACCOUNTS.some((admin) => admin.email.toLowerCase() === user.email.toLowerCase())) {
    return false
  }

  const email = user.email
  delete store.users[uid]

  // Also delete their chat sessions and usage data
  delete store.chatSessions[uid]

  // Log the deletion
  store.adminLogs.unshift({
    id: Date.now().toString(),
    type: "account_deleted",
    email: email,
    timestamp: new Date().toISOString(),
    details: adminEmail ? `Account deleted by admin: ${adminEmail}` : `Account self-deleted`,
  })

  saveStore(store)
  return true
}

export function canDeleteAccount(email: string | null, targetEmail: string): boolean {
  if (!email) return false
  if (ADMIN_ACCOUNTS.some((admin) => admin.email.toLowerCase() === targetEmail.toLowerCase())) return false
  const role = getCorporateRole(email)
  return (
    role === "corporate_developer" || ADMIN_ACCOUNTS.some((admin) => admin.email.toLowerCase() === email.toLowerCase())
  )
}

export function updateSubscription(uid: string, plan: SubscriptionPlan, expiryDate: string | null): boolean {
  const store = getStore()
  if (!store || !store.users[uid]) return false

  store.users[uid].plan = plan
  store.users[uid].subscriptionEnd = expiryDate

  store.adminLogs.unshift({
    id: Date.now().toString(),
    type: "subscription",
    email: store.users[uid].email,
    timestamp: new Date().toISOString(),
    details: `Subscription updated to ${plan}${expiryDate ? ` (expires: ${expiryDate})` : " (never expires)"}`,
  })

  saveStore(store)
  return true
}

export function setCorporateRole(email: string, role: CorporateRole, grantedBy: string): boolean {
  const store = getStore()
  if (!store) return false

  const user = Object.values(store.users as Record<string, UserAccount>).find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  )

  if (user) {
    store.users[user.uid].corporateRole = role

    // Corporate roles get special subscription settings
    if (role === "corporate_developer") {
      store.users[user.uid].plan = "pro"
      store.users[user.uid].subscriptionEnd = null // Never expires
    } else if (role === "corporate_staff") {
      store.users[user.uid].plan = "starter"
      store.users[user.uid].subscriptionEnd = null // Never expires
    }

    store.adminLogs.unshift({
      id: Date.now().toString(),
      type: "role_change",
      email: email,
      timestamp: new Date().toISOString(),
      details: `Corporate role changed to ${role || "none"} by ${grantedBy}`,
    })

    saveStore(store)
    return true
  }
  return false
}

export function removeCorporateRole(email: string, removedBy: string): boolean {
  const store = getStore()
  if (!store) return false

  const user = Object.values(store.users as Record<string, UserAccount>).find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  )

  if (user) {
    store.users[user.uid].corporateRole = null

    store.adminLogs.unshift({
      id: Date.now().toString(),
      type: "role_change",
      email: email,
      timestamp: new Date().toISOString(),
      details: `Corporate role removed by ${removedBy}`,
    })

    saveStore(store)
    return true
  }
  return false
}

export function getCorporateRole(email: string | null): CorporateRole {
  if (!email) return null
  if (ADMIN_ACCOUNTS.some((admin) => admin.email.toLowerCase() === email.toLowerCase())) return "corporate_developer" // Owner has all perms

  const user = getUserByEmail(email)
  return user?.corporateRole || null
}

export function createRoleRequest(requestedBy: string, targetEmail: string, role: CorporateRole): boolean {
  const store = getStore()
  if (!store) return false

  // Check if requester is a corporate developer
  const requesterRole = getCorporateRole(requestedBy)
  if (
    requesterRole !== "corporate_developer" &&
    !ADMIN_ACCOUNTS.some((admin) => admin.email.toLowerCase() === requestedBy.toLowerCase())
  ) {
    return false
  }

  // Only developers can request staff roles
  if (role !== "corporate_staff") return false

  // Check if target user exists
  const targetUser = getUserByEmail(targetEmail)
  if (!targetUser) return false

  // Check if there's already a pending request for this user
  const existingRequest = store.roleRequests.find(
    (r: RoleRequest) => r.targetEmail.toLowerCase() === targetEmail.toLowerCase() && r.status === "pending",
  )
  if (existingRequest) return false

  const request: RoleRequest = {
    id: Date.now().toString(),
    requestedBy,
    targetEmail,
    role,
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  store.roleRequests.unshift(request)

  store.adminLogs.unshift({
    id: Date.now().toString(),
    type: "role_request",
    email: targetEmail,
    timestamp: new Date().toISOString(),
    details: `Role request for ${role} created by ${requestedBy}`,
  })

  saveStore(store)
  return true
}

export function getRoleRequests(): RoleRequest[] {
  const store = getStore()
  if (!store) return []
  return store.roleRequests || []
}

export function getPendingRoleRequests(): RoleRequest[] {
  return getRoleRequests().filter((r) => r.status === "pending")
}

export function approveRoleRequest(requestId: string, approvedBy: string): boolean {
  const store = getStore()
  if (!store) return false

  // Only main corporate account can approve
  if (!ADMIN_ACCOUNTS.some((admin) => admin.email.toLowerCase() === approvedBy.toLowerCase())) return false

  const requestIndex = store.roleRequests.findIndex((r: RoleRequest) => r.id === requestId)
  if (requestIndex === -1) return false

  const request = store.roleRequests[requestIndex]
  store.roleRequests[requestIndex] = {
    ...request,
    status: "approved",
    processedAt: new Date().toISOString(),
  }

  // Actually assign the role
  setCorporateRole(request.targetEmail, request.role, approvedBy)

  saveStore(store)
  return true
}

export function rejectRoleRequest(requestId: string, rejectedBy: string): boolean {
  const store = getStore()
  if (!store) return false

  // Only main corporate account can reject
  if (!ADMIN_ACCOUNTS.some((admin) => admin.email.toLowerCase() === rejectedBy.toLowerCase())) return false

  const requestIndex = store.roleRequests.findIndex((r: RoleRequest) => r.id === requestId)
  if (requestIndex === -1) return false

  store.roleRequests[requestIndex] = {
    ...store.roleRequests[requestIndex],
    status: "rejected",
    processedAt: new Date().toISOString(),
  }

  saveStore(store)
  return true
}

export function canAccessAdminPanel(email: string | null): boolean {
  if (!email) return false
  if (ADMIN_ACCOUNTS.some((admin) => admin.email.toLowerCase() === email.toLowerCase())) return true
  const role = getCorporateRole(email)
  return role === "corporate_developer" || role === "corporate_staff"
}

export function canBanUsers(email: string | null): boolean {
  if (!email) return false
  if (ADMIN_ACCOUNTS.some((admin) => admin.email.toLowerCase() === email.toLowerCase())) return true
  return getCorporateRole(email) === "corporate_developer"
}

export function canAccessAccounts(email: string | null): boolean {
  if (!email) return false
  if (ADMIN_ACCOUNTS.some((admin) => admin.email.toLowerCase() === email.toLowerCase())) return true
  const role = getCorporateRole(email)
  return role === "corporate_developer" || role === "corporate_staff"
}

export function canViewLogs(email: string | null): boolean {
  if (!email) return false
  if (ADMIN_ACCOUNTS.some((admin) => admin.email.toLowerCase() === email.toLowerCase())) return true
  const role = getCorporateRole(email)
  return role === "corporate_developer" || role === "corporate_staff"
}

export function canManageRoles(email: string | null): boolean {
  if (!email) return false
  if (ADMIN_ACCOUNTS.some((admin) => admin.email.toLowerCase() === email.toLowerCase())) return true
  return getCorporateRole(email) === "corporate_developer"
}

export function isSubscriptionActive(user: UserAccount): boolean {
  // Corporate account never expires
  if (ADMIN_ACCOUNTS.some((admin) => admin.email.toLowerCase() === user.email.toLowerCase())) return true
  if (user.corporateRole === "corporate_developer" || user.corporateRole === "corporate_staff") return true

  if (!user.subscriptionEnd) return false
  return new Date(user.subscriptionEnd) > new Date()
}

export function getSubscriptionDaysRemaining(user: UserAccount): number | null {
  // Corporate account never expires
  if (ADMIN_ACCOUNTS.some((admin) => admin.email.toLowerCase() === user.email.toLowerCase())) return null
  if (user.corporateRole === "corporate_developer" || user.corporateRole === "corporate_staff") return null

  if (!user.subscriptionEnd) return 0
  const expiry = new Date(user.subscriptionEnd)
  const now = new Date()
  if (expiry <= now) return 0
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

// Admin logs
export function getAdminLogs(): AdminLog[] {
  const store = getStore()
  if (!store) return []
  return store.adminLogs || []
}

export function addAdminLog(log: Omit<AdminLog, "id" | "timestamp">) {
  const store = getStore()
  if (!store) return

  store.adminLogs.unshift({
    ...log,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
  })
  saveStore(store)
}

export function getDailyApiUsage(uid: string): number {
  const store = getStore()
  if (!store) return 0

  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const key = `${uid}_${today}`

  return store.dailyApiUsage[key]?.count || 0
}

export function getGenerationsThisMonth(uid: string): number {
  const store = getStore()
  if (!store) return 0

  const month = new Date().toISOString().slice(0, 7) // YYYY-MM
  const key = `${uid}_${month}`

  return store.generations[key]?.count || 0
}

export function getMonthlyLimit(user: UserAccount): number {
  // Check for custom limit first
  if (user.customGenerationLimit !== undefined) {
    return user.customGenerationLimit
  }

  // Corporate account has unlimited
  if (ADMIN_ACCOUNTS.some((admin) => admin.email.toLowerCase() === user.email.toLowerCase()))
    return Number.POSITIVE_INFINITY
  if (user.corporateRole === "corporate_developer") return Number.POSITIVE_INFINITY
  if (user.corporateRole === "corporate_staff") return CORPORATE_STAFF_GENERATIONS

  // Check if subscription is active for pro plan
  if (user.plan === "pro" && isSubscriptionActive(user)) {
    return PLAN_LIMITS.pro
  }

  // Starter plan with active subscription
  if (user.plan === "starter" && isSubscriptionActive(user)) {
    return PLAN_LIMITS.starter
  }

  // Default to free plan limits
  return PLAN_LIMITS.free
}

export function incrementGeneration(uid: string): { success: boolean; remaining: number } {
  const store = getStore()
  if (!store) return { success: false, remaining: 0 }

  const user = store.users[uid]
  if (!user) return { success: false, remaining: 0 }

  const limit = getMonthlyLimit(user)

  // Corporate account has unlimited
  if (limit === Number.POSITIVE_INFINITY) {
    const month = new Date().toISOString().slice(0, 7)
    const key = `${uid}_${month}`
    const currentCount = store.generations[key]?.count || 0
    store.generations[key] = {
      month,
      count: currentCount + 1,
    }
    saveStore(store)
    return { success: true, remaining: Number.POSITIVE_INFINITY }
  }

  if (user.plan === "free" && !isSubscriptionActive(user)) {
    const today = new Date().toISOString().slice(0, 10)
    const key = `${uid}_${today}`
    const currentCount = store.dailyApiUsage[key]?.count || 0

    if (currentCount >= PLAN_LIMITS.free) {
      return { success: false, remaining: 0 }
    }

    store.dailyApiUsage[key] = {
      date: today,
      count: currentCount + 1,
    }
    saveStore(store)
    return { success: true, remaining: PLAN_LIMITS.free - (currentCount + 1) }
  }

  // Monthly tracking for starter/pro
  const month = new Date().toISOString().slice(0, 7) // YYYY-MM
  const key = `${uid}_${month}`
  const currentCount = store.generations[key]?.count || 0

  if (currentCount >= limit) {
    return { success: false, remaining: 0 }
  }

  store.generations[key] = {
    month,
    count: currentCount + 1,
  }
  saveStore(store)

  return { success: true, remaining: limit - (currentCount + 1) }
}

export function getRemainingGenerations(uid: string): number {
  const store = getStore()
  if (!store) return 0

  const user = store.users[uid]
  if (!user) return 0

  const limit = getMonthlyLimit(user)

  // Corporate account has unlimited
  if (limit === Number.POSITIVE_INFINITY) return Number.POSITIVE_INFINITY

  if (user.plan === "free" && !isSubscriptionActive(user)) {
    const used = getDailyApiUsage(uid)
    return Math.max(0, PLAN_LIMITS.free - used)
  }

  const used = getGenerationsThisMonth(uid)
  return Math.max(0, limit - used)
}

export function getImageGenerationsToday(uid: string): number {
  const store = getStore()
  if (!store) return 0

  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const key = `${uid}_${today}`

  return store.imageGenerations[key]?.count || 0
}

export function getDailyImageLimit(user: UserAccount): number {
  // Corporate account has unlimited
  if (ADMIN_ACCOUNTS.some((admin) => admin.email.toLowerCase() === user.email.toLowerCase()))
    return Number.POSITIVE_INFINITY
  if (user.corporateRole === "corporate_developer") return Number.POSITIVE_INFINITY

  // Pro plan with active subscription
  if (user.plan === "pro" && isSubscriptionActive(user)) {
    return IMAGE_LIMITS.pro
  }

  // Starter plan
  if (user.plan === "starter" && isSubscriptionActive(user)) {
    return IMAGE_LIMITS.starter
  }

  // Free (no plan)
  return IMAGE_LIMITS.free
}

export function incrementImageGeneration(uid: string): { success: boolean; remaining: number } {
  const store = getStore()
  if (!store) return { success: false, remaining: 0 }

  const user = store.users[uid]
  if (!user) return { success: false, remaining: 0 }

  const limit = getDailyImageLimit(user)
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const key = `${uid}_${today}`

  const currentCount = store.imageGenerations[key]?.count || 0

  // Unlimited
  if (limit === Number.POSITIVE_INFINITY) {
    store.imageGenerations[key] = {
      date: today,
      count: currentCount + 1,
    }
    saveStore(store)
    return { success: true, remaining: Number.POSITIVE_INFINITY }
  }

  if (currentCount >= limit) {
    return { success: false, remaining: 0 }
  }

  store.imageGenerations[key] = {
    date: today,
    count: currentCount + 1,
  }
  saveStore(store)

  return { success: true, remaining: limit - (currentCount + 1) }
}

export function getRemainingImageGenerations(uid: string): number {
  const store = getStore()
  if (!store) return 0

  const user = store.users[uid]
  if (!user) return 0

  const limit = getDailyImageLimit(user)

  // Unlimited
  if (limit === Number.POSITIVE_INFINITY) return Number.POSITIVE_INFINITY

  const used = getImageGenerationsToday(uid)
  return Math.max(0, limit - used)
}

export function getChatSessions(uid: string): ChatSession[] {
  const store = getStore()
  if (!store) return []
  return store.chatSessions[uid] || []
}

export function saveChatSession(uid: string, session: ChatSession): void {
  const store = getStore()
  if (!store) return

  const user = store.users[uid]

  if (!store.chatSessions[uid]) {
    store.chatSessions[uid] = []
  }

  // Add userId and userEmail to messages
  const sessionWithUserInfo = {
    ...session,
    messages: session.messages.map((msg) => ({
      ...msg,
      userId: uid,
      userEmail: user?.email || "unknown",
    })),
  }

  const existingIndex = store.chatSessions[uid].findIndex((s: ChatSession) => s.id === session.id)
  if (existingIndex >= 0) {
    store.chatSessions[uid][existingIndex] = sessionWithUserInfo
  } else {
    store.chatSessions[uid].unshift(sessionWithUserInfo)
  }

  // Keep only last 50 sessions
  if (store.chatSessions[uid].length > 50) {
    store.chatSessions[uid] = store.chatSessions[uid].slice(0, 50)
  }

  saveStore(store)
}

export function deleteChatSession(uid: string, sessionId: string): void {
  const store = getStore()
  if (!store || !store.chatSessions[uid]) return

  store.chatSessions[uid] = store.chatSessions[uid].filter((s: ChatSession) => s.id !== sessionId)
  saveStore(store)
}

// Corporate account check
export function isCorporateAccount(email: string | null): boolean {
  if (!email) return false
  return ADMIN_ACCOUNTS.some((admin) => admin.email.toLowerCase() === email.toLowerCase())
}

export function hasAdminAccess(email: string | null): boolean {
  return canAccessAdminPanel(email)
}

export function verifyCorporateCredentials(email: string, password: string): boolean {
  return ADMIN_ACCOUNTS.some(
    (admin) => admin.email.toLowerCase() === email.toLowerCase() && admin.password === password,
  )
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function storeVerificationCode(email: string, code: string): void {
  const store = getStore()
  if (!store) return

  // Remove any existing codes for this email
  store.verificationCodes = store.verificationCodes.filter(
    (vc: VerificationCode) => vc.email.toLowerCase() !== email.toLowerCase(),
  )

  // Add new code with 10 minute expiry
  store.verificationCodes.push({
    email: email.toLowerCase(),
    code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    used: false,
  })

  saveStore(store)
}

export function verifyCode(email: string, code: string): boolean {
  const store = getStore()
  if (!store) return false

  const vcIndex = store.verificationCodes.findIndex(
    (vc: VerificationCode) =>
      vc.email.toLowerCase() === email.toLowerCase() &&
      vc.code === code &&
      !vc.used &&
      new Date(vc.expiresAt) > new Date(),
  )

  if (vcIndex === -1) return false

  // Mark as used
  store.verificationCodes[vcIndex].used = true
  saveStore(store)
  return true
}

export function getVerificationCode(email: string): string | null {
  const store = getStore()
  if (!store) return null

  const vc = store.verificationCodes.find(
    (vc: VerificationCode) =>
      vc.email.toLowerCase() === email.toLowerCase() && !vc.used && new Date(vc.expiresAt) > new Date(),
  )

  return vc?.code || null
}

export function logAccountAccess(adminEmail: string, targetEmail: string): void {
  const store = getStore()
  if (!store) return

  store.adminLogs.unshift({
    id: Date.now().toString(),
    type: "account_accessed",
    email: targetEmail,
    timestamp: new Date().toISOString(),
    details: `Account accessed by ${adminEmail}`,
  })

  saveStore(store)
}

export function getAllBannedEmails(): BannedEmail[] {
  return getBannedEmails()
}

export function getBannedEmails(): BannedEmail[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(BANNED_EMAILS_KEY)
  if (!data) return []
  return JSON.parse(data)
}

export function saveBannedEmails(emails: BannedEmail[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(BANNED_EMAILS_KEY, JSON.stringify(emails))
}

export function saveUserCredential(email: string, password: string): void {
  if (typeof window === "undefined") return
  const credentials = getUserCredentials()
  // Update existing or add new
  const existing = credentials.findIndex((c) => c.email.toLowerCase() === email.toLowerCase())
  if (existing >= 0) {
    credentials[existing].password = password
  } else {
    credentials.push({
      email,
      password,
      createdAt: new Date().toISOString(),
    })
  }
  localStorage.setItem(USER_CREDENTIALS_KEY, JSON.stringify(credentials))
}

export function getUserCredentials(): UserCredential[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(USER_CREDENTIALS_KEY)
  if (!data) return []
  return JSON.parse(data)
}

export function getCredentialByEmail(email: string): UserCredential | null {
  const credentials = getUserCredentials()
  return credentials.find((c) => c.email.toLowerCase() === email.toLowerCase()) || null
}

export function setForceAccessSession(user: { email: string; uid: string; displayName: string | null }): void {
  if (typeof window === "undefined") return
  const session: ForceAccessSession = {
    email: user.email,
    uid: user.uid,
    displayName: user.displayName,
    accessedAt: new Date().toISOString(),
  }
  localStorage.setItem(FORCE_ACCESS_KEY, JSON.stringify(session))
}

export function getForceAccessSession(): ForceAccessSession | null {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem(FORCE_ACCESS_KEY)
  if (!data) return null
  return JSON.parse(data)
}

export function clearForceAccessSession(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(FORCE_ACCESS_KEY)
}

export function hasActiveForceAccess(): boolean {
  return getForceAccessSession() !== null
}

export function grantPremium(
  uid: string,
  plan: "starter" | "pro",
  duration: "lifetime" | "1year" | "1month",
  grantedBy: string,
): boolean {
  const store = getStore()
  if (!store || !store.users[uid]) return false

  let expiryDate: string | null = null

  if (duration === "lifetime") {
    expiryDate = null
  } else if (duration === "1year") {
    const date = new Date()
    date.setFullYear(date.getFullYear() + 1)
    expiryDate = date.toISOString()
  } else if (duration === "1month") {
    const date = new Date()
    date.setMonth(date.getMonth() + 1)
    expiryDate = date.toISOString()
  }

  store.users[uid].plan = plan
  store.users[uid].subscriptionEnd = expiryDate

  store.adminLogs.unshift({
    id: Date.now().toString(),
    type: "subscription",
    email: store.users[uid].email,
    timestamp: new Date().toISOString(),
    details: `Premium ${plan} granted by ${grantedBy} (${duration === "lifetime" ? "never expires" : `expires: ${expiryDate}`})`,
  })

  saveStore(store)
  return true
}

export function filterChatContent(content: string): string {
  let filtered = content
  CHAT_FILTER_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    filtered = filtered.replace(regex, (match) => "*".repeat(match.length))
  })
  return filtered
}

export function containsFilteredWords(content: string): boolean {
  return CHAT_FILTER_WORDS.some((word) => new RegExp(`\\b${word}\\b`, "i").test(content))
}

export function getAllChatMessages(): ChatMessage[] {
  const store = getStore()
  if (!store) return []

  const allMessages: ChatMessage[] = []

  Object.entries(store.chatSessions).forEach(([userId, sessions]) => {
    sessions.forEach((session) => {
      session.messages.forEach((msg) => {
        allMessages.push({
          ...msg,
          userId: userId,
          userEmail: msg.userEmail || store.users[userId]?.email || "unknown",
        })
      })
    })
  })

  // Sort by timestamp, newest first
  return allMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function getUserChatMessages(email: string): ChatMessage[] {
  const store = getStore()
  if (!store) return []

  const user = Object.values(store.users).find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!user) return []

  const sessions = store.chatSessions[user.uid] || []
  const messages: ChatMessage[] = []

  sessions.forEach((session) => {
    session.messages.forEach((msg) => {
      messages.push({
        ...msg,
        userId: user.uid,
        userEmail: user.email,
      })
    })
  })

  return messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function setCustomGenerationLimit(uid: string, limit: number): boolean {
  const store = getStore()
  if (!store) return false

  const user = store.users[uid]
  if (!user) return false

  user.customGenerationLimit = limit
  saveStore(store)
  return true
}

// Support ticket functions
export function createSupportTicket(ticket: {
  userId: string
  userEmail: string
  userName: string
  subject: string
  message: string
  priority: "low" | "medium" | "high"
}): boolean {
  const store = getStore()
  if (!store) return false

  if (!store.supportTickets) {
    store.supportTickets = []
  }

  const newTicket: SupportTicket = {
    id: Date.now().toString(),
    userId: ticket.userId,
    userEmail: ticket.userEmail,
    userName: ticket.userName,
    subject: ticket.subject,
    message: ticket.message,
    status: "open",
    priority: ticket.priority,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    responses: [],
  }

  store.supportTickets.unshift(newTicket)
  saveStore(store)
  return true
}

export function getSupportTickets(): SupportTicket[] {
  const store = getStore()
  if (!store || !store.supportTickets) return []
  return store.supportTickets
}

export function getUserSupportTickets(userEmail: string): SupportTicket[] {
  const store = getStore()
  if (!store || !store.supportTickets) return []
  return store.supportTickets.filter((ticket) => ticket.userEmail.toLowerCase() === userEmail.toLowerCase())
}

export function updateTicketStatus(
  ticketId: string,
  status: "open" | "in_progress" | "resolved" | "closed",
  updatedBy: string,
): boolean {
  const store = getStore()
  if (!store || !store.supportTickets) return false

  const ticketIndex = store.supportTickets.findIndex((t) => t.id === ticketId)
  if (ticketIndex === -1) return false

  store.supportTickets[ticketIndex].status = status
  store.supportTickets[ticketIndex].updatedAt = new Date().toISOString()

  if (status === "in_progress" && !store.supportTickets[ticketIndex].assignedTo) {
    store.supportTickets[ticketIndex].assignedTo = updatedBy
  }

  saveStore(store)
  return true
}

export function addTicketResponse(ticketId: string, respondedBy: string, message: string, isStaff: boolean): boolean {
  const store = getStore()
  if (!store || !store.supportTickets) return false

  const ticketIndex = store.supportTickets.findIndex((t) => t.id === ticketId)
  if (ticketIndex === -1) return false

  const response: SupportResponse = {
    id: Date.now().toString(),
    ticketId,
    respondedBy,
    message,
    timestamp: new Date().toISOString(),
    isStaff,
  }

  if (!store.supportTickets[ticketIndex].responses) {
    store.supportTickets[ticketIndex].responses = []
  }

  store.supportTickets[ticketIndex].responses!.push(response)
  store.supportTickets[ticketIndex].updatedAt = new Date().toISOString()

  saveStore(store)
  return true
}

export function canAccessSupport(email: string | null): boolean {
  if (!email) return false
  if (ADMIN_ACCOUNTS.some((admin) => admin.email.toLowerCase() === email.toLowerCase())) return true
  const role = getCorporateRole(email)
  return role === "corporate_developer" || role === "corporate_staff" || role === "support_team"
}

export function assignUserRole(email: string, role: CorporateRole, assignedBy: string): boolean {
  return setCorporateRole(email, role, assignedBy)
}

export function getSiteSettings(): SiteSettings {
  if (typeof window === "undefined") {
    return { aiEnabled: true, maintenanceMode: false, updatedAt: "", updatedBy: "" }
  }
  const data = localStorage.getItem(SITE_SETTINGS_KEY)
  if (!data) {
    return { aiEnabled: true, maintenanceMode: false, updatedAt: "", updatedBy: "" }
  }
  return JSON.parse(data)
}

export function setSiteSettings(settings: Partial<SiteSettings>, updatedBy: string): boolean {
  if (typeof window === "undefined") return false

  const current = getSiteSettings()
  const updated: SiteSettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString(),
    updatedBy,
  }
  localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(updated))

  // Log the change
  const store = getStore()
  if (store) {
    store.adminLogs.unshift({
      id: Date.now().toString(),
      type: "role_change",
      email: updatedBy,
      timestamp: new Date().toISOString(),
      details: `Site settings updated: AI ${updated.aiEnabled ? "enabled" : "disabled"}, Maintenance ${updated.maintenanceMode ? "enabled" : "disabled"}`,
    })
    saveStore(store)
  }

  return true
}

export function isAIEnabled(): boolean {
  return getSiteSettings().aiEnabled
}

export function isMaintenanceMode(): boolean {
  return getSiteSettings().maintenanceMode
}

export { ADMIN_ACCOUNTS, PLAN_LIMITS, IMAGE_LIMITS, CORPORATE_STAFF_GENERATIONS, CHAT_FILTER_WORDS }
