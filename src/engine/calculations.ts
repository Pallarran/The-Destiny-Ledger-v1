import type { 
  DamageRoll, 
  DiceRoll, 
  CombatState, 
  DPRCalculationResult,
  SimulationConfig,
  WeaponConfig
} from './types'

// Core probability calculations
export function calculateHitProbability(
  attackBonus: number,
  targetAC: number,
  advantage: 'normal' | 'advantage' | 'disadvantage' = 'normal'
): { hit: number; crit: number; miss: number } {
  // Base hit probability (need to roll AC - attackBonus or higher on d20)
  const targetRoll = targetAC - attackBonus
  const baseHitChance = Math.max(0.05, Math.min(0.95, (21 - targetRoll) / 20))
  const baseCritChance = 0.05 // Natural 20
  
  let hitChance: number
  let critChance: number
  
  switch (advantage) {
    case 'advantage':
      // Roll twice, take higher
      hitChance = 1 - Math.pow(1 - baseHitChance, 2)
      critChance = 1 - Math.pow(1 - baseCritChance, 2)
      break
    case 'disadvantage':
      // Roll twice, take lower
      hitChance = Math.pow(baseHitChance, 2)
      critChance = Math.pow(baseCritChance, 2)
      break
    default:
      hitChance = baseHitChance
      critChance = baseCritChance
  }
  
  // Crit is included in hit, so adjust
  const normalHit = hitChance - critChance
  const miss = 1 - hitChance
  
  return {
    hit: normalHit,
    crit: critChance,
    miss
  }
}

// Calculate expected damage from dice
export function calculateDiceExpectedValue(dice: DiceRoll): number {
  let averageDie = (dice.die + 1) / 2
  
  // Handle Great Weapon Fighting rerolls
  if (dice.rerollOnes || dice.rerollTwos) {
    // Calculate new expected value with rerolls
    let sum = 0
    let count = 0
    
    for (let i = 1; i <= dice.die; i++) {
      if ((i === 1 && dice.rerollOnes) || (i === 2 && dice.rerollTwos)) {
        // Reroll this value - it becomes the average
        sum += averageDie
      } else {
        sum += i
      }
      count++
    }
    
    averageDie = sum / count
  }
  
  return dice.count * averageDie
}

// Calculate total damage from a damage roll
export function calculateDamageRoll(damage: DamageRoll): number {
  let total = damage.bonusDamage
  
  // Add base dice
  for (const dice of damage.baseDice) {
    total += calculateDiceExpectedValue(dice)
  }
  
  // Add additional dice (sneak attack, hunter's mark, etc.)
  if (damage.additionalDice) {
    for (const dice of damage.additionalDice) {
      total += calculateDiceExpectedValue(dice)
    }
  }
  
  return total
}

// Calculate DPR for a single attack
export function calculateSingleAttackDPR(
  attackBonus: number,
  damage: DamageRoll,
  targetAC: number,
  advantage: 'normal' | 'advantage' | 'disadvantage' = 'normal'
): number {
  const probs = calculateHitProbability(attackBonus, targetAC, advantage)
  const normalDamage = calculateDamageRoll(damage)
  
  // On crit, double the dice (not modifiers)
  const critBonusDamage = damage.baseDice.reduce((sum, dice) => 
    sum + calculateDiceExpectedValue(dice), 0
  )
  
  // Add additional dice crit damage
  const additionalCritDamage = damage.additionalDice?.reduce((sum, dice) => 
    sum + calculateDiceExpectedValue(dice), 0
  ) || 0
  
  const critDamage = normalDamage + critBonusDamage + additionalCritDamage
  
  // Expected damage = (hit% * normal damage) + (crit% * crit damage)
  return (probs.hit * normalDamage) + (probs.crit * critDamage)
}

// Calculate GWM/SS threshold
export function shouldUsePowerAttack(
  baseAttackBonus: number,
  baseDamage: number,
  targetAC: number,
  advantage: 'normal' | 'advantage' | 'disadvantage' = 'normal'
): boolean {
  // Calculate DPR without power attack
  const normalDPR = calculateSingleAttackDPR(
    baseAttackBonus,
    { baseDice: [], bonusDamage: baseDamage, additionalDice: [] },
    targetAC,
    advantage
  )
  
  // Calculate DPR with power attack (-5 to hit, +10 damage)
  const powerAttackDPR = calculateSingleAttackDPR(
    baseAttackBonus - 5,
    { baseDice: [], bonusDamage: baseDamage + 10, additionalDice: [] },
    targetAC,
    advantage
  )
  
  return powerAttackDPR > normalDPR
}

// Main DPR calculation for a build
export function calculateBuildDPR(
  state: CombatState,
  weapon: WeaponConfig,
  config: SimulationConfig
): DPRCalculationResult {
  // Calculate total attack bonus
  let attackBonus = state.proficiencyBonus + state.abilityModifier + weapon.enhancement
  attackBonus += state.attackBonuses.reduce((sum, bonus) => sum + bonus, 0)
  
  // Apply fighting style bonuses
  if (state.fightingStyles.includes('archery') && weapon.properties.includes('ammunition')) {
    attackBonus += 2
  }
  
  // Apply buff bonuses
  if (state.hasBless) {
    attackBonus += 2.5 // Average of d4
  }
  if (state.hasElementalWeapon) {
    attackBonus += 1
  }
  
  // Calculate damage
  const baseDamage: DamageRoll = {
    baseDice: [{
      ...weapon.baseDamage,
      rerollOnes: state.fightingStyles.includes('gwf') && weapon.properties.includes('two-handed'),
      rerollTwos: state.fightingStyles.includes('gwf') && weapon.properties.includes('two-handed')
    }],
    bonusDamage: state.abilityModifier + weapon.enhancement,
    additionalDice: []
  }
  
  // Add damage bonuses
  baseDamage.bonusDamage += state.damageBonuses.reduce((sum, bonus) => sum + bonus, 0)
  
  // Apply fighting style damage bonuses
  if (state.fightingStyles.includes('dueling') && !weapon.properties.includes('two-handed')) {
    baseDamage.bonusDamage += 2
  }
  
  // Add additional damage dice
  if (state.sneakAttackDice > 0) {
    baseDamage.additionalDice?.push({
      count: state.sneakAttackDice,
      die: 6,
      rerollOnes: false,
      rerollTwos: false
    })
  }
  
  if (state.hasHuntersMark || state.hasHex) {
    baseDamage.additionalDice?.push({
      count: 1,
      die: 6,
      rerollOnes: false,
      rerollTwos: false
    })
  }
  
  if (state.hasElementalWeapon) {
    baseDamage.additionalDice?.push({
      count: 1,
      die: 4,
      rerollOnes: false,
      rerollTwos: false
    })
  }
  
  // Determine advantage state
  let advantageState: 'normal' | 'advantage' | 'disadvantage' = 'normal'
  if (state.hasAdvantage && !state.hasDisadvantage) {
    advantageState = 'advantage'
  } else if (state.hasDisadvantage && !state.hasAdvantage) {
    advantageState = 'disadvantage'
  }
  
  // Determine if we should use GWM/SS
  let useGWMSS = false
  let gwmssAttackBonus = attackBonus
  const gwmssDamage = { ...baseDamage }
  
  if ((state.hasGWM && weapon.properties.includes('heavy')) || 
      (state.hasSharpshooter && weapon.properties.includes('ammunition'))) {
    if (config.autoGWMSS) {
      const normalDamage = calculateDamageRoll(baseDamage)
      useGWMSS = shouldUsePowerAttack(attackBonus, normalDamage, config.targetAC, advantageState)
    }
    
    if (useGWMSS) {
      gwmssAttackBonus = attackBonus - 5
      gwmssDamage.bonusDamage += 10
    }
  }
  
  // Calculate attacks per round
  let attacksPerRound = 1 + state.extraAttacks
  if (state.hasHaste) {
    attacksPerRound += 1 // Haste gives one extra weapon attack
  }
  
  // Calculate DPR
  const finalAttackBonus = useGWMSS ? gwmssAttackBonus : attackBonus
  const finalDamage = useGWMSS ? gwmssDamage : baseDamage
  
  const dprPerAttack = calculateSingleAttackDPR(
    finalAttackBonus,
    finalDamage,
    config.targetAC,
    advantageState
  )
  
  // Calculate rounds
  let round1DPR = dprPerAttack * attacksPerRound
  const round2DPR = round1DPR
  const round3DPR = round1DPR
  
  // Action surge on round 1 if available and greedy
  if (state.actionSurge && config.greedyResourceUse) {
    round1DPR += (dprPerAttack * attacksPerRound)
  }
  
  const totalDPR = round1DPR + round2DPR + round3DPR
  const averageDPR = totalDPR / 3
  
  // Debug logging for all DPR calculations
  console.log('DPR Calculation Debug:', {
    averageDPR,
    totalDPR,
    dprPerAttack,
    attacksPerRound,
    finalAttackBonus,
    baseDamage: calculateDamageRoll(baseDamage),
    finalDamage: calculateDamageRoll(finalDamage),
    targetAC: config.targetAC,
    actionSurge: state.actionSurge,
    useGWMSS,
    round1DPR,
    round2DPR,
    round3DPR,
    probs: calculateHitProbability(finalAttackBonus, config.targetAC, advantageState)
  })
  
  // Calculate hit/crit/miss for display
  const probs = calculateHitProbability(finalAttackBonus, config.targetAC, advantageState)
  
  return {
    hitChance: probs.hit,
    critChance: probs.crit,
    missChance: probs.miss,
    normalDamage: calculateDamageRoll(baseDamage),
    critDamage: calculateDamageRoll(baseDamage) * 2, // Simplified
    expectedDamagePerAttack: dprPerAttack,
    attacksPerRound,
    expectedDPR: averageDPR,
    withPowerAttack: useGWMSS ? averageDPR : undefined,
    withoutPowerAttack: useGWMSS ? undefined : averageDPR,
    shouldUsePowerAttack: useGWMSS,
    breakdown: {
      round1: round1DPR,
      round2: round2DPR,
      round3: round3DPR,
      average: averageDPR,
      total: totalDPR
    }
  }
}