"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, AlertTriangle, Loader2, Trash2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { deleteUserAccount, canDeleteAccount, saveUser } from "@/lib/store"
import { ThemeToggle } from "@/components/theme-toggle"

export default function SettingsPage() {
  const { user, userAccount, loading, signOut } = useAuth()
  const router = useRouter()
  const [displayName, setDisplayName] = useState("")
  const [message, setMessage] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  useEffect(() => { if (!loading && !user) router.push("/login"); if (userAccount) setDisplayName(userAccount.displayName) }, [loading, user, userAccount, router])
  if (loading) return <main className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading...</main>
  if (!user) return null
  const canDelete = canDeleteAccount(user.email)
  const updateProfile = () => { if (!displayName.trim()) return; saveUser({ uid: user.uid, email: user.email, displayName: displayName.trim() }); setMessage("Profile updated successfully") }
  const deleteAccount = async () => { if (confirmation !== "DELETE" || !canDelete) return; setIsDeleting(true); deleteUserAccount(user.uid); await signOut(); router.push("/") }
  return <main className="min-h-screen bg-background"><header className="sticky top-0 z-10 border-b border-border bg-card"><div className="container mx-auto flex items-center justify-between px-4 py-4"><div className="flex items-center gap-4"><Link href="/dashboard" aria-label="Back to dashboard"><ArrowLeft className="h-5 w-5" /></Link><div className="flex items-center gap-3"><div className="rounded-lg bg-secondary p-2"><User className="h-6 w-6" /></div><div><h1 className="text-xl font-bold">Settings</h1><p className="text-xs text-muted-foreground">Manage your account</p></div></div></div><ThemeToggle /></div></header><div className="container mx-auto max-w-2xl space-y-6 px-4 py-8">{message && <p className="rounded-lg border border-accent/20 bg-accent/10 p-3 text-sm text-accent">{message}</p>}<Card><CardHeader><CardTitle>Profile</CardTitle><CardDescription>Update the name shown across Strata Systems.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="email">Google account</Label><Input id="email" value={user.email} disabled /></div><div className="space-y-2"><Label htmlFor="displayName">Display name</Label><Input id="displayName" value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></div><Button onClick={updateProfile}>Update profile</Button></CardContent></Card><Card className="border-destructive/20"><CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" />Danger zone</CardTitle><CardDescription>Permanently remove your account and local account data.</CardDescription></CardHeader><CardContent className="space-y-4">{!canDelete ? <p className="text-sm text-muted-foreground">This account cannot be deleted.</p> : <><Label htmlFor="deleteConfirm">Type DELETE to confirm</Label><Input id="deleteConfirm" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="DELETE" /><Button variant="destructive" disabled={confirmation !== "DELETE" || isDeleting} onClick={deleteAccount}>{isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}Delete account</Button></>}</CardContent></Card></div></main>
}
