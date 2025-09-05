import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { useSettingsStore } from './settingsStore'
import type { 
  CharacterBuilder, 
  CharacterBuilderState, 
  BuilderStep, 
  AbilityAssignmentMethod,
  BuilderLevelEntry,
  PointBuyConfig
} from '../types/character'
import type { DowntimeTrainingSession, WeaponTrainingEntry } from '../types/downtimeTraining'
import type { LevelEntry } from '../stores/types'
import {
  DEFAULT_POINT_BUY_CONFIG,
  DEFAULT_ABILITY_SCORES,
  BUILDER_STEPS
} from '../types/character'
import type { BuildConfiguration } from '../stores/types'
import type { AbilityScore, AbilityScoreArray } from '../rules/types'
import { getClass, getSubclass } from '../rules/loaders'

interface CharacterBuilderStore extends CharacterBuilderState {
  // Navigation actions
  goToStep: (step: BuilderStep) => void
  nextStep: () => void
  previousStep: () => void
  
  // Build management
  createNewBuild: (name?: string) => void
  loadBuild: (build: BuildConfiguration) => void
  loadFromBuildConfiguration: (build: BuildConfiguration) => void
  exportToBuildConfiguration: () => BuildConfiguration | null
  updateBuild: (updates: Partial<CharacterBuilder>) => void
  saveBuild: () => void
  
  // Ability score actions
  setAbilityAssignmentMethod: (method: AbilityAssignmentMethod) => void
  setAbilityScore: (ability: AbilityScore, value: number) => void
  setPointBuyConfig: (config: PointBuyConfig) => void
  resetAbilityScores: () => void
  recalculateAllAbilityScores: () => void
  triggerRacialBonusRecalculation: () => void
  
  // Race & Background actions
  setRace: (raceId: string) => void
  setSubrace: (subraceId: string) => void
  setBackground: (backgroundId: string) => void
  updateAbilityScores: (scores: AbilityScoreArray) => void
  setSkillProficiencies: (skills: string[]) => void
  
  // Racial choice actions
  setVariantHumanFeat: (featId: string) => void
  setVariantHumanSkill: (skillId: string) => void
  setVariantHumanAbilities: (abilities: [string, string]) => void
  setHalfElfSkills: (skills: [string, string]) => void
  setHalfElfAbilities: (abilities: [string, string]) => void
  setDragonbornAncestry: (ancestry: string) => void
  setHighElfCantrip: (cantripId: string) => void
  
  // Level progression actions
  addLevel: (classId: string, level: number) => void
  updateLevel: (level: number, updates: Partial<BuilderLevelEntry>) => void
  updateLevelEntry: (level: number, classId: string, updates: LevelEntry) => void
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
  setWeaponEnhancementBonus: (bonus: number) => void
  setArmorEnhancementBonus: (bonus: number) => void
  
  // Buff actions
  toggleBuff: (buffId: string) => void
  setActiveBuffs: (buffIds: string[]) => void
  setRound0Buffs: (buffIds: string[]) => void
  clearAllBuffs: () => void
  
  // Downtime training actions
  addTrainingSession: (session: Omit<DowntimeTrainingSession, 'id' | 'createdAt'>) => DowntimeTrainingSession | null
  updateTrainingSession: (sessionId: string, updates: Partial<DowntimeTrainingSession>) => void
  removeTrainingSession: (sessionId: string) => void
  addWeaponTraining: (sessionId: string, weaponTraining: WeaponTrainingEntry) => void
  updateWeaponTraining: (sessionId: string, weaponType: string, updates: Partial<WeaponTrainingEntry>) => void
  removeWeaponTraining: (sessionId: string, weaponType: string) => void
  recomputeTrainingTotals: () => void
  
  // Validation actions
  validateCurrentStep: () => boolean
  validateAllSteps: () => boolean
  getStepErrors: (step: BuilderStep) => string[]
  
  // Utility actions
  resetBuild: () => void
  markDirty: () => void
  clearDirty: () => void
  
  // Utility functions to get all known items from all sources
  getAllKnownSpells: () => string[]
  getAllKnownFeats: () => string[]
  getAllKnownSkills: () => string[]
  
  // Utility functions to separate racial vs class progression spells
  getRacialSpells: () => string[]
  getClassProgressionSpells: () => string[]
}

// Helper function to get features for a level entry
function getFeaturesForLevel(classId: string, classLevel: number, totalLevel: number, subclassId?: string): string[] {
  const features: string[] = []
  
  try {
    // Get class data
    const classData = getClass(classId)
    if (classData?.features) {
      // Add class features for this total level
      const levelFeatures = classData.features[totalLevel] || []
      features.push(...levelFeatures.map(f => f.name))
    }
    
    // Add subclass features if subclass is selected
    if (subclassId) {
      const subclassData = getSubclass(subclassId)
      if (subclassData?.features && Array.isArray(subclassData.features)) {
        // Add subclass features for this class level (not total level)
        const subclassFeatures = subclassData.features.filter((f) => f.level === classLevel)
        features.push(...subclassFeatures.map((f) => f.name))
      }
    }
  } catch (error) {
    console.error('Error getting features for level:', error)
  }
  
  return features
}

const createDefaultBuilder = (name: string = 'New Character'): CharacterBuilder => {
  // Get default settings from settings store
  // First try to get from store state, then check localStorage as fallback
  let settings = useSettingsStore.getState()
  
  // If settings haven't been initialized yet, try to load from localStorage
  if (!settings.defaultPointBuyLimit || settings.defaultPointBuyLimit === 27) {
    try {
      const storedSettings = localStorage.getItem('destinyLedgerSettings')
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings)
        if (parsedSettings.defaultPointBuyLimit) {
          settings = { ...settings, ...parsedSettings }
        }
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error)
    }
  }
  
  const abilityMethod = settings.defaultAbilityMethod || 'pointbuy'
  const pointBuyLimit = settings.defaultPointBuyLimit || 27
  
  console.log('Creating new build with settings:', {
    abilityMethod,
    pointBuyLimit,
    settingsState: settings
  })
  
  return {
    // Base BuildConfiguration fields
    id: crypto.randomUUID(),
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: '',
    race: '',
    subrace: '',
    background: '',
    baseAbilityScores: { ...DEFAULT_ABILITY_SCORES },
    skillProficiencies: [],
    abilityMethod: abilityMethod as AbilityAssignmentMethod,
    abilityScores: { ...DEFAULT_ABILITY_SCORES },
    pointBuyLimit: pointBuyLimit,
    levelTimeline: [],
    currentLevel: 1,
    mainHandWeapon: '',
    offHandWeapon: '',
    rangedWeapon: '',
    weaponEnhancements: [],
    magicItems: [],
    attunedItems: [],
    weaponEnhancementBonus: 0,
    armorEnhancementBonus: 0,
    activeBuffs: [],
    round0Buffs: [],
    
    // Downtime training (optional for campaigns)
    downtimeTraining: {
      sessions: [],
      trainedFeats: [],
      abilityTraining: {},
      trainedSkillProficiencies: [],
      trainedSkillExpertise: [],
      weaponTraining: {}
    },
    
    // Equipment interface compatibility
    equipment: {
      mainHand: null,
      offHand: null,
      armor: null,
      shield: false,
      other: [],
      magicItems: [],
      attunedItems: []
    },
    
    // Extended CharacterBuilder fields
    currentStep: 'ability-scores',
    completedSteps: [],
    abilityAssignmentMethod: abilityMethod as AbilityAssignmentMethod,
    pointBuyConfig: { 
      ...DEFAULT_POINT_BUY_CONFIG,
      totalPoints: pointBuyLimit
    },
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
  }
}

export const useCharacterBuilderStore = create<CharacterBuilderStore>()(
  immer((set, get) => ({
    // Initial state
    currentBuild: null,
    isDirty: false,
    isLoading: false,
    currentStep: 'ability-scores',
    canProceed: false,
    canGoBack: false,
    stepValidation: {
      'ability-scores': false,
      'race-background': false,
      'class-progression': false,
      'equipment': false,
      'downtime-training': false,
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
        state.currentStep = 'ability-scores'
        updateNavigationState(state)
      })
    },
    
    loadFromBuildConfiguration: (build: BuildConfiguration) => {
      set((state) => {
        try {
          console.log('Loading build configuration:', build.name, 'ID:', build.id)
          
          // Convert BuildConfiguration to CharacterBuilder with defensive programming
          const characterBuilder: CharacterBuilder = {
            // Core build data with fallbacks
            id: build.id || crypto.randomUUID(),
            name: build.name || 'Unnamed Build',
            createdAt: build.createdAt || new Date(),
            updatedAt: build.updatedAt || new Date(),
            notes: build.notes || '',
            tags: build.tags || [],
            
            // Character basics with fallbacks
            race: build.race || '',
            subrace: build.subrace || '',
            background: build.background || '',
            baseAbilityScores: build.baseAbilityScores || { ...DEFAULT_ABILITY_SCORES },
            skillProficiencies: build.skillProficiencies || [],
            
            // Ability scores with validation
            abilityMethod: build.abilityMethod || 'pointbuy',
            // abilityScores holds the final scores (with racial bonuses)
            abilityScores: build.abilityScores || { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 },
            pointBuyLimit: build.pointBuyLimit || 27,
            
            // Level progression with validation
            levelTimeline: build.levelTimeline || [],
            currentLevel: build.currentLevel || 1,
            
            // Builder-specific fields
            currentStep: 'summary', // Start at summary for existing builds
            completedSteps: [], // Will be validated after load
            abilityAssignmentMethod: (build.abilityMethod || 'pointbuy') as AbilityAssignmentMethod,
            pointBuyConfig: { ...DEFAULT_POINT_BUY_CONFIG, totalPoints: build.pointBuyLimit || 27 },
            finalAbilityScores: build.abilityScores ? { ...build.abilityScores } : { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 },
            racialBonuses: {},
            
            // Restore equipment selections with defaults for legacy builds
            selectedMainHand: build.mainHandWeapon,
            selectedOffHand: build.offHandWeapon,
            selectedRanged: build.rangedWeapon,
            selectedArmor: build.armor,
            hasShield: build.shield || false,
            weaponEnhancements: build.weaponEnhancements || [],
            magicItems: build.magicItems || [],
            attunedItems: build.attunedItems || [],
            weaponEnhancementBonus: build.weaponEnhancementBonus || 0,
            armorEnhancementBonus: build.armorEnhancementBonus || 0,
            mainHandWeapon: build.mainHandWeapon || '',
            offHandWeapon: build.offHandWeapon || '',
            rangedWeapon: build.rangedWeapon || '',
            
            // Equipment interface for magic items
            equipment: {
              mainHand: build.mainHandWeapon || null,
              offHand: build.offHandWeapon || null,
              armor: build.armor || null,
              shield: build.shield || false,
              other: build.weaponEnhancements || [],
              magicItems: build.magicItems || [],
              attunedItems: build.attunedItems || []
            },
            
            // Buffs with defaults
            activeBuffs: build.activeBuffs || [],
            round0Buffs: build.round0Buffs || [],
            
            // Downtime training with defaults for legacy builds
            downtimeTraining: build.downtimeTraining || {
              sessions: [],
              trainedFeats: [],
              abilityTraining: {},
              trainedSkillProficiencies: [],
              trainedSkillExpertise: [],
              weaponTraining: {}
            },
            
            // Load racial choices
            variantHumanFeat: build.variantHumanFeat,
            variantHumanSkill: build.variantHumanSkill,
            variantHumanAbilities: build.variantHumanAbilities,
            halfElfSkills: build.halfElfSkills,
            halfElfAbilities: build.halfElfAbilities,
            dragonbornAncestry: build.dragonbornAncestry,
            highElfCantrip: build.highElfCantrip,
            
            // Ensure level timeline exists and is valid
            enhancedLevelTimeline: (build.levelTimeline || []).map(entry => ({
              ...entry,
              features: entry.features || [],
              isCompleted: true,
              validationErrors: [],
              fightingStyle: entry.fightingStyle,
              archetype: entry.archetype
            })),
            
            // Builder state
            maxLevel: 20,
            isValid: true,
            validationErrors: []
          }
          
          console.log('Successfully created character builder:', characterBuilder.name)
          console.log('Enhanced level timeline length:', characterBuilder.enhancedLevelTimeline?.length || 0)
          
          state.currentBuild = characterBuilder
          state.isDirty = false
          state.currentStep = 'summary'
          
          // Re-validate all steps after loading to ensure proper completion state
          for (const step of BUILDER_STEPS) {
            validateStep(state, step)
          }
          
          updateNavigationState(state)
          
          console.log('Build loaded successfully')
        } catch (error) {
          console.error('Error loading build configuration:', error)
          console.error('Build data that failed to load:', build)
          throw error
        }
      })
      
      // Ensure downtime training totals are computed after loading (outside of set callback)
      get().recomputeTrainingTotals()
    },
    
    exportToBuildConfiguration: (): BuildConfiguration | null => {
      const { currentBuild } = get()
      if (!currentBuild) return null
      
      // Ensure downtime training totals are up to date
      get().recomputeTrainingTotals()
      
      // Convert CharacterBuilder back to BuildConfiguration
      return {
        id: currentBuild.id,
        name: currentBuild.name,
        createdAt: currentBuild.createdAt,
        updatedAt: new Date(),
        notes: currentBuild.notes,
        race: currentBuild.race,
        subrace: currentBuild.subrace,
        background: currentBuild.background,
        baseAbilityScores: currentBuild.baseAbilityScores,
        skillProficiencies: currentBuild.skillProficiencies,
        abilityMethod: currentBuild.abilityAssignmentMethod as AbilityAssignmentMethod,
        abilityScores: currentBuild.finalAbilityScores || currentBuild.abilityScores,
        pointBuyLimit: currentBuild.pointBuyConfig.totalPoints,
        levelTimeline: (currentBuild.enhancedLevelTimeline || []).map(entry => ({
          level: entry.level,
          classId: entry.classId,
          subclassId: entry.subclassId,
          features: entry.features,
          asiOrFeat: entry.asiOrFeat,
          featId: entry.featId,
          abilityIncreases: entry.abilityIncreases,
          notes: entry.notes,
          fightingStyle: entry.fightingStyle,
          archetype: entry.archetype,
          // Include all choice-based class features
          expertiseChoices: entry.expertiseChoices,
          maneuverChoices: entry.maneuverChoices,
          metamagicChoices: entry.metamagicChoices,
          eldritchInvocationChoices: entry.eldritchInvocationChoices,
          mysticArcanumChoices: entry.mysticArcanumChoices,
          pactBoonChoice: entry.pactBoonChoice,
          favoredEnemyChoice: entry.favoredEnemyChoice,
          naturalExplorerChoice: entry.naturalExplorerChoice,
          spellChoices: entry.spellChoices
        })),
        currentLevel: currentBuild.currentLevel,
        mainHandWeapon: currentBuild.selectedMainHand,
        offHandWeapon: currentBuild.selectedOffHand,
        rangedWeapon: currentBuild.selectedRanged,
        armor: currentBuild.selectedArmor,
        shield: currentBuild.hasShield,
        weaponEnhancements: currentBuild.weaponEnhancements,
        weaponEnhancementBonus: currentBuild.weaponEnhancementBonus || 0,
        armorEnhancementBonus: currentBuild.armorEnhancementBonus || 0,
        magicItems: currentBuild.equipment?.magicItems || currentBuild.magicItems || [],
        attunedItems: currentBuild.equipment?.attunedItems || currentBuild.attunedItems || [],
        activeBuffs: currentBuild.activeBuffs,
        round0Buffs: currentBuild.round0Buffs,
        downtimeTraining: currentBuild.downtimeTraining,
        // Include all racial choices
        variantHumanFeat: currentBuild.variantHumanFeat,
        variantHumanSkill: currentBuild.variantHumanSkill,
        variantHumanAbilities: currentBuild.variantHumanAbilities,
        halfElfSkills: currentBuild.halfElfSkills,
        halfElfAbilities: currentBuild.halfElfAbilities,
        dragonbornAncestry: currentBuild.dragonbornAncestry,
        highElfCantrip: currentBuild.highElfCantrip
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
    
    loadBuild: (build) => {
      get().loadFromBuildConfiguration(build)
    },
    
    saveBuild: async () => {
      const buildConfig = get().exportToBuildConfiguration()
      if (buildConfig) {
        // Import vault store to save the build
        const { useVaultStore } = await import('./vaultStore')
        const { addBuild, updateBuild } = useVaultStore.getState()
        
        // Check if build exists (update) or is new (add)
        const existingBuild = useVaultStore.getState().builds.find((b) => b.id === buildConfig.id)
        if (existingBuild) {
          updateBuild(buildConfig.id, buildConfig)
        } else {
          addBuild(buildConfig)
        }
        
        // Mark as no longer dirty
        get().clearDirty()
      }
    },
    
    // Ability score actions
    setAbilityAssignmentMethod: (method: AbilityAssignmentMethod) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.abilityAssignmentMethod = method
          state.currentBuild.abilityMethod = method as AbilityAssignmentMethod
          state.isDirty = true
          validateStep(state, 'ability-scores')
        }
      })
    },
    
    setAbilityScore: (ability: AbilityScore, value: number) => {
      set((state) => {
        if (state.currentBuild) {
          // Always update base scores (without racial bonuses)
          if (!state.currentBuild.baseAbilityScores) {
            state.currentBuild.baseAbilityScores = { ...DEFAULT_ABILITY_SCORES }
          }
          state.currentBuild.baseAbilityScores[ability] = value
          
          state.isDirty = true
          validateStep(state, 'ability-scores')
        }
      })
      
      // Trigger full recalculation to apply racial bonuses and ASIs
      get().recalculateAllAbilityScores()
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
          // Clear racial bonuses when race changes to force recalculation
          state.currentBuild.racialBonuses = {}
          state.isDirty = true
          validateStep(state, 'race-background')
        }
      })
    },
    
    setSubrace: (subraceId: string) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.subrace = subraceId
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
    
    updateAbilityScores: (scores: AbilityScoreArray) => {
      set((state) => {
        if (state.currentBuild) {
          // Calculate and store the racial bonuses for future ASI calculations
          if (state.currentBuild.baseAbilityScores) {
            const racialBonuses: Partial<AbilityScoreArray> = {}
            Object.keys(scores).forEach(key => {
              const ability = key as keyof AbilityScoreArray
              const bonus = scores[ability] - (state.currentBuild!.baseAbilityScores![ability] || 8)
              // Store all racial bonuses, including negative ones
              if (bonus !== 0) {
                racialBonuses[ability] = bonus
              }
            })
            state.currentBuild.racialBonuses = racialBonuses
            console.log('Storing racial bonuses:', racialBonuses)
          }
          
          state.isDirty = true
          validateStep(state, 'ability-scores')
        }
      })
      
      // Recalculate all ability scores after updating racial bonuses
      // This needs to be outside the set() to avoid race conditions
      get().recalculateAllAbilityScores()
    },

    // Helper function to recalculate all ability scores including ASI increases
    recalculateAllAbilityScores: () => {
      set((state) => {
        if (state.currentBuild) {
          // Start with base ability scores  
          const finalScores: AbilityScoreArray = { 
            STR: state.currentBuild.baseAbilityScores?.STR || 8,
            DEX: state.currentBuild.baseAbilityScores?.DEX || 8,
            CON: state.currentBuild.baseAbilityScores?.CON || 8,
            INT: state.currentBuild.baseAbilityScores?.INT || 8,
            WIS: state.currentBuild.baseAbilityScores?.WIS || 8,
            CHA: state.currentBuild.baseAbilityScores?.CHA || 8
          }
          
          // Add racial bonuses (if any)
          if (state.currentBuild.racialBonuses) {
            Object.entries(state.currentBuild.racialBonuses).forEach(([ability, bonus]) => {
              if (bonus && typeof bonus === 'number') {
                finalScores[ability as keyof AbilityScoreArray] += bonus
              }
            })
          }
          
          // Add racial choice bonuses
          // Variant Human: Two different +1s of choice
          if (state.currentBuild.race === 'variant_human' && state.currentBuild.variantHumanAbilities) {
            const [ability1, ability2] = state.currentBuild.variantHumanAbilities
            finalScores[ability1 as keyof AbilityScoreArray] += 1
            finalScores[ability2 as keyof AbilityScoreArray] += 1
          }
          
          // Half-Elf: +2 CHA + two different +1s of choice
          if (state.currentBuild.race === 'half_elf') {
            finalScores.CHA += 2 // Fixed +2 CHA for Half-Elf
            if (state.currentBuild.halfElfAbilities) {
              const [ability1, ability2] = state.currentBuild.halfElfAbilities
              finalScores[ability1 as keyof AbilityScoreArray] += 1
              finalScores[ability2 as keyof AbilityScoreArray] += 1
            }
          }
          
          // Add ASI increases from all level progression (both regular ASIs and half-feats)
          (state.currentBuild.enhancedLevelTimeline || []).forEach(entry => {
            if (entry.abilityIncreases) {
              Object.entries(entry.abilityIncreases).forEach(([ability, increase]) => {
                if (increase && typeof increase === 'number') {
                  finalScores[ability as keyof AbilityScoreArray] += increase
                }
              })
            }
          })
          
          // Add downtime training bonuses (can exceed 20)
          if (state.currentBuild.downtimeTraining?.abilityTraining) {
            Object.entries(state.currentBuild.downtimeTraining.abilityTraining).forEach(([ability, trainingBonus]) => {
              if (trainingBonus && typeof trainingBonus === 'number') {
                finalScores[ability as keyof AbilityScoreArray] += trainingBonus
              }
            })
          }
          
          // Update final ability scores
          state.currentBuild.finalAbilityScores = finalScores
          state.currentBuild.abilityScores = finalScores // Keep legacy sync
          
          console.log('Recalculated all ability scores:', finalScores)
          console.log('Base scores:', state.currentBuild.baseAbilityScores)
          console.log('ASI/Half-feat entries found:', (state.currentBuild.enhancedLevelTimeline || []).filter(e => e.abilityIncreases).map(e => ({ 
            level: e.level, 
            type: e.asiOrFeat, 
            featId: e.featId,
            increases: e.abilityIncreases 
          })))
        }
      })
    },

    // Trigger racial bonus recalculation (for components to call when needed)
    triggerRacialBonusRecalculation: () => {
      // Force a recalculation of all ability scores
      // This is useful when race/subrace changes or other conditions require a refresh
      get().recalculateAllAbilityScores()
    },
    
    setSkillProficiencies: (skills: string[]) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.skillProficiencies = skills
          state.isDirty = true
        }
      })
    },
    
    // Racial choice actions
    setVariantHumanFeat: (featId: string) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.variantHumanFeat = featId
          state.isDirty = true
          validateStep(state, 'race-background')
        }
      })
    },
    
    setVariantHumanSkill: (skillId: string) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.variantHumanSkill = skillId
          state.isDirty = true
          validateStep(state, 'race-background')
        }
      })
    },
    
    setVariantHumanAbilities: (abilities: [string, string]) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.variantHumanAbilities = abilities
          state.isDirty = true
          validateStep(state, 'race-background')
        }
      })
      
      // Recalculate ability scores with new racial bonuses
      get().recalculateAllAbilityScores()
    },
    
    setHalfElfSkills: (skills: [string, string]) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.halfElfSkills = skills
          state.isDirty = true
          validateStep(state, 'race-background')
        }
      })
    },
    
    setHalfElfAbilities: (abilities: [string, string]) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.halfElfAbilities = abilities
          state.isDirty = true
          validateStep(state, 'race-background')
        }
      })
      
      // Recalculate ability scores with new racial bonuses
      get().recalculateAllAbilityScores()
    },
    
    setDragonbornAncestry: (ancestry: string) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.dragonbornAncestry = ancestry
          state.isDirty = true
          validateStep(state, 'race-background')
        }
      })
    },
    
    setHighElfCantrip: (cantripId: string) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.highElfCantrip = cantripId
          state.isDirty = true
          validateStep(state, 'race-background')
        }
      })
    },
    
    // Level progression actions
    addLevel: (classId: string, level: number) => {
      set((state) => {
        try {
          if (state.currentBuild) {
            console.log('Adding level:', level, 'class:', classId)
            
            // Ensure enhancedLevelTimeline exists
            if (!state.currentBuild.enhancedLevelTimeline) {
              state.currentBuild.enhancedLevelTimeline = []
            }
            
            // Calculate class level for this class
            const existingClassEntries = (state.currentBuild.enhancedLevelTimeline || [])
              .filter(e => e.classId === classId)
            const classLevel = existingClassEntries.length + 1
            
            // Inherit subclass from the most recent level of the same class
            const mostRecentClassEntry = existingClassEntries
              .sort((a, b) => b.level - a.level)[0] // Get the most recent entry
            const inheritedSubclassId = mostRecentClassEntry?.subclassId
            
            const newEntry: BuilderLevelEntry = {
              level,
              classId,
              subclassId: inheritedSubclassId,
              features: getFeaturesForLevel(classId, classLevel, level, inheritedSubclassId),
              isCompleted: false,
              validationErrors: []
            }
            
            if (!state.currentBuild.enhancedLevelTimeline) {
              state.currentBuild.enhancedLevelTimeline = []
            }
            state.currentBuild.enhancedLevelTimeline.push(newEntry)
            // Sort by creating a new array to avoid readonly property errors
            state.currentBuild.enhancedLevelTimeline = [...state.currentBuild.enhancedLevelTimeline].sort((a, b) => a.level - b.level)
            
            // Ensure legacy levelTimeline exists for compatibility
            if (!state.currentBuild.levelTimeline) {
              state.currentBuild.levelTimeline = []
            }
            
            // Update legacy levelTimeline for compatibility
            state.currentBuild.levelTimeline = (state.currentBuild.enhancedLevelTimeline || []).map(entry => ({
              level: entry.level,
              classId: entry.classId,
              subclassId: entry.subclassId,
              features: entry.features || [],
              asiOrFeat: entry.asiOrFeat,
              featId: entry.featId,
              abilityIncreases: entry.abilityIncreases,
              notes: entry.notes,
              fightingStyle: entry.fightingStyle,
              archetype: entry.archetype
            }))
            
            state.currentBuild.currentLevel = Math.max(state.currentBuild.currentLevel || 1, level)
            state.isDirty = true
            validateStep(state, 'class-progression')
            
            console.log('Successfully added level. Total levels:', state.currentBuild.enhancedLevelTimeline?.length || 0)
          }
        } catch (error) {
          console.error('Error in addLevel:', error)
          throw error
        }
      })
    },
    
    updateLevel: (level: number, updates: Partial<BuilderLevelEntry>) => {
      console.log('updateLevel called in store:', { level, updates })
      set((state) => {
        if (state.currentBuild) {
          const entry = (state.currentBuild.enhancedLevelTimeline || []).find(e => e.level === level)
          if (entry) {
            console.log('Found entry before update:', entry)
            
            // Check if subclassId is being updated
            const subclassChanged = updates.subclassId && updates.subclassId !== entry.subclassId
            
            Object.assign(entry, updates)
            console.log('Entry after update:', entry)
            
            // If subclass changed, refresh features for all levels of this class
            if (subclassChanged && updates.subclassId) {
              console.log('Subclass changed, refreshing features for all levels of class:', entry.classId)
              
              // Update all levels of the same class with the new subclass and features
              const samClassLevels = (state.currentBuild.enhancedLevelTimeline || [])
                .filter(e => e.classId === entry.classId)
              
              samClassLevels.forEach(classEntry => {
                // Calculate class level for this entry
                const classLevels = (state.currentBuild?.enhancedLevelTimeline || [])
                  .filter(e => e.classId === entry.classId && e.level <= classEntry.level)
                const classLevel = classLevels.length
                
                classEntry.subclassId = updates.subclassId
                classEntry.features = getFeaturesForLevel(entry.classId, classLevel, classEntry.level, updates.subclassId)
              })
            }
            
            // Update legacy levelTimeline
            const legacyEntry = state.currentBuild.levelTimeline.find(e => e.level === level)
            if (legacyEntry) {
              console.log('Updating legacy entry from:', legacyEntry)
              Object.assign(legacyEntry, {
                level: entry.level,
                classId: entry.classId,
                subclassId: entry.subclassId,
                features: entry.features,
                asiOrFeat: entry.asiOrFeat,
                featId: entry.featId,
                abilityIncreases: entry.abilityIncreases,
                notes: entry.notes,
                // Include new fields for fighting styles and archetypes
                ...(entry.fightingStyle && { fightingStyle: entry.fightingStyle }),
                ...(entry.archetype && { archetype: entry.archetype }),
                // Include all the choice-based class features
                ...(entry.expertiseChoices && { expertiseChoices: entry.expertiseChoices }),
                ...(entry.maneuverChoices && { maneuverChoices: entry.maneuverChoices }),
                ...(entry.metamagicChoices && { metamagicChoices: entry.metamagicChoices }),
                ...(entry.eldritchInvocationChoices && { eldritchInvocationChoices: entry.eldritchInvocationChoices }),
                ...(entry.mysticArcanumChoices && { mysticArcanumChoices: entry.mysticArcanumChoices }),
                ...(entry.pactBoonChoice && { pactBoonChoice: entry.pactBoonChoice }),
                ...(entry.favoredEnemyChoice && { favoredEnemyChoice: entry.favoredEnemyChoice }),
                ...(entry.naturalExplorerChoice && { naturalExplorerChoice: entry.naturalExplorerChoice }),
                ...(entry.spellChoices && { spellChoices: entry.spellChoices })
              })
              console.log('Legacy entry after update:', legacyEntry)
            } else {
              console.log('No legacy entry found for level:', level)
            }
            
            state.isDirty = true
            validateStep(state, 'class-progression')
          } else {
            console.log('No entry found for level:', level)
          }
        } else {
          console.log('No current build found')
        }
      })
      
      // Recalculate all ability scores if ASI changes were made
      if (updates.abilityIncreases || updates.asiOrFeat) {
        const { recalculateAllAbilityScores } = get()
        recalculateAllAbilityScores()
      }
    },
    
    removeLevel: (level: number) => {
      set((state) => {
        if (!state.currentBuild) return
        
        const currentLevels = state.currentBuild.enhancedLevelTimeline || []
        
        // Safety check: Only allow removing the highest level to prevent gaps
        const maxLevel = Math.max(...currentLevels.map(e => e.level), 0)
        if (level !== maxLevel) {
          console.warn(`Cannot remove level ${level}. Can only remove highest level (${maxLevel}) to prevent gaps.`)
          return
        }
        
        // Safety check: Don't allow removing level 1 if it's the only level
        if (level === 1 && currentLevels.length === 1) {
          console.warn('Cannot remove the only remaining level.')
          return
        }
        
        console.log(`Removing level ${level}`)
        
        // Remove from both timelines
        state.currentBuild.enhancedLevelTimeline = currentLevels.filter(e => e.level !== level)
        state.currentBuild.levelTimeline = (state.currentBuild.levelTimeline || []).filter(e => e.level !== level)
        
        // Clean up any dependent choices that might reference the removed level
        // Note: We don't need to clean up archetype choices from earlier levels
        // since those are still valid for the class levels that remain
        
        state.isDirty = true
        validateStep(state, 'class-progression')
        
        console.log(`Level ${level} removed successfully. Remaining levels:`, 
          (state.currentBuild.enhancedLevelTimeline || []).map(e => `L${e.level} ${e.classId}`))
      })
    },
    
    setSubclass: (level: number, subclassId: string) => {
      set((state) => {
        if (state.currentBuild) {
          const entry = (state.currentBuild.enhancedLevelTimeline || []).find(e => e.level === level)
          if (entry) {
            // Update subclass
            entry.subclassId = subclassId
            
            // Calculate class level for this class  
            const classLevels = (state.currentBuild.enhancedLevelTimeline || [])
              .filter(e => e.classId === entry.classId && e.level <= level)
            const classLevel = classLevels.length
            
            // Refresh features with new subclass
            entry.features = getFeaturesForLevel(entry.classId, classLevel, level, subclassId)
            
            // Also update any future levels of the same class that might need subclass features
            const futureLevels = (state.currentBuild.enhancedLevelTimeline || [])
              .filter(e => e.classId === entry.classId && e.level > level)
            
            futureLevels.forEach(futureEntry => {
              const futureClassLevels = (state.currentBuild?.enhancedLevelTimeline || [])
                .filter(e => e.classId === entry.classId && e.level <= futureEntry.level)
              const futureClassLevel = futureClassLevels.length
              
              futureEntry.subclassId = subclassId
              futureEntry.features = getFeaturesForLevel(entry.classId, futureClassLevel, futureEntry.level, subclassId)
            })
            
            // Update legacy levelTimeline
            state.currentBuild.levelTimeline = (state.currentBuild.enhancedLevelTimeline || []).map(entry => ({
              level: entry.level,
              classId: entry.classId,
              subclassId: entry.subclassId,
              features: entry.features || [],
              asiOrFeat: entry.asiOrFeat,
              featId: entry.featId,
              abilityIncreases: entry.abilityIncreases,
              notes: entry.notes,
              fightingStyle: entry.fightingStyle,
              archetype: entry.archetype
            }))
            
            state.isDirty = true
          }
        }
      })
    },
    
    selectFeat: (level: number, featId: string) => {
      get().updateLevel(level, { asiOrFeat: 'feat', featId })
    },
    
    selectASI: (level: number, abilityIncreases: Partial<AbilityScoreArray>) => {
      get().updateLevel(level, { asiOrFeat: 'asi', abilityIncreases })
    },
    
    updateLevelEntry: (level: number, classId: string, updates: LevelEntry) => {
      set((state) => {
        if (state.currentBuild && state.currentBuild.levelTimeline) {
          const entryIndex = state.currentBuild.levelTimeline.findIndex(
            entry => entry.level === level && entry.classId === classId
          )
          
          if (entryIndex !== -1) {
            state.currentBuild.levelTimeline[entryIndex] = updates
          }
        }
      })
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
    
    setWeaponEnhancementBonus: (bonus: number) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.weaponEnhancementBonus = Math.max(0, Math.min(3, bonus))
          state.isDirty = true
          validateStep(state, 'equipment')
        }
      })
    },
    
    setArmorEnhancementBonus: (bonus: number) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.armorEnhancementBonus = Math.max(0, Math.min(3, bonus))
          state.isDirty = true
          validateStep(state, 'equipment')
        }
      })
    },
    
    // Buff actions
    toggleBuff: (buffId: string) => {
      set((state) => {
        if (state.currentBuild) {
          const currentBuffs = state.currentBuild.activeBuffs || []
          if (currentBuffs.includes(buffId)) {
            state.currentBuild.activeBuffs = currentBuffs.filter(id => id !== buffId)
          } else {
            state.currentBuild.activeBuffs = [...currentBuffs, buffId]
          }
          state.isDirty = true
          validateStep(state, 'equipment')
        }
      })
    },
    
    setActiveBuffs: (buffIds: string[]) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.activeBuffs = [...buffIds]
          state.isDirty = true
          validateStep(state, 'equipment')
        }
      })
    },
    
    setRound0Buffs: (buffIds: string[]) => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.round0Buffs = [...buffIds]
          state.isDirty = true
          validateStep(state, 'equipment')
        }
      })
    },
    
    clearAllBuffs: () => {
      set((state) => {
        if (state.currentBuild) {
          state.currentBuild.activeBuffs = []
          state.currentBuild.round0Buffs = []
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
    
    getStepErrors: () => {
      // TODO: Implement detailed error collection
      return []
    },
    
    // Utility actions
    resetBuild: () => {
      set((state) => {
        state.currentBuild = null
        state.isDirty = false
        state.currentStep = 'ability-scores'
        state.stepValidation = {
          'ability-scores': false,
          'race-background': false,
          'class-progression': false,
          'equipment': false,
          'downtime-training': false,
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
    
    // Downtime training actions
    addTrainingSession: (session) => {
      let newSession: DowntimeTrainingSession | null = null
      
      set((state) => {
        if (state.currentBuild?.downtimeTraining) {
          newSession = {
            ...session,
            id: `training-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date()
          }
          
          state.currentBuild.downtimeTraining.sessions.push(newSession)
          state.isDirty = true
          validateStep(state, 'downtime-training')
        }
      })
      
      // Recompute totals after the state update
      get().recomputeTrainingTotals()
      
      return newSession
    },
    
    updateTrainingSession: (sessionId, updates) => {
      set((state) => {
        if (state.currentBuild?.downtimeTraining) {
          const session = state.currentBuild.downtimeTraining.sessions.find(s => s.id === sessionId)
          if (session) {
            Object.assign(session, updates)
            state.isDirty = true
            validateStep(state, 'downtime-training')
          }
        }
      })
      
      // Recompute totals after the state update
      get().recomputeTrainingTotals()
    },
    
    removeTrainingSession: (sessionId) => {
      set((state) => {
        if (state.currentBuild?.downtimeTraining) {
          state.currentBuild.downtimeTraining.sessions = 
            state.currentBuild.downtimeTraining.sessions.filter(s => s.id !== sessionId)
          state.isDirty = true
          validateStep(state, 'downtime-training')
        }
      })
      
      // Recompute totals after the state update
      get().recomputeTrainingTotals()
    },
    
    addWeaponTraining: (sessionId, weaponTraining) => {
      set((state) => {
        if (state.currentBuild?.downtimeTraining) {
          const session = state.currentBuild.downtimeTraining.sessions.find(s => s.id === sessionId)
          if (session) {
            // Remove existing training for this weapon type in this session
            session.weaponTraining = session.weaponTraining.filter(wt => wt.weaponType !== weaponTraining.weaponType)
            // Add new training
            session.weaponTraining.push(weaponTraining)
            state.isDirty = true
            validateStep(state, 'downtime-training')
          }
        }
      })
      
      // Recompute totals after the state update
      get().recomputeTrainingTotals()
    },
    
    updateWeaponTraining: (sessionId, weaponType, updates) => {
      set((state) => {
        if (state.currentBuild?.downtimeTraining) {
          const session = state.currentBuild.downtimeTraining.sessions.find(s => s.id === sessionId)
          if (session) {
            const weaponTraining = session.weaponTraining.find(wt => wt.weaponType === weaponType)
            if (weaponTraining) {
              Object.assign(weaponTraining, updates)
              state.isDirty = true
              validateStep(state, 'downtime-training')
            }
          }
        }
      })
      
      // Recompute totals after the state update
      get().recomputeTrainingTotals()
    },
    
    removeWeaponTraining: (sessionId, weaponType) => {
      set((state) => {
        if (state.currentBuild?.downtimeTraining) {
          const session = state.currentBuild.downtimeTraining.sessions.find(s => s.id === sessionId)
          if (session) {
            session.weaponTraining = session.weaponTraining.filter(wt => wt.weaponType !== weaponType)
            state.isDirty = true
            validateStep(state, 'downtime-training')
          }
        }
      })
      
      // Recompute totals after the state update
      get().recomputeTrainingTotals()
    },
    
    recomputeTrainingTotals: () => {
      set((state) => {
        if (state.currentBuild?.downtimeTraining) {
          const training = state.currentBuild.downtimeTraining
          
          // Reset totals
          training.trainedFeats = []
          training.abilityTraining = {}
          training.trainedSkillProficiencies = []
          training.trainedSkillExpertise = []
          training.weaponTraining = {}
          
          // Aggregate from all sessions
          for (const session of training.sessions) {
            // Aggregate feats
            training.trainedFeats.push(...session.featsTrained)
            
            // Aggregate ability improvements
            for (const [ability, increase] of Object.entries(session.abilityImprovements)) {
              if (increase && increase > 0) {
                training.abilityTraining[ability as keyof typeof training.abilityTraining] = 
                  (training.abilityTraining[ability as keyof typeof training.abilityTraining] || 0) + increase
              }
            }
            
            // Aggregate skills
            training.trainedSkillProficiencies.push(...session.skillsTrained)
            training.trainedSkillExpertise.push(...session.expertiseGained)
            
            // Aggregate weapon training (take maximum bonus per weapon type)
            for (const weaponTraining of session.weaponTraining) {
              const existing = training.weaponTraining[weaponTraining.weaponType]
              if (!existing || weaponTraining.attackBonus > existing.attackBonus || 
                  weaponTraining.damageBonus > existing.damageBonus) {
                training.weaponTraining[weaponTraining.weaponType] = {
                  attackBonus: Math.max(existing?.attackBonus || 0, weaponTraining.attackBonus),
                  damageBonus: Math.max(existing?.damageBonus || 0, weaponTraining.damageBonus)
                }
              }
            }
          }
          
          // Remove duplicates
          training.trainedFeats = [...new Set(training.trainedFeats)]
          training.trainedSkillProficiencies = [...new Set(training.trainedSkillProficiencies)]
          training.trainedSkillExpertise = [...new Set(training.trainedSkillExpertise)]
        }
      })
      
      // Recalculate final ability scores to include training bonuses
      // This needs to be outside the set() to properly trigger updates
      get().recalculateAllAbilityScores()
    },
    
    clearDirty: () => {
      set((state) => {
        state.isDirty = false
      })
    },
    
    // Utility functions to get all known items from all sources
    getAllKnownSpells: () => {
      const state = get()
      const build = state.currentBuild
      if (!build) return []
      
      const allSpells = new Set<string>()
      
      // 1. Spells from level progression (all classes)
      build.enhancedLevelTimeline?.forEach(entry => {
        if (entry.spellChoices) {
          entry.spellChoices.forEach(spell => allSpells.add(spell))
        }
      })
      
      // 2. Racial spells
      // High Elf wizard cantrip
      if (build.race === 'elf' && build.subrace === 'high_elf' && build.highElfCantrip) {
        allSpells.add(build.highElfCantrip)
      }
      
      // Fixed racial spells (these are automatic, not selected, but still "known")
      if (build.race === 'tiefling') {
        allSpells.add('thaumaturgy')
      }
      if (build.race === 'elf' && build.subrace === 'drow') {
        allSpells.add('dancing_lights')
      }
      if (build.race === 'gnome' && build.subrace === 'forest_gnome') {
        allSpells.add('minor_illusion')
      }
      
      return Array.from(allSpells)
    },
    
    // Get only racial spells (separate from class progression)
    getRacialSpells: () => {
      const state = get()
      const build = state.currentBuild
      if (!build) return []
      
      const racialSpells = new Set<string>()
      
      // High Elf wizard cantrip
      if (build.race === 'elf' && build.subrace === 'high_elf' && build.highElfCantrip) {
        racialSpells.add(build.highElfCantrip)
      }
      
      // Fixed racial spells (these are automatic, not selected, but still "known")
      if (build.race === 'tiefling') {
        racialSpells.add('thaumaturgy')
      }
      if (build.race === 'elf' && build.subrace === 'drow') {
        racialSpells.add('dancing_lights')
      }
      if (build.race === 'gnome' && build.subrace === 'forest_gnome') {
        racialSpells.add('minor_illusion')
      }
      
      return Array.from(racialSpells)
    },
    
    // Get only class progression spells (separate from racial spells)
    getClassProgressionSpells: () => {
      const state = get()
      const build = state.currentBuild
      if (!build) return []
      
      const classSpells = new Set<string>()
      
      // Spells from level progression (all classes)
      build.enhancedLevelTimeline?.forEach(entry => {
        if (entry.spellChoices) {
          entry.spellChoices.forEach(spell => classSpells.add(spell))
        }
      })
      
      return Array.from(classSpells)
    },
    
    getAllKnownFeats: () => {
      const state = get()
      const build = state.currentBuild
      if (!build) return []
      
      const allFeats = new Set<string>()
      
      // 1. Feats from ASI/feat choices in level progression
      build.enhancedLevelTimeline?.forEach(entry => {
        if (entry.featId) {
          allFeats.add(entry.featId)
        }
      })
      
      // 2. Racial feats
      // Variant Human feat
      if (build.race === 'variant_human' && build.variantHumanFeat) {
        allFeats.add(build.variantHumanFeat)
      }
      
      // 3. Feats from downtime training
      build.downtimeTraining?.sessions?.forEach(session => {
        session.featsTrained?.forEach((feat: string) => allFeats.add(feat))
      })
      
      return Array.from(allFeats)
    },
    
    getAllKnownSkills: () => {
      const state = get()
      const build = state.currentBuild
      if (!build) return []
      
      const allSkills = new Set<string>()
      
      // 1. Base skill proficiencies from build
      build.skillProficiencies?.forEach(skill => allSkills.add(skill))
      
      // 2. Racial skill choices
      // Variant Human skill
      if (build.race === 'variant_human' && build.variantHumanSkill) {
        allSkills.add(build.variantHumanSkill)
      }
      // Half-Elf skills
      if (build.race === 'half_elf' && build.halfElfSkills) {
        build.halfElfSkills.forEach(skill => allSkills.add(skill))
      }
      
      // 3. Skills from downtime training
      build.downtimeTraining?.sessions?.forEach(session => {
        session.skillsTrained?.forEach((skill: string) => allSkills.add(skill))
      })
      
      return Array.from(allSkills)
    }
  }))
)

// Helper functions
function updateNavigationState(state: CharacterBuilderStore) {
  const currentIndex = BUILDER_STEPS.indexOf(state.currentStep)
  state.canGoBack = currentIndex > 0
  state.canProceed = currentIndex < BUILDER_STEPS.length - 1 && state.stepValidation[state.currentStep]
}

function validateStep(state: CharacterBuilderStore, step: BuilderStep): boolean {
  if (!state.currentBuild) {
    state.stepValidation[step] = false
    return false
  }
  
  let isValid = false
  
  switch (step) {
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
      isValid = validateEquipment()
      break
    case 'downtime-training':
      isValid = validateDowntimeTraining(state.currentBuild)
      break
    case 'summary':
      isValid = true // Summary is always valid if we got here
      break
  }
  
  state.stepValidation[step] = isValid
  updateNavigationState(state)
  return isValid
}

function validateAbilityScores(build: CharacterBuilder): boolean {
  // Use base scores for validation (without racial bonuses)
  const baseScores = build.baseAbilityScores || build.abilityScores
  const scores = Object.values(baseScores)
  const scoresValid = scores.every(score => score >= 8 && score <= 20)
  
  if (!scoresValid) return false
  
  // Method-specific validation using base scores
  if (build.abilityAssignmentMethod === 'pointbuy') {
    // For point buy, use the configured point limit from the build
    const pointLimit = build.pointBuyConfig?.totalPoints || build.pointBuyLimit || 27
    const pointCosts = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 }
    
    // Check all base scores are valid for point buy (8-15)
    const validRange = scores.every(score => score >= 8 && score <= 15)
    if (!validRange) return false
    
    const totalUsed = scores.reduce((sum, score) => sum + (pointCosts[score as keyof typeof pointCosts] || 0), 0)
    return totalUsed === pointLimit // Must spend exactly the configured points
  } else if (build.abilityAssignmentMethod === 'standard') {
    // For standard array, each value must be used exactly once
    const standardArray = [15, 14, 13, 12, 10, 8]
    const sortedScores = [...scores].sort((a, b) => b - a)
    const sortedStandard = [...standardArray].sort((a, b) => b - a)
    return JSON.stringify(sortedScores) === JSON.stringify(sortedStandard)
  } else {
    // For custom/manual (rolled stats), just check bounds (already done above)
    return true
  }
}

function validateRaceBackground(build: CharacterBuilder): boolean {
  // Race is required, background is optional
  return !!build.race
}

function validateClassProgression(build: CharacterBuilder): boolean {
  // Must have at least level 1
  return (build.enhancedLevelTimeline || []).length > 0
}

function validateEquipment(): boolean {
  // Equipment is optional but should be valid if present
  return true // For now, accept any equipment state
}

function validateDowntimeTraining(build: CharacterBuilder): boolean {
  // Downtime training is optional, but if sessions exist they should be valid
  if (!build.downtimeTraining || build.downtimeTraining.sessions.length === 0) {
    return true // No training sessions is valid
  }
  
  // Validate all sessions have required fields
  for (const session of build.downtimeTraining.sessions) {
    if (!session.id || !session.name) {
      return false // Sessions must have id and name
    }
    
    // Validate weapon training entries
    for (const weaponTraining of session.weaponTraining) {
      if (!weaponTraining.weaponType || 
          weaponTraining.attackBonus < 0 || weaponTraining.attackBonus > 3 ||
          weaponTraining.damageBonus < 0 || weaponTraining.damageBonus > 3) {
        return false
      }
    }
  }
  
  return true
}