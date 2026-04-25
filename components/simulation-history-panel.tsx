'use client'

import { SimulationSnapshot } from '@/hooks/use-simulation-history'
import { RocketParams } from '@/lib/rocket-physics'
import { Trash2, Download, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SimulationHistoryPanelProps {
  history: SimulationSnapshot[]
  onLoadSimulation: (params: RocketParams, destination: string) => void
  onDeleteSimulation: (id: string) => void
  onClearHistory: () => void
}

export function SimulationHistoryPanel({
  history,
  onLoadSimulation,
  onDeleteSimulation,
  onClearHistory,
}: SimulationHistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="rounded border border-border/30 bg-card/30 px-4 py-6 text-center">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          No saved simulations yet
        </p>
        <p className="text-[9px] text-muted-foreground/60 mt-1">
          Run a simulation and save it to see it here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Recent Simulations
        </h3>
        {history.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearHistory}
            className="h-6 text-[9px] font-mono text-muted-foreground hover:text-destructive"
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {history.map((snapshot) => (
          <div
            key={snapshot.id}
            className="flex items-center justify-between gap-2 p-2 rounded border border-border/30 bg-secondary/20 hover:bg-secondary/40 transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono text-foreground truncate">
                {snapshot.name}
              </p>
              <div className="flex items-center gap-2 text-[9px] text-muted-foreground mt-0.5">
                <span>{snapshot.destination}</span>
                <span className="text-border">•</span>
                <span>{(snapshot.maxHeight).toFixed(0)} km</span>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onLoadSimulation(snapshot.params, snapshot.destination)}
                className="h-6 w-6 p-0"
                title="Load this simulation"
              >
                <Download className="h-3 w-3 text-primary" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDeleteSimulation(snapshot.id)}
                className="h-6 w-6 p-0"
                title="Delete this simulation"
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
