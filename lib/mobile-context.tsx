'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

type MobileViewContextType = {
  isMobileFormat: boolean
  toggleMobileFormat: () => void
}

const MobileViewContext = createContext<MobileViewContextType | undefined>(undefined)

export function MobileViewProvider({ children }: { children: ReactNode }) {
  const [isMobileFormat, setIsMobileFormat] = useState(false)

  const toggleMobileFormat = () => {
    setIsMobileFormat((prev) => !prev)
  }

  return (
    <MobileViewContext.Provider value={{ isMobileFormat, toggleMobileFormat }}>
      {children}
    </MobileViewContext.Provider>
  )
}

export function useMobileView() {
  const context = useContext(MobileViewContext)
  if (!context) {
    throw new Error('useMobileView must be used within MobileViewProvider')
  }
  return context
}
