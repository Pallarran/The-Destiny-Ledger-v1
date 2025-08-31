// Core type definitions for D&D 5e data structures

export type AbilityScore = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'

export type DamageType = 
  | 'acid' | 'bludgeoning' | 'cold' | 'fire' | 'force' | 'lightning' 
  | 'necrotic' | 'piercing' | 'poison' | 'psychic' | 'radiant' | 'slashing' | 'thunder'

export type WeaponType = 'simple' | 'martial'
export type WeaponCategory = 'melee' | 'ranged'

export interface AbilityScoreArray {
  STR: number
  DEX: number  
  CON: number
  INT: number
  WIS: number
  CHA: number
}

export type AbilityScores = AbilityScoreArray

export interface CharacterLevel {
  level: number
  classId: string
  subclassId: string | null
  features: string[]
  spells: string[]
}

export interface Equipment {
  mainHand: string | null
  offHand: string | null
  armor: string | null
  shield: boolean
  other: string[]
  magicItems: string[] // IDs of equipped magic items
  attunedItems: string[] // IDs of attuned magic items (subset of magicItems)
}

export interface CharacterBuild {
  id: string
  name: string
  race: string
  abilityScores: AbilityScores
  levels: CharacterLevel[]
  equipment: Equipment
  buffs: string[]
  settings: {
    fightingStyle: string | null
    spellcastingAbility: AbilityScore | null
    gwmThreshold: number
    ssThreshold: number
  }
}

export interface DamageRoll {
  count: number
  die: number // d6 = 6, d8 = 8, etc
  bonus: number
  type: DamageType
}

export interface Feature {
  id: string
  name: string
  description: string
  source: string
  rulesKey?: string // Internal rules engine key
  levelRequired?: number
  prerequisites?: string[]
}

export interface FightingStyle {
  id: string
  name: string
  description: string
  rulesKey: string // e.g., 'archery', 'dueling', 'gwf', 'defense'
}

export interface ClassDefinition {
  id: string
  name: string
  hitDie: number
  primaryAbilities: AbilityScore[]
  savingThrowProficiencies: AbilityScore[]
  skillChoices: string[]
  skillChoiceCount: number
  features: Record<number, Feature[]> // level -> features
  fightingStyles?: FightingStyle[]
  fightingStyleLevel?: number
}

export interface SubclassDefinition {
  id: string
  name: string
  parentClass: string
  features: Record<number, Feature[]>
}

export interface Feat {
  id: string
  name: string
  description: string
  prerequisites?: string[]
  abilityScoreIncrease?: {
    choices: AbilityScore[]
    count: number
  }
  features: Feature[]
}

export interface Weapon {
  id: string
  name: string
  type: WeaponType
  category: WeaponCategory
  damage: DamageRoll[]
  properties: string[]
  range?: {
    normal: number
    long?: number
  }
  versatile?: DamageRoll[] // Alternative damage for versatile weapons
}

export interface WeaponEnhancement {
  id: string
  name: string
  description: string
  attackBonus?: number
  damageBonus?: number
  additionalDamage?: DamageRoll[]
}

export type ArmorType = 'light' | 'medium' | 'heavy' | 'shield'

export interface Armor {
  id: string
  name: string
  type: ArmorType
  ac: number
  dexModifier: 'full' | 'limited' | 'none'
  dexMax?: number // For medium armor (max +2)
  stealthDisadvantage: boolean
  strengthRequirement?: number // For heavy armor
  cost: number
  weight: number
}

export interface Buff {
  id: string
  name: string
  description: string
  concentration: boolean
  duration: string
  actionCost: 'action' | 'bonus' | 'free' | 'reaction'
  allowedRound0: boolean
  effects: {
    attackBonus?: number
    damageBonus?: number
    advantage?: boolean
    disadvantage?: boolean
    additionalAttacks?: number
    onHitDamage?: DamageRoll[]
  }
}

export type MagicItemRarity = 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary' | 'artifact'
export type MagicItemCategory = 'weapon' | 'armor' | 'shield' | 'wondrous' | 'potion' | 'scroll' | 'ring' | 'rod' | 'staff' | 'wand'

export interface MagicItemEffects {
  acBonus?: number
  attackBonus?: number
  damageBonus?: number
  rangedDamageBonus?: number
  savingThrowBonus?: number
  abilityScoreOverride?: Partial<AbilityScoreArray>
  abilityScoreBonus?: Partial<AbilityScoreArray>
  onHitDamage?: DamageRoll[]
}

export interface MagicItem {
  id: string
  name: string
  rarity: MagicItemRarity
  attunement: boolean
  description: string
  category: MagicItemCategory
  effects?: MagicItemEffects
  prerequisites?: string[] // e.g., ["Spellcaster", "Wizard only"]
}