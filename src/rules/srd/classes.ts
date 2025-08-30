import type { ClassDefinition, Feature, FightingStyle } from '../types'

// Fighting Styles
export const fightingStyles: Record<string, FightingStyle> = {
  archery: {
    id: 'archery',
    name: 'Archery',
    description: 'You gain a +2 bonus to attack rolls you make with ranged weapons.',
    rulesKey: 'archery'
  },
  defense: {
    id: 'defense', 
    name: 'Defense',
    description: 'While you are wearing armor, you gain a +1 bonus to AC.',
    rulesKey: 'defense'
  },
  dueling: {
    id: 'dueling',
    name: 'Dueling', 
    description: 'When you are wielding a melee weapon in one hand and no other weapons, you gain a +2 bonus to damage rolls with that weapon.',
    rulesKey: 'dueling'
  },
  great_weapon_fighting: {
    id: 'great_weapon_fighting',
    name: 'Great Weapon Fighting',
    description: 'When you roll a 1 or 2 on a damage die for an attack you make with a melee weapon that you are wielding with two hands, you can reroll the die and must use the new roll.',
    rulesKey: 'gwf'
  },
  protection: {
    id: 'protection',
    name: 'Protection',
    description: 'When a creature you can see attacks a target other than you that is within 5 feet of you, you can use your reaction to impose disadvantage on the attack roll.',
    rulesKey: 'protection'
  },
  two_weapon_fighting: {
    id: 'two_weapon_fighting',
    name: 'Two-Weapon Fighting',
    description: 'When you engage in two-weapon fighting, you can add your ability modifier to the damage of the second attack.',
    rulesKey: 'two_weapon_fighting'
  }
}

// Fighter Class
const fighterFeatures: Record<number, Feature[]> = {
  1: [
    {
      id: 'fighting_style_fighter',
      name: 'Fighting Style',
      description: 'You adopt a particular style of fighting as your specialty.',
      source: 'Fighter 1',
      rulesKey: 'fighting_style'
    },
    {
      id: 'second_wind',
      name: 'Second Wind',
      description: 'You have a limited well of stamina that you can draw on to protect yourself from harm.',
      source: 'Fighter 1'
    }
  ],
  2: [
    {
      id: 'action_surge',
      name: 'Action Surge',
      description: 'You can push yourself beyond your normal limits for a moment.',
      source: 'Fighter 2',
      rulesKey: 'action_surge'
    }
  ],
  3: [
    {
      id: 'martial_archetype',
      name: 'Martial Archetype',
      description: 'You choose an archetype that you strive to emulate in your combat styles and techniques.',
      source: 'Fighter 3'
    }
  ],
  4: [
    {
      id: 'asi_fighter_4',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Fighter 4',
      rulesKey: 'asi'
    }
  ],
  5: [
    {
      id: 'extra_attack_fighter_5',
      name: 'Extra Attack',
      description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.',
      source: 'Fighter 5',
      rulesKey: 'extra_attack_1'
    }
  ],
  6: [
    {
      id: 'asi_fighter_6',
      name: 'Ability Score Improvement', 
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Fighter 6',
      rulesKey: 'asi'
    }
  ],
  8: [
    {
      id: 'asi_fighter_8',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Fighter 8', 
      rulesKey: 'asi'
    }
  ],
  9: [
    {
      id: 'indomitable',
      name: 'Indomitable',
      description: 'You can reroll a saving throw that you fail.',
      source: 'Fighter 9'
    }
  ],
  11: [
    {
      id: 'extra_attack_fighter_11',
      name: 'Extra Attack (2)',
      description: 'You can attack three times whenever you take the Attack action on your turn.',
      source: 'Fighter 11',
      rulesKey: 'extra_attack_2'
    }
  ],
  12: [
    {
      id: 'asi_fighter_12',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Fighter 12',
      rulesKey: 'asi'
    }
  ],
  14: [
    {
      id: 'asi_fighter_14', 
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Fighter 14',
      rulesKey: 'asi'
    }
  ],
  16: [
    {
      id: 'asi_fighter_16',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Fighter 16',
      rulesKey: 'asi'
    }
  ],
  19: [
    {
      id: 'asi_fighter_19',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Fighter 19',
      rulesKey: 'asi'
    }
  ],
  20: [
    {
      id: 'extra_attack_fighter_20',
      name: 'Extra Attack (3)',
      description: 'You can attack four times whenever you take the Attack action on your turn.',
      source: 'Fighter 20',
      rulesKey: 'extra_attack_3'
    }
  ]
}

// Rogue Class
const rogueFeatures: Record<number, Feature[]> = {
  1: [
    {
      id: 'expertise_rogue',
      name: 'Expertise',
      description: 'Choose two of your skill proficiencies. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.',
      source: 'Rogue 1'
    },
    {
      id: 'sneak_attack_1d6',
      name: 'Sneak Attack',
      description: 'Once per turn, you can deal an extra 1d6 damage to one creature you hit with an attack.',
      source: 'Rogue 1',
      rulesKey: 'sneak_attack_1d6'
    },
    {
      id: 'thieves_cant',
      name: "Thieves' Cant",
      description: 'You know thieves\' cant, a secret mix of dialect, jargon, and code.',
      source: 'Rogue 1'
    }
  ],
  2: [
    {
      id: 'cunning_action',
      name: 'Cunning Action',
      description: 'You can take a Dash, Disengage, or Hide action as a bonus action.',
      source: 'Rogue 2'
    }
  ],
  3: [
    {
      id: 'sneak_attack_2d6',
      name: 'Sneak Attack',
      description: 'Your Sneak Attack damage increases to 2d6.',
      source: 'Rogue 3',
      rulesKey: 'sneak_attack_2d6'
    },
    {
      id: 'roguish_archetype',
      name: 'Roguish Archetype',
      description: 'You choose an archetype that you emulate in the exercise of your rogue abilities.',
      source: 'Rogue 3'
    }
  ],
  4: [
    {
      id: 'asi_rogue_4',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Rogue 4',
      rulesKey: 'asi'
    }
  ],
  5: [
    {
      id: 'sneak_attack_3d6',
      name: 'Sneak Attack',
      description: 'Your Sneak Attack damage increases to 3d6.',
      source: 'Rogue 5',
      rulesKey: 'sneak_attack_3d6'
    },
    {
      id: 'uncanny_dodge',
      name: 'Uncanny Dodge',
      description: 'When an attacker that you can see hits you with an attack, you can use your reaction to halve the attack\'s damage.',
      source: 'Rogue 5'
    }
  ],
  7: [
    {
      id: 'sneak_attack_4d6',
      name: 'Sneak Attack',
      description: 'Your Sneak Attack damage increases to 4d6.',
      source: 'Rogue 7',
      rulesKey: 'sneak_attack_4d6'
    },
    {
      id: 'evasion',
      name: 'Evasion',
      description: 'When you are subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed.',
      source: 'Rogue 7'
    }
  ],
  8: [
    {
      id: 'asi_rogue_8',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Rogue 8',
      rulesKey: 'asi'
    }
  ],
  9: [
    {
      id: 'sneak_attack_5d6',
      name: 'Sneak Attack',
      description: 'Your Sneak Attack damage increases to 5d6.',
      source: 'Rogue 9',
      rulesKey: 'sneak_attack_5d6'
    }
  ],
  11: [
    {
      id: 'sneak_attack_6d6',
      name: 'Sneak Attack',
      description: 'Your Sneak Attack damage increases to 6d6.',
      source: 'Rogue 11',
      rulesKey: 'sneak_attack_6d6'
    },
    {
      id: 'reliable_talent',
      name: 'Reliable Talent',
      description: 'Whenever you make an ability check that lets you add your proficiency bonus, you can treat a d20 roll of 9 or lower as a 10.',
      source: 'Rogue 11'
    }
  ],
  12: [
    {
      id: 'asi_rogue_12',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Rogue 12',
      rulesKey: 'asi'
    }
  ],
  13: [
    {
      id: 'sneak_attack_7d6',
      name: 'Sneak Attack', 
      description: 'Your Sneak Attack damage increases to 7d6.',
      source: 'Rogue 13',
      rulesKey: 'sneak_attack_7d6'
    }
  ],
  15: [
    {
      id: 'sneak_attack_8d6',
      name: 'Sneak Attack',
      description: 'Your Sneak Attack damage increases to 8d6.',
      source: 'Rogue 15',
      rulesKey: 'sneak_attack_8d6'
    },
    {
      id: 'blindsense',
      name: 'Blindsense',
      description: 'If you are able to hear, you are aware of the location of any hidden or invisible creature within 10 feet of you.',
      source: 'Rogue 15'
    }
  ],
  16: [
    {
      id: 'asi_rogue_16',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Rogue 16',
      rulesKey: 'asi'
    }
  ],
  17: [
    {
      id: 'sneak_attack_9d6',
      name: 'Sneak Attack',
      description: 'Your Sneak Attack damage increases to 9d6.',
      source: 'Rogue 17',
      rulesKey: 'sneak_attack_9d6'
    }
  ],
  19: [
    {
      id: 'sneak_attack_10d6',
      name: 'Sneak Attack',
      description: 'Your Sneak Attack damage increases to 10d6.',
      source: 'Rogue 19',
      rulesKey: 'sneak_attack_10d6'
    },
    {
      id: 'asi_rogue_19',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Rogue 19',
      rulesKey: 'asi'
    }
  ],
  20: [
    {
      id: 'stroke_of_luck',
      name: 'Stroke of Luck',
      description: 'If your attack misses a target within range, you can turn the miss into a hit.',
      source: 'Rogue 20'
    }
  ]
}

// Export class definitions
export const classes: Record<string, ClassDefinition> = {
  fighter: {
    id: 'fighter',
    name: 'Fighter',
    hitDie: 10,
    primaryAbilities: ['STR', 'DEX'],
    savingThrowProficiencies: ['STR', 'CON'],
    skillChoices: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'],
    skillChoiceCount: 2,
    features: fighterFeatures,
    fightingStyles: Object.values(fightingStyles).filter(fs => 
      ['archery', 'defense', 'dueling', 'great_weapon_fighting', 'protection', 'two_weapon_fighting'].includes(fs.id)
    ),
    fightingStyleLevel: 1
  },
  rogue: {
    id: 'rogue',
    name: 'Rogue',
    hitDie: 8,
    primaryAbilities: ['DEX'],
    savingThrowProficiencies: ['DEX', 'INT'],
    skillChoices: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'],
    skillChoiceCount: 4,
    features: rogueFeatures
  }
}