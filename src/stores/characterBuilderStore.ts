import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { 
  CharacterBuilder, 
  CharacterBuilderState, 
  BuilderStep, 
  AbilityAssignmentMethod,
  BuilderLevelEntry,
  PointBuyConfig
} from '../types/character'
import {
  DEFAULT_POINT_BUY_CONFIG,
  DEFAULT_ABILITY_SCORES,
  BUILDER_STEPS
} from '../types/character'
import type { BuildConfiguration } from '../stores/types'
import type { AbilityScore, AbilityScoreArray } from '../rules/types'

interface CharacterBuilderStore extends CharacterBuilderState {
  // Navigation actions
  goToStep: (step: BuilderStep) => void
  nextStep: () => void
  previousStep: () => void
  
  // Build management
  createNewBuild: (name?: string) => void
  loadFromBuildConfiguration: (build: BuildConfiguration) => void
  exportToBuildConfiguration: () => BuildConfiguration | null
  updateBuild: (updates: Partial<CharacterBuilder>) => void
  
  // Ability score actions
  setAbilityAssignmentMethod: (method: AbilityAssignmentMethod) => void
  setAbilityScore: (ability: AbilityScore, value: number) => void
  setPointBuyConfig: (config: PointBuyConfig) => void
  resetAbilityScores: () => void
  
  // Race & Background actions
  setRace: (raceId: string) => void
  setBackground: (backgroundId: string) => void
  
  // Level progression actions
  addLevel: (classId: string, level: number) => void
  updateLevel: (level: number, updates: Partial<BuilderLevelEntry>) => void
  removeLevel: (level: number) => void
  setSubclass: (level: number, subclassId: string) => void
  selectFeat: (level: number, featId: string) => void
  selectASI: (level: number, abilityIncreases: Partial<AbilityScoreArray>) => void
  
  // Equipment actions
  setMainHandWeapon: (weaponId: string) => void
  setOffHandWeapon: (weaponId: string) => void
  setRangedWeapon: (weaponId: string) => void
  setArmor: (armorId: string) => void
  toggleShield: () => void
  addWeaponEnhancement: (enhancementId: string) => void
  removeWeaponEnhancement: (enhancementId: string) => void
  
  // Validation actions
  validateCurrentStep: () => boolean
  validateAllSteps: () => boolean
  getStepErrors: (step: BuilderStep) => string[]
  
  // Utility actions
  resetBuild: () => void
  markDirty: () => void
  clearDirty: () => void
}

const createDefaultBuilder = (name: string = 'New Character'): CharacterBuilder => ({
  // Base BuildConfiguration fields
  id: crypto.randomUUID(),
  name,
  createdAt: new Date(),
  updatedAt: new Date(),
  notes: '',
  race: '',
  background: '',
  abilityMethod: 'pointbuy',
  abilityScores: { ...DEFAULT_ABILITY_SCORES },
  pointBuyLimit: 27,
  levelTimeline: [],
  currentLevel: 1,
  mainHandWeapon: '',
  offHandWeapon: '',
  rangedWeapon: '',
  weaponEnhancements: [],
  activeBuffs: [],
  round0Buffs: [],
  
  // Extended CharacterBuilder fields
  currentStep: 'basic-info',
  completedSteps: [],
  abilityAssignmentMethod: 'pointbuy',
  pointBuyConfig: { ...DEFAULT_POINT_BUY_CONFIG },
  racialBonuses: {},
  finalAbilityScores: { ...DEFAULT_ABILITY_SCORES },
  enhancedLevelTimeline: [],
  maxLevel: 20,
  selectedMainHand: '',
  selectedOffHand: '',
  selectedRanged: '',
  selectedArmor: '',
  hasShield: false,
  isValid: false,
  validationErrors: []
})

export const useCharacterBuilderStore = create<CharacterBuilderStore>()(
  immer((set, get) => ({
    // Initial state
    currentBuild: null,
    isDirty: false,
    isLoading: false,
    currentStep: 'basic-info',
    canProceed: false,
    canGoBack: false,
    stepValidation: {
      'basic-info': false,
      'ability-scores': false,
      'race-background': false,
      'class-progression': false,
      'equipment': false,
      'summary': false
    },
    globalErrors: [],
    
    // Navigation actions
    goToStep: (step: BuilderStep) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentStep = step
          state.currentBuild.currentStep = step
          updateNavigationState(state)
        }
      })
    },
    
    nextStep: () => {
      const { currentStep } = get()
      const currentIndex = BUILDER_STEPS.indexOf(currentStep)
      if (currentIndex < BUILDER_STEPS.length - 1) {
        const nextStep = BUILDER_STEPS[currentIndex + 1]
        get().goToStep(nextStep)
      }
    },
    
    previousStep: () => {
      const { currentStep } = get()
      const currentIndex = BUILDER_STEPS.indexOf(currentStep)
      if (currentIndex > 0) {
        const prevStep = BUILDER_STEPS[currentIndex - 1]
        get().goToStep(prevStep)
      }
    },
    
    // Build management
    createNewBuild: (name) => {
      set((state) => {
        state.currentBuild = createDefaultBuilder(name)
        state.isDirty = false
        state.currentStep = 'basic-info'
        updateNavigationState(state)
      })
    },
    
    loadFromBuildConfiguration: (build: BuildConfiguration) => {
      set((state) => {
        // Convert BuildConfiguration to CharacterBuilder
        const characterBuilder: CharacterBuilder = {
          ...build,
          currentStep: 'summary', // Start at summary for existing builds
          completedSteps: BUILDER_STEPS.slice(0, -1), // Mark all but summary complete
          abilityAssignmentMethod: build.abilityMethod as AbilityAssignmentMethod,
          pointBuyConfig: { ...DEFAULT_POINT_BUY_CONFIG, totalPoints: build.pointBuyLimit },
          enhancedLevelTimeline: build.levelTimeline.map(entry => ({
            ...entry,
            isCompleted: true,
            validationErrors: []
          })),
          maxLevel: 20,
          isValid: true,
          validationErrors: []
        }
        
        state.currentBuild = characterBuilder
        state.isDirty = false
        state.currentStep = 'summary'
        updateNavigationState(state)
      })
    },
    
    exportToBuildConfiguration: (): BuildConfiguration | null => {
      const { currentBuild } = get()
      if (!currentBuild) return null
      
      // Convert CharacterBuilder back to BuildConfiguration
      return {
        id: currentBuild.id,
        name: currentBuild.name,
        createdAt: currentBuild.createdAt,
        updatedAt: new Date(),
        notes: currentBuild.notes,
        race: currentBuild.race,
        background: currentBuild.background,
        abilityMethod: currentBuild.abilityAssignmentMethod as any,
        abilityScores: currentBuild.finalAbilityScores || currentBuild.abilityScores,
        pointBuyLimit: currentBuild.pointBuyConfig.totalPoints,
        levelTimeline: currentBuild.enhancedLevelTimeline.map(entry => ({
          level: entry.level,
          classId: entry.classId,
          subclassId: entry.subclassId,
          features: entry.features,
          asiOrFeat: entry.asiOrFeat,
          featId: entry.featId,
          abilityIncreases: entry.abilityIncreases,
          notes: entry.notes
        })),
        currentLevel: currentBuild.currentLevel,
        mainHandWeapon: currentBuild.selectedMainHand,
        offHandWeapon: currentBuild.selectedOffHand,
        rangedWeapon: currentBuild.selectedRanged,
        weaponEnhancements: currentBuild.weaponEnhancements,
        activeBuffs: currentBuild.activeBuffs,
        round0Buffs: currentBuild.round0Buffs
      }
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
    
    // Ability score actions
    setAbilityAssignmentMethod: (method: AbilityAssignmentMethod) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.abilityAssignmentMethod = method
          state.currentBuild.abilityMethod = method as any
          state.isDirty = true
          validateStep(state, 'ability-scores')
        }
      })
    },
    
    setAbilityScore: (ability: AbilityScore, value: number) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.abilityScores[ability] = value
          state.isDirty = true
          validateStep(state, 'ability-scores')
        }
      })
    },
    
    setPointBuyConfig: (config: PointBuyConfig) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.pointBuyConfig = config
          state.currentBuild.pointBuyLimit = config.totalPoints
          state.isDirty = true
          validateStep(state, 'ability-scores')
        }
      })
    },
    
    resetAbilityScores: () => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.abilityScores = { ...DEFAULT_ABILITY_SCORES }
          state.isDirty = true
          validateStep(state, 'ability-scores')
        }
      })
    },
    
    // Race & Background actions
    setRace: (raceId: string) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.race = raceId
          state.isDirty = true
          validateStep(state, 'race-background')
        }
      })
    },
    
    setBackground: (backgroundId: string) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.background = backgroundId
          state.isDirty = true
          validateStep(state, 'race-background')
        }
      })
    },
    
    // Level progression actions
    addLevel: (classId: string, level: number) => {
      set((state) => {
        if (state.currentBuild) {
          const newEntry: BuilderLevelEntry = {
            level,
            classId,
            features: [],
            isCompleted: false,
            validationErrors: []
          }
          
          state.currentBuild.enhancedLevelTimeline.push(newEntry)
          state.currentBuild.enhancedLevelTimeline.sort((a, b) => a.level - b.level)
          
          // Update legacy levelTimeline for compatibility
          state.currentBuild.levelTimeline = state.currentBuild.enhancedLevelTimeline.map(entry => ({
            level: entry.level,
            classId: entry.classId,
            subclassId: entry.subclassId,
            features: entry.features,
            asiOrFeat: entry.asiOrFeat,
            featId: entry.featId,
            abilityIncreases: entry.abilityIncreases,
            notes: entry.notes
          }))
          
          state.currentBuild.currentLevel = Math.max(state.currentBuild.currentLevel, level)
          state.isDirty = true
          validateStep(state, 'class-progression')
        }
      })
    },
    
    updateLevel: (level: number, updates: Partial<BuilderLevelEntry>) => {
      set((state) => {
        if (state.currentBuild) {
          const entry = state.currentBuild.enhancedLevelTimeline.find(e => e.level === level)
          if (entry) {
            Object.assign(entry, updates)
            
            // Update legacy levelTimeline
            const legacyEntry = state.currentBuild.levelTimeline.find(e => e.level === level)
            if (legacyEntry) {
              Object.assign(legacyEntry, {
                level: entry.level,
                classId: entry.classId,
                subclassId: entry.subclassId,
                features: entry.features,
                asiOrFeat: entry.asiOrFeat,
                featId: entry.featId,
                abilityIncreases: entry.abilityIncreases,
                notes: entry.notes
              })
            }
            
            state.isDirty = true
            validateStep(state, 'class-progression')
          }
        }
      })
    },
    
    removeLevel: (level: number) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.enhancedLevelTimeline = state.currentBuild.enhancedLevelTimeline.filter(
            e => e.level !== level
          )
          state.currentBuild.levelTimeline = state.currentBuild.levelTimeline.filter(
            e => e.level !== level
          )
          state.isDirty = true
          validateStep(state, 'class-progression')
        }
      })
    },
    
    setSubclass: (level: number, subclassId: string) => {
      get().updateLevel(level, { subclassId })
    },
    
    selectFeat: (level: number, featId: string) => {
      get().updateLevel(level, { asiOrFeat: 'feat', featId })
    },
    
    selectASI: (level: number, abilityIncreases: Partial<AbilityScoreArray>) => {
      get().updateLevel(level, { asiOrFeat: 'asi', abilityIncreases })
    },
    
    // Equipment actions
    setMainHandWeapon: (weaponId: string) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.selectedMainHand = weaponId
          state.currentBuild.mainHandWeapon = weaponId
          state.isDirty = true
          validateStep(state, 'equipment')
        }
      })
    },
    
    setOffHandWeapon: (weaponId: string) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.selectedOffHand = weaponId
          state.currentBuild.offHandWeapon = weaponId
          state.isDirty = true
          validateStep(state, 'equipment')
        }
      })
    },
    
    setRangedWeapon: (weaponId: string) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.selectedRanged = weaponId
          state.currentBuild.rangedWeapon = weaponId
          state.isDirty = true
          validateStep(state, 'equipment')
        }
      })
    },
    
    setArmor: (armorId: string) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.selectedArmor = armorId
          state.isDirty = true
          validateStep(state, 'equipment')
        }
      })
    },
    
    toggleShield: () => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.hasShield = !state.currentBuild.hasShield
          state.isDirty = true
          validateStep(state, 'equipment')
        }
      })
    },
    
    addWeaponEnhancement: (enhancementId: string) => {
      set((state) => {
        if (state.currentBuild && !state.currentBuild.weaponEnhancements.includes(enhancementId)) {
          state.currentBuild.weaponEnhancements.push(enhancementId)
          state.isDirty = true
          validateStep(state, 'equipment')
        }
      })
    },
    
    removeWeaponEnhancement: (enhancementId: string) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.weaponEnhancements = state.currentBuild.weaponEnhancements.filter(
            id => id !== enhancementId
          )
          state.isDirty = true
          validateStep(state, 'equipment')
        }
      })
    },
    
    // Validation actions
    validateCurrentStep: () => {
      const { currentStep } = get()
      let isValid = false
      
      set((state) => {
        isValid = validateStep(state, currentStep)
        updateNavigationState(state)
      })
      
      return isValid
    },
    
    validateAllSteps: () => {
      let allValid = true
      
      set((state) => {
        for (const step of BUILDER_STEPS) {
          const stepValid = validateStep(state, step)
          if (!stepValid) allValid = false
        }
        
        if (state.currentBuild) {
          state.currentBuild.isValid = allValid
        }
        
        updateNavigationState(state)
      })
      
      return allValid
    },
    
    getStepErrors: (_step: BuilderStep) => {
      // TODO: Implement detailed error collection
      return []
    },
    
    // Utility actions
    resetBuild: () => {
      set((state) => {
        state.currentBuild = null
        state.isDirty = false
        state.currentStep = 'basic-info'
        state.stepValidation = {
          'basic-info': false,
          'ability-scores': false,
          'race-background': false,
          'class-progression': false,
          'equipment': false,
          'summary': false
        }
        updateNavigationState(state)
      })
    },
    
    markDirty: () => {
      set((state) => {
        state.isDirty = true
      })
    },
    
    clearDirty: () => {
      set((state) => {
        state.isDirty = false
      })
    }
  }))
)

// Helper functions
function updateNavigationState(state: any) {
  const currentIndex = BUILDER_STEPS.indexOf(state.currentStep)
  state.canGoBack = currentIndex > 0
  state.canProceed = currentIndex < BUILDER_STEPS.length - 1 && state.stepValidation[state.currentStep]
}

function validateStep(state: any, step: BuilderStep): boolean {
  if (!state.currentBuild) {
    state.stepValidation[step] = false
    return false
  }
  
  let isValid = false
  
  switch (step) {
    case 'basic-info':
      isValid = validateBasicInfo(state.currentBuild)
      break
    case 'ability-scores':
      isValid = validateAbilityScores(state.currentBuild)
      break
    case 'race-background':
      isValid = validateRaceBackground(state.currentBuild)
      break
    case 'class-progression':
      isValid = validateClassProgression(state.currentBuild)
      break
    case 'equipment':
      isValid = validateEquipment(state.currentBuild)
      break
    case 'summary':
      isValid = true // Summary is always valid if we got here
      break
  }
  
  state.stepValidation[step] = isValid
  return isValid
}

function validateBasicInfo(build: CharacterBuilder): boolean {
  // Build name is required, notes are optional
  return !!build.name && build.name.trim().length > 0
}

function validateAbilityScores(build: CharacterBuilder): boolean {
  const scores = Object.values(build.abilityScores)
  const scoresValid = scores.every(score => score >= 8 && score <= 20)
  
  if (!scoresValid) return false
  
  // Method-specific validation
  if (build.abilityAssignmentMethod === 'pointbuy') {
    // For point buy, all 27 points must be spent
    const pointCosts = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 }
    const totalUsed = scores.reduce((sum, score) => sum + (pointCosts[score as keyof typeof pointCosts] || 0), 0)
    return totalUsed === 27
  } else if (build.abilityAssignmentMethod === 'standard') {
    // For standard array, all values (15,14,13,12,10,8) must be used exactly once
    const standardArray = [15, 14, 13, 12, 10, 8]
    const sortedScores = [...scores].sort((a, b) => b - a)
    const sortedStandard = [...standardArray].sort((a, b) => b - a)
    return JSON.stringify(sortedScores) === JSON.stringify(sortedStandard)
  } else {
    // For custom/manual, just check bounds (already done above)
    return true
  }
}

function validateRaceBackground(build: CharacterBuilder): boolean {
  // Race is required, background is optional
  return !!build.race
}

function validateClassProgression(build: CharacterBuilder): boolean {
  // Must have at least level 1
  return build.enhancedLevelTimeline.length > 0
}

function validateEquipment(_build: CharacterBuilder): boolean {
  // Equipment is optional but should be valid if present
  return true // For now, accept any equipment state
}