"use client"

import { SimulationResult } from "@/lib/rocket-physics"
import { CheckCircle2, XCircle, AlertTriangle, Info, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface ComparisonPanelProps {
  result: SimulationResult | null
  theoretical: {
    idealMaxHeight: number
    idealBurnoutVelocity: number
    burnTime: number
  }
}

export function ComparisonPanel({ result, theoretical }: ComparisonPanelProps) {
  if (!result) {
    return (
      <div className="rounded border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="border-b border-border/50 bg-secondary/30 px-4 py-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary">
            Theoretical Comparison
          </span>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
            <span className="text-xs font-mono uppercase tracking-wider">
              Awaiting simulation data for analysis
            </span>
          </div>
        </div>
      </div>
    )
  }

  const heightDiff =
    ((result.maxHeight - theoretical.idealMaxHeight) / theoretical.idealMaxHeight) * 100
  const velocityDiff =
    ((result.maxVelocity - theoretical.idealBurnoutVelocity) / theoretical.idealBurnoutVelocity) * 100

  const getStatusIcon = (diff: number) => {
    const absDiff = Math.abs(diff)
    if (absDiff < 10) return <CheckCircle2 className="h-4 w-4 text-chart-2" />
    if (absDiff < 30) return <AlertTriangle className="h-4 w-4 text-chart-4" />
    return <XCircle className="h-4 w-4 text-chart-3" />
  }

  const getTrendIcon = (diff: number) => {
    if (diff > 1) return <TrendingUp className="h-3 w-3" />
    if (diff < -1) return <TrendingDown className="h-3 w-3" />
    return <Minus className="h-3 w-3" />
  }

  const formatValue = (value: number, decimals: number = 1) => {
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(decimals)}km`
    }
    return `${value.toFixed(decimals)}m`
  }

  return (
    <div className="rounded border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="border-b border-border/50 bg-secondary/30 px-4 py-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary">
          Theoretical Comparison
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Comparison Grid */}
        <div className="grid gap-3 md:grid-cols-2">
          {/* Max Height */}
          <div className="rounded border border-border/30 bg-secondary/20 p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Maximum Altitude
              </span>
              {getStatusIcon(heightDiff)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[9px] font-mono uppercase text-muted-foreground mb-1">Simulated</div>
                <div className="text-xl font-mono font-bold text-primary tabular-nums">
                  {formatValue(result.maxHeight)}
                </div>
              </div>
              <div>
                <div className="text-[9px] font-mono uppercase text-muted-foreground mb-1">Theoretical</div>
                <div className="text-xl font-mono font-bold text-chart-2 tabular-nums">
                  {formatValue(theoretical.idealMaxHeight)}
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`text-xs font-mono tabular-nums ${heightDiff < 0 ? "text-chart-3" : "text-chart-2"}`}>
                {getTrendIcon(heightDiff)}
              </span>
              <span className={`text-xs font-mono tabular-nums ${heightDiff < 0 ? "text-chart-3" : "text-chart-2"}`}>
                {heightDiff >= 0 ? "+" : ""}{heightDiff.toFixed(1)}%
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                ({heightDiff < 0 ? "drag losses" : "above ideal"})
              </span>
            </div>
          </div>

          {/* Max Velocity */}
          <div className="rounded border border-border/30 bg-secondary/20 p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Peak Velocity
              </span>
              {getStatusIcon(velocityDiff)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[9px] font-mono uppercase text-muted-foreground mb-1">Simulated</div>
                <div className="text-xl font-mono font-bold text-primary tabular-nums">
                  {result.maxVelocity.toFixed(1)}
                  <span className="text-xs ml-1">m/s</span>
                </div>
              </div>
              <div>
                <div className="text-[9px] font-mono uppercase text-muted-foreground mb-1">Theoretical</div>
                <div className="text-xl font-mono font-bold text-chart-2 tabular-nums">
                  {theoretical.idealBurnoutVelocity.toFixed(1)}
                  <span className="text-xs ml-1">m/s</span>
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`text-xs font-mono tabular-nums ${velocityDiff < 0 ? "text-chart-3" : "text-chart-2"}`}>
                {getTrendIcon(velocityDiff)}
              </span>
              <span className={`text-xs font-mono tabular-nums ${velocityDiff < 0 ? "text-chart-3" : "text-chart-2"}`}>
                {velocityDiff >= 0 ? "+" : ""}{velocityDiff.toFixed(1)}%
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                deviation from ideal
              </span>
            </div>
          </div>
        </div>

        {/* Flight Timeline */}
        <div className="rounded border border-border/30 bg-secondary/20 p-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
            Flight Timeline
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div>
              <div className="text-[9px] font-mono uppercase text-muted-foreground">MECO</div>
              <div className="text-sm font-mono font-bold text-foreground tabular-nums">
                T+{result.burnoutTime.toFixed(2)}s
              </div>
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase text-muted-foreground">Burnout Alt</div>
              <div className="text-sm font-mono font-bold text-foreground tabular-nums">
                {formatValue(result.burnoutHeight)}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase text-muted-foreground">Apogee</div>
              <div className="text-sm font-mono font-bold text-foreground tabular-nums">
                T+{result.apogeeTime.toFixed(2)}s
              </div>
            </div>
            <div>
              <div className="text-[9px] font-mono uppercase text-muted-foreground">Total Flight</div>
              <div className="text-sm font-mono font-bold text-foreground tabular-nums">
                {result.flightTime.toFixed(2)}s
              </div>
            </div>
          </div>
        </div>

        {/* Physics Notes */}
        <div className="rounded border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-primary">
              Physics Notes
            </span>
          </div>
          <div className="grid gap-2 text-[10px] font-mono text-muted-foreground md:grid-cols-2">
            <div>
              <span className="text-foreground/70">Thrust:</span> F = T - mg - ½ρv²CdA
            </div>
            <div>
              <span className="text-foreground/70">Coast:</span> a = -g - (ρv²CdA)/(2m)
            </div>
            <div>
              <span className="text-foreground/70">Note:</span> Theoretical assumes no drag
            </div>
            <div>
              <span className="text-foreground/70">Mass:</span> Variable during burn phase
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
