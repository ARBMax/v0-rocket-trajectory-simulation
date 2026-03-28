"use client"

import { useState } from "react"
import { useRocketSimulation } from "@/hooks/use-rocket-simulation"
import { ControlPanel } from "@/components/simulation/control-panel"
import { TrajectoryChart, VelocityChart, ForcesChart } from "@/components/simulation/trajectory-chart"
import { TelemetryDisplay } from "@/components/simulation/telemetry-display"
import { ComparisonPanel } from "@/components/simulation/comparison-panel"
import { RocketVisual } from "@/components/simulation/rocket-visual"
import { Starfield } from "@/components/starfield"
import { SplashScreen } from "@/components/splash-screen"
import { Rocket, Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RocketSimulator() {
  const [showSplash, setShowSplash] = useState(true)
  const [contentVisible, setContentVisible] = useState(false)

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
    // Stagger the content reveal
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
        className={`relative z-10 transition-all duration-700 ${
          contentVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Header */}
        <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/25">
                  <Rocket className="h-5 w-5 text-primary-foreground transform -rotate-45" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    Ozone Labs
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Rocket Trajectory Simulator
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>Educational physics simulation for students</span>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
            {/* Left Sidebar - Controls */}
            <aside
              className={`space-y-6 transition-all duration-500 delay-100 ${
                contentVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`}
            >
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

              {/* Quick Reference */}
              <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-4">
                <h3 className="mb-3 font-medium text-foreground">Quick Physics Reference</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Thrust:</strong> F = T (engine force)
                  </p>
                  <p>
                    <strong className="text-foreground">Gravity:</strong> F = -mg
                  </p>
                  <p>
                    <strong className="text-foreground">Drag:</strong> {"F = -½ρv²CdA"}
                  </p>
                  <p>
                    <strong className="text-foreground">Motion:</strong> F = ma
                  </p>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <div
              className={`space-y-6 transition-all duration-500 delay-200 ${
                contentVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
              }`}
            >
              {/* Telemetry Display */}
              <TelemetryDisplay
                currentState={currentState}
                result={result}
                theoretical={theoretical}
              />

              {/* Visualization Tabs */}
              <Tabs defaultValue="visual" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-muted/80 backdrop-blur-sm">
                  <TabsTrigger value="visual">3D Visual</TabsTrigger>
                  <TabsTrigger value="altitude">Altitude</TabsTrigger>
                  <TabsTrigger value="velocity">Velocity</TabsTrigger>
                  <TabsTrigger value="forces">Forces</TabsTrigger>
                </TabsList>

                <TabsContent value="visual" className="mt-4">
                  <div className="h-[450px] rounded-lg overflow-hidden border border-border">
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

              {/* Comparison Panel */}
              <ComparisonPanel result={result} theoretical={theoretical} />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card/80 backdrop-blur-md mt-8">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <div>
                Ozone Labs — Educational Physics Tool
              </div>
              <div className="flex items-center gap-4">
                <span>
                  Simulates: Thrust | Gravity | Atmospheric Drag | Variable Mass
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
