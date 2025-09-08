import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { 
  PartyOptimizationConfig, 
  PartyCompositionAnalysis
} from '../engine/partyOptimizer'
import type { BuildConfiguration } from './types'

interface PartyOptimizerState {
  // Current party configuration
  selectedBuilds: BuildConfiguration[]
  config: PartyOptimizationConfig
  
  // Analysis results
  currentAnalysis: PartyCompositionAnalysis | null
  isAnalyzing: boolean
  analysisError: string | null
  
  // History
  analysisHistory: Array<{
    timestamp: Date
    partyName: string
    builds: BuildConfiguration[]
    analysis: PartyCompositionAnalysis
  }>
}

interface PartyOptimizerActions {
  // Party management
  setSelectedBuilds: (builds: BuildConfiguration[]) => void
  addBuildToParty: (build: BuildConfiguration) => void
  removeBuildFromParty: (buildId: string) => void
  clearParty: () => void
  
  // Configuration
  setConfig: (config: Partial<PartyOptimizationConfig>) => void
  resetConfig: () => void
  
  // Analysis
  analyzeParty: () => Promise<void>
  clearAnalysis: () => void
  
  // History
  saveAnalysisToHistory: (partyName?: string) => void
  clearHistory: () => void
}

const DEFAULT_CONFIG: PartyOptimizationConfig = {
  // Party constraints
  maxSize: 8,
  targetLevel: undefined,
  
  // Encounter assumptions
  encounterTypes: ['combat', 'social', 'exploration'],
  combatDuration: 'medium',
  enemyTypes: ['single', 'multiple'],
  
  // Optimization priorities
  priorities: {
    roleBalance: 8,
    synergy: 6,
    damageOutput: 7,
    survivability: 7,
    versatility: 5
  },
  
  // Advanced options
  considerMulticlass: true,
  allowRespeccing: false,
  includeHomebrewBuilds: false
}

type PartyOptimizerStore = PartyOptimizerState & PartyOptimizerActions

export const usePartyOptimizerStore = create<PartyOptimizerStore>()(
  immer((set, get) => ({
    // Initial state
    selectedBuilds: [],
    config: { ...DEFAULT_CONFIG },
    currentAnalysis: null,
    isAnalyzing: false,
    analysisError: null,
    analysisHistory: [],
    
    // Party management
    setSelectedBuilds: (builds) => {
      set((state) => {
        state.selectedBuilds = builds.slice(0, state.config.maxSize)
        state.currentAnalysis = null // Clear previous analysis
      })
    },
    
    addBuildToParty: (build) => {
      set((state) => {
        if (state.selectedBuilds.length < state.config.maxSize && 
            !state.selectedBuilds.some(b => b.id === build.id)) {
          state.selectedBuilds.push(build)
          state.currentAnalysis = null // Clear previous analysis
        }
      })
    },
    
    removeBuildFromParty: (buildId) => {
      set((state) => {
        state.selectedBuilds = state.selectedBuilds.filter(b => b.id !== buildId)
        state.currentAnalysis = null // Clear previous analysis
      })
    },
    
    clearParty: () => {
      set((state) => {
        state.selectedBuilds = []
        state.currentAnalysis = null
      })
    },
    
    // Configuration
    setConfig: (newConfig) => {
      set((state) => {
        Object.assign(state.config, newConfig)
        
        // If maxSize changed, trim selected builds
        if (newConfig.maxSize && state.selectedBuilds.length > newConfig.maxSize) {
          state.selectedBuilds = state.selectedBuilds.slice(0, newConfig.maxSize)
        }
        
        state.currentAnalysis = null // Clear previous analysis
      })
    },
    
    resetConfig: () => {
      set((state) => {
        state.config = { ...DEFAULT_CONFIG }
        state.currentAnalysis = null
      })
    },
    
    // Analysis
    analyzeParty: async () => {
      const { selectedBuilds, config } = get()
      
      if (selectedBuilds.length === 0) {
        set((state) => {
          state.analysisError = 'No builds selected for analysis'
        })
        return
      }
      
      set((state) => {
        state.isAnalyzing = true
        state.analysisError = null
      })
      
      try {
        const { PartyOptimizer } = await import('../engine/partyOptimizer')
        
        const optimizer = new PartyOptimizer(selectedBuilds, config)
        const analysis = optimizer.analyze()
        
        set((state) => {
          state.currentAnalysis = analysis
          state.isAnalyzing = false
        })
      } catch (error) {
        set((state) => {
          state.analysisError = error instanceof Error ? error.message : 'Unknown analysis error'
          state.isAnalyzing = false
        })
      }
    },
    
    clearAnalysis: () => {
      set((state) => {
        state.currentAnalysis = null
        state.analysisError = null
      })
    },
    
    // History
    saveAnalysisToHistory: (partyName = 'Unnamed Party') => {
      const { selectedBuilds, currentAnalysis } = get()
      if (!currentAnalysis) return
      
      set((state) => {
        state.analysisHistory.push({
          timestamp: new Date(),
          partyName,
          builds: [...selectedBuilds],
          analysis: currentAnalysis
        })
        
        // Keep only last 10 analyses
        if (state.analysisHistory.length > 10) {
          state.analysisHistory = state.analysisHistory.slice(-10)
        }
      })
    },
    
    clearHistory: () => {
      set((state) => {
        state.analysisHistory = []
      })
    }
  }))
)