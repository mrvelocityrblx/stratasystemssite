"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Trash2, User, Shield, AlertTriangle, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { updateProfile, deleteUser } from "firebase/auth"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { deleteUserAccount, canDeleteAccount, saveUser } from "@/lib/store"
import { auth } from "@/lib/firebase"

export default function SettingsPage() {
  const { user, userAccount, loading, isAdmin, corporateRole, signOut } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
    if (userAccount?.displayName) {
      setDisplayName(userAccount.displayName)
    }
  }, [loading, user, userAccount, router])

  const handleUpdateProfile = async () => {
    if (!user || !displayName.trim()) return

    setIsUpdating(true)
    try {
      // Update Firebase auth profile
      await updateProfile(user, { displayName: displayName.trim() })

      // Also update in our store
      saveUser({
        uid: user.uid,
        email: user.email || "",
        displayName: displayName.trim(),
      })

      setMessage({ type: "success", text: "Profile updated successfully" })

      // Refresh the page to show updated data
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      console.error("Update profile error:", error)
      setMessage({ type: "error", text: "Failed to update profile" })
    }
    setIsUpdating(false)
    setTimeout(() => setMessage(null), 3000)
  }

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirmation !== "DELETE") return

    // Check if account can be deleted
    if (!canDeleteAccount(user.email)) {
      setMessage({ type: "error", text: "Corporate accounts cannot be deleted" })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    setIsDeleting(true)
    try {
      // Delete from our store first
      deleteUserAccount(user.uid)

      // Then delete from Firebase
      const firebaseUser = auth.currentUser
      if (firebaseUser) {
        await deleteUser(firebaseUser)
      }

      // Sign out and redirect to home
      await signOut()
      router.push("/")
    } catch (error: any) {
      if (error.code === "auth/requires-recent-login") {
        setMessage({ type: "error", text: "Please sign out and sign in again before deleting your account" })
      } else {
        setMessage({ type: "error", text: "Failed to delete account. Please try again." })
      }
      setIsDeleting(false)
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const canDelete = canDeleteAccount(user?.email || null)

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </main>
    )
  }

  if (!user) {
    return null
  }

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
              <div className="p-2 rounded-lg bg-secondary">
                <User className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Settings</h1>
                <p className="text-xs text-muted-foreground">Manage your account</p>
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

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Status Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === "success"
                ? "bg-green-500/10 border border-green-500/20 text-green-500"
                : "bg-red-500/10 border border-red-500/20 text-red-500"
            }`}
          >
            <span>{message.text}</span>
          </div>
        )}

        {/* Profile Settings */}
        <Card className="border-border bg-card mb-6">
          <CardHeader>
            <CardTitle className="text-card-foreground">Profile</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ""}
                disabled
                className="bg-secondary/50 border-border"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-input border-border"
                placeholder="Your display name"
              />
            </div>

            <Button
              onClick={handleUpdateProfile}
              disabled={isUpdating || !displayName.trim()}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="border-border bg-card mb-6">
          <CardHeader>
            <CardTitle className="text-card-foreground">Account Information</CardTitle>
            <CardDescription>Your account details and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="text-foreground font-medium">{userAccount?.plan || "Free"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Account Created</span>
              <span className="text-foreground font-medium">
                {userAccount?.createdAt ? new Date(userAccount.createdAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
            {corporateRole && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Role</span>
                <span className="text-blue-500 font-medium flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  {corporateRole === "corporate_developer"
                    ? "Developer"
                    : corporateRole === "corporate_staff"
                      ? "Staff"
                      : corporateRole === "support_team"
                        ? "Support Team"
                        : "User"}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-500/20 bg-card">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions for your account</CardDescription>
          </CardHeader>
          <CardContent>
            {!canDelete ? (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">
                  <strong>Account deletion is disabled.</strong> Corporate accounts (Admin, Developer, Staff) cannot be
                  deleted.
                </p>
              </div>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-500">Delete Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all of your
                      data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <Label htmlFor="deleteConfirm" className="text-sm text-muted-foreground">
                      Type <span className="font-mono font-bold text-foreground">DELETE</span> to confirm
                    </Label>
                    <Input
                      id="deleteConfirm"
                      type="text"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      className="mt-2 bg-input border-border"
                      placeholder="DELETE"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmation !== "DELETE" || isDeleting}
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete Account"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
