// Round Scripts & Action Economy Engine
import type {
  RoundScripts,
  RoundScript,
  ActionOption,
  ResourcePool,
  ActionEconomyValidation,
  ActionViolation,
  ActionWarning,
  ResourceUsageBreakdown,
  ActionType
} from './types'

/**
 * Validates action economy for a complete round script sequence
 */
export function validateActionEconomy(scripts: RoundScripts): ActionEconomyValidation {
  const violations: ActionViolation[] = []
  const warnings: ActionWarning[] = []
  
  let currentResources = { ...scripts.initialResources }
  const resourceUsage: ResourceUsageBreakdown = {
    spellSlotsUsed: {},
    superiorityDiceUsed: 0,
    otherResourcesUsed: [],
    totalResourceValue: 0
  }

  // Validate each round
  const rounds = [scripts.round1, scripts.round2, scripts.round3]
  
  for (const round of rounds) {
    const roundValidation = validateSingleRound(round, currentResources)
    violations.push(...roundValidation.violations)
    warnings.push(...roundValidation.warnings)
    
    // Update resources for next round
    currentResources = roundValidation.remainingResources
    
    // Accumulate resource usage
    accumulateResourceUsage(resourceUsage, roundValidation.usedResources)
  }
  
  // Check for overall optimization warnings
  const optimizationWarnings = checkOptimizationWarnings(scripts, resourceUsage)
  warnings.push(...optimizationWarnings)

  return {
    isValid: violations.length === 0,
    violations,
    warnings,
    resourceUsage
  }
}

/**
 * Validates a single round for action economy violations
 */
export function validateSingleRound(
  round: RoundScript,
  availableResources: ResourcePool
): {
  violations: ActionViolation[]
  warnings: ActionWarning[]
  usedResources: Partial<ResourceUsageBreakdown>
  remainingResources: ResourcePool
} {
  const violations: ActionViolation[] = []
  const warnings: ActionWarning[] = []
  const usedResources: Partial<ResourceUsageBreakdown> = {
    spellSlotsUsed: {},
    superiorityDiceUsed: 0,
    otherResourcesUsed: []
  }
  const remainingResources = { ...availableResources }

  // Track action economy usage
  const actionEconomy = {
    action: false,
    bonusAction: false,
    reaction: false,
    movement: false
  }

  let concentrationEffect: string | undefined

  // Validate each action in the round
  for (const action of round.actions) {
    const { option } = action

    // Check action economy conflicts
    const economyViolation = checkActionEconomyConflict(
      option,
      actionEconomy,
      round.roundNumber
    )
    if (economyViolation) {
      violations.push(economyViolation)
    }

    // Check resource requirements
    const resourceViolation = checkResourceRequirements(
      option,
      remainingResources,
      round.roundNumber
    )
    if (resourceViolation) {
      violations.push(resourceViolation)
    } else {
      // Consume resources if valid
      consumeResources(option, remainingResources, usedResources)
    }

    // Check concentration conflicts
    const concentrationViolation = checkConcentrationConflict(
      option,
      concentrationEffect,
      round.roundNumber
    )
    if (concentrationViolation) {
      violations.push(concentrationViolation)
    }

    // Update state
    markActionEconomyUsed(option.type, actionEconomy)
    if (requiresConcentration(option)) {
      concentrationEffect = option.id
    }
  }

  // Check for unused action economy
  const unusedWarnings = checkUnusedActionEconomy(actionEconomy, round.roundNumber)
  warnings.push(...unusedWarnings)

  return {
    violations,
    warnings,
    usedResources,
    remainingResources
  }
}

/**
 * Checks for action economy conflicts (double action, double bonus action, etc.)
 */
function checkActionEconomyConflict(
  option: ActionOption,
  actionEconomy: Record<string, boolean>,
  roundNumber: 1 | 2 | 3
): ActionViolation | null {
  const actionTypeMap: Record<ActionType, keyof typeof actionEconomy> = {
    'action': 'action',
    'bonus-action': 'bonusAction',
    'reaction': 'reaction',
    'movement': 'movement',
    'free': 'action' // Free actions don't conflict, map to action for simplicity
  }

  const economyKey = actionTypeMap[option.type]
  
  if (option.type === 'free') {
    return null // Free actions never conflict
  }

  if (actionEconomy[economyKey]) {
    const actionTypeNames: Record<ActionType, string> = {
      'action': 'Action',
      'bonus-action': 'Bonus Action',
      'reaction': 'Reaction',
      'movement': 'Movement',
      'free': 'Free Action'
    }

    return {
      type: option.type === 'action' ? 'double-action' : 'double-bonus-action',
      roundNumber,
      actionIds: [option.id],
      message: `Cannot use multiple ${actionTypeNames[option.type]}s in the same round`
    }
  }

  return null
}

/**
 * Checks if character has sufficient resources for an action
 */
function checkResourceRequirements(
  option: ActionOption,
  availableResources: ResourcePool,
  roundNumber: 1 | 2 | 3
): ActionViolation | null {
  for (const cost of option.cost) {
    switch (cost.type) {
      case 'spell-slot':
        if (!cost.level || (availableResources.spellSlots[cost.level] || 0) < cost.amount) {
          return {
            type: 'insufficient-resources',
            roundNumber,
            actionIds: [option.id],
            message: `Insufficient spell slots (need level ${cost.level} x${cost.amount})`
          }
        }
        break
      
      case 'superiority-die':
        if (availableResources.superiorityDice < cost.amount) {
          return {
            type: 'insufficient-resources',
            roundNumber,
            actionIds: [option.id],
            message: `Insufficient superiority dice (need ${cost.amount})`
          }
        }
        break
      
      case 'action-surge':
        if (!availableResources.hasActionSurge) {
          return {
            type: 'insufficient-resources',
            roundNumber,
            actionIds: [option.id],
            message: 'Action Surge already used'
          }
        }
        break

      case 'rage':
        if (!availableResources.hasRage) {
          return {
            type: 'insufficient-resources',
            roundNumber,
            actionIds: [option.id],
            message: 'Rage already used'
          }
        }
        break
    }
  }

  return null
}

/**
 * Checks for concentration conflicts between spells/effects
 */
function checkConcentrationConflict(
  option: ActionOption,
  currentConcentration: string | undefined,
  roundNumber: 1 | 2 | 3
): ActionViolation | null {
  if (requiresConcentration(option) && currentConcentration && currentConcentration !== option.id) {
    return {
      type: 'concentration-conflict',
      roundNumber,
      actionIds: [option.id, currentConcentration],
      message: `Cannot maintain concentration on multiple effects`
    }
  }
  
  return null
}

/**
 * Consumes resources when an action is used
 */
function consumeResources(
  option: ActionOption,
  remainingResources: ResourcePool,
  usedResources: Partial<ResourceUsageBreakdown>
): void {
  for (const cost of option.cost) {
    switch (cost.type) {
      case 'spell-slot':
        if (cost.level) {
          remainingResources.spellSlots[cost.level] = 
            (remainingResources.spellSlots[cost.level] || 0) - cost.amount
          usedResources.spellSlotsUsed![cost.level] = 
            (usedResources.spellSlotsUsed![cost.level] || 0) + cost.amount
        }
        break
      
      case 'superiority-die':
        remainingResources.superiorityDice -= cost.amount
        usedResources.superiorityDiceUsed! += cost.amount
        break
      
      case 'action-surge':
        remainingResources.hasActionSurge = false
        usedResources.otherResourcesUsed!.push('Action Surge')
        break

      case 'rage':
        remainingResources.hasRage = false
        usedResources.otherResourcesUsed!.push('Rage')
        break
    }
  }
}

/**
 * Marks action economy as used for the round
 */
function markActionEconomyUsed(actionType: ActionType, actionEconomy: Record<string, boolean>): void {
  switch (actionType) {
    case 'action':
      actionEconomy.action = true
      break
    case 'bonus-action':
      actionEconomy.bonusAction = true
      break
    case 'reaction':
      actionEconomy.reaction = true
      break
    case 'movement':
      actionEconomy.movement = true
      break
    case 'free':
      // Free actions don't consume action economy
      break
  }
}

/**
 * Checks if an action requires concentration
 */
function requiresConcentration(option: ActionOption): boolean {
  return option.effects.some(effect => 
    effect.type === 'concentration' || 
    effect.duration === 'until-concentration-ends'
  )
}

/**
 * Warns about unused action economy opportunities
 */
function checkUnusedActionEconomy(
  actionEconomy: Record<string, boolean>,
  roundNumber: 1 | 2 | 3
): ActionWarning[] {
  const warnings: ActionWarning[] = []

  if (!actionEconomy.action) {
    warnings.push({
      type: 'unused-action',
      roundNumber,
      message: 'Action not used this round',
      suggestion: 'Consider using Attack, Cast a Spell, or other Action'
    })
  }

  if (!actionEconomy.bonusAction) {
    warnings.push({
      type: 'unused-action',
      roundNumber,
      message: 'Bonus Action not used this round',
      suggestion: 'Consider using available Bonus Action abilities'
    })
  }

  return warnings
}

/**
 * Accumulates resource usage across rounds
 */
function accumulateResourceUsage(
  total: ResourceUsageBreakdown,
  roundUsage: Partial<ResourceUsageBreakdown>
): void {
  // Accumulate spell slots
  if (roundUsage.spellSlotsUsed) {
    for (const [level, count] of Object.entries(roundUsage.spellSlotsUsed)) {
      const levelNum = parseInt(level)
      total.spellSlotsUsed[levelNum] = (total.spellSlotsUsed[levelNum] || 0) + count
    }
  }

  // Accumulate other resources
  total.superiorityDiceUsed += roundUsage.superiorityDiceUsed || 0
  if (roundUsage.otherResourcesUsed) {
    total.otherResourcesUsed.push(...roundUsage.otherResourcesUsed)
  }
}

/**
 * Checks for overall optimization warnings across all rounds
 */
function checkOptimizationWarnings(
  scripts: RoundScripts,
  resourceUsage: ResourceUsageBreakdown
): ActionWarning[] {
  const warnings: ActionWarning[] = []

  // Check for unused high-level spell slots
  const highLevelSlots = [3, 4, 5, 6, 7, 8, 9]
  for (const level of highLevelSlots) {
    const available = scripts.initialResources.spellSlots[level] || 0
    const used = resourceUsage.spellSlotsUsed[level] || 0
    
    if (available > 0 && used === 0) {
      warnings.push({
        type: 'suboptimal-resource-use',
        roundNumber: 1, // General warning
        message: `Unused level ${level} spell slots`,
        suggestion: `Consider using higher level spells or upcasting`
      })
    }
  }

  return warnings
}

/**
 * Creates a default resource pool based on character level and class
 */
export function createDefaultResourcePool(
  _characterLevel: number,
  classes: { classId: string; levels: number }[]
): ResourcePool {
  const resourcePool: ResourcePool = {
    spellSlots: {},
    superiorityDice: 0,
    kiPoints: 0,
    sorceryPoints: 0,
    hasActionSurge: false,
    hasRage: false,
    hasSecondWind: false
  }

  // Calculate spell slots based on multiclass rules
  let fullCasterLevels = 0
  let halfCasterLevels = 0
  let thirdCasterLevels = 0
  
  for (const classEntry of classes) {
    const { classId, levels } = classEntry
    
    // Full casters
    if (['wizard', 'cleric', 'sorcerer', 'bard', 'druid', 'warlock'].includes(classId)) {
      fullCasterLevels += levels
    }
    // Half casters
    else if (['paladin', 'ranger', 'artificer'].includes(classId)) {
      halfCasterLevels += levels
    }
    // Third casters
    else if (classId === 'fighter' || classId === 'rogue') {
      thirdCasterLevels += levels
    }

    // Class-specific resources
    if (classId === 'fighter') {
      resourcePool.hasActionSurge = levels >= 2
      resourcePool.superiorityDice = levels >= 3 ? Math.min(6, 4 + Math.floor((levels - 3) / 7)) : 0
    } else if (classId === 'barbarian') {
      resourcePool.hasRage = levels >= 1
    } else if (classId === 'monk') {
      resourcePool.kiPoints = levels >= 2 ? levels : 0
    } else if (classId === 'sorcerer') {
      resourcePool.sorceryPoints = levels >= 2 ? levels : 0
    }
  }

  // Calculate multiclass caster level
  const casterLevel = fullCasterLevels + Math.floor(halfCasterLevels / 2) + Math.floor(thirdCasterLevels / 3)
  
  // Assign spell slots based on caster level
  if (casterLevel > 0) {
    const spellSlotTable = getSpellSlotTable(casterLevel)
    resourcePool.spellSlots = spellSlotTable
  }

  return resourcePool
}

/**
 * Gets spell slots for a given caster level
 */
function getSpellSlotTable(casterLevel: number): Record<number, number> {
  // Simplified spell slot progression (Level 1-20)
  const slotProgression: Record<number, number>[] = [
    {},  // Level 0
    { 1: 2 },  // Level 1
    { 1: 3 },  // Level 2
    { 1: 4, 2: 2 },  // Level 3
    { 1: 4, 2: 3 },  // Level 4
    { 1: 4, 2: 3, 3: 2 },  // Level 5
    { 1: 4, 2: 3, 3: 3 },  // Level 6
    { 1: 4, 2: 3, 3: 3, 4: 1 },  // Level 7
    { 1: 4, 2: 3, 3: 3, 4: 2 },  // Level 8
    { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },  // Level 9
    { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },  // Level 10
    { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },  // Level 11
    { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },  // Level 12
    { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },  // Level 13
    { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },  // Level 14
    { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },  // Level 15
    { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },  // Level 16
    { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },  // Level 17
    { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },  // Level 18
    { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },  // Level 19
    { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 },  // Level 20
  ]

  const clampedLevel = Math.max(0, Math.min(20, casterLevel))
  return slotProgression[clampedLevel] || {}
}