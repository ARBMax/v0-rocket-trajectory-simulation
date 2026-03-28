"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  RocketParams,
  SimulationResult,
  simulateRocket,
  calculateTheoreticalValues,
  ROCKET_PRESETS,
} from "@/lib/rocket-physics"

export function useRocketSimulation() {
  const [params, setParams] = useState<RocketParams>(ROCKET_PRESETS["Model Rocket"])
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [selectedPreset, setSelectedPreset] = useState<string>("Model Rocket")

  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  // Run simulation
  const runSimulation = useCallback(() => {
    const simResult = simulateRocket(params, 0.01, 300)
    setResult(simResult)
    setCurrentIndex(0)
    setIsRunning(false)
  }, [params])

  // Animation loop
  useEffect(() => {
    if (!isRunning || !result) return

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp

      const elapsed = timestamp - lastTimeRef.current
      const timeStep = (elapsed / 1000) * playbackSpeed

      if (timeStep >= 0.01) {
        // Advance by number of frames based on elapsed time
        const framesToAdvance = Math.floor(timeStep / 0.01)
        const newIndex = Math.min(currentIndex + framesToAdvance, result.states.length - 1)

        setCurrentIndex(newIndex)
        lastTimeRef.current = timestamp

        // Stop at end
        if (newIndex >= result.states.length - 1) {
          setIsRunning(false)
          return
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRunning, result, currentIndex, playbackSpeed])

  // Play/pause
  const togglePlayback = useCallback(() => {
    if (!result) {
      runSimulation()
      setIsRunning(true)
    } else if (currentIndex >= result.states.length - 1) {
      // Restart
      setCurrentIndex(0)
      setIsRunning(true)
    } else {
      setIsRunning((prev) => !prev)
    }
    lastTimeRef.current = 0
  }, [result, currentIndex, runSimulation])

  // Reset
  const reset = useCallback(() => {
    setIsRunning(false)
    setCurrentIndex(0)
    lastTimeRef.current = 0
  }, [])

  // Update params
  const updateParam = useCallback(
    <K extends keyof RocketParams>(key: K, value: RocketParams[K]) => {
      setParams((prev) => ({ ...prev, [key]: value }))
      setResult(null)
      setCurrentIndex(0)
    },
    []
  )

  // Select preset
  const selectPreset = useCallback((presetName: string) => {
    setSelectedPreset(presetName)
    if (ROCKET_PRESETS[presetName]) {
      setParams(ROCKET_PRESETS[presetName])
      setResult(null)
      setCurrentIndex(0)
    }
  }, [])

  // Get theoretical values
  const theoretical = calculateTheoreticalValues(params)

  // Get current state
  const currentState = result?.states[currentIndex] ?? null

  return {
    params,
    result,
    isRunning,
    currentIndex,
    currentState,
    playbackSpeed,
    selectedPreset,
    theoretical,
    setPlaybackSpeed,
    runSimulation,
    togglePlayback,
    reset,
    updateParam,
    selectPreset,
    setCurrentIndex,
  }
}
