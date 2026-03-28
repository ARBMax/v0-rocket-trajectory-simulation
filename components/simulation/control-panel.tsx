"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Play, Pause, RotateCcw, Rocket } from "lucide-react"

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
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Rocket className="h-5 w-5 text-primary" />
          Rocket Parameters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Selection */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">Preset Configuration</Label>
          <Select value={selectedPreset} onValueChange={onSelectPreset}>
            <SelectTrigger className="bg-input border-border text-foreground">
              <SelectValue placeholder="Select a preset" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {Object.keys(ROCKET_PRESETS).map((preset) => (
                <SelectItem key={preset} value={preset}>
                  {preset}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rocket Mass */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-muted-foreground">Dry Mass</Label>
            <span className="text-sm text-foreground">{params.mass.toFixed(2)} kg</span>
          </div>
          <Slider
            value={[params.mass]}
            onValueChange={([v]) => onUpdateParam("mass", v)}
            min={0.01}
            max={1000}
            step={0.01}
            className="cursor-pointer"
          />
        </div>

        {/* Fuel Mass */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-muted-foreground">Fuel Mass</Label>
            <span className="text-sm text-foreground">{params.fuelMass.toFixed(2)} kg</span>
          </div>
          <Slider
            value={[params.fuelMass]}
            onValueChange={([v]) => onUpdateParam("fuelMass", v)}
            min={0.01}
            max={500}
            step={0.01}
            className="cursor-pointer"
          />
        </div>

        {/* Thrust */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-muted-foreground">Thrust Force</Label>
            <span className="text-sm text-foreground">{params.thrust.toFixed(0)} N</span>
          </div>
          <Slider
            value={[params.thrust]}
            onValueChange={([v]) => onUpdateParam("thrust", v)}
            min={1}
            max={100000}
            step={1}
            className="cursor-pointer"
          />
        </div>

        {/* Burn Rate */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-muted-foreground">Fuel Burn Rate</Label>
            <span className="text-sm text-foreground">{params.burnRate.toFixed(3)} kg/s</span>
          </div>
          <Slider
            value={[params.burnRate]}
            onValueChange={([v]) => onUpdateParam("burnRate", v)}
            min={0.001}
            max={50}
            step={0.001}
            className="cursor-pointer"
          />
        </div>

        {/* Drag Coefficient */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-muted-foreground">Drag Coefficient</Label>
            <span className="text-sm text-foreground">{params.dragCoefficient.toFixed(2)}</span>
          </div>
          <Slider
            value={[params.dragCoefficient]}
            onValueChange={([v]) => onUpdateParam("dragCoefficient", v)}
            min={0.1}
            max={1}
            step={0.01}
            className="cursor-pointer"
          />
        </div>

        {/* Cross-sectional Area */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-muted-foreground">Cross-sectional Area</Label>
            <span className="text-sm text-foreground">{params.crossSectionalArea.toFixed(4)} m²</span>
          </div>
          <Slider
            value={[params.crossSectionalArea]}
            onValueChange={([v]) => onUpdateParam("crossSectionalArea", v)}
            min={0.0001}
            max={1}
            step={0.0001}
            className="cursor-pointer"
          />
        </div>

        {/* Playback Speed */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-muted-foreground">Playback Speed</Label>
            <span className="text-sm text-foreground">{playbackSpeed}x</span>
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

        {/* Control Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={onTogglePlayback}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isRunning ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Launch
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            className="border-border text-foreground hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
