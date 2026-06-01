"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  RocketParams,
  SimulationResult,
  simulateRocket,
  calculateTheoreticalValues,
  ROCKET_PRESETS,
} from "@/lib/rocket-physics"

export function useRocketSimulation(userEmail?: string) {
  const [params, setParams] = useState<RocketParams>(ROCKET_PRESETS["Medium Rocket"])
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [selectedPreset, setSelectedPreset] = useState<string>("Medium Rocket")

  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  // Generate user-specific storage key
  const getStorageKey = (key: string) => {
    if (!userEmail) return key
    return `${userEmail}:${key}`
  }

  // Load user-specific params from localStorage on mount
  useEffect(() => {
    if (!userEmail) return
    const storageKey = getStorageKey("rocketParams")
    const savedParams = localStorage.getItem(storageKey)
    if (savedParams) {
      try {
        setParams(JSON.parse(savedParams))
      } catch (e) {
        console.log("[v0] Failed to parse saved params for user:", userEmail)
      }
    }
  }, [userEmail])

  // Save params to user-specific localStorage
  const saveParamsToStorage = useCallback((newParams: RocketParams) => {
    if (!userEmail) return
    const storageKey = getStorageKey("rocketParams")
    localStorage.setItem(storageKey, JSON.stringify(newParams))
  }, [userEmail, getStorageKey])

  // Run simulation
  const runSimulation = useCallback(() => {
    const simResult = simulateRocket(params, 0.01, 300)
    setResult(simResult)
    setCurrentIndex(0)
    setIsRunning(true)
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
      const newParams = { ...params, [key]: value }
      setParams(newParams)
      saveParamsToStorage(newParams)
      setResult(null)
      setCurrentIndex(0)
    },
    [params, saveParamsToStorage]
  )

  // Batch update multiple params at once
  const updateParams = useCallback(
    (updates: Partial<RocketParams>) => {
      setParams(prevParams => {
        const newParams = { ...prevParams, ...updates }
        saveParamsToStorage(newParams)
        return newParams
      })
      setResult(null)
      setCurrentIndex(0)
    },
    [saveParamsToStorage]
  )

  // Select preset
  const selectPreset = useCallback((presetName: string) => {
    setSelectedPreset(presetName)
    if (ROCKET_PRESETS[presetName]) {
      const newParams = ROCKET_PRESETS[presetName]
      setParams(newParams)
      saveParamsToStorage(newParams)
      setResult(null)
      setCurrentIndex(0)
    }
  }, [saveParamsToStorage])

  // Get theoretical values
  const theoretical = calculateTheoreticalValues(params)

  // Get current state
  const currentState = result?.states[currentIndex] ?? null

  // Calculate rocket phase for orbital mechanics visualization
  // When result is null or simulation hasn't started, rocket phase is 0 (waiting)
  const rocketPhase = result ? (currentIndex / result.states.length) : 0

  return {
    params,
    result,
    isRunning,
    currentIndex,
    currentState,
    playbackSpeed,
    selectedPreset,
    theoretical,
    rocketPhase,
    setPlaybackSpeed,
    runSimulation,
    togglePlayback,
    reset,
    updateParam,
    updateParams,
    selectPreset,
    setCurrentIndex,
  }
}
