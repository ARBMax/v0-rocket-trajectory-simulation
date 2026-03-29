"use client"

import { useState, useEffect, useRef } from "react"
import { Zap, Globe, Flame, Star, Gauge, ArrowRight, ArrowLeft } from "lucide-react"

const FACTS = [
  {
    icon: Zap,
    category: "Speed Record",
    headline: "Fastest object ever launched",
    body: "NASA's Parker Solar Probe hit 692,000 km/h in 2023 — fast enough to fly from New York to Tokyo in under 40 seconds.",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
  },
  {
    icon: Flame,
    category: "Rocket Science",
    headline: "Saturn V burned 20 tonnes per second",
    body: "The Saturn V first stage consumed over 2,000 kg of propellant every second at liftoff, producing 34 million newtons of thrust.",
    color: "text-orange-400",
    bg: "bg-orange-400/10 border-orange-400/20",
  },
  {
    icon: Globe,
    category: "Orbital Physics",
    headline: "Escape velocity is 11.2 km/s",
    body: "To break free from Earth's gravity entirely, a rocket must reach 40,320 km/h — roughly 33 times the speed of sound.",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
  },
  {
    icon: Star,
    category: "Fun Fact",
    headline: "Space starts at just 100 km up",
    body: "The Karman Line — the internationally recognized boundary of space — is closer than the distance most people drive to work each week.",
    color: "text-chart-4",
    bg: "bg-chart-4/10 border-chart-4/20",
  },
  {
    icon: Gauge,
    category: "G-Force",
    headline: "Astronauts endure up to 3G at launch",
    body: "During max-Q (maximum dynamic pressure), astronauts feel three times their body weight. Fighter pilots in tight turns experience up to 9G.",
    color: "text-chart-5",
    bg: "bg-chart-5/10 border-chart-5/20",
  },
  {
    icon: Flame,
    category: "Reentry Heat",
    headline: "Reentry reaches 1,650°C",
    body: "Space capsules slam back into atmosphere at Mach 25+. The heat shield ablates — intentionally burning away — to protect the crew inside.",
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/20",
  },
  {
    icon: Zap,
    category: "Tsiolkovsky",
    headline: "The rocket equation changes everything",
    body: "Tsiolkovsky's 1903 equation showed that for every unit of payload you want to orbit, you need ~15 units of fuel sitting on the launch pad.",
    color: "text-chart-2",
    bg: "bg-chart-2/10 border-chart-2/20",
  },
]

type TransitionState = "idle" | "exit-left" | "exit-right" | "enter-left" | "enter-right"

export function FunFactsBanner() {
  const [index, setIndex] = useState(0)
  const [transition, setTransition] = useState<TransitionState>("idle")
  const [displayIndex, setDisplayIndex] = useState(0)
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startAuto = () => {
    if (autoRef.current) clearInterval(autoRef.current)
    autoRef.current = setInterval(() => goTo("next"), 5000)
  }

  useEffect(() => {
    startAuto()
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goTo = (direction: "next" | "prev") => {
    if (transition !== "idle") return
    const exitState: TransitionState = direction === "next" ? "exit-left" : "exit-right"
    const enterState: TransitionState = direction === "next" ? "enter-right" : "enter-left"
    const nextIdx = direction === "next"
      ? (index + 1) % FACTS.length
      : (index - 1 + FACTS.length) % FACTS.length

    setTransition(exitState)
    setTimeout(() => {
      setDisplayIndex(nextIdx)
      setIndex(nextIdx)
      setTransition(enterState)
      setTimeout(() => setTransition("idle"), 350)
    }, 300)

    startAuto()
  }

  const transitionClasses: Record<TransitionState, string> = {
    idle: "translate-x-0 opacity-100",
    "exit-left": "-translate-x-8 opacity-0",
    "exit-right": "translate-x-8 opacity-0",
    "enter-left": "-translate-x-8 opacity-0",
    "enter-right": "translate-x-8 opacity-0",
  }

  const fact = FACTS[displayIndex]
  const Icon = fact.icon

  return (
    <div className={`rounded border ${fact.bg} backdrop-blur-sm p-4 relative overflow-hidden`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-1 h-4 rounded-full ${fact.color.replace("text-", "bg-")}`} />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            Did You Know
          </span>
          <span className="text-[10px] font-mono text-muted-foreground/50">—</span>
          <span className={`text-[10px] font-mono uppercase tracking-wider ${fact.color}`}>
            {fact.category}
          </span>
        </div>

        {/* Nav controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => goTo("prev")}
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Previous fact"
          >
            <ArrowLeft className="h-3 w-3" />
          </button>
          {/* Dot indicators */}
          <div className="flex gap-1">
            {FACTS.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (i === index || transition !== "idle") return
                  const dir = i > index ? "next" : "prev"
                  if (autoRef.current) clearInterval(autoRef.current)
                  const exitState: TransitionState = dir === "next" ? "exit-left" : "exit-right"
                  const enterState: TransitionState = dir === "next" ? "enter-right" : "enter-left"
                  setTransition(exitState)
                  setTimeout(() => {
                    setDisplayIndex(i)
                    setIndex(i)
                    setTransition(enterState)
                    setTimeout(() => setTransition("idle"), 350)
                  }, 300)
                  startAuto()
                }}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === index ? `w-4 ${fact.color.replace("text-", "bg-")}` : "w-1 bg-border"
                }`}
                aria-label={`Go to fact ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => goTo("next")}
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Next fact"
          >
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Fact content with slide transition */}
      <div
        className={`flex items-start gap-3 transition-all duration-300 ease-in-out ${transitionClasses[transition]}`}
      >
        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded border ${fact.bg} ${fact.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-mono font-semibold mb-1 ${fact.color}`}>
            {fact.headline}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed font-sans">
            {fact.body}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-border/30">
        <div
          key={index}
          className={`h-full ${fact.color.replace("text-", "bg-")} transition-none`}
          style={{ animation: transition === "idle" ? "progress 5s linear forwards" : "none", width: transition === "idle" ? undefined : "0%" }}
        />
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  )
}
