import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { BuildConfiguration, LevelEntry } from './types'

interface BuilderState {
  currentBuild: BuildConfiguration | null
  isDirty: boolean
  
  // Actions
  createNewBuild: () => void
  loadBuild: (build: BuildConfiguration) => void
  updateBuild: (updates: Partial<BuildConfiguration>) => void
  updateAbilityScore: (ability: keyof BuildConfiguration['abilityScores'], value: number) => void
  addLevelEntry: (entry: LevelEntry) => void
  updateLevelEntry: (level: number, updates: Partial<LevelEntry>) => void
  removeLevelEntry: (level: number) => void
  setActiveBuffs: (buffIds: string[]) => void
  setRound0Buffs: (buffIds: string[]) => void
  clearBuild: () => void
}

const createDefaultBuild = (): BuildConfiguration => ({
  id: crypto.randomUUID(),
  name: 'New Build',
  createdAt: new Date(),
  updatedAt: new Date(),
  race: 'human_variant',
  abilityMethod: 'pointbuy',
  abilityScores: {
    STR: 15,
    DEX: 14,
    CON: 14,
    INT: 13,
    WIS: 13,
    CHA: 12
  },
  pointBuyLimit: 27,
  levelTimeline: [],
  currentLevel: 1,
  weaponEnhancements: [],
  activeBuffs: [],
  round0Buffs: []
})

export const useBuilderStore = create<BuilderState>()(
  immer((set, get) => ({
    currentBuild: null,
    isDirty: false,
    
    createNewBuild: () => {
      set((state) => {
        state.currentBuild = createDefaultBuild()
        state.isDirty = false
      })
    },
    
    loadBuild: (build) => {
      set((state) => {
        state.currentBuild = { ...build }
        state.isDirty = false
      })
    },
    
    updateBuild: (updates) => {
      set((state) => {
        if (state.currentBuild) {
          Object.assign(state.currentBuild, updates)
          state.currentBuild.updatedAt = new Date()
          state.isDirty = true
        }
      })
    },
    
    updateAbilityScore: (ability, value) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.abilityScores[ability] = value
          state.currentBuild.updatedAt = new Date()
          state.isDirty = true
        }
      })
    },
    
    addLevelEntry: (entry) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.levelTimeline.push(entry)
          state.currentBuild.levelTimeline.sort((a, b) => a.level - b.level)
          state.currentBuild.currentLevel = Math.max(
            state.currentBuild.currentLevel,
            entry.level
          )
          state.currentBuild.updatedAt = new Date()
          state.isDirty = true
        }
      })
    },
    
    updateLevelEntry: (level, updates) => {
      set((state) => {
        if (state.currentBuild) {
          const entry = state.currentBuild.levelTimeline.find(e => e.level === level)
          if (entry) {
            Object.assign(entry, updates)
            state.currentBuild.updatedAt = new Date()
            state.isDirty = true
          }
        }
      })
    },
    
    removeLevelEntry: (level) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.levelTimeline = state.currentBuild.levelTimeline.filter(
            e => e.level !== level
          )
          state.currentBuild.updatedAt = new Date()
          state.isDirty = true
        }
      })
    },
    
    setActiveBuffs: (buffIds) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.activeBuffs = buffIds
          state.currentBuild.updatedAt = new Date()
          state.isDirty = true
        }
      })
    },
    
    setRound0Buffs: (buffIds) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.round0Buffs = buffIds
          state.currentBuild.updatedAt = new Date()
          state.isDirty = true
        }
      })
    },
    
    clearBuild: () => {
      set((state) => {
        state.currentBuild = null
        state.isDirty = false
      })
    }
  }))
)