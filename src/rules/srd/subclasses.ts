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
        description: 'Your weapon attacks score a critical hit on a roll of 19 or 20.',
        rulesKey: 'improved_critical'
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
        description: 'Your weapon attacks score a critical hit on a roll of 18–20.',
        rulesKey: 'superior_critical'
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
        description: 'You learn maneuvers that are fueled by special dice called superiority dice. You learn 3 maneuvers and have 4 superiority dice (d8).',
        rulesKey: 'combat_superiority'
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
        description: 'Your superiority dice turn into d10s. At 18th level, they turn into d12s.',
        rulesKey: 'improved_combat_superiority'
      },
      {
        level: 15,
        name: 'Relentless',
        description: 'When you roll initiative and have no superiority dice remaining, you regain 1 superiority die.',
        rulesKey: 'relentless'
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
        description: 'When you use your action to cast a cantrip, you can make one weapon attack as a bonus action.',
        rulesKey: 'war_magic'
      },
      {
        level: 10,
        name: 'Eldritch Strike',
        description: 'When you hit a creature with your weapon attack, that creature has disadvantage on the next saving throw it makes against a spell you cast before the end of your next turn.',
        rulesKey: 'eldritch_strike'
      },
      {
        level: 15,
        name: 'Arcane Charge',
        description: 'You gain the ability to teleport up to 30 feet to an unoccupied space you can see when you use your Action Surge.'
      },
      {
        level: 18,
        name: 'Improved War Magic',
        description: 'When you use your action to cast a spell, you can make one weapon attack as a bonus action.',
        rulesKey: 'improved_war_magic'
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
        description: 'You can take two turns during the first round of any combat.',
        rulesKey: 'thiefs_reflexes'
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
        description: 'You have advantage on attack rolls against any creature that hasn\'t taken a turn in the combat yet. Any hit you score against a creature that is surprised is a critical hit.',
        rulesKey: 'assassinate'
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
        description: 'When you attack and hit a creature that is surprised, it must make a Constitution saving throw (DC 8 + your Dexterity modifier + your proficiency bonus). On a failed save, double the damage of your attack against the creature.',
        rulesKey: 'death_strike'
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
        description: 'If you are hidden from a creature when you cast a spell on it, the creature has disadvantage on any saving throw it makes against the spell this turn.',
        rulesKey: 'magical_ambush'
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
        description: 'When a creature succeeds on a saving throw against your cantrip, the creature takes half the cantrip\'s damage (if any) but suffers no additional effect from the cantrip.',
        rulesKey: 'potent_cantrip'
      },
      {
        level: 10,
        name: 'Empowered Evocation',
        description: 'You can add your Intelligence modifier to one damage roll of any wizard evocation spell you cast.',
        rulesKey: 'empowered_evocation'
      },
      {
        level: 14,
        name: 'Overchannel',
        description: 'When you cast a wizard spell of 1st through 5th level that deals damage, you can deal maximum damage with that spell.',
        rulesKey: 'overchannel'
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
  divination: {
    id: 'divination',
    name: 'School of Divination',
    description: 'The counsel of a diviner is sought by royalty and commoners alike, for all seek a clearer understanding of the past, present, and future.',
    className: 'wizard',
    features: [
      {
        level: 2,
        name: 'Divination Savant',
        description: 'The gold and time you must spend to copy a divination spell into your spellbook is halved.'
      },
      {
        level: 2,
        name: 'Portent',
        description: 'You can replace any attack roll, saving throw, or ability check made by you or a creature that you can see with one of your portent rolls.',
        rulesKey: 'portent'
      },
      {
        level: 6,
        name: 'Expert Divination',
        description: 'When you cast a divination spell of 2nd level or higher using a spell slot, you regain one expended spell slot.'
      },
      {
        level: 10,
        name: 'The Third Eye',
        description: 'You can use your action to increase your powers of perception. Choose one of the following benefits: Darkvision, Ethereal Sight, Greater Comprehension, or See Invisibility.'
      },
      {
        level: 14,
        name: 'Greater Portent',
        description: 'The visions in your dreams intensify and paint a more accurate picture of what is to come. You roll three d20s for your Portent feature, rather than two.'
      }
    ]
  },
  enchantment: {
    id: 'enchantment',
    name: 'School of Enchantment',
    description: 'You focus your study on magic that dazzles the mind, influences the behavior of others, and can even make enemies into friends.',
    className: 'wizard',
    features: [
      {
        level: 2,
        name: 'Enchantment Savant',
        description: 'The gold and time you must spend to copy an enchantment spell into your spellbook is halved.'
      },
      {
        level: 2,
        name: 'Hypnotic Gaze',
        description: 'You can use your action to choose one humanoid within 5 feet of you. The target must succeed on a Wisdom saving throw or be charmed by you until the end of your next turn.',
        rulesKey: 'hypnotic_gaze'
      },
      {
        level: 6,
        name: 'Split Enchantment',
        description: 'When you cast an enchantment spell of 1st level or higher that targets only one creature, you can have it target a second creature.'
      },
      {
        level: 10,
        name: 'Potent Cantrip',
        description: 'Your damaging cantrips affect even creatures that avoid the brunt of the effect.'
      },
      {
        level: 14,
        name: 'Alter Memories',
        description: 'When you cast an enchantment spell to charm one or more creatures, you can alter one creature\'s understanding so that it remains unaware of being charmed.'
      }
    ]
  },
  illusion: {
    id: 'illusion',
    name: 'School of Illusion',
    description: 'You focus your studies on magic that dazzles the senses, befuddles the mind, and tricks even the wisest folk.',
    className: 'wizard',
    features: [
      {
        level: 2,
        name: 'Illusion Savant',
        description: 'The gold and time you must spend to copy an illusion spell into your spellbook is halved.'
      },
      {
        level: 2,
        name: 'Improved Minor Illusion',
        description: 'You learn the minor illusion cantrip. When you cast it, you can create both a sound and an image with a single casting of the spell.'
      },
      {
        level: 6,
        name: 'Malleable Illusions',
        description: 'When you cast an illusion spell that has a duration of 1 minute or longer, you can use your action to change the nature of that illusion.'
      },
      {
        level: 10,
        name: 'Potent Cantrip',
        description: 'Your damaging cantrips affect even creatures that avoid the brunt of the effect.'
      },
      {
        level: 14,
        name: 'Illusory Reality',
        description: 'You can choose one inanimate, nonmagical object that is part of an illusion spell of 1st level or higher and make that object real.'
      }
    ]
  },
  necromancy: {
    id: 'necromancy',
    name: 'School of Necromancy',
    description: 'You focus your study on magic that creates undead, manipulates the energy of death, or drains the life force from living creatures.',
    className: 'wizard',
    features: [
      {
        level: 2,
        name: 'Necromancy Savant',
        description: 'The gold and time you must spend to copy a necromancy spell into your spellbook is halved.'
      },
      {
        level: 2,
        name: 'Grim Harvest',
        description: 'You gain the ability to reap life energy from creatures you kill with your spells. Once per turn when you kill one or more creatures with a spell of 1st level or higher, you regain hit points equal to twice the spell\'s level.',
        rulesKey: 'grim_harvest'
      },
      {
        level: 6,
        name: 'Undead Thralls',
        description: 'You add the animate dead spell to your spellbook if it is not there already. When you cast animate dead, you can target one additional corpse or pile of bones.'
      },
      {
        level: 10,
        name: 'Potent Cantrip',
        description: 'Your damaging cantrips affect even creatures that avoid the brunt of the effect.'
      },
      {
        level: 14,
        name: 'Command Undead',
        description: 'You can use magic to bring undead under your control, even those created by other wizards.'
      }
    ]
  },
  conjuration: {
    id: 'conjuration',
    name: 'School of Conjuration',
    description: 'You focus your study on magic that produces objects and creatures out of seemingly nothing.',
    className: 'wizard',
    features: [
      {
        level: 2,
        name: 'Conjuration Savant',
        description: 'The gold and time you must spend to copy a conjuration spell into your spellbook is halved.'
      },
      {
        level: 2,
        name: 'Minor Conjuration',
        description: 'You can use your action to conjure up an inanimate object in your hand or on the ground in an unoccupied space within 10 feet of you.'
      },
      {
        level: 6,
        name: 'Benign Transposition',
        description: 'You can use your action to teleport up to 30 feet to an unoccupied space that you can see. Alternatively, you can choose a space within range that is occupied by a Small or Medium creature.'
      },
      {
        level: 10,
        name: 'Focused Conjuration',
        description: 'While you are concentrating on a conjuration spell, your concentration can\'t be broken as a result of taking damage.'
      },
      {
        level: 14,
        name: 'Durable Summons',
        description: 'Any creature that you summon or create with a conjuration spell has 30 temporary hit points.'
      }
    ]
  },
  transmutation: {
    id: 'transmutation',
    name: 'School of Transmutation',
    description: 'You are a student of spells that modify energy and matter, learning to alter the fundamental properties of objects and creatures.',
    className: 'wizard',
    features: [
      {
        level: 2,
        name: 'Transmutation Savant',
        description: 'The gold and time you must spend to copy a transmutation spell into your spellbook is halved.'
      },
      {
        level: 2,
        name: 'Minor Alchemy',
        description: 'You can temporarily alter the physical properties of one nonmagical object, changing it from one substance into another.'
      },
      {
        level: 6,
        name: 'Transmuter\'s Stone',
        description: 'You can spend 8 hours creating a transmuter\'s stone that stores transmutation magic.'
      },
      {
        level: 10,
        name: 'Shapechanger',
        description: 'You add the polymorph spell to your spellbook, if it is not there already. You can cast polymorph without expending a spell slot.'
      },
      {
        level: 14,
        name: 'Master Transmuter',
        description: 'You can use your action to consume the reserve of transmutation magic stored within your transmuter\'s stone in a single burst.'
      }
    ]
  },

  // Artificer Specialists
  alchemist: {
    id: 'alchemist',
    name: 'Alchemist',
    description: 'An Alchemist is an expert at combining reagents to produce mystical effects. They use their creations to give life and to deal death.',
    className: 'artificer',
    features: [
      {
        level: 3,
        name: 'Tool Proficiency',
        description: 'You gain proficiency with alchemist\'s supplies. If you already have this proficiency, you gain proficiency with one other type of artisan\'s tools.'
      },
      {
        level: 3,
        name: 'Alchemist Spells',
        description: 'You always have certain spells prepared: healing word, ray of sickness (3rd); flaming sphere, Melf\'s acid arrow (5th); gaseous form, mass healing word (9th); blight, death ward (13th); cloudkill, raise dead (17th).'
      },
      {
        level: 3,
        name: 'Experimental Elixir',
        description: 'You can produce an experimental elixir in an empty flask. Roll on the Experimental Elixir table or choose an effect.'
      },
      {
        level: 5,
        name: 'Alchemical Savant',
        description: 'You develop a deeper understanding of alchemical processes. You can add your Intelligence modifier to damage or healing rolls from spells you cast using alchemist\'s supplies.'
      },
      {
        level: 9,
        name: 'Restorative Reagents',
        description: 'You can incorporate restorative reagents into some of your works. When a creature drinks an experimental elixir, it gains temporary hit points equal to 2d6 + your Intelligence modifier.'
      },
      {
        level: 15,
        name: 'Chemical Mastery',
        description: 'You have been exposed to so many chemicals that they pose little risk to you. You have resistance to acid damage and poison damage, and you are immune to the poisoned condition.'
      }
    ]
  },
  armorer: {
    id: 'armorer',
    name: 'Armorer',
    description: 'An Artificer who specializes in defensive magic and technology, using arcane armor to protect allies and control the battlefield.',
    className: 'artificer',
    features: [
      {
        level: 3,
        name: 'Tool Proficiency',
        description: 'You gain proficiency with heavy armor, smith\'s tools, and if you don\'t already have them, leatherworker\'s tools.'
      },
      {
        level: 3,
        name: 'Armorer Spells',
        description: 'You always have certain spells prepared: magic missile, thunderwave (3rd); mirror image, shatter (5th); hypnotic pattern, lightning bolt (9th); fire shield, greater invisibility (13th); passwall, wall of force (17th).'
      },
      {
        level: 3,
        name: 'Arcane Armor',
        description: 'You can use arcane armor as a spellcasting focus. The armor attaches to you and can\'t be removed against your will. Choose Guardian or Infiltrator mode.'
      },
      {
        level: 5,
        name: 'Extra Attack',
        description: 'You can attack twice, rather than once, whenever you take the Attack action on your turn.',
        rulesKey: 'extra_attack'
      },
      {
        level: 9,
        name: 'Armor Modifications',
        description: 'You learn how to use your arcane armor to maximum effect. Each of your armor models gains additional features.'
      },
      {
        level: 15,
        name: 'Perfected Armor',
        description: 'Your Arcane Armor gains additional benefits based on its model: Guardian model gains temporary hit points, Infiltrator model gains advantage on Stealth checks.'
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
        description: 'You gain the ability to infuse your weapon strikes with divine energy. Once on each of your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 radiant damage.',
        rulesKey: 'divine_strike_life'
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
        description: 'When you use the Attack action, you can make one weapon attack as a bonus action. You can use this feature a number of times equal to your Wisdom modifier (minimum of once).',
        rulesKey: 'war_priest'
      },
      {
        level: 2,
        name: 'Channel Divinity: Guided Strike',
        description: 'You can use your Channel Divinity to strike with supernatural accuracy. When you make an attack roll, you can use your Channel Divinity to gain a +10 bonus to the roll.',
        rulesKey: 'guided_strike'
      },
      {
        level: 6,
        name: 'Channel Divinity: War God\'s Blessing',
        description: 'When a creature within 30 feet of you makes an attack roll, you can use your reaction to grant that creature a +10 bonus to the roll, using your Channel Divinity.'
      },
      {
        level: 8,
        name: 'Divine Strike',
        description: 'You gain the ability to infuse your weapon strikes with divine energy. Once on each of your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 damage of the same type dealt by the weapon.',
        rulesKey: 'divine_strike_war'
      },
      {
        level: 17,
        name: 'Avatar of Battle',
        description: 'You gain resistance to bludgeoning, piercing, and slashing damage from nonmagical attacks.'
      }
    ]
  },
  nature: {
    id: 'nature',
    name: 'Nature Domain',
    description: 'Gods of nature are as varied as the natural world itself. They include deities associated with forests, rivers, fertility, and the hunt.',
    className: 'cleric',
    features: [
      {
        level: 1,
        name: 'Domain Spells',
        description: 'You gain domain spells at the cleric levels listed: animal friendship, speak with animals (1st); barkskin, spike growth (3rd); plant growth, wind wall (5th); dominate beast, grasping vine (7th); insect plague, tree stride (9th).'
      },
      {
        level: 1,
        name: 'Acolyte of Nature',
        description: 'You learn one cantrip of your choice from the druid spell list. You also gain proficiency in one of the following skills of your choice: Animal Handling, Nature, or Survival.'
      },
      {
        level: 1,
        name: 'Bonus Proficiency',
        description: 'You gain proficiency with heavy armor.'
      },
      {
        level: 2,
        name: 'Channel Divinity: Charm Animals and Plants',
        description: 'You can use your Channel Divinity to charm animals and plants. As an action, you present your holy symbol and invoke the name of your deity.'
      },
      {
        level: 6,
        name: 'Dampen Elements',
        description: 'When you or a creature within 30 feet of you takes acid, cold, fire, lightning, or thunder damage, you can use your reaction to grant resistance to the creature against that instance of the damage.'
      },
      {
        level: 8,
        name: 'Divine Strike',
        description: 'You gain the ability to infuse your weapon strikes with divine energy. Once on each of your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 cold, fire, or lightning damage (your choice).'
      },
      {
        level: 17,
        name: 'Master of Nature',
        description: 'You gain the ability to command animals and plant creatures. Creatures of your choice that are charmed by you have advantage on attack rolls against your enemies.'
      }
    ]
  },
  knowledge: {
    id: 'knowledge',
    name: 'Knowledge Domain',
    description: 'The gods of knowledge value learning and understanding above all. They include Oghma, Boccob, Gilean, Aureon, and Thoth.',
    className: 'cleric',
    features: [
      {
        level: 1,
        name: 'Domain Spells',
        description: 'You gain domain spells at the cleric levels listed in the Knowledge Domain Spells table.'
      },
      {
        level: 1,
        name: 'Blessings of Knowledge',
        description: 'You learn two languages of your choice. You also become proficient in your choice of two skills: Arcana, History, Nature, or Religion. Your proficiency bonus is doubled for any ability check you make that uses either of these skills.'
      },
      {
        level: 2,
        name: 'Channel Divinity: Knowledge of the Ages',
        description: 'You can use your Channel Divinity to tap into a divine well of knowledge. As an action, you choose one skill or tool. For 10 minutes, you have proficiency with the chosen skill or tool.'
      },
      {
        level: 6,
        name: 'Channel Divinity: Read Thoughts',
        description: 'You can use your Channel Divinity to read a creature\'s thoughts. You can then use your access to the creature\'s mind to command it.'
      },
      {
        level: 8,
        name: 'Potent Spellcasting',
        description: 'You add your Wisdom modifier to the damage you deal with any cleric cantrip.'
      },
      {
        level: 17,
        name: 'Visions of the Past',
        description: 'You can call up visions of the past that relate to an object you hold or your immediate surroundings.'
      }
    ]
  },
  light: {
    id: 'light',
    name: 'Light Domain',
    description: 'Gods of light promote the ideals of rebirth and renewal, truth, vigilance, and beauty. They include Helm, Lathander, Pholtus, Branchala, the Silver Flame, Belenus, Apollo, and Re-Horakhty.',
    className: 'cleric',
    features: [
      {
        level: 1,
        name: 'Domain Spells',
        description: 'You gain domain spells at the cleric levels listed in the Light Domain Spells table.'
      },
      {
        level: 1,
        name: 'Bonus Cantrip',
        description: 'You gain the light cantrip if you don\'t already know it. This cantrip doesn\'t count against the number of cleric cantrips you know.'
      },
      {
        level: 1,
        name: 'Warding Flare',
        description: 'When you are attacked by a creature within 30 feet of you that you can see, you can use your reaction to impose disadvantage on the attack roll.'
      },
      {
        level: 2,
        name: 'Channel Divinity: Radiance of the Dawn',
        description: 'You can use your Channel Divinity to harness sunlight, banishing darkness and dealing radiant damage to your foes.'
      },
      {
        level: 6,
        name: 'Improved Flare',
        description: 'You can also use your Warding Flare feature when a creature that you can see within 30 feet of you attacks a creature other than you.'
      },
      {
        level: 8,
        name: 'Potent Spellcasting',
        description: 'You add your Wisdom modifier to the damage you deal with any cleric cantrip.'
      },
      {
        level: 17,
        name: 'Corona of Light',
        description: 'You can use your action to activate an aura of sunlight that lasts for 1 minute or until you dismiss it using another action.'
      }
    ]
  },
  tempest: {
    id: 'tempest',
    name: 'Tempest Domain',
    description: 'Gods whose portfolios include the Tempest domain govern storms, sea, and sky. They include Kord, Talos, Umberlee, Zeboim, the Devourer, Zeus, and Thor.',
    className: 'cleric',
    features: [
      {
        level: 1,
        name: 'Domain Spells',
        description: 'You gain domain spells at the cleric levels listed in the Tempest Domain Spells table.'
      },
      {
        level: 1,
        name: 'Bonus Proficiencies',
        description: 'You gain proficiency with martial weapons and heavy armor.'
      },
      {
        level: 1,
        name: 'Wrath of the Storm',
        description: 'When a creature within 5 feet of you that you can see hits you with an attack, you can use your reaction to cause the creature to make a Dexterity saving throw.',
        rulesKey: 'wrath_of_the_storm'
      },
      {
        level: 2,
        name: 'Channel Divinity: Destructive Wrath',
        description: 'You can use your Channel Divinity to wield the power of the storm with unchecked ferocity. When you roll lightning or thunder damage, you can use your Channel Divinity to deal maximum damage, instead of rolling.',
        rulesKey: 'destructive_wrath'
      },
      {
        level: 6,
        name: 'Thunderbolt Strike',
        description: 'When you deal lightning damage to a Large or smaller creature, you can also push it up to 10 feet away from you.'
      },
      {
        level: 8,
        name: 'Divine Strike',
        description: 'You gain the ability to infuse your weapon strikes with divine energy. Once on each of your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 thunder damage to the target.'
      },
      {
        level: 17,
        name: 'Stormborn',
        description: 'You have a flying speed equal to your current walking speed whenever you are not underground or indoors.'
      }
    ]
  },
  trickery: {
    id: 'trickery',
    name: 'Trickery Domain',
    description: 'Gods of trickery are mischief-makers and instigators who stand as a constant challenge to the accepted order. They include Beshaba, Cyric, Loki, Olidammara, the Traveler, Garl Glittergold, and Hermes.',
    className: 'cleric',
    features: [
      {
        level: 1,
        name: 'Domain Spells',
        description: 'You gain domain spells at the cleric levels listed in the Trickery Domain Spells table.'
      },
      {
        level: 1,
        name: 'Blessing of the Trickster',
        description: 'You can use your action to touch a willing creature other than yourself to give it advantage on Dexterity (Stealth) checks. This blessing lasts for 1 hour or until you use this feature again.'
      },
      {
        level: 2,
        name: 'Channel Divinity: Invoke Duplicity',
        description: 'You can use your Channel Divinity to create an illusory duplicate of yourself. As an action, you create a perfect illusion of yourself that lasts for 1 minute.'
      },
      {
        level: 6,
        name: 'Channel Divinity: Cloak of Shadows',
        description: 'You can use your Channel Divinity to vanish. As an action, you become invisible until the end of your next turn. You become visible if you attack or cast a spell.'
      },
      {
        level: 8,
        name: 'Divine Strike',
        description: 'You gain the ability to infuse your weapon strikes with poison. Once on each of your turns when you hit a creature with a weapon attack, you can cause the attack to deal an extra 1d8 poison damage to the target.'
      },
      {
        level: 17,
        name: 'Improved Duplicity',
        description: 'You can create up to four duplicates of yourself, instead of one, when you use Invoke Duplicity. As a bonus action on your turn, you can move any number of them up to 30 feet, to a maximum range of 120 feet.'
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
        description: 'When you choose to rage, you can go into a frenzy. If you do so, for the duration of your rage you can make a single melee weapon attack as a bonus action on each of your turns after this one.',
        rulesKey: 'frenzy'
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
        description: 'When you take damage from a creature that is within 5 feet of you, you can use your reaction to make a melee weapon attack against that creature.',
        rulesKey: 'retaliation'
      }
    ]
  },
  totem_warrior: {
    id: 'totem_warrior',
    name: 'Path of the Totem Warrior',
    description: 'The Path of the Totem Warrior is a spiritual journey, as the barbarian accepts a spirit animal as guide, protector, and inspiration.',
    className: 'barbarian',
    features: [
      {
        level: 3,
        name: 'Spirit Seeker',
        description: 'You gain the ability to cast the beast sense and speak with animals spells, but only as rituals.'
      },
      {
        level: 3,
        name: 'Totem Spirit',
        description: 'Choose a totem spirit and gain its feature. You must make or acquire a physical totem object that incorporates fur, feathers, claws, teeth, or bones of the totem animal.',
        rulesKey: 'totem_spirit'
      },
      {
        level: 6,
        name: 'Aspect of the Beast',
        description: 'You gain a magical benefit based on the totem animal of your choice.'
      },
      {
        level: 10,
        name: 'Spirit Walker',
        description: 'You can cast the commune with nature spell, but only as a ritual.'
      },
      {
        level: 14,
        name: 'Totemic Attunement',
        description: 'You gain a magical benefit based on a totem animal of your choice.'
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
  valor: {
    id: 'valor',
    name: 'College of Valor',
    description: 'Bards of the College of Valor are daring skalds whose tales keep alive the memory of the great heroes of the past, thereby inspiring a new generation of heroes.',
    className: 'bard',
    features: [
      {
        level: 3,
        name: 'Bonus Proficiencies',
        description: 'You gain proficiency with medium armor, shields, and all martial weapons.'
      },
      {
        level: 3,
        name: 'Combat Inspiration',
        description: 'A creature that has a Bardic Inspiration die from you can roll that die and add the number rolled to a weapon damage roll it just made.',
        rulesKey: 'combat_inspiration'
      },
      {
        level: 6,
        name: 'Extra Attack',
        description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.',
        rulesKey: 'extra_attack'
      },
      {
        level: 14,
        name: 'Superior Inspiration',
        description: 'When you roll initiative and have no uses of Bardic Inspiration left, you regain one use.'
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
        description: 'You can use your Channel Divinity to imbue one weapon that you are holding with positive energy.',
        rulesKey: 'sacred_weapon'
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
  ancients: {
    id: 'ancients',
    name: 'Oath of the Ancients',
    description: 'The Oath of the Ancients is as old as the race of elves and the rituals of the druids. Paladins who swear this oath cast their lot with the side of the light in the cosmic struggle against darkness.',
    className: 'paladin',
    features: [
      {
        level: 3,
        name: 'Oath Spells',
        description: 'You gain oath spells at the paladin levels listed.'
      },
      {
        level: 3,
        name: 'Channel Divinity: Nature\'s Wrath',
        description: 'You can use your Channel Divinity to invoke primeval forces to ensnare a foe.'
      },
      {
        level: 3,
        name: 'Channel Divinity: Turn the Faithless',
        description: 'You can use your Channel Divinity to utter ancient words that are painful for fey and fiends to hear.'
      },
      {
        level: 7,
        name: 'Aura of Warding',
        description: 'You and friendly creatures within 10 feet of you have resistance to damage from spells.',
        rulesKey: 'aura_of_warding'
      },
      {
        level: 15,
        name: 'Undying Sentinel',
        description: 'When you are reduced to 0 hit points and are not killed outright, you can choose to drop to 1 hit point instead.'
      },
      {
        level: 20,
        name: 'Elder Champion',
        description: 'You can assume the form of an ancient force of nature, taking on an appearance you choose.'
      }
    ]
  },
  vengeance: {
    id: 'vengeance',
    name: 'Oath of Vengeance',
    description: 'The Oath of Vengeance is a solemn commitment to punish those who have committed a grievous sin.',
    className: 'paladin',
    features: [
      {
        level: 3,
        name: 'Oath Spells',
        description: 'You gain oath spells at the paladin levels listed.'
      },
      {
        level: 3,
        name: 'Channel Divinity: Abjure Enemy',
        description: 'You can use your Channel Divinity to strike fear into the heart of your foes.'
      },
      {
        level: 3,
        name: 'Channel Divinity: Vow of Enmity',
        description: 'You can use your Channel Divinity to utter a vow of enmity against a creature you can see within 10 feet of you.',
        rulesKey: 'vow_of_enmity'
      },
      {
        level: 7,
        name: 'Relentless Avenger',
        description: 'When you hit a creature with an opportunity attack, you can move up to half your speed immediately after the attack.'
      },
      {
        level: 15,
        name: 'Soul of Vengeance',
        description: 'When a creature under the effect of your Vow of Enmity makes an attack, you can use your reaction to make a melee weapon attack against that creature.'
      },
      {
        level: 20,
        name: 'Avenging Angel',
        description: 'You can assume the form of an angelic avenger.'
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
        description: 'Choose one of the following features: Colossus Slayer, Giant Killer, or Horde Breaker.',
        rulesKey: 'hunters_prey'
      },
      {
        level: 7,
        name: 'Defensive Tactics',
        description: 'Choose one of the following features: Escape the Horde, Multiattack Defense, or Steel Will.'
      },
      {
        level: 11,
        name: 'Multiattack',
        description: 'Choose one of the following features: Volley or Whirlwind Attack.',
        rulesKey: 'ranger_multiattack'
      },
      {
        level: 15,
        name: 'Superior Hunter\'s Defense',
        description: 'Choose one of the following features: Evasion, Stand Against the Tide, or Uncanny Dodge.'
      }
    ]
  },
  beast_master: {
    id: 'beast_master',
    name: 'Beast Master',
    description: 'The Beast Master archetype embodies a friendship between the civilized races and the beasts of the world.',
    className: 'ranger',
    features: [
      {
        level: 3,
        name: 'Ranger\'s Companion',
        description: 'You gain a beast companion that accompanies you on your adventures and is trained to fight alongside you.'
      },
      {
        level: 7,
        name: 'Exceptional Training',
        description: 'On any of your turns when your beast companion doesn\'t attack, you can use a bonus action to command the beast to take the Dash, Disengage, Dodge, or Help action on its turn.'
      },
      {
        level: 11,
        name: 'Bestial Fury',
        description: 'Your companion can make two attacks when you command it to use the Attack action.'
      },
      {
        level: 15,
        name: 'Share Spells',
        description: 'When you cast a spell targeting yourself, you can also affect your beast companion with the spell if the beast is within 30 feet of you.'
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
        description: 'When you cast a spell that deals damage of the type associated with your draconic ancestry, you can add your Charisma modifier to one damage roll of that spell.',
        rulesKey: 'elemental_affinity'
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
  wild_magic: {
    id: 'wild_magic',
    name: 'Wild Magic Sorcery',
    description: 'Your innate magic comes from the wild forces of chaos that underlie the order of creation.',
    className: 'sorcerer',
    features: [
      {
        level: 1,
        name: 'Wild Magic Surge',
        description: 'Your spellcasting can unleash surges of untamed magic. Immediately after you cast a sorcerer spell of 1st level or higher, roll a d20. If you roll a 1, roll on the Wild Magic Surge table.'
      },
      {
        level: 1,
        name: 'Tides of Chaos',
        description: 'You can manipulate the forces of chance and chaos to gain advantage on one attack roll, ability check, or saving throw. Once you do so, you must finish a long rest before you can use this feature again.',
        rulesKey: 'tides_of_chaos'
      },
      {
        level: 6,
        name: 'Bend Luck',
        description: 'You have the ability to twist fate using your wild magic. When another creature you can see makes an attack roll, ability check, or saving throw, you can use your reaction and spend 2 sorcery points to roll 1d4 and apply the number rolled as a bonus or penalty to the creature\'s roll.'
      },
      {
        level: 14,
        name: 'Controlled Chaos',
        description: 'You gain a modicum of control over the surges of your wild magic. Whenever you roll on the Wild Magic Surge table, you can roll twice and use either number.'
      },
      {
        level: 18,
        name: 'Spell Bombardment',
        description: 'The harmful energy of your spells intensifies. When you roll damage for a spell and roll the highest number possible on any of the dice, choose one of those dice, roll it again and add that roll to the damage.'
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
        description: 'When you reduce a hostile creature to 0 hit points, you gain temporary hit points equal to your Charisma modifier + your warlock level (minimum of 1).',
        rulesKey: 'dark_ones_blessing'
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
  archfey: {
    id: 'archfey',
    name: 'The Archfey',
    description: 'Your patron is a lord or lady of the fey, a creature of legend who holds secrets that were forgotten before the mortal races were born.',
    className: 'warlock',
    features: [
      {
        level: 1,
        name: 'Expanded Spell List',
        description: 'The Archfey lets you choose from an expanded list of spells when you learn a warlock spell.'
      },
      {
        level: 1,
        name: 'Fey Presence',
        description: 'You can cause creatures to become charmed or frightened until the end of your next turn. Once you use this feature, you can\'t use it again until you finish a short or long rest.'
      },
      {
        level: 6,
        name: 'Misty Escape',
        description: 'You can vanish in a puff of mist in response to harm. When you take damage, you can use your reaction to turn invisible and teleport up to 60 feet to an unoccupied space you can see.'
      },
      {
        level: 10,
        name: 'Beguiling Defenses',
        description: 'You are immune to being charmed, and when another creature attempts to charm you, you can use your reaction to attempt to turn the charm back on that creature.'
      },
      {
        level: 14,
        name: 'Dark Delirium',
        description: 'You can plunge a creature into an illusory realm. As an action, choose a creature that you can see within 60 feet of you.'
      }
    ]
  },
  great_old_one: {
    id: 'great_old_one',
    name: 'The Great Old One',
    description: 'Your patron is a mysterious entity whose nature is utterly foreign to the fabric of reality.',
    className: 'warlock',
    features: [
      {
        level: 1,
        name: 'Expanded Spell List',
        description: 'The Great Old One lets you choose from an expanded list of spells when you learn a warlock spell.'
      },
      {
        level: 1,
        name: 'Telepathic Communication',
        description: 'You can telepathically speak to any creature you can see within 30 feet of you.'
      },
      {
        level: 6,
        name: 'Entropic Ward',
        description: 'When a creature makes an attack roll against you, you can use your reaction to impose disadvantage on that roll.'
      },
      {
        level: 10,
        name: 'Thought Shield',
        description: 'Your thoughts can\'t be read by telepathy or other means unless you allow it. You also have resistance to psychic damage.'
      },
      {
        level: 14,
        name: 'Create Thrall',
        description: 'You gain the ability to infect a humanoid\'s mind with the alien magic of your patron.'
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
  shadow: {
    id: 'shadow',
    name: 'Way of Shadow',
    description: 'Monks of the Way of Shadow follow a tradition that values stealth and subterfuge. These monks might be called ninjas or shadowdancers.',
    className: 'monk',
    features: [
      {
        level: 3,
        name: 'Shadow Arts',
        description: 'You can use your ki to duplicate the effects of certain spells. You can use the minor illusion cantrip. You can spend 2 ki points to cast darkness, darkvision, pass without trace, or silence without providing material components.'
      },
      {
        level: 6,
        name: 'Shadow Step',
        description: 'You gain the ability to step from one shadow into another. When you are in dim light or darkness, you can use your action to teleport up to 60 feet to an unoccupied space you can see that is also in dim light or darkness.'
      },
      {
        level: 11,
        name: 'Cloak of Shadows',
        description: 'You have learned to become one with the shadows. When you are in an area of dim light or darkness, you can use your action to become invisible.'
      },
      {
        level: 17,
        name: 'Opportunist',
        description: 'You can exploit a creature\'s momentary distraction when it is hit by an attack. Whenever a creature within 5 feet of you is hit by an attack made by a creature other than you, you can use your reaction to make a melee attack against that creature.'
      }
    ]
  },
  four_elements: {
    id: 'four_elements',
    name: 'Way of the Four Elements',
    description: 'You follow a monastic tradition that teaches you to harness the elements. When you focus your ki, you can align yourself with the forces of creation and bend the four elements to your will.',
    className: 'monk',
    features: [
      {
        level: 3,
        name: 'Disciple of the Elements',
        description: 'You learn magical disciplines that harness the power of the four elements. You learn one elemental discipline of your choice.'
      },
      {
        level: 6,
        name: 'Extra Elemental Discipline',
        description: 'You learn one additional elemental discipline of your choice.'
      },
      {
        level: 11,
        name: 'Extra Elemental Discipline',
        description: 'You learn one additional elemental discipline of your choice.'
      },
      {
        level: 17,
        name: 'Extra Elemental Discipline',
        description: 'You learn one additional elemental discipline of your choice.'
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
  },
  moon: {
    id: 'moon',
    name: 'Circle of the Moon',
    description: 'Druids of the Circle of the Moon are fierce guardians of the wilds. Their order gathers under the full moon to share news and trade warnings.',
    className: 'druid',
    features: [
      {
        level: 2,
        name: 'Combat Wild Shape',
        description: 'You can use Wild Shape as a bonus action, rather than as an action. Additionally, you can use a bonus action to expend one spell slot to regain hit points while in a beast shape.',
        rulesKey: 'combat_wild_shape'
      },
      {
        level: 2,
        name: 'Circle Forms',
        description: 'You can transform into beasts with a challenge rating as high as 1. You ignore the Max CR column of the Beast Shapes table, but must abide by the other limitations there.',
        rulesKey: 'circle_forms'
      },
      {
        level: 4,
        name: 'Circle Forms Improvement',
        description: 'You can transform into swimming beasts with a challenge rating as high as 1.'
      },
      {
        level: 6,
        name: 'Primal Strike',
        description: 'Your attacks in beast form count as magical for the purpose of overcoming resistance and immunity to nonmagical attacks and damage.'
      },
      {
        level: 8,
        name: 'Circle Forms Improvement',
        description: 'You can transform into flying beasts with a challenge rating as high as 1.'
      },
      {
        level: 10,
        name: 'Elemental Wild Shape',
        description: 'You can expend two uses of Wild Shape to transform into an air elemental, earth elemental, fire elemental, or water elemental.'
      },
      {
        level: 14,
        name: 'Thousand Forms',
        description: 'You have learned to use magic to alter your physical form in more subtle ways. You can cast the alter self spell at will.'
      }
    ]
  },

  // === XANATHAR'S GUIDE TO EVERYTHING SUBCLASSES ===
  
  // Barbarian - Path of the Ancestral Guardian
  ancestral_guardian: {
    id: 'ancestral_guardian',
    name: 'Path of the Ancestral Guardian',
    description: 'Some barbarians hail from cultures that revere their ancestors. These tribes teach that the warriors of the past linger in the world as mighty spirits.',
    className: 'barbarian',
    features: [
      {
        level: 3,
        name: 'Ancestral Protectors',
        description: 'Spectral warriors appear when you enter your rage. While you\'re raging, the first creature you hit with an attack on your turn becomes the target of the warriors.'
      },
      {
        level: 6,
        name: 'Spirit Shield',
        description: 'The guardian spirits that aid you can provide supernatural protection to those you defend.'
      },
      {
        level: 10,
        name: 'Consult the Spirits',
        description: 'You gain the ability to consult with your ancestral spirits.'
      },
      {
        level: 14,
        name: 'Vengeful Ancestors',
        description: 'Your ancestral spirits grow powerful enough to retaliate against those who harm you.'
      }
    ]
  },

  // Barbarian - Path of the Storm Herald  
  storm_herald: {
    id: 'storm_herald',
    name: 'Path of the Storm Herald',
    description: 'All barbarians harbor a fury within. Their rage grants them superior strength, durability, and speed. Barbarians who follow the Path of the Storm Herald learn to transform that rage into a mantle of primal magic.',
    className: 'barbarian',
    features: [
      {
        level: 3,
        name: 'Storm Aura',
        description: 'You emanate a stormy, magical aura while you rage. Choose desert, sea, or tundra. Your aura has a 10-foot radius.'
      },
      {
        level: 6,
        name: 'Storm Soul',
        description: 'The storm grants you benefits even when your aura isn\'t active.'
      },
      {
        level: 10,
        name: 'Shielding Storm',
        description: 'You learn to use your mastery of the storm to protect others.'
      },
      {
        level: 14,
        name: 'Raging Storm',
        description: 'The power of the storm you channel grows mightier, lashing out at your foes.'
      }
    ]
  },

  // Barbarian - Path of the Zealot
  zealot: {
    id: 'zealot',
    name: 'Path of the Zealot',
    description: 'Some deities inspire their followers to pitch themselves into a ferocious battle fury. These barbarians are zealots—warriors who channel their rage into powerful displays of divine power.',
    className: 'barbarian',
    features: [
      {
        level: 3,
        name: 'Divine Fury',
        description: 'You can channel divine fury into your weapon strikes. While you\'re raging, the first creature you hit on each of your turns takes extra damage.'
      },
      {
        level: 3,
        name: 'Warrior of the Gods',
        description: 'Your soul is marked for endless battle. If a spell has the sole effect of restoring you to life, the caster doesn\'t need material components to cast the spell on you.'
      },
      {
        level: 6,
        name: 'Fanatical Focus',
        description: 'The divine power that fuels your rage can protect you. If you fail a saving throw while raging, you can reroll it, and you must use the new roll.'
      },
      {
        level: 10,
        name: 'Zealous Presence',
        description: 'You learn to channel divine power to inspire zealotry in others.'
      },
      {
        level: 14,
        name: 'Rage Beyond Death',
        description: 'The divine power that fuels your rage allows you to shrug off fatal blows.'
      }
    ]
  },

  // Bard - College of Glamour
  glamour: {
    id: 'glamour',
    name: 'College of Glamour',
    description: 'The College of Glamour is the home of bards who mastered their craft in the vibrant realm of the Feywild or under the tutelage of someone who dwelled there.',
    className: 'bard',
    features: [
      {
        level: 3,
        name: 'Mantle of Inspiration',
        description: 'You gain the ability to weave a song of fey magic that imbues your allies with vigor and speed.'
      },
      {
        level: 3,
        name: 'Enthralling Performance',
        description: 'You can charge your performance with seductive, fey magic.'
      },
      {
        level: 6,
        name: 'Mantle of Majesty',
        description: 'You gain the ability to cloak yourself in a fey magic that makes others want to serve you.'
      },
      {
        level: 14,
        name: 'Unbreakable Majesty',
        description: 'Your appearance permanently gains an otherworldly aspect that makes you look more lovely and fierce.'
      }
    ]
  },

  // Bard - College of Swords
  swords: {
    id: 'swords',
    name: 'College of Swords',
    description: 'Bards of the College of Swords are called blades, and they entertain through daring feats of weapon prowess.',
    className: 'bard',
    features: [
      {
        level: 3,
        name: 'Bonus Proficiencies',
        description: 'You gain proficiency with medium armor and the scimitar. If you\'re proficient with a simple or martial melee weapon, you can use it as a spellcasting focus.'
      },
      {
        level: 3,
        name: 'Fighting Style',
        description: 'You adopt a fighting style: Dueling or Two-Weapon Fighting.',
        rulesKey: 'fighting_style'
      },
      {
        level: 3,
        name: 'Blade Flourish',
        description: 'You learn to perform impressive displays of martial prowess and speed.'
      },
      {
        level: 6,
        name: 'Extra Attack',
        description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.',
        rulesKey: 'extra_attack'
      },
      {
        level: 14,
        name: 'Master\'s Flourish',
        description: 'Whenever you use a Blade Flourish option, you can roll a d6 and use it instead of expending a Bardic Inspiration die.'
      }
    ]
  },

  // Bard - College of Whispers
  whispers: {
    id: 'whispers',
    name: 'College of Whispers',
    description: 'Most folk are happy to welcome a bard into their midst. Bards of the College of Whispers use this to their advantage.',
    className: 'bard',
    features: [
      {
        level: 3,
        name: 'Psychic Blades',
        description: 'You gain the ability to make your weapon attacks magically toxic to a creature\'s mind.'
      },
      {
        level: 3,
        name: 'Words of Terror',
        description: 'You learn to infuse innocent-seeming words with an insidious magic that can inspire terror.'
      },
      {
        level: 6,
        name: 'Mantle of Whispers',
        description: 'You gain the ability to adopt a humanoid\'s persona.'
      },
      {
        level: 14,
        name: 'Shadow Lore',
        description: 'You gain the ability to weave dark magic into your words and tap into a creature\'s deepest fears.'
      }
    ]
  },

  // Cleric - Forge Domain
  forge: {
    id: 'forge',
    name: 'Forge Domain',
    description: 'The gods of the forge are patrons of artisans who work with fire, from blacksmiths and engineers to glassblowers and potters.',
    className: 'cleric',
    features: [
      {
        level: 1,
        name: 'Domain Spells',
        description: 'You gain domain spells at the cleric levels listed in the Forge Domain Spells table.'
      },
      {
        level: 1,
        name: 'Bonus Proficiencies',
        description: 'You gain proficiency with heavy armor and smith\'s tools.'
      },
      {
        level: 1,
        name: 'Blessing of the Forge',
        description: 'You gain the ability to imbue magic into a weapon or armor.'
      },
      {
        level: 2,
        name: 'Channel Divinity: Artisan\'s Blessing',
        description: 'You can use your Channel Divinity to create simple items.'
      },
      {
        level: 6,
        name: 'Soul of the Forge',
        description: 'Your mastery of the forge grants you special abilities.'
      },
      {
        level: 8,
        name: 'Divine Strike',
        description: 'You gain the ability to infuse your weapon strikes with divine energy.'
      },
      {
        level: 17,
        name: 'Saint of Forge and Fire',
        description: 'Your blessed affinity with fire and metal becomes more powerful.'
      }
    ]
  },

  // Cleric - Grave Domain
  grave: {
    id: 'grave',
    name: 'Grave Domain',
    description: 'Gods of the grave watch over the line between life and death. To these deities, death and the afterlife are a foundational part of the multiverse.',
    className: 'cleric',
    features: [
      {
        level: 1,
        name: 'Domain Spells',
        description: 'You gain domain spells at the cleric levels listed in the Grave Domain Spells table.'
      },
      {
        level: 1,
        name: 'Circle of Mortality',
        description: 'You gain the ability to manipulate the line between life and death.'
      },
      {
        level: 1,
        name: 'Eyes of the Grave',
        description: 'You can occasionally glimpse the presence of the undead.'
      },
      {
        level: 2,
        name: 'Channel Divinity: Path to the Grave',
        description: 'You can use your Channel Divinity to mark another creature\'s life force for termination.'
      },
      {
        level: 6,
        name: 'Sentinel at Death\'s Door',
        description: 'You gain the ability to impede death\'s progress.'
      },
      {
        level: 8,
        name: 'Potent Spellcasting',
        description: 'You add your Wisdom modifier to the damage you deal with any cleric cantrip.'
      },
      {
        level: 17,
        name: 'Keeper of Souls',
        description: 'You can seize a trace of vitality from a parting soul and use it to heal the living.'
      }
    ]
  },

  // Rogue - Scout
  scout: {
    id: 'scout',
    name: 'Scout',
    description: 'You are skilled in stealth and survival, far from the streets of a city. You are most at home in the wilds, and are often found as the eyes and ears of a barbarian tribe or a ranger band.',
    className: 'rogue',
    features: [
      {
        level: 3,
        name: 'Skirmisher',
        description: 'You can move up to half your speed as a reaction when an enemy ends its turn within 5 feet of you.',
        rulesKey: 'skirmisher'
      },
      {
        level: 3,
        name: 'Survivalist',
        description: 'You gain proficiency in the Nature and Survival skills if you don\'t already have it.'
      },
      {
        level: 9,
        name: 'Superior Mobility',
        description: 'Your walking speed increases by 10 feet.'
      },
      {
        level: 13,
        name: 'Ambush Master',
        description: 'You excel at leading ambushes and acting first in a fight.',
        rulesKey: 'ambush_master'
      },
      {
        level: 17,
        name: 'Sudden Strike',
        description: 'You can strike with deadly speed. If you take the Attack action on your turn, you can make one additional attack as a bonus action.',
        rulesKey: 'sudden_strike'
      }
    ]
  },

  // Rogue - Swashbuckler
  swashbuckler: {
    id: 'swashbuckler',
    name: 'Swashbuckler',
    description: 'You focus your training on the art of the blade, relying on speed, elegance, and charm in equal parts.',
    className: 'rogue',
    features: [
      {
        level: 3,
        name: 'Fancy Footwork',
        description: 'During your turn, if you make a melee attack against a creature, that creature can\'t make opportunity attacks against you for the rest of your turn.'
      },
      {
        level: 3,
        name: 'Rakish Audacity',
        description: 'Your confidence propels you into battle. You can give yourself a bonus to your initiative rolls equal to your Charisma modifier.',
        rulesKey: 'rakish_audacity'
      },
      {
        level: 9,
        name: 'Panache',
        description: 'Your roguish bravado makes you a master of social situations.'
      },
      {
        level: 13,
        name: 'Elegant Maneuver',
        description: 'You can use a bonus action on your turn to gain advantage on the next Dexterity (Acrobatics) or Strength (Athletics) check you make during the same turn.'
      },
      {
        level: 17,
        name: 'Master Duelist',
        description: 'Your mastery of the blade lets you turn failure into success in combat.',
        rulesKey: 'master_duelist'
      }
    ]
  },

  // === TASHA'S CAULDRON OF EVERYTHING SUBCLASSES ===
  
  // Artificer - Battle Smith (Tasha's)
  battle_smith: {
    id: 'battle_smith',
    name: 'Battle Smith',
    description: 'Artificers who pursue the Battle Smith specialize in the use of magic to strengthen their allies, ward off enemies, and create magical companions.',
    className: 'artificer',
    features: [
      {
        level: 3,
        name: 'Tool Expertise',
        description: 'Your proficiency bonus is doubled for any ability check you make that uses your proficiency with a tool.'
      },
      {
        level: 3,
        name: 'Battle Smith Spells',
        description: 'You always have certain spells prepared after you reach particular levels in this class.'
      },
      {
        level: 3,
        name: 'Battle Ready',
        description: 'Your combat training and your experiments with magic have paid off in two ways: You gain proficiency with martial weapons.'
      },
      {
        level: 3,
        name: 'Steel Defender',
        description: 'Your tinkering has borne you a faithful companion, a steel defender.'
      },
      {
        level: 5,
        name: 'Arcane Jolt',
        description: 'You learn new ways to channel arcane energy through your Steel Defender or magic weapon.'
      },
      {
        level: 9,
        name: 'Steel Defender Improvement',
        description: 'Your Steel Defender\'s Deflect Attack now causes the attack to hit another creature of your choice within 5 feet of the defender.'
      },
      {
        level: 15,
        name: 'Improved Arcane Jolt',
        description: 'The magic weapon damage of your Arcane Jolt increases to 4d6, and the healing increases to 4d6.'
      }
    ]
  },

  // Sorcerer - Aberrant Mind (Tasha's)
  aberrant_mind: {
    id: 'aberrant_mind',
    name: 'Aberrant Mind',
    description: 'An alien influence has wrapped its tendrils around your mind, giving you psionic power.',
    className: 'sorcerer',
    features: [
      {
        level: 1,
        name: 'Telepathic Speech',
        description: 'You can form a telepathic connection between your mind and the mind of another.'
      },
      {
        level: 1,
        name: 'Psionic Spells',
        description: 'You learn additional spells when you reach certain levels in this class.'
      },
      {
        level: 6,
        name: 'Psionic Sorcery',
        description: 'When you cast any spell of 1st level or higher from your Psionic Spells feature, you can cast it by expending a spell slot as normal or by spending a number of sorcery points.'
      },
      {
        level: 6,
        name: 'Psychic Defenses',
        description: 'You gain resistance to psychic damage, and your thoughts can\'t be read unless you allow it.'
      },
      {
        level: 14,
        name: 'Psionic Strike',
        description: 'When you deal damage to a creature with your cantrips, you can spend 1 sorcery point to deal psychic damage to the creature equal to your Charisma modifier.'
      },
      {
        level: 18,
        name: 'Warping Implosion',
        description: 'You can unleash your aberrant power as a space-warping anomaly.'
      }
    ]
  },

  // Sorcerer - Clockwork Soul (Tasha's)  
  clockwork_soul: {
    id: 'clockwork_soul',
    name: 'Clockwork Soul',
    description: 'The cosmic force of order has influenced you, granting you the power to minimize chaos.',
    className: 'sorcerer',
    features: [
      {
        level: 1,
        name: 'Clockwork Magic',
        description: 'You learn additional spells when you reach certain levels in this class.'
      },
      {
        level: 1,
        name: 'Restore Balance',
        description: 'Your connection to the plane of absolute order allows you to equalize chaotic moments.'
      },
      {
        level: 6,
        name: 'Bastion of Law',
        description: 'You can tap into the grand equation of existence to imbue a creature with a shimmering shield of order.'
      },
      {
        level: 14,
        name: 'Trance of Order',
        description: 'You gain the ability to align your consciousness to the endless calculations of Mechanus.'
      },
      {
        level: 18,
        name: 'Clockwork Cavalcade',
        description: 'You summon spirits of order to expunge disorder around you.'
      }
    ]
  },

  // Warlock - The Genie (Tasha's)
  genie: {
    id: 'genie',
    name: 'The Genie',
    description: 'You have made a pact with one of the rarest kinds of genie, a noble genie.',
    className: 'warlock',
    features: [
      {
        level: 1,
        name: 'Expanded Spell List',
        description: 'The Genie lets you choose from an expanded list of spells when you learn a warlock spell.'
      },
      {
        level: 1,
        name: 'Genie\'s Vessel',
        description: 'Your patron gifts you a magical vessel that grants you a measure of the genie\'s power.'
      },
      {
        level: 6,
        name: 'Elemental Gift',
        description: 'You begin to take on the appearance of your patron\'s kind of genie.'
      },
      {
        level: 10,
        name: 'Sanctuary Vessel',
        description: 'When you enter your Genie\'s Vessel via the Bottled Respite feature, you can now choose up to five willing creatures that you can see within 30 feet of you, and the chosen creatures are drawn into the vessel with you.'
      },
      {
        level: 14,
        name: 'Limited Wish',
        description: 'You entreat your patron to grant you a small wish.'
      }
    ]
  },

  // === EXPLORER'S GUIDE TO WILDEMOUNT SUBCLASSES ===

  // Wizard - Chronurgy Magic
  chronurgy: {
    id: 'chronurgy',
    name: 'Chronurgy Magic',
    description: 'Focusing on the manipulation of time, those who follow the Chronurgy tradition learn to alter the pace of reality to their liking.',
    className: 'wizard',
    features: [
      {
        level: 2,
        name: 'Chronal Shift',
        description: 'You can magically exert limited control over the flow of time around a creature.',
        rulesKey: 'chronal_shift'
      },
      {
        level: 2,
        name: 'Temporal Awareness',
        description: 'You can add your Intelligence modifier to your initiative rolls.',
        rulesKey: 'temporal_awareness'
      },
      {
        level: 6,
        name: 'Momentary Stasis',
        description: 'You can force a Large or smaller creature to make a Constitution saving throw.',
        rulesKey: 'momentary_stasis'
      },
      {
        level: 10,
        name: 'Arcane Abeyance',
        description: 'When you cast a spell using a spell slot of 4th level or lower, you can condense the spell\'s magic into a mote.'
      },
      {
        level: 14,
        name: 'Convergent Future',
        description: 'You can peer through possible futures and magically pull one of them into being.',
        rulesKey: 'convergent_future'
      }
    ]
  },

  // Wizard - Graviturgy Magic  
  graviturgy: {
    id: 'graviturgy',
    name: 'Graviturgy Magic',
    description: 'Understanding and mastering the forces that draw bodies of matter together or drive them apart, the students of the Graviturgy tradition learn to manipulate gravity.',
    className: 'wizard',
    features: [
      {
        level: 2,
        name: 'Adjust Density',
        description: 'You can change the weight of objects or creatures.'
      },
      {
        level: 6,
        name: 'Gravity Well',
        description: 'You can adjust the gravity around a point in space.'
      },
      {
        level: 10,
        name: 'Violent Attraction',
        description: 'When another creature that you can see within 60 feet of you takes damage, you can use your reaction to increase the damage.'
      },
      {
        level: 14,
        name: 'Event Horizon',
        description: 'You can magically emit a powerful field of gravitational energy that tugs at other creatures for up to 1 minute.'
      }
    ]
  },

  // === SWORD COAST ADVENTURER'S GUIDE SUBCLASSES ===

  // Fighter - Purple Dragon Knight
  purple_dragon_knight: {
    id: 'purple_dragon_knight',
    name: 'Purple Dragon Knight',
    description: 'Purple Dragon Knights are warriors who hail from the kingdom of Cormyr. Pledged to protect the crown, they take the fight against evil beyond their kingdom\'s borders.',
    className: 'fighter',
    features: [
      {
        level: 3,
        name: 'Rallying Cry',
        description: 'When you use your Second Wind feature, you can choose up to three creatures within 60 feet of you that are allied with you.',
        rulesKey: 'rallying_cry'
      },
      {
        level: 7,
        name: 'Royal Envoy',
        description: 'You gain proficiency in the Persuasion skill. If you are already proficient in it, you gain proficiency in one of the following skills of your choice: Animal Handling, Insight, Intimidation, or Performance.'
      },
      {
        level: 10,
        name: 'Inspiring Surge',
        description: 'When you use your Action Surge feature, you can choose one creature within 60 feet of you that is allied with you.',
        rulesKey: 'inspiring_surge'
      },
      {
        level: 15,
        name: 'Bulwark',
        description: 'You can extend the benefit of your Indomitable feature to an ally.'
      },
      {
        level: 18,
        name: 'Inspiring Surge Improvement',
        description: 'You can choose two allies within 60 feet of you, rather than one.'
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