'use client'

import { useEffect } from 'react'

interface KeyboardShortcutsProps {
  onTogglePlayback: () => void
  onReset: () => void
  onSpeedUp: () => void
  onSpeedDown: () => void
  isRunning: boolean
}

export function useKeyboardShortcuts({
  onTogglePlayback,
  onReset,
  onSpeedUp,
  onSpeedDown,
  isRunning,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          onTogglePlayback()
          break
        case 'KeyR':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            onReset()
          }
          break
        case 'Equal':
        case 'Plus':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            onSpeedUp()
          }
          break
        case 'Minus':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            onSpeedDown()
          }
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onTogglePlayback, onReset, onSpeedUp, onSpeedDown])
}
