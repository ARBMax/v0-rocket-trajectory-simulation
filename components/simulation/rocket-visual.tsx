"use client"

import { SimulationState, SimulationResult } from "@/lib/rocket-physics"
import { useMemo } from "react"

interface RocketVisualProps {
  currentState: SimulationState | null
  result: SimulationResult | null
}

export function RocketVisual({ currentState, result }: RocketVisualProps) {
  const maxHeight = result?.maxHeight ?? 1000

  // Calculate rocket position (0-100% of visual height)
  const rocketPosition = useMemo(() => {
    if (!currentState || maxHeight === 0) return 0
    return Math.min(100, (currentState.height / maxHeight) * 100)
  }, [currentState, maxHeight])

  // Calculate flame intensity based on thrust
  const flameIntensity = currentState?.thrust ? 1 : 0

  // Generate trajectory path points
  const trajectoryPoints = useMemo(() => {
    if (!result) return []
    const points: { x: number; y: number }[] = []
    const sampledStates = result.states.filter((_, i) => i % 20 === 0)

    sampledStates.forEach((state, i) => {
      const y = (state.height / maxHeight) * 100
      // Add slight horizontal drift based on velocity for visual interest
      const x = 50 + Math.sin(state.time * 0.1) * 2
      points.push({ x, y: 100 - y })
    })

    return points
  }, [result, maxHeight])

  const formatHeight = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}km`
    }
    return `${value.toFixed(0)}m`
  }

  return (
    <div className="relative h-full w-full min-h-[400px] rounded-lg bg-gradient-to-b from-background via-muted/20 to-muted/50 overflow-hidden border border-border">
      {/* Stars background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute h-0.5 w-0.5 rounded-full bg-foreground/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-muted border-t border-border">
        <div className="absolute inset-0 bg-gradient-to-t from-muted to-transparent" />
        <div className="absolute bottom-2 left-4 text-xs text-muted-foreground">Ground</div>
      </div>

      {/* Altitude markers */}
      <div className="absolute right-4 top-4 bottom-12 flex flex-col justify-between">
        {[100, 75, 50, 25, 0].map((percent) => (
          <div key={percent} className="flex items-center gap-2">
            <div className="h-px w-4 bg-border" />
            <span className="text-xs text-muted-foreground">
              {formatHeight((percent / 100) * maxHeight)}
            </span>
          </div>
        ))}
      </div>

      {/* Trajectory path */}
      {trajectoryPoints.length > 1 && (
        <svg className="absolute inset-0 h-full w-full pointer-events-none">
          <path
            d={`M ${trajectoryPoints.map((p) => `${p.x},${p.y}%`).join(" L ")}`}
            fill="none"
            stroke="var(--chart-2)"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.5"
          />
        </svg>
      )}

      {/* Rocket */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 transition-all duration-75 ease-linear"
        style={{
          bottom: `${Math.max(32, 32 + (rocketPosition / 100) * (400 - 80))}px`,
        }}
      >
        {/* Rocket SVG */}
        <svg
          width="40"
          height="60"
          viewBox="0 0 40 60"
          className="drop-shadow-lg"
          style={{
            transform: currentState && currentState.velocity < 0 ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        >
          {/* Rocket body */}
          <defs>
            <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--muted)" />
              <stop offset="50%" stopColor="var(--foreground)" />
              <stop offset="100%" stopColor="var(--muted)" />
            </linearGradient>
            <radialGradient id="flameGradient" cx="50%" cy="0%" r="100%">
              <stop offset="0%" stopColor="#FFA500" />
              <stop offset="50%" stopColor="#FF4500" />
              <stop offset="100%" stopColor="#FF0000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Nose cone */}
          <path d="M20 0 L28 15 L12 15 Z" fill="var(--chart-3)" />

          {/* Body */}
          <rect x="12" y="15" width="16" height="30" fill="url(#rocketBody)" />

          {/* Window */}
          <circle cx="20" cy="25" r="4" fill="var(--chart-2)" opacity="0.8" />

          {/* Fins */}
          <path d="M12 35 L6 50 L12 45 Z" fill="var(--chart-3)" />
          <path d="M28 35 L34 50 L28 45 Z" fill="var(--chart-3)" />

          {/* Flame */}
          {flameIntensity > 0 && (
            <g className="animate-pulse">
              <ellipse cx="20" cy="55" rx="6" ry="8" fill="url(#flameGradient)" opacity="0.9" />
              <ellipse cx="20" cy="53" rx="4" ry="6" fill="#FFFF00" opacity="0.8" />
              <ellipse cx="20" cy="52" rx="2" ry="4" fill="#FFFFFF" opacity="0.9" />
            </g>
          )}
        </svg>

        {/* Smoke trail during powered flight */}
        {flameIntensity > 0 && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-muted-foreground/20 animate-ping"
                style={{
                  width: `${8 + i * 4}px`,
                  height: `${8 + i * 4}px`,
                  top: `${i * 15}px`,
                  left: `${-4 - i * 2}px`,
                  animationDelay: `${i * 100}ms`,
                  opacity: 0.3 - i * 0.05,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Current altitude overlay */}
      <div className="absolute top-4 left-4 rounded-lg bg-card/80 backdrop-blur-sm border border-border p-3">
        <div className="text-xs text-muted-foreground">Current Altitude</div>
        <div className="text-xl font-bold text-foreground">
          {currentState ? formatHeight(currentState.height) : "0m"}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {currentState ? `${currentState.velocity.toFixed(1)} m/s` : "0 m/s"}
        </div>
      </div>

      {/* Phase indicator */}
      {currentState && (
        <div className="absolute bottom-12 left-4 rounded-full px-3 py-1 text-xs font-medium capitalize"
          style={{
            backgroundColor:
              currentState.phase === "powered"
                ? "var(--chart-1)"
                : currentState.phase === "coasting"
                ? "var(--chart-2)"
                : currentState.phase === "descending"
                ? "var(--chart-3)"
                : "var(--muted)",
            color: "var(--background)",
          }}
        >
          {currentState.phase}
        </div>
      )}
    </div>
  )
}
