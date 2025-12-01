'use client'

import { useState, useEffect, ReactNode } from 'react'
import { AnimatePresence } from 'framer-motion'
import LotusLoader from './LotusLoader'

interface AppInitializerProps {
  children: ReactNode
}

const AppInitializer = ({ children }: AppInitializerProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasShownLoader, setHasShownLoader] = useState(false)

  useEffect(() => {
    // Check if we've already shown the loader in this session
    const loaderShown = sessionStorage.getItem('kshetra-loader-shown')

    if (loaderShown) {
      setIsLoading(false)
      setHasShownLoader(true)
    }
  }, [])

  const handleLoadingComplete = () => {
    setIsLoading(false)
    setHasShownLoader(true)
    // Mark that we've shown the loader for this session
    sessionStorage.setItem('kshetra-loader-shown', 'true')
  }

  // Don't show loader if we've already shown it this session
  if (hasShownLoader && !isLoading) {
    return <>{children}</>
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <LotusLoader onComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>

      {!isLoading && children}
    </>
  )
}

export default AppInitializer