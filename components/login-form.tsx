"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const submit = async () => {
    setLoading(true)
    setError("")
    const response = await fetch("/api/auth/credentials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "login", email, password }) })
    const data = await response.json()
    if (!response.ok) { setError(data.error || "Unable to sign in."); setLoading(false); return }
    window.location.href = "/dashboard"
  }
  return <Card className="border-border bg-card shadow-2xl shadow-black/20"><CardHeader className="space-y-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent"><ArrowRight className="h-6 w-6" /></div><CardTitle className="text-2xl text-card-foreground">Welcome back</CardTitle><CardDescription>Sign in with your username and password.</CardDescription></CardHeader><CardContent className="space-y-4">{error && <div className="flex gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}<Input type="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} /><Input type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} /><Button className="h-12 w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading || !email || !password} onClick={submit}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : "Sign in"}</Button></CardContent></Card>
}
