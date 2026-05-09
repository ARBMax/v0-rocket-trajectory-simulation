'use client'

import { RocketParams } from '@/lib/rocket-physics'
import { useState, useCallback, useEffect } from 'react'

export interface SimulationSnapshot {
  id: string
  name: string
  params: RocketParams
  destination: string
  timestamp: number
  maxHeight: number
  maxVelocity: number
}

export function useSimulationHistory(userEmail?: string) {
  const [history, setHistory] = useState<SimulationSnapshot[]>([])

  // Generate user-specific storage key
  const getStorageKey = () => {
    if (!userEmail) return 'simulationHistory'
    return `${userEmail}:simulationHistory`
  }

  // Load user-specific history from localStorage on mount
  useEffect(() => {
    if (!userEmail) return
    const storageKey = getStorageKey()
    const savedHistory = localStorage.getItem(storageKey)
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.log("[v0] Failed to parse simulation history for user:", userEmail)
      }
    }
  }, [userEmail])

  // Save history to user-specific localStorage
  const saveHistoryToStorage = useCallback((newHistory: SimulationSnapshot[]) => {
    if (!userEmail) return
    const storageKey = getStorageKey()
    localStorage.setItem(storageKey, JSON.stringify(newHistory))
  }, [userEmail, getStorageKey])

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
      const newHistory = [snapshot, ...history].slice(0, 10) // Keep max 10
      setHistory(newHistory)
      saveHistoryToStorage(newHistory)
      return snapshot
    },
    [history, saveHistoryToStorage]
  )

  const loadSimulation = useCallback((id: string) => {
    return history.find(s => s.id === id)
  }, [history])

  const deleteSimulation = useCallback((id: string) => {
    const newHistory = history.filter(s => s.id !== id)
    setHistory(newHistory)
    saveHistoryToStorage(newHistory)
  }, [history, saveHistoryToStorage])

  const clearHistory = useCallback(() => {
    setHistory([])
    if (userEmail) {
      const storageKey = getStorageKey()
      localStorage.removeItem(storageKey)
    }
  }, [userEmail, getStorageKey])

  return {
    history,
    saveSimulation,
    loadSimulation,
    deleteSimulation,
    clearHistory,
  }
}
