'use client'

import { SimulationResult } from '@/lib/rocket-physics'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

interface MissionIndicatorProps {
  result: SimulationResult | null
  destinationPlanet: string
}

const ESCAPE_VELOCITIES: Record<string, number> = {
  Mercury: 4.3,
  Venus: 10.4,
  Mars: 5.0,
  Jupiter: 60.2,
  Saturn: 35.5,
  Uranus: 21.3,
  Neptune: 23.5,
}

export function MissionIndicator({ result, destinationPlanet }: MissionIndicatorProps) {
  if (!result) return null

  const maxHeight = result.maxHeight
  const escapeVelocity = ESCAPE_VELOCITIES[destinationPlanet] || 5.0
  
  // Mission success: if rocket reaches a meaningful height (at least 100km above surface)
  // and has decent velocity at apogee (at least 20% of escape velocity for the destination)
  const minHeight = 100 // km
  const apogeeVelocity = result.states[Math.floor(result.states.length / 2)]?.velocity || 0
  const isSuccessful = maxHeight > minHeight && apogeeVelocity > escapeVelocity * 0.2

  const status = isSuccessful ? 'success' : 'warning'
  const statusText = isSuccessful 
    ? `Mission viable to ${destinationPlanet}` 
    : `Insufficient velocity for ${destinationPlanet}`

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded border ${
      isSuccessful
        ? 'border-green-500/30 bg-green-500/5'
        : 'border-yellow-500/30 bg-yellow-500/5'
    }`}>
      {isSuccessful ? (
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />
      )}
      <div className="flex-1">
        <p className={`text-xs font-mono uppercase tracking-wider ${
          isSuccessful ? 'text-green-500' : 'text-yellow-500'
        }`}>
          {statusText}
        </p>
        <p className="text-[9px] font-mono text-muted-foreground mt-0.5">
          Max height: {maxHeight.toFixed(1)} km • Apogee velocity: {apogeeVelocity.toFixed(1)} m/s
        </p>
      </div>
    </div>
  )
}
