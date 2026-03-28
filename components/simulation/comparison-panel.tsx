"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SimulationResult } from "@/lib/rocket-physics"
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react"

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
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Comparison with Theory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Info className="h-5 w-5" />
            <span>Run a simulation to compare with theoretical predictions</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const heightDiff =
    ((result.maxHeight - theoretical.idealMaxHeight) / theoretical.idealMaxHeight) * 100
  const heightAccuracy = Math.abs(heightDiff)

  const getAccuracyIcon = (accuracy: number) => {
    if (accuracy < 10) return <CheckCircle2 className="h-5 w-5 text-chart-4" />
    if (accuracy < 30) return <AlertTriangle className="h-5 w-5 text-chart-1" />
    return <XCircle className="h-5 w-5 text-chart-3" />
  }

  const formatValue = (value: number, decimals: number = 1) => {
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(decimals)}km`
    }
    return `${value.toFixed(decimals)}m`
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Comparison with Theory</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Theoretical values assume no air resistance and constant average mass during burn.
          Differences indicate effects of drag and variable mass.
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Max Height Comparison */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Maximum Height</span>
              {getAccuracyIcon(heightAccuracy)}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Simulated</div>
                <div className="text-lg font-bold text-chart-1">
                  {formatValue(result.maxHeight)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Theoretical</div>
                <div className="text-lg font-bold text-chart-2">
                  {formatValue(theoretical.idealMaxHeight)}
                </div>
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className={heightDiff < 0 ? "text-chart-3" : "text-chart-4"}>
                {heightDiff >= 0 ? "+" : ""}
                {heightDiff.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">
                {" "}
                from theoretical (drag effects: {heightDiff < 0 ? "significant" : "minimal"})
              </span>
            </div>
          </div>

          {/* Burnout Velocity Comparison */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Burnout Velocity</span>
              {getAccuracyIcon(
                Math.abs(
                  ((result.maxVelocity - theoretical.idealBurnoutVelocity) /
                    theoretical.idealBurnoutVelocity) *
                    100
                )
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Simulated Max</div>
                <div className="text-lg font-bold text-chart-1">
                  {result.maxVelocity.toFixed(1)} m/s
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Theoretical</div>
                <div className="text-lg font-bold text-chart-2">
                  {theoretical.idealBurnoutVelocity.toFixed(1)} m/s
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Flight Summary */}
        <div className="rounded-lg border border-border p-4">
          <h4 className="mb-3 font-medium text-foreground">Flight Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <div className="text-muted-foreground">Burn Time</div>
              <div className="font-medium text-foreground">
                {result.burnoutTime.toFixed(2)}s
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Burnout Height</div>
              <div className="font-medium text-foreground">
                {formatValue(result.burnoutHeight)}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Apogee Time</div>
              <div className="font-medium text-foreground">
                {result.apogeeTime.toFixed(2)}s
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Flight</div>
              <div className="font-medium text-foreground">
                {result.flightTime.toFixed(2)}s
              </div>
            </div>
          </div>
        </div>

        {/* Physics Explanation */}
        <div className="rounded-lg border border-chart-2/30 bg-chart-2/10 p-4">
          <h4 className="mb-2 flex items-center gap-2 font-medium text-foreground">
            <Info className="h-4 w-4 text-chart-2" />
            Physics Insights
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              • <strong className="text-foreground">Thrust Phase:</strong> Net force = Thrust -
              Weight - Drag. Acceleration varies as mass decreases.
            </li>
            <li>
              • <strong className="text-foreground">Coasting Phase:</strong> Only gravity and
              drag act on the rocket. Velocity decreases until apogee.
            </li>
            <li>
              • <strong className="text-foreground">Descent Phase:</strong> Gravity accelerates
              the rocket downward, opposed by increasing drag.
            </li>
            <li>
              • <strong className="text-foreground">Key Equation:</strong> F = ma where F =
              T(t) - mg - ½ρv²CdA
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
