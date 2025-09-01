/**
 * Integration layer between canonical builds and the new modifier system
 * Bridges the gap between BuildConfiguration and ResolvedAttack
 */

import type { BuildConfiguration, CanonicalBuild } from '../stores/types'
import { getCanonicalBuild } from '../utils/buildConverter'
import { compileModifiers } from './modifiers'
import { resolveAttack, calculateDPRFromResolved, type ResolveContext } from './resolver'
import { weapons } from '../rules/srd/weapons'

/**
 * Calculate DPR for a build using the new modifier system
 */
export function calculateBuildDPR(
  build: BuildConfiguration,
  targetAC: number = 16,
  options: {
    round?: number
    hasAdvantage?: boolean
    greedyResourceUse?: boolean
  } = {}
): number {
  const canonical = getCanonicalBuild(build)
  const context = buildToResolveContext(canonical, build, targetAC, options)
  
  // Compile all modifiers (including downtime training)
  const modifiers = compileModifiers({
    feats: canonical.feats,
    fightingStyles: canonical.fightingStyles,
    features: canonical.features,
    level: canonical.identity.level,
    downtimeTraining: build.downtimeTraining
  })
  
  // Resolve into final attack
  const resolved = resolveAttack(modifiers, context)
  
  // Calculate DPR
  return calculateDPRFromResolved(resolved, targetAC)
}

/**
 * Convert build to resolve context for modifier system
 */
function buildToResolveContext(
  canonical: CanonicalBuild,
  _build: BuildConfiguration, // Need for downtime training (currently unused)
  targetAC: number,
  options: {
    round?: number
    hasAdvantage?: boolean
    greedyResourceUse?: boolean
  }
): ResolveContext {
  // Get weapon info
  const weaponId = canonical.equipment.weapons[0] || 'longsword'
  const weapon = weapons[weaponId]
  
  if (!weapon) {
    throw new Error(`Unknown weapon: ${weaponId}`)
  }
  
  // Determine primary ability
  const isRanged = weapon.category === 'ranged'
  const isFinesse = weapon.properties.includes('finesse')
  const primaryAbility = isRanged ? 'DEX' : 
                        (isFinesse && canonical.abilities.DEX > canonical.abilities.STR) ? 'DEX' : 'STR'
  
  const abilityMod = Math.floor((canonical.abilities[primaryAbility] - 10) / 2)
  const proficiencyBonus = Math.ceil(canonical.identity.level / 4) + 1 // 2-6 based on level
  
  // Calculate weapon base damage (simplified)
  const baseDamage = weapon.damage.reduce((total, roll) => 
    total + (roll.count * ((roll.die / 2) + 0.5)) + roll.bonus, 0
  )
  
  return {
    level: canonical.identity.level,
    proficiencyBonus,
    abilityMod,
    weaponId,
    weaponProperties: weapon.properties,
    weaponCategory: weapon.category,
    weaponBaseDamage: baseDamage,
    round: options.round || 1,
    hasAdvantage: options.hasAdvantage || canonical.toggles.advantage !== 'normal',
    targetAC,
    
    // Toggle states from canonical build
    sharpshooter: canonical.toggles.sharpshooter || false,
    greatWeaponMaster: canonical.toggles.greatWeaponMaster || false,
    hex: canonical.toggles.hex || false,
    huntersMark: canonical.toggles.huntersMark || false,
    bless: canonical.toggles.bless || false,
    faerieFire: canonical.toggles.faerieFire || false,
    
    // Resource tracking (simplified)
    actionSurgeRemaining: canonical.resources.actionSurge || 0,
    superiorityDiceRemaining: canonical.resources.superiorityDice?.count || 0,
    pactSlotsRemaining: canonical.resources.pactSlots?.count || 0
  }
}

/**
 * Analyze a build and return modifier breakdown
 */
export function analyzeBuildModifiers(build: BuildConfiguration): {
  modifiers: Array<{
    name: string
    source: string
    type: string
    description: string
    value?: number
  }>
  summary: {
    totalAttackBonus: number
    totalDamageBonus: number
    extraAttacks: number
    advantageSources: string[]
    bonusActionUses: string[]
  }
} {
  const canonical = getCanonicalBuild(build)
  const context = buildToResolveContext(canonical, build, 16, {})
  
  const modifiers = compileModifiers({
    feats: canonical.feats,
    fightingStyles: canonical.fightingStyles,
    features: canonical.features,
    level: canonical.identity.level
  })
  
  const resolved = resolveAttack(modifiers, context)
  
  return {
    modifiers: modifiers.map(mod => ({
      name: mod.name,
      source: mod.source,
      type: mod.type,
      description: mod.description,
      value: 'value' in mod ? mod.value : undefined
    })),
    summary: {
      totalAttackBonus: resolved.attackBonus,
      totalDamageBonus: resolved.damageBonus,
      extraAttacks: resolved.attacksPerRound - 1,
      advantageSources: modifiers
        .filter(mod => mod.type === 'advantage')
        .map(mod => mod.source),
      bonusActionUses: modifiers
        .filter(mod => mod.type === 'bonusAction')
        .map(mod => mod.source)
    }
  }
}

/**
 * Compare two builds using the modifier system
 */
export function compareBuildsDPR(
  buildA: BuildConfiguration,
  buildB: BuildConfiguration,
  targetACs: number[] = [10, 12, 14, 16, 18, 20]
): {
  buildA: Array<{ ac: number; dpr: number }>
  buildB: Array<{ ac: number; dpr: number }>
  winner: Array<{ ac: number; winner: 'A' | 'B' | 'tie' }>
} {
  const buildAResults = targetACs.map(ac => ({
    ac,
    dpr: calculateBuildDPR(buildA, ac)
  }))
  
  const buildBResults = targetACs.map(ac => ({
    ac,
    dpr: calculateBuildDPR(buildB, ac)
  }))
  
  const winner = targetACs.map((ac, index) => {
    const aDpr = buildAResults[index].dpr
    const bDpr = buildBResults[index].dpr
    const diff = Math.abs(aDpr - bDpr)
    
    return {
      ac,
      winner: diff < 0.1 ? 'tie' as const : 
              aDpr > bDpr ? 'A' as const : 'B' as const
    }
  })
  
  return {
    buildA: buildAResults,
    buildB: buildBResults,
    winner
  }
}

/**
 * Find optimal power attack usage (GWM/SS)
 */
export function findOptimalPowerAttack(
  build: BuildConfiguration,
  targetACs: number[] = [10, 12, 14, 16, 18, 20, 22, 24]
): Array<{
  ac: number
  withPowerAttack: number
  withoutPowerAttack: number
  useGWMSS: boolean
}> {
  const canonical = getCanonicalBuild(build)
  
  return targetACs.map(ac => {
    // Calculate with power attack
    const canonicalWith = { ...canonical }
    canonicalWith.toggles.greatWeaponMaster = true
    canonicalWith.toggles.sharpshooter = true
    
    const withPowerAttack = calculateBuildDPR(
      { ...build, canonicalBuild: canonicalWith }, 
      ac
    )
    
    // Calculate without power attack
    const canonicalWithout = { ...canonical }
    canonicalWithout.toggles.greatWeaponMaster = false
    canonicalWithout.toggles.sharpshooter = false
    
    const withoutPowerAttack = calculateBuildDPR(
      { ...build, canonicalBuild: canonicalWithout }, 
      ac
    )
    
    return {
      ac,
      withPowerAttack,
      withoutPowerAttack,
      useGWMSS: withPowerAttack > withoutPowerAttack
    }
  })
}