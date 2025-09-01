import type { AbilityScoreArray } from '../rules/types'
import type { DowntimeTraining } from '../types/downtimeTraining'

export type AbilityScoreMethod = 'standard' | 'pointbuy' | 'manual'

export interface LevelEntry {
  level: number
  classId: string
  subclassId?: string
  features: string[]
  asiOrFeat?: 'asi' | 'feat'
  featId?: string
  abilityIncreases?: Partial<AbilityScoreArray>
  notes?: string
  fightingStyle?: string
  archetype?: string
}

export interface BuildConfiguration {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
  notes?: string
  tags?: string[]
  
  // Character basics
  race: string
  subrace?: string
  background?: string
  baseAbilityScores?: AbilityScoreArray
  skillProficiencies?: string[]
  
  // Ability scores
  abilityMethod: AbilityScoreMethod
  abilityScores: AbilityScoreArray
  pointBuyLimit: number
  
  // Level progression
  levelTimeline: LevelEntry[]
  currentLevel: number
  
  // Equipment
  mainHandWeapon?: string
  offHandWeapon?: string
  rangedWeapon?: string
  armor?: string
  shield?: boolean
  weaponEnhancements: string[]
  magicItems?: string[] // IDs of equipped magic items
  attunedItems?: string[] // IDs of attuned magic items
  
  // Magic enhancement bonuses (0, 1, 2, or 3)
  weaponEnhancementBonus: number
  armorEnhancementBonus: number
  
  // Active buffs
  activeBuffs: string[]
  round0Buffs: string[]
  
  // Downtime training (optional - for campaigns that allow between-chapter training)
  downtimeTraining?: DowntimeTraining
}

export interface DPRConfiguration {
  buildId: string
  
  // Simulation parameters
  acMin: number
  acMax: number
  acStep: number
  
  // Combat state
  advantageState: 'normal' | 'advantage' | 'disadvantage'
  round0BuffsEnabled: boolean
  greedyResourceUse: boolean
  autoGWMSS: boolean
  
  // Manual overrides
  customAttackBonus?: number
  customDamageBonus?: number
}

export interface DPRResult {
  buildId: string
  config: DPRConfiguration
  timestamp: Date
  
  // Results
  totalDPR: number
  averageDPR: number
  roundBreakdown: number[]
  
  // Curves for charts
  normalCurve: Array<{ ac: number; dpr: number }>
  advantageCurve: Array<{ ac: number; dpr: number }>
  disadvantageCurve: Array<{ ac: number; dpr: number }>
  
  // GWM/SS analysis
  gwmSSBreakpoints: Array<{
    ac: number
    useGWMSS: boolean
    withPowerAttack: number
    withoutPowerAttack: number
  }>
}

export interface VaultState {
  builds: BuildConfiguration[]
  selectedBuildIds: string[]
  searchQuery: string
  selectedTags: string[]
  sortBy: 'name' | 'level' | 'createdAt' | 'updatedAt'
  sortOrder: 'asc' | 'desc'
}

export interface AppSettings {
  // Non-DPR weights
  roleWeights: {
    social: number
    control: number
    exploration: number
    defense: number
    support: number
    mobility: number
  }
  
  // Defaults
  defaultAbilityMethod: AbilityScoreMethod
  defaultPointBuyLimit: number
  autoCalculateGWMSS: boolean
  greedyResourceUse: boolean
  
  // UI preferences
  theme: 'modern-fantasy' | 'classic-dark' | 'high-contrast'
  reducedMotion: boolean
  showAdvancedTooltips: boolean
}