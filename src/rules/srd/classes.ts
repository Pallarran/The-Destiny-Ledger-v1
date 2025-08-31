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
      source: 'Fighter 3',
      rulesKey: 'archetype'
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
  7: [
    {
      id: 'archetype_feature_fighter_7',
      name: 'Martial Archetype Feature',
      description: 'You gain a feature granted by your Martial Archetype.',
      source: 'Fighter 7',
      rulesKey: 'archetype_feature'
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
  10: [
    {
      id: 'archetype_feature_fighter_10',
      name: 'Martial Archetype Feature',
      description: 'You gain a feature granted by your Martial Archetype.',
      source: 'Fighter 10',
      rulesKey: 'archetype_feature'
    },
    {
      id: 'indomitable_improvement_10',
      name: 'Indomitable',
      description: 'You can use Indomitable twice between long rests.',
      source: 'Fighter 10'
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
  13: [
    {
      id: 'indomitable_improvement_13',
      name: 'Indomitable',
      description: 'You can use Indomitable three times between long rests.',
      source: 'Fighter 13'
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
  15: [
    {
      id: 'archetype_feature_fighter_15',
      name: 'Martial Archetype Feature',
      description: 'You gain a feature granted by your Martial Archetype.',
      source: 'Fighter 15',
      rulesKey: 'archetype_feature'
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
  17: [
    {
      id: 'action_surge_improvement_17',
      name: 'Action Surge',
      description: 'You can use Action Surge twice between short or long rests.',
      source: 'Fighter 17'
    },
    {
      id: 'indomitable_mastery_17',
      name: 'Indomitable',
      description: 'You can use Indomitable four times between long rests.',
      source: 'Fighter 17'
    }
  ],
  18: [
    {
      id: 'archetype_feature_fighter_18',
      name: 'Martial Archetype Feature',
      description: 'You gain a feature granted by your Martial Archetype.',
      source: 'Fighter 18',
      rulesKey: 'archetype_feature'
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
      source: 'Rogue 3',
      rulesKey: 'archetype'
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

// Wizard Class
const wizardFeatures: Record<number, Feature[]> = {
  1: [
    {
      id: 'spellcasting_wizard',
      name: 'Spellcasting',
      description: 'You have learned to cast spells. You know three cantrips and six 1st-level spells.',
      source: 'Wizard 1',
      rulesKey: 'spellcasting'
    },
    {
      id: 'arcane_recovery',
      name: 'Arcane Recovery',
      description: 'Once per day when you finish a short rest, you can recover some expended spell slots.',
      source: 'Wizard 1'
    }
  ],
  2: [
    {
      id: 'arcane_tradition',
      name: 'Arcane Tradition',
      description: 'Choose an Arcane Tradition, which shapes the practice of your magic.',
      source: 'Wizard 2',
      rulesKey: 'archetype'
    }
  ],
  4: [
    {
      id: 'asi_wizard_4',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Wizard 4',
      rulesKey: 'asi'
    }
  ],
  8: [
    {
      id: 'asi_wizard_8',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Wizard 8',
      rulesKey: 'asi'
    }
  ],
  12: [
    {
      id: 'asi_wizard_12',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Wizard 12',
      rulesKey: 'asi'
    }
  ],
  16: [
    {
      id: 'asi_wizard_16',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Wizard 16',
      rulesKey: 'asi'
    }
  ],
  18: [
    {
      id: 'spell_mastery',
      name: 'Spell Mastery',
      description: 'Choose a 1st-level wizard spell and a 2nd-level wizard spell. You can cast those spells at their lowest level without expending a spell slot.',
      source: 'Wizard 18'
    }
  ],
  19: [
    {
      id: 'asi_wizard_19',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Wizard 19',
      rulesKey: 'asi'
    }
  ],
  20: [
    {
      id: 'signature_spells',
      name: 'Signature Spells',
      description: 'Choose two 3rd-level wizard spells. You always have these spells prepared and can cast each once without expending a spell slot.',
      source: 'Wizard 20'
    }
  ]
}

// Cleric Class  
const clericFeatures: Record<number, Feature[]> = {
  1: [
    {
      id: 'spellcasting_cleric',
      name: 'Spellcasting',
      description: 'You can cast cleric spells. You know three cantrips and prepare a number of spells equal to your Wisdom modifier + cleric level.',
      source: 'Cleric 1',
      rulesKey: 'spellcasting'
    },
    {
      id: 'divine_domain',
      name: 'Divine Domain',
      description: 'Choose a domain related to your deity, which grants you domain spells and features.',
      source: 'Cleric 1',
      rulesKey: 'archetype'
    }
  ],
  2: [
    {
      id: 'channel_divinity',
      name: 'Channel Divinity',
      description: 'You can channel divine energy directly from your deity to fuel magical effects.',
      source: 'Cleric 2'
    }
  ],
  4: [
    {
      id: 'asi_cleric_4',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Cleric 4',
      rulesKey: 'asi'
    }
  ],
  5: [
    {
      id: 'destroy_undead_cr_half',
      name: 'Destroy Undead (CR 1/2)',
      description: 'When an undead fails its saving throw against your Turn Undead feature, it is instantly destroyed if its challenge rating is at or below 1/2.',
      source: 'Cleric 5'
    }
  ],
  8: [
    {
      id: 'asi_cleric_8',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Cleric 8',
      rulesKey: 'asi'
    }
  ],
  10: [
    {
      id: 'divine_intervention',
      name: 'Divine Intervention',
      description: 'You can call on your deity to intervene on your behalf when your need is great.',
      source: 'Cleric 10'
    }
  ],
  12: [
    {
      id: 'asi_cleric_12',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Cleric 12',
      rulesKey: 'asi'
    }
  ],
  16: [
    {
      id: 'asi_cleric_16',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Cleric 16',
      rulesKey: 'asi'
    }
  ],
  19: [
    {
      id: 'asi_cleric_19',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Cleric 19',
      rulesKey: 'asi'
    }
  ],
  20: [
    {
      id: 'divine_intervention_improvement',
      name: 'Divine Intervention Improvement',
      description: 'Your call for intervention succeeds automatically, no roll required.',
      source: 'Cleric 20'
    }
  ]
}

// Barbarian Class
const barbarianFeatures: Record<number, Feature[]> = {
  1: [
    {
      id: 'rage',
      name: 'Rage',
      description: 'In battle, you fight with primal ferocity. You can rage a number of times shown on the table.',
      source: 'Barbarian 1',
      rulesKey: 'rage'
    },
    {
      id: 'unarmored_defense_barbarian',
      name: 'Unarmored Defense',
      description: 'While not wearing armor, your AC equals 10 + Dex modifier + Con modifier.',
      source: 'Barbarian 1'
    }
  ],
  2: [
    {
      id: 'reckless_attack',
      name: 'Reckless Attack',
      description: 'You can throw aside all concern for defense to attack with fierce desperation.',
      source: 'Barbarian 2'
    },
    {
      id: 'danger_sense',
      name: 'Danger Sense',
      description: 'You have advantage on Dexterity saving throws against effects you can see.',
      source: 'Barbarian 2'
    }
  ],
  3: [
    {
      id: 'primal_path',
      name: 'Primal Path',
      description: 'Choose a path that shapes the nature of your rage.',
      source: 'Barbarian 3',
      rulesKey: 'archetype'
    }
  ],
  4: [
    {
      id: 'asi_barbarian_4',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Barbarian 4',
      rulesKey: 'asi'
    }
  ],
  5: [
    {
      id: 'extra_attack_barbarian',
      name: 'Extra Attack',
      description: 'You can attack twice whenever you take the Attack action.',
      source: 'Barbarian 5',
      rulesKey: 'extra_attack'
    },
    {
      id: 'fast_movement',
      name: 'Fast Movement',
      description: 'Your speed increases by 10 feet while not wearing heavy armor.',
      source: 'Barbarian 5'
    }
  ],
  7: [
    {
      id: 'feral_instinct',
      name: 'Feral Instinct',
      description: 'Your instincts are so honed that you have advantage on initiative rolls.',
      source: 'Barbarian 7'
    }
  ],
  8: [
    {
      id: 'asi_barbarian_8',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Barbarian 8',
      rulesKey: 'asi'
    }
  ],
  9: [
    {
      id: 'brutal_critical_1',
      name: 'Brutal Critical',
      description: 'You can roll one additional weapon damage die when determining extra damage for a critical hit.',
      source: 'Barbarian 9'
    }
  ],
  11: [
    {
      id: 'relentless_rage',
      name: 'Relentless Rage',
      description: 'Your rage can keep you fighting despite grievous wounds.',
      source: 'Barbarian 11'
    }
  ],
  12: [
    {
      id: 'asi_barbarian_12',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Barbarian 12',
      rulesKey: 'asi'
    }
  ],
  15: [
    {
      id: 'persistent_rage',
      name: 'Persistent Rage',
      description: 'Your rage is so fierce that it ends early only if you fall unconscious.',
      source: 'Barbarian 15'
    }
  ],
  16: [
    {
      id: 'asi_barbarian_16',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Barbarian 16',
      rulesKey: 'asi'
    }
  ],
  18: [
    {
      id: 'indomitable_might',
      name: 'Indomitable Might',
      description: 'If your total for a Strength check is less than your Strength score, you can use your Strength score in place of the total.',
      source: 'Barbarian 18'
    }
  ],
  19: [
    {
      id: 'asi_barbarian_19',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Barbarian 19',
      rulesKey: 'asi'
    }
  ],
  20: [
    {
      id: 'primal_champion',
      name: 'Primal Champion',
      description: 'Your Strength and Constitution scores increase by 4. Your maximum for those scores is now 24.',
      source: 'Barbarian 20'
    }
  ]
}

// Bard Class
const bardFeatures: Record<number, Feature[]> = {
  1: [
    {
      id: 'spellcasting_bard',
      name: 'Spellcasting',
      description: 'You can cast bard spells. You know two cantrips and four 1st-level spells.',
      source: 'Bard 1',
      rulesKey: 'spellcasting'
    },
    {
      id: 'bardic_inspiration',
      name: 'Bardic Inspiration',
      description: 'You can inspire others through words or music, granting them a Bardic Inspiration die.',
      source: 'Bard 1'
    }
  ],
  2: [
    {
      id: 'jack_of_all_trades',
      name: 'Jack of All Trades',
      description: 'You can add half your proficiency bonus to any ability check that doesn\'t already include your proficiency bonus.',
      source: 'Bard 2'
    },
    {
      id: 'song_of_rest',
      name: 'Song of Rest',
      description: 'You can use music to help revitalize your wounded allies during a short rest.',
      source: 'Bard 2'
    }
  ],
  3: [
    {
      id: 'bard_college',
      name: 'Bard College',
      description: 'Choose a bard college that you emulate in the adventuring styles and magics.',
      source: 'Bard 3',
      rulesKey: 'archetype'
    },
    {
      id: 'expertise_bard',
      name: 'Expertise',
      description: 'Choose two of your skill proficiencies. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.',
      source: 'Bard 3'
    }
  ],
  4: [
    {
      id: 'asi_bard_4',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Bard 4',
      rulesKey: 'asi'
    }
  ],
  5: [
    {
      id: 'bardic_inspiration_d8',
      name: 'Bardic Inspiration (d8)',
      description: 'Your Bardic Inspiration die changes to a d8.',
      source: 'Bard 5'
    },
    {
      id: 'font_of_inspiration',
      name: 'Font of Inspiration',
      description: 'You regain all of your expended uses of Bardic Inspiration when you finish a short or long rest.',
      source: 'Bard 5'
    }
  ],
  6: [
    {
      id: 'countercharm',
      name: 'Countercharm',
      description: 'You gain the ability to use musical notes or words of power to disrupt mind-influencing effects.',
      source: 'Bard 6'
    }
  ],
  8: [
    {
      id: 'asi_bard_8',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Bard 8',
      rulesKey: 'asi'
    }
  ],
  10: [
    {
      id: 'bardic_inspiration_d10',
      name: 'Bardic Inspiration (d10)',
      description: 'Your Bardic Inspiration die changes to a d10.',
      source: 'Bard 10'
    },
    {
      id: 'magical_secrets_1',
      name: 'Magical Secrets',
      description: 'Choose two spells from any class. The spells count as bard spells for you.',
      source: 'Bard 10'
    }
  ],
  12: [
    {
      id: 'asi_bard_12',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Bard 12',
      rulesKey: 'asi'
    }
  ],
  15: [
    {
      id: 'bardic_inspiration_d12',
      name: 'Bardic Inspiration (d12)',
      description: 'Your Bardic Inspiration die changes to a d12.',
      source: 'Bard 15'
    }
  ],
  16: [
    {
      id: 'asi_bard_16',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Bard 16',
      rulesKey: 'asi'
    }
  ],
  18: [
    {
      id: 'magical_secrets_2',
      name: 'Magical Secrets',
      description: 'Choose two more spells from any class.',
      source: 'Bard 18'
    }
  ],
  19: [
    {
      id: 'asi_bard_19',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Bard 19',
      rulesKey: 'asi'
    }
  ],
  20: [
    {
      id: 'superior_inspiration',
      name: 'Superior Inspiration',
      description: 'When you roll initiative and have no uses of Bardic Inspiration left, you regain one use.',
      source: 'Bard 20'
    }
  ]
}

// Paladin Class
const paladinFeatures: Record<number, Feature[]> = {
  1: [
    {
      id: 'divine_sense',
      name: 'Divine Sense',
      description: 'You can detect good and evil. You can use this feature a number of times equal to 1 + your Charisma modifier.',
      source: 'Paladin 1'
    },
    {
      id: 'lay_on_hands',
      name: 'Lay on Hands',
      description: 'You can heal wounds through touch. You have a pool of healing power equal to 5 × your paladin level.',
      source: 'Paladin 1'
    }
  ],
  2: [
    {
      id: 'fighting_style_paladin',
      name: 'Fighting Style',
      description: 'You adopt a particular style of fighting as your specialty.',
      source: 'Paladin 2',
      rulesKey: 'fighting_style'
    },
    {
      id: 'spellcasting_paladin',
      name: 'Spellcasting',
      description: 'You can cast paladin spells. You prepare spells equal to half your paladin level + Charisma modifier.',
      source: 'Paladin 2',
      rulesKey: 'spellcasting'
    },
    {
      id: 'divine_smite',
      name: 'Divine Smite',
      description: 'When you hit with a melee weapon attack, you can expend a spell slot to deal radiant damage.',
      source: 'Paladin 2',
      rulesKey: 'divine_smite'
    }
  ],
  3: [
    {
      id: 'divine_health',
      name: 'Divine Health',
      description: 'The divine magic flowing through you makes you immune to disease.',
      source: 'Paladin 3'
    },
    {
      id: 'sacred_oath',
      name: 'Sacred Oath',
      description: 'You swear the oath that binds you as a paladin forever.',
      source: 'Paladin 3',
      rulesKey: 'archetype'
    }
  ],
  4: [
    {
      id: 'asi_paladin_4',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Paladin 4',
      rulesKey: 'asi'
    }
  ],
  5: [
    {
      id: 'extra_attack_paladin',
      name: 'Extra Attack',
      description: 'You can attack twice whenever you take the Attack action.',
      source: 'Paladin 5',
      rulesKey: 'extra_attack'
    }
  ],
  6: [
    {
      id: 'aura_of_protection',
      name: 'Aura of Protection',
      description: 'You and friendly creatures within 10 feet gain a bonus to saving throws equal to your Charisma modifier.',
      source: 'Paladin 6'
    }
  ],
  8: [
    {
      id: 'asi_paladin_8',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Paladin 8',
      rulesKey: 'asi'
    }
  ],
  10: [
    {
      id: 'aura_of_courage',
      name: 'Aura of Courage',
      description: 'You and friendly creatures within 10 feet can\'t be frightened while you are conscious.',
      source: 'Paladin 10'
    }
  ],
  11: [
    {
      id: 'improved_divine_smite',
      name: 'Improved Divine Smite',
      description: 'All your melee weapon strikes carry divine power with them.',
      source: 'Paladin 11'
    }
  ],
  12: [
    {
      id: 'asi_paladin_12',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Paladin 12',
      rulesKey: 'asi'
    }
  ],
  14: [
    {
      id: 'cleansing_touch',
      name: 'Cleansing Touch',
      description: 'You can use your action to end one spell on yourself or on one willing creature that you touch.',
      source: 'Paladin 14'
    }
  ],
  16: [
    {
      id: 'asi_paladin_16',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Paladin 16',
      rulesKey: 'asi'
    }
  ],
  18: [
    {
      id: 'aura_improvements',
      name: 'Aura Improvements',
      description: 'The range of your Aura of Protection and Aura of Courage increases to 30 feet.',
      source: 'Paladin 18'
    }
  ],
  19: [
    {
      id: 'asi_paladin_19',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Paladin 19',
      rulesKey: 'asi'
    }
  ],
  20: [
    {
      id: 'divine_champion',
      name: 'Divine Champion',
      description: 'At 20th level, you become an avatar of righteousness.',
      source: 'Paladin 20'
    }
  ]
}

// Ranger Class
const rangerFeatures: Record<number, Feature[]> = {
  1: [
    {
      id: 'favored_enemy',
      name: 'Favored Enemy',
      description: 'You have significant experience studying, tracking, hunting, and talking to a certain type of enemy.',
      source: 'Ranger 1'
    },
    {
      id: 'natural_explorer',
      name: 'Natural Explorer',
      description: 'You are particularly familiar with one type of natural environment.',
      source: 'Ranger 1'
    }
  ],
  2: [
    {
      id: 'fighting_style_ranger',
      name: 'Fighting Style',
      description: 'You adopt a particular style of fighting as your specialty.',
      source: 'Ranger 2',
      rulesKey: 'fighting_style'
    },
    {
      id: 'spellcasting_ranger',
      name: 'Spellcasting',
      description: 'You can cast ranger spells.',
      source: 'Ranger 2',
      rulesKey: 'spellcasting'
    }
  ],
  3: [
    {
      id: 'ranger_conclave',
      name: 'Ranger Conclave',
      description: 'Choose an archetype that you emulate.',
      source: 'Ranger 3',
      rulesKey: 'archetype'
    },
    {
      id: 'primeval_awareness',
      name: 'Primeval Awareness',
      description: 'You can use your action to focus your awareness on the region around you.',
      source: 'Ranger 3'
    }
  ],
  4: [
    {
      id: 'asi_ranger_4',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Ranger 4',
      rulesKey: 'asi'
    }
  ],
  5: [
    {
      id: 'extra_attack_ranger',
      name: 'Extra Attack',
      description: 'You can attack twice whenever you take the Attack action.',
      source: 'Ranger 5',
      rulesKey: 'extra_attack'
    }
  ],
  8: [
    {
      id: 'asi_ranger_8',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Ranger 8',
      rulesKey: 'asi'
    },
    {
      id: 'lands_stride',
      name: "Land's Stride",
      description: 'Moving through nonmagical difficult terrain costs you no extra movement.',
      source: 'Ranger 8'
    }
  ],
  10: [
    {
      id: 'hide_in_plain_sight',
      name: 'Hide in Plain Sight',
      description: 'You can spend 1 minute creating camouflage for yourself.',
      source: 'Ranger 10'
    }
  ],
  12: [
    {
      id: 'asi_ranger_12',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Ranger 12',
      rulesKey: 'asi'
    }
  ],
  14: [
    {
      id: 'vanish',
      name: 'Vanish',
      description: 'You can use the Hide action as a bonus action.',
      source: 'Ranger 14'
    }
  ],
  16: [
    {
      id: 'asi_ranger_16',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Ranger 16',
      rulesKey: 'asi'
    }
  ],
  18: [
    {
      id: 'feral_senses',
      name: 'Feral Senses',
      description: 'You gain preternatural senses that help you fight creatures you can\'t see.',
      source: 'Ranger 18'
    }
  ],
  19: [
    {
      id: 'asi_ranger_19',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Ranger 19',
      rulesKey: 'asi'
    }
  ],
  20: [
    {
      id: 'foe_slayer',
      name: 'Foe Slayer',
      description: 'You become an unparalleled hunter of your enemies.',
      source: 'Ranger 20'
    }
  ]
}

// Sorcerer Class
const sorcererFeatures: Record<number, Feature[]> = {
  1: [
    {
      id: 'spellcasting_sorcerer',
      name: 'Spellcasting',
      description: 'You can cast sorcerer spells.',
      source: 'Sorcerer 1',
      rulesKey: 'spellcasting'
    },
    {
      id: 'sorcerous_origin',
      name: 'Sorcerous Origin',
      description: 'Choose a sorcerous origin, which describes the source of your innate magical power.',
      source: 'Sorcerer 1',
      rulesKey: 'archetype'
    }
  ],
  2: [
    {
      id: 'font_of_magic',
      name: 'Font of Magic',
      description: 'You tap into a deep wellspring of magic within yourself. You have sorcery points equal to your sorcerer level.',
      source: 'Sorcerer 2'
    }
  ],
  3: [
    {
      id: 'metamagic',
      name: 'Metamagic',
      description: 'You gain the ability to twist your spells to suit your needs. Choose two Metamagic options.',
      source: 'Sorcerer 3'
    }
  ],
  4: [
    {
      id: 'asi_sorcerer_4',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Sorcerer 4',
      rulesKey: 'asi'
    }
  ],
  8: [
    {
      id: 'asi_sorcerer_8',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Sorcerer 8',
      rulesKey: 'asi'
    }
  ],
  10: [
    {
      id: 'metamagic_2',
      name: 'Metamagic',
      description: 'You learn another metamagic option.',
      source: 'Sorcerer 10'
    }
  ],
  12: [
    {
      id: 'asi_sorcerer_12',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Sorcerer 12',
      rulesKey: 'asi'
    }
  ],
  16: [
    {
      id: 'asi_sorcerer_16',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Sorcerer 16',
      rulesKey: 'asi'
    }
  ],
  17: [
    {
      id: 'metamagic_3',
      name: 'Metamagic',
      description: 'You learn another metamagic option.',
      source: 'Sorcerer 17'
    }
  ],
  19: [
    {
      id: 'asi_sorcerer_19',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Sorcerer 19',
      rulesKey: 'asi'
    }
  ],
  20: [
    {
      id: 'sorcerous_restoration',
      name: 'Sorcerous Restoration',
      description: 'You regain 4 expended sorcery points whenever you finish a short rest.',
      source: 'Sorcerer 20'
    }
  ]
}

// Warlock Class
const warlockFeatures: Record<number, Feature[]> = {
  1: [
    {
      id: 'otherworldly_patron',
      name: 'Otherworldly Patron',
      description: 'You have struck a bargain with an otherworldly being of your choice.',
      source: 'Warlock 1',
      rulesKey: 'archetype'
    },
    {
      id: 'pact_magic',
      name: 'Pact Magic',
      description: 'Your arcane research and your patron have given you facility with spells.',
      source: 'Warlock 1',
      rulesKey: 'pact_magic'
    }
  ],
  2: [
    {
      id: 'eldritch_invocations',
      name: 'Eldritch Invocations',
      description: 'You learn fragments of forbidden knowledge. Choose two eldritch invocations.',
      source: 'Warlock 2'
    }
  ],
  3: [
    {
      id: 'pact_boon',
      name: 'Pact Boon',
      description: 'Your patron bestows a gift upon you for your loyal service.',
      source: 'Warlock 3'
    }
  ],
  4: [
    {
      id: 'asi_warlock_4',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Warlock 4',
      rulesKey: 'asi'
    }
  ],
  8: [
    {
      id: 'asi_warlock_8',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Warlock 8',
      rulesKey: 'asi'
    }
  ],
  11: [
    {
      id: 'mystic_arcanum_6',
      name: 'Mystic Arcanum (6th level)',
      description: 'Your patron bestows upon you a magical secret. Choose one 6th-level spell.',
      source: 'Warlock 11'
    }
  ],
  12: [
    {
      id: 'asi_warlock_12',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Warlock 12',
      rulesKey: 'asi'
    }
  ],
  13: [
    {
      id: 'mystic_arcanum_7',
      name: 'Mystic Arcanum (7th level)',
      description: 'Choose one 7th-level spell as an arcanum.',
      source: 'Warlock 13'
    }
  ],
  15: [
    {
      id: 'mystic_arcanum_8',
      name: 'Mystic Arcanum (8th level)',
      description: 'Choose one 8th-level spell as an arcanum.',
      source: 'Warlock 15'
    }
  ],
  16: [
    {
      id: 'asi_warlock_16',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Warlock 16',
      rulesKey: 'asi'
    }
  ],
  17: [
    {
      id: 'mystic_arcanum_9',
      name: 'Mystic Arcanum (9th level)',
      description: 'Choose one 9th-level spell as an arcanum.',
      source: 'Warlock 17'
    }
  ],
  19: [
    {
      id: 'asi_warlock_19',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Warlock 19',
      rulesKey: 'asi'
    }
  ],
  20: [
    {
      id: 'eldritch_master',
      name: 'Eldritch Master',
      description: 'You can draw on your inner reserve of mystical power.',
      source: 'Warlock 20'
    }
  ]
}

// Monk Class
const monkFeatures: Record<number, Feature[]> = {
  1: [
    {
      id: 'unarmored_defense_monk',
      name: 'Unarmored Defense',
      description: 'While not wearing armor, your AC equals 10 + Dex modifier + Wis modifier.',
      source: 'Monk 1'
    },
    {
      id: 'martial_arts',
      name: 'Martial Arts',
      description: 'You gain mastery of combat styles using unarmed strikes and monk weapons.',
      source: 'Monk 1',
      rulesKey: 'martial_arts'
    }
  ],
  2: [
    {
      id: 'ki',
      name: 'Ki',
      description: 'You can harness the mystic energy of ki. You have ki points equal to your monk level.',
      source: 'Monk 2'
    },
    {
      id: 'unarmored_movement',
      name: 'Unarmored Movement',
      description: 'Your speed increases by 10 feet while not wearing armor.',
      source: 'Monk 2'
    }
  ],
  3: [
    {
      id: 'monastic_tradition',
      name: 'Monastic Tradition',
      description: 'Choose a monastic tradition.',
      source: 'Monk 3',
      rulesKey: 'archetype'
    },
    {
      id: 'deflect_missiles',
      name: 'Deflect Missiles',
      description: 'You can use your reaction to deflect or catch missiles.',
      source: 'Monk 3'
    }
  ],
  4: [
    {
      id: 'asi_monk_4',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Monk 4',
      rulesKey: 'asi'
    },
    {
      id: 'slow_fall',
      name: 'Slow Fall',
      description: 'You can use your reaction to reduce falling damage.',
      source: 'Monk 4'
    }
  ],
  5: [
    {
      id: 'extra_attack_monk',
      name: 'Extra Attack',
      description: 'You can attack twice whenever you take the Attack action.',
      source: 'Monk 5',
      rulesKey: 'extra_attack'
    },
    {
      id: 'stunning_strike',
      name: 'Stunning Strike',
      description: 'You can interfere with the flow of ki in an opponent\'s body.',
      source: 'Monk 5'
    }
  ],
  6: [
    {
      id: 'ki_empowered_strikes',
      name: 'Ki-Empowered Strikes',
      description: 'Your unarmed strikes count as magical.',
      source: 'Monk 6'
    }
  ],
  7: [
    {
      id: 'evasion',
      name: 'Evasion',
      description: 'You can nimbly dodge out of the way of certain area effects.',
      source: 'Monk 7'
    },
    {
      id: 'stillness_of_mind',
      name: 'Stillness of Mind',
      description: 'You can use an action to end one effect causing you to be charmed or frightened.',
      source: 'Monk 7'
    }
  ],
  8: [
    {
      id: 'asi_monk_8',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Monk 8',
      rulesKey: 'asi'
    }
  ],
  10: [
    {
      id: 'purity_of_body',
      name: 'Purity of Body',
      description: 'You are immune to disease and poison.',
      source: 'Monk 10'
    }
  ],
  12: [
    {
      id: 'asi_monk_12',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Monk 12',
      rulesKey: 'asi'
    }
  ],
  13: [
    {
      id: 'tongue_of_sun_and_moon',
      name: 'Tongue of the Sun and Moon',
      description: 'You can understand all spoken languages.',
      source: 'Monk 13'
    }
  ],
  14: [
    {
      id: 'diamond_soul',
      name: 'Diamond Soul',
      description: 'You have proficiency in all saving throws.',
      source: 'Monk 14'
    }
  ],
  15: [
    {
      id: 'timeless_body',
      name: 'Timeless Body',
      description: 'You no longer need food or water.',
      source: 'Monk 15'
    }
  ],
  16: [
    {
      id: 'asi_monk_16',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Monk 16',
      rulesKey: 'asi'
    }
  ],
  18: [
    {
      id: 'empty_body',
      name: 'Empty Body',
      description: 'You can use an action to spend 4 ki points to become invisible.',
      source: 'Monk 18'
    }
  ],
  19: [
    {
      id: 'asi_monk_19',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Monk 19',
      rulesKey: 'asi'
    }
  ],
  20: [
    {
      id: 'perfect_self',
      name: 'Perfect Self',
      description: 'When you roll for initiative and have no ki points, you regain 4 ki points.',
      source: 'Monk 20'
    }
  ]
}

// Druid Class
const druidFeatures: Record<number, Feature[]> = {
  1: [
    {
      id: 'druidic',
      name: 'Druidic',
      description: 'You know Druidic, the secret language of druids.',
      source: 'Druid 1'
    },
    {
      id: 'spellcasting_druid',
      name: 'Spellcasting',
      description: 'You can cast druid spells.',
      source: 'Druid 1',
      rulesKey: 'spellcasting'
    }
  ],
  2: [
    {
      id: 'wild_shape',
      name: 'Wild Shape',
      description: 'You can use an action to magically assume the shape of a beast.',
      source: 'Druid 2',
      rulesKey: 'wild_shape'
    },
    {
      id: 'druid_circle',
      name: 'Druid Circle',
      description: 'Choose a circle of druids.',
      source: 'Druid 2',
      rulesKey: 'archetype'
    }
  ],
  4: [
    {
      id: 'wild_shape_improvement',
      name: 'Wild Shape Improvement',
      description: 'You can transform into beasts with CR 1/2 or lower.',
      source: 'Druid 4'
    },
    {
      id: 'asi_druid_4',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Druid 4',
      rulesKey: 'asi'
    }
  ],
  8: [
    {
      id: 'wild_shape_improvement_2',
      name: 'Wild Shape Improvement',
      description: 'You can transform into beasts with CR 1 or lower.',
      source: 'Druid 8'
    },
    {
      id: 'asi_druid_8',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Druid 8',
      rulesKey: 'asi'
    }
  ],
  12: [
    {
      id: 'asi_druid_12',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Druid 12',
      rulesKey: 'asi'
    }
  ],
  16: [
    {
      id: 'asi_druid_16',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Druid 16',
      rulesKey: 'asi'
    }
  ],
  18: [
    {
      id: 'timeless_body_druid',
      name: 'Timeless Body',
      description: 'You age more slowly. For every 10 years that pass, you age only 1 year.',
      source: 'Druid 18'
    },
    {
      id: 'beast_spells',
      name: 'Beast Spells',
      description: 'You can cast spells in beast form.',
      source: 'Druid 18'
    }
  ],
  19: [
    {
      id: 'asi_druid_19',
      name: 'Ability Score Improvement',
      description: 'You can increase one ability score by 2, or two ability scores by 1 each, or take a feat.',
      source: 'Druid 19',
      rulesKey: 'asi'
    }
  ],
  20: [
    {
      id: 'archdruid',
      name: 'Archdruid',
      description: 'You can use Wild Shape an unlimited number of times.',
      source: 'Druid 20'
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
  },
  wizard: {
    id: 'wizard',
    name: 'Wizard',
    hitDie: 6,
    primaryAbilities: ['INT'],
    savingThrowProficiencies: ['INT', 'WIS'],
    skillChoices: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'],
    skillChoiceCount: 2,
    features: wizardFeatures
  },
  cleric: {
    id: 'cleric',
    name: 'Cleric',
    hitDie: 8,
    primaryAbilities: ['WIS'],
    savingThrowProficiencies: ['WIS', 'CHA'],
    skillChoices: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'],
    skillChoiceCount: 2,
    features: clericFeatures
  },
  barbarian: {
    id: 'barbarian',
    name: 'Barbarian',
    hitDie: 12,
    primaryAbilities: ['STR'],
    savingThrowProficiencies: ['STR', 'CON'],
    skillChoices: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'],
    skillChoiceCount: 2,
    features: barbarianFeatures
  },
  bard: {
    id: 'bard',
    name: 'Bard',
    hitDie: 8,
    primaryAbilities: ['CHA'],
    savingThrowProficiencies: ['DEX', 'CHA'],
    skillChoices: ['Deception', 'History', 'Investigation', 'Persuasion', 'Religion', 'Sleight of Hand'],
    skillChoiceCount: 3,
    features: bardFeatures
  },
  paladin: {
    id: 'paladin',
    name: 'Paladin',
    hitDie: 10,
    primaryAbilities: ['STR', 'CHA'],
    savingThrowProficiencies: ['WIS', 'CHA'],
    skillChoices: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'],
    skillChoiceCount: 2,
    features: paladinFeatures,
    fightingStyles: Object.values(fightingStyles).filter(fs => 
      ['defense', 'dueling', 'great_weapon_fighting', 'protection'].includes(fs.id)
    ),
    fightingStyleLevel: 2
  },
  ranger: {
    id: 'ranger',
    name: 'Ranger',
    hitDie: 10,
    primaryAbilities: ['DEX', 'WIS'],
    savingThrowProficiencies: ['STR', 'DEX'],
    skillChoices: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'],
    skillChoiceCount: 3,
    features: rangerFeatures,
    fightingStyles: Object.values(fightingStyles).filter(fs => 
      ['archery', 'defense', 'dueling', 'two_weapon_fighting'].includes(fs.id)
    ),
    fightingStyleLevel: 2
  },
  sorcerer: {
    id: 'sorcerer',
    name: 'Sorcerer',
    hitDie: 6,
    primaryAbilities: ['CHA'],
    savingThrowProficiencies: ['CON', 'CHA'],
    skillChoices: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'],
    skillChoiceCount: 2,
    features: sorcererFeatures
  },
  warlock: {
    id: 'warlock',
    name: 'Warlock',
    hitDie: 8,
    primaryAbilities: ['CHA'],
    savingThrowProficiencies: ['WIS', 'CHA'],
    skillChoices: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'],
    skillChoiceCount: 2,
    features: warlockFeatures
  },
  monk: {
    id: 'monk',
    name: 'Monk',
    hitDie: 8,
    primaryAbilities: ['DEX', 'WIS'],
    savingThrowProficiencies: ['STR', 'DEX'],
    skillChoices: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'],
    skillChoiceCount: 2,
    features: monkFeatures
  },
  druid: {
    id: 'druid',
    name: 'Druid',
    hitDie: 8,
    primaryAbilities: ['WIS'],
    savingThrowProficiencies: ['INT', 'WIS'],
    skillChoices: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'],
    skillChoiceCount: 2,
    features: druidFeatures
  }
}