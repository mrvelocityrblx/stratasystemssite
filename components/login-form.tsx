"use client"

import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react"

const errors: Record<string, string> = { "google-config": "Google sign-in is not configured yet.", banned: "This account has been terminated. Appeal it in our Discord.", "oauth-state": "Your sign-in session expired. Please try again.", "oauth-failed": "Google sign-in could not be completed. Please try again." }

export function LoginForm() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const error = errors[searchParams.get("error") || ""]
  return <Card className="border-border bg-card shadow-2xl shadow-black/20"><CardHeader className="space-y-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent"><ArrowRight className="h-6 w-6" /></div><CardTitle className="text-2xl text-card-foreground">Welcome back</CardTitle><CardDescription>Use your Google account to securely access Strata Systems.</CardDescription></CardHeader><CardContent className="space-y-5">{error && <div className="flex gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}<Button className="h-12 w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading} onClick={() => { setLoading(true); window.location.href = "/api/auth/google" }}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Connecting to Google...</> : "Continue with Google"}</Button><p className="text-center text-xs leading-relaxed text-muted-foreground">By continuing, you agree to use a verified Google identity for your Strata Systems account.</p></CardContent></Card>
}
