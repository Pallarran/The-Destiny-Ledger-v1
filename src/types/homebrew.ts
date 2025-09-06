// Homebrew content type definitions and validation schemas

import type { 
  DamageType, 
  AbilityScore 
} from '../rules/types'

// Define types that may not exist in rules/types
export type ConditionType = string
export type Skill = string

// Base homebrew content interface
export interface BaseHomebrewContent {
  id: string
  name: string
  source: string
  description: string
  author: string
  version: string
  createdAt: Date
  updatedAt: Date
  status: 'draft' | 'testing' | 'published'
  tags: string[]
}

// Homebrew Class Definition
export interface HomebrewClass extends BaseHomebrewContent {
  type: 'class'
  hitDie: number
  primaryAbility: AbilityScore[]
  savingThrowProficiencies: AbilityScore[]
  skillProficiencies: {
    count: number
    choices: Skill[]
  }
  armorProficiencies: string[]
  weaponProficiencies: string[]
  toolProficiencies: string[]
  startingEquipment: HomebrewEquipmentGrant[]
  startingGold?: { dice: number; sides: number; multiplier: number }
  spellcasting?: HomebrewSpellcasting
  classFeatures: HomebrewClassFeature[]
  subclassLevels: number[]
  subclassFeatureLevels: number[]
}

// Homebrew Subclass Definition
export interface HomebrewSubclass extends BaseHomebrewContent {
  type: 'subclass'
  className: string
  classId: string
  flavorText?: string
  subclassFeatures: HomebrewSubclassFeature[]
  spellList?: string[]
  expandedSpellList?: Record<number, string[]>
}

// Homebrew Feat Definition
export interface HomebrewFeat extends BaseHomebrewContent {
  type: 'feat'
  prerequisites?: HomebrewPrerequisite[]
  abilityScoreIncrease?: {
    count: number
    choices: AbilityScore[]
    maximum: number
  }
  benefits: HomebrewFeatBenefit[]
  mechanics: HomebrewMechanic[]
}

// Homebrew Spell Definition
export interface HomebrewSpell extends BaseHomebrewContent {
  type: 'spell'
  level: number
  school: string
  castingTime: {
    amount: number
    unit: 'action' | 'bonus_action' | 'reaction' | 'minute' | 'hour'
    condition?: string
  }
  range: {
    type: 'self' | 'touch' | 'ranged' | 'sight' | 'unlimited'
    distance?: number
    unit?: 'feet' | 'miles'
    shape?: 'sphere' | 'cube' | 'cylinder' | 'cone' | 'line'
    size?: number
  }
  components: {
    verbal: boolean
    somatic: boolean
    material: boolean
    materialComponent?: string
    costlyComponent?: { cost: number; consumed: boolean }
  }
  duration: {
    type: 'instantaneous' | 'concentration' | 'timed' | 'until_dispelled' | 'permanent'
    amount?: number
    unit?: 'round' | 'minute' | 'hour' | 'day'
    concentration?: boolean
  }
  classes: string[]
  damage?: HomebrewSpellDamage
  healing?: HomebrewSpellHealing
  conditions?: HomebrewSpellCondition[]
  savingThrow?: {
    ability: AbilityScore
    success: 'half_damage' | 'no_effect' | 'partial_effect'
    failure?: string
  }
  attackRoll?: {
    type: 'melee' | 'ranged'
    abilityModifier: AbilityScore
  }
  higherLevels?: string
}

// Homebrew Magic Item Definition
export interface HomebrewMagicItem extends BaseHomebrewContent {
  type: 'magic_item'
  itemType: 'weapon' | 'armor' | 'shield' | 'wondrous_item' | 'potion' | 'scroll' | 'ring' | 'rod' | 'staff' | 'wand'
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary' | 'artifact'
  attunement: {
    required: boolean
    restrictions?: string[]
  }
  properties: HomebrewItemProperty[]
  charges?: {
    maximum: number
    regain: {
      amount: number | 'all'
      condition: string
    }
    rechargeCondition?: string
  }
  curse?: {
    description: string
    removalCondition?: string
  }
}

// Supporting interfaces for homebrew content

export interface HomebrewClassFeature {
  level: number
  name: string
  description: string
  mechanics: HomebrewMechanic[]
  choices?: HomebrewChoice[]
  improvement?: boolean // for features that improve at higher levels
  improvementLevels?: number[]
}

export interface HomebrewSubclassFeature {
  level: number
  name: string
  description: string
  mechanics: HomebrewMechanic[]
  spellsGranted?: string[]
  choices?: HomebrewChoice[]
}

export interface HomebrewMechanic {
  type: 'passive' | 'active' | 'reaction' | 'resource' | 'modification'
  trigger?: string
  effect: HomebrewEffect
  resource?: {
    type: 'spell_slot' | 'short_rest' | 'long_rest' | 'charges' | 'per_turn'
    amount?: number
    level?: number
  }
  scaling?: {
    type: 'character_level' | 'class_level' | 'spell_level' | 'proficiency_bonus'
    rate: number
    maximum?: number
  }
}

export interface HomebrewEffect {
  type: 'damage' | 'healing' | 'condition' | 'ability_check' | 'saving_throw' | 'ac_bonus' | 'attack_bonus' | 'damage_bonus' | 'skill_proficiency' | 'advantage'
  amount?: {
    dice?: { count: number; sides: number }
    modifier?: number
    abilityModifier?: AbilityScore
  }
  damageType?: DamageType
  condition?: {
    type: ConditionType
    duration?: string
    savingThrow?: AbilityScore
  }
  target?: 'self' | 'single' | 'multiple' | 'area' | 'all_allies' | 'all_enemies'
  range?: number
  duration?: string
}

export interface HomebrewChoice {
  type: 'ability_score' | 'skill' | 'spell' | 'fighting_style' | 'cantrip' | 'feat' | 'equipment'
  count: number
  choices: string[]
  restrictions?: string[]
}

export interface HomebrewPrerequisite {
  type: 'ability_score' | 'level' | 'class' | 'race' | 'feat' | 'skill' | 'spell'
  value: string | number
  minimum?: number
}

export interface HomebrewFeatBenefit {
  description: string
  mechanics: HomebrewMechanic[]
}

export interface HomebrewSpellcasting {
  ability: AbilityScore
  ritual: boolean
  focus: boolean
  preparation: 'prepared' | 'known' | 'innate'
  progression: 'full' | 'half' | 'third' | 'pact' | 'none'
  spellsKnownProgression?: number[]
  cantripsKnownProgression?: number[]
  spellList?: string[]
}

export interface HomebrewEquipmentGrant {
  type: 'choice' | 'fixed'
  items: string[]
  count?: number
  alternatives?: string[][]
}

export interface HomebrewSpellDamage {
  dice: { count: number; sides: number }
  type: DamageType
  modifier?: {
    type: 'ability' | 'fixed'
    value: AbilityScore | number
  }
  scaling?: {
    levelIncrease: number
    diceIncrease: number
  }
}

export interface HomebrewSpellHealing {
  dice: { count: number; sides: number }
  modifier?: {
    type: 'ability' | 'fixed'
    value: AbilityScore | number
  }
  scaling?: {
    levelIncrease: number
    diceIncrease: number
  }
}

export interface HomebrewSpellCondition {
  type: ConditionType
  duration: string
  savingThrow?: {
    ability: AbilityScore
    dc?: number
    interval?: string
  }
}

export interface HomebrewItemProperty {
  name: string
  description: string
  type: 'constant' | 'activated' | 'charged' | 'conditional'
  activation?: {
    type: 'action' | 'bonus_action' | 'reaction'
    condition?: string
  }
  mechanics: HomebrewMechanic[]
}

// Validation error types
export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

// Homebrew pack for import/export
export interface HomebrewPack {
  name: string
  version: string
  author: string
  description: string
  classes: HomebrewClass[]
  subclasses: HomebrewSubclass[]
  feats: HomebrewFeat[]
  spells: HomebrewSpell[]
  magicItems: HomebrewMagicItem[]
  createdAt: Date
}