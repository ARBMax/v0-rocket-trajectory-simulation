'use client'

import { SimulationResult } from "@/lib/rocket-physics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Target, Check, X } from "lucide-react"
import { useState } from "react"

interface MissionObjective {
  id: string
  name: string
  targetValue: number
  currentValue: number
  unit: string
  completed: boolean
  type: "height" | "velocity" | "time"
}

interface CustomObjectivesProps {
  result: SimulationResult | null
}

export function CustomObjectives({ result }: CustomObjectivesProps) {
  const [objectives, setObjectives] = useState<MissionObjective[]>([
    {
      id: "1",
      name: "Reach target altitude",
      targetValue: 1000,
      currentValue: result?.maxHeight || 0,
      unit: "m",
      completed: (result?.maxHeight || 0) >= 1000,
      type: "height",
    },
    {
      id: "2",
      name: "Achieve max velocity",
      targetValue: 200,
      currentValue: result?.maxVelocity || 0,
      unit: "m/s",
      completed: (result?.maxVelocity || 0) >= 200,
      type: "velocity",
    },
  ])

  const [newObjective, setNewObjective] = useState("")
  const [newValue, setNewValue] = useState("")

  const addObjective = () => {
    if (newObjective && newValue) {
      const objective: MissionObjective = {
        id: Date.now().toString(),
        name: newObjective,
        targetValue: parseFloat(newValue),
        currentValue: 0,
        unit: "custom",
        completed: false,
        type: "height",
      }
      setObjectives([...objectives, objective])
      setNewObjective("")
      setNewValue("")
    }
  }

  const deleteObjective = (id: string) => {
    setObjectives(objectives.filter((o) => o.id !== id))
  }

  const completedCount = objectives.filter((o) => o.completed).length
  const completionRate = ((completedCount / objectives.length) * 100).toFixed(0)

  return (
    <Card className="border-border/50 bg-card/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <CardTitle className="text-xs uppercase tracking-wider font-mono">Mission Objectives</CardTitle>
          </div>
          <div className="text-[10px] font-mono text-primary">{completedCount}/{objectives.length} Complete</div>
        </div>
        <div className="mt-2 h-1.5 bg-border/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Objective List */}
        {objectives.map((obj) => (
          <div key={obj.id} className="p-2 rounded border border-border/30 bg-background/50">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {obj.completed ? (
                    <Check className="h-3 w-3 text-green-400" />
                  ) : (
                    <X className="h-3 w-3 text-red-400" />
                  )}
                  <span className="text-[10px] font-mono text-foreground">{obj.name}</span>
                </div>
                <div className="text-[9px] text-muted-foreground mt-1">
                  {obj.currentValue.toFixed(1)} / {obj.targetValue} {obj.unit}
                </div>
                <div className="mt-1 h-1 bg-border/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/50 transition-all"
                    style={{ width: `${Math.min(100, (obj.currentValue / obj.targetValue) * 100)}%` }}
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteObjective(obj.id)}
                className="h-5 w-5 p-0 hover:bg-red-500/20 text-red-400"
              >
                ✕
              </Button>
            </div>
          </div>
        ))}

        {/* Add New Objective */}
        <div className="space-y-2 border-t border-border/30 pt-3">
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Add Objective</div>
          <Input
            placeholder="Objective name"
            value={newObjective}
            onChange={(e) => setNewObjective(e.target.value)}
            className="h-7 text-[10px] bg-input border-border/50"
          />
          <div className="flex gap-2">
            <Input
              placeholder="Target value"
              type="number"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="h-7 text-[10px] bg-input border-border/50"
            />
            <Button
              size="sm"
              onClick={addObjective}
              className="h-7 text-[10px] font-mono bg-primary/20 hover:bg-primary/30 text-primary"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Success Badge */}
        {completedCount === objectives.length && objectives.length > 0 && (
          <div className="p-2 rounded border border-green-500/30 bg-green-500/10 text-green-400 text-[10px] font-mono text-center">
            ✓ MISSION OBJECTIVES COMPLETE
          </div>
        )}
      </CardContent>
    </Card>
  )
}
