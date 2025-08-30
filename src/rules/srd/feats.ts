import type { Feat } from '../types'

export const feats: Record<string, Feat> = {
  great_weapon_master: {
    id: 'great_weapon_master',
    name: 'Great Weapon Master',
    description: 'You have learned to put the weight of a weapon to your advantage, letting its momentum empower your strikes.',
    features: [
      {
        id: 'gwm_bonus_attack',
        name: 'Bonus Attack',
        description: 'On your turn, when you score a critical hit with a melee weapon or reduce a creature to 0 hit points with one, you can make one melee weapon attack as a bonus action.',
        source: 'Great Weapon Master'
      },
      {
        id: 'gwm_power_attack',
        name: 'Power Attack',
        description: 'Before you make a melee attack with a heavy weapon that you are proficient with, you can choose to take a -5 penalty to the attack roll. If the attack hits, you add +10 to the attacks damage roll.',
        source: 'Great Weapon Master',
        rulesKey: 'gwm_power_attack'
      }
    ]
  },
  sharpshooter: {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: 'You have mastered ranged weapons and can make shots that others find impossible.',
    features: [
      {
        id: 'ss_long_range',
        name: 'Long Range',
        description: 'Attacking at long range doesn\'t impose disadvantage on your ranged weapon attack rolls.',
        source: 'Sharpshooter'
      },
      {
        id: 'ss_cover',
        name: 'Ignore Cover',
        description: 'Your ranged weapon attacks ignore half cover and three-quarters cover.',
        source: 'Sharpshooter'
      },
      {
        id: 'ss_power_attack',
        name: 'Power Attack',
        description: 'Before you make an attack with a ranged weapon that you are proficient with, you can choose to take a -5 penalty to the attack roll. If the attack hits, you add +10 to the attack\'s damage roll.',
        source: 'Sharpshooter',
        rulesKey: 'ss_power_attack'
      }
    ]
  },
  crossbow_expert: {
    id: 'crossbow_expert',
    name: 'Crossbow Expert',
    description: 'Thanks to extensive practice with the crossbow, you gain the following benefits.',
    features: [
      {
        id: 'ce_ignore_loading',
        name: 'Ignore Loading',
        description: 'You ignore the loading quality of crossbows with which you are proficient.',
        source: 'Crossbow Expert'
      },
      {
        id: 'ce_point_blank',
        name: 'Point Blank',
        description: 'Being within 5 feet of a hostile creature doesn\'t impose disadvantage on your ranged attack rolls.',
        source: 'Crossbow Expert'
      },
      {
        id: 'ce_bonus_attack',
        name: 'Hand Crossbow Bonus Attack',
        description: 'When you use the Attack action and attack with a one-handed weapon, you can use a bonus action to attack with a hand crossbow you are holding.',
        source: 'Crossbow Expert',
        rulesKey: 'crossbow_expert_bonus'
      }
    ]
  },
  polearm_master: {
    id: 'polearm_master',
    name: 'Polearm Master',
    description: 'You can keep your enemies at bay with reach weapons.',
    features: [
      {
        id: 'pam_bonus_attack',
        name: 'Bonus Attack',
        description: 'When you take the Attack action and attack with only a glaive, halberd, quarterstaff, or spear, you can use a bonus action to make a melee attack with the opposite end of the weapon.',
        source: 'Polearm Master',
        rulesKey: 'polearm_master_bonus'
      },
      {
        id: 'pam_opportunity_attack',
        name: 'Opportunity Attack',
        description: 'While you are wielding a glaive, halberd, pike, or quarterstaff, other creatures provoke an opportunity attack from you when they enter your reach.',
        source: 'Polearm Master'
      }
    ]
  },
  lucky: {
    id: 'lucky',
    name: 'Lucky',
    description: 'You have inexplicable luck that seems to kick in at just the right moment.',
    features: [
      {
        id: 'lucky_points',
        name: 'Lucky Points',
        description: 'You have 3 luck points. Whenever you make an attack roll, ability check, or saving throw, you can spend one luck point to roll an additional d20.',
        source: 'Lucky'
      }
    ]
  },
  sentinel: {
    id: 'sentinel',
    name: 'Sentinel',
    description: 'You have mastered techniques to take advantage of every drop in any enemy\'s guard.',
    features: [
      {
        id: 'sentinel_opportunity_stop',
        name: 'Stop Movement',
        description: 'When you hit a creature with an opportunity attack, the creature\'s speed becomes 0 for the rest of the turn.',
        source: 'Sentinel'
      },
      {
        id: 'sentinel_disengage_ignore',
        name: 'Ignore Disengage',
        description: 'Creatures provoke opportunity attacks from you even if they take the Disengage action before leaving your reach.',
        source: 'Sentinel'
      },
      {
        id: 'sentinel_ally_protection',
        name: 'Protect Allies',
        description: 'When a creature within 5 feet of you is targeted by an attack from a creature other than you, you can use your reaction to make a melee weapon attack against the attacking creature.',
        source: 'Sentinel'
      }
    ]
  },
  // Half-feats (provide ability score increases)
  resilient: {
    id: 'resilient',
    name: 'Resilient',
    description: 'Choose one ability score. You gain proficiency in saving throws using the chosen ability.',
    abilityScoreIncrease: {
      choices: ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'],
      count: 1
    },
    features: [
      {
        id: 'resilient_save_prof',
        name: 'Saving Throw Proficiency',
        description: 'You gain proficiency in saving throws using the chosen ability.',
        source: 'Resilient'
      }
    ]
  },
  fey_touched: {
    id: 'fey_touched',
    name: 'Fey Touched',
    description: 'Your exposure to the Feywild\'s magic has changed you.',
    abilityScoreIncrease: {
      choices: ['INT', 'WIS', 'CHA'],
      count: 1
    },
    features: [
      {
        id: 'fey_touched_spells',
        name: 'Fey Magic',
        description: 'You learn the misty step spell and one 1st-level spell of your choice from the divination or enchantment school of magic.',
        source: 'Fey Touched'
      }
    ]
  },
  elven_accuracy: {
    id: 'elven_accuracy',
    name: 'Elven Accuracy',
    description: 'The accuracy of elves is legendary among other races.',
    prerequisites: ['Elf or half-elf'],
    abilityScoreIncrease: {
      choices: ['DEX', 'INT', 'WIS', 'CHA'],
      count: 1
    },
    features: [
      {
        id: 'elven_accuracy_reroll',
        name: 'Elven Accuracy',
        description: 'Whenever you have advantage on an attack roll using Dexterity, Intelligence, Wisdom, or Charisma, you can reroll one of the dice once.',
        source: 'Elven Accuracy',
        rulesKey: 'elven_accuracy'
      }
    ]
  },
  piercer: {
    id: 'piercer',
    name: 'Piercer',
    description: 'You have achieved a penetrating precision in combat.',
    abilityScoreIncrease: {
      choices: ['STR', 'DEX'],
      count: 1
    },
    features: [
      {
        id: 'piercer_reroll',
        name: 'Pierce Deeper',
        description: 'Once per turn, when you hit a creature with an attack that deals piercing damage, you can reroll one of the attack\'s damage dice.',
        source: 'Piercer'
      },
      {
        id: 'piercer_crit',
        name: 'Critical Pierce',
        description: 'When you score a critical hit that deals piercing damage to a creature, you can roll one additional damage die when determining the extra piercing damage the target takes.',
        source: 'Piercer'
      }
    ]
  }
}