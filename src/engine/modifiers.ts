/**
 * Composable typed modifiers system from review document
 * Normalizes feats/features/styles into typed modifiers for the rules engine
 */

export type ModifierType = 
  | 'toHit'           // Attack roll bonus/penalty (+2, -5)
  | 'damage'          // Flat damage bonus (+10, +2)
  | 'critRange'       // Crit range expansion (+1 = 19-20, +2 = 18-20)
  | 'advantage'       // Grants advantage on attacks
  | 'disadvantage'    // Causes disadvantage on attacks  
  | 'extraAttack'     // Additional attacks per turn (+1, +2)
  | 'bonusAction'     // Requires/provides bonus action
  | 'reaction'        // Uses reaction
  | 'onHit'           // Triggers on successful hit
  | 'onCrit'          // Triggers on critical hit
  | 'onKill'          // Triggers when target dies
  | 'concentration'   // Requires concentration
  | 'shortRest'       // Recharges on short rest
  | 'longRest'        // Recharges on long rest
  | 'passive'         // Always active passive effect
  | 'conditional'     // Only active under certain conditions
  | 'weaponTraining'  // Downtime weapon training bonuses

export type ModifierCondition = 
  | 'always'                    // Always active
  | 'heavy_weapon'              // Only with heavy weapons
  | 'ranged_weapon'             // Only with ranged weapons
  | 'melee_weapon'              // Only with melee weapons
  | 'two_handed'                // Only with two-handed weapons
  | 'light_weapon'              // Only with light weapons
  | 'finesse_weapon'            // Only with finesse weapons
  | 'crossbow'                  // Only with crossbows
  | 'polearm'                   // Only with polearms (glaive, halberd, etc.)
  | 'first_attack_of_turn'      // Only on first attack
  | 'subsequent_attacks'        // Only on attacks after first
  | 'advantage_on_attack'       // Only when attacking with advantage
  | 'target_below_full_hp'      // Only against damaged targets
  | 'concentration_active'      // Only while concentrating
  | 'specific_weapon'           // Only with a specific weapon ID

export interface BaseModifier {
  id: string
  name: string
  description: string
  source: string               // Feat/Feature/Class that provides this
  type: ModifierType
  condition: ModifierCondition
  value?: number              // Numeric value (damage bonus, attack bonus, etc.)
  uses?: {
    max: number               // Maximum uses
    recharge: 'shortRest' | 'longRest' | 'turn' | 'encounter'
  }
}

export interface ToHitModifier extends BaseModifier {
  type: 'toHit'
  value: number               // +2, -5, etc.
}

export interface DamageModifier extends BaseModifier {
  type: 'damage'
  value: number               // +10, +2, etc.
  damageType?: string         // 'slashing', 'piercing', etc.
}

export interface CritRangeModifier extends BaseModifier {
  type: 'critRange'
  value: number               // +1 = 19-20, +2 = 18-20
}

export interface AdvantageModifier extends BaseModifier {
  type: 'advantage' | 'disadvantage'
  elvenAccuracy?: boolean     // Special handling for Elven Accuracy
}

export interface ExtraAttackModifier extends BaseModifier {
  type: 'extraAttack'
  value: number               // Number of additional attacks
}

export interface ActionEconomyModifier extends BaseModifier {
  type: 'bonusAction' | 'reaction'
  requires?: string           // What action is required
  provides?: string           // What action is granted
  conflictsWith?: string[]    // Other modifiers this conflicts with
}

export interface TriggerModifier extends BaseModifier {
  type: 'onHit' | 'onCrit' | 'onKill'
  effect: {
    damage?: number
    extraAttack?: boolean
    restoreResource?: string
  }
}

export interface ResourceModifier extends BaseModifier {
  type: 'shortRest' | 'longRest' | 'concentration'
  duration?: number           // Duration in rounds (for concentration)
  breakOnDamage?: boolean     // For concentration spells
}

export interface PassiveModifier extends BaseModifier {
  type: 'passive'
}

export interface WeaponTrainingModifier extends BaseModifier {
  type: 'weaponTraining'
  weaponId: string        // Specific weapon this applies to
  attackBonus: number     // Training bonus to attack rolls
  damageBonus: number     // Training bonus to damage rolls
}

export type Modifier = 
  | ToHitModifier 
  | DamageModifier 
  | CritRangeModifier 
  | AdvantageModifier 
  | ExtraAttackModifier 
  | ActionEconomyModifier 
  | TriggerModifier 
  | ResourceModifier
  | PassiveModifier
  | WeaponTrainingModifier

/**
 * Convert feat features to typed modifiers
 */
export function featToModifiers(featId: string): Modifier[] {
  const modifiers: Modifier[] = []
  
  switch (featId) {
    case 'great_weapon_master':
      // GWM Power Attack: -5 to hit, +10 damage
      modifiers.push({
        id: 'gwm_power_attack_to_hit',
        name: 'GWM Power Attack To-Hit',
        description: 'Take -5 penalty to attack rolls',
        source: 'Great Weapon Master',
        type: 'toHit',
        condition: 'heavy_weapon',
        value: -5
      } as ToHitModifier)
      
      modifiers.push({
        id: 'gwm_power_attack_damage',
        name: 'GWM Power Attack Damage',
        description: 'Add +10 to damage rolls',
        source: 'Great Weapon Master',
        type: 'damage',
        condition: 'heavy_weapon',
        value: 10
      } as DamageModifier)
      
      // GWM Bonus Attack on crit/kill
      modifiers.push({
        id: 'gwm_bonus_attack',
        name: 'GWM Bonus Attack',
        description: 'Bonus action attack on crit or kill',
        source: 'Great Weapon Master',
        type: 'onCrit',
        condition: 'heavy_weapon',
        effect: { extraAttack: true }
      } as TriggerModifier)
      
      modifiers.push({
        id: 'gwm_kill_attack',
        name: 'GWM Kill Attack',
        description: 'Bonus action attack when reducing enemy to 0 HP',
        source: 'Great Weapon Master',
        type: 'onKill',
        condition: 'heavy_weapon',
        effect: { extraAttack: true }
      } as TriggerModifier)
      break
      
    case 'sharpshooter':
      // SS Power Attack: -5 to hit, +10 damage
      modifiers.push({
        id: 'ss_power_attack_to_hit',
        name: 'SS Power Attack To-Hit',
        description: 'Take -5 penalty to attack rolls',
        source: 'Sharpshooter',
        type: 'toHit',
        condition: 'ranged_weapon',
        value: -5
      } as ToHitModifier)
      
      modifiers.push({
        id: 'ss_power_attack_damage',
        name: 'SS Power Attack Damage',
        description: 'Add +10 to damage rolls',
        source: 'Sharpshooter',
        type: 'damage',
        condition: 'ranged_weapon',
        value: 10
      } as DamageModifier)
      break
      
    case 'crossbow_expert':
      // Bonus action hand crossbow attack
      modifiers.push({
        id: 'ce_bonus_attack',
        name: 'Crossbow Expert Bonus Attack',
        description: 'Bonus action hand crossbow attack',
        source: 'Crossbow Expert',
        type: 'bonusAction',
        condition: 'crossbow',
        provides: 'hand_crossbow_attack'
      } as ActionEconomyModifier)
      break
      
    case 'polearm_master':
      // Bonus action butt end attack
      modifiers.push({
        id: 'pam_bonus_attack',
        name: 'Polearm Master Bonus Attack',
        description: 'Bonus action attack with opposite end',
        source: 'Polearm Master',
        type: 'bonusAction',
        condition: 'polearm',
        provides: 'polearm_butt_attack'
      } as ActionEconomyModifier)
      break
      
    case 'elven_accuracy':
      modifiers.push({
        id: 'elven_accuracy_triple_advantage',
        name: 'Elven Accuracy',
        description: 'Roll three dice with advantage',
        source: 'Elven Accuracy',
        type: 'advantage',
        condition: 'advantage_on_attack',
        elvenAccuracy: true
      } as AdvantageModifier)
      break
      
    case 'lucky':
      modifiers.push({
        id: 'lucky_reroll',
        name: 'Lucky',
        description: 'Reroll attack rolls, ability checks, or saves',
        source: 'Lucky',
        type: 'passive',
        condition: 'always',
        uses: { max: 3, recharge: 'longRest' }
      } as PassiveModifier)
      break
  }
  
  return modifiers
}

/**
 * Convert fighting style to typed modifiers
 */
export function fightingStyleToModifiers(styleId: string): Modifier[] {
  const modifiers: Modifier[] = []
  
  switch (styleId) {
    case 'archery':
      modifiers.push({
        id: 'archery_to_hit',
        name: 'Archery Fighting Style',
        description: '+2 bonus to ranged weapon attack rolls',
        source: 'Archery Fighting Style',
        type: 'toHit',
        condition: 'ranged_weapon',
        value: 2
      } as ToHitModifier)
      break
      
    case 'dueling':
      modifiers.push({
        id: 'dueling_damage',
        name: 'Dueling Fighting Style',
        description: '+2 damage when wielding one-handed weapon with no other weapons',
        source: 'Dueling Fighting Style',
        type: 'damage',
        condition: 'always', // TODO: Add one-handed + no offhand condition
        value: 2
      } as DamageModifier)
      break
      
    case 'great_weapon_fighting':
      modifiers.push({
        id: 'gwf_reroll',
        name: 'Great Weapon Fighting',
        description: 'Reroll 1s and 2s on damage dice',
        source: 'Great Weapon Fighting Style',
        type: 'passive',
        condition: 'two_handed',
        value: 0 // Handled specially in damage calculation
      } as PassiveModifier)
      break
      
    case 'defense':
      // AC bonus - not directly combat-affecting for DPR
      modifiers.push({
        id: 'defense_ac',
        name: 'Defense Fighting Style',
        description: '+1 AC while wearing armor',
        source: 'Defense Fighting Style',
        type: 'passive',
        condition: 'always',
        value: 1
      } as PassiveModifier)
      break
  }
  
  return modifiers
}

/**
 * Convert class features to typed modifiers
 */
export function classFeatureToModifiers(featureId: string, level?: number): Modifier[] {
  const modifiers: Modifier[] = []
  
  switch (featureId) {
    case 'action_surge':
      modifiers.push({
        id: 'action_surge_extra_action',
        name: 'Action Surge',
        description: 'Gain additional action',
        source: 'Fighter',
        type: 'passive',
        condition: 'always',
        uses: { max: level && level >= 17 ? 2 : 1, recharge: 'shortRest' }
      } as PassiveModifier)
      break
      
    case 'extra_attack':
      const extraAttacks = level && level >= 20 ? 3 : level && level >= 11 ? 2 : 1
      modifiers.push({
        id: 'extra_attack_fighter',
        name: 'Extra Attack',
        description: `Make ${extraAttacks} additional attack${extraAttacks > 1 ? 's' : ''}`,
        source: 'Fighter',
        type: 'extraAttack',
        condition: 'always',
        value: extraAttacks
      } as ExtraAttackModifier)
      break
      
    case 'rage':
      modifiers.push({
        id: 'rage_damage',
        name: 'Rage Damage',
        description: 'Extra damage while raging',
        source: 'Barbarian',
        type: 'damage',
        condition: 'melee_weapon',
        value: level && level >= 16 ? 4 : level && level >= 9 ? 3 : 2
      } as DamageModifier)
      
      modifiers.push({
        id: 'rage_advantage',
        name: 'Reckless Attack',
        description: 'Advantage on Strength-based melee attacks',
        source: 'Barbarian',
        type: 'advantage',
        condition: 'melee_weapon'
      } as AdvantageModifier)
      break
      
    case 'sneak_attack':
      const sneakDice = Math.ceil((level || 1) / 2)
      modifiers.push({
        id: 'sneak_attack_damage',
        name: 'Sneak Attack',
        description: `Deal ${sneakDice}d6 extra damage`,
        source: 'Rogue',
        type: 'damage',
        condition: 'advantage_on_attack', // Simplified condition
        value: sneakDice * 3.5 // Average of d6
      } as DamageModifier)
      break
  }
  
  return modifiers
}

/**
 * Convert downtime training to weapon training modifiers
 */
export function downtimeTrainingToModifiers(downtimeTraining: any): Modifier[] {
  const modifiers: Modifier[] = []
  
  if (downtimeTraining?.weaponTraining) {
    for (const [weaponId, training] of Object.entries(downtimeTraining.weaponTraining)) {
      const trainingData = training as { attackBonus: number; damageBonus: number }
      
      if (trainingData.attackBonus > 0) {
        modifiers.push({
          id: `weapon_training_attack_${weaponId}`,
          name: `Weapon Training (${weaponId}) - Attack`,
          description: `+${trainingData.attackBonus} attack bonus from downtime training`,
          source: 'Downtime Training',
          type: 'weaponTraining',
          condition: 'specific_weapon',
          weaponId: weaponId,
          attackBonus: trainingData.attackBonus,
          damageBonus: 0
        } as WeaponTrainingModifier)
      }
      
      if (trainingData.damageBonus > 0) {
        modifiers.push({
          id: `weapon_training_damage_${weaponId}`,
          name: `Weapon Training (${weaponId}) - Damage`,
          description: `+${trainingData.damageBonus} damage bonus from downtime training`,
          source: 'Downtime Training',
          type: 'weaponTraining',
          condition: 'specific_weapon',
          weaponId: weaponId,
          attackBonus: 0,
          damageBonus: trainingData.damageBonus
        } as WeaponTrainingModifier)
      }
    }
  }
  
  return modifiers
}

/**
 * Compile all modifiers for a build into a single array
 */
export function compileModifiers(build: {
  feats: string[]
  fightingStyles: string[]
  features: string[]
  level: number
  downtimeTraining?: any
}): Modifier[] {
  const allModifiers: Modifier[] = []
  
  // Add feat modifiers
  for (const featId of build.feats) {
    allModifiers.push(...featToModifiers(featId))
  }
  
  // Add fighting style modifiers  
  for (const styleId of build.fightingStyles) {
    allModifiers.push(...fightingStyleToModifiers(styleId))
  }
  
  // Add class feature modifiers
  for (const featureId of build.features) {
    allModifiers.push(...classFeatureToModifiers(featureId, build.level))
  }
  
  // Add downtime training modifiers
  if (build.downtimeTraining) {
    allModifiers.push(...downtimeTrainingToModifiers(build.downtimeTraining))
  }
  
  return allModifiers
}

/**
 * Filter modifiers by type and condition
 */
export function filterModifiers(
  modifiers: Modifier[],
  type?: ModifierType,
  condition?: ModifierCondition
): Modifier[] {
  return modifiers.filter(mod => {
    if (type && mod.type !== type) return false
    if (condition && mod.condition !== condition && mod.condition !== 'always') return false
    return true
  })
}

/**
 * Check if modifier applies to current weapon/situation
 */
export function modifierApplies(
  modifier: Modifier,
  context: {
    weaponProperties: string[]
    weaponCategory: 'melee' | 'ranged'
    weaponId: string
    hasAdvantage: boolean
    round: number
  }
): boolean {
  switch (modifier.condition) {
    case 'always':
      return true
      
    case 'heavy_weapon':
      return context.weaponProperties.includes('heavy')
      
    case 'ranged_weapon':
      return context.weaponCategory === 'ranged'
      
    case 'melee_weapon':
      return context.weaponCategory === 'melee'
      
    case 'two_handed':
      return context.weaponProperties.includes('two-handed') || 
             context.weaponProperties.includes('heavy')
      
    case 'light_weapon':
      return context.weaponProperties.includes('light')
      
    case 'finesse_weapon':
      return context.weaponProperties.includes('finesse')
      
    case 'crossbow':
      return context.weaponProperties.includes('crossbow')
      
    case 'polearm':
      return ['glaive', 'halberd', 'quarterstaff', 'spear', 'pike']
        .some(weapon => context.weaponProperties.includes(weapon))
      
    case 'advantage_on_attack':
      return context.hasAdvantage
      
    case 'first_attack_of_turn':
      return context.round === 1
      
    case 'specific_weapon':
      // Check if this modifier applies to the current weapon
      if (modifier.type === 'weaponTraining') {
        return (modifier as WeaponTrainingModifier).weaponId === context.weaponId
      }
      return false
      
    default:
      return false
  }
}