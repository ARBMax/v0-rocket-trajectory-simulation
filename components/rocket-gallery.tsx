'use client'

import { RocketParams } from "@/lib/rocket-physics"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Rocket } from "lucide-react"
import { useState } from "react"

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
      mass: 25000,
      fuelMass: 385000,
      thrust: 7607000,
      burnRate: 135000,
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
      mass: 130000,
      fuelMass: 2970000,
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
      mass: 65000,
      fuelMass: 730000,
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
      mass: 6900,
      fuelMass: 303000,
      thrust: 4020000,
      burnRate: 67000,
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
      mass: 40000,
      fuelMass: 710000,
      thrust: 11400000,
      burnRate: 50000,
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
      mass: 85000,
      fuelMass: 5000000,
      thrust: 32832000,
      burnRate: 400000,
      dragCoefficient: 0.27,
      crossSectionalArea: 150.0,
    },
  },
]

interface RocketGalleryProps {
  onSelectRocket: (params: RocketParams) => void
}

export function RocketGallery({ onSelectRocket }: RocketGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  return (
    <Card className="border-border/50 bg-card/20">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-primary" />
          <CardTitle className="text-xs uppercase tracking-wider font-mono">Rocket Gallery</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {FAMOUS_ROCKETS.map((rocket, idx) => (
          <div
            key={idx}
            className={`p-2 rounded border transition-all cursor-pointer ${
              selectedIndex === idx
                ? "border-primary bg-primary/10"
                : "border-border/30 bg-background/30 hover:border-border/50"
            }`}
            onClick={() => setSelectedIndex(idx)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-[10px] font-mono font-bold text-foreground">{rocket.name}</div>
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
              </div>
            </div>

            {selectedIndex === idx && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectRocket(rocket.params)
                  setSelectedIndex(null)
                }}
                className="w-full h-6 mt-2 text-[9px] font-mono bg-primary/20 hover:bg-primary/30 text-primary"
              >
                Load Design
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
