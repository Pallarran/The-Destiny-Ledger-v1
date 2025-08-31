import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { 
  CombatOptimizationConfig, 
  CombatOptimizationResult
} from '../engine/combatRoundOptimizer'
import type { BuildConfiguration } from './types'

interface CombatOptimizerState {
  // Current optimization configuration
  config: CombatOptimizationConfig
  
  // Results
  currentResult: CombatOptimizationResult | null
  isOptimizing: boolean
  optimizationError: string | null
  
  // History
  resultHistory: Array<{
    timestamp: Date
    buildId: string
    config: CombatOptimizationConfig
    result: CombatOptimizationResult
  }>
}

interface CombatOptimizerActions {
  // Configuration actions
  setConfig: (config: Partial<CombatOptimizationConfig>) => void
  resetConfig: () => void
  
  // Optimization actions
  optimizeBuild: (build: BuildConfiguration) => Promise<void>
  clearResults: () => void
  
  // History actions
  saveResultToHistory: (buildId: string) => void
  clearHistory: () => void
}

const DEFAULT_CONFIG: CombatOptimizationConfig = {
  // Target parameters
  targetAC: 15,
  numberOfTargets: 1,
  targetType: 'single',
  
  // Combat assumptions
  roundsToOptimize: 3,
  advantageState: 'normal',
  
  // Resource usage strategy
  resourceStrategy: 'balanced',
  allowNovaDamage: false,
  
  // Tactical preferences
  prioritizeControl: false,
  prioritizeSurvivability: false,
  includeReactions: true
}

type CombatOptimizerStore = CombatOptimizerState & CombatOptimizerActions

export const useCombatOptimizerStore = create<CombatOptimizerStore>()(
  immer((set, get) => ({
    // Initial state
    config: { ...DEFAULT_CONFIG },
    currentResult: null,
    isOptimizing: false,
    optimizationError: null,
    resultHistory: [],
    
    // Configuration actions
    setConfig: (newConfig) => {
      set((state) => {
        Object.assign(state.config, newConfig)
      })
    },
    
    resetConfig: () => {
      set((state) => {
        state.config = { ...DEFAULT_CONFIG }
      })
    },
    
    // Optimization actions
    optimizeBuild: async (build) => {
      set((state) => {
        state.isOptimizing = true
        state.optimizationError = null
      })
      
      try {
        const { CombatRoundOptimizer } = await import('../engine/combatRoundOptimizer')
        
        const optimizer = new CombatRoundOptimizer(build, get().config)
        const result = optimizer.optimize()
        
        set((state) => {
          state.currentResult = result
          state.isOptimizing = false
        })
      } catch (error) {
        set((state) => {
          state.optimizationError = error instanceof Error ? error.message : 'Unknown optimization error'
          state.isOptimizing = false
        })
      }
    },
    
    clearResults: () => {
      set((state) => {
        state.currentResult = null
        state.optimizationError = null
      })
    },
    
    // History actions
    saveResultToHistory: (buildId) => {
      const { config, currentResult } = get()
      if (!currentResult) return
      
      set((state) => {
        state.resultHistory.push({
          timestamp: new Date(),
          buildId,
          config: { ...config },
          result: currentResult
        })
        
        // Keep only last 10 results
        if (state.resultHistory.length > 10) {
          state.resultHistory = state.resultHistory.slice(-10)
        }
      })
    },
    
    clearHistory: () => {
      set((state) => {
        state.resultHistory = []
      })
    }
  }))
)