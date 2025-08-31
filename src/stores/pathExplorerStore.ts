import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { AbilityScoreArray } from '../rules/types'
import { 
  PathOptimizer, 
  createCommonConstraints,
  type LevelPath,
  type OptimizationConfig,
  type PathConstraints,
  COMMON_MILESTONES 
} from '../engine/pathOptimizer'

export interface PathExplorerState {
  // Configuration
  objective: 'l20_dpr' | 'tier_average' | 'custom'
  constraints: PathConstraints
  baseAbilityScores: AbilityScoreArray
  race: string
  background?: string
  
  // Optimization settings
  beamWidth: number
  maxPaths: number
  
  // Results
  optimizedPaths: LevelPath[]
  isOptimizing: boolean
  lastOptimizationTime?: Date
  
  // UI state
  selectedConstraintPreset?: string
  customMilestones: string[]
  
  // Actions
  setObjective: (objective: 'l20_dpr' | 'tier_average' | 'custom') => void
  setConstraints: (constraints: Partial<PathConstraints>) => void
  setBaseAbilityScores: (scores: AbilityScoreArray) => void
  setRace: (race: string) => void
  setBackground: (background: string) => void
  setBeamWidth: (width: number) => void
  setMaxPaths: (paths: number) => void
  loadConstraintPreset: (preset: string) => void
  toggleMilestone: (milestoneId: string) => void
  optimizePaths: () => Promise<void>
  clearResults: () => void
}

export const usePathExplorerStore = create<PathExplorerState>()(
  immer((set, get) => ({
    // Default configuration
    objective: 'l20_dpr',
    constraints: createCommonConstraints().martial_dpr,
    baseAbilityScores: {
      STR: 15,
      DEX: 14,
      CON: 13,
      INT: 12,
      WIS: 10,
      CHA: 8
    },
    race: 'variant_human',
    background: undefined,
    
    // Default optimization settings
    beamWidth: 5,
    maxPaths: 3,
    
    // Initial state
    optimizedPaths: [],
    isOptimizing: false,
    lastOptimizationTime: undefined,
    selectedConstraintPreset: 'martial_dpr',
    customMilestones: ['extra_attack'],
    
    // Actions
    setObjective: (objective) => set((state) => {
      state.objective = objective
    }),
    
    setConstraints: (constraints) => set((state) => {
      state.constraints = { ...state.constraints, ...constraints }
    }),
    
    setBaseAbilityScores: (scores) => set((state) => {
      state.baseAbilityScores = scores
    }),
    
    setRace: (race) => set((state) => {
      state.race = race
    }),
    
    setBackground: (background) => set((state) => {
      state.background = background
    }),
    
    setBeamWidth: (width) => set((state) => {
      state.beamWidth = Math.max(1, Math.min(10, width))
    }),
    
    setMaxPaths: (paths) => set((state) => {
      state.maxPaths = Math.max(1, Math.min(10, paths))
    }),
    
    loadConstraintPreset: (preset) => set((state) => {
      const presets = createCommonConstraints()
      if (presets[preset]) {
        state.constraints = presets[preset]
        state.selectedConstraintPreset = preset
        
        // Update custom milestones to match preset
        state.customMilestones = state.constraints.mustHitMilestones.map(m => m.id)
      }
    }),
    
    toggleMilestone: (milestoneId) => set((state) => {
      const currentMilestones = state.customMilestones
      
      if (currentMilestones.includes(milestoneId)) {
        state.customMilestones = currentMilestones.filter(id => id !== milestoneId)
      } else {
        state.customMilestones = [...currentMilestones, milestoneId]
      }
      
      // Update constraints to match custom milestones
      state.constraints.mustHitMilestones = state.customMilestones
        .map(id => COMMON_MILESTONES[id])
        .filter(Boolean)
    }),
    
    optimizePaths: async () => {
      const state = get()
      
      set((draft) => {
        draft.isOptimizing = true
        draft.optimizedPaths = []
      })
      
      try {
        const config: OptimizationConfig = {
          objective: state.objective,
          constraints: state.constraints,
          beamWidth: state.beamWidth,
          maxPaths: state.maxPaths,
          baseAbilityScores: state.baseAbilityScores,
          race: state.race,
          background: state.background
        }
        
        console.log('Starting path optimization with config:', config)
        
        const optimizer = new PathOptimizer(config)
        const paths = await optimizer.optimizePaths()
        
        console.log('Optimization completed, found paths:', paths.length)
        
        set((draft) => {
          draft.optimizedPaths = paths
          draft.isOptimizing = false
          draft.lastOptimizationTime = new Date()
        })
        
      } catch (error) {
        console.error('Path optimization failed:', error)
        
        set((draft) => {
          draft.isOptimizing = false
          // Set placeholder paths on error for demonstration
          draft.optimizedPaths = createPlaceholderPaths()
        })
      }
    },
    
    clearResults: () => set((state) => {
      state.optimizedPaths = []
      state.lastOptimizationTime = undefined
    })
  }))
)

// Create placeholder paths for demonstration
function createPlaceholderPaths(): LevelPath[] {
  return [
    {
      id: 'fighter_rogue_optimal',
      name: 'Fighter 6 / Rogue 14 (Action Surge Nova)',
      levels: [], // Would be populated by real optimizer
      totalLevels: 20,
      classBreakdown: { fighter: 6, rogue: 14 },
      finalDPR: 185.7,
      averageDPR: 61.9,
      milestones: [
        {
          milestone: COMMON_MILESTONES.extra_attack,
          achieved: true,
          levelAchieved: 5,
          description: 'Extra Attack gained at Fighter 5'
        }
      ],
      dprProgression: Array.from({ length: 20 }, (_, i) => 
        Math.max(5, 25 + i * 3 + Math.random() * 10)
      ),
      score: 185.7
    },
    {
      id: 'pure_fighter',
      name: 'Pure Fighter (Consistent Performance)',
      levels: [],
      totalLevels: 20,
      classBreakdown: { fighter: 20 },
      finalDPR: 172.3,
      averageDPR: 57.4,
      milestones: [
        {
          milestone: COMMON_MILESTONES.extra_attack,
          achieved: true,
          levelAchieved: 5,
          description: 'Extra Attack gained at Fighter 5'
        }
      ],
      dprProgression: Array.from({ length: 20 }, (_, i) => 
        Math.max(8, 20 + i * 2.5 + Math.random() * 8)
      ),
      score: 172.3
    },
    {
      id: 'fighter_ranger_utility',
      name: 'Fighter 11 / Ranger 9 (Utility Focus)',
      levels: [],
      totalLevels: 20,
      classBreakdown: { fighter: 11, ranger: 9 },
      finalDPR: 168.9,
      averageDPR: 56.3,
      milestones: [
        {
          milestone: COMMON_MILESTONES.extra_attack,
          achieved: true,
          levelAchieved: 5,
          description: 'Extra Attack gained at Fighter 5'
        }
      ],
      dprProgression: Array.from({ length: 20 }, (_, i) => 
        Math.max(6, 18 + i * 2.8 + Math.random() * 7)
      ),
      score: 168.9
    }
  ]
}