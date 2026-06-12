"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useRocketSimulation } from "@/hooks/use-rocket-simulation"
import { useMobileView } from "@/lib/mobile-context"
import { calculateHohmannTransfer } from "@/lib/rocket-physics"
import { saveMission } from "@/app/actions/missions"
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
import { AIAssistant } from "@/components/ai-assistant"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { Rocket, Radio, Clock, Shield, Smartphone, Monitor, History, Save } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FunFactsBanner } from "@/components/fun-facts-banner"
import { LoginPage } from "@/components/login-page"

export default function RocketSimulator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [showSplash, setShowSplash] = useState(true)
  const [contentVisible, setContentVisible] = useState(false)
  const [destinationPlanet, setDestinationPlanet] = useState("Mars")
  const [actualRocketPhase, setActualRocketPhase] = useState(0)
  const [currentTime, setCurrentTime] = useState("--:--:--")
  const [currentDate, setCurrentDate] = useState("--- -- ----")
  const [timezone, setTimezone] = useState("UTC")
  const { isMobileFormat, toggleMobileFormat } = useMobileView()

  // Planet orbital data (AU converted to simulation units, with AU = 10)
  const planetOrbits: Record<string, number> = {
    Mercury: 4.5,   // 0.39 AU
    Venus: 6.5,     // 0.72 AU
    Mars: 12.0,     // 1.52 AU
    Jupiter: 17.0,  // 5.20 AU
    Saturn: 22.0,   // 9.54 AU
    Uranus: 27.0,   // 19.19 AU
    Neptune: 31.0,  // 30.07 AU
  }

  // Calculate Hohmann transfer data based on destination planet
  const hohmannData = useMemo(() => {
    const destOrbit = planetOrbits[destinationPlanet] || 12.0
    const earthOrbit = 10.0 // 1 AU in simulation units
    
    // Scale orbital distances from simulation units to AU (1 simulation unit = 0.1 AU)
    const earthOrbitAU = earthOrbit * 1.496e11 // meters (1 AU = 1.496e11 m)
    const destOrbitAU = destOrbit * 1.496e11
    
    return calculateHohmannTransfer(earthOrbitAU, destOrbitAU)
  }, [destinationPlanet])

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem("rocketSimUser")
    if (savedUser) {
      setIsAuthenticated(true)
      setCurrentUser(savedUser)
    }
  }, [])

  const handleLogin = (email: string) => {
    setIsAuthenticated(true)
    setCurrentUser(email)
    localStorage.setItem("rocketSimUser", email)
  }

  const handleLogout = () => {
    // Clear all user-specific data from localStorage
    if (currentUser) {
      const userPrefix = `${currentUser}:`
      // Clear user-specific keys
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key && key.startsWith(userPrefix)) {
          localStorage.removeItem(key)
        }
      }
    }
    setIsAuthenticated(false)
    setCurrentUser(null)
    localStorage.removeItem("rocketSimUser")
  }

  const handleSaveMission = async () => {
    if (!result || !currentState) {
      alert('No mission data to save')
      return
    }
    
    try {
      // Get the current hohmann data based on destination planet
      const destOrbit = planetOrbits[destinationPlanet] || 12.0
      const earthOrbit = 10.0
      const earthOrbitAU = earthOrbit * 1.496e11
      const destOrbitAU = destOrbit * 1.496e11
      const hohmannData = calculateHohmannTransfer(earthOrbitAU, destOrbitAU)
      
      await saveMission({
        departurePlanet: 'Earth',
        targetPlanet: destinationPlanet,
        transferTime: hohmannData.transferTime,
        transferTimeDays: hohmannData.transferTimeDays,
        deltaV: hohmannData.deltaV,
        departureVelocity: hohmannData.departureVelocity,
        arrivalVelocity: hohmannData.arrivalVelocity,
        fuelUsed: params.fuelMass - currentState.fuelRemaining,
        fuelInitial: params.fuelMass,
        rocketPreset: selectedPreset,
        status: 'landed',
      })
      alert('Mission saved successfully!')
    } catch (error) {
      console.error('Failed to save mission:', error)
      alert('Failed to save mission')
    }
  }

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
    rocketPhase,
    setPlaybackSpeed,
    togglePlayback,
    reset,
    updateParam,
    updateParams,
    selectPreset,
  } = useRocketSimulation(currentUser || undefined)

  const handleSplashComplete = () => {
    setShowSplash(false)
    setTimeout(() => setContentVisible(true), 100)
  }

  // Setup keyboard shortcuts
  useKeyboardShortcuts({
    onTogglePlayback: togglePlayback,
    onReset: reset,
    onSpeedUp: () => setPlaybackSpeed(Math.min(5, playbackSpeed + 0.5)),
    onSpeedDown: () => setPlaybackSpeed(Math.max(0.25, playbackSpeed - 0.5)),
  })

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />
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
                <button
                  onClick={toggleMobileFormat}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors border-l border-border/50 pl-4"
                  title={isMobileFormat ? "Switch to Desktop" : "Switch to Mobile"}
                >
                  {isMobileFormat ? (
                    <>
                      <Monitor className="h-3.5 w-3.5" />
                      <span className="text-xs font-mono uppercase tracking-wider">Desktop</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="h-3.5 w-3.5" />
                      <span className="text-xs font-mono uppercase tracking-wider">Mobile</span>
                    </>
                  )}
                </button>
                <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs border-l border-border/50 pl-4">
                  <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                  <div className="flex flex-col items-end">
                    <span className="tabular-nums text-foreground">{currentTime}</span>
                    <span className="text-[9px] tracking-wider text-muted-foreground">{currentDate}</span>
                    <span className="text-[9px] tracking-wider text-primary/70">{timezone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground font-mono text-xs border-l border-border/50 pl-4">
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-foreground text-[9px] tracking-wider">Email: <span className="text-primary">{currentUser}</span></span>
                    <div className="flex gap-2">
                      {isAuthenticated && result && (
                        <button
                          onClick={handleSaveMission}
                          className="text-[9px] text-primary hover:text-primary/70 transition-colors uppercase tracking-wider flex items-center gap-1"
                        >
                          <Save className="h-3 w-3" />
                          Save
                        </button>
                      )}
                      {isAuthenticated && (
                        <a
                          href="/missions"
                          className="text-[9px] text-primary hover:text-primary/70 transition-colors uppercase tracking-wider flex items-center gap-1"
                        >
                          <History className="h-3 w-3" />
                          History
                        </a>
                      )}
                      <button
                        onClick={handleLogout}
                        className="text-[9px] text-primary hover:text-primary/70 transition-colors uppercase tracking-wider"
                      >
                        Logout
                      </button>
                    </div>
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

          <div className={isMobileFormat ? "flex flex-col gap-4" : "grid gap-4 lg:grid-cols-[340px,1fr]"} style={{ height: isMobileFormat ? 'auto' : '100%' }}>
            {/* Left Sidebar - Controls */}
            <aside
              className={`${isMobileFormat ? "order-2" : ""} space-y-4 transition-all duration-500 delay-100 ${
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
                destinationPlanet={destinationPlanet}
                onUpdateParam={updateParam}
                onSelectPreset={selectPreset}
                onTogglePlayback={togglePlayback}
                onReset={reset}
                onSetPlaybackSpeed={setPlaybackSpeed}
                onSelectDestination={setDestinationPlanet}
              />

              {/* Rocket Gallery */}
              <RocketGallery
                onSelectRocket={(galleryParams) => {
                  updateParams(galleryParams)
                }}
              />

              {/* Custom Mission Objectives */}
              <CustomObjectives result={result} />

              {/* Physics Equations Display */}
              <PhysicsEquationsPanel currentState={actualRocketPhase === 0 ? null : currentState} params={params} />

              {/* Export Mission */}
              <ExportMission result={result} params={params} destinationPlanet={destinationPlanet} />

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
              className={`${isMobileFormat ? "order-1" : ""} space-y-4 transition-all duration-500 delay-200 ${
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
                currentState={actualRocketPhase === 0 ? null : currentState}
                result={result}
                theoretical={theoretical}
                rocketPhase={actualRocketPhase}
                hohmannData={hohmannData}
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

                <TabsContent value="visual" className="mt-4 space-y-4">
                  <div className="h-[400px] rounded border border-border/50 overflow-hidden bg-card/30">
                    <RocketVisual currentState={actualRocketPhase === 0 ? null : currentState} result={result} />
                  </div>
                  
                  <div>
                    <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
                      Mission Trajectory
                    </h3>
                    <div
                      className="rounded border border-border/50 overflow-hidden bg-black"
                      style={{ height: 480 }}
                    >
                      <SolarSystem
                        destinationPlanet={destinationPlanet}
                        onSelectPlanet={setDestinationPlanet}
                        result={result}
                        currentState={currentState}
                        playbackSpeed={playbackSpeed}
                        onActualPhaseChange={setActualRocketPhase}
                      />
                    </div>
                    <p className="mt-2 text-[10px] font-mono text-muted-foreground text-center uppercase tracking-widest">
                      Target: <span className="text-primary">{destinationPlanet}</span>
                    </p>
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

              {/* Mission Status */}
              <MissionIndicator result={result} destinationPlanet={destinationPlanet} />

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
              </div>
            </div>
          </div>
        </footer>

        {/* Keyboard Shortcuts Overlay */}
        <KeyboardHints />

        {/* AI Assistant Chat */}
        <AIAssistant />
      </div>
    </div>
  )
}
