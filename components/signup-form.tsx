"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles } from "lucide-react"

export function SignupForm() {
  const [loading, setLoading] = useState(false)
  return <Card className="border-border bg-card shadow-2xl shadow-black/20"><CardHeader className="space-y-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent"><Sparkles className="h-6 w-6" /></div><CardTitle className="text-2xl text-card-foreground">Create your account</CardTitle><CardDescription>Start with Google. No password to remember, and your account stays protected by Google.</CardDescription></CardHeader><CardContent className="space-y-5"><Button className="h-12 w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading} onClick={() => { setLoading(true); window.location.href = "/api/auth/google" }}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Connecting to Google...</> : "Sign up with Google"}</Button><p className="text-center text-xs leading-relaxed text-muted-foreground">Your Google profile name and verified email will be used to create your account.</p></CardContent></Card>
}
