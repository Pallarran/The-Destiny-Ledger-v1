import { useEffect, useRef, useState, useCallback } from 'react'
import { wrap } from 'comlink'
import type { DPRWorkerAPI } from '../workers/dprWorker'
import type { BuildConfiguration, DPRConfiguration, DPRResult } from '../stores/types'

interface UseDPRWorkerReturn {
  isInitialized: boolean
  isCalculating: boolean
  calculateDPRCurves: (build: BuildConfiguration, config: DPRConfiguration) => Promise<DPRResult | null>
  calculateSingleDPR: (build: BuildConfiguration, targetAC: number, config?: Partial<DPRConfiguration>) => Promise<{
    dpr: number
    hitChance: number
    critChance: number
    breakdown: {
      round1: number
      round2: number
      round3: number
      total: number
    }
  } | null>
  calculatePowerAttackBreakpoints: (build: BuildConfiguration, acMin?: number, acMax?: number) => Promise<{
    ac: number
    usesPowerAttack: boolean
    normalDamage: number
    powerAttackDamage: number
    description: string
  }[] | null>
  terminate: () => void
}

export function useDPRWorker(): UseDPRWorkerReturn {
  const workerRef = useRef<Worker | null>(null)
  const apiRef = useRef<DPRWorkerAPI | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    // Initialize the worker
    const initializeWorker = async () => {
      try {
        // Create the worker
        workerRef.current = new Worker(
          new URL('../workers/dprWorker.ts', import.meta.url),
          { type: 'module' }
        )

        // Wrap with Comlink
        apiRef.current = wrap<DPRWorkerAPI>(workerRef.current)
        
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize DPR worker:', error)
        setIsInitialized(false)
      }
    }

    initializeWorker()

    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
        workerRef.current = null
        apiRef.current = null
        setIsInitialized(false)
      }
    }
  }, [])

  const calculateDPRCurves = useCallback(async (
    build: BuildConfiguration, 
    config: DPRConfiguration
  ): Promise<DPRResult | null> => {
    if (!apiRef.current || isCalculating) {
      return null
    }

    setIsCalculating(true)
    try {
      const result = await apiRef.current.calculateDPRCurves(build, config)
      return result
    } catch (error) {
      console.error('DPR curve calculation failed:', error)
      return null
    } finally {
      setIsCalculating(false)
    }
  }, [isCalculating])

  const calculateSingleDPR = useCallback(async (
    build: BuildConfiguration, 
    targetAC: number, 
    config: Partial<DPRConfiguration> = {}
  ) => {
    if (!apiRef.current || isCalculating) {
      return null
    }

    setIsCalculating(true)
    try {
      const result = await apiRef.current.calculateSingleDPR(build, targetAC, config)
      return result
    } catch (error) {
      console.error('Single DPR calculation failed:', error)
      return null
    } finally {
      setIsCalculating(false)
    }
  }, [isCalculating])

  const calculatePowerAttackBreakpoints = useCallback(async (
    build: BuildConfiguration, 
    acMin: number = 10, 
    acMax: number = 30
  ) => {
    if (!apiRef.current || isCalculating) {
      return null
    }

    setIsCalculating(true)
    try {
      const result = await apiRef.current.calculatePowerAttackBreakpoints(build, acMin, acMax)
      return result
    } catch (error) {
      console.error('Power attack breakpoint calculation failed:', error)
      return null
    } finally {
      setIsCalculating(false)
    }
  }, [isCalculating])

  const terminate = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate()
      workerRef.current = null
      apiRef.current = null
      setIsInitialized(false)
    }
  }, [])

  return {
    isInitialized,
    isCalculating,
    calculateDPRCurves,
    calculateSingleDPR,
    calculatePowerAttackBreakpoints,
    terminate
  }
}