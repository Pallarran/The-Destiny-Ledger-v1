export interface MysticArcanumSpell {
  id: string
  name: string
  level: number
  school: string
  description: string
  effect: string
  tags: string[]
}

// 6th level Warlock Mystic Arcanum spells
export const mysticArcanum6th: Record<string, MysticArcanumSpell> = {
  arcane_gate: {
    id: 'arcane_gate',
    name: 'Arcane Gate',
    level: 6,
    school: 'conjuration',
    description: 'Create linked teleportation portals.',
    effect: 'Two 10-foot portals that connect to each other',
    tags: ['utility', 'teleportation']
  },
  circle_of_death: {
    id: 'circle_of_death',
    name: 'Circle of Death',
    level: 6,
    school: 'necromancy', 
    description: 'Sphere of negative energy deals necrotic damage.',
    effect: '8d6 necrotic damage in 60-foot radius',
    tags: ['damage', 'aoe', 'necrotic']
  },
  conjure_fey: {
    id: 'conjure_fey',
    name: 'Conjure Fey',
    level: 6,
    school: 'conjuration',
    description: 'Summon a fey creature to fight for you.',
    effect: 'Summon CR 6 or lower fey creature',
    tags: ['summoning', 'fey']
  },
  create_undead: {
    id: 'create_undead',
    name: 'Create Undead',
    level: 6,
    school: 'necromancy',
    description: 'Create undead servants from corpses.',
    effect: 'Animate up to 3 corpses as undead',
    tags: ['necromancy', 'minions', 'undead']
  },
  eyebite: {
    id: 'eyebite',
    name: 'Eyebite',
    level: 6,
    school: 'necromancy',
    description: 'Target falls asleep, is panicked, or sickened.',
    effect: 'Asleep, frightened, or sickened condition',
    tags: ['debuff', 'control', 'single-target']
  },
  flesh_to_stone: {
    id: 'flesh_to_stone',
    name: 'Flesh to Stone',
    level: 6,
    school: 'transmutation',
    description: 'Turn a creature to stone.',
    effect: 'Restrained, then petrified condition',
    tags: ['control', 'petrification', 'single-target']
  },
  mass_suggestion: {
    id: 'mass_suggestion',
    name: 'Mass Suggestion',
    level: 6,
    school: 'enchantment',
    description: 'Suggest a course of activity to up to 12 creatures.',
    effect: 'Compel up to 12 creatures to follow suggestion',
    tags: ['enchantment', 'control', 'social']
  },
  true_seeing: {
    id: 'true_seeing',
    name: 'True Seeing',
    level: 6,
    school: 'divination',
    description: 'See through illusions and transformations.',
    effect: 'Truesight 120 feet for 1 hour',
    tags: ['utility', 'detection', 'vision']
  }
}

// 7th level Warlock Mystic Arcanum spells
export const mysticArcanum7th: Record<string, MysticArcanumSpell> = {
  finger_of_death: {
    id: 'finger_of_death',
    name: 'Finger of Death',
    level: 7,
    school: 'necromancy',
    description: 'Deal massive necrotic damage to one creature.',
    effect: '7d8+30 necrotic damage',
    tags: ['damage', 'necrotic', 'single-target']
  },
  fire_storm: {
    id: 'fire_storm',
    name: 'Fire Storm',
    level: 7,
    school: 'evocation',
    description: 'Create roaring flames in multiple areas.',
    effect: '7d10 fire damage in ten 10-foot cubes',
    tags: ['damage', 'fire', 'aoe']
  },
  plane_shift: {
    id: 'plane_shift',
    name: 'Plane Shift',
    level: 7,
    school: 'conjuration',
    description: 'Transport yourself and allies to another plane.',
    effect: 'Transport up to 8 creatures to another plane',
    tags: ['utility', 'planar-travel', 'teleportation']
  },
  reverse_gravity: {
    id: 'reverse_gravity',
    name: 'Reverse Gravity',
    level: 7,
    school: 'transmutation',
    description: 'Reverse gravity in a large area.',
    effect: 'Reverse gravity in 50-foot radius cylinder',
    tags: ['control', 'environmental', 'aoe']
  }
}

// 8th level Warlock Mystic Arcanum spells
export const mysticArcanum8th: Record<string, MysticArcanumSpell> = {
  demiplane: {
    id: 'demiplane',
    name: 'Demiplane',
    level: 8,
    school: 'conjuration',
    description: 'Create a door to an extradimensional space.',
    effect: 'Create 30-foot cube demiplane',
    tags: ['utility', 'extradimensional', 'storage']
  },
  dominate_monster: {
    id: 'dominate_monster',
    name: 'Dominate Monster',
    level: 8,
    school: 'enchantment',
    description: 'Control a creature\'s actions.',
    effect: 'Charm and control any creature',
    tags: ['enchantment', 'control', 'domination']
  },
  feeblemind: {
    id: 'feeblemind',
    name: 'Feeblemind',
    level: 8,
    school: 'enchantment',
    description: 'Shatter a creature\'s intellect and personality.',
    effect: 'Intelligence and Charisma become 1',
    tags: ['debuff', 'mental', 'single-target']
  },
  glibness: {
    id: 'glibness',
    name: 'Glibness',
    level: 8,
    school: 'transmutation',
    description: 'Your lies become believable and your words silver.',
    effect: 'Charisma (Deception) checks always 15 or higher',
    tags: ['social', 'deception', 'utility']
  },
  power_word_stun: {
    id: 'power_word_stun',
    name: 'Power Word Stun',
    level: 8,
    school: 'enchantment',
    description: 'Stun a creature with 150 hit points or fewer.',
    effect: 'Stun creature with ≤150 HP',
    tags: ['control', 'stun', 'single-target']
  }
}

// 9th level Warlock Mystic Arcanum spells
export const mysticArcanum9th: Record<string, MysticArcanumSpell> = {
  astral_projection: {
    id: 'astral_projection',
    name: 'Astral Projection',
    level: 9,
    school: 'necromancy',
    description: 'Project your soul to the Astral Plane.',
    effect: 'Project up to 8 creatures to Astral Plane',
    tags: ['utility', 'planar-travel', 'astral']
  },
  foresight: {
    id: 'foresight',
    name: 'Foresight',
    level: 9,
    school: 'divination',
    description: 'Grant supernatural awareness and luck.',
    effect: 'Advantage on attacks/abilities/saves, others have disadvantage',
    tags: ['utility', 'divination', 'buff']
  },
  imprisonment: {
    id: 'imprisonment',
    name: 'Imprisonment',
    level: 9,
    school: 'abjuration',
    description: 'Trap a creature in an extradimensional prison.',
    effect: 'Incapacitate creature indefinitely',
    tags: ['control', 'incapacitation', 'prison']
  },
  power_word_kill: {
    id: 'power_word_kill',
    name: 'Power Word Kill',
    level: 9,
    school: 'enchantment',
    description: 'Kill a creature with 100 hit points or fewer.',
    effect: 'Instantly kill creature with ≤100 HP',
    tags: ['damage', 'death', 'single-target']
  },
  true_polymorph: {
    id: 'true_polymorph',
    name: 'True Polymorph',
    level: 9,
    school: 'transmutation',
    description: 'Transform a creature or object permanently.',
    effect: 'Permanent transformation into any creature/object',
    tags: ['utility', 'transformation', 'polymorph']
  }
}

export const allMysticArcanumSpells = {
  6: mysticArcanum6th,
  7: mysticArcanum7th,
  8: mysticArcanum8th,
  9: mysticArcanum9th
}

export function getMysticArcanumProgression(level: number): { level: number; hasSpell: boolean }[] {
  return [
    { level: 6, hasSpell: level >= 11 },
    { level: 7, hasSpell: level >= 13 },
    { level: 8, hasSpell: level >= 15 },
    { level: 9, hasSpell: level >= 17 }
  ]
}

export function getMysticArcanumAvailableAtLevel(warlockLevel: number): number[] {
  const available = []
  if (warlockLevel >= 11) available.push(6)
  if (warlockLevel >= 13) available.push(7)
  if (warlockLevel >= 15) available.push(8)
  if (warlockLevel >= 17) available.push(9)
  return available
}