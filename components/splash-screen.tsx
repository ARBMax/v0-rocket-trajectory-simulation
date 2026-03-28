"use client"

import { useEffect, useState, useMemo } from "react"
import { Rocket } from "lucide-react"

// Seeded random for consistent star positions
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"logo" | "text" | "fadeout">("logo")

  // Generate star positions deterministically to avoid hydration mismatch
  const stars = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      left: seededRandom(i * 3 + 1) * 100,
      top: seededRandom(i * 3 + 2) * 100,
      delay: seededRandom(i * 3 + 3) * 2,
      duration: 1 + seededRandom(i * 3 + 4) * 2,
    }))
  }, [])

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase("text"), 600)
    const timer2 = setTimeout(() => setPhase("fadeout"), 1800)
    const timer3 = setTimeout(() => onComplete(), 2400)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500 ${
        phase === "fadeout" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Animated stars in background */}
      <div className="absolute inset-0 overflow-hidden">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-foreground/30 rounded-full animate-pulse"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center gap-6">
        {/* Logo */}
        <div
          className={`relative transition-all duration-700 ease-out ${
            phase === "logo" ? "scale-0 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-primary/30 blur-xl animate-pulse" />
            </div>
            
            {/* Main logo container */}
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
              <Rocket className="h-8 w-8 text-primary-foreground transform -rotate-45" />
            </div>

            {/* Rocket trail effect */}
            <div
              className={`absolute -bottom-4 left-1/2 -translate-x-1/2 transition-all duration-700 delay-200 ${
                phase !== "logo" ? "opacity-100 h-8" : "opacity-0 h-0"
              }`}
            >
              <div className="w-4 h-full bg-gradient-to-t from-transparent via-primary/50 to-primary rounded-full blur-sm" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div
          className={`flex flex-col items-center gap-2 transition-all duration-500 delay-200 ${
            phase === "logo" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}
        >
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Ozone Labs
          </h1>
          <p className="text-sm text-muted-foreground tracking-wider uppercase">
            Rocket Trajectory Simulator
          </p>
        </div>

        {/* Loading indicator */}
        <div
          className={`flex gap-1.5 transition-all duration-500 delay-300 ${
            phase === "logo" ? "opacity-0" : "opacity-100"
          }`}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
