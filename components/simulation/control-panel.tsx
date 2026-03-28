"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RocketParams, ROCKET_PRESETS } from "@/lib/rocket-physics"
import { Play, Pause, RotateCcw, Rocket, ChevronRight } from "lucide-react"

interface ControlPanelProps {
  params: RocketParams
  selectedPreset: string
  isRunning: boolean
  playbackSpeed: number
  onUpdateParam: <K extends keyof RocketParams>(key: K, value: RocketParams[K]) => void
  onSelectPreset: (preset: string) => void
  onTogglePlayback: () => void
  onReset: () => void
  onSetPlaybackSpeed: (speed: number) => void
}

export function ControlPanel({
  params,
  selectedPreset,
  isRunning,
  playbackSpeed,
  onUpdateParam,
  onSelectPreset,
  onTogglePlayback,
  onReset,
  onSetPlaybackSpeed,
}: ControlPanelProps) {
  const parameterGroups = [
    {
      label: "Mass Configuration",
      params: [
        { key: "mass" as const, label: "Dry Mass", unit: "kg", min: 0.01, max: 1000, step: 0.01 },
        { key: "fuelMass" as const, label: "Fuel Mass", unit: "kg", min: 0.01, max: 500, step: 0.01 },
      ],
    },
    {
      label: "Propulsion",
      params: [
        { key: "thrust" as const, label: "Thrust Force", unit: "N", min: 1, max: 100000, step: 1 },
        { key: "burnRate" as const, label: "Burn Rate", unit: "kg/s", min: 0.001, max: 50, step: 0.001 },
      ],
    },
    {
      label: "Aerodynamics",
      params: [
        { key: "dragCoefficient" as const, label: "Drag Coeff.", unit: "Cd", min: 0.1, max: 1, step: 0.01 },
        { key: "crossSectionalArea" as const, label: "X-Section", unit: "m²", min: 0.0001, max: 1, step: 0.0001 },
      ],
    },
  ]

  return (
    <div className="rounded border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-border/50 bg-secondary/30 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary">
            Flight Parameters
          </span>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Preset Selection */}
        <div className="space-y-2">
          <Label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Preset Configuration
          </Label>
          <Select value={selectedPreset} onValueChange={onSelectPreset}>
            <SelectTrigger className="bg-input border-border/50 text-foreground font-mono text-xs h-9">
              <SelectValue placeholder="Select preset" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border/50">
              {Object.keys(ROCKET_PRESETS).map((preset) => (
                <SelectItem key={preset} value={preset} className="font-mono text-xs">
                  {preset}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Parameter Groups */}
        {parameterGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-3">
            <div className="flex items-center gap-2">
              <ChevronRight className="h-3 w-3 text-primary" />
              <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                {group.label}
              </span>
            </div>

            {group.params.map((param) => (
              <div key={param.key} className="space-y-1.5 pl-5">
                <div className="flex justify-between">
                  <Label className="text-[10px] font-mono text-foreground/70">
                    {param.label}
                  </Label>
                  <span className="text-[10px] font-mono text-primary tabular-nums">
                    {typeof params[param.key] === "number"
                      ? (params[param.key] as number).toFixed(
                          param.step < 0.01 ? 4 : param.step < 1 ? 3 : 2
                        )
                      : params[param.key]}{" "}
                    <span className="text-muted-foreground">{param.unit}</span>
                  </span>
                </div>
                <Slider
                  value={[params[param.key] as number]}
                  onValueChange={([v]) => onUpdateParam(param.key, v)}
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  className="cursor-pointer"
                />
              </div>
            ))}
          </div>
        ))}

        {/* Playback Speed */}
        <div className="space-y-3 pt-2 border-t border-border/30">
          <div className="flex items-center gap-2">
            <ChevronRight className="h-3 w-3 text-primary" />
            <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
              Simulation
            </span>
          </div>
          <div className="space-y-1.5 pl-5">
            <div className="flex justify-between">
              <Label className="text-[10px] font-mono text-foreground/70">Playback Speed</Label>
              <span className="text-[10px] font-mono text-primary tabular-nums">{playbackSpeed}x</span>
            </div>
            <Slider
              value={[playbackSpeed]}
              onValueChange={([v]) => onSetPlaybackSpeed(v)}
              min={0.25}
              max={10}
              step={0.25}
              className="cursor-pointer"
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={onTogglePlayback}
            className={`flex-1 font-mono text-xs uppercase tracking-wider h-10 ${
              isRunning
                ? "bg-chart-3/20 border border-chart-3/50 text-chart-3 hover:bg-chart-3/30"
                : "bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30"
            }`}
            variant="ghost"
          >
            {isRunning ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Hold
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Launch
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={onReset}
            className="border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/50 h-10 w-10 p-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
