"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Shield,
  Users,
  Ban,
  FileText,
  CreditCard,
  LogIn,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  UserCog,
  Clock,
  X,
  Check,
  Loader2,
  Trash2,
  Key,
  Search,
  MessageSquare,
  Hash,
  ShieldCheck,
  Headset,
  Send,
  Power,
  Wrench,
  Bot,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  getAllUsers,
  getAdminLogs,
  banUser,
  unbanUser,
  getUserByEmail,
  canBanUsers,
  canViewLogs,
  canManageRoles,
  isCorporateAccount,
  setCorporateRole,
  removeCorporateRole,
  createRoleRequest,
  getPendingRoleRequests,
  approveRoleRequest,
  rejectRoleRequest,
  canAccessAdminPanel,
  deleteUserAccount,
  canDeleteAccount,
  grantPremium,
  getAllChatMessages,
  setCustomGenerationLimit,
  getSupportTickets,
  updateTicketStatus,
  addTicketResponse,
  canAccessSupport,
  assignUserRole,
  getSiteSettings,
  setSiteSettings,
  getCorporateRole,
  type UserAccount,
  type AdminLog,
  type RoleRequest,
  type CorporateRole,
  type ChatMessage,
  type SupportTicket,
} from "@/lib/store"
import {
  getGlobalCredentials,
  getGlobalCredentialByEmail,
  addGlobalBan,
  removeGlobalBan,
  getGlobalUsers,
  deleteGlobalUser,
  getGlobalBans,
  type GlobalCredential,
  type GlobalUser,
  type GlobalBan,
} from "@/lib/firestore-store"

export default function AdminPage() {
  const { user, loading, isAdmin, corporateRole } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserAccount[]>([])
  const [globalUsers, setGlobalUsers] = useState<GlobalUser[]>([])
  const [globalBans, setGlobalBans] = useState<GlobalBan[]>([])
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([])
  const [banEmail, setBanEmail] = useState("")
  const [assignRoleEmailState, setAssignRoleEmailState] = useState("")
  const [selectedRole, setSelectedRole] = useState<CorporateRole>("corporate_staff")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [credentials, setCredentials] = useState<GlobalCredential[]>([])
  const [credentialSearch, setCredentialSearch] = useState("")
  const [foundCredential, setFoundCredential] = useState<GlobalCredential | null>(null)
  const [grantingPremium, setGrantingPremium] = useState<{ [key: string]: boolean }>({})
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([])
  const [messageSearch, setMessageSearch] = useState("")
  const [customGenerations, setCustomGenerations] = useState<{ [key: string]: string }>({})
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([])
  const [ticketResponses, setTicketResponses] = useState<{ [key: string]: string }>({})
  const [assignRoleEmail, setAssignRoleEmail] = useState("")
  const [assignRoleType, setAssignRoleType] = useState<CorporateRole>("support_team")
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(true)
  const [aiEnabled, setAiEnabled] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  const isOwner = isCorporateAccount(user?.email || null)
  const hasAccess = canAccessAdminPanel(user?.email || null)
  const canViewSupport = canAccessSupport(user?.email || null)
  const isDeveloper = isOwner || getCorporateRole(user?.email || null) === "corporate_developer"

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }
    if (!loading && user && !hasAccess) {
      router.push("/dashboard")
    }
  }, [loading, user, hasAccess, router])

  useEffect(() => {
    if (hasAccess) {
      refreshData()
    }
  }, [hasAccess])

  useEffect(() => {
    const settings = getSiteSettings()
    setAiEnabled(settings.aiEnabled)
    setMaintenanceMode(settings.maintenanceMode)
  }, [])

  const refreshData = async () => {
    setUsers(getAllUsers())
    setLogs(getAdminLogs())
    setRoleRequests(getPendingRoleRequests())
    setAllMessages(getAllChatMessages())
    setSupportTickets(getSupportTickets())

    setIsLoadingGlobal(true)
    try {
      const [globalCreds, globalUsersData, globalBansData] = await Promise.all([
        getGlobalCredentials(),
        getGlobalUsers(),
        getGlobalBans(),
      ])
      setCredentials(globalCreds)
      setGlobalUsers(globalUsersData)
      setGlobalBans(globalBansData)
    } catch (error) {
      console.error("Error loading global data:", error)
    }
    setIsLoadingGlobal(false)
  }

  const isEmailBannedGlobally = (email: string): boolean => {
    return globalBans.some((ban) => ban.email === email)
  }

  const handleBanUser = async (emailToBan?: string) => {
    const email = emailToBan || banEmail
    if (!email.trim() || !canBanUsers(user?.email || null)) return

    // Ban locally if user exists
    banUser(email, user?.email || "admin")
    // Ban globally in Firestore (works for any email)
    await addGlobalBan(email, user?.email || "admin")

    setMessage({ type: "success", text: `Successfully banned ${email} globally` })
    setBanEmail("")
    await refreshData()

    setTimeout(() => setMessage(null), 3000)
  }

  const handleUnbanUser = async (email: string) => {
    if (!canBanUsers(user?.email || null)) return

    // Unban locally
    unbanUser(email)
    // Unban globally in Firestore
    await removeGlobalBan(email)

    setMessage({ type: "success", text: `Successfully unbanned ${email} globally` })
    await refreshData()
    setTimeout(() => setMessage(null), 3000)
  }

  const handleDeleteAccount = async (uid: string, email: string) => {
    if (!canDeleteAccount(user?.email || null)) return

    if (!confirm(`Are you sure you want to delete the account for ${email}? This action cannot be undone.`)) {
      return
    }

    const success = await deleteUserAccount(uid, user?.email || "admin")
    // Also delete from global store
    await deleteGlobalUser(uid)

    if (success) {
      setMessage({ type: "success", text: `Successfully deleted account: ${email}` })
      refreshData()
    } else {
      setMessage({ type: "error", text: `Failed to delete account: ${email}` })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSearchCredential = async () => {
    if (!credentialSearch.trim()) {
      setFoundCredential(null)
      return
    }
    const found = await getGlobalCredentialByEmail(credentialSearch)
    setFoundCredential(found)
  }

  const handleAssignCorporateRole = () => {
    if (!assignRoleEmailState.trim() || !selectedRole) return

    const targetUser = getUserByEmail(assignRoleEmailState)
    if (!targetUser) {
      setMessage({
        type: "error",
        text: `User not found: ${assignRoleEmailState}. The user must have an account first.`,
      })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    if (isOwner) {
      const success = setCorporateRole(assignRoleEmailState, selectedRole, user?.email || "")
      if (success) {
        setMessage({
          type: "success",
          text: `Successfully assigned ${selectedRole === "corporate_developer" ? "Corporate Developer" : "Corporate Staff"} to ${assignRoleEmailState}`,
        })
        setAssignRoleEmailState("")
        refreshData()
      } else {
        setMessage({ type: "error", text: `Failed to assign role to ${assignRoleEmailState}` })
      }
    } else if (corporateRole === "corporate_developer") {
      if (selectedRole === "corporate_staff") {
        const success = createRoleRequest(user?.email || "", assignRoleEmailState, selectedRole)
        if (success) {
          setMessage({ type: "success", text: `Role request sent for approval. The owner will review it.` })
          setAssignRoleEmailState("")
          refreshData()
        } else {
          setMessage({
            type: "error",
            text: `Failed to create role request. There may already be a pending request for this user.`,
          })
        }
      } else {
        setMessage({ type: "error", text: `You can only request Corporate Staff roles` })
      }
    }

    setTimeout(() => setMessage(null), 3000)
  }

  const handleRemoveRole = (email: string) => {
    if (!isOwner) return

    const success = removeCorporateRole(email, user?.email || "")
    if (success) {
      setMessage({ type: "success", text: `Removed corporate role from ${email}` })
      refreshData()
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleApproveRequest = (requestId: string) => {
    if (!isOwner) return

    const success = approveRoleRequest(requestId, user?.email || "")
    if (success) {
      setMessage({ type: "success", text: `Role request approved` })
      refreshData()
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleRejectRequest = (requestId: string) => {
    if (!isOwner) return

    const success = rejectRoleRequest(requestId, user?.email || "")
    if (success) {
      setMessage({ type: "success", text: `Role request rejected` })
      refreshData()
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleGrantPremium = async (
    uid: string,
    plan: "starter" | "pro",
    duration: "lifetime" | "1year" | "1month",
  ) => {
    if (!user?.email) return

    setGrantingPremium({ ...grantingPremium, [uid]: true })

    const success = grantPremium(uid, plan, duration, user.email)

    if (success) {
      setMessage({ type: "success", text: `Premium ${plan} granted to ${uid}` })
      refreshData()
    } else {
      setMessage({ type: "error", text: `Failed to grant premium to ${uid}` })
    }

    setGrantingPremium({ ...grantingPremium, [uid]: false })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleSetCustomGenerations = (uid: string) => {
    const limit = customGenerations[uid]
    if (!limit || isNaN(Number(limit))) {
      setMessage({ type: "error", text: "Please enter a valid number" })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    const success = setCustomGenerationLimit(uid, Number(limit))
    if (success) {
      setMessage({ type: "success", text: "Custom generation limit set successfully" })
      setCustomGenerations({ ...customGenerations, [uid]: "" })
      refreshData()
    } else {
      setMessage({ type: "error", text: "Failed to set custom generation limit" })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleUpdateTicketStatus = (ticketId: string, status: "open" | "in_progress" | "resolved" | "closed") => {
    const success = updateTicketStatus(ticketId, status, user?.email || "")
    if (success) {
      setMessage({ type: "success", text: `Ticket status updated to ${status}` })
      refreshData()
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleAddTicketResponse = (ticketId: string) => {
    const response = ticketResponses[ticketId]
    if (!response || !response.trim()) return

    const success = addTicketResponse(ticketId, user?.email || "", response, true)
    if (success) {
      setMessage({ type: "success", text: "Response added successfully" })
      setTicketResponses({ ...ticketResponses, [ticketId]: "" })
      refreshData()
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleAssignSupportRole = () => {
    if (!assignRoleEmail.trim() || !assignRoleType) return

    const targetUser = getUserByEmail(assignRoleEmail)
    if (!targetUser) {
      setMessage({ type: "error", text: "User not found" })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    const success = assignUserRole(assignRoleEmail, assignRoleType, user?.email || "")
    if (success) {
      setMessage({ type: "success", text: `Role ${assignRoleType} assigned to ${assignRoleEmail}` })
      setAssignRoleEmail("")
      refreshData()
    } else {
      setMessage({ type: "error", text: "Failed to assign role" })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleToggleAI = (enabled: boolean) => {
    setAiEnabled(enabled)
    setSiteSettings({ aiEnabled: enabled }, user?.email || "admin")
    setMessage({
      type: "success",
      text: `AI has been ${enabled ? "enabled" : "disabled"}`,
    })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleToggleMaintenance = (enabled: boolean) => {
    setMaintenanceMode(enabled)
    setSiteSettings({ maintenanceMode: enabled }, user?.email || "admin")
    setMessage({
      type: "success",
      text: `Maintenance mode has been ${enabled ? "enabled" : "disabled"}`,
    })
    setTimeout(() => setMessage(null), 3000)
  }

  const getLogIcon = (type: AdminLog["type"]) => {
    switch (type) {
      case "account_created":
        return <UserPlus className="h-4 w-4 text-green-500" />
      case "account_banned":
        return <Ban className="h-4 w-4 text-red-500" />
      case "account_deleted":
        return <Trash2 className="h-4 w-4 text-red-500" />
      case "account_accessed":
        return <LogIn className="h-4 w-4 text-yellow-500" />
      case "payment":
        return <CreditCard className="h-4 w-4 text-blue-500" />
      case "login":
        return <LogIn className="h-4 w-4 text-accent" />
      case "role_change":
        return <UserCog className="h-4 w-4 text-purple-500" />
      case "role_request":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getRoleBadge = (role: CorporateRole) => {
    if (!role) return null
    if (role === "corporate_developer") {
      return <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/30">Developer</Badge>
    }
    if (role === "support_team") {
      return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Support Team</Badge>
    }
    return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Staff</Badge>
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Open</Badge>
      case "in_progress":
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">In Progress</Badge>
      case "resolved":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Resolved</Badge>
      case "closed":
        return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/30">Closed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
        <div className="text-muted-foreground">Loading...</div>
      </main>
    )
  }

  if (!user || !hasAccess) {
    return null
  }

  const corporateUsers = users.filter((u) => u.corporateRole)
  const filteredMessages = messageSearch
    ? allMessages.filter(
        (msg) =>
          msg.userEmail?.toLowerCase().includes(messageSearch.toLowerCase()) ||
          msg.content.toLowerCase().includes(messageSearch.toLowerCase()),
      )
    : allMessages

  const allUsersList =
    globalUsers.length > 0
      ? globalUsers.map((u) => ({
          ...u,
          banned: isEmailBannedGlobally(u.email),
        }))
      : users.map((u) => ({
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
          createdAt: u.createdAt,
          plan: u.plan,
          subscriptionEnd: u.subscriptionEnd,
          corporateRole: u.corporateRole,
          customGenerationLimit: u.customGenerationLimit,
          banned: u.banned || isEmailBannedGlobally(u.email),
        }))

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">
                  {isOwner
                    ? "Owner Access"
                    : corporateRole === "corporate_developer"
                      ? "Developer Access"
                      : corporateRole === "support_team"
                        ? "Support Team Access"
                        : "Staff Access"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/">
              <Image
                src="/images/strata-logo.png"
                alt="Strata Systems Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Status Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-500/10 border border-green-500/20 text-green-500"
                : "bg-red-500/10 border border-red-500/20 text-red-500"
            }`}
          >
            {message.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Pending Role Requests - Only for Owner */}
        {isOwner && roleRequests.length > 0 && (
          <Card className="border-border bg-card mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <CardTitle className="text-card-foreground">Pending Role Requests</CardTitle>
              </div>
              <CardDescription>Review and approve role requests from developers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {roleRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/20"
                  >
                    <div>
                      <p className="font-medium text-foreground">{request.targetEmail}</p>
                      <p className="text-sm text-muted-foreground">
                        Requested by {request.requestedBy} for{" "}
                        {request.role === "corporate_staff" ? "Corporate Staff" : "Corporate Developer"}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(request.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveRequest(request.id)}
                        className="bg-green-500 text-white hover:bg-green-600"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectRequest(request.id)}
                        className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid sm:grid-cols-4 gap-4 mb-6">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{allUsersList.length}</p>
                  <p className="text-sm text-muted-foreground">Total Users (Global)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <UserCog className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{corporateUsers.length}</p>
                  <p className="text-sm text-muted-foreground">Corporate Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Ban className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{allUsersList.filter((u) => u.banned).length}</p>
                  <p className="text-sm text-muted-foreground">Banned Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Key className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{credentials.length}</p>
                  <p className="text-sm text-muted-foreground">Credentials (Global)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 bg-secondary border border-border">
            <TabsTrigger value="users" className="text-foreground data-[state=active]:bg-card">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            {canViewLogs(user?.email || null) && (
              <TabsTrigger value="logs" className="text-foreground data-[state=active]:bg-card">
                <FileText className="h-4 w-4 mr-2" />
                Logs
              </TabsTrigger>
            )}
            {canBanUsers(user?.email || null) && (
              <TabsTrigger value="ban" className="text-foreground data-[state=active]:bg-card">
                <Ban className="h-4 w-4 mr-2" />
                Ban Users
              </TabsTrigger>
            )}
            {canManageRoles(user?.email || null) && (
              <TabsTrigger value="roles" className="text-foreground data-[state=active]:bg-card">
                <UserCog className="h-4 w-4 mr-2" />
                Roles
              </TabsTrigger>
            )}
            {canViewSupport && (
              <TabsTrigger value="support" className="text-foreground data-[state=active]:bg-card">
                <Headset className="h-4 w-4 mr-2" />
                Support
              </TabsTrigger>
            )}
            {isDeveloper && (
              <TabsTrigger value="developer" className="text-foreground data-[state=active]:bg-card">
                <Wrench className="h-4 w-4 mr-2" />
                Developer
              </TabsTrigger>
            )}
            {isOwner && (
              <TabsTrigger value="messages" className="text-foreground data-[state=active]:bg-card">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </TabsTrigger>
            )}
            {isOwner && (
              <TabsTrigger value="credentials" className="text-foreground data-[state=active]:bg-card">
                <Key className="h-4 w-4 mr-2" />
                Credentials
              </TabsTrigger>
            )}
          </TabsList>

          {/* Users Tab - Now showing global users */}
          <TabsContent value="users">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">All Users (Global)</CardTitle>
                <CardDescription>View all users across all devices and manage their accounts</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingGlobal ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-accent" />
                    <span className="ml-2 text-muted-foreground">Loading global users...</span>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px]">
                    {allUsersList.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No users found</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {allUsersList.map((u) => (
                          <div key={u.uid} className="p-4 rounded-lg border border-border bg-secondary/20">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-foreground">{u.displayName}</p>
                                  {u.corporateRole && (
                                    <Badge variant="outline" className="text-xs text-blue-500 border-blue-500/20">
                                      {u.corporateRole === "corporate_developer" ? "Developer" : "Staff"}
                                    </Badge>
                                  )}
                                  {u.banned && (
                                    <Badge variant="outline" className="text-xs text-red-500 border-red-500/20">
                                      Banned
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{u.email}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline">{u.plan}</Badge>
                                  {u.subscriptionEnd && (
                                    <span className="text-xs text-muted-foreground">
                                      Until {new Date(u.subscriptionEnd).toLocaleDateString()}
                                    </span>
                                  )}
                                  {u.customGenerationLimit !== undefined && (
                                    <Badge variant="outline" className="text-xs">
                                      <Hash className="h-3 w-3 mr-1" />
                                      {u.customGenerationLimit === Number.POSITIVE_INFINITY
                                        ? "Unlimited"
                                        : u.customGenerationLimit}
                                    </Badge>
                                  )}
                                </div>

                                {isOwner && !u.corporateRole && (
                                  <div className="mt-3 flex items-center gap-2">
                                    <Input
                                      type="number"
                                      placeholder="Custom generation limit"
                                      value={customGenerations[u.uid] || ""}
                                      onChange={(e) =>
                                        setCustomGenerations({ ...customGenerations, [u.uid]: e.target.value })
                                      }
                                      className="w-48 h-8 text-sm"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => handleSetCustomGenerations(u.uid)}
                                      disabled={!customGenerations[u.uid]}
                                      className="h-8"
                                    >
                                      Set Limit
                                    </Button>
                                  </div>
                                )}

                                {/* Grant Premium Section */}
                                {isOwner && !u.corporateRole && (
                                  <div className="mt-3 pt-3 border-t border-border">
                                    <p className="text-xs text-muted-foreground mb-2">Grant Premium:</p>
                                    <div className="flex flex-wrap gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleGrantPremium(u.uid, "starter", "1month")}
                                        disabled={grantingPremium[u.uid]}
                                        className="h-7 text-xs"
                                      >
                                        Starter 1M
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleGrantPremium(u.uid, "starter", "1year")}
                                        disabled={grantingPremium[u.uid]}
                                        className="h-7 text-xs"
                                      >
                                        Starter 1Y
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleGrantPremium(u.uid, "pro", "1month")}
                                        disabled={grantingPremium[u.uid]}
                                        className="h-7 text-xs"
                                      >
                                        Pro 1M
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleGrantPremium(u.uid, "pro", "1year")}
                                        disabled={grantingPremium[u.uid]}
                                        className="h-7 text-xs"
                                      >
                                        Pro 1Y
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleGrantPremium(u.uid, "pro", "lifetime")}
                                        disabled={grantingPremium[u.uid]}
                                        className="h-7 text-xs"
                                      >
                                        Pro Lifetime
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {u.banned && canBanUsers(user?.email || null) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUnbanUser(u.email)}
                                    className="text-green-500 border-green-500/20 hover:bg-green-500/10"
                                    title="Unban user"
                                  >
                                    <ShieldCheck className="h-4 w-4" />
                                  </Button>
                                )}
                                {/* Ban button for non-banned users */}
                                {!u.banned && canBanUsers(user?.email || null) && !isCorporateAccount(u.email) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleBanUser(u.email)}
                                    className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                                    title="Ban user"
                                  >
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                )}
                                {canDeleteAccount(user?.email || null) && !isCorporateAccount(u.email) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteAccount(u.uid, u.email)}
                                    className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                                    title="Delete account"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          {canViewLogs(user?.email || null) && (
            <TabsContent value="logs">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Admin Logs</CardTitle>
                  <CardDescription>View all administrative actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    {logs.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No logs found</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {logs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-start gap-3 p-3 rounded-lg border border-border bg-secondary/20"
                          >
                            {getLogIcon(log.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{log.email}</p>
                              <p className="text-xs text-muted-foreground">{log.details || log.type}</p>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Ban Users Tab */}
          {canBanUsers(user?.email || null) && (
            <TabsContent value="ban">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Ban Users (Global)</CardTitle>
                  <CardDescription>Ban users globally across all devices and IP addresses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter email to ban globally"
                      value={banEmail}
                      onChange={(e) => setBanEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={() => handleBanUser()} disabled={!banEmail.trim()}>
                      <Ban className="h-4 w-4 mr-2" />
                      Ban Globally
                    </Button>
                  </div>

                  {/* Banned Users List */}
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-foreground mb-3">Currently Banned Users</h3>
                    <ScrollArea className="h-[300px]">
                      {allUsersList.filter((u) => u.banned).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No banned users</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {allUsersList
                            .filter((u) => u.banned)
                            .map((u) => (
                              <div
                                key={u.uid}
                                className="flex items-center justify-between p-3 rounded-lg border border-red-500/20 bg-red-500/5"
                              >
                                <div>
                                  <p className="font-medium text-foreground">{u.displayName}</p>
                                  <p className="text-sm text-muted-foreground">{u.email}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUnbanUser(u.email)}
                                  className="text-green-500 border-green-500/20 hover:bg-green-500/10"
                                >
                                  <ShieldCheck className="h-4 w-4 mr-1" />
                                  Unban
                                </Button>
                              </div>
                            ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Roles Tab */}
          {canManageRoles(user?.email || null) && (
            <TabsContent value="roles">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Manage Roles</CardTitle>
                  <CardDescription>Assign corporate roles to users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter email"
                      value={assignRoleEmailState}
                      onChange={(e) => setAssignRoleEmailState(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={selectedRole || ""} onValueChange={(v) => setSelectedRole(v as CorporateRole)}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {isOwner && <SelectItem value="corporate_developer">Corporate Developer</SelectItem>}
                        <SelectItem value="corporate_staff">Corporate Staff</SelectItem>
                        <SelectItem value="support_team">Support Team</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleAssignCorporateRole} disabled={!assignRoleEmailState.trim()}>
                      <UserCog className="h-4 w-4 mr-2" />
                      Assign Role
                    </Button>
                  </div>

                  {/* Current Corporate Users */}
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-3">Current Corporate Users</h3>
                    <ScrollArea className="h-[300px]">
                      {corporateUsers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <UserCog className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No corporate users</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {corporateUsers.map((u) => (
                            <div
                              key={u.uid}
                              className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20"
                            >
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="font-medium text-foreground">{u.displayName}</p>
                                  <p className="text-sm text-muted-foreground">{u.email}</p>
                                </div>
                                {getRoleBadge(u.corporateRole)}
                              </div>
                              {isOwner && !isCorporateAccount(u.email) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRemoveRole(u.email)}
                                  className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Support Tab */}
          {canViewSupport && (
            <TabsContent value="support">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Support Tickets</CardTitle>
                  <CardDescription>Manage support tickets and assign support roles</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Assign Support Role */}
                  {isOwner && (
                    <div className="mb-6 p-4 rounded-lg border border-border bg-secondary/20">
                      <h3 className="text-sm font-medium text-foreground mb-3">Assign Support Role</h3>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter email"
                          value={assignRoleEmail}
                          onChange={(e) => setAssignRoleEmail(e.target.value)}
                          className="flex-1"
                        />
                        <Select
                          value={assignRoleType || ""}
                          onValueChange={(v) => setAssignRoleType(v as CorporateRole)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="support_team">Support Team</SelectItem>
                            <SelectItem value="corporate_staff">Staff</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={handleAssignSupportRole} disabled={!assignRoleEmail.trim()}>
                          Assign
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Tickets List */}
                  <ScrollArea className="h-[400px]">
                    {supportTickets.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Headset className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No support tickets</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {supportTickets.map((ticket) => (
                          <div key={ticket.id} className="p-4 rounded-lg border border-border bg-secondary/20">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-medium text-foreground">{ticket.subject}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {ticket.userEmail} - {new Date(ticket.createdAt).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(ticket.status)}
                                <Badge variant="outline" className="text-xs">
                                  {ticket.priority}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-foreground mb-3">{ticket.message}</p>

                            {/* Ticket Responses */}
                            {ticket.responses && ticket.responses.length > 0 && (
                              <div className="mt-3 space-y-2 pl-4 border-l-2 border-border">
                                {ticket.responses.map((resp) => (
                                  <div key={resp.id} className="text-sm">
                                    <span
                                      className={resp.isStaff ? "text-accent font-medium" : "text-muted-foreground"}
                                    >
                                      {resp.respondedBy}:
                                    </span>
                                    <span className="text-foreground ml-2">{resp.message}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Response Input */}
                            <div className="mt-3 flex gap-2">
                              <Textarea
                                placeholder="Add a response..."
                                value={ticketResponses[ticket.id] || ""}
                                onChange={(e) =>
                                  setTicketResponses({ ...ticketResponses, [ticket.id]: e.target.value })
                                }
                                className="min-h-[60px]"
                              />
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAddTicketResponse(ticket.id)}
                                disabled={!ticketResponses[ticket.id]?.trim()}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Send
                              </Button>
                              <Select
                                value={ticket.status}
                                onValueChange={(v) => handleUpdateTicketStatus(ticket.id, v as any)}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Messages Tab */}
          {isOwner && (
            <TabsContent value="messages">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">User Messages</CardTitle>
                  <CardDescription>View all EchoAI chat messages from users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by email or content..."
                        value={messageSearch}
                        onChange={(e) => setMessageSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <ScrollArea className="h-[400px]">
                    {filteredMessages.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No messages found</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-3 rounded-lg border ${
                              msg.role === "user" ? "border-accent/20 bg-accent/5" : "border-border bg-secondary/20"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-accent">{msg.userEmail || "Unknown User"}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-foreground">{msg.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Credentials Tab - Now showing global credentials */}
          {isOwner && (
            <TabsContent value="credentials">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">User Credentials (Global)</CardTitle>
                  <CardDescription>View all user credentials across all devices</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Search */}
                  <div className="mb-6">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by email..."
                          value={credentialSearch}
                          onChange={(e) => setCredentialSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Button onClick={handleSearchCredential}>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                    </div>
                    {foundCredential && (
                      <div className="mt-4 p-4 rounded-lg border border-accent/20 bg-accent/5">
                        <h4 className="font-medium text-foreground mb-2">Found Credential:</h4>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Email:</span>{" "}
                            <span className="text-foreground">{foundCredential.email}</span>
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Password:</span>{" "}
                            <span className="text-foreground font-mono">{foundCredential.password}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(foundCredential.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* All Credentials List */}
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-3">All Credentials ({credentials.length})</h3>
                    {isLoadingGlobal ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-accent" />
                        <span className="ml-2 text-muted-foreground">Loading global credentials...</span>
                      </div>
                    ) : (
                      <ScrollArea className="h-[350px]">
                        {credentials.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
                            <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No credentials stored</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {credentials.map((cred, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-lg border border-border bg-secondary/20 flex items-center justify-between"
                              >
                                <div>
                                  <p className="text-sm font-medium text-foreground">{cred.email}</p>
                                  <p className="text-xs text-muted-foreground font-mono">{cred.password}</p>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(cred.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {isDeveloper && (
            <TabsContent value="developer">
              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-accent" />
                    <CardTitle className="text-card-foreground">Developer Controls</CardTitle>
                  </div>
                  <CardDescription>Manage site-wide settings and controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* AI Toggle */}
                  <div className="p-6 rounded-lg border border-border bg-secondary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${aiEnabled ? "bg-green-500/10" : "bg-red-500/10"}`}>
                          <Bot className={`h-6 w-6 ${aiEnabled ? "text-green-500" : "text-red-500"}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">AI Service</h3>
                          <p className="text-sm text-muted-foreground">
                            {aiEnabled
                              ? "EchoAI is currently enabled and accepting requests"
                              : "EchoAI is disabled - users will see a maintenance message"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label htmlFor="ai-toggle" className="text-sm text-muted-foreground">
                          {aiEnabled ? "Enabled" : "Disabled"}
                        </Label>
                        <Switch id="ai-toggle" checked={aiEnabled} onCheckedChange={handleToggleAI} />
                      </div>
                    </div>
                  </div>

                  {/* Maintenance Mode Toggle */}
                  <div className="p-6 rounded-lg border border-border bg-secondary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${maintenanceMode ? "bg-yellow-500/10" : "bg-green-500/10"}`}>
                          <Power className={`h-6 w-6 ${maintenanceMode ? "text-yellow-500" : "text-green-500"}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">Maintenance Mode</h3>
                          <p className="text-sm text-muted-foreground">
                            {maintenanceMode
                              ? "Site is in maintenance mode - only developers can access"
                              : "Site is live and accessible to all users"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label htmlFor="maintenance-toggle" className="text-sm text-muted-foreground">
                          {maintenanceMode ? "Active" : "Inactive"}
                        </Label>
                        <Switch
                          id="maintenance-toggle"
                          checked={maintenanceMode}
                          onCheckedChange={handleToggleMaintenance}
                        />
                      </div>
                    </div>
                    {maintenanceMode && (
                      <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <div className="flex items-center gap-2 text-yellow-500">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Warning: Users will see a maintenance page and cannot access the site
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Summary */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-border bg-card">
                      <div className="flex items-center gap-3 mb-2">
                        <Bot className={`h-5 w-5 ${aiEnabled ? "text-green-500" : "text-red-500"}`} />
                        <span className="font-medium text-foreground">AI Status</span>
                      </div>
                      <Badge
                        className={
                          aiEnabled
                            ? "bg-green-500/20 text-green-500 border-green-500/30"
                            : "bg-red-500/20 text-red-500 border-red-500/30"
                        }
                      >
                        {aiEnabled ? "Online" : "Offline"}
                      </Badge>
                    </div>
                    <div className="p-4 rounded-lg border border-border bg-card">
                      <div className="flex items-center gap-3 mb-2">
                        <Power className={`h-5 w-5 ${maintenanceMode ? "text-yellow-500" : "text-green-500"}`} />
                        <span className="font-medium text-foreground">Site Status</span>
                      </div>
                      <Badge
                        className={
                          maintenanceMode
                            ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                            : "bg-green-500/20 text-green-500 border-green-500/30"
                        }
                      >
                        {maintenanceMode ? "Maintenance" : "Live"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </main>
  )
}
