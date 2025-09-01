import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { DPRConfiguration, DPRResult, BuildConfiguration } from './types'

interface DPRState {
  currentConfig: DPRConfiguration | null
  currentResult: DPRResult | null
  selectedBuild: BuildConfiguration | null
  isCalculating: boolean
  resultHistory: DPRResult[]
  
  // Actions
  setConfiguration: (config: DPRConfiguration) => void
  updateConfiguration: (updates: Partial<DPRConfiguration>) => void
  setResult: (result: DPRResult) => void
  setSelectedBuild: (build: BuildConfiguration | null) => void
  setCalculating: (calculating: boolean) => void
  clearResults: () => void
  removeFromHistory: (buildId: string) => void
}

const createDefaultConfig = (buildId: string): DPRConfiguration => ({
  buildId,
  acMin: 10,
  acMax: 30,
  acStep: 1,
  advantageState: 'normal',
  round0BuffsEnabled: true,
  greedyResourceUse: true,
  autoGWMSS: true
})

export const useDPRStore = create<DPRState>()(
  immer((set) => ({
    currentConfig: null,
    currentResult: null,
    selectedBuild: null,
    isCalculating: false,
    resultHistory: [],
    
    setConfiguration: (config) => {
      set((state) => {
        state.currentConfig = config
      })
    },
    
    updateConfiguration: (updates) => {
      set((state) => {
        if (state.currentConfig) {
          Object.assign(state.currentConfig, updates)
        }
      })
    },
    
    setSelectedBuild: (build) => {
      set((state) => {
        state.selectedBuild = build
      })
    },
    
    setResult: (result) => {
      set((state) => {
        state.currentResult = result
        state.isCalculating = false
        
        // Add to history, replacing any existing result for the same build
        const existingIndex = state.resultHistory.findIndex(
          r => r.buildId === result.buildId
        )
        
        if (existingIndex >= 0) {
          state.resultHistory[existingIndex] = result
        } else {
          state.resultHistory.push(result)
        }
        
        // Keep only the most recent 50 results
        if (state.resultHistory.length > 50) {
          state.resultHistory = state.resultHistory.slice(-50)
        }
      })
    },
    
    setCalculating: (calculating) => {
      set((state) => {
        state.isCalculating = calculating
      })
    },
    
    clearResults: () => {
      set((state) => {
        state.currentResult = null
        state.resultHistory = []
      })
    },
    
    removeFromHistory: (buildId) => {
      set((state) => {
        state.resultHistory = state.resultHistory.filter(r => r.buildId !== buildId)
        if (state.currentResult?.buildId === buildId) {
          state.currentResult = null
        }
      })
    }
  }))
)

// Helper function to create default config for a build
export const createDPRConfig = (buildId: string): DPRConfiguration => {
  return createDefaultConfig(buildId)
}