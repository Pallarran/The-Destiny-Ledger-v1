export interface FavoredEnemy {
  id: string
  name: string
  description: string
  creatureTypes: string[]
  benefits: string[]
  tags: string[]
}

export interface NaturalExplorer {
  id: string
  name: string
  description: string
  terrainType: string
  benefits: string[]
  tags: string[]
}

// Ranger Favored Enemy options
export const favoredEnemies: Record<string, FavoredEnemy> = {
  beasts: {
    id: 'beasts',
    name: 'Beasts',
    description: 'Natural animals, both wild and domesticated.',
    creatureTypes: ['beast'],
    benefits: [
      'Advantage on Wisdom (Survival) checks to track beasts',
      'Advantage on Intelligence checks to recall information about beasts'
    ],
    tags: ['nature', 'wilderness', 'animals']
  },
  fey: {
    id: 'fey',
    name: 'Fey',
    description: 'Magical creatures of nature and whimsy from the Feywild.',
    creatureTypes: ['fey'],
    benefits: [
      'Advantage on Wisdom (Survival) checks to track fey',
      'Advantage on Intelligence checks to recall information about fey'
    ],
    tags: ['magic', 'feywild', 'nature']
  },
  humanoids: {
    id: 'humanoids',
    name: 'Humanoids (two races)',
    description: 'Choose two specific races of humanoids (such as gnolls and orcs).',
    creatureTypes: ['humanoid'],
    benefits: [
      'Advantage on Wisdom (Survival) checks to track chosen humanoid races',
      'Advantage on Intelligence checks to recall information about chosen humanoid races',
      'Learn one language spoken by chosen races'
    ],
    tags: ['social', 'tracking', 'language']
  },
  monstrosities: {
    id: 'monstrosities',
    name: 'Monstrosities',
    description: 'Unnatural creatures that don\'t fit other categories.',
    creatureTypes: ['monstrosity'],
    benefits: [
      'Advantage on Wisdom (Survival) checks to track monstrosities',
      'Advantage on Intelligence checks to recall information about monstrosities'
    ],
    tags: ['aberrant', 'unnatural', 'dangerous']
  },
  undead: {
    id: 'undead',
    name: 'Undead',
    description: 'Creatures that have died but persist in a form of unlife.',
    creatureTypes: ['undead'],
    benefits: [
      'Advantage on Wisdom (Survival) checks to track undead',
      'Advantage on Intelligence checks to recall information about undead'
    ],
    tags: ['necromancy', 'evil', 'supernatural']
  },
  fiends: {
    id: 'fiends',
    name: 'Fiends',
    description: 'Evil creatures from the lower planes.',
    creatureTypes: ['fiend'],
    benefits: [
      'Advantage on Wisdom (Survival) checks to track fiends',
      'Advantage on Intelligence checks to recall information about fiends'
    ],
    tags: ['evil', 'planar', 'demons-devils']
  },
  celestials: {
    id: 'celestials',
    name: 'Celestials',
    description: 'Good creatures from the upper planes.',
    creatureTypes: ['celestial'],
    benefits: [
      'Advantage on Wisdom (Survival) checks to track celestials',
      'Advantage on Intelligence checks to recall information about celestials'
    ],
    tags: ['good', 'planar', 'divine']
  },
  constructs: {
    id: 'constructs',
    name: 'Constructs',
    description: 'Artificial creatures animated by magic.',
    creatureTypes: ['construct'],
    benefits: [
      'Advantage on Wisdom (Survival) checks to track constructs',
      'Advantage on Intelligence checks to recall information about constructs'
    ],
    tags: ['artificial', 'magic', 'animated']
  },
  dragons: {
    id: 'dragons',
    name: 'Dragons',
    description: 'Ancient, powerful, and magical reptilian creatures.',
    creatureTypes: ['dragon'],
    benefits: [
      'Advantage on Wisdom (Survival) checks to track dragons',
      'Advantage on Intelligence checks to recall information about dragons'
    ],
    tags: ['ancient', 'powerful', 'magical']
  },
  elementals: {
    id: 'elementals',
    name: 'Elementals',
    description: 'Creatures made of the raw stuff of the elemental planes.',
    creatureTypes: ['elemental'],
    benefits: [
      'Advantage on Wisdom (Survival) checks to track elementals',
      'Advantage on Intelligence checks to recall information about elementals'
    ],
    tags: ['elemental', 'planar', 'primal']
  },
  giants: {
    id: 'giants',
    name: 'Giants',
    description: 'Huge humanoid creatures of immense strength.',
    creatureTypes: ['giant'],
    benefits: [
      'Advantage on Wisdom (Survival) checks to track giants',
      'Advantage on Intelligence checks to recall information about giants'
    ],
    tags: ['large', 'strong', 'ancient']
  },
  plants: {
    id: 'plants',
    name: 'Plants',
    description: 'Vegetable creatures, both ambulatory and rooted.',
    creatureTypes: ['plant'],
    benefits: [
      'Advantage on Wisdom (Survival) checks to track plants',
      'Advantage on Intelligence checks to recall information about plants'
    ],
    tags: ['nature', 'vegetation', 'growth']
  },
  aberrations: {
    id: 'aberrations',
    name: 'Aberrations',
    description: 'Utterly alien beings from beyond the Material Plane.',
    creatureTypes: ['aberration'],
    benefits: [
      'Advantage on Wisdom (Survival) checks to track aberrations',
      'Advantage on Intelligence checks to recall information about aberrations'
    ],
    tags: ['alien', 'madness', 'otherworldly']
  },
  oozes: {
    id: 'oozes',
    name: 'Oozes',
    description: 'Gelatinous creatures that usually lack fixed form.',
    creatureTypes: ['ooze'],
    benefits: [
      'Advantage on Wisdom (Survival) checks to track oozes',
      'Advantage on Intelligence checks to recall information about oozes'
    ],
    tags: ['formless', 'corrosive', 'simple']
  }
}

// Ranger Natural Explorer terrain options
export const naturalExplorerTerrains: Record<string, NaturalExplorer> = {
  arctic: {
    id: 'arctic',
    name: 'Arctic',
    description: 'Frozen tundra, icy mountains, and glacial regions.',
    terrainType: 'arctic',
    benefits: [
      'Doubled proficiency bonus on Wisdom (Survival) checks in arctic terrain',
      'Difficult terrain doesn\'t slow party\'s travel in arctic',
      'Remain alert to danger while tracking, foraging, or navigating in arctic',
      'Can move stealthily at normal pace in arctic',
      'Can find food and water for up to 6 people daily in arctic'
    ],
    tags: ['cold', 'ice', 'tundra']
  },
  coast: {
    id: 'coast',
    name: 'Coast',
    description: 'Beaches, cliffs, coastal waters, and tidal pools.',
    terrainType: 'coast',
    benefits: [
      'Doubled proficiency bonus on Wisdom (Survival) checks in coastal terrain',
      'Difficult terrain doesn\'t slow party\'s travel on coasts',
      'Remain alert to danger while tracking, foraging, or navigating on coasts',
      'Can move stealthily at normal pace on coasts',
      'Can find food and water for up to 6 people daily on coasts'
    ],
    tags: ['water', 'sea', 'shore']
  },
  desert: {
    id: 'desert',
    name: 'Desert',
    description: 'Sand dunes, rocky badlands, and arid wastelands.',
    terrainType: 'desert',
    benefits: [
      'Doubled proficiency bonus on Wisdom (Survival) checks in desert terrain',
      'Difficult terrain doesn\'t slow party\'s travel in desert',
      'Remain alert to danger while tracking, foraging, or navigating in desert',
      'Can move stealthily at normal pace in desert',
      'Can find food and water for up to 6 people daily in desert'
    ],
    tags: ['hot', 'sand', 'arid']
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Deciduous and coniferous forests, woodlands, and jungles.',
    terrainType: 'forest',
    benefits: [
      'Doubled proficiency bonus on Wisdom (Survival) checks in forest terrain',
      'Difficult terrain doesn\'t slow party\'s travel in forest',
      'Remain alert to danger while tracking, foraging, or navigating in forest',
      'Can move stealthily at normal pace in forest',
      'Can find food and water for up to 6 people daily in forest'
    ],
    tags: ['trees', 'nature', 'wilderness']
  },
  grassland: {
    id: 'grassland',
    name: 'Grassland',
    description: 'Savannas, meadows, fields, and agricultural lands.',
    terrainType: 'grassland',
    benefits: [
      'Doubled proficiency bonus on Wisdom (Survival) checks in grassland terrain',
      'Difficult terrain doesn\'t slow party\'s travel in grassland',
      'Remain alert to danger while tracking, foraging, or navigating in grassland',
      'Can move stealthily at normal pace in grassland',
      'Can find food and water for up to 6 people daily in grassland'
    ],
    tags: ['open', 'plains', 'pastoral']
  },
  mountain: {
    id: 'mountain',
    name: 'Mountain',
    description: 'Tall peaks, rocky highlands, and hilly terrain.',
    terrainType: 'mountain',
    benefits: [
      'Doubled proficiency bonus on Wisdom (Survival) checks in mountain terrain',
      'Difficult terrain doesn\'t slow party\'s travel in mountains',
      'Remain alert to danger while tracking, foraging, or navigating in mountains',
      'Can move stealthily at normal pace in mountains',
      'Can find food and water for up to 6 people daily in mountains'
    ],
    tags: ['high', 'rocky', 'peaks']
  },
  swamp: {
    id: 'swamp',
    name: 'Swamp',
    description: 'Marshlands, bogs, bayous, and wetlands.',
    terrainType: 'swamp',
    benefits: [
      'Doubled proficiency bonus on Wisdom (Survival) checks in swamp terrain',
      'Difficult terrain doesn\'t slow party\'s travel in swamp',
      'Remain alert to danger while tracking, foraging, or navigating in swamp',
      'Can move stealthily at normal pace in swamp',
      'Can find food and water for up to 6 people daily in swamp'
    ],
    tags: ['wet', 'murky', 'dangerous']
  },
  underdark: {
    id: 'underdark',
    name: 'Underdark',
    description: 'Subterranean caves, tunnels, and underground realms.',
    terrainType: 'underdark',
    benefits: [
      'Doubled proficiency bonus on Wisdom (Survival) checks in the Underdark',
      'Difficult terrain doesn\'t slow party\'s travel in the Underdark',
      'Remain alert to danger while tracking, foraging, or navigating in the Underdark',
      'Can move stealthily at normal pace in the Underdark',
      'Can find food and water for up to 6 people daily in the Underdark'
    ],
    tags: ['underground', 'dark', 'caves']
  }
}

// Progression helpers
export function getFavoredEnemyProgression(level: number): number {
  if (level >= 14) return 2
  if (level >= 6) return 2
  if (level >= 1) return 1
  return 0
}

export function getNaturalExplorerProgression(level: number): number {
  if (level >= 10) return 2
  if (level >= 6) return 2
  if (level >= 1) return 1
  return 0
}

export function getRangerFeaturesAtLevel(level: number): { favoredEnemy: boolean; naturalExplorer: boolean } {
  return {
    favoredEnemy: level === 1 || level === 6 || level === 14,
    naturalExplorer: level === 1 || level === 6 || level === 10
  }
}