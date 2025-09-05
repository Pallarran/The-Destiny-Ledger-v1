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
      
    case 'extra_attack_1':
      modifiers.push({
        id: 'extra_attack_fighter_1',
        name: 'Extra Attack',
        description: 'Make 1 additional attack',
        source: 'Fighter 5',
        type: 'extraAttack',
        condition: 'always',
        value: 1
      } as ExtraAttackModifier)
      break
      
    case 'extra_attack_2':
      modifiers.push({
        id: 'extra_attack_fighter_2', 
        name: 'Extra Attack (2)',
        description: 'Make 2 additional attacks',
        source: 'Fighter 11',
        type: 'extraAttack',
        condition: 'always',
        value: 2
      } as ExtraAttackModifier)
      break
      
    case 'extra_attack_3':
      modifiers.push({
        id: 'extra_attack_fighter_3',
        name: 'Extra Attack (3)',
        description: 'Make 3 additional attacks',
        source: 'Fighter 20', 
        type: 'extraAttack',
        condition: 'always',
        value: 3
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
      
    // === FIGHTER SUBCLASS FEATURES ===
    case 'improved_critical':
      modifiers.push({
        id: 'improved_critical_range',
        name: 'Improved Critical',
        description: 'Critical hits on 19-20',
        source: 'Champion',
        type: 'critRange',
        condition: 'always',
        value: 1 // Expands crit range by 1 (19-20 instead of 20)
      } as CritRangeModifier)
      break
      
    case 'superior_critical':
      modifiers.push({
        id: 'superior_critical_range',
        name: 'Superior Critical',
        description: 'Critical hits on 18-20',
        source: 'Champion',
        type: 'critRange',
        condition: 'always',
        value: 2 // Expands crit range by 2 (18-20 instead of 20)
      } as CritRangeModifier)
      break
      
    case 'combat_superiority':
      // Battle Master superiority dice add average damage
      modifiers.push({
        id: 'superiority_dice_damage',
        name: 'Combat Superiority',
        description: 'Maneuver damage with superiority dice',
        source: 'Battle Master',
        type: 'damage',
        condition: 'always',
        value: 4.5, // Average of d8 superiority die
        uses: { max: 4, recharge: 'shortRest' }
      } as DamageModifier)
      break
      
    case 'improved_combat_superiority':
      // Battle Master superiority dice upgrade to d10s
      modifiers.push({
        id: 'improved_superiority_dice_damage',
        name: 'Improved Combat Superiority',
        description: 'Maneuver damage with improved superiority dice',
        source: 'Battle Master',
        type: 'damage',
        condition: 'always',
        value: 5.5, // Average of d10 superiority die
        uses: { max: level && level >= 18 ? 6 : 5, recharge: 'shortRest' }
      } as DamageModifier)
      break
      
    case 'war_magic':
      modifiers.push({
        id: 'war_magic_bonus_attack',
        name: 'War Magic',
        description: 'Bonus action weapon attack after cantrip',
        source: 'Eldritch Knight',
        type: 'bonusAction',
        condition: 'always',
        provides: 'weapon_attack'
      } as ActionEconomyModifier)
      break
      
    case 'improved_war_magic':
      modifiers.push({
        id: 'improved_war_magic_bonus_attack',
        name: 'Improved War Magic',
        description: 'Bonus action weapon attack after spell',
        source: 'Eldritch Knight',
        type: 'bonusAction',
        condition: 'always',
        provides: 'weapon_attack'
      } as ActionEconomyModifier)
      break
      
    // === ROGUE SUBCLASS FEATURES ===
    case 'thiefs_reflexes':
      modifiers.push({
        id: 'thiefs_reflexes_extra_turn',
        name: 'Thief\'s Reflexes',
        description: 'Two turns on first round',
        source: 'Thief',
        type: 'extraAttack',
        condition: 'first_attack_of_turn',
        value: 1 // Effectively doubles attacks on first round
      } as ExtraAttackModifier)
      break
      
    case 'assassinate':
      modifiers.push({
        id: 'assassinate_advantage',
        name: 'Assassinate',
        description: 'Advantage vs creatures that haven\'t acted',
        source: 'Assassin',
        type: 'advantage',
        condition: 'first_attack_of_turn' // Simplified - in real combat, track initiative
      } as AdvantageModifier)
      
      modifiers.push({
        id: 'assassinate_autocrit',
        name: 'Assassinate Auto-Crit',
        description: 'Auto-crit on surprised targets',
        source: 'Assassin',
        type: 'onHit',
        condition: 'first_attack_of_turn', // Simplified condition
        effect: { damage: 0 } // Handled specially as guaranteed crit
      } as TriggerModifier)
      break
      
    case 'death_strike':
      modifiers.push({
        id: 'death_strike_damage',
        name: 'Death Strike',
        description: 'Double damage on surprised targets',
        source: 'Assassin',
        type: 'onHit',
        condition: 'first_attack_of_turn', // Simplified condition
        effect: { damage: 0 } // Handled specially - doubles total damage
      } as TriggerModifier)
      break
      
    // === WIZARD SUBCLASS FEATURES ===
    case 'potent_cantrip':
      modifiers.push({
        id: 'potent_cantrip_damage',
        name: 'Potent Cantrip',
        description: 'Half damage on save vs cantrips',
        source: 'Evocation Wizard',
        type: 'passive',
        condition: 'always',
        value: 0 // Handled specially in spell damage calculation
      } as PassiveModifier)
      break
      
    case 'empowered_evocation':
      modifiers.push({
        id: 'empowered_evocation_damage',
        name: 'Empowered Evocation',
        description: 'Add INT modifier to evocation spell damage',
        source: 'Evocation Wizard',
        type: 'damage',
        condition: 'always',
        value: Math.floor(((level || 10) >= 20 ? 20 : 16 - 10) / 2) // Simplified INT mod based on level
      } as DamageModifier)
      break
      
    case 'overchannel':
      modifiers.push({
        id: 'overchannel_damage',
        name: 'Overchannel',
        description: 'Maximum damage on spells',
        source: 'Evocation Wizard',
        type: 'passive',
        condition: 'always',
        uses: { max: 1, recharge: 'longRest' }
      } as PassiveModifier)
      break
      
    case 'portent':
      modifiers.push({
        id: 'portent_advantage',
        name: 'Portent',
        description: 'Replace rolls with portent dice',
        source: 'Divination Wizard',
        type: 'passive',
        condition: 'always',
        uses: { max: level && level >= 14 ? 3 : 2, recharge: 'longRest' }
      } as PassiveModifier)
      break
      
    // === BARBARIAN SUBCLASS FEATURES ===
    case 'frenzy':
      modifiers.push({
        id: 'frenzy_bonus_attack',
        name: 'Frenzy',
        description: 'Bonus action attack while raging',
        source: 'Berserker',
        type: 'bonusAction',
        condition: 'melee_weapon',
        provides: 'frenzy_attack'
      } as ActionEconomyModifier)
      break
      
    case 'retaliation':
      modifiers.push({
        id: 'retaliation_reaction',
        name: 'Retaliation',
        description: 'Reaction attack when taking damage',
        source: 'Berserker',
        type: 'reaction',
        condition: 'melee_weapon'
      } as ActionEconomyModifier)
      break
      
    case 'totem_spirit':
      // Bear spirit provides resistance, Eagle provides advantage, Wolf provides pack tactics
      modifiers.push({
        id: 'totem_spirit_bear',
        name: 'Totem Spirit (Bear)',
        description: 'Resistance to all damage except psychic while raging',
        source: 'Totem Warrior',
        type: 'passive',
        condition: 'always'
      } as PassiveModifier)
      break
      
    // === CLERIC SUBCLASS FEATURES ===
    case 'divine_strike_life':
      modifiers.push({
        id: 'divine_strike_radiant',
        name: 'Divine Strike (Life)',
        description: 'Extra 1d8 radiant damage on weapon attacks',
        source: 'Life Cleric',
        type: 'damage',
        condition: 'always',
        value: 4.5 // Average of 1d8
      } as DamageModifier)
      break
      
    case 'war_priest':
      modifiers.push({
        id: 'war_priest_bonus_attack',
        name: 'War Priest',
        description: 'Bonus action weapon attack after Attack action',
        source: 'War Cleric',
        type: 'bonusAction',
        condition: 'always',
        provides: 'weapon_attack',
        uses: { max: 3, recharge: 'longRest' } // Simplified WIS modifier
      } as ActionEconomyModifier)
      break
      
    case 'guided_strike':
      modifiers.push({
        id: 'guided_strike_bonus',
        name: 'Guided Strike',
        description: '+10 to attack roll using Channel Divinity',
        source: 'War Cleric',
        type: 'toHit',
        condition: 'always',
        value: 10,
        uses: { max: 1, recharge: 'shortRest' } // Channel Divinity usage
      } as ToHitModifier)
      break
      
    // === BARD SUBCLASS FEATURES ===
    case 'combat_inspiration':
      modifiers.push({
        id: 'combat_inspiration_damage',
        name: 'Combat Inspiration',
        description: 'Add bardic inspiration die to damage rolls',
        source: 'Valor Bard',
        type: 'damage',
        condition: 'always',
        value: 3.5, // Average of d6 inspiration die (simplified)
        uses: { max: 3, recharge: 'shortRest' } // Simplified usage
      } as DamageModifier)
      break
      
    // === PALADIN SUBCLASS FEATURES ===
    case 'sacred_weapon':
      modifiers.push({
        id: 'sacred_weapon_bonus',
        name: 'Sacred Weapon',
        description: 'Weapon glows and adds CHA modifier to attack rolls',
        source: 'Devotion Paladin',
        type: 'toHit',
        condition: 'always',
        value: 3, // Simplified CHA modifier
        uses: { max: 1, recharge: 'shortRest' } // Channel Divinity usage
      } as ToHitModifier)
      break
      
    case 'vow_of_enmity':
      modifiers.push({
        id: 'vow_of_enmity_advantage',
        name: 'Vow of Enmity',
        description: 'Advantage on attacks against vowed enemy',
        source: 'Vengeance Paladin',
        type: 'advantage',
        condition: 'always',
        uses: { max: 1, recharge: 'shortRest' } // Channel Divinity usage
      } as AdvantageModifier)
      break
      
    // === RANGER SUBCLASS FEATURES ===
    case 'hunters_prey':
      // Colossus Slayer: extra 1d8 to damaged targets
      modifiers.push({
        id: 'colossus_slayer_damage',
        name: 'Colossus Slayer',
        description: 'Extra 1d8 damage to damaged targets',
        source: 'Hunter Ranger',
        type: 'damage',
        condition: 'target_below_full_hp',
        value: 4.5 // Average of 1d8
      } as DamageModifier)
      break
      
    case 'ranger_multiattack':
      // Volley: attack multiple targets within 10 feet
      modifiers.push({
        id: 'volley_multiattack',
        name: 'Volley',
        description: 'Attack multiple targets in range',
        source: 'Hunter Ranger',
        type: 'extraAttack',
        condition: 'ranged_weapon',
        value: 2 // Simplified - can hit multiple targets
      } as ExtraAttackModifier)
      break
      
    // === SORCERER SUBCLASS FEATURES ===
    case 'elemental_affinity':
      modifiers.push({
        id: 'elemental_affinity_damage',
        name: 'Elemental Affinity',
        description: 'Add CHA modifier to draconic damage type',
        source: 'Draconic Sorcerer',
        type: 'damage',
        condition: 'always',
        value: 4 // Simplified CHA modifier
      } as DamageModifier)
      break
      
    case 'tides_of_chaos':
      modifiers.push({
        id: 'tides_of_chaos_advantage',
        name: 'Tides of Chaos',
        description: 'Advantage on attack rolls, ability checks, or saves',
        source: 'Wild Magic Sorcerer',
        type: 'advantage',
        condition: 'always',
        uses: { max: 1, recharge: 'longRest' }
      } as AdvantageModifier)
      break
      
    // === WARLOCK SUBCLASS FEATURES ===
    case 'dark_ones_blessing':
      modifiers.push({
        id: 'dark_ones_blessing_temp_hp',
        name: 'Dark One\'s Blessing',
        description: 'Temporary HP when reducing enemy to 0',
        source: 'Fiend Warlock',
        type: 'onKill',
        condition: 'always',
        effect: { restoreResource: 'temporary_hp' }
      } as TriggerModifier)
      break
      
    // === ADDITIONAL FIGHTER SUBCLASS FEATURES ===
    case 'rallying_cry':
      modifiers.push({
        id: 'rallying_cry_heal',
        name: 'Rallying Cry',
        description: 'Heal allies when using Second Wind',
        source: 'Purple Dragon Knight',
        type: 'passive',
        condition: 'always'
      } as PassiveModifier)
      break
      
    case 'inspiring_surge':
      modifiers.push({
        id: 'inspiring_surge_ally_attack',
        name: 'Inspiring Surge',
        description: 'Ally can attack when you Action Surge',
        source: 'Purple Dragon Knight',
        type: 'passive',
        condition: 'always'
      } as PassiveModifier)
      break
      
    case 'eldritch_strike':
      modifiers.push({
        id: 'eldritch_strike_disadvantage',
        name: 'Eldritch Strike',
        description: 'Target has disadvantage on next save vs your spells',
        source: 'Eldritch Knight',
        type: 'onHit',
        condition: 'always',
        effect: { damage: 0 }
      } as TriggerModifier)
      break
      
    // === ADDITIONAL ROGUE SUBCLASS FEATURES ===
    case 'skirmisher':
      modifiers.push({
        id: 'skirmisher_reaction_move',
        name: 'Skirmisher',
        description: 'Move as reaction when enemy moves near',
        source: 'Scout',
        type: 'reaction',
        condition: 'always'
      } as ActionEconomyModifier)
      break
      
    case 'ambush_master':
      modifiers.push({
        id: 'ambush_master_advantage',
        name: 'Ambush Master',
        description: 'Advantage on initiative and Stealth checks',
        source: 'Scout',
        type: 'advantage',
        condition: 'first_attack_of_turn'
      } as AdvantageModifier)
      break
      
    case 'sudden_strike':
      modifiers.push({
        id: 'sudden_strike_extra_attack',
        name: 'Sudden Strike',
        description: 'Extra attack as bonus action',
        source: 'Scout',
        type: 'bonusAction',
        condition: 'always',
        provides: 'weapon_attack'
      } as ActionEconomyModifier)
      break
      
    case 'rakish_audacity':
      modifiers.push({
        id: 'rakish_audacity_initiative',
        name: 'Rakish Audacity',
        description: 'Add CHA modifier to initiative',
        source: 'Swashbuckler',
        type: 'passive',
        condition: 'always',
        value: 3 // Simplified CHA modifier
      } as PassiveModifier)
      break
      
    case 'master_duelist':
      modifiers.push({
        id: 'master_duelist_reroll',
        name: 'Master Duelist',
        description: 'Turn missed attack into hit',
        source: 'Swashbuckler',
        type: 'passive',
        condition: 'always',
        uses: { max: 1, recharge: 'longRest' }
      } as PassiveModifier)
      break
      
    // === ADDITIONAL WIZARD SUBCLASS FEATURES ===
    case 'hypnotic_gaze':
      modifiers.push({
        id: 'hypnotic_gaze_charm',
        name: 'Hypnotic Gaze',
        description: 'Charm humanoid within 5 feet',
        source: 'Enchantment Wizard',
        type: 'passive',
        condition: 'always'
      } as PassiveModifier)
      break
      
    case 'grim_harvest':
      modifiers.push({
        id: 'grim_harvest_heal',
        name: 'Grim Harvest',
        description: 'Regain HP when killing with spells',
        source: 'Necromancy Wizard',
        type: 'onKill',
        condition: 'always',
        effect: { restoreResource: 'hit_points' }
      } as TriggerModifier)
      break
      
    // === ADDITIONAL CLERIC SUBCLASS FEATURES ===
    case 'divine_strike_war':
      modifiers.push({
        id: 'divine_strike_weapon',
        name: 'Divine Strike (War)',
        description: 'Extra 1d8 weapon damage',
        source: 'War Cleric',
        type: 'damage',
        condition: 'always',
        value: 4.5 // Average of 1d8
      } as DamageModifier)
      break
      
    case 'wrath_of_the_storm':
      modifiers.push({
        id: 'wrath_of_the_storm_reaction',
        name: 'Wrath of the Storm',
        description: 'Reaction damage when hit in melee',
        source: 'Tempest Cleric',
        type: 'reaction',
        condition: 'always'
      } as ActionEconomyModifier)
      break
      
    case 'destructive_wrath':
      modifiers.push({
        id: 'destructive_wrath_max_damage',
        name: 'Destructive Wrath',
        description: 'Maximum lightning/thunder damage',
        source: 'Tempest Cleric',
        type: 'passive',
        condition: 'always',
        uses: { max: 1, recharge: 'shortRest' }
      } as PassiveModifier)
      break
      
    // === CHRONURGY WIZARD SUBCLASS FEATURES ===
    case 'chronal_shift':
      modifiers.push({
        id: 'chronal_shift_modifier',
        name: 'Chronal Shift',
        description: 'Force reroll of attack roll, ability check, or saving throw',
        source: 'Chronurgy Wizard',
        type: 'passive',
        condition: 'always',
        uses: { max: 2, recharge: 'longRest' }
      } as PassiveModifier)
      break
      
    case 'temporal_awareness':
      modifiers.push({
        id: 'temporal_awareness_initiative',
        name: 'Temporal Awareness',
        description: 'Add INT modifier to initiative rolls',
        source: 'Chronurgy Wizard',
        type: 'passive',
        condition: 'always',
        value: Math.floor(((level || 10) >= 20 ? 20 : 16 - 10) / 2) // Simplified INT mod based on level
      } as PassiveModifier)
      break
      
    case 'momentary_stasis':
      modifiers.push({
        id: 'momentary_stasis_incapacitate',
        name: 'Momentary Stasis',
        description: 'Incapacitate Large or smaller creature',
        source: 'Chronurgy Wizard',
        type: 'passive',
        condition: 'always',
        uses: { max: 1, recharge: 'longRest' }
      } as PassiveModifier)
      break
      
    case 'convergent_future':
      modifiers.push({
        id: 'convergent_future_luck',
        name: 'Convergent Future',
        description: 'Force advantage or disadvantage on any roll within 60 feet',
        source: 'Chronurgy Wizard',
        type: 'passive',
        condition: 'always',
        uses: { max: 1, recharge: 'longRest' }
      } as PassiveModifier)
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