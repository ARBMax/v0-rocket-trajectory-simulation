"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Rocket } from "lucide-react"

interface LoginPageProps {
  onLogin: (email: string) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    // Simple validation
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password")
      setLoading(false)
      return
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    // Simulate login delay
    setTimeout(() => {
      // For demo purposes, accept any valid email and password >= 6 chars
      // In production, this would verify against a backend
      if (emailRegex.test(email) && password.length >= 6) {
        onLogin(email)
      } else {
        setError("Invalid email format or password too short")
      }
      setLoading(false)
    }, 500)
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
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
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
              {loading ? "Logging in..." : "Launch Mission"}
            </Button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 rounded bg-background/50 border border-border/30">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Demo Credentials
            </p>
            <div className="space-y-1 text-[10px] font-mono text-foreground/70">
              <p>Email: <span className="text-primary">demo@example.com</span></p>
              <p>Password: <span className="text-primary">demo123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
