'use client'

import { useState, useEffect } from 'react'
import { Keyboard } from 'lucide-react'

export function KeyboardHints() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?') {
        setIsVisible(!isVisible)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isVisible])

  return (
    <>
      {isVisible && (
        <div className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-sm p-4 max-w-xs">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-mono uppercase tracking-widest text-primary">Keyboard Shortcuts</h3>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2 text-[10px] font-mono">
            <div className="flex items-center justify-between gap-4 text-muted-foreground">
              <span className="inline-flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded text-foreground">
                <kbd className="text-[9px]">SPACE</kbd>
              </span>
              <span>Play / Pause</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-muted-foreground">
              <span className="inline-flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded text-foreground">
                <kbd className="text-[9px]">R</kbd>
              </span>
              <span>Reset</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-muted-foreground">
              <span className="inline-flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded text-foreground">
                <kbd className="text-[9px]">+</kbd>
              </span>
              <span>Speed Up</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-muted-foreground">
              <span className="inline-flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded text-foreground">
                <kbd className="text-[9px]">−</kbd>
              </span>
              <span>Speed Down</span>
            </div>
            <div className="border-t border-border/30 pt-2 mt-2">
              <div className="flex items-center justify-between gap-4 text-muted-foreground">
                <span className="inline-flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded text-foreground">
                  <kbd className="text-[9px]">?</kbd>
                </span>
                <span>Toggle Help</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed bottom-4 right-4 z-40 p-2 rounded border border-border/50 bg-card hover:bg-card/80 text-muted-foreground hover:text-foreground transition-colors"
          title="Press ? for keyboard shortcuts"
        >
          <Keyboard className="h-4 w-4" />
        </button>
      )}
    </>
  )
}
