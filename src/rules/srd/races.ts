export interface RacialTrait {
  name: string
  description: string
}

export interface AbilityScoreIncrease {
  ability: string
  bonus: number
}

export interface Race {
  id: string
  name: string
  description: string
  abilityScoreIncrease: AbilityScoreIncrease[]
  size: 'Small' | 'Medium' | 'Large'
  speed: number
  languages: string[]
  proficiencies?: {
    skills?: string[]
    weapons?: string[]
    armor?: string[]
    tools?: string[]
  }
  traits: RacialTrait[]
  subraces?: Subrace[]
}

export interface Subrace {
  id: string
  name: string
  description: string
  abilityScoreIncrease?: AbilityScoreIncrease[]
  traits: RacialTrait[]
}

export const races: Record<string, Race> = {
  human: {
    id: 'human',
    name: 'Human',
    description: 'Humans are the most adaptable and ambitious people among the common races. They have widely varying tastes, morals, and customs in the many different lands where they have settled.',
    abilityScoreIncrease: [
      { ability: 'STR', bonus: 1 },
      { ability: 'DEX', bonus: 1 },
      { ability: 'CON', bonus: 1 },
      { ability: 'INT', bonus: 1 },
      { ability: 'WIS', bonus: 1 },
      { ability: 'CHA', bonus: 1 }
    ],
    size: 'Medium',
    speed: 30,
    languages: ['Common'],
    proficiencies: {
      skills: []
    },
    traits: [
      {
        name: 'Extra Language',
        description: 'You can speak, read, and write one extra language of your choice.'
      }
    ]
  },
  
  variant_human: {
    id: 'variant_human',
    name: 'Variant Human',
    description: "If your campaign uses the optional feat rules, your Dungeon Master might allow these variant traits, all of which replace the human's Ability Score Increase trait.",
    abilityScoreIncrease: [
      // Two different +1s of choice - handled specially in UI
    ],
    size: 'Medium',
    speed: 30,
    languages: ['Common'],
    proficiencies: {
      skills: [] // One skill of choice - handled specially in UI
    },
    traits: [
      {
        name: 'Ability Score Increase',
        description: 'Two different ability scores of your choice increase by 1.'
      },
      {
        name: 'Skills',
        description: 'You gain proficiency in one skill of your choice.'
      },
      {
        name: 'Feat',
        description: 'You gain one feat of your choice.'
      },
      {
        name: 'Extra Language',
        description: 'You can speak, read, and write one extra language of your choice.'
      }
    ]
  },
  
  dwarf: {
    id: 'dwarf',
    name: 'Dwarf',
    description: 'Bold and hardy, dwarves are known as skilled warriors, miners, and workers of stone and metal.',
    abilityScoreIncrease: [
      { ability: 'CON', bonus: 2 }
    ],
    size: 'Medium',
    speed: 25,
    languages: ['Common', 'Dwarvish'],
    proficiencies: {
      weapons: ['battleaxe', 'handaxe', 'light hammer', 'warhammer'],
      tools: ['smith\'s tools', 'brewer\'s supplies', 'mason\'s tools']
    },
    traits: [
      {
        name: 'Darkvision',
        description: 'You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light.'
      },
      {
        name: 'Dwarven Resilience',
        description: 'You have advantage on saving throws against poison, and you have resistance against poison damage.'
      },
      {
        name: 'Stonecunning',
        description: 'Whenever you make an Intelligence (History) check related to the origin of stonework, you are considered proficient in the History skill and add double your proficiency bonus to the check.'
      }
    ],
    subraces: [
      {
        id: 'hill_dwarf',
        name: 'Hill Dwarf',
        description: 'Hill dwarves are known for their keen senses, deep intuition, and remarkable resilience.',
        abilityScoreIncrease: [
          { ability: 'WIS', bonus: 1 }
        ],
        traits: [
          {
            name: 'Dwarven Toughness',
            description: 'Your hit point maximum increases by 1, and it increases by 1 every time you gain a level.'
          }
        ]
      },
      {
        id: 'mountain_dwarf',
        name: 'Mountain Dwarf',
        description: 'Mountain dwarves are strong and hardy, accustomed to a difficult life in rugged terrain.',
        abilityScoreIncrease: [
          { ability: 'STR', bonus: 2 }
        ],
        traits: [
          {
            name: 'Armor Training',
            description: 'You have proficiency with light and medium armor.'
          }
        ]
      }
    ]
  },
  
  elf: {
    id: 'elf',
    name: 'Elf',
    description: 'Elves are a magical people of otherworldly grace, living in the world but not entirely part of it.',
    abilityScoreIncrease: [
      { ability: 'DEX', bonus: 2 }
    ],
    size: 'Medium',
    speed: 30,
    languages: ['Common', 'Elvish'],
    proficiencies: {
      skills: ['Perception']
    },
    traits: [
      {
        name: 'Darkvision',
        description: 'You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light.'
      },
      {
        name: 'Keen Senses',
        description: 'You have proficiency in the Perception skill.'
      },
      {
        name: 'Fey Ancestry',
        description: 'You have advantage on saving throws against being charmed, and magic can\'t put you to sleep.'
      },
      {
        name: 'Trance',
        description: 'Elves don\'t need to sleep. Instead, they meditate deeply, remaining semiconscious, for 4 hours a day.'
      }
    ],
    subraces: [
      {
        id: 'high_elf',
        name: 'High Elf',
        description: 'High elves are haughty and reclusive, believing themselves to be superior to non-elves and even other elves.',
        abilityScoreIncrease: [
          { ability: 'INT', bonus: 1 }
        ],
        traits: [
          {
            name: 'Elf Weapon Training',
            description: 'You have proficiency with longswords, shortbows, longbows, and shortbows.'
          },
          {
            name: 'Cantrip',
            description: 'You know one cantrip of your choice from the wizard spell list. Intelligence is your spellcasting ability for it.'
          },
          {
            name: 'Extra Language',
            description: 'You can speak, read, and write one extra language of your choice.'
          }
        ]
      },
      {
        id: 'wood_elf',
        name: 'Wood Elf',
        description: 'Wood elves have keen senses and intuition, and their fleet feet carry them quickly and stealthily through their native forests.',
        abilityScoreIncrease: [
          { ability: 'WIS', bonus: 1 }
        ],
        traits: [
          {
            name: 'Elf Weapon Training',
            description: 'You have proficiency with longswords, shortbows, longbows, and shortbows.'
          },
          {
            name: 'Fleet of Foot',
            description: 'Your base walking speed increases to 35 feet.'
          },
          {
            name: 'Mask of the Wild',
            description: 'You can attempt to hide even when you are only lightly obscured by foliage, heavy rain, falling snow, mist, and other natural phenomena.'
          }
        ]
      },
      {
        id: 'drow',
        name: 'Drow (Dark Elf)',
        description: 'Drow are more often evil than not. The drow have black skin that resembles polished obsidian and stark white or pale yellow hair.',
        abilityScoreIncrease: [
          { ability: 'CHA', bonus: 1 }
        ],
        traits: [
          {
            name: 'Superior Darkvision',
            description: 'Your darkvision has a radius of 120 feet.'
          },
          {
            name: 'Sunlight Sensitivity',
            description: 'You have disadvantage on attack rolls and on Wisdom (Perception) checks that rely on sight when you, the target of your attack, or whatever you are trying to perceive is in direct sunlight.'
          },
          {
            name: 'Drow Magic',
            description: 'You know the dancing lights cantrip. When you reach 3rd level, you can cast the faerie fire spell once with this trait and regain the ability to do so when you finish a long rest.'
          },
          {
            name: 'Drow Weapon Training',
            description: 'You have proficiency with rapiers, shortswords, and hand crossbows.'
          }
        ]
      }
    ]
  },
  
  halfling: {
    id: 'halfling',
    name: 'Halfling',
    description: 'The comforts of home are the goals of most halflings\' lives: a place to settle in peace and quiet, far from marauding monsters and clashing armies.',
    abilityScoreIncrease: [
      { ability: 'DEX', bonus: 2 }
    ],
    size: 'Small',
    speed: 25,
    languages: ['Common', 'Halfling'],
    traits: [
      {
        name: 'Lucky',
        description: 'When you roll a 1 on the d20 for an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll.'
      },
      {
        name: 'Brave',
        description: 'You have advantage on saving throws against being frightened.'
      },
      {
        name: 'Halfling Nimbleness',
        description: 'You can move through the space of any creature that is of a size larger than yours.'
      }
    ],
    subraces: [
      {
        id: 'lightfoot_halfling',
        name: 'Lightfoot Halfling',
        description: 'Lightfoot halflings can easily hide from notice, even using other people as cover.',
        abilityScoreIncrease: [
          { ability: 'CHA', bonus: 1 }
        ],
        traits: [
          {
            name: 'Naturally Stealthy',
            description: 'You can attempt to hide even when you are obscured only by a creature that is at least one size larger than you.'
          }
        ]
      },
      {
        id: 'stout_halfling',
        name: 'Stout Halfling',
        description: 'Stout halflings are hardier than average and have some resistance to poison.',
        abilityScoreIncrease: [
          { ability: 'CON', bonus: 1 }
        ],
        traits: [
          {
            name: 'Stout Resilience',
            description: 'You have advantage on saving throws against poison, and you have resistance against poison damage.'
          }
        ]
      }
    ]
  },
  
  dragonborn: {
    id: 'dragonborn',
    name: 'Dragonborn',
    description: 'Born of dragons, as their name proclaims, the dragonborn walk proudly through a world that greets them with fearful incomprehension.',
    abilityScoreIncrease: [
      { ability: 'STR', bonus: 2 },
      { ability: 'CHA', bonus: 1 }
    ],
    size: 'Medium',
    speed: 30,
    languages: ['Common', 'Draconic'],
    traits: [
      {
        name: 'Draconic Ancestry',
        description: 'You have draconic ancestry. Choose one type of dragon from the Draconic Ancestry table. Your breath weapon and damage resistance are determined by the dragon type.'
      },
      {
        name: 'Breath Weapon',
        description: 'You can use your action to exhale destructive energy. Your draconic ancestry determines the size, shape, and damage type of the exhalation.'
      },
      {
        name: 'Damage Resistance',
        description: 'You have resistance to the damage type associated with your draconic ancestry.'
      }
    ]
  },
  
  gnome: {
    id: 'gnome',
    name: 'Gnome',
    description: 'A gnome\'s energy and enthusiasm for living shines through every inch of his or her tiny body.',
    abilityScoreIncrease: [
      { ability: 'INT', bonus: 2 }
    ],
    size: 'Small',
    speed: 25,
    languages: ['Common', 'Gnomish'],
    traits: [
      {
        name: 'Darkvision',
        description: 'You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light.'
      },
      {
        name: 'Gnome Cunning',
        description: 'You have advantage on all Intelligence, Wisdom, and Charisma saving throws against magic.'
      }
    ],
    subraces: [
      {
        id: 'forest_gnome',
        name: 'Forest Gnome',
        description: 'Forest gnomes have a natural knack for illusion and inherent quickness and stealth.',
        abilityScoreIncrease: [
          { ability: 'DEX', bonus: 1 }
        ],
        traits: [
          {
            name: 'Natural Illusionist',
            description: 'You know the minor illusion cantrip. Intelligence is your spellcasting ability for it.'
          },
          {
            name: 'Speak with Small Beasts',
            description: 'Through sounds and gestures, you can communicate simple ideas with Small or smaller beasts.'
          }
        ]
      },
      {
        id: 'rock_gnome',
        name: 'Rock Gnome',
        description: 'Rock gnomes are the most common variety of gnomes in most worlds.',
        abilityScoreIncrease: [
          { ability: 'CON', bonus: 1 }
        ],
        traits: [
          {
            name: 'Artificer\'s Lore',
            description: 'Whenever you make an Intelligence (History) check related to magic items, alchemical objects, or technological devices, you can add twice your proficiency bonus, instead of any proficiency bonus you normally apply.'
          },
          {
            name: 'Tinker',
            description: 'You have proficiency with artisan\'s tools (tinker\'s tools). Using those tools, you can spend 1 hour and 10 gp worth of materials to construct a Tiny clockwork device (AC 5, 1 hp).'
          }
        ]
      }
    ]
  },
  
  half_elf: {
    id: 'half_elf',
    name: 'Half-Elf',
    description: 'Half-elves combine what some say are the best qualities of their elf and human parents.',
    abilityScoreIncrease: [
      { ability: 'CHA', bonus: 2 }
      // Plus 2 different abilities of your choice get +1 each
    ],
    size: 'Medium',
    speed: 30,
    languages: ['Common', 'Elvish'],
    proficiencies: {
      skills: [] // 2 skills of your choice
    },
    traits: [
      {
        name: 'Darkvision',
        description: 'You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light.'
      },
      {
        name: 'Fey Ancestry',
        description: 'You have advantage on saving throws against being charmed, and magic can\'t put you to sleep.'
      },
      {
        name: 'Extra Language',
        description: 'You can speak, read, and write one extra language of your choice.'
      },
      {
        name: 'Skill Versatility',
        description: 'You gain proficiency in two skills of your choice.'
      },
      {
        name: 'Ability Score Increase',
        description: 'Two different ability scores of your choice increase by 1.'
      }
    ]
  },
  
  half_orc: {
    id: 'half_orc',
    name: 'Half-Orc',
    description: 'Half-orcs most often live among orcs. Of the other races, humans are most likely to accept half-orcs.',
    abilityScoreIncrease: [
      { ability: 'STR', bonus: 2 },
      { ability: 'CON', bonus: 1 }
    ],
    size: 'Medium',
    speed: 30,
    languages: ['Common', 'Orc'],
    proficiencies: {
      skills: ['Intimidation']
    },
    traits: [
      {
        name: 'Darkvision',
        description: 'You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light.'
      },
      {
        name: 'Menacing',
        description: 'You gain proficiency in the Intimidation skill.'
      },
      {
        name: 'Relentless Endurance',
        description: 'When you are reduced to 0 hit points but not killed outright, you can drop to 1 hit point instead. You can\'t use this feature again until you finish a long rest.'
      },
      {
        name: 'Savage Attacks',
        description: 'When you score a critical hit with a melee weapon attack, you can roll one of the weapon\'s damage dice one additional time and add it to the extra damage of the critical hit.'
      }
    ]
  },
  
  tiefling: {
    id: 'tiefling',
    name: 'Tiefling',
    description: 'To be greeted with stares and whispers, to suffer violence and insult on the street, to see mistrust and fear in every eye: this is the lot of the tiefling.',
    abilityScoreIncrease: [
      { ability: 'INT', bonus: 1 },
      { ability: 'CHA', bonus: 2 }
    ],
    size: 'Medium',
    speed: 30,
    languages: ['Common', 'Infernal'],
    traits: [
      {
        name: 'Darkvision',
        description: 'You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light.'
      },
      {
        name: 'Hellish Resistance',
        description: 'You have resistance to fire damage.'
      },
      {
        name: 'Infernal Legacy',
        description: 'You know the thaumaturgy cantrip. When you reach 3rd level, you can cast the hellish rebuke spell as a 2nd-level spell once with this trait and regain the ability to do so when you finish a long rest. When you reach 5th level, you can cast the darkness spell once with this trait and regain the ability to do so when you finish a long rest. Charisma is your spellcasting ability for these spells.'
      }
    ]
  },

  kobold: {
    id: 'kobold',
    name: 'Kobold',
    description: 'Kobolds are small, draconic creatures that live in underground lairs and work together in groups. They are cunning and resourceful, despite their small size.',
    abilityScoreIncrease: [
      { ability: 'DEX', bonus: 2 },
      { ability: 'STR', bonus: -2 }
    ],
    size: 'Small',
    speed: 30,
    languages: ['Common', 'Draconic'],
    traits: [
      {
        name: 'Darkvision',
        description: 'You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light.'
      },
      {
        name: 'Grovel, Cower, and Beg',
        description: 'As an action on your turn, you can cower pathetically to distract nearby foes. Until the end of your next turn, your allies gain advantage on attack rolls against enemies within 10 feet of you that can see you. Once you use this trait, you can\'t use it again until you finish a short or long rest.'
      },
      {
        name: 'Pack Tactics',
        description: 'You have advantage on an attack roll against a creature if at least one of your allies is within 5 feet of the creature and the ally isn\'t incapacitated.'
      },
      {
        name: 'Sunlight Sensitivity',
        description: 'You have disadvantage on attack rolls and on Wisdom (Perception) checks that rely on sight when you, the target of your attack, or whatever you are trying to perceive is in direct sunlight.'
      }
    ]
  },

  aasimar: {
    id: 'aasimar',
    name: 'Aasimar',
    description: 'Aasimar are mortals touched by the divine and bear within them a shard of the power of Mount Celestia, the divine realm of many lawful good deities.',
    abilityScoreIncrease: [
      { ability: 'CHA', bonus: 2 }
    ],
    size: 'Medium',
    speed: 30,
    languages: ['Common', 'Celestial'],
    traits: [
      {
        name: 'Darkvision',
        description: 'You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light.'
      },
      {
        name: 'Celestial Resistance',
        description: 'You have resistance to necrotic damage and radiant damage.'
      },
      {
        name: 'Healing Hands',
        description: 'As an action, you can touch a creature and cause it to regain a number of hit points equal to your level. Once you use this trait, you can\'t use it again until you finish a long rest.'
      },
      {
        name: 'Light Bearer',
        description: 'You know the light cantrip. Charisma is your spellcasting ability for it.'
      }
    ],
    subraces: [
      {
        id: 'protector_aasimar',
        name: 'Protector Aasimar',
        description: 'Protector aasimar are charged by the powers of good to guard the weak, to strike at evil wherever it arises, and to stand vigilant against the darkness.',
        abilityScoreIncrease: [
          { ability: 'WIS', bonus: 1 }
        ],
        traits: [
          {
            name: 'Radiant Soul',
            description: 'Starting at 3rd level, you can use your action to unleash the divine energy within yourself, causing your eyes to glimmer and two luminous, incorporeal wings to sprout from your back. Your transformation lasts for 1 minute or until you end it as a bonus action. During it, you have a flying speed of 30 feet, and once on each of your turns, you can deal extra radiant damage to one target when you deal damage to it with an attack or a spell. The extra damage equals your level. Once you use this trait, you can\'t use it again until you finish a long rest.'
          }
        ]
      },
      {
        id: 'scourge_aasimar',
        name: 'Scourge Aasimar',
        description: 'Scourge aasimar are imbued with a divine energy that blazes intensely within them. It feeds a powerful desire to destroy evil—a desire that is, at its best, unflinching and, at its worst, all-consuming.',
        abilityScoreIncrease: [
          { ability: 'CON', bonus: 1 }
        ],
        traits: [
          {
            name: 'Radiant Consumption',
            description: 'Starting at 3rd level, you can use your action to unleash the divine energy within yourself, causing a searing light to radiate from you, pour out of your eyes and mouth, and threaten to char you. Your transformation lasts for 1 minute or until you end it as a bonus action. During it, you shed bright light in a 10-foot radius and dim light for an additional 10 feet, and at the end of each of your turns, you and each creature within 10 feet of you take radiant damage equal to half your level (rounded up). In addition, once on each of your turns, you can deal extra radiant damage to one target when you deal damage to it with an attack or a spell. The extra damage equals your level. Once you use this trait, you can\'t use it again until you finish a long rest.'
          }
        ]
      },
      {
        id: 'fallen_aasimar',
        name: 'Fallen Aasimar',
        description: 'An aasimar who was touched by dark powers as a youth or who turns to evil in early adulthood can become one of the fallen—a group of aasimar whose inner light has been replaced by shadow.',
        abilityScoreIncrease: [
          { ability: 'STR', bonus: 1 }
        ],
        traits: [
          {
            name: 'Necrotic Shroud',
            description: 'Starting at 3rd level, you can use your action to unleash the divine energy within yourself, causing your eyes to turn into pools of darkness and two skeletal, ghostly, flightless wings to sprout from your back. The instant you transform, other creatures within 10 feet of you that can see you must each make a Charisma saving throw (DC 8 + your proficiency bonus + your Charisma modifier). A creature that fails the save becomes frightened of you until the end of your next turn. Your transformation lasts for 1 minute or until you end it as a bonus action. During it, once on each of your turns, you can deal extra necrotic damage to one target when you deal damage to it with an attack or a spell. The extra damage equals your level. Once you use this trait, you can\'t use it again until you finish a long rest.'
          }
        ]
      }
    ]
  },

  goliath: {
    id: 'goliath',
    name: 'Goliath',
    description: 'Goliaths are massive. Their bodies look as if they are carved from mountain stone and give them great physical power. Their spirits take after the wandering wind, making them nomads who wander from peak to peak.',
    abilityScoreIncrease: [
      { ability: 'STR', bonus: 2 },
      { ability: 'CON', bonus: 1 }
    ],
    size: 'Medium',
    speed: 30,
    languages: ['Common', 'Giant'],
    proficiencies: {
      skills: ['Athletics']
    },
    traits: [
      {
        name: 'Natural Athlete',
        description: 'You have proficiency in the Athletics skill.'
      },
      {
        name: 'Stone\'s Endurance',
        description: 'You can focus yourself to occasionally shrug off injury. When you take damage, you can use your reaction to roll a d12. Add your Constitution modifier to the number rolled, and reduce the damage by that total. After you use this trait, you can\'t use it again until you finish a short or long rest.'
      },
      {
        name: 'Powerful Build',
        description: 'You count as one size larger when determining your carrying capacity and the weight you can push, drag, or lift.'
      },
      {
        name: 'Mountain Born',
        description: 'You have resistance to cold damage. You\'re also naturally adapted to high altitudes, including elevations above 20,000 feet.'
      }
    ]
  }
}

// Helper function to get all races
export function getAllRaces(): Race[] {
  return Object.values(races)
}

// Helper function to get a specific race
export function getRace(raceId: string): Race | undefined {
  return races[raceId]
}

// Helper function to get all subraces for a race
export function getSubraces(raceId: string): Subrace[] {
  const race = races[raceId]
  return race?.subraces || []
}