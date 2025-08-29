import { useEffect, useRef, useState } from 'react'
import * as Comlink from 'comlink'
import type { BuildConfiguration, DPRConfiguration, DPRResult } from '../stores/types'

// Worker API type
interface DPRWorkerAPI {
  calculateDPR: (build: BuildConfiguration, config: DPRConfiguration) => Promise<DPRResult>
  calculateSingleAC: (build: BuildConfiguration, config: DPRConfiguration, targetAC: number) => Promise<number>
  findGWMSSThreshold: (build: BuildConfiguration, config: DPRConfiguration) => Promise<number | null>
}

export function useDPRWorker() {
  const workerRef = useRef<Worker | null>(null)
  const workerAPIRef = useRef<DPRWorkerAPI | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    // Create worker
    workerRef.current = new Worker(
      new URL('../workers/dpr.worker.ts', import.meta.url),
      { type: 'module' }
    )
    
    // Wrap with Comlink
    workerAPIRef.current = Comlink.wrap<DPRWorkerAPI>(workerRef.current)
    setIsReady(true)
    
    // Cleanup
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [])
  
  const calculateDPR = async (
    build: BuildConfiguration,
    config: DPRConfiguration
  ): Promise<DPRResult | null> => {
    if (!workerAPIRef.current || !isReady) {
      setError(new Error('Worker not ready'))
      return null
    }
    
    setIsCalculating(true)
    setError(null)
    
    try {
      const result = await workerAPIRef.current.calculateDPR(build, config)
      setIsCalculating(false)
      return result
    } catch (err) {
      setError(err as Error)
      setIsCalculating(false)
      return null
    }
  }
  
  const calculateSingleAC = async (
    build: BuildConfiguration,
    config: DPRConfiguration,
    targetAC: number
  ): Promise<number | null> => {
    if (!workerAPIRef.current || !isReady) {
      setError(new Error('Worker not ready'))
      return null
    }
    
    try {
      return await workerAPIRef.current.calculateSingleAC(build, config, targetAC)
    } catch (err) {
      setError(err as Error)
      return null
    }
  }
  
  const findGWMSSThreshold = async (
    build: BuildConfiguration,
    config: DPRConfiguration
  ): Promise<number | null> => {
    if (!workerAPIRef.current || !isReady) {
      setError(new Error('Worker not ready'))
      return null
    }
    
    try {
      return await workerAPIRef.current.findGWMSSThreshold(build, config)
    } catch (err) {
      setError(err as Error)
      return null
    }
  }
  
  return {
    calculateDPR,
    calculateSingleAC,
    findGWMSSThreshold,
    isReady,
    isCalculating,
    error
  }
}