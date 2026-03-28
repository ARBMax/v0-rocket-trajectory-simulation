"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SimulationState, SimulationResult } from "@/lib/rocket-physics"
import { Progress } from "@/components/ui/progress"
import {
  ArrowUp,
  Gauge,
  Flame,
  Fuel,
  Timer,
  Target,
  TrendingUp,
  Activity,
} from "lucide-react"

interface TelemetryDisplayProps {
  currentState: SimulationState | null
  result: SimulationResult | null
  theoretical: {
    idealMaxHeight: number
    idealBurnoutVelocity: number
    burnTime: number
  }
}

export function TelemetryDisplay({
  currentState,
  result,
  theoretical,
}: TelemetryDisplayProps) {
  const formatValue = (value: number, decimals: number = 2) => {
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(decimals)}M`
    }
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(decimals)}k`
    }
    return value.toFixed(decimals)
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "powered":
        return "text-chart-1"
      case "coasting":
        return "text-chart-2"
      case "descending":
        return "text-chart-3"
      case "landed":
        return "text-muted-foreground"
      default:
        return "text-foreground"
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Altitude */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowUp className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">Altitude</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">
              {currentState ? formatValue(currentState.height, 1) : "0"}
            </span>
            <span className="text-sm text-muted-foreground">m</span>
          </div>
          {result && (
            <div className="mt-2 text-xs text-muted-foreground">
              Max: {formatValue(result.maxHeight, 0)}m
            </div>
          )}
        </CardContent>
      </Card>

      {/* Velocity */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Gauge className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">Velocity</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">
              {currentState ? formatValue(currentState.velocity, 1) : "0"}
            </span>
            <span className="text-sm text-muted-foreground">m/s</span>
          </div>
          {result && (
            <div className="mt-2 text-xs text-muted-foreground">
              Max: {formatValue(result.maxVelocity, 0)} m/s
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acceleration */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">Acceleration</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">
              {currentState ? formatValue(currentState.acceleration, 1) : "0"}
            </span>
            <span className="text-sm text-muted-foreground">m/s²</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            G-force: {currentState ? (currentState.acceleration / 9.81).toFixed(2) : "0"}g
          </div>
        </CardContent>
      </Card>

      {/* Flight Phase */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">Phase</span>
          </div>
          <div
            className={`mt-2 text-2xl font-bold capitalize ${
              currentState ? getPhaseColor(currentState.phase) : "text-foreground"
            }`}
          >
            {currentState?.phase ?? "Ready"}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Time: {currentState?.time.toFixed(2) ?? "0.00"}s
          </div>
        </CardContent>
      </Card>

      {/* Thrust */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Flame className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">Thrust</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">
              {currentState ? formatValue(currentState.thrust, 0) : "0"}
            </span>
            <span className="text-sm text-muted-foreground">N</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {currentState?.phase === "powered" ? "Engine firing" : "Engine off"}
          </div>
        </CardContent>
      </Card>

      {/* Fuel */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Fuel className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">Fuel</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">
              {currentState ? formatValue(currentState.fuelRemaining, 2) : "0"}
            </span>
            <span className="text-sm text-muted-foreground">kg</span>
          </div>
          <div className="mt-2">
            <Progress
              value={
                currentState
                  ? (currentState.fuelRemaining /
                      (result?.states[0]?.fuelRemaining ?? 1)) *
                    100
                  : 100
              }
              className="h-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mass */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">Mass</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">
              {currentState ? formatValue(currentState.mass, 2) : "0"}
            </span>
            <span className="text-sm text-muted-foreground">kg</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Net Force: {currentState ? formatValue(currentState.netForce, 0) : "0"}N
          </div>
        </CardContent>
      </Card>

      {/* Flight Time */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Timer className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">Flight Time</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">
              {result ? result.flightTime.toFixed(1) : "0"}
            </span>
            <span className="text-sm text-muted-foreground">s</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Burn time: {theoretical.burnTime.toFixed(1)}s
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
