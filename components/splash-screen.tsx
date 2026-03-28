"use client"

import { useEffect, useState } from "react"
import { Orbit } from "lucide-react"

const LOADING_MESSAGES = [
  { text: "OZONE LABS V1.0 — Initializing...", delay: 400 },
  { text: "Loading trajectory engine...", delay: 800 },
  { text: "Calibrating sensors...", delay: 1200 },
  { text: "Flight dynamics module ready", delay: 1600 },
  { text: "Telemetry subsystem online", delay: 2000 },
  { text: "All systems nominal", delay: 2400, success: true },
]

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"init" | "loading" | "fadeout">("init")
  const [visibleMessages, setVisibleMessages] = useState<number>(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Start loading phase
    const initTimer = setTimeout(() => setPhase("loading"), 300)
    
    // Show messages sequentially
    LOADING_MESSAGES.forEach((msg, index) => {
      setTimeout(() => {
        setVisibleMessages(index + 1)
        setProgress(((index + 1) / LOADING_MESSAGES.length) * 100)
      }, msg.delay)
    })
    
    // Fade out and complete
    const fadeTimer = setTimeout(() => setPhase("fadeout"), 3000)
    const completeTimer = setTimeout(() => onComplete(), 3600)

    return () => {
      clearTimeout(initTimer)
      clearTimeout(fadeTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500 ${
        phase === "fadeout" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Orbital Logo */}
        <div
          className={`relative transition-all duration-700 ease-out ${
            phase === "init" ? "scale-50 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          {/* Outer rotating ring */}
          <div className="relative h-28 w-28">
            {/* Glow effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-accent/20 blur-2xl" />
            </div>
            
            {/* Rotating ring */}
            <svg
              className="absolute inset-0 h-full w-full animate-spin"
              style={{ animationDuration: "8s" }}
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-accent/40"
                strokeDasharray="8 4"
              />
            </svg>
            
            {/* Orbiting dots */}
            <div
              className="absolute inset-0 animate-spin"
              style={{ animationDuration: "4s" }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-accent shadow-lg shadow-accent/50" />
            </div>
            <div
              className="absolute inset-0 animate-spin"
              style={{ animationDuration: "4s", animationDelay: "-1s" }}
            >
              <div className="absolute top-1/2 right-0 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-accent/70" />
            </div>
            <div
              className="absolute inset-0 animate-spin"
              style={{ animationDuration: "4s", animationDelay: "-2.5s" }}
            >
              <div className="absolute bottom-2 left-4 h-1.5 w-1.5 rounded-full bg-accent/70" />
            </div>
            
            {/* Center icon container */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-card border border-accent/30">
                <Orbit className="h-7 w-7 text-accent" />
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div
          className={`flex flex-col items-center gap-2 transition-all duration-500 delay-100 ${
            phase === "init" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}
        >
          <h1 className="text-3xl font-bold tracking-[0.3em] text-accent uppercase">
            Ozone Labs
          </h1>
          <p className="text-xs text-muted-foreground tracking-[0.25em] uppercase">
            Trajectory Simulation & Flight Dynamics
          </p>
        </div>

        {/* Terminal Console */}
        <div
          className={`w-80 sm:w-96 transition-all duration-500 delay-200 ${
            phase === "init" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}
        >
          <div className="rounded-lg bg-card/80 border border-border p-4 font-mono text-xs">
            <div className="space-y-1 min-h-[120px]">
              {LOADING_MESSAGES.slice(0, visibleMessages).map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 ${
                    msg.success ? "text-green-400" : "text-muted-foreground"
                  }`}
                >
                  <span className="text-accent">{"> "}</span>
                  <span>
                    {msg.text}
                    {msg.success && " ✓"}
                  </span>
                </div>
              ))}
              {visibleMessages < LOADING_MESSAGES.length && (
                <div className="flex items-center gap-2 text-accent">
                  <span>{"> "}</span>
                  <span className="inline-block w-2 h-4 bg-accent animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          className={`w-80 sm:w-96 transition-all duration-500 delay-300 ${
            phase === "init" ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="h-1 w-full rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
