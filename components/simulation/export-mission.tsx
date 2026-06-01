'use client'

import { SimulationResult, RocketParams } from "@/lib/rocket-physics"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileJson, FileText } from "lucide-react"
import { useState } from "react"

interface ExportMissionProps {
  result: SimulationResult | null
  params: RocketParams
  destinationPlanet: string
}

export function ExportMission({ result, params, destinationPlanet }: ExportMissionProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportAsJSON = () => {
    setIsExporting(true)
    try {
      const missionData = {
        metadata: {
          exportDate: new Date().toISOString(),
          destination: destinationPlanet,
          appVersion: "Ozone Labs v1.0",
        },
        parameters: params,
        results: result
          ? {
              maxHeight: result.maxHeight,
              maxVelocity: result.maxVelocity,
              flightTime: result.flightTime,
              apogeeTime: result.apogeeTime,
              burnoutTime: result.burnoutTime,
              burnoutHeight: result.burnoutHeight,
              stateCount: result.states.length,
            }
          : null,
      }

      const dataStr = JSON.stringify(missionData, null, 2)
      const blob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `ozone-labs-mission-${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  const exportAsCSV = () => {
    setIsExporting(true)
    try {
      if (!result) return

      let csv = "Time (s),Height (m),Velocity (m/s),Acceleration (m/s²),Mass (kg),Thrust (N)\n"
      result.states.forEach((state, i) => {
        const time = (i * result.flightTime) / result.states.length
        csv += `${time.toFixed(2)},${state.height.toFixed(2)},${state.velocity.toFixed(2)},${state.acceleration.toFixed(2)},${state.mass.toFixed(2)},${state.thrust.toFixed(2)}\n`
      })

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `ozone-labs-trajectory-${Date.now()}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  const exportAsReport = () => {
    setIsExporting(true)
    try {
      if (!result) return

      const report = `
╔════════════════════════════════════════════════════════════════╗
║           OZONE LABS - MISSION REPORT                         ║
╚════════════════════════════════════════════════════════════════╝

MISSION PARAMETERS
─────────────────────────────────────────────────────────────────
Destination Planet       : ${destinationPlanet}
Launch Date             : ${new Date().toLocaleDateString()}
Rocket Mass             : ${params.mass} kg
Fuel Mass               : ${params.fuelMass} kg
Total Mass              : ${(params.mass + params.fuelMass).toFixed(2)} kg
Thrust Force            : ${params.thrust} N
Fuel Burn Rate          : ${params.burnRate} kg/s
Drag Coefficient        : ${params.dragCoefficient}
Cross-Sectional Area    : ${params.crossSectionalArea} m²

MISSION RESULTS
─────────────────────────────────────────────────────────────────
Maximum Height          : ${result.maxHeight.toFixed(2)} m
Maximum Velocity        : ${result.maxVelocity.toFixed(2)} m/s
Apogee Time             : ${result.apogeeTime.toFixed(2)} s
Total Flight Time       : ${result.flightTime.toFixed(2)} s
Burnout Time            : ${result.burnoutTime.toFixed(2)} s
Burnout Height          : ${result.burnoutHeight.toFixed(2)} m
Simulation Points       : ${result.states.length}

TRAJECTORY ANALYSIS
─────────────────────────────────────────────────────────────────
Thrust-to-Weight Ratio  : ${(params.thrust / ((params.mass + params.fuelMass) * 9.81)).toFixed(2)}
Fuel Efficiency         : ${((result.maxHeight / params.fuelMass) * 100).toFixed(2)} m per kg
Average Acceleration    : ${(result.maxVelocity / result.apogeeTime).toFixed(2)} m/s²

NOTES
─────────────────────────────────────────────────────────────────
This mission was simulated using Ozone Labs physics engine,
accounting for thrust, gravity, atmospheric drag, and variable mass.

Generated: ${new Date().toLocaleString()}
═══════════════════════════════════════════════════════════════════
      `.trim()

      const blob = new Blob([report], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `ozone-labs-report-${Date.now()}.txt`
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  if (!result) {
    return (
      <Card className="border-border/50 bg-card/20 opacity-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wider font-mono">Export Mission</CardTitle>
        </CardHeader>
        <CardContent className="text-[10px] text-muted-foreground">Run simulation first to export data</CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card/20">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-primary" />
          <CardTitle className="text-xs uppercase tracking-wider font-mono">Export Mission</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          size="sm"
          variant="outline"
          onClick={exportAsJSON}
          disabled={isExporting}
          className="w-full h-8 text-[10px] font-mono bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30"
        >
          <FileJson className="mr-1 h-3 w-3" />
          JSON
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={exportAsCSV}
          disabled={isExporting}
          className="w-full h-8 text-[10px] font-mono bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/30"
        >
          <FileText className="mr-1 h-3 w-3" />
          CSV (Spreadsheet)
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={exportAsReport}
          disabled={isExporting}
          className="w-full h-8 text-[10px] font-mono bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
        >
          <FileText className="mr-1 h-3 w-3" />
          Text Report
        </Button>
      </CardContent>
    </Card>
  )
}
