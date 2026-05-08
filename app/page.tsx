"use client"

import { useState, useEffect } from "react"
import { useRocketSimulation } from "@/hooks/use-rocket-simulation"
import { ControlPanel } from "@/components/simulation/control-panel"
import { TrajectoryChart, VelocityChart, ForcesChart } from "@/components/simulation/trajectory-chart"
import { TelemetryDisplay } from "@/components/simulation/telemetry-display"
import { ComparisonPanel } from "@/components/simulation/comparison-panel"
import { RocketVisual } from "@/components/simulation/rocket-visual"
import { AISuggestionPanel } from "@/components/simulation/ai-suggestion-panel"
import { PhysicsEquationsPanel } from "@/components/simulation/physics-equations-panel"
import { ExportMission } from "@/components/simulation/export-mission"
import { SolarSystem } from "@/components/simulation/solar-system"
import { Starfield } from "@/components/starfield"
import { SplashScreen } from "@/components/splash-screen"
import { MissionIndicator } from "@/components/mission-indicator"
import { KeyboardHints } from "@/components/keyboard-hints"
import { CustomObjectives } from "@/components/custom-objectives"
import { RocketGallery } from "@/components/rocket-gallery"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { Rocket, Radio, Clock, Shield } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FunFactsBanner } from "@/components/fun-facts-banner"

export default function RocketSimulator() {
  const [showSplash, setShowSplash] = useState(true)
  const [contentVisible, setContentVisible] = useState(false)
  const [destinationPlanet, setDestinationPlanet] = useState("Mars")
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

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onTogglePlayback: togglePlayback,
    onReset: reset,
    onSpeedUp: () => setPlaybackSpeed(Math.min(5, playbackSpeed + 0.5)),
    onSpeedDown: () => setPlaybackSpeed(Math.max(0.1, playbackSpeed - 0.5)),
    isRunning,
  })

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

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b border-border/50 px-6 py-4 flex-shrink-0">
            <FunFactsBanner />
          </div>

          {/* Main Content Grid */}
          <div className="flex-1 overflow-hidden flex gap-4 p-6">
            {/* Left Sidebar - Controls */}
            <aside
              className={`w-80 overflow-y-auto transition-all duration-500 delay-100 flex-shrink-0 ${
                contentVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`}
            >
              <div className="space-y-4">
                {/* Control Panel */}
                <ControlPanel
                  params={params}
                  selectedPreset={selectedPreset}
                  isRunning={isRunning}
                  playbackSpeed={playbackSpeed}
                  destinationPlanet={destinationPlanet}
                  onUpdateParam={updateParam}
                  onSelectPreset={selectPreset}
                  onTogglePlayback={togglePlayback}
                  onReset={reset}
                  onSetPlaybackSpeed={setPlaybackSpeed}
                  onSelectDestination={setDestinationPlanet}
                />

                {/* Mission Indicator */}
                <MissionIndicator result={result} destinationPlanet={destinationPlanet} />

                {/* Quick Stats */}
                <div className="rounded border border-border/50 bg-card/50 p-4">
                  <h3 className="text-[10px] font-mono uppercase tracking-wider text-primary mb-3">Quick Stats</h3>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Max Height</span>
                      <span className="text-primary">{result?.maxHeight.toFixed(0) ?? "—"}m</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Peak Velocity</span>
                      <span className="text-primary">{result?.maxVelocity?.toFixed(1) ?? "—"}m/s</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Flight Time</span>
                      <span className="text-primary">{result?.states[result?.states.length - 1]?.time.toFixed(1) ?? "—"}s</span>
                    </div>
                  </div>
                </div>

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
              </div>
            </aside>

            {/* Main Visualization Area */}
            <div
              className={`flex-1 overflow-y-auto flex flex-col transition-all duration-500 delay-200 ${
                contentVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
              }`}
            >
              {/* Live Telemetry Section */}
              <div className="flex-shrink-0 pb-4 mb-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  Live Telemetry
                </div>
                <div className="h-56 rounded border border-border/50 overflow-hidden bg-card/30">
                  <RocketVisual currentState={currentState} result={result} />
                </div>
              </div>

              {/* Mission Trajectory Section */}
              <div className="flex-1 overflow-hidden flex flex-col pb-4 mb-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  Mission Trajectory
                </div>
                <div className="flex-1 rounded border border-border/50 overflow-hidden bg-black min-h-0">
                  <SolarSystem
                    destinationPlanet={destinationPlanet}
                    onSelectPlanet={setDestinationPlanet}
                    result={result}
                    currentState={currentState}
                  />
                </div>
              </div>

              {/* Analysis Section */}
              <div className="flex-shrink-0">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  Analysis
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* AI Flight Advisor */}
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

                  {/* Theoretical Comparison */}
                  <ComparisonPanel result={result} theoretical={theoretical} />
                </div>
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

        {/* Keyboard Shortcuts Overlay */}
        <KeyboardHints />
      </div>
    </div>
  )
}
