import * as Comlink from 'comlink'
import { generateDPRCurves } from '../engine/simulator'
import type { BuildConfiguration, DPRConfiguration, DPRResult } from '../stores/types'

// Worker API exposed via Comlink
const dprWorkerAPI = {
  calculateDPR: async (
    build: BuildConfiguration,
    config: DPRConfiguration
  ): Promise<DPRResult> => {
    try {
      return generateDPRCurves(build, config)
    } catch (error) {
      console.error('DPR calculation error:', error)
      throw error
    }
  },
  
  // Quick calculation for a single AC value
  calculateSingleAC: async (
    build: BuildConfiguration,
    config: DPRConfiguration,
    targetAC: number
  ): Promise<number> => {
    const singleConfig = { ...config, acMin: targetAC, acMax: targetAC, acStep: 1 }
    const result = generateDPRCurves(build, singleConfig)
    return result.normalCurve[0]?.dpr || 0
  },
  
  // Find optimal GWM/SS threshold for a build
  findGWMSSThreshold: async (
    build: BuildConfiguration,
    config: DPRConfiguration
  ): Promise<number | null> => {
    const result = generateDPRCurves(build, config)
    
    // Find the AC where it switches from using to not using power attack
    let threshold: number | null = null
    for (let i = 0; i < result.gwmSSBreakpoints.length - 1; i++) {
      if (result.gwmSSBreakpoints[i].useGWMSS && !result.gwmSSBreakpoints[i + 1].useGWMSS) {
        threshold = result.gwmSSBreakpoints[i].ac
        break
      }
    }
    
    return threshold
  }
}

// Expose the API to the main thread
Comlink.expose(dprWorkerAPI)