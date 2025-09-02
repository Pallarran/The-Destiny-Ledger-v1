import type { AbilityScoreArray } from '../rules/types'
import type { DowntimeTraining } from '../types/downtimeTraining'

export type AbilityScoreMethod = 'standard' | 'pointbuy' | 'manual'

// Canonical Build type IDs from review document
export type ClassId = string
export type SubclassId = string
export type FeatureId = string
export type FeatId = string
export type StyleId = string
export type SpellId = string
export type WeaponId = string
export type ArmorId = string
export type SkillId = string
export type AbilityId = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'

// Canonical Build type from review document
export interface CanonicalBuild {
  identity: {
    name: string
    level: number
    classPath: Array<{
      cls: ClassId
      levels: number
      subclass?: SubclassId
    }>
  }
  abilities: {
    STR: number
    DEX: number
    CON: number
    INT: number
    WIS: number
    CHA: number
  }
  profs: {
    skills: SkillId[]
    saves: AbilityId[]
    expertise: SkillId[]
  }
  features: FeatureId[]
  feats: FeatId[]
  fightingStyles: StyleId[]
  maneuvers: string[] // Battle Master maneuver IDs
  metamagic: string[] // Sorcerer metamagic option IDs
  eldritchInvocations: string[] // Warlock eldritch invocation IDs
  mysticArcanum: Record<number, string> // Warlock Mystic Arcanum spells by level (6th, 7th, 8th, 9th)
  pactBoon?: string // Warlock Pact Boon selection (blade, chain, tome)
  favoredEnemies: string[] // Ranger Favored Enemy selections
  naturalExplorer: string[] // Ranger Natural Explorer terrain selections
  spells: Array<{
    spell: SpellId
    prepared?: boolean
    known?: boolean
  }>
  equipment: {
    weapons: WeaponId[]
    ammo?: number
    armor?: ArmorId
    shield?: boolean
  }
  resources: {
    actionSurge?: number
    superiorityDice?: {
      count: number
      die: number
    }
    pactSlots?: {
      level: number
      count: number
    }
  }
  toggles: {
    advantage: 'normal' | 'adv' | 'disadv' | 'elven-accuracy'
    cover?: 0 | 2 | 5
    sharpshooter?: boolean
    greatWeaponMaster?: boolean
    hex?: boolean
    huntersMark?: boolean
    bless?: boolean
    faerieFire?: boolean
  }
}

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
  expertiseChoices?: string[] // Skills chosen for expertise at this level
  maneuverChoices?: string[] // Battle Master maneuvers chosen at this level
  metamagicChoices?: string[] // Sorcerer metamagic options chosen at this level
  eldritchInvocationChoices?: string[] // Warlock eldritch invocations chosen at this level
  mysticArcanumChoices?: Record<number, string> // Warlock Mystic Arcanum spells chosen at this level
  pactBoonChoice?: string // Warlock Pact Boon chosen at this level
  favoredEnemyChoice?: string // Ranger Favored Enemy chosen at this level
  naturalExplorerChoice?: string // Ranger Natural Explorer terrain chosen at this level
}

// Legacy BuildConfiguration - will migrate to CanonicalBuild gradually
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
  
  // Migration fields toward canonical build
  canonicalBuild?: CanonicalBuild
}

export interface DPRConfiguration {
  buildId: string
  
  // Simulation parameters
  acMin: number
  acMax: number
  acStep: number
  
  // Combat state - aligned with canonical build toggles
  advantageState: 'normal' | 'advantage' | 'disadvantage' | 'elven-accuracy'
  round0BuffsEnabled: boolean
  greedyResourceUse: boolean
  autoGWMSS: boolean
  
  // Combat conditions from canonical build
  cover?: 0 | 2 | 5
  
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
  normalCurve: Array<{ ac: number; dpr: number; withPowerAttack?: number }>
  advantageCurve: Array<{ ac: number; dpr: number; withPowerAttack?: number }>
  disadvantageCurve: Array<{ ac: number; dpr: number; withPowerAttack?: number }>
  
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