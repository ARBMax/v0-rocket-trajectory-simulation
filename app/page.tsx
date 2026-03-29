"use client"

import { useState, useEffect } from "react"
import { useRocketSimulation } from "@/hooks/use-rocket-simulation"
import { ControlPanel } from "@/components/simulation/control-panel"
import { TrajectoryChart, VelocityChart, ForcesChart } from "@/components/simulation/trajectory-chart"
import { TelemetryDisplay } from "@/components/simulation/telemetry-display"
import { ComparisonPanel } from "@/components/simulation/comparison-panel"
import { RocketVisual } from "@/components/simulation/rocket-visual"
import { AISuggestionPanel } from "@/components/simulation/ai-suggestion-panel"
import { Starfield } from "@/components/starfield"
import { SplashScreen } from "@/components/splash-screen"
import { Rocket, Radio, Clock, Shield } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FunFactsBanner } from "@/components/fun-facts-banner"

export default function RocketSimulator() {
  const [showSplash, setShowSplash] = useState(true)
  const [contentVisible, setContentVisible] = useState(false)
  const [currentTime, setCurrentTime] = useState("--:--:--")
  const [currentDate, setCurrentDate] = useState("--- -- ----")
  const [timezone, setTimezone] = useState("UTC")

  // Update time only on client to avoid hydration mismatch
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
      setCurrentDate(now.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short", year: "numeric" }).toUpperCase())
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const {
    params,
    result,
    isRunning,
    currentState,
    playbackSpeed,
    selectedPreset,
    theoretical,
    setPlaybackSpeed,
    togglePlayback,
    reset,
    updateParam,
    selectPreset,
  } = useRocketSimulation()

  const handleSplashComplete = () => {
    setShowSplash(false)
    setTimeout(() => setContentVisible(true), 100)
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Starfield Background */}
      <Starfield />

      {/* Splash Screen */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* Main Content */}
      <div
        className={`relative z-10 flex flex-col min-h-screen transition-all duration-700 ${
          contentVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Mission Control Header */}
        <header className="border-b border-border/50 bg-card/90 backdrop-blur-md">
          <div className="mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo & Title */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                  <div className="relative flex h-10 w-10 items-center justify-center rounded border border-primary/50 bg-card">
                    <Rocket className="h-5 w-5 text-primary transform -rotate-45" />
                  </div>
                </div>
                <div>
                  <h1 className="text-sm font-mono font-semibold tracking-[0.2em] text-primary uppercase">
                    Ozone Labs
                  </h1>
                  <p className="text-xs font-mono text-muted-foreground tracking-wider">
                    Trajectory Simulation & Flight Dynamics
                  </p>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="hidden md:flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-chart-2 animate-pulse" />
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Systems Online
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Radio className="h-3.5 w-3.5" />
                  <span className="text-xs font-mono uppercase tracking-wider">
                    Telemetry Active
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs border-l border-border/50 pl-4">
                  <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                  <div className="flex flex-col items-end">
                    <span className="tabular-nums text-foreground">{currentTime}</span>
                    <span className="text-[9px] tracking-wider text-muted-foreground">{currentDate}</span>
                    <span className="text-[9px] tracking-wider text-primary/70">{timezone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mission Status Bar */}
        <div className="border-b border-border/30 bg-secondary/30 backdrop-blur-sm px-4 py-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            <div className="flex items-center gap-6">
              <span>Mission Control v1.0</span>
              <span className="text-primary">|</span>
              <span>Physics Engine: Active</span>
              <span className="text-primary">|</span>
              <span>Simulation: {isRunning ? "Running" : "Standby"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3" />
              <span>Secure Session</span>
            </div>
          </div>
        </div>

        <main className="flex-1 p-4">
          {/* Fun Facts Banner */}
          <div className="mb-4">
            <FunFactsBanner />
          </div>

          <div className="grid gap-4 lg:grid-cols-[340px,1fr] h-full">
            {/* Left Sidebar - Controls */}
            <aside
              className={`space-y-4 transition-all duration-500 delay-100 ${
                contentVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`}
            >
              {/* Section Label */}
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                <span>Flight Parameters</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <ControlPanel
                params={params}
                selectedPreset={selectedPreset}
                isRunning={isRunning}
                playbackSpeed={playbackSpeed}
                onUpdateParam={updateParam}
                onSelectPreset={selectPreset}
                onTogglePlayback={togglePlayback}
                onReset={reset}
                onSetPlaybackSpeed={setPlaybackSpeed}
              />

              {/* Quick Reference - Technical Panel */}
              <div className="rounded border border-border/50 bg-card/50 backdrop-blur-sm p-4">
                <h3 className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary mb-3">
                  Physics Reference
                </h3>
                <div className="space-y-2 text-xs font-mono text-muted-foreground">
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Thrust</span>
                    <span className="text-primary">F = T</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Gravity</span>
                    <span className="text-primary">F = -mg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Drag</span>
                    <span className="text-primary">{"F = -½ρv²CdA"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Motion</span>
                    <span className="text-primary">F = ma</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div
              className={`space-y-4 transition-all duration-500 delay-200 ${
                contentVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
              }`}
            >
              {/* Section Label */}
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                <span>Live Telemetry</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Telemetry Display */}
              <TelemetryDisplay
                currentState={currentState}
                result={result}
                theoretical={theoretical}
              />

              {/* Section Label */}
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                <span>Visualization</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Visualization Tabs */}
              <Tabs defaultValue="visual" className="w-full">
                <TabsList className="w-full justify-start gap-0 bg-transparent border-b border-border/50 rounded-none p-0 h-auto">
                  <TabsTrigger 
                    value="visual" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-xs font-mono uppercase tracking-wider px-4 py-2"
                  >
                    3D Visual
                  </TabsTrigger>
                  <TabsTrigger 
                    value="altitude"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-xs font-mono uppercase tracking-wider px-4 py-2"
                  >
                    Altitude
                  </TabsTrigger>
                  <TabsTrigger 
                    value="velocity"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-xs font-mono uppercase tracking-wider px-4 py-2"
                  >
                    Velocity
                  </TabsTrigger>
                  <TabsTrigger 
                    value="forces"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary text-xs font-mono uppercase tracking-wider px-4 py-2"
                  >
                    Forces
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="visual" className="mt-4">
                  <div className="h-[400px] rounded border border-border/50 overflow-hidden bg-card/30">
                    <RocketVisual currentState={currentState} result={result} />
                  </div>
                </TabsContent>

                <TabsContent value="altitude" className="mt-4">
                  <TrajectoryChart result={result} currentIndex={result?.states.findIndex(s => s === currentState) ?? 0} />
                </TabsContent>

                <TabsContent value="velocity" className="mt-4">
                  <VelocityChart result={result} currentIndex={result?.states.findIndex(s => s === currentState) ?? 0} />
                </TabsContent>

                <TabsContent value="forces" className="mt-4">
                  <ForcesChart result={result} currentIndex={result?.states.findIndex(s => s === currentState) ?? 0} />
                </TabsContent>
              </Tabs>

              {/* Section Label */}
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                <span>Analysis</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Analysis Grid */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* AI Suggestions */}
                <AISuggestionPanel 
                  params={params} 
                  result={result}
                  onApplySuggestion={(changes) => {
                    Object.entries(changes).forEach(([key, value]) => {
                      if (value !== undefined) {
                        updateParam(key as keyof typeof params, value as number)
                      }
                    })
                  }}
                />

                {/* Comparison Panel */}
                <ComparisonPanel result={result} theoretical={theoretical} />
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/30 bg-card/50 backdrop-blur-md mt-auto">
          <div className="px-4 py-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Ozone Labs — Trajectory Simulation System</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Thrust</span>
                <span className="text-primary">|</span>
                <span>Gravity</span>
                <span className="text-primary">|</span>
                <span>Atmospheric Drag</span>
                <span className="text-primary">|</span>
                <span>Variable Mass</span>
                <span className="text-primary">|</span>
                <span className="text-primary/70">Optimized for PC use.</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
