"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Rocket } from "lucide-react"

interface LoginPageProps {
  onLogin: (email: string) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Login form submitted")
    setError("")
    setLoading(true)

    // Simple validation
    if (!email.trim() || !password.trim()) {
      console.log("[v0] Empty email or password")
      setError("Please enter both email and password")
      setLoading(false)
      return
    }

    if (!emailRegex.test(email)) {
      console.log("[v0] Invalid email format:", email)
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    // Simulate login delay
    setTimeout(() => {
      console.log("[v0] Validating credentials - email:", email, "password length:", password.length)
      // For demo purposes, accept any valid email and password >= 3 chars (demo password is 8)
      // In production, this would verify against a backend
      if (emailRegex.test(email) && password.length >= 3) {
        console.log("[v0] Credentials valid, calling onLogin")
        onLogin(email)
      } else {
        console.log("[v0] Invalid credentials - email valid:", emailRegex.test(email), "password length ok:", password.length >= 3)
        setError("Invalid email format or password too short (min 3 chars)")
      }
      setLoading(false)
    }, 500)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validation
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields")
      setLoading(false)
      return
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    if (password.length < 3) {
      console.log("[v0] Password too short:", password.length)
      setError("Password must be at least 3 characters")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    // Simulate signup delay
    setTimeout(() => {
      // For demo purposes, accept valid credentials
      // In production, this would create an account in the backend
      if (emailRegex.test(email) && password.length >= 3 && password === confirmPassword) {
        console.log("[v0] Signup successful, calling onLogin")
        onLogin(email)
      } else {
        console.log("[v0] Signup failed")
        setError("Failed to create account")
      }
      setLoading(false)
    }, 500)
  }

  const handleModeSwitch = () => {
    setIsSignup(!isSignup)
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setError("")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background starfield effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Login form */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Rocket className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary font-mono">OZONE LABS</h1>
            </div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground text-center">
              Rocket Simulation Engine
            </p>
            <p className="text-xs font-mono uppercase tracking-widest text-primary/70 text-center mt-2">
              {isSignup ? "Create Account" : "Launch Mission"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError("")
                }}
                disabled={loading}
                className="font-mono text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                disabled={loading}
                className="font-mono text-sm"
              />
            </div>

            {/* Confirm Password - Only for signup */}
            {isSignup && (
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setError("")
                  }}
                  disabled={loading}
                  className="font-mono text-sm"
                />
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="p-3 rounded bg-destructive/10 border border-destructive/30 text-destructive text-xs font-mono">
                {error}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full font-mono uppercase tracking-wider"
            >
              {loading ? (isSignup ? "Creating Account..." : "Logging in...") : (isSignup ? "Create Account" : "Launch Mission")}
            </Button>
          </form>

          {/* Toggle to signup/login */}
          <div className="mt-6 text-center">
            <p className="text-xs font-mono text-muted-foreground">
              {isSignup ? "Already have an account?" : "Don&apos;t have an account?"}
              <button
                onClick={handleModeSwitch}
                disabled={loading}
                className="ml-2 text-primary hover:text-primary/80 transition-colors uppercase tracking-wider font-semibold"
              >
                {isSignup ? "Sign In" : "Create Account"}
              </button>
            </p>
          </div>

          {/* Demo credentials hint - Only show in login mode */}
          {!isSignup && (
            <div className="mt-6 p-4 rounded bg-background/50 border border-border/30">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Demo Credentials
              </p>
              <div className="space-y-1 text-[10px] font-mono text-foreground/70">
                <p>Email: <span className="text-primary">demo@example.com</span></p>
                <p>Password: <span className="text-primary">demo123</span></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
