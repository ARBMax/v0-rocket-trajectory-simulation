"use client"

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
        return "text-primary"
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

  const getPhaseIndicator = (phase: string) => {
    switch (phase) {
      case "powered":
        return "bg-primary"
      case "coasting":
        return "bg-chart-2"
      case "descending":
        return "bg-chart-3"
      case "landed":
        return "bg-muted-foreground"
      default:
        return "bg-foreground"
    }
  }

  const metrics = [
    {
      icon: ArrowUp,
      label: "ALT",
      value: currentState ? formatValue(currentState.height, 1) : "0.0",
      unit: "m",
      sub: result ? `MAX ${formatValue(result.maxHeight, 0)}m` : null,
    },
    {
      icon: Gauge,
      label: "VEL",
      value: currentState ? formatValue(currentState.velocity, 1) : "0.0",
      unit: "m/s",
      sub: result ? `MAX ${formatValue(result.maxVelocity, 0)} m/s` : null,
    },
    {
      icon: TrendingUp,
      label: "ACC",
      value: currentState ? formatValue(currentState.acceleration, 1) : "0.0",
      unit: "m/s²",
      sub: `G-FORCE ${currentState ? (currentState.acceleration / 9.81).toFixed(2) : "0.00"}`,
    },
    {
      icon: Flame,
      label: "THR",
      value: currentState ? formatValue(currentState.thrust, 0) : "0",
      unit: "N",
      sub: currentState?.phase === "powered" ? "FIRING" : "OFFLINE",
      subColor: currentState?.phase === "powered" ? "text-primary" : "text-muted-foreground",
    },
    {
      icon: Fuel,
      label: "FUEL",
      value: currentState ? formatValue(currentState.fuelRemaining, 2) : "0.00",
      unit: "kg",
      progress: currentState
        ? (currentState.fuelRemaining / (result?.states[0]?.fuelRemaining ?? 1)) * 100
        : 100,
    },
    {
      icon: Target,
      label: "MASS",
      value: currentState ? formatValue(currentState.mass, 2) : "0.00",
      unit: "kg",
      sub: `NET ${currentState ? formatValue(currentState.netForce, 0) : "0"}N`,
    },
    {
      icon: Timer,
      label: "T+",
      value: currentState?.time.toFixed(2) ?? "0.00",
      unit: "s",
      sub: `BURN ${theoretical.burnTime.toFixed(1)}s`,
    },
    {
      icon: Activity,
      label: "PHASE",
      value: currentState?.phase?.toUpperCase() ?? "READY",
      unit: "",
      isPhase: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-8">
      {metrics.map((metric, i) => (
        <div
          key={i}
          className="relative rounded border border-border/50 bg-card/50 backdrop-blur-sm p-3 group hover:border-primary/30 transition-colors"
        >
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-primary/30" />
          <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-primary/30" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-primary/30" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-primary/30" />

          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
            <metric.icon className="h-3 w-3" />
            <span className="text-[9px] font-mono uppercase tracking-wider">{metric.label}</span>
          </div>

          <div className="flex items-baseline gap-1">
            <span
              className={`text-lg font-mono font-bold tabular-nums ${
                metric.isPhase && currentState
                  ? getPhaseColor(currentState.phase)
                  : "text-foreground"
              }`}
            >
              {metric.value}
            </span>
            {metric.unit && (
              <span className="text-[10px] font-mono text-muted-foreground">{metric.unit}</span>
            )}
          </div>

          {metric.progress !== undefined && (
            <div className="mt-1.5">
              <Progress value={metric.progress} className="h-1" />
            </div>
          )}

          {metric.sub && (
            <div className={`mt-1 text-[9px] font-mono uppercase tracking-wide ${metric.subColor ?? "text-muted-foreground"}`}>
              {metric.sub}
            </div>
          )}

          {metric.isPhase && currentState && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${getPhaseIndicator(currentState.phase)} ${currentState.phase === "powered" ? "animate-pulse" : ""}`} />
              <span className="text-[9px] font-mono text-muted-foreground uppercase">
                T+ {currentState.time.toFixed(1)}s
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
