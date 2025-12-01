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
  deleteUserAccount, // Import delete function
  canDeleteAccount, // Import canDelete check
  getUserCredentials, // Import credentials functions
  getCredentialByEmail,
  type UserAccount,
  type AdminLog,
  type RoleRequest,
  type CorporateRole,
  type UserCredential, // Import credential type
} from "@/lib/store"

export default function AdminPage() {
  const { user, loading, isAdmin, corporateRole } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserAccount[]>([])
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([])
  const [banEmail, setBanEmail] = useState("")
  const [roleEmail, setRoleEmail] = useState("")
  const [selectedRole, setSelectedRole] = useState<CorporateRole>("corporate_staff")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [credentials, setCredentials] = useState<UserCredential[]>([])
  const [credentialSearch, setCredentialSearch] = useState("")
  const [foundCredential, setFoundCredential] = useState<UserCredential | null>(null)

  const isOwner = isCorporateAccount(user?.email || null)
  const hasAccess = canAccessAdminPanel(user?.email || null)

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

  const refreshData = () => {
    setUsers(getAllUsers())
    setLogs(getAdminLogs())
    setRoleRequests(getPendingRoleRequests())
    setCredentials(getUserCredentials()) // Load credentials
  }

  const handleBanUser = (emailToBan?: string) => {
    const email = emailToBan || banEmail
    if (!email.trim() || !canBanUsers(user?.email || null)) return

    const success = banUser(email, user?.email || "admin")
    if (success) {
      setMessage({ type: "success", text: `Successfully banned ${email}` })
      setBanEmail("")
      refreshData()
    } else {
      setMessage({ type: "error", text: `Failed to ban user: ${email}` })
    }

    setTimeout(() => setMessage(null), 3000)
  }

  const handleUnbanUser = (email: string) => {
    if (!canBanUsers(user?.email || null)) return

    const success = unbanUser(email)
    if (success) {
      setMessage({ type: "success", text: `Successfully unbanned ${email}` })
      refreshData()
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleDeleteAccount = async (uid: string, email: string) => {
    if (!canDeleteAccount(user?.email || null)) return // Changed permission check

    if (!confirm(`Are you sure you want to delete the account for ${email}? This action cannot be undone.`)) {
      return
    }

    const success = await deleteUserAccount(uid, user?.email || "admin")
    if (success) {
      setMessage({ type: "success", text: `Successfully deleted account: ${email}` })
      refreshData()
    } else {
      setMessage({ type: "error", text: `Failed to delete account: ${email}` })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSearchCredential = () => {
    if (!credentialSearch.trim()) {
      setFoundCredential(null)
      return
    }
    const found = getCredentialByEmail(credentialSearch)
    setFoundCredential(found)
  }

  const handleAssignRole = () => {
    if (!roleEmail.trim() || !selectedRole) return

    // Check if target user exists first
    const targetUser = getUserByEmail(roleEmail)
    if (!targetUser) {
      setMessage({ type: "error", text: `User not found: ${roleEmail}. The user must have an account first.` })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    if (isOwner) {
      // Owner can directly assign any role
      const success = setCorporateRole(roleEmail, selectedRole, user?.email || "")
      if (success) {
        setMessage({
          type: "success",
          text: `Successfully assigned ${selectedRole === "corporate_developer" ? "Corporate Developer" : "Corporate Staff"} to ${roleEmail}`,
        })
        setRoleEmail("")
        refreshData()
      } else {
        setMessage({ type: "error", text: `Failed to assign role to ${roleEmail}` })
      }
    } else if (corporateRole === "corporate_developer") {
      // Developers can only request staff roles, which need approval
      if (selectedRole === "corporate_staff") {
        const success = createRoleRequest(user?.email || "", roleEmail, selectedRole)
        if (success) {
          setMessage({ type: "success", text: `Role request sent for approval. The owner will review it.` })
          setRoleEmail("")
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
    return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Staff</Badge>
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
                  <p className="text-2xl font-bold text-foreground">{users.length}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
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
                  <p className="text-2xl font-bold text-foreground">{users.filter((u) => u.banned).length}</p>
                  <p className="text-sm text-muted-foreground">Banned Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{logs.length}</p>
                  <p className="text-sm text-muted-foreground">Total Logs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            {canViewLogs(user?.email || null) && (
              <TabsTrigger value="logs">
                <FileText className="h-4 w-4 mr-2" />
                Logs
              </TabsTrigger>
            )}
            {isOwner && (
              <TabsTrigger value="credentials">
                <Key className="h-4 w-4 mr-2" />
                Credentials
              </TabsTrigger>
            )}
            {canManageRoles(user?.email || null) && (
              <TabsTrigger value="roles">
                <UserCog className="h-4 w-4 mr-2" />
                Corporate Roles
              </TabsTrigger>
            )}
            <TabsTrigger value="actions">
              <Shield className="h-4 w-4 mr-2" />
              Actions
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-card-foreground">All Users</CardTitle>
                <CardDescription>View and manage all registered accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {users.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No users registered yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {users.map((u) => (
                        <div
                          key={u.uid}
                          className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                              <span className="text-accent font-medium">
                                {u.displayName?.[0] || u.email[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground flex items-center gap-2">
                                {u.displayName || "No name"}
                                {u.banned && <Badge variant="destructive">Banned</Badge>}
                                {getRoleBadge(u.corporateRole)}
                              </p>
                              <p className="text-sm text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </span>
                            {canBanUsers(user?.email || null) && (
                              <>
                                {u.banned ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUnbanUser(u.email)}
                                    className="text-green-500 border-green-500/20 hover:bg-green-500/10"
                                  >
                                    Unban
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleBanUser(u.email)}
                                    className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                                  >
                                    Ban
                                  </Button>
                                )}
                                {canDeleteAccount(u.email) && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteAccount(u.uid, u.email)}
                                    className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          {canViewLogs(user?.email || null) && (
            <TabsContent value="logs">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Activity Logs</CardTitle>
                  <CardDescription>View all account and payment activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {logs.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No activity logs yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {logs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-start gap-3 p-4 rounded-lg border border-border bg-secondary/20"
                          >
                            <div className="p-2 rounded-full bg-secondary">{getLogIcon(log.type)}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground">{log.email}</p>
                                <Badge variant="outline" className="text-xs">
                                  {log.type.replace("_", " ")}
                                </Badge>
                              </div>
                              {log.details && <p className="text-sm text-muted-foreground mt-1">{log.details}</p>}
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(log.timestamp).toLocaleString()}
                              </p>
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

          {isOwner && (
            <TabsContent value="credentials">
              <div className="grid gap-6">
                {/* Search Credential */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-accent" />
                      <CardTitle className="text-card-foreground">Lookup Credentials</CardTitle>
                    </div>
                    <CardDescription>
                      Search for a user&apos;s email and password by their email address
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3 mb-4">
                      <Input
                        placeholder="Enter email to lookup"
                        value={credentialSearch}
                        onChange={(e) => setCredentialSearch(e.target.value)}
                        className="bg-input border-border"
                      />
                      <Button
                        onClick={handleSearchCredential}
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        Search
                      </Button>
                    </div>
                    {foundCredential && (
                      <div className="p-4 rounded-lg border border-accent/30 bg-accent/5">
                        <div className="grid gap-2">
                          <div>
                            <span className="text-sm text-muted-foreground">Email:</span>
                            <p className="font-mono text-foreground">{foundCredential.email}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Password:</span>
                            <p className="font-mono text-foreground">{foundCredential.password}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Created:</span>
                            <p className="text-sm text-foreground">
                              {new Date(foundCredential.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {credentialSearch && !foundCredential && (
                      <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5 text-red-400">
                        No credentials found for this email. The user may have signed up with Google/Discord.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* All Credentials */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Key className="h-5 w-5 text-yellow-500" />
                      <CardTitle className="text-card-foreground">All Stored Credentials</CardTitle>
                    </div>
                    <CardDescription>All email/password combinations from account signups</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      {credentials.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No stored credentials yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {credentials.map((cred, idx) => (
                            <div key={idx} className="p-4 rounded-lg border border-border bg-secondary/20">
                              <div className="grid gap-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Email:</span>
                                  <span className="font-mono text-foreground text-sm">{cred.email}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Password:</span>
                                  <span className="font-mono text-foreground text-sm">{cred.password}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Created:</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(cred.createdAt).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Corporate Roles Tab */}
          {canManageRoles(user?.email || null) && (
            <TabsContent value="roles">
              <div className="grid gap-6">
                {/* Assign Role */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Assign Corporate Role</CardTitle>
                    <CardDescription>
                      {isOwner
                        ? "Grant corporate roles to users (user must have an existing account)"
                        : "Request corporate staff role (requires owner approval)"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Enter email address"
                        value={roleEmail}
                        onChange={(e) => setRoleEmail(e.target.value)}
                        className="bg-input border-border"
                      />
                      <Select
                        value={selectedRole || ""}
                        onValueChange={(value) => setSelectedRole(value as CorporateRole)}
                      >
                        <SelectTrigger className="w-[200px] bg-input border-border">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {isOwner && <SelectItem value="corporate_developer">Corporate Developer</SelectItem>}
                          <SelectItem value="corporate_staff">Corporate Staff</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAssignRole}
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        {isOwner ? "Assign Role" : "Request Role"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Corporate Users */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Corporate Users</CardTitle>
                    <CardDescription>Users with corporate roles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      {corporateUsers.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <UserCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No corporate users yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {corporateUsers.map((u) => (
                            <div
                              key={u.uid}
                              className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/20"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                  <span className="text-accent font-medium">
                                    {u.displayName?.[0] || u.email[0].toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-foreground">{u.displayName || "No name"}</p>
                                  <p className="text-sm text-muted-foreground">{u.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getRoleBadge(u.corporateRole)}
                                {isOwner && u.email.toLowerCase() !== "stratasystemscorp@gmail.com" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRemoveRole(u.email)}
                                    className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                                  >
                                    Remove Role
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Actions Tab */}
          <TabsContent value="actions">
            <div className="grid gap-6">
              {/* Ban User */}
              {canBanUsers(user?.email || null) && (
                <Card className="border-border bg-card">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Ban className="h-5 w-5 text-red-500" />
                      <CardTitle className="text-card-foreground">Ban User</CardTitle>
                    </div>
                    <CardDescription>
                      Terminate a user account. They will be logged out and cannot log back in.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Enter email to ban"
                        value={banEmail}
                        onChange={(e) => setBanEmail(e.target.value)}
                        className="bg-input border-border"
                      />
                      <Button onClick={() => handleBanUser()} variant="destructive">
                        Ban User
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
