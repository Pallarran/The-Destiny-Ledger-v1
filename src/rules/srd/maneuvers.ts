/**
 * Battle Master Maneuvers for D&D 5e (2014 rules)
 * These are the tactical combat maneuvers available to Battle Master fighters
 */

export interface Maneuver {
  id: string
  name: string
  description: string
  effect: string // Mechanical effect description
  dieUsage: string // When the superiority die is rolled/added
  savingThrow?: {
    ability: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'
    description: string
  }
  prerequisites?: string[]
  tags: string[] // For categorization (damage, control, utility, etc.)
}

export const maneuvers: Record<string, Maneuver> = {
  ambush: {
    id: 'ambush',
    name: 'Ambush',
    description: 'When you make a Dexterity (Stealth) check or an initiative roll, you can expend one superiority die and add the die to the roll.',
    effect: 'Add superiority die to Stealth checks or initiative rolls',
    dieUsage: 'Added to the roll',
    tags: ['utility', 'initiative']
  },
  
  bait_and_switch: {
    id: 'bait_and_switch',
    name: 'Bait and Switch',
    description: 'When you\'re within 5 feet of a creature on your turn, you can expend one superiority die and switch places with that creature, provided you spend at least 5 feet of movement.',
    effect: 'Switch positions with allied creature, both gain AC bonus',
    dieUsage: 'Added to AC until start of next turn',
    tags: ['utility', 'defense', 'positioning']
  },
  
  commanders_strike: {
    id: 'commanders_strike',
    name: 'Commander\'s Strike',
    description: 'When you take the Attack action, you can forgo one attack and use a bonus action to direct an ally to strike.',
    effect: 'Ally makes attack as reaction, adds superiority die to damage',
    dieUsage: 'Added to ally\'s damage roll',
    tags: ['support', 'damage']
  },
  
  disarming_attack: {
    id: 'disarming_attack',
    name: 'Disarming Attack',
    description: 'When you hit a creature with a weapon attack, you can expend one superiority die to attempt to disarm the target.',
    effect: 'Add die to damage, target makes STR save or drops one held object',
    dieUsage: 'Added to damage roll',
    savingThrow: {
      ability: 'STR',
      description: 'Target makes STR save or drops held object'
    },
    tags: ['damage', 'control']
  },
  
  distracting_strike: {
    id: 'distracting_strike',
    name: 'Distracting Strike',
    description: 'When you hit a creature with a weapon attack, you can expend one superiority die to distract the creature.',
    effect: 'Add die to damage, next attack against target has advantage',
    dieUsage: 'Added to damage roll',
    tags: ['damage', 'support']
  },
  
  evasive_footwork: {
    id: 'evasive_footwork',
    name: 'Evasive Footwork',
    description: 'When you move, you can expend one superiority die, rolling the die and adding the number rolled to your AC until you stop moving.',
    effect: 'Add superiority die to AC while moving',
    dieUsage: 'Added to AC until you stop moving',
    tags: ['defense', 'mobility']
  },
  
  feinting_attack: {
    id: 'feinting_attack',
    name: 'Feinting Attack',
    description: 'You can expend one superiority die and use a bonus action to feint, choosing one creature within 5 feet of you as your target.',
    effect: 'Next attack has advantage and adds superiority die to damage',
    dieUsage: 'Added to damage roll',
    tags: ['damage', 'advantage']
  },
  
  goading_attack: {
    id: 'goading_attack',
    name: 'Goading Attack',
    description: 'When you hit a creature with a weapon attack, you can expend one superiority die to attempt to goad the target into attacking you.',
    effect: 'Add die to damage, target has disadvantage on attacks vs others',
    dieUsage: 'Added to damage roll',
    savingThrow: {
      ability: 'WIS',
      description: 'Target makes WIS save or has disadvantage attacking others'
    },
    tags: ['damage', 'control', 'tank']
  },
  
  grappling_strike: {
    id: 'grappling_strike',
    name: 'Grappling Strike',
    description: 'Immediately after you hit a creature with a melee attack, you can expend one superiority die and then try to grapple the target as a bonus action.',
    effect: 'Add die to damage, attempt grapple as bonus action with advantage',
    dieUsage: 'Added to damage roll',
    tags: ['damage', 'control', 'grapple']
  },
  
  lunging_attack: {
    id: 'lunging_attack',
    name: 'Lunging Attack',
    description: 'When you make a melee weapon attack, you can expend one superiority die to increase your reach for that attack by 5 feet.',
    effect: 'Increase reach by 5ft, add superiority die to damage on hit',
    dieUsage: 'Added to damage roll',
    tags: ['damage', 'reach']
  },
  
  maneuvering_attack: {
    id: 'maneuvering_attack',
    name: 'Maneuvering Attack',
    description: 'When you hit a creature with a weapon attack, you can expend one superiority die to maneuver one of your comrades into a more advantageous position.',
    effect: 'Add die to damage, ally can move without provoking opportunity attacks',
    dieUsage: 'Added to damage roll',
    tags: ['damage', 'support', 'positioning']
  },
  
  menacing_attack: {
    id: 'menacing_attack',
    name: 'Menacing Attack',
    description: 'When you hit a creature with a weapon attack, you can expend one superiority die to attempt to frighten the target.',
    effect: 'Add die to damage, target makes WIS save or is frightened',
    dieUsage: 'Added to damage roll',
    savingThrow: {
      ability: 'WIS',
      description: 'Target makes WIS save or is frightened until end of your next turn'
    },
    tags: ['damage', 'control', 'fear']
  },
  
  parry: {
    id: 'parry',
    name: 'Parry',
    description: 'When another creature damages you with a melee attack, you can use your reaction and expend one superiority die to reduce the damage.',
    effect: 'Reduce incoming melee damage by superiority die + DEX modifier',
    dieUsage: 'Subtracted from damage taken',
    tags: ['defense', 'reaction']
  },
  
  precision_attack: {
    id: 'precision_attack',
    name: 'Precision Attack',
    description: 'When you make a weapon attack roll against a creature, you can expend one superiority die to add it to the roll.',
    effect: 'Add superiority die to attack roll (can turn miss into hit)',
    dieUsage: 'Added to attack roll',
    tags: ['accuracy', 'utility']
  },
  
  pushing_attack: {
    id: 'pushing_attack',
    name: 'Pushing Attack',
    description: 'When you hit a creature with a weapon attack, you can expend one superiority die to attempt to drive the target back.',
    effect: 'Add die to damage, target makes STR save or is pushed 15ft',
    dieUsage: 'Added to damage roll',
    savingThrow: {
      ability: 'STR',
      description: 'Target makes STR save or is pushed 15 feet away'
    },
    tags: ['damage', 'control', 'positioning']
  },
  
  rally: {
    id: 'rally',
    name: 'Rally',
    description: 'On your turn, you can use a bonus action and expend one superiority die to bolster the resolve of one of your companions.',
    effect: 'Ally regains hit points equal to superiority die + CHA modifier',
    dieUsage: 'Added to hit points regained',
    tags: ['support', 'healing']
  },
  
  riposte: {
    id: 'riposte',
    name: 'Riposte',
    description: 'When a creature misses you with a melee attack, you can use your reaction and expend one superiority die to make a melee weapon attack against the creature.',
    effect: 'Make attack as reaction, add superiority die to damage if hit',
    dieUsage: 'Added to damage roll',
    tags: ['damage', 'reaction', 'counterattack']
  },
  
  sweeping_attack: {
    id: 'sweeping_attack',
    name: 'Sweeping Attack',
    description: 'When you hit a creature with a melee weapon attack, you can expend one superiority die to attempt to damage another creature with the same attack.',
    effect: 'Deal superiority die damage to second creature within 5ft',
    dieUsage: 'Damage dealt to second target',
    tags: ['damage', 'aoe']
  },
  
  tactical_assessment: {
    id: 'tactical_assessment',
    name: 'Tactical Assessment',
    description: 'When you make an Intelligence (Investigation), Intelligence (History), or Wisdom (Insight) check, you can expend one superiority die and add it to the roll.',
    effect: 'Add superiority die to Investigation, History, or Insight checks',
    dieUsage: 'Added to ability check',
    tags: ['utility', 'investigation']
  },
  
  trip_attack: {
    id: 'trip_attack',
    name: 'Trip Attack',
    description: 'When you hit a creature with a weapon attack, you can expend one superiority die to attempt to knock the target down.',
    effect: 'Add die to damage, target makes STR save or is knocked prone',
    dieUsage: 'Added to damage roll',
    savingThrow: {
      ability: 'STR',
      description: 'Target makes STR save or is knocked prone'
    },
    tags: ['damage', 'control', 'prone']
  }
}

// Maneuvers available at different levels
export const MANEUVER_PROGRESSION = {
  3: { count: 3, dice: 4, dieSize: 8 },    // Level 3: 3 maneuvers, 4d8 superiority dice
  7: { count: 5, dice: 5, dieSize: 8 },    // Level 7: 5 maneuvers, 5d8 superiority dice  
  10: { count: 7, dice: 5, dieSize: 10 },  // Level 10: 7 maneuvers, 5d10 superiority dice
  15: { count: 9, dice: 6, dieSize: 10 },  // Level 15: 9 maneuvers, 6d10 superiority dice
  18: { count: 9, dice: 6, dieSize: 12 }   // Level 18: 9 maneuvers, 6d12 superiority dice
}

export function getManeuverProgression(level: number) {
  if (level >= 18) return MANEUVER_PROGRESSION[18]
  if (level >= 15) return MANEUVER_PROGRESSION[15]
  if (level >= 10) return MANEUVER_PROGRESSION[10]
  if (level >= 7) return MANEUVER_PROGRESSION[7]
  if (level >= 3) return MANEUVER_PROGRESSION[3]
  return null
}

export function getAvailableManeuvers(): Maneuver[] {
  return Object.values(maneuvers)
}