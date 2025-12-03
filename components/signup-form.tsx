"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Loader2, Check, X, Mail } from "lucide-react"
import Link from "next/link"
import { auth, googleProvider, discordProvider } from "@/lib/firebase"
import { signInWithPopup, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { isUserBanned, saveUserCredential } from "@/lib/store"
import { saveGlobalCredential, saveGlobalUser } from "@/lib/firestore-store"
import { generateVerificationCode, verifyCode, clearVerificationCode } from "@/lib/email-service"
import { checkIfBanned, sendVerificationEmail as sendVerificationEmailAction } from "@/app/actions/auth-actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export function SignupForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [enteredCode, setEnteredCode] = useState("")
  const [verificationError, setVerificationError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  // Password validation
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Please enter your name")
      return
    }

    if (!email.trim()) {
      setError("Please enter your email")
      return
    }

    if (!isPasswordValid) {
      setError("Please meet all password requirements")
      return
    }

    if (!passwordsMatch) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      if (isUserBanned(email)) {
        setError("This account has been terminated. Appeal it in our Discord.")
        setIsLoading(false)
        return
      }

      const code = generateVerificationCode()
      setVerificationCode(code)
      setShowVerificationDialog(true)
      setIsLoading(false)

      sendVerificationEmailAction(email, code).then((result) => {
        if (result.success) {
          console.log("[v0] Verification email sent successfully")
        } else {
          console.error("[v0] Failed to send verification email:", result.error)
        }
      })
    } catch (err: any) {
      console.error("[v0] Signup error:", err)
      setError("Failed to create account. Please try again.")
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    setVerificationError("")
    setIsVerifying(true)

    if (!verifyCode(email, enteredCode)) {
      setVerificationError("Invalid or expired verification code")
      setIsVerifying(false)
      return
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, {
        displayName: name,
      })

      saveUserCredential(email, password)

      await saveGlobalCredential(email, password)
      await saveGlobalUser({
        uid: userCredential.user.uid,
        email: email,
        displayName: name,
        createdAt: new Date().toISOString(),
        plan: "free",
        banned: false,
        corporateRole: null,
      })

      clearVerificationCode(email)
      setShowVerificationDialog(false)
      setIsLoggingIn(true)

      setTimeout(() => {
        window.location.href = "/"
      }, 1500)
    } catch (err: any) {
      console.error("Account creation error:", err)
      if (err.code === "auth/email-already-in-use") {
        setVerificationError("An account with this email already exists")
      } else {
        setVerificationError("Failed to create account. Please try again.")
      }
      setIsVerifying(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError("")
    setIsLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)

      if (result.user?.email && isUserBanned(result.user.email)) {
        await auth.signOut()
        setError("This account has been terminated. Appeal it in our Discord.")
        setIsLoading(false)
        return
      }

      const globallyBanned = await checkIfBanned(result.user?.email || "")
      if (globallyBanned) {
        await auth.signOut()
        setError("This account has been terminated. Appeal it in our Discord.")
        setIsLoading(false)
        return
      }

      if (result.user) {
        await saveGlobalUser({
          uid: result.user.uid,
          email: result.user.email || "",
          displayName: result.user.displayName || "User",
          createdAt: new Date().toISOString(),
          plan: "free",
          banned: false,
          corporateRole: null,
        })
      }

      setIsLoggingIn(true)
      setTimeout(() => {
        window.location.href = "/"
      }, 1500)
    } catch (err: any) {
      console.error("Google signup error:", err)
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-up cancelled")
      } else if (err.code === "auth/unauthorized-domain") {
        setError(
          "This domain is not authorized. Add it to Firebase Console > Authentication > Settings > Authorized domains",
        )
      } else {
        setError(`Failed to sign up with Google: ${err.code || err.message}`)
      }
      setIsLoading(false)
    }
  }

  const handleDiscordSignUp = async () => {
    setError("")
    setIsLoading(true)
    try {
      const result = await signInWithPopup(auth, discordProvider)

      if (result.user?.email && isUserBanned(result.user.email)) {
        await auth.signOut()
        setError("This account has been terminated. Appeal it in our Discord.")
        setIsLoading(false)
        return
      }

      const globallyBanned = await checkIfBanned(result.user?.email || "")
      if (globallyBanned) {
        await auth.signOut()
        setError("This account has been terminated. Appeal it in our Discord.")
        setIsLoading(false)
        return
      }

      if (result.user) {
        await saveGlobalUser({
          uid: result.user.uid,
          email: result.user.email || "",
          displayName: result.user.displayName || "User",
          createdAt: new Date().toISOString(),
          plan: "free",
          banned: false,
          corporateRole: null,
        })
      }

      setIsLoggingIn(true)
      setTimeout(() => {
        window.location.href = "/"
      }, 1500)
    } catch (err: any) {
      console.error("Discord signup error:", err)
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-up cancelled")
      } else if (err.code === "auth/unauthorized-domain") {
        setError(
          "This domain is not authorized. Add it to Firebase Console > Authentication > Settings > Authorized domains",
        )
      } else {
        setError(`Failed to sign up with Discord: ${err.code || err.message}`)
      }
      setIsLoading(false)
    }
  }

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center gap-2 text-xs">
      {met ? <Check className="h-3 w-3 text-green-400" /> : <X className="h-3 w-3 text-muted-foreground" />}
      <span className={met ? "text-green-400" : "text-muted-foreground"}>{text}</span>
    </div>
  )

  if (isLoggingIn) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Logging you in</h2>
          <p className="text-muted-foreground text-center">This may take a few seconds...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-card-foreground">Create an account</CardTitle>
          <CardDescription>Enter your details to create your Strata Systems account</CardDescription>
        </CardHeader>
        <form onSubmit={handleCreateAccount}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">{error}</div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-card-foreground">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-card-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-card-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Password requirements */}
              {password.length > 0 && (
                <div className="grid grid-cols-2 gap-1 mt-2">
                  <PasswordRequirement met={hasMinLength} text="8+ characters" />
                  <PasswordRequirement met={hasUppercase} text="Uppercase letter" />
                  <PasswordRequirement met={hasLowercase} text="Lowercase letter" />
                  <PasswordRequirement met={hasNumber} text="Number" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-card-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <div className="flex items-center gap-2 text-xs mt-1">
                  {passwordsMatch ? (
                    <>
                      <Check className="h-3 w-3 text-green-400" />
                      <span className="text-green-400">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3 text-red-400" />
                      <span className="text-red-400">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-6">
            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={isLoading || !isPasswordValid || !passwordsMatch}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or sign up with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <Button
                variant="outline"
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>

              <Button
                variant="outline"
                type="button"
                onClick={handleDiscordSignUp}
                disabled={isLoading}
                className="border-border bg-[#5865F2] text-white hover:bg-[#4752C4]"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .078.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Discord
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-2">
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4 mx-auto">
              <Mail className="h-6 w-6 text-accent" />
            </div>
            <DialogTitle className="text-center">Verify Your Email</DialogTitle>
            <DialogDescription className="text-center">
              We've sent a verification code to <strong>{email}</strong>
              <br />
              <span className="text-xs text-muted-foreground mt-2 block">From: stratasystemscorp@gmail.com</span>
              <br />
              <span className="text-xs text-muted-foreground">Please check your inbox and spam folder.</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {verificationError && (
              <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
                {verificationError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="verification-code">Enter Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="Enter 6-digit code"
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-2xl tracking-wider"
                maxLength={6}
                disabled={isVerifying}
              />
              <p className="text-xs text-muted-foreground text-center">
                Didn't receive the code? Check your spam folder or try signing up again.
              </p>
            </div>
          </div>

          <DialogFooter className="sm:justify-center">
            <Button onClick={handleVerifyCode} disabled={enteredCode.length !== 6 || isVerifying} className="w-full">
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Create Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
