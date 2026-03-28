"use client"

import { SimulationState, SimulationResult } from "@/lib/rocket-physics"
import { useMemo } from "react"

interface RocketVisualProps {
  currentState: SimulationState | null
  result: SimulationResult | null
}

// Pre-computed star data to avoid hydration mismatch
const STARS = [
  { left: 5, top: 3, size: 1.5, opacity: 0.7 }, { left: 12, top: 8, size: 1, opacity: 0.5 },
  { left: 18, top: 15, size: 2, opacity: 0.8 }, { left: 25, top: 5, size: 1, opacity: 0.4 },
  { left: 32, top: 22, size: 1.5, opacity: 0.6 }, { left: 40, top: 12, size: 1, opacity: 0.5 },
  { left: 48, top: 28, size: 2, opacity: 0.7 }, { left: 55, top: 8, size: 1, opacity: 0.4 },
  { left: 62, top: 35, size: 1.5, opacity: 0.6 }, { left: 70, top: 18, size: 1, opacity: 0.5 },
  { left: 78, top: 42, size: 2, opacity: 0.8 }, { left: 85, top: 10, size: 1, opacity: 0.4 },
  { left: 92, top: 25, size: 1.5, opacity: 0.6 }, { left: 8, top: 45, size: 1, opacity: 0.5 },
  { left: 15, top: 52, size: 2, opacity: 0.7 }, { left: 22, top: 38, size: 1, opacity: 0.4 },
  { left: 30, top: 58, size: 1.5, opacity: 0.6 }, { left: 38, top: 48, size: 1, opacity: 0.5 },
  { left: 45, top: 62, size: 2, opacity: 0.8 }, { left: 52, top: 42, size: 1, opacity: 0.4 },
  { left: 60, top: 55, size: 1.5, opacity: 0.6 }, { left: 68, top: 65, size: 1, opacity: 0.5 },
  { left: 75, top: 50, size: 2, opacity: 0.7 }, { left: 82, top: 58, size: 1, opacity: 0.4 },
  { left: 90, top: 45, size: 1.5, opacity: 0.6 }, { left: 3, top: 62, size: 1, opacity: 0.5 },
  { left: 10, top: 68, size: 2, opacity: 0.8 }, { left: 17, top: 55, size: 1, opacity: 0.4 },
  { left: 95, top: 15, size: 1.5, opacity: 0.7 }, { left: 88, top: 32, size: 1, opacity: 0.5 },
  { left: 2, top: 20, size: 1.5, opacity: 0.6 }, { left: 97, top: 55, size: 1, opacity: 0.4 },
  { left: 35, top: 10, size: 2, opacity: 0.7 }, { left: 65, top: 5, size: 1.5, opacity: 0.5 },
  { left: 50, top: 20, size: 1, opacity: 0.6 }, { left: 28, top: 68, size: 1.5, opacity: 0.4 },
]

export function RocketVisual({ currentState, result }: RocketVisualProps) {
  const maxHeight = result?.maxHeight ?? 1000

  const rocketPosition = useMemo(() => {
    if (!currentState || maxHeight === 0) return 0
    return Math.min(100, (currentState.height / maxHeight) * 100)
  }, [currentState, maxHeight])

  const flameIntensity = currentState?.thrust ? 1 : 0

  const formatHeight = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}km`
    }
    return `${value.toFixed(0)}m`
  }

  const isDescending = currentState && currentState.velocity < 0

  return (
    <div className="relative h-full w-full min-h-[400px] rounded-lg overflow-hidden border border-border">
      {/* Sky gradient background */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `linear-gradient(to bottom, 
            hsl(240, 30%, ${4 + rocketPosition * 0.02}%) 0%,
            hsl(240, 25%, ${8 + rocketPosition * 0.03}%) 30%,
            hsl(220, 30%, ${12 + rocketPosition * 0.05}%) 60%,
            hsl(200, 40%, ${15 + rocketPosition * 0.08}%) 100%
          )`
        }}
      />

      {/* Stars */}
      <div className="absolute inset-0">
        {STARS.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: `rgba(255, 255, 255, ${star.opacity})`,
              boxShadow: star.size > 1.5 ? `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.5)` : 'none',
              animation: `twinkle ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${(i % 5) * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Atmospheric glow */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(255, 140, 50, 0.1) 0%, transparent 100%)'
        }}
      />

      {/* Ground with terrain */}
      <div className="absolute bottom-0 left-0 right-0 h-16">
        {/* Ground gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, hsl(30, 20%, 12%) 0%, hsl(30, 15%, 18%) 60%, transparent 100%)'
          }}
        />
        {/* Launch pad */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-3 bg-gradient-to-t from-zinc-700 to-zinc-500 rounded-t-sm" />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-16 h-1 bg-zinc-600" />
        {/* Support tower */}
        <div className="absolute bottom-3 left-[calc(50%-35px)] w-1 h-12 bg-gradient-to-r from-zinc-600 to-zinc-500" />
        <div className="absolute bottom-3 left-[calc(50%+34px)] w-1 h-12 bg-gradient-to-r from-zinc-500 to-zinc-600" />
      </div>

      {/* Altitude scale */}
      <div className="absolute right-3 top-4 bottom-20 flex flex-col justify-between pointer-events-none">
        {[100, 75, 50, 25, 0].map((percent) => (
          <div key={percent} className="flex items-center gap-2">
            <div className="h-px w-6 bg-white/20" />
            <span className="text-[10px] text-white/50 font-mono">
              {formatHeight((percent / 100) * maxHeight)}
            </span>
          </div>
        ))}
      </div>

      {/* Rocket */}
      <div
        className="absolute left-1/2 transform -translate-x-1/2 transition-all duration-75 ease-linear z-10"
        style={{
          bottom: `${Math.max(64, 64 + (rocketPosition / 100) * (400 - 120))}px`,
        }}
      >
        <svg
          width="48"
          height="100"
          viewBox="0 0 48 100"
          className="drop-shadow-2xl"
          style={{
            transform: isDescending ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.5s ease",
            filter: 'drop-shadow(0 0 20px rgba(255, 100, 50, 0.3))',
          }}
        >
          <defs>
            {/* Main body gradient - metallic look */}
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1a1a2e" />
              <stop offset="15%" stopColor="#3d3d5c" />
              <stop offset="35%" stopColor="#e8e8e8" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="65%" stopColor="#e8e8e8" />
              <stop offset="85%" stopColor="#3d3d5c" />
              <stop offset="100%" stopColor="#1a1a2e" />
            </linearGradient>

            {/* Nose cone gradient */}
            <linearGradient id="noseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b1a1a" />
              <stop offset="30%" stopColor="#d63031" />
              <stop offset="50%" stopColor="#ff4757" />
              <stop offset="70%" stopColor="#d63031" />
              <stop offset="100%" stopColor="#8b1a1a" />
            </linearGradient>

            {/* Fin gradient */}
            <linearGradient id="finGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2d2d44" />
              <stop offset="50%" stopColor="#4a4a6a" />
              <stop offset="100%" stopColor="#1a1a2e" />
            </linearGradient>

            {/* Window reflection */}
            <radialGradient id="windowGradient" cx="30%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#87ceeb" />
              <stop offset="40%" stopColor="#4a90a4" />
              <stop offset="100%" stopColor="#1e3a4c" />
            </radialGradient>

            {/* Flame gradients */}
            <radialGradient id="outerFlame" cx="50%" cy="0%" r="100%">
              <stop offset="0%" stopColor="#ff6b35" />
              <stop offset="40%" stopColor="#ff4500" />
              <stop offset="70%" stopColor="#cc0000" />
              <stop offset="100%" stopColor="#660000" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="midFlame" cx="50%" cy="0%" r="80%">
              <stop offset="0%" stopColor="#ffa500" />
              <stop offset="50%" stopColor="#ff6600" />
              <stop offset="100%" stopColor="#ff3300" stopOpacity="0.5" />
            </radialGradient>

            <radialGradient id="innerFlame" cx="50%" cy="20%" r="60%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#ffffcc" />
              <stop offset="60%" stopColor="#ffcc00" />
              <stop offset="100%" stopColor="#ff9900" />
            </radialGradient>

            {/* Engine glow */}
            <radialGradient id="engineGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ff6b35" stopOpacity="0" />
            </radialGradient>

            {/* Body stripe */}
            <linearGradient id="stripeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1a1a2e" />
              <stop offset="50%" stopColor="#2d2d44" />
              <stop offset="100%" stopColor="#1a1a2e" />
            </linearGradient>
          </defs>

          {/* Flame effect (when thrusting) */}
          {flameIntensity > 0 && (
            <g className="animate-flicker">
              {/* Outer flame */}
              <ellipse cx="24" cy="88" rx="10" ry="18" fill="url(#outerFlame)" opacity="0.8">
                <animate attributeName="ry" values="18;22;16;20;18" dur="0.15s" repeatCount="indefinite" />
                <animate attributeName="rx" values="10;12;9;11;10" dur="0.12s" repeatCount="indefinite" />
              </ellipse>
              
              {/* Mid flame */}
              <ellipse cx="24" cy="85" rx="7" ry="14" fill="url(#midFlame)" opacity="0.9">
                <animate attributeName="ry" values="14;16;12;15;14" dur="0.1s" repeatCount="indefinite" />
              </ellipse>
              
              {/* Inner flame core */}
              <ellipse cx="24" cy="82" rx="4" ry="10" fill="url(#innerFlame)">
                <animate attributeName="ry" values="10;12;9;11;10" dur="0.08s" repeatCount="indefinite" />
              </ellipse>

              {/* Bright core */}
              <ellipse cx="24" cy="78" rx="2" ry="5" fill="#ffffff" opacity="0.95">
                <animate attributeName="ry" values="5;6;4;5" dur="0.06s" repeatCount="indefinite" />
              </ellipse>

              {/* Engine glow */}
              <circle cx="24" cy="72" r="8" fill="url(#engineGlow)" />
            </g>
          )}

          {/* Left fin */}
          <path 
            d="M14 60 L4 78 L8 78 L14 68 Z" 
            fill="url(#finGradient)"
            stroke="#1a1a2e"
            strokeWidth="0.5"
          />
          {/* Fin highlight */}
          <path d="M13 62 L7 75 L8 75 L14 64 Z" fill="rgba(255,255,255,0.1)" />

          {/* Right fin */}
          <path 
            d="M34 60 L44 78 L40 78 L34 68 Z" 
            fill="url(#finGradient)"
            stroke="#1a1a2e"
            strokeWidth="0.5"
          />
          {/* Fin highlight */}
          <path d="M35 62 L41 75 L40 75 L34 64 Z" fill="rgba(255,255,255,0.1)" />

          {/* Center fin (back) */}
          <path 
            d="M22 65 L24 80 L26 65 Z" 
            fill="#2d2d44"
            stroke="#1a1a2e"
            strokeWidth="0.5"
          />

          {/* Engine nozzle */}
          <path 
            d="M18 68 L16 75 L32 75 L30 68 Z" 
            fill="#2d2d44"
            stroke="#1a1a2e"
            strokeWidth="0.5"
          />
          <ellipse cx="24" cy="75" rx="8" ry="2" fill="#1a1a2e" />

          {/* Main body */}
          <rect x="14" y="18" width="20" height="50" rx="1" fill="url(#bodyGradient)" />
          
          {/* Body panel lines */}
          <line x1="14" y1="35" x2="34" y2="35" stroke="#3d3d5c" strokeWidth="0.5" />
          <line x1="14" y1="52" x2="34" y2="52" stroke="#3d3d5c" strokeWidth="0.5" />

          {/* Stripe band */}
          <rect x="14" y="40" width="20" height="6" fill="url(#stripeGradient)" />
          <rect x="14" y="41" width="20" height="1" fill="rgba(255,255,255,0.2)" />

          {/* Window outer ring */}
          <circle cx="24" cy="28" r="6" fill="#1a1a2e" />
          {/* Window */}
          <circle cx="24" cy="28" r="5" fill="url(#windowGradient)" />
          {/* Window reflection */}
          <ellipse cx="22" cy="26" rx="2" ry="1.5" fill="rgba(255,255,255,0.4)" />

          {/* Nose cone */}
          <path 
            d="M24 2 C24 2 14 15 14 18 L34 18 C34 15 24 2 24 2 Z" 
            fill="url(#noseGradient)"
          />
          {/* Nose highlight */}
          <path 
            d="M24 4 C24 4 18 13 17 17 L20 17 C21 14 24 6 24 4 Z" 
            fill="rgba(255,255,255,0.25)"
          />
          
          {/* Nose tip */}
          <ellipse cx="24" cy="4" rx="1.5" ry="1" fill="#ff6b6b" />

          {/* Body highlight (left edge) */}
          <rect x="15" y="18" width="2" height="50" fill="rgba(255,255,255,0.15)" />
        </svg>

        {/* Exhaust smoke during powered flight */}
        {flameIntensity > 0 && (
          <div className="absolute top-[85px] left-1/2 -translate-x-1/2 pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full opacity-30"
                style={{
                  width: `${12 + i * 6}px`,
                  height: `${12 + i * 6}px`,
                  background: `radial-gradient(circle, rgba(180, 180, 180, ${0.4 - i * 0.04}) 0%, transparent 70%)`,
                  top: `${i * 20}px`,
                  left: `${-6 - i * 3}px`,
                  animation: `smoke ${0.8 + i * 0.1}s ease-out infinite`,
                  animationDelay: `${i * 80}ms`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* HUD Overlay */}
      <div className="absolute top-3 left-3 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 p-3">
        <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1">Altitude</div>
        <div className="text-2xl font-bold text-white font-mono">
          {currentState ? formatHeight(currentState.height) : "0m"}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="text-[10px] uppercase tracking-wider text-white/50">Velocity</div>
          <div className="text-sm font-mono text-white/80">
            {currentState ? `${currentState.velocity.toFixed(1)} m/s` : "0 m/s"}
          </div>
        </div>
      </div>

      {/* Phase indicator */}
      {currentState && (
        <div 
          className="absolute bottom-20 left-3 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm border"
          style={{
            backgroundColor:
              currentState.phase === "powered"
                ? "rgba(255, 107, 53, 0.2)"
                : currentState.phase === "coasting"
                ? "rgba(74, 144, 226, 0.2)"
                : currentState.phase === "descending"
                ? "rgba(255, 71, 87, 0.2)"
                : "rgba(128, 128, 128, 0.2)",
            borderColor:
              currentState.phase === "powered"
                ? "rgba(255, 107, 53, 0.5)"
                : currentState.phase === "coasting"
                ? "rgba(74, 144, 226, 0.5)"
                : currentState.phase === "descending"
                ? "rgba(255, 71, 87, 0.5)"
                : "rgba(128, 128, 128, 0.5)",
            color:
              currentState.phase === "powered"
                ? "#ff6b35"
                : currentState.phase === "coasting"
                ? "#4a90e2"
                : currentState.phase === "descending"
                ? "#ff4757"
                : "#808080",
          }}
        >
          {currentState.phase}
        </div>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes smoke {
          0% { opacity: 0.4; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(40px) scale(2); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
      `}</style>
    </div>
  )
}
