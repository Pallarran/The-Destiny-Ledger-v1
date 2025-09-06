import { useState, useCallback, useRef, useEffect } from 'react'
import { useDPRWorker } from './useDPRWorker'
import type { BuildConfiguration, DPRConfiguration } from '../stores/types'

interface DPRDelta {
  value: number
  isCalculating: boolean
  error?: string
  additionalMetrics?: {
    hitChanceDelta: number
    critChanceDelta: number
  }
}

export function useDPRDelta() {
  const { calculateDPRCurves, isInitialized } = useDPRWorker()
  const [deltas, setDeltas] = useState<Record<string, DPRDelta>>({})
  const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({})
  
  const calculateDelta = useCallback(async (
    deltaId: string,
    baseBuild: BuildConfiguration,
    modifiedBuild: BuildConfiguration,
    config: DPRConfiguration,
    targetAC: number = 16,
    debounceMs: number = 200
  ) => {
    if (!isInitialized) return
    
    // Clear existing timeout for this delta
    if (timeoutsRef.current[deltaId]) {
      clearTimeout(timeoutsRef.current[deltaId])
    }
    
    // Set calculating state
    setDeltas(prev => ({
      ...prev,
      [deltaId]: { value: 0, isCalculating: true }
    }))
    
    // Create debounced calculation
    timeoutsRef.current[deltaId] = setTimeout(async () => {
      try {
      // Calculate base DPR
      const baseResult = await calculateDPRCurves(baseBuild, config)
      if (!baseResult) {
        throw new Error('Failed to calculate base DPR')
      }
      
      // Calculate modified DPR
      const modifiedResult = await calculateDPRCurves(modifiedBuild, config)
      if (!modifiedResult) {
        throw new Error('Failed to calculate modified DPR')
      }
      
      // Find DPR values at target AC
      const basePoint = baseResult.normalCurve.find(p => p.ac === targetAC)
      const modifiedPoint = modifiedResult.normalCurve.find(p => p.ac === targetAC)
      
      if (!basePoint || !modifiedPoint) {
        throw new Error(`DPR data not found for AC ${targetAC}`)
      }
      
      const delta = modifiedPoint.dpr - basePoint.dpr
      
      // Also calculate additional metrics from the first normal curve point (more detailed data)
      const additionalMetrics = {
        hitChanceDelta: 0, // For now - would need more detailed DPR result structure
        critChanceDelta: 0  // For now - would need more detailed DPR result structure
      }
      
        setDeltas(prev => ({
          ...prev,
          [deltaId]: { 
            value: delta, 
            isCalculating: false,
            additionalMetrics 
          }
        }))
        
        // Cleanup timeout reference
        delete timeoutsRef.current[deltaId]
        
        return delta
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setDeltas(prev => ({
          ...prev,
          [deltaId]: { value: 0, isCalculating: false, error: errorMessage }
        }))
        
        // Cleanup timeout reference
        delete timeoutsRef.current[deltaId]
        return 0
      }
    }, debounceMs)
  }, [calculateDPRCurves, isInitialized])
  
  const clearDelta = useCallback((deltaId: string) => {
    // Clear any pending timeout
    if (timeoutsRef.current[deltaId]) {
      clearTimeout(timeoutsRef.current[deltaId])
      delete timeoutsRef.current[deltaId]
    }
    
    setDeltas(prev => {
      const { [deltaId]: _removed, ...rest } = prev
      return rest
    })
  }, [])
  
  const clearAllDeltas = useCallback(() => {
    // Clear all pending timeouts
    Object.keys(timeoutsRef.current).forEach(deltaId => {
      clearTimeout(timeoutsRef.current[deltaId])
    })
    timeoutsRef.current = {}
    
    setDeltas({})
  }, [])
  
  const getDelta = useCallback((deltaId: string): DPRDelta | null => {
    return deltas[deltaId] || null
  }, [deltas])
  
  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      Object.keys(timeoutsRef.current).forEach(deltaId => {
        clearTimeout(timeoutsRef.current[deltaId])
      })
    }
  }, [])
  
  return {
    calculateDelta,
    clearDelta,
    clearAllDeltas,
    getDelta,
    isReady: isInitialized
  }
}