'use client'

import { SimulationState } from "@/lib/rocket-physics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

interface PhysicsEquationsPanelProps {
  currentState: SimulationState | null
  params: any
}

export function PhysicsEquationsPanel({ currentState, params }: PhysicsEquationsPanelProps) {
  if (!currentState) return null

  // Calculate current values for display
  const thrustForce = params.thrustForce || 0
  const rocketMass = params.rocketMass + params.fuelMass || 1
  const acceleration = currentState.acceleration || 0
  const netForce = acceleration * rocketMass

  // Drag force calculation
  const dragCoeff = params.dragCoefficient || 0.25
  const area = params.crossSectionalArea || 0.5
  const airDensity = Math.max(0, 1.225 * Math.exp(-currentState.height / 8500)) // Exponential atmosphere model
  const dragForce = 0.5 * dragCoeff * airDensity * area * Math.pow(currentState.velocity, 2)

  // Gravity force
  const gravityForce = 9.81 * rocketMass

  return (
    <Card className="border-border/50 bg-card/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <CardTitle className="text-xs uppercase tracking-wider font-mono">Physics Equations</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-[10px] font-mono">
        {/* Newton's Second Law */}
        <div className="p-2 rounded bg-primary/5 border border-primary/20">
          <div className="text-muted-foreground mb-1">Newton's Second Law (F = ma)</div>
          <div className="text-foreground">
            F<sub>net</sub> = <span className="text-primary">{netForce.toFixed(0)}</span> N = {rocketMass.toFixed(1)} kg × {acceleration.toFixed(2)} m/s²
          </div>
          <div className="text-muted-foreground text-[9px] mt-1">
            where F<sub>net</sub> = F<sub>thrust</sub> - F<sub>gravity</sub> - F<sub>drag</sub>
          </div>
        </div>

        {/* Thrust Force */}
        <div className="p-2 rounded bg-blue-500/5 border border-blue-500/20">
          <div className="text-muted-foreground mb-1">Thrust Force</div>
          <div className="text-foreground">
            F<sub>thrust</sub> = <span className="text-blue-400">{thrustForce.toFixed(0)}</span> N
          </div>
        </div>

        {/* Gravity Force */}
        <div className="p-2 rounded bg-red-500/5 border border-red-500/20">
          <div className="text-muted-foreground mb-1">Gravitational Force (F = mg)</div>
          <div className="text-foreground">
            F<sub>gravity</sub> = <span className="text-red-400">{gravityForce.toFixed(0)}</span> N = {rocketMass.toFixed(1)} × 9.81 m/s²
          </div>
        </div>

        {/* Drag Force */}
        <div className="p-2 rounded bg-orange-500/5 border border-orange-500/20">
          <div className="text-muted-foreground mb-1">Drag Force (Cd = ½ρACₐv²)</div>
          <div className="text-foreground">
            F<sub>drag</sub> = <span className="text-orange-400">{dragForce.toFixed(1)}</span> N
          </div>
          <div className="text-muted-foreground text-[9px] mt-1">
            ρ = {airDensity.toFixed(3)} kg/m³, v = {currentState.velocity.toFixed(1)} m/s
          </div>
        </div>

        {/* Thrust-to-Weight Ratio */}
        <div className="p-2 rounded bg-primary/5 border border-primary/20">
          <div className="text-muted-foreground mb-1">Thrust-to-Weight Ratio</div>
          <div className="text-foreground">
            T/W = <span className="text-primary">{(thrustForce / gravityForce).toFixed(2)}</span> (should be &gt; 1 to launch)
          </div>
        </div>

        {/* Kinetic Energy */}
        <div className="p-2 rounded bg-yellow-500/5 border border-yellow-500/20">
          <div className="text-muted-foreground mb-1">Kinetic Energy (E = ½mv²)</div>
          <div className="text-foreground">
            E<sub>k</sub> = <span className="text-yellow-400">{(0.5 * rocketMass * Math.pow(currentState.velocity, 2)).toFixed(0)}</span> J
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
