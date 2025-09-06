// Library of common D&D 5e actions for Round Scripts
import type { ActionOption } from './types'

/**
 * Core combat actions available to all characters
 */
export const CORE_ACTIONS: ActionOption[] = [
  {
    id: 'attack',
    name: 'Attack',
    type: 'action',
    description: 'Make weapon attacks with your equipped weapons',
    cost: [],
    effects: [
      { type: 'attack', target: 'enemy', duration: 'instant' }
    ]
  },
  
  {
    id: 'dodge',
    name: 'Dodge',
    type: 'action',
    description: 'Focus entirely on avoiding attacks',
    cost: [],
    effects: [
      { type: 'advantage', target: 'self', value: 'dex-saves', duration: 'round' },
      { type: 'condition', target: 'self', value: 'attackers-have-disadvantage', duration: 'round' }
    ]
  },

  {
    id: 'dash',
    name: 'Dash',
    type: 'action',
    description: 'Double your speed for the turn',
    cost: [],
    effects: [
      { type: 'movement', target: 'self', value: 'double-speed', duration: 'round' }
    ]
  },

  {
    id: 'help',
    name: 'Help',
    type: 'action', 
    description: 'Give an ally advantage on their next ability check or attack',
    cost: [],
    effects: [
      { type: 'advantage', target: 'ally', duration: 'round' }
    ]
  },

  {
    id: 'ready',
    name: 'Ready',
    type: 'action',
    description: 'Prepare an action to take in response to a trigger',
    cost: [],
    effects: [
      { type: 'condition', target: 'self', value: 'ready-action', duration: 'round' }
    ]
  }
]

/**
 * Bonus action abilities available to specific builds
 */
export const BONUS_ACTIONS: ActionOption[] = [
  {
    id: 'two-weapon-fighting',
    name: 'Two-Weapon Fighting',
    type: 'bonus-action',
    description: 'Attack with your off-hand weapon',
    cost: [],
    requirements: [
      { type: 'weapon-property', value: 'light' }
    ],
    effects: [
      { type: 'attack', target: 'enemy', value: 'off-hand', duration: 'instant' }
    ]
  },

  {
    id: 'cunning-action-dash',
    name: 'Cunning Action - Dash',
    type: 'bonus-action',
    description: 'Use your cunning action to Dash',
    cost: [],
    requirements: [
      { type: 'feature', value: 'cunning-action' }
    ],
    effects: [
      { type: 'movement', target: 'self', value: 'double-speed', duration: 'round' }
    ]
  },

  {
    id: 'cunning-action-disengage',
    name: 'Cunning Action - Disengage',
    type: 'bonus-action', 
    description: 'Use your cunning action to Disengage',
    cost: [],
    requirements: [
      { type: 'feature', value: 'cunning-action' }
    ],
    effects: [
      { type: 'condition', target: 'self', value: 'no-opportunity-attacks', duration: 'round' }
    ]
  },

  {
    id: 'cunning-action-hide',
    name: 'Cunning Action - Hide',
    type: 'bonus-action',
    description: 'Use your cunning action to Hide',
    cost: [],
    requirements: [
      { type: 'feature', value: 'cunning-action' }
    ],
    effects: [
      { type: 'condition', target: 'self', value: 'hidden', duration: 'encounter' }
    ]
  }
]

/**
 * Spell actions organized by level
 */
export const SPELL_ACTIONS: ActionOption[] = [
  // Cantrips
  {
    id: 'eldritch-blast',
    name: 'Eldritch Blast',
    type: 'action',
    description: 'A beam of crackling energy streaks toward a creature within range',
    cost: [],
    requirements: [
      { type: 'spell-known', value: 'eldritch_blast' }
    ],
    effects: [
      { type: 'attack', target: 'enemy', value: 'spell-attack', duration: 'instant' }
    ]
  },

  {
    id: 'fire-bolt',
    name: 'Fire Bolt',
    type: 'action',
    description: 'You hurl a mote of fire at a creature or object within range',
    cost: [],
    requirements: [
      { type: 'spell-known', value: 'fire_bolt' }
    ],
    effects: [
      { type: 'attack', target: 'enemy', value: 'spell-attack', duration: 'instant' }
    ]
  },

  // 1st Level Spells
  {
    id: 'hex',
    name: 'Hex',
    type: 'bonus-action',
    description: 'Place a curse on a creature within range',
    cost: [
      { type: 'spell-slot', level: 1, amount: 1 }
    ],
    requirements: [
      { type: 'spell-known', value: 'hex' },
      { type: 'concentration-free', value: 'true' }
    ],
    effects: [
      { type: 'damage-bonus', target: 'enemy', value: '1d6', duration: 'until-concentration-ends' },
      { type: 'concentration', target: 'self', duration: 'until-concentration-ends' }
    ]
  },

  {
    id: 'hunters-mark',
    name: "Hunter's Mark", 
    type: 'bonus-action',
    description: 'Choose a creature within range and mystically mark it as your quarry',
    cost: [
      { type: 'spell-slot', level: 1, amount: 1 }
    ],
    requirements: [
      { type: 'spell-known', value: 'hunters_mark' },
      { type: 'concentration-free', value: 'true' }
    ],
    effects: [
      { type: 'damage-bonus', target: 'enemy', value: '1d6', duration: 'until-concentration-ends' },
      { type: 'concentration', target: 'self', duration: 'until-concentration-ends' }
    ]
  },

  {
    id: 'bless',
    name: 'Bless',
    type: 'action',
    description: 'Bless up to three creatures, adding 1d4 to attack rolls and saves',
    cost: [
      { type: 'spell-slot', level: 1, amount: 1 }
    ],
    requirements: [
      { type: 'spell-known', value: 'bless' },
      { type: 'concentration-free', value: 'true' }
    ],
    effects: [
      { type: 'attack-bonus', target: 'ally', value: '1d4', duration: 'until-concentration-ends' },
      { type: 'concentration', target: 'self', duration: 'until-concentration-ends' }
    ]
  },

  // 2nd Level Spells
  {
    id: 'haste',
    name: 'Haste',
    type: 'action',
    description: 'Choose a willing creature. Until the spell ends, the target\'s speed is doubled',
    cost: [
      { type: 'spell-slot', level: 3, amount: 1 }
    ],
    requirements: [
      { type: 'spell-known', value: 'haste' },
      { type: 'concentration-free', value: 'true' }
    ],
    effects: [
      { type: 'attack', target: 'ally', value: 'extra-attack', duration: 'until-concentration-ends' },
      { type: 'concentration', target: 'self', duration: 'until-concentration-ends' }
    ]
  }
]

/**
 * Fighter-specific actions
 */
export const FIGHTER_ACTIONS: ActionOption[] = [
  {
    id: 'action-surge',
    name: 'Action Surge',
    type: 'free',
    description: 'Take an additional action on your turn',
    cost: [
      { type: 'action-surge', amount: 1 }
    ],
    requirements: [
      { type: 'feature', value: 'action-surge' }
    ],
    effects: [
      { type: 'condition', target: 'self', value: 'extra-action', duration: 'round' }
    ]
  },

  {
    id: 'second-wind',
    name: 'Second Wind',
    type: 'bonus-action',
    description: 'Regain hit points equal to 1d10 + fighter level',
    cost: [
      { type: 'second-wind', amount: 1 }
    ],
    requirements: [
      { type: 'feature', value: 'second-wind' }
    ],
    effects: [
      { type: 'condition', target: 'self', value: 'heal', duration: 'instant' }
    ]
  }
]

/**
 * Battlemaster maneuver actions
 */
export const MANEUVER_ACTIONS: ActionOption[] = [
  {
    id: 'precision-attack',
    name: 'Precision Attack',
    type: 'free',
    description: 'Add superiority die to attack roll',
    cost: [
      { type: 'superiority-die', amount: 1 }
    ],
    requirements: [
      { type: 'feature', value: 'combat-superiority' }
    ],
    effects: [
      { type: 'attack-bonus', target: 'self', value: 'superiority-die', duration: 'instant' }
    ]
  },

  {
    id: 'trip-attack',
    name: 'Trip Attack',
    type: 'free',
    description: 'Add superiority die to damage and potentially knock prone',
    cost: [
      { type: 'superiority-die', amount: 1 }
    ],
    requirements: [
      { type: 'feature', value: 'combat-superiority' }
    ],
    effects: [
      { type: 'damage-bonus', target: 'enemy', value: 'superiority-die', duration: 'instant' },
      { type: 'condition', target: 'enemy', value: 'prone', duration: 'encounter' }
    ]
  },

  {
    id: 'menacing-attack',
    name: 'Menacing Attack',
    type: 'free',
    description: 'Add superiority die to damage and frighten target',
    cost: [
      { type: 'superiority-die', amount: 1 }
    ],
    requirements: [
      { type: 'feature', value: 'combat-superiority' }
    ],
    effects: [
      { type: 'damage-bonus', target: 'enemy', value: 'superiority-die', duration: 'instant' },
      { type: 'condition', target: 'enemy', value: 'frightened', duration: 'round' }
    ]
  }
]

/**
 * Barbarian rage and related actions
 */
export const BARBARIAN_ACTIONS: ActionOption[] = [
  {
    id: 'rage',
    name: 'Rage',
    type: 'bonus-action',
    description: 'Enter a battle rage gaining damage resistance and bonus damage',
    cost: [
      { type: 'rage', amount: 1 }
    ],
    requirements: [
      { type: 'feature', value: 'rage' }
    ],
    effects: [
      { type: 'damage-bonus', target: 'self', value: 'rage-damage', duration: 'encounter' },
      { type: 'condition', target: 'self', value: 'resistance-physical', duration: 'encounter' },
      { type: 'advantage', target: 'self', value: 'strength-checks', duration: 'encounter' }
    ]
  },

  {
    id: 'reckless-attack',
    name: 'Reckless Attack',
    type: 'free',
    description: 'Attack with advantage, but enemies have advantage against you',
    cost: [],
    requirements: [
      { type: 'feature', value: 'reckless-attack' }
    ],
    effects: [
      { type: 'advantage', target: 'self', value: 'attack-rolls', duration: 'round' },
      { type: 'condition', target: 'self', value: 'vulnerable-to-attacks', duration: 'round' }
    ]
  }
]

/**
 * Gets all available actions for a given character build
 */
export function getAvailableActions(
  _characterLevel: number,
  classes: { classId: string; levels: number }[],
  features: string[],
  knownSpells: string[]
): ActionOption[] {
  const availableActions: ActionOption[] = [...CORE_ACTIONS]

  // Always add appropriate bonus actions for rogues
  if (classes.some(c => c.classId === 'rogue')) {
    availableActions.push(...BONUS_ACTIONS.filter(a => a.id.startsWith('cunning-action')))
  }

  // Add fighter actions if fighter levels
  if (classes.some(c => c.classId === 'fighter')) {
    availableActions.push(...FIGHTER_ACTIONS)
    
    // Add battlemaster maneuvers if appropriate
    if (features.includes('combat-superiority')) {
      availableActions.push(...MANEUVER_ACTIONS)
    }
  }

  // Add barbarian actions if barbarian levels
  if (classes.some(c => c.classId === 'barbarian')) {
    availableActions.push(...BARBARIAN_ACTIONS)
  }

  // Add spells based on known spells
  const availableSpells = SPELL_ACTIONS.filter(spell => {
    const requirement = spell.requirements?.find(r => r.type === 'spell-known')
    return requirement ? knownSpells.includes(requirement.value as string) : false
  })
  availableActions.push(...availableSpells)

  // Add two-weapon fighting if appropriate
  // This would need more complex logic based on equipped weapons
  availableActions.push(BONUS_ACTIONS.find(a => a.id === 'two-weapon-fighting')!)

  return availableActions
}

/**
 * Gets actions filtered by type
 */
export function getActionsByType(
  actions: ActionOption[],
  type: 'action' | 'bonus-action' | 'reaction' | 'free'
): ActionOption[] {
  return actions.filter(action => action.type === type)
}