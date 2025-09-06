// Core types for the DPR calculation engine

export interface AttackRoll {
  attackBonus: number
  damage: DamageRoll
  advantageState: 'normal' | 'advantage' | 'disadvantage'
  critRange: number // Default 20, Champion gets 19-20, etc.
  isGWMSS?: boolean // Great Weapon Master or Sharpshooter power attack
}

export interface DamageRoll {
  baseDice: DiceRoll[]
  bonusDamage: number
  additionalDice?: DiceRoll[] // From things like Sneak Attack, Hunter's Mark, etc.
}

export interface DiceRoll {
  count: number
  die: number
  rerollOnes?: boolean // For Great Weapon Fighting
  rerollTwos?: boolean // For Great Weapon Fighting
}

export interface CombatState {
  proficiencyBonus: number
  abilityModifier: number // STR or DEX typically
  
  // Attack modifiers
  attackBonuses: number[] // From various sources (magic weapon, archery style, etc.)
  damageBonuses: number[] // From various sources (magic weapon, dueling style, etc.)
  
  // Features
  extraAttacks: number // 0 = 1 attack, 1 = 2 attacks, etc.
  actionSurge: boolean
  sneakAttackDice: number
  superiorityDice?: { count: number; die: number }
  hasRage: boolean
  hasMartialArts: boolean
  critRange?: number // 20 = normal, 19 = improved critical, 18 = superior critical
  hasAssassinate: boolean
  hasFrenzy: boolean
  
  // Fighting Styles
  fightingStyles: FightingStyleType[]
  
  // Feats
  hasGWM: boolean
  hasSharpshooter: boolean
  hasCrossbowExpert: boolean
  hasPolearmMaster: boolean
  
  // Buffs
  hasAdvantage: boolean
  hasDisadvantage: boolean
  hasBless: boolean // +2.5 average to attack
  hasHaste: boolean // Extra attack
  hasHuntersMark: boolean // +1d6 damage
  hasHex: boolean // +1d6 damage
  hasElementalWeapon: boolean // +1 attack, +1d4 damage
}

export type FightingStyleType = 
  | 'archery'      // +2 ranged attacks
  | 'defense'      // +1 AC (doesn't affect DPR)
  | 'dueling'      // +2 damage one-handed
  | 'gwf'          // Reroll 1s and 2s on weapon damage
  | 'two-weapon'   // Add ability mod to off-hand

export interface DPRCalculationResult {
  // Per-attack calculations
  hitChance: number
  critChance: number
  missChance: number
  
  // Damage calculations
  normalDamage: number
  critDamage: number
  expectedDamagePerAttack: number
  
  // Round calculations
  attacksPerRound: number
  expectedDPR: number
  
  // GWM/SS analysis
  withPowerAttack?: number
  withoutPowerAttack?: number
  shouldUsePowerAttack?: boolean
  
  // Breakdown for UI
  breakdown: {
    round1: number
    round2: number
    round3: number
    average: number
    total: number
  }
}

export interface SimulationConfig {
  targetAC: number
  rounds: number // Default 3
  
  // Combat options
  round0Buffs: boolean // Allow pre-combat buffing
  greedyResourceUse: boolean // Use resources optimally
  autoGWMSS: boolean // Automatically determine when to use -5/+10
  forceGWMSS?: boolean // Force -5/+10 regardless of optimality
  assumeSneakAttack?: boolean // Assume optimal conditions for sneak attack (default true)
}

export interface WeaponConfig {
  baseDamage: DiceRoll
  properties: WeaponProperty[]
  damageType: 'slashing' | 'piercing' | 'bludgeoning'
  enhancement: number // +1, +2, +3, etc.
  specialProperties?: {
    flametongue?: boolean // +2d6 fire
    frostbrand?: boolean // +1d6 cold
    vorpal?: boolean // Decapitation on nat 20
  }
}

export type WeaponProperty = 
  | 'finesse'
  | 'heavy'
  | 'light'
  | 'loading'
  | 'reach'
  | 'thrown'
  | 'two-handed'
  | 'versatile'
  | 'ammunition'

// === ROUND SCRIPTS & ACTION ECONOMY ===

export type ActionType = 'action' | 'bonus-action' | 'reaction' | 'free' | 'movement'

export interface ActionOption {
  id: string
  name: string
  type: ActionType
  description: string
  cost: ResourceCost[]
  requirements?: ActionRequirement[]
  effects: ActionEffect[]
  conflicts?: string[] // IDs of actions that conflict with this one
}

export interface ResourceCost {
  type: 'spell-slot' | 'superiority-die' | 'ki-point' | 'sorcery-point' | 'rage' | 'action-surge' | 'second-wind'
  level?: number // For spell slots
  amount: number
}

export interface ActionRequirement {
  type: 'weapon-property' | 'spell-known' | 'feature' | 'min-level' | 'concentration-free'
  value: string | number
  comparison?: '=' | '>=' | '<=' | '>' | '<'
}

export interface ActionEffect {
  type: 'attack' | 'damage-bonus' | 'attack-bonus' | 'advantage' | 'concentration' | 'movement' | 'condition'
  target?: 'self' | 'enemy' | 'ally'
  value?: number | string
  duration?: 'instant' | 'round' | 'encounter' | 'until-concentration-ends'
  stacks?: boolean
}

export interface RoundAction {
  actionId: string
  option: ActionOption
  parameters?: Record<string, any> // For parameterized actions (target selection, spell level, etc.)
}

export interface RoundScript {
  roundNumber: 1 | 2 | 3
  actions: RoundAction[]
  availableResources: ResourcePool
  concentrationEffect?: string // ID of active concentration effect
  notes?: string
}

export interface ResourcePool {
  spellSlots: Record<number, number> // level -> count
  superiorityDice: number
  kiPoints: number
  sorceryPoints: number
  hasActionSurge: boolean
  hasRage: boolean
  hasSecondWind: boolean
}

export interface RoundScripts {
  round1: RoundScript
  round2: RoundScript
  round3: RoundScript
  initialResources: ResourcePool
}

export interface ActionEconomyValidation {
  isValid: boolean
  violations: ActionViolation[]
  warnings: ActionWarning[]
  resourceUsage: ResourceUsageBreakdown
}

export interface ActionViolation {
  type: 'double-action' | 'double-bonus-action' | 'insufficient-resources' | 'concentration-conflict' | 'requirement-not-met'
  roundNumber: 1 | 2 | 3
  actionIds: string[]
  message: string
}

export interface ActionWarning {
  type: 'suboptimal-resource-use' | 'unused-action' | 'concentration-overlap'
  roundNumber: 1 | 2 | 3
  actionIds?: string[]
  message: string
  suggestion?: string
}

export interface ResourceUsageBreakdown {
  spellSlotsUsed: Record<number, number>
  superiorityDiceUsed: number
  otherResourcesUsed: string[]
  totalResourceValue: number // Estimated value of resources consumed
}