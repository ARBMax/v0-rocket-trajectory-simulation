'use client'

import { RocketParams } from '@/lib/rocket-physics'
import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react'

interface GuidanceBadgesProps {
  params: RocketParams
}

export function GuidanceBadges({ params }: GuidanceBadgesProps) {
  const rocketMass = params.mass
  const fuelMass = params.fuelMass
  const thrust = params.thrust
  
  // Calculate thrust-to-weight ratio (9.81 m/s^2 is Earth's gravity)
  const totalMass = rocketMass + fuelMass
  const gravity = 9.81
  const thrustToWeight = thrust / (totalMass * gravity)
  
  // Calculate fuel fraction
  const fuelFraction = fuelMass / totalMass
  
  // Determine status badges
  const badges: Array<{ type: 'good' | 'warning' | 'info'; label: string; value: string }> = []
  
  // Thrust-to-weight evaluation (good: 1.5+, decent: 1.2+, poor: <1.2)
  if (thrustToWeight >= 1.5) {
    badges.push({
      type: 'good',
      label: 'Thrust Ratio',
      value: `${thrustToWeight.toFixed(2)} — Excellent`
    })
  } else if (thrustToWeight >= 1.2) {
    badges.push({
      type: 'info',
      label: 'Thrust Ratio',
      value: `${thrustToWeight.toFixed(2)} — Good`
    })
  } else {
    badges.push({
      type: 'warning',
      label: 'Thrust Ratio',
      value: `${thrustToWeight.toFixed(2)} — Low`
    })
  }
  
  // Fuel fraction evaluation (good: 70%+, decent: 60%+, poor: <60%)
  if (fuelFraction >= 0.7) {
    badges.push({
      type: 'good',
      label: 'Fuel Load',
      value: `${(fuelFraction * 100).toFixed(0)}% — Efficient`
    })
  } else if (fuelFraction >= 0.6) {
    badges.push({
      type: 'info',
      label: 'Fuel Load',
      value: `${(fuelFraction * 100).toFixed(0)}% — Fair`
    })
  } else {
    badges.push({
      type: 'warning',
      label: 'Fuel Load',
      value: `${(fuelFraction * 100).toFixed(0)}% — Low`
    })
  }
  
  return (
    <div className="space-y-2">
      {badges.map((badge, i) => (
        <div
          key={i}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-[10px] font-mono uppercase tracking-wider ${
            badge.type === 'good'
              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
              : badge.type === 'warning'
                ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
          }`}
        >
          {badge.type === 'good' ? (
            <CheckCircle2 className="h-3 w-3 shrink-0" />
          ) : badge.type === 'warning' ? (
            <AlertCircle className="h-3 w-3 shrink-0" />
          ) : (
            <TrendingUp className="h-3 w-3 shrink-0" />
          )}
          <div className="flex-1">
            <span className="font-bold">{badge.label}:</span> {badge.value}
          </div>
        </div>
      ))}
    </div>
  )
}
