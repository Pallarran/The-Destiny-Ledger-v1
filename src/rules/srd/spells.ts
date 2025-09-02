export interface Spell {
  id: string
  name: string
  level: number // 0 for cantrips
  school: string
  castingTime: string
  range: string
  components: string
  duration: string
  description: string
  atHigherLevels?: string
  classes: string[] // Which classes can learn this spell
  tags: string[]
}

// Cantrips (Level 0)
export const cantrips: Record<string, Spell> = {
  // Wizard/Sorcerer Cantrips
  fire_bolt: {
    id: 'fire_bolt',
    name: 'Fire Bolt',
    level: 0,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'You hurl a mote of fire at a creature or object. Make a ranged spell attack. On hit: 1d10 fire damage.',
    atHigherLevels: 'Damage increases by 1d10 at 5th, 11th, and 17th level.',
    classes: ['wizard', 'sorcerer'],
    tags: ['damage', 'fire', 'ranged']
  },
  ray_of_frost: {
    id: 'ray_of_frost',
    name: 'Ray of Frost',
    level: 0,
    school: 'Evocation',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'A frigid beam of blue-white light. Ranged spell attack for 1d8 cold damage and reduces speed by 10 feet.',
    atHigherLevels: 'Damage increases by 1d8 at 5th, 11th, and 17th level.',
    classes: ['wizard', 'sorcerer'],
    tags: ['damage', 'cold', 'control']
  },
  mage_hand: {
    id: 'mage_hand',
    name: 'Mage Hand',
    level: 0,
    school: 'Conjuration',
    castingTime: '1 action',
    range: '30 feet',
    components: 'V, S',
    duration: '1 minute',
    description: 'A spectral hand appears and can manipulate objects up to 10 pounds.',
    classes: ['wizard', 'sorcerer', 'bard', 'warlock'],
    tags: ['utility', 'manipulation']
  },
  minor_illusion: {
    id: 'minor_illusion',
    name: 'Minor Illusion',
    level: 0,
    school: 'Illusion',
    castingTime: '1 action',
    range: '30 feet',
    components: 'S, M',
    duration: '1 minute',
    description: 'Create a sound or image of an object no larger than a 5-foot cube.',
    classes: ['wizard', 'sorcerer', 'bard', 'warlock'],
    tags: ['utility', 'illusion', 'deception']
  },
  prestidigitation: {
    id: 'prestidigitation',
    name: 'Prestidigitation',
    level: 0,
    school: 'Transmutation',
    castingTime: '1 action',
    range: '10 feet',
    components: 'V, S',
    duration: 'Up to 1 hour',
    description: 'Minor magical effects: sensory effects, clean/soil, chill/warm, color, symbol, or trinket.',
    classes: ['wizard', 'sorcerer', 'bard'],
    tags: ['utility', 'flavor']
  },
  
  // Cleric Cantrips
  guidance: {
    id: 'guidance',
    name: 'Guidance',
    level: 0,
    school: 'Divination',
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, S',
    duration: 'Concentration, up to 1 minute',
    description: 'Touch a creature to add 1d4 to one ability check of its choice.',
    classes: ['cleric', 'druid'],
    tags: ['buff', 'support']
  },
  sacred_flame: {
    id: 'sacred_flame',
    name: 'Sacred Flame',
    level: 0,
    school: 'Evocation',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'Target must make Dexterity save or take 1d8 radiant damage.',
    atHigherLevels: 'Damage increases by 1d8 at 5th, 11th, and 17th level.',
    classes: ['cleric'],
    tags: ['damage', 'radiant', 'save']
  },
  spare_the_dying: {
    id: 'spare_the_dying',
    name: 'Spare the Dying',
    level: 0,
    school: 'Necromancy',
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'Stabilize a creature with 0 hit points.',
    classes: ['cleric'],
    tags: ['healing', 'support']
  },
  
  // Druid Cantrips
  druidcraft: {
    id: 'druidcraft',
    name: 'Druidcraft',
    level: 0,
    school: 'Transmutation',
    castingTime: '1 action',
    range: '30 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'Create minor nature effects: predict weather, bloom flower, sensory effect, or light/snuff flame.',
    classes: ['druid'],
    tags: ['utility', 'nature', 'flavor']
  },
  produce_flame: {
    id: 'produce_flame',
    name: 'Produce Flame',
    level: 0,
    school: 'Conjuration',
    castingTime: '1 action',
    range: 'Self',
    components: 'V, S',
    duration: '10 minutes',
    description: 'Flame in hand provides light. Can hurl for 1d8 fire damage.',
    atHigherLevels: 'Damage increases by 1d8 at 5th, 11th, and 17th level.',
    classes: ['druid'],
    tags: ['damage', 'fire', 'light']
  },
  
  // Bard Cantrips
  vicious_mockery: {
    id: 'vicious_mockery',
    name: 'Vicious Mockery',
    level: 0,
    school: 'Enchantment',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V',
    duration: 'Instantaneous',
    description: 'Wisdom save or take 1d4 psychic damage and disadvantage on next attack.',
    atHigherLevels: 'Damage increases by 1d4 at 5th, 11th, and 17th level.',
    classes: ['bard'],
    tags: ['damage', 'psychic', 'debuff']
  }
}

// Level 1 Spells
export const level1Spells: Record<string, Spell> = {
  // Wizard/Sorcerer
  burning_hands: {
    id: 'burning_hands',
    name: 'Burning Hands',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: 'Self (15-foot cone)',
    components: 'V, S',
    duration: 'Instantaneous',
    description: '15-foot cone of fire. Each creature makes Dex save or takes 3d6 fire damage (half on save).',
    atHigherLevels: 'Damage increases by 1d6 for each slot above 1st.',
    classes: ['wizard', 'sorcerer'],
    tags: ['damage', 'fire', 'aoe']
  },
  magic_missile: {
    id: 'magic_missile',
    name: 'Magic Missile',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'Three darts of magical force. Each dart hits automatically for 1d4+1 force damage.',
    atHigherLevels: 'One additional dart for each slot above 1st.',
    classes: ['wizard', 'sorcerer'],
    tags: ['damage', 'force', 'auto-hit']
  },
  shield: {
    id: 'shield',
    name: 'Shield',
    level: 1,
    school: 'Abjuration',
    castingTime: '1 reaction',
    range: 'Self',
    components: 'V, S',
    duration: '1 round',
    description: '+5 bonus to AC until start of next turn, including against triggering attack.',
    classes: ['wizard', 'sorcerer'],
    tags: ['defense', 'reaction']
  },
  sleep: {
    id: 'sleep',
    name: 'Sleep',
    level: 1,
    school: 'Enchantment',
    castingTime: '1 action',
    range: '90 feet',
    components: 'V, S, M',
    duration: '1 minute',
    description: 'Roll 5d8; creatures in 20-foot radius fall unconscious in ascending HP order.',
    atHigherLevels: '2d8 additional hit points for each slot above 1st.',
    classes: ['wizard', 'sorcerer', 'bard'],
    tags: ['control', 'incapacitation']
  },
  detect_magic: {
    id: 'detect_magic',
    name: 'Detect Magic',
    level: 1,
    school: 'Divination',
    castingTime: '1 action',
    range: 'Self',
    components: 'V, S',
    duration: 'Concentration, up to 10 minutes',
    description: 'Sense magic within 30 feet and learn its school.',
    classes: ['wizard', 'sorcerer', 'bard', 'cleric', 'druid'],
    tags: ['detection', 'utility']
  },
  
  // Cleric
  bless: {
    id: 'bless',
    name: 'Bless',
    level: 1,
    school: 'Enchantment',
    castingTime: '1 action',
    range: '30 feet',
    components: 'V, S, M',
    duration: 'Concentration, up to 1 minute',
    description: 'Up to 3 creatures add 1d4 to attack rolls and saving throws.',
    atHigherLevels: 'Target one additional creature for each slot above 1st.',
    classes: ['cleric'],
    tags: ['buff', 'support']
  },
  cure_wounds: {
    id: 'cure_wounds',
    name: 'Cure Wounds',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: 'Touch',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'Touch a creature to restore 1d8 + spellcasting modifier hit points.',
    atHigherLevels: 'Healing increases by 1d8 for each slot above 1st.',
    classes: ['cleric', 'druid', 'bard'],
    tags: ['healing', 'support']
  },
  guiding_bolt: {
    id: 'guiding_bolt',
    name: 'Guiding Bolt',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: '1 round',
    description: 'Ranged spell attack for 4d6 radiant damage. Next attack has advantage.',
    atHigherLevels: 'Damage increases by 1d6 for each slot above 1st.',
    classes: ['cleric'],
    tags: ['damage', 'radiant', 'buff']
  },
  healing_word: {
    id: 'healing_word',
    name: 'Healing Word',
    level: 1,
    school: 'Evocation',
    castingTime: '1 bonus action',
    range: '60 feet',
    components: 'V',
    duration: 'Instantaneous',
    description: 'A creature regains 1d4 + spellcasting modifier hit points.',
    atHigherLevels: 'Healing increases by 1d4 for each slot above 1st.',
    classes: ['cleric', 'druid', 'bard'],
    tags: ['healing', 'bonus-action']
  },
  
  // Druid
  entangle: {
    id: 'entangle',
    name: 'Entangle',
    level: 1,
    school: 'Conjuration',
    castingTime: '1 action',
    range: '90 feet',
    components: 'V, S',
    duration: 'Concentration, up to 1 minute',
    description: '20-foot square becomes difficult terrain. Creatures must save or be restrained.',
    classes: ['druid'],
    tags: ['control', 'restraint', 'area']
  },
  faerie_fire: {
    id: 'faerie_fire',
    name: 'Faerie Fire',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V',
    duration: 'Concentration, up to 1 minute',
    description: '20-foot cube. Dex save or outlined in light, attacks have advantage.',
    classes: ['druid', 'bard'],
    tags: ['debuff', 'advantage', 'light']
  },
  
  // Bard
  charm_person: {
    id: 'charm_person',
    name: 'Charm Person',
    level: 1,
    school: 'Enchantment',
    castingTime: '1 action',
    range: '30 feet',
    components: 'V, S',
    duration: '1 hour',
    description: 'Wisdom save or be charmed. Advantage on social checks.',
    atHigherLevels: 'Target one additional creature for each slot above 1st.',
    classes: ['wizard', 'sorcerer', 'bard', 'druid', 'warlock'],
    tags: ['enchantment', 'social', 'charm']
  },
  disguise_self: {
    id: 'disguise_self',
    name: 'Disguise Self',
    level: 1,
    school: 'Illusion',
    castingTime: '1 action',
    range: 'Self',
    components: 'V, S',
    duration: '1 hour',
    description: 'Change appearance including clothing, armor, weapons, and belongings.',
    classes: ['wizard', 'sorcerer', 'bard'],
    tags: ['illusion', 'disguise', 'utility']
  }
}

// Level 2 Spells (Sample)
export const level2Spells: Record<string, Spell> = {
  scorching_ray: {
    id: 'scorching_ray',
    name: 'Scorching Ray',
    level: 2,
    school: 'Evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: 'V, S',
    duration: 'Instantaneous',
    description: 'Three rays of fire. Ranged spell attack for each, 2d6 fire damage per ray.',
    atHigherLevels: 'One additional ray for each slot above 2nd.',
    classes: ['wizard', 'sorcerer'],
    tags: ['damage', 'fire', 'multi-target']
  },
  misty_step: {
    id: 'misty_step',
    name: 'Misty Step',
    level: 2,
    school: 'Conjuration',
    castingTime: '1 bonus action',
    range: 'Self',
    components: 'V',
    duration: 'Instantaneous',
    description: 'Teleport up to 30 feet to an unoccupied space you can see.',
    classes: ['wizard', 'sorcerer', 'warlock'],
    tags: ['teleportation', 'mobility', 'bonus-action']
  },
  web: {
    id: 'web',
    name: 'Web',
    level: 2,
    school: 'Conjuration',
    castingTime: '1 action',
    range: '60 feet',
    components: 'V, S, M',
    duration: 'Concentration, up to 1 hour',
    description: '20-foot cube of webs. Dex save or restrained. Difficult terrain.',
    classes: ['wizard', 'sorcerer'],
    tags: ['control', 'restraint', 'area']
  },
  spiritual_weapon: {
    id: 'spiritual_weapon',
    name: 'Spiritual Weapon',
    level: 2,
    school: 'Evocation',
    castingTime: '1 bonus action',
    range: '60 feet',
    components: 'V, S',
    duration: '1 minute',
    description: 'Create floating weapon. Bonus action to attack for 1d8 + spellcasting modifier.',
    atHigherLevels: 'Damage increases by 1d8 for every two slots above 2nd.',
    classes: ['cleric'],
    tags: ['damage', 'force', 'bonus-action']
  }
}

// Compile all spells
export const allSpells: Record<string, Spell> = {
  ...cantrips,
  ...level1Spells,
  ...level2Spells
}

// Helper functions
export function getSpellsByClass(className: string): Spell[] {
  return Object.values(allSpells).filter(spell => 
    spell.classes.includes(className.toLowerCase())
  )
}

export function getSpellsByLevel(level: number): Spell[] {
  return Object.values(allSpells).filter(spell => spell.level === level)
}

export function getSpellsByClassAndLevel(className: string, level: number): Spell[] {
  return Object.values(allSpells).filter(spell => 
    spell.classes.includes(className.toLowerCase()) && spell.level === level
  )
}

// Spell progression tables
export const spellsKnownProgression = {
  bard: {
    cantrips: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    spellsKnown: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22]
  },
  sorcerer: {
    cantrips: [4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
    spellsKnown: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15]
  },
  warlock: {
    cantrips: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    spellsKnown: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15]
  },
  ranger: { // Rangers don't get cantrips
    cantrips: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    spellsKnown: [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11]
  },
  // Eldritch Knight (Fighter subclass)
  eldritch_knight: {
    cantrips: [0, 0, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    spellsKnown: [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13]
  },
  // Arcane Trickster (Rogue subclass)
  arcane_trickster: {
    cantrips: [0, 0, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    spellsKnown: [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13]
  }
}

// Prepared casters prepare differently
export const preparedSpellsFormula = {
  cleric: (level: number, wisdomModifier: number) => Math.max(1, level + wisdomModifier),
  druid: (level: number, wisdomModifier: number) => Math.max(1, level + wisdomModifier),
  wizard: (level: number, intelligenceModifier: number) => Math.max(1, level + intelligenceModifier),
  paladin: (level: number, charismaModifier: number) => Math.max(1, Math.floor(level / 2) + charismaModifier),
  artificer: (level: number, intelligenceModifier: number) => Math.max(1, Math.floor(level / 2) + intelligenceModifier)
}

// Cantrips known for prepared casters
export const cantripsKnownProgression = {
  cleric: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  druid: [2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  wizard: [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
}