/**
 * Rules engine that composes modifiers into ResolvedAttack per round
 * From review document: "A small rules engine composes modifiers into a ResolvedAttack per round"
 */

import type { Modifier } from './modifiers'
import { modifierApplies, filterModifiers } from './modifiers'

export interface ResolvedAttack {
  // Base stats
  attackBonus: number
  damageBonus: number
  baseDamage: number
  
  // Hit mechanics
  hasAdvantage: boolean
  hasDisadvantage: boolean
  elvenAccuracy: boolean
  critRange: number // 20 = crit on 20, 19 = crit on 19-20, etc.
  
  // Attack count
  attacksPerRound: number
  bonusActionAttack?: {
    attackBonus: number
    damageBonus: number
    baseDamage: number
  }
  
  // Action economy
  usesAction: boolean
  usesBonusAction: boolean
  usesReaction: boolean
  requiresConcentration: boolean
  
  // Special effects
  onHitEffects: Array<{
    type: 'damage' | 'extraAttack' | 'resource'
    value: number
    condition?: string
  }>
  
  onCritEffects: Array<{
    type: 'damage' | 'extraAttack' | 'resource'
    value: number
  }>
  
  // Resource tracking
  limitedUses?: {
    max: number
    recharge: 'shortRest' | 'longRest' | 'turn' | 'encounter'
    remaining: number
  }
  
  // Context for calculations
  weaponContext: {
    properties: string[]
    category: 'melee' | 'ranged'
    baseDamage: number
    critMultiplier: number
  }
}

export interface ResolveContext {
  // Character stats
  level: number
  proficiencyBonus: number
  abilityMod: number // Primary ability modifier (STR for melee, DEX for ranged)
  
  // Weapon info
  weaponId: string
  weaponProperties: string[]
  weaponCategory: 'melee' | 'ranged'
  weaponBaseDamage: number
  
  // Combat state
  round: number
  hasAdvantage: boolean
  targetAC: number
  
  // Toggle states (from canonical build)
  sharpshooter: boolean
  greatWeaponMaster: boolean
  hex: boolean
  huntersMark: boolean
  bless: boolean
  faerieFire: boolean
  
  // Resources
  actionSurgeRemaining: number
  superiorityDiceRemaining: number
  pactSlotsRemaining: number
}

/**
 * Resolve all modifiers into a final attack calculation for a round
 */
export function resolveAttack(
  modifiers: Modifier[],
  context: ResolveContext
): ResolvedAttack {
  const resolved: ResolvedAttack = {
    attackBonus: context.abilityMod + context.proficiencyBonus,
    damageBonus: context.abilityMod,
    baseDamage: context.weaponBaseDamage,
    hasAdvantage: context.hasAdvantage,
    hasDisadvantage: false,
    elvenAccuracy: false,
    critRange: 20,
    attacksPerRound: 1,
    usesAction: true,
    usesBonusAction: false,
    usesReaction: false,
    requiresConcentration: false,
    onHitEffects: [],
    onCritEffects: [],
    weaponContext: {
      properties: context.weaponProperties,
      category: context.weaponCategory,
      baseDamage: context.weaponBaseDamage,
      critMultiplier: 2
    }
  }
  
  // Filter applicable modifiers  
  const applicableModifiers = modifiers.filter(mod => 
    modifierApplies(mod, {
      weaponProperties: context.weaponProperties,
      weaponCategory: context.weaponCategory,
      weaponId: context.weaponId,
      hasAdvantage: context.hasAdvantage,
      round: context.round
    })
  )
  
  // Apply each modifier type
  applyToHitModifiers(resolved, applicableModifiers)
  applyDamageModifiers(resolved, applicableModifiers)
  applyAdvantageModifiers(resolved, applicableModifiers)
  applyCritRangeModifiers(resolved, applicableModifiers)
  applyExtraAttackModifiers(resolved, applicableModifiers)
  applyActionEconomyModifiers(resolved, applicableModifiers)
  applyTriggerModifiers(resolved, applicableModifiers)
  applyWeaponTrainingModifiers(resolved, applicableModifiers)
  applyToggleStates(resolved, context)
  
  return resolved
}

function applyToHitModifiers(
  resolved: ResolvedAttack,
  modifiers: Modifier[]
) {
  const toHitMods = filterModifiers(modifiers, 'toHit')
  
  for (const mod of toHitMods) {
    if (mod.type === 'toHit') {
      resolved.attackBonus += mod.value
    }
  }
}

function applyDamageModifiers(
  resolved: ResolvedAttack,
  modifiers: Modifier[]
) {
  const damageMods = filterModifiers(modifiers, 'damage')
  
  for (const mod of damageMods) {
    if (mod.type === 'damage') {
      resolved.damageBonus += mod.value
    }
  }
}

function applyAdvantageModifiers(
  resolved: ResolvedAttack,
  modifiers: Modifier[]
) {
  const advantageMods = modifiers.filter(mod => 
    mod.type === 'advantage' || mod.type === 'disadvantage'
  )
  
  for (const mod of advantageMods) {
    if (mod.type === 'advantage') {
      resolved.hasAdvantage = true
      if ('elvenAccuracy' in mod && mod.elvenAccuracy) {
        resolved.elvenAccuracy = true
      }
    } else if (mod.type === 'disadvantage') {
      resolved.hasDisadvantage = true
    }
  }
  
  // Advantage and disadvantage cancel out
  if (resolved.hasAdvantage && resolved.hasDisadvantage) {
    resolved.hasAdvantage = false
    resolved.hasDisadvantage = false
    resolved.elvenAccuracy = false
  }
}

function applyCritRangeModifiers(
  resolved: ResolvedAttack,
  modifiers: Modifier[]
) {
  const critMods = filterModifiers(modifiers, 'critRange')
  
  for (const mod of critMods) {
    if (mod.type === 'critRange') {
      resolved.critRange -= mod.value // Lower number = wider crit range
    }
  }
  
  // Minimum crit range is 2 (natural 1 never crits)
  resolved.critRange = Math.max(2, resolved.critRange)
}

function applyExtraAttackModifiers(
  resolved: ResolvedAttack,
  modifiers: Modifier[]
) {
  const extraAttackMods = filterModifiers(modifiers, 'extraAttack')
  
  for (const mod of extraAttackMods) {
    if (mod.type === 'extraAttack') {
      resolved.attacksPerRound += mod.value
    }
  }
}

function applyActionEconomyModifiers(
  resolved: ResolvedAttack,
  modifiers: Modifier[]
) {
  const bonusActionMods = filterModifiers(modifiers, 'bonusAction')
  const reactionMods = filterModifiers(modifiers, 'reaction')
  
  for (const mod of bonusActionMods) {
    if (mod.type === 'bonusAction' && 'provides' in mod) {
      resolved.usesBonusAction = true
      
      // Add bonus action attack (simplified)
      resolved.bonusActionAttack = {
        attackBonus: resolved.attackBonus,
        damageBonus: resolved.damageBonus,
        baseDamage: resolved.baseDamage * 0.5 // Simplified: butt end of polearm, hand crossbow, etc.
      }
    }
  }
  
  for (const mod of reactionMods) {
    if (mod.type === 'reaction') {
      resolved.usesReaction = true
    }
  }
}

function applyTriggerModifiers(
  resolved: ResolvedAttack,
  modifiers: Modifier[]
) {
  const onHitMods = modifiers.filter(mod => mod.type === 'onHit')
  const onCritMods = modifiers.filter(mod => mod.type === 'onCrit')
  
  for (const mod of onHitMods) {
    if (mod.type === 'onHit' && 'effect' in mod) {
      if (mod.effect.damage) {
        resolved.onHitEffects.push({
          type: 'damage',
          value: mod.effect.damage
        })
      }
      if (mod.effect.extraAttack) {
        resolved.onHitEffects.push({
          type: 'extraAttack',
          value: 1
        })
      }
    }
  }
  
  for (const mod of onCritMods) {
    if (mod.type === 'onCrit' && 'effect' in mod) {
      if (mod.effect.damage) {
        resolved.onCritEffects.push({
          type: 'damage',
          value: mod.effect.damage
        })
      }
      if (mod.effect.extraAttack) {
        resolved.onCritEffects.push({
          type: 'extraAttack',
          value: 1
        })
      }
    }
  }
}

function applyWeaponTrainingModifiers(
  resolved: ResolvedAttack,
  modifiers: Modifier[]
) {
  const weaponTrainingMods = modifiers.filter(mod => mod.type === 'weaponTraining')
  
  for (const mod of weaponTrainingMods) {
    if (mod.type === 'weaponTraining') {
      const training = mod as any // WeaponTrainingModifier
      if (training.attackBonus > 0) {
        resolved.attackBonus += training.attackBonus
      }
      if (training.damageBonus > 0) {
        resolved.damageBonus += training.damageBonus
      }
    }
  }
}

/**
 * Apply toggle states from canonical build
 */
function applyToggleStates(
  resolved: ResolvedAttack,
  context: ResolveContext
) {
  // Apply power attack feats (GWM/SS)
  if (context.greatWeaponMaster && context.weaponCategory === 'melee') {
    const heavyWeapon = context.weaponProperties.includes('heavy')
    if (heavyWeapon) {
      resolved.attackBonus -= 5
      resolved.damageBonus += 10
    }
  }
  
  if (context.sharpshooter && context.weaponCategory === 'ranged') {
    resolved.attackBonus -= 5
    resolved.damageBonus += 10
  }
  
  // Apply spell effects
  if (context.hex) {
    resolved.onHitEffects.push({
      type: 'damage',
      value: 3.5, // 1d6 average
      condition: 'hex_target'
    })
    resolved.requiresConcentration = true
  }
  
  if (context.huntersMark) {
    resolved.onHitEffects.push({
      type: 'damage',
      value: 3.5, // 1d6 average
      condition: 'hunters_mark_target'
    })
    resolved.requiresConcentration = true
  }
  
  if (context.bless) {
    resolved.attackBonus += 2.5 // 1d4 average
  }
  
  if (context.faerieFire) {
    resolved.hasAdvantage = true
  }
}

/**
 * Calculate expected DPR from resolved attack
 */
export function calculateDPRFromResolved(
  resolved: ResolvedAttack,
  targetAC: number
): number {
  const hitProbability = calculateHitProbability(resolved.attackBonus, targetAC, resolved.hasAdvantage, resolved.elvenAccuracy)
  const critProbability = calculateCritProbability(resolved.critRange, resolved.hasAdvantage, resolved.elvenAccuracy)
  const nonCritProbability = Math.max(0, hitProbability - critProbability)
  
  // Base damage per attack
  const baseDamagePerHit = resolved.baseDamage + resolved.damageBonus
  const critDamage = baseDamagePerHit * 2 // Simplified crit damage
  
  // On-hit effects
  const onHitDamage = resolved.onHitEffects
    .filter(effect => effect.type === 'damage')
    .reduce((total, effect) => total + effect.value, 0)
  
  // On-crit effects  
  const onCritDamage = resolved.onCritEffects
    .filter(effect => effect.type === 'damage')
    .reduce((total, effect) => total + effect.value, 0)
  
  const expectedDamagePerAttack = 
    nonCritProbability * (baseDamagePerHit + onHitDamage) +
    critProbability * (critDamage + onHitDamage + onCritDamage)
  
  let totalDPR = expectedDamagePerAttack * resolved.attacksPerRound
  
  // Add bonus action attack if applicable
  if (resolved.bonusActionAttack && !resolved.usesBonusAction) {
    const baHitProb = calculateHitProbability(resolved.bonusActionAttack.attackBonus, targetAC, resolved.hasAdvantage, resolved.elvenAccuracy)
    const baDamage = resolved.bonusActionAttack.baseDamage + resolved.bonusActionAttack.damageBonus + onHitDamage
    totalDPR += baHitProb * baDamage
  }
  
  return totalDPR
}

function calculateHitProbability(
  attackBonus: number,
  targetAC: number,
  hasAdvantage: boolean,
  elvenAccuracy: boolean
): number {
  const baseHitChance = Math.max(0.05, Math.min(0.95, (21 + attackBonus - targetAC) / 20))
  
  if (elvenAccuracy) {
    // Roll three d20s, keep highest
    return 1 - Math.pow(1 - baseHitChance, 3)
  } else if (hasAdvantage) {
    // Roll two d20s, keep higher
    return 1 - Math.pow(1 - baseHitChance, 2)
  } else {
    return baseHitChance
  }
}

function calculateCritProbability(
  critRange: number,
  hasAdvantage: boolean,
  elvenAccuracy: boolean
): number {
  const baseCritChance = (21 - critRange) / 20 // 20 = 1/20, 19 = 2/20, etc.
  
  if (elvenAccuracy) {
    return 1 - Math.pow(1 - baseCritChance, 3)
  } else if (hasAdvantage) {
    return 1 - Math.pow(1 - baseCritChance, 2)
  } else {
    return baseCritChance
  }
}