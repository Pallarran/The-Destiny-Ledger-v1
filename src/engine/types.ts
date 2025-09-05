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