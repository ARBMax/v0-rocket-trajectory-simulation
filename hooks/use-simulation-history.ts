'use client'

import { RocketParams } from '@/lib/rocket-physics'
import { useState, useCallback } from 'react'

export interface SimulationSnapshot {
  id: string
  name: string
  params: RocketParams
  destination: string
  timestamp: number
  maxHeight: number
  maxVelocity: number
}

export function useSimulationHistory() {
  const [history, setHistory] = useState<SimulationSnapshot[]>([])

  const saveSimulation = useCallback(
    (params: RocketParams, destination: string, maxHeight: number, maxVelocity: number, name?: string) => {
      const snapshot: SimulationSnapshot = {
        id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: name || `${destination} Mission ${new Date().toLocaleTimeString()}`,
        params,
        destination,
        timestamp: Date.now(),
        maxHeight,
        maxVelocity,
      }
      setHistory(prev => [snapshot, ...prev].slice(0, 10)) // Keep max 10
      return snapshot
    },
    []
  )

  const loadSimulation = useCallback((id: string) => {
    return history.find(s => s.id === id)
  }, [history])

  const deleteSimulation = useCallback((id: string) => {
    setHistory(prev => prev.filter(s => s.id !== id))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return {
    history,
    saveSimulation,
    loadSimulation,
    deleteSimulation,
    clearHistory,
  }
}
