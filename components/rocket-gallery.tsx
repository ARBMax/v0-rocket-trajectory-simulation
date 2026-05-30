'use client'

import { useState } from "react"
import { RocketParams } from "@/lib/rocket-physics"
import { useMobileView } from "@/lib/mobile-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Rocket, Check } from "lucide-react"

interface RocketDesign {
  name: string
  description: string
  manufacturer: string
  yearLaunched: number
  params: RocketParams
}

const FAMOUS_ROCKETS: RocketDesign[] = [
  {
    name: "Falcon 9",
    description: "Modern reusable orbital launch system",
    manufacturer: "SpaceX",
    yearLaunched: 2010,
    params: {
      mass: 550,
      fuelMass: 8500,
      thrust: 7607000,
      burnRate: 2720,
      dragCoefficient: 0.25,
      crossSectionalArea: 12.5,
    },
  },
  {
    name: "Saturn V",
    description: "Historic heavy-lift launch vehicle",
    manufacturer: "NASA",
    yearLaunched: 1967,
    params: {
      mass: 850,
      fuelMass: 12500,
      thrust: 34500000,
      burnRate: 15000,
      dragCoefficient: 0.28,
      crossSectionalArea: 105.7,
    },
  },
  {
    name: "Space Shuttle",
    description: "Partially reusable spaceplane orbiter",
    manufacturer: "NASA",
    yearLaunched: 1981,
    params: {
      mass: 750,
      fuelMass: 5000,
      thrust: 24944000,
      burnRate: 8183,
      dragCoefficient: 0.32,
      crossSectionalArea: 92.1,
    },
  },
  {
    name: "Soyuz",
    description: "Most reliable orbital launch system",
    manufacturer: "Roscosmos",
    yearLaunched: 1966,
    params: {
      mass: 280,
      fuelMass: 2200,
      thrust: 4020000,
      burnRate: 1200,
      dragCoefficient: 0.24,
      crossSectionalArea: 10.67,
    },
  },
  {
    name: "Ariane 5",
    description: "Heavy-lift launch vehicle",
    manufacturer: "ESA",
    yearLaunched: 1996,
    params: {
      mass: 550,
      fuelMass: 6500,
      thrust: 11400000,
      burnRate: 2800,
      dragCoefficient: 0.26,
      crossSectionalArea: 81.2,
    },
  },
  {
    name: "Starship",
    description: "Next-generation super heavy-lift vehicle",
    manufacturer: "SpaceX",
    yearLaunched: 2023,
    params: {
      mass: 900,
      fuelMass: 8500,
      thrust: 32832000,
      burnRate: 8000,
      dragCoefficient: 0.27,
      crossSectionalArea: 150.0,
    },
  },
]

interface RocketGalleryProps {
  onSelectRocket: (params: RocketParams) => void
}

export function RocketGallery({ onSelectRocket }: RocketGalleryProps) {
  const { isMobileFormat } = useMobileView()
  const [selectedRocket, setSelectedRocket] = useState<string | null>(null)

  const handleSelectRocket = (rocket: RocketDesign) => {
    setSelectedRocket(rocket.name)
    onSelectRocket(rocket.params)
    // Reset selection feedback after 1 second
    setTimeout(() => setSelectedRocket(null), 1000)
  }

  if (isMobileFormat) {
    return (
      <Card className="border-border/50 bg-card/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" />
            <CardTitle className="text-xs uppercase tracking-wider font-mono">Rocket Gallery</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-[9px] text-muted-foreground mb-3">Tap a rocket to load its configuration:</p>
          {FAMOUS_ROCKETS.map((rocket, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectRocket(rocket)}
              className={`w-full p-3 rounded border text-left transition-all active:scale-95 ${
                selectedRocket === rocket.name
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/30 bg-background/30 hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-mono font-bold text-foreground flex items-center gap-2">
                    {rocket.name}
                    {selectedRocket === rocket.name && <Check className="h-3 w-3 text-primary shrink-0" />}
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-1">{rocket.description}</div>
                  <div className="text-[8px] text-muted-foreground/50 mt-1">
                    {rocket.manufacturer} • Launched {rocket.yearLaunched}
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-2 text-[8px] text-muted-foreground">
                    <div>Mass: {(rocket.params.mass / 1000).toFixed(1)} t</div>
                    <div>Fuel: {(rocket.params.fuelMass / 1000).toFixed(1)} t</div>
                    <div>Thrust: {(rocket.params.thrust / 1000000).toFixed(2)} MN</div>
                    <div>T/W: {((rocket.params.thrust) / ((rocket.params.mass + rocket.params.fuelMass) * 9.81)).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
    )
  }

  // Desktop view - also clickable
  return (
    <Card className="border-border/50 bg-card/20">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-primary" />
          <CardTitle className="text-xs uppercase tracking-wider font-mono">Rocket Gallery</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-[9px] text-muted-foreground mb-3">Click a rocket to load its configuration:</p>
        {FAMOUS_ROCKETS.map((rocket, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectRocket(rocket)}
            onMouseDown={(e) => {
              e.preventDefault()
              handleSelectRocket(rocket)
            }}
            className={`w-full p-2 rounded border text-left transition-all cursor-pointer ${
              selectedRocket === rocket.name
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/30 bg-background/30 hover:border-primary/50 hover:bg-primary/5"
            }`}
          >
            <div className="text-[10px] font-mono font-bold text-foreground flex items-center gap-2">
              {rocket.name}
              {selectedRocket === rocket.name && <Check className="h-3 w-3 text-primary shrink-0" />}
            </div>
            <div className="text-[9px] text-muted-foreground">{rocket.description}</div>
            <div className="text-[8px] text-muted-foreground/50 mt-1">
              {rocket.manufacturer} • Launched {rocket.yearLaunched}
            </div>
            <div className="grid grid-cols-2 gap-1 mt-2 text-[8px] text-muted-foreground">
              <div>Mass: {(rocket.params.mass / 1000).toFixed(1)} t</div>
              <div>Fuel: {(rocket.params.fuelMass / 1000).toFixed(1)} t</div>
              <div>Thrust: {(rocket.params.thrust / 1000000).toFixed(2)} MN</div>
              <div>T/W: {((rocket.params.thrust) / ((rocket.params.mass + rocket.params.fuelMass) * 9.81)).toFixed(2)}</div>
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
