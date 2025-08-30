export interface Subclass {
  id: string
  name: string
  description: string
  className: string
  features: {
    level: number
    name: string
    description: string
    rulesKey?: string
  }[]
}

export const subclasses: Record<string, Subclass> = {
  // Fighter Subclasses
  champion: {
    id: 'champion',
    name: 'Champion',
    description: 'The archetypal Champion focuses on the development of raw physical power honed to deadly perfection.',
    className: 'fighter',
    features: [
      {
        level: 3,
        name: 'Improved Critical',
        description: 'Your weapon attacks score a critical hit on a roll of 19 or 20.'
      },
      {
        level: 7,
        name: 'Remarkable Athlete',
        description: 'You can add half your proficiency bonus (rounded up) to any Strength, Dexterity, or Constitution check you make that doesn\'t already use your proficiency bonus.'
      },
      {
        level: 10,
        name: 'Additional Fighting Style',
        description: 'You can choose a second option from the Fighting Style class feature.',
        rulesKey: 'fightingStyle'
      },
      {
        level: 15,
        name: 'Superior Critical',
        description: 'Your weapon attacks score a critical hit on a roll of 18–20.'
      },
      {
        level: 18,
        name: 'Survivor',
        description: 'You regain hit points equal to 5 + your Constitution modifier if you have no more than half of your hit points left.'
      }
    ]
  },
  battle_master: {
    id: 'battle_master',
    name: 'Battle Master',
    description: 'Those who emulate the archetypal Battle Master employ martial techniques passed down through generations.',
    className: 'fighter',
    features: [
      {
        level: 3,
        name: 'Combat Superiority',
        description: 'You learn maneuvers that are fueled by special dice called superiority dice. You learn 3 maneuvers and have 4 superiority dice (d8).'
      },
      {
        level: 3,
        name: 'Student of War',
        description: 'You gain proficiency with one type of artisan\'s tools of your choice.'
      },
      {
        level: 7,
        name: 'Know Your Enemy',
        description: 'If you spend at least 1 minute observing or interacting with another creature, you can learn certain information about its capabilities.'
      },
      {
        level: 10,
        name: 'Improved Combat Superiority',
        description: 'Your superiority dice turn into d10s. At 18th level, they turn into d12s.'
      },
      {
        level: 15,
        name: 'Relentless',
        description: 'When you roll initiative and have no superiority dice remaining, you regain 1 superiority die.'
      }
    ]
  },
  eldritch_knight: {
    id: 'eldritch_knight',
    name: 'Eldritch Knight',
    description: 'The archetypal Eldritch Knight combines the martial mastery common to all fighters with a careful study of magic.',
    className: 'fighter',
    features: [
      {
        level: 3,
        name: 'Spellcasting',
        description: 'You augment your martial prowess with the ability to cast spells. You learn wizard spells.'
      },
      {
        level: 3,
        name: 'Weapon Bond',
        description: 'You learn a ritual that creates a magical bond between yourself and one weapon.'
      },
      {
        level: 7,
        name: 'War Magic',
        description: 'When you use your action to cast a cantrip, you can make one weapon attack as a bonus action.'
      },
      {
        level: 10,
        name: 'Eldritch Strike',
        description: 'When you hit a creature with your weapon attack, that creature has disadvantage on the next saving throw it makes against a spell you cast before the end of your next turn.'
      },
      {
        level: 15,
        name: 'Arcane Charge',
        description: 'You gain the ability to teleport up to 30 feet to an unoccupied space you can see when you use your Action Surge.'
      },
      {
        level: 18,
        name: 'Improved War Magic',
        description: 'When you use your action to cast a spell, you can make one weapon attack as a bonus action.'
      }
    ]
  },

  // Rogue Subclasses
  thief: {
    id: 'thief',
    name: 'Thief',
    description: 'You hone your skills in the larcenous arts. Burglars, bandits, cutpurses, and other criminals typically follow this archetype.',
    className: 'rogue',
    features: [
      {
        level: 3,
        name: 'Fast Hands',
        description: 'You can use the bonus action granted by your Cunning Action to make a Dexterity (Sleight of Hand) check, use thieves\' tools to disarm a trap or open a lock, or take the Use an Object action.'
      },
      {
        level: 3,
        name: 'Second-Story Work',
        description: 'Climbing no longer costs you extra movement. When you make a running jump, the distance you cover increases by a number of feet equal to your Dexterity modifier.'
      },
      {
        level: 9,
        name: 'Supreme Sneak',
        description: 'You have advantage on a Dexterity (Stealth) check if you move no more than half your speed on the same turn.'
      },
      {
        level: 13,
        name: 'Use Magic Device',
        description: 'You ignore all class, race, and level requirements on the use of magic items.'
      },
      {
        level: 17,
        name: 'Thief\'s Reflexes',
        description: 'You can take two turns during the first round of any combat.'
      }
    ]
  },
  assassin: {
    id: 'assassin',
    name: 'Assassin',
    description: 'You focus your training on the grim art of death. Those who adhere to this archetype are diverse.',
    className: 'rogue',
    features: [
      {
        level: 3,
        name: 'Bonus Proficiencies',
        description: 'You gain proficiency with the disguise kit and the poisoner\'s kit.'
      },
      {
        level: 3,
        name: 'Assassinate',
        description: 'You have advantage on attack rolls against any creature that hasn\'t taken a turn in the combat yet. Any hit you score against a creature that is surprised is a critical hit.'
      },
      {
        level: 9,
        name: 'Infiltration Expertise',
        description: 'You can unfailingly create false identities for yourself.'
      },
      {
        level: 13,
        name: 'Impostor',
        description: 'You gain the ability to unerringly mimic another person\'s speech, writing, and behavior.'
      },
      {
        level: 17,
        name: 'Death Strike',
        description: 'When you attack and hit a creature that is surprised, it must make a Constitution saving throw (DC 8 + your Dexterity modifier + your proficiency bonus). On a failed save, double the damage of your attack against the creature.'
      }
    ]
  },
  arcane_trickster: {
    id: 'arcane_trickster',
    name: 'Arcane Trickster',
    description: 'Some rogues enhance their fine-honed skills of stealth and agility with magic, learning tricks of enchantment and illusion.',
    className: 'rogue',
    features: [
      {
        level: 3,
        name: 'Spellcasting',
        description: 'You augment your martial prowess with the ability to cast spells. You learn wizard spells from the enchantment and illusion schools.'
      },
      {
        level: 3,
        name: 'Mage Hand Legerdemain',
        description: 'When you cast mage hand, you can make the spectral hand invisible, and you can perform additional tasks with it.'
      },
      {
        level: 9,
        name: 'Magical Ambush',
        description: 'If you are hidden from a creature when you cast a spell on it, the creature has disadvantage on any saving throw it makes against the spell this turn.'
      },
      {
        level: 13,
        name: 'Versatile Trickster',
        description: 'You gain the ability to distract targets with your mage hand. As a bonus action on your turn, you can designate a creature within 5 feet of the spectral hand created by the spell.'
      },
      {
        level: 17,
        name: 'Spell Thief',
        description: 'You gain the ability to magically steal the knowledge of how to cast a spell from another spellcaster.'
      }
    ]
  },

  // Wizard Subclasses
  evocation: {
    id: 'evocation',
    name: 'School of Evocation',
    description: 'You focus your study on magic that creates powerful elemental effects such as bitter cold, searing flame, rolling thunder, crackling lightning, and burning acid.',
    className: 'wizard',
    features: [
      {
        level: 2,
        name: 'Evocation Savant',
        description: 'The gold and time you must spend to copy an evocation spell into your spellbook is halved.'
      },
      {
        level: 2,
        name: 'Sculpt Spells',
        description: 'When you cast an evocation spell that affects other creatures that you can see, you can choose a number of them equal to 1 + the spell\'s level. The chosen creatures automatically succeed on their saving throws against the spell.'
      },
      {
        level: 6,
        name: 'Potent Cantrip',
        description: 'When a creature succeeds on a saving throw against your cantrip, the creature takes half the cantrip\'s damage (if any) but suffers no additional effect from the cantrip.'
      },
      {
        level: 10,
        name: 'Empowered Evocation',
        description: 'You can add your Intelligence modifier to one damage roll of any wizard evocation spell you cast.'
      },
      {
        level: 14,
        name: 'Overchannel',
        description: 'When you cast a wizard spell of 1st through 5th level that deals damage, you can deal maximum damage with that spell.'
      }
    ]
  },
  abjuration: {
    id: 'abjuration',
    name: 'School of Abjuration',
    description: 'The School of Abjuration emphasizes magic that blocks, banishes, or protects.',
    className: 'wizard',
    features: [
      {
        level: 2,
        name: 'Abjuration Savant',
        description: 'The gold and time you must spend to copy an abjuration spell into your spellbook is halved.'
      },
      {
        level: 2,
        name: 'Arcane Ward',
        description: 'When you cast an abjuration spell of 1st level or higher, you can simultaneously use a strand of the spell\'s magic to create a magical ward on yourself.'
      },
      {
        level: 6,
        name: 'Projected Ward',
        description: 'When a creature that you can see within 30 feet of you takes damage, you can use your reaction to cause your Arcane Ward to absorb that damage.'
      },
      {
        level: 10,
        name: 'Improved Abjuration',
        description: 'When you cast an abjuration spell that requires you to make an ability check as a part of casting that spell, you add your proficiency bonus to that ability check.'
      },
      {
        level: 14,
        name: 'Spell Resistance',
        description: 'You have advantage on saving throws against spells. Furthermore, you have resistance against the damage of spells.'
      }
    ]
  },

  // Cleric Domains
  life: {
    id: 'life',
    name: 'Life Domain',
    description: 'The Life domain focuses on the vibrant positive energy that sustains all life.',
    className: 'cleric',
    features: [
      {
        level: 1,
        name: 'Domain Spells',
        description: 'You gain domain spells at the cleric levels listed: bless, cure wounds (1st); lesser restoration, spiritual weapon (3rd); beacon of hope, revivify (5th); death ward, guardian of faith (7th); mass cure wounds, raise dead (9th).'
      },
      {
        level: 1,
        name: 'Bonus Proficiency',
        description: 'You gain proficiency with heavy armor.'
      },
      {
        level: 1,
        name: 'Disciple of Life',
        description: 'Your healing spells are more effective. Whenever you use a spell of 1st level or higher to restore hit points to a creature, the creature regains additional hit points equal to 2 + the spell\'s level.'
      },
      {
        level: 2,
        name: 'Channel Divinity: Preserve Life',
        description: 'You can use your Channel Divinity to heal the badly injured. You evenly divide hit points among any creatures within 30 feet of you.'
      },
      {
        level: 6,
        name: 'Blessed Healer',
        description: 'The healing spells you cast on others heal you as well. When you cast a spell of 1st level or higher that restores hit points to a creature other than you, you regain hit points equal to 2 + the spell\'s level.'
      },
      {
        level: 8,
        name: 'Divine Strike',
        description: 'You gain the ability to infuse your weapon strikes with divine energy. Once on each of your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 radiant damage.'
      },
      {
        level: 17,
        name: 'Supreme Healing',
        description: 'When you would normally roll one or more dice to restore hit points with a spell, you instead use the highest number possible for each die.'
      }
    ]
  },
  war: {
    id: 'war',
    name: 'War Domain',
    description: 'War has many manifestations. It can make heroes of ordinary people. It can be desperate and horrific, with acts of cruelty and cowardice eclipsing instances of excellence and courage.',
    className: 'cleric',
    features: [
      {
        level: 1,
        name: 'Domain Spells',
        description: 'You gain domain spells at the cleric levels listed: divine favor, shield of faith (1st); magic weapon, spiritual weapon (3rd); crusader\'s mantle, spirit guardians (5th); freedom of movement, stoneskin (7th); flame strike, hold monster (9th).'
      },
      {
        level: 1,
        name: 'Bonus Proficiencies',
        description: 'You gain proficiency with martial weapons and heavy armor.'
      },
      {
        level: 1,
        name: 'War Priest',
        description: 'When you use the Attack action, you can make one weapon attack as a bonus action. You can use this feature a number of times equal to your Wisdom modifier (minimum of once).'
      },
      {
        level: 2,
        name: 'Channel Divinity: Guided Strike',
        description: 'You can use your Channel Divinity to strike with supernatural accuracy. When you make an attack roll, you can use your Channel Divinity to gain a +10 bonus to the roll.'
      },
      {
        level: 6,
        name: 'Channel Divinity: War God\'s Blessing',
        description: 'When a creature within 30 feet of you makes an attack roll, you can use your reaction to grant that creature a +10 bonus to the roll, using your Channel Divinity.'
      },
      {
        level: 8,
        name: 'Divine Strike',
        description: 'You gain the ability to infuse your weapon strikes with divine energy. Once on each of your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 damage of the same type dealt by the weapon.'
      },
      {
        level: 17,
        name: 'Avatar of Battle',
        description: 'You gain resistance to bludgeoning, piercing, and slashing damage from nonmagical attacks.'
      }
    ]
  },

  // Barbarian Paths
  berserker: {
    id: 'berserker',
    name: 'Path of the Berserker',
    description: 'For some barbarians, rage is a means to an end—that end being violence.',
    className: 'barbarian',
    features: [
      {
        level: 3,
        name: 'Frenzy',
        description: 'When you choose to rage, you can go into a frenzy. If you do so, for the duration of your rage you can make a single melee weapon attack as a bonus action on each of your turns after this one.'
      },
      {
        level: 6,
        name: 'Mindless Rage',
        description: 'You can\'t be charmed or frightened while raging. If you are charmed or frightened when you enter your rage, the effect is suspended for the duration of the rage.'
      },
      {
        level: 10,
        name: 'Intimidating Presence',
        description: 'You can use your action to frighten someone with your menacing presence. When you do so, choose one creature that you can see within 30 feet of you.'
      },
      {
        level: 14,
        name: 'Retaliation',
        description: 'When you take damage from a creature that is within 5 feet of you, you can use your reaction to make a melee weapon attack against that creature.'
      }
    ]
  },

  // Bard Colleges
  lore: {
    id: 'lore',
    name: 'College of Lore',
    description: 'Bards of the College of Lore know something about most things, collecting bits of knowledge from sources as diverse as scholarly tomes and peasant tales.',
    className: 'bard',
    features: [
      {
        level: 3,
        name: 'Bonus Proficiencies',
        description: 'You gain proficiency with three skills of your choice.'
      },
      {
        level: 3,
        name: 'Cutting Words',
        description: 'You can use your reaction to expend one use of Bardic Inspiration to reduce a creature\'s attack roll, ability check, or damage roll by the number rolled on the Bardic Inspiration die.'
      },
      {
        level: 6,
        name: 'Additional Magical Secrets',
        description: 'You learn two spells of your choice from any class. The spells you choose must be of a level you can cast.'
      },
      {
        level: 14,
        name: 'Peerless Skill',
        description: 'When you make an ability check, you can expend one use of Bardic Inspiration. Roll a Bardic Inspiration die and add the number rolled to your ability check.'
      }
    ]
  },

  // Paladin Oaths
  devotion: {
    id: 'devotion',
    name: 'Oath of Devotion',
    description: 'The Oath of Devotion binds a paladin to the loftiest ideals of justice, virtue, and order.',
    className: 'paladin',
    features: [
      {
        level: 3,
        name: 'Oath Spells',
        description: 'You gain oath spells at the paladin levels listed: protection from evil and good, sanctuary (3rd); lesser restoration, zone of truth (5th); beacon of hope, dispel magic (9th); freedom of movement, guardian of faith (13th); commune, flame strike (17th).'
      },
      {
        level: 3,
        name: 'Channel Divinity: Sacred Weapon',
        description: 'You can use your Channel Divinity to imbue one weapon that you are holding with positive energy.'
      },
      {
        level: 3,
        name: 'Channel Divinity: Turn the Unholy',
        description: 'You can use your Channel Divinity to utter ancient words that are painful for fey and fiends to hear.'
      },
      {
        level: 7,
        name: 'Aura of Devotion',
        description: 'You and friendly creatures within 10 feet of you can\'t be charmed while you are conscious.'
      },
      {
        level: 15,
        name: 'Purity of Spirit',
        description: 'You are always under the effects of a protection from evil and good spell.'
      },
      {
        level: 20,
        name: 'Holy Nimbus',
        description: 'You can use your action to emanate an aura of sunlight. For 1 minute, bright light shines from you in a 30-foot radius.'
      }
    ]
  },

  // Ranger Archetypes
  hunter: {
    id: 'hunter',
    name: 'Hunter',
    description: 'Emulating the Hunter archetype means accepting your place as a bulwark between civilization and the terrors of the wilderness.',
    className: 'ranger',
    features: [
      {
        level: 3,
        name: 'Hunter\'s Prey',
        description: 'Choose one of the following features: Colossus Slayer, Giant Killer, or Horde Breaker.'
      },
      {
        level: 7,
        name: 'Defensive Tactics',
        description: 'Choose one of the following features: Escape the Horde, Multiattack Defense, or Steel Will.'
      },
      {
        level: 11,
        name: 'Multiattack',
        description: 'Choose one of the following features: Volley or Whirlwind Attack.'
      },
      {
        level: 15,
        name: 'Superior Hunter\'s Defense',
        description: 'Choose one of the following features: Evasion, Stand Against the Tide, or Uncanny Dodge.'
      }
    ]
  },

  // Sorcerer Origins
  draconic_bloodline: {
    id: 'draconic_bloodline',
    name: 'Draconic Bloodline',
    description: 'Your innate magic comes from draconic magic that was mingled with your blood or that of your ancestors.',
    className: 'sorcerer',
    features: [
      {
        level: 1,
        name: 'Dragon Ancestor',
        description: 'Choose one type of dragon as your ancestor. The damage type associated with each dragon is used by features you gain later.'
      },
      {
        level: 1,
        name: 'Draconic Resilience',
        description: 'As magic flows through your body, it causes physical traits of your dragon ancestor to emerge. Your hit point maximum increases by 1 and increases by 1 again whenever you gain a level in this class.'
      },
      {
        level: 6,
        name: 'Elemental Affinity',
        description: 'When you cast a spell that deals damage of the type associated with your draconic ancestry, you can add your Charisma modifier to one damage roll of that spell.'
      },
      {
        level: 14,
        name: 'Dragon Wings',
        description: 'You gain the ability to sprout a pair of dragon wings from your back, gaining a flying speed equal to your current speed.'
      },
      {
        level: 18,
        name: 'Draconic Presence',
        description: 'You can channel the dread presence of your dragon ancestor, causing those around you to become awestruck or frightened.'
      }
    ]
  },

  // Warlock Patrons
  fiend: {
    id: 'fiend',
    name: 'The Fiend',
    description: 'You have made a pact with a fiend from the lower planes of existence, a being whose aims are evil.',
    className: 'warlock',
    features: [
      {
        level: 1,
        name: 'Expanded Spell List',
        description: 'The Fiend lets you choose from an expanded list of spells when you learn a warlock spell.'
      },
      {
        level: 1,
        name: 'Dark One\'s Blessing',
        description: 'When you reduce a hostile creature to 0 hit points, you gain temporary hit points equal to your Charisma modifier + your warlock level (minimum of 1).'
      },
      {
        level: 6,
        name: 'Dark One\'s Own Luck',
        description: 'You can call on your patron to alter fate in your favor. When you make an ability check or a saving throw, you can use this feature to add a d10 to your roll.'
      },
      {
        level: 10,
        name: 'Fiendish Resilience',
        description: 'You can choose one damage type when you finish a short or long rest. You gain resistance to that damage type until you choose a different one with this feature.'
      },
      {
        level: 14,
        name: 'Hurl Through Hell',
        description: 'When you hit a creature with an attack, you can use this feature to instantly transport the target through the lower planes.'
      }
    ]
  },

  // Monk Traditions
  open_hand: {
    id: 'open_hand',
    name: 'Way of the Open Hand',
    description: 'Monks of the Way of the Open Hand are the ultimate masters of martial arts combat, whether armed or unarmed.',
    className: 'monk',
    features: [
      {
        level: 3,
        name: 'Open Hand Technique',
        description: 'You can manipulate your enemy\'s ki when you harness your own. Whenever you hit a creature with one of the attacks granted by your Flurry of Blows, you can impose one of the following effects on that target.'
      },
      {
        level: 6,
        name: 'Wholeness of Body',
        description: 'You gain the ability to heal yourself. As an action, you can regain hit points equal to three times your monk level.'
      },
      {
        level: 11,
        name: 'Tranquility',
        description: 'At the end of a long rest, you gain the effect of a sanctuary spell that lasts until the start of your next long rest.'
      },
      {
        level: 17,
        name: 'Quivering Palm',
        description: 'You gain the ability to set up lethal vibrations in someone\'s body. When you hit a creature with an unarmed strike, you can spend 3 ki points to start these imperceptible vibrations.'
      }
    ]
  },

  // Druid Circles
  land: {
    id: 'land',
    name: 'Circle of the Land',
    description: 'The Circle of the Land is made up of mystics and sages who safeguard ancient knowledge and rites through a vast oral tradition.',
    className: 'druid',
    features: [
      {
        level: 2,
        name: 'Bonus Cantrip',
        description: 'You learn one additional druid cantrip of your choice.'
      },
      {
        level: 2,
        name: 'Natural Recovery',
        description: 'You can recover some of your magical energy by sitting in meditation and communing with nature.'
      },
      {
        level: 3,
        name: 'Circle Spells',
        description: 'Your mystical connection to the land infuses you with the ability to cast certain spells. Choose a land type and gain its associated spells.'
      },
      {
        level: 6,
        name: 'Land\'s Stride',
        description: 'Moving through nonmagical difficult terrain costs you no extra movement. You can also pass through nonmagical plants without being slowed by them.'
      },
      {
        level: 10,
        name: 'Nature\'s Ward',
        description: 'You can\'t be charmed or frightened by elementals or fey, and you are immune to poison and disease.'
      },
      {
        level: 14,
        name: 'Nature\'s Sanctuary',
        description: 'Creatures of the natural world sense your connection to nature and become hesitant to attack you.'
      }
    ]
  }
}

// Helper function to get subclasses for a specific class
export function getSubclassesForClass(className: string): Subclass[] {
  return Object.values(subclasses).filter(subclass => subclass.className === className)
}

// Helper function to get a specific subclass
export function getSubclass(subclassId: string): Subclass | undefined {
  return subclasses[subclassId]
}