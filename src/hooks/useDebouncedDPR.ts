import { useState, useEffect, useCallback, useRef } from 'react'
import { useDPRWorker } from './useDPRWorker'
import type { BuildConfiguration, DPRConfiguration, DPRResult } from '../stores/types'

interface UseDebouncedDPROptions {
  delay?: number
  immediate?: boolean
}

interface UseDebouncedDPRReturn {
  result: DPRResult | null
  isCalculating: boolean
  isDebouncing: boolean
  error: string | null
  triggerCalculation: (build: BuildConfiguration, config: DPRConfiguration) => void
  cancelPending: () => void
}

/**
 * Hook for debounced DPR calculations with optimistic UI updates.
 * Prevents excessive calculations during rapid input changes.
 * 
 * @param options Configuration options
 * @returns Debounced DPR calculation state and controls
 */
export function useDebouncedDPR(
  options: UseDebouncedDPROptions = {}
): UseDebouncedDPRReturn {
  const { delay = 200, immediate = false } = options
  
  const { calculateDPRCurves, isInitialized } = useDPRWorker()
  const [result, setResult] = useState<DPRResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isDebouncing, setIsDebouncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingCalculationRef = useRef<{
    build: BuildConfiguration
    config: DPRConfiguration
  } | null>(null)

  const executeCalculation = useCallback(async (
    build: BuildConfiguration, 
    config: DPRConfiguration
  ) => {
    if (!isInitialized) {
      setError('DPR worker not initialized')
      return
    }

    setIsCalculating(true)
    setIsDebouncing(false)
    setError(null)

    try {
      const newResult = await calculateDPRCurves(build, config)
      if (newResult) {
        setResult(newResult)
      } else {
        setError('Failed to calculate DPR')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown calculation error'
      setError(errorMessage)
    } finally {
      setIsCalculating(false)
      pendingCalculationRef.current = null
    }
  }, [calculateDPRCurves, isInitialized])

  const triggerCalculation = useCallback((
    build: BuildConfiguration, 
    config: DPRConfiguration
  ) => {
    // Clear any pending calculation
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Store the pending calculation
    pendingCalculationRef.current = { build, config }
    
    if (immediate) {
      executeCalculation(build, config)
    } else {
      setIsDebouncing(true)
      setError(null)
      
      timeoutRef.current = setTimeout(() => {
        executeCalculation(build, config)
      }, delay)
    }
  }, [executeCalculation, delay, immediate])

  const cancelPending = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    setIsDebouncing(false)
    pendingCalculationRef.current = null
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    result,
    isCalculating,
    isDebouncing,
    error,
    triggerCalculation,
    cancelPending
  }
}