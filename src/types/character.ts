// Extended character types for the Builder UI
// Extends existing BuildConfiguration with additional Phase 3 data

import type { BuildConfiguration, LevelEntry } from '../stores/types'
import type { AbilityScore, AbilityScoreArray, Equipment } from '../rules/types'

// Character creation step progression
export type BuilderStep = 
  | 'ability-scores'
  | 'race-background'
  | 'class-progression'
  | 'equipment'
  | 'downtime-training'
  | 'summary'

// Ability score assignment methods  
export type AbilityAssignmentMethod = 
  | 'pointbuy'
  | 'standard'
  | 'rolled'
  | 'custom'

// Point buy configuration
export interface PointBuyConfig {
  totalPoints: number
  minScore: number
  maxScore: number
  costs: Record<number, number>
}

// Enhanced level entry for the builder UI
export interface BuilderLevelEntry extends LevelEntry {
  // Additional UI-specific data
  isCompleted?: boolean
  validationErrors?: string[]
  availableFeatures?: string[]
  availableSpells?: string[]
  hitPointRoll?: number
  fightingStyle?: string
  archetype?: string
  preparedSpells?: string[] // For wizard daily spell preparation (separate from spellbook)
}

// Extended build configuration for Phase 3
export interface CharacterBuilder extends BuildConfiguration {
  // Builder UI state
  currentStep: BuilderStep
  completedSteps: BuilderStep[]
  
  // Enhanced ability score data
  abilityAssignmentMethod: AbilityAssignmentMethod
  pointBuyConfig: PointBuyConfig
  rolledScores?: number[]
  racialBonuses?: Partial<AbilityScoreArray>
  finalAbilityScores?: AbilityScoreArray
  
  // Racial choice fields (for races with options)
  variantHumanFeat?: string // Feat chosen for Variant Human
  variantHumanSkill?: string // Skill chosen for Variant Human
  variantHumanAbilities?: [string, string] // Two +1 ability choices for Variant Human
  halfElfSkills?: [string, string] // Two skill choices for Half-Elf
  halfElfAbilities?: [string, string] // Two +1 ability choices for Half-Elf
  dragonbornAncestry?: string // Draconic ancestry chosen for Dragonborn
  highElfCantrip?: string // Wizard cantrip chosen for High Elf
  
  // Enhanced level progression
  enhancedLevelTimeline: BuilderLevelEntry[]
  maxLevel: number
  totalHitPoints?: number
  
  // Equipment selection state
  selectedMainHand?: string
  selectedOffHand?: string
  selectedRanged?: string
  selectedArmor?: string
  hasShield?: boolean
  
  // Equipment interface for magic items and attunement
  equipment: Equipment
  
  // Validation state
  isValid: boolean
  validationErrors: string[]
  
  // Build analysis cache
  lastDPRCalculation?: {
    timestamp: Date
    averageDPR: number
    acRange: [number, number]
  }
}

// Character builder store interface
export interface CharacterBuilderState {
  currentBuild: CharacterBuilder | null
  isDirty: boolean
  isLoading: boolean
  
  // Step navigation
  currentStep: BuilderStep
  canProceed: boolean
  canGoBack: boolean
  
  // Validation
  stepValidation: Record<BuilderStep, boolean>
  globalErrors: string[]
}

// Form data types for each step
export interface AbilityScoreFormData {
  method: AbilityAssignmentMethod
  scores: AbilityScoreArray
  pointsRemaining?: number
  isValid: boolean
  errors: string[]
}

export interface RaceBackgroundFormData {
  selectedRace: string
  selectedBackground?: string
  racialFeatures: string[]
  backgroundFeatures: string[]
  isValid: boolean
  errors: string[]
}

export interface ClassProgressionFormData {
  levels: BuilderLevelEntry[]
  currentEditingLevel?: number
  availableClasses: string[]
  isValid: boolean
  errors: string[]
}

export interface EquipmentFormData {
  mainHand?: string
  offHand?: string
  ranged?: string
  armor?: string
  shield: boolean
  enhancements: string[]
  isValid: boolean
  errors: string[]
}

// Validation result types
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface StepValidation {
  abilityScores: ValidationResult
  raceBackground: ValidationResult
  classProgression: ValidationResult
  equipment: ValidationResult
  summary: ValidationResult
}

// Helper types for UI components
export interface AbilityScoreDisplay {
  ability: AbilityScore
  base: number
  racial: number
  total: number
  modifier: number
}

export interface LevelProgressionDisplay {
  level: number
  className: string
  subclassName?: string
  hitPoints: number
  newFeatures: string[]
  totalFeatures: string[]
}

// Default configurations
export const DEFAULT_POINT_BUY_CONFIG: PointBuyConfig = {
  totalPoints: 27,
  minScore: 8,
  maxScore: 15,
  costs: {
    8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
  }
}

export const DEFAULT_ABILITY_SCORES: AbilityScoreArray = {
  STR: 8,
  DEX: 8,
  CON: 8,
  INT: 8,
  WIS: 8,
  CHA: 8
}

export const BUILDER_STEPS: BuilderStep[] = [
  'ability-scores',
  'race-background',
  'class-progression',
  'equipment',
  'downtime-training',
  'summary'
]