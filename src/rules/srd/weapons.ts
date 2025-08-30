import type { Weapon, WeaponEnhancement } from '../types'

export const weapons: Record<string, Weapon> = {
  // Simple Melee Weapons
  club: {
    id: 'club',
    name: 'Club',
    type: 'simple',
    category: 'melee',
    damage: [{
      count: 1,
      die: 4,
      bonus: 0,
      type: 'bludgeoning'
    }],
    properties: ['light']
  },
  dagger: {
    id: 'dagger',
    name: 'Dagger',
    type: 'simple',
    category: 'melee',
    damage: [{
      count: 1,
      die: 4,
      bonus: 0,
      type: 'piercing'
    }],
    properties: ['finesse', 'light', 'thrown'],
    range: { normal: 20, long: 60 }
  },
  handaxe: {
    id: 'handaxe',
    name: 'Handaxe',
    type: 'simple',
    category: 'melee',
    damage: [{
      count: 1,
      die: 6,
      bonus: 0,
      type: 'slashing'
    }],
    properties: ['light', 'thrown'],
    range: { normal: 20, long: 60 }
  },
  javelin: {
    id: 'javelin',
    name: 'Javelin',
    type: 'simple',
    category: 'melee',
    damage: [{
      count: 1,
      die: 6,
      bonus: 0,
      type: 'piercing'
    }],
    properties: ['thrown'],
    range: { normal: 30, long: 120 }
  },
  mace: {
    id: 'mace',
    name: 'Mace',
    type: 'simple',
    category: 'melee',
    damage: [{
      count: 1,
      die: 6,
      bonus: 0,
      type: 'bludgeoning'
    }],
    properties: []
  },
  spear: {
    id: 'spear',
    name: 'Spear',
    type: 'simple',
    category: 'melee',
    damage: [{
      count: 1,
      die: 6,
      bonus: 0,
      type: 'piercing'
    }],
    properties: ['thrown', 'versatile'],
    range: { normal: 20, long: 60 },
    versatile: [{
      count: 1,
      die: 8,
      bonus: 0,
      type: 'piercing'
    }]
  },

  // Simple Ranged Weapons
  light_crossbow: {
    id: 'light_crossbow',
    name: 'Light Crossbow',
    type: 'simple',
    category: 'ranged',
    damage: [{
      count: 1,
      die: 8,
      bonus: 0,
      type: 'piercing'
    }],
    properties: ['ammunition', 'loading', 'two-handed'],
    range: { normal: 80, long: 320 }
  },
  shortbow: {
    id: 'shortbow',
    name: 'Shortbow',
    type: 'simple',
    category: 'ranged',
    damage: [{
      count: 1,
      die: 6,
      bonus: 0,
      type: 'piercing'
    }],
    properties: ['ammunition', 'two-handed'],
    range: { normal: 80, long: 320 }
  },

  // Martial Melee Weapons
  battleaxe: {
    id: 'battleaxe',
    name: 'Battleaxe',
    type: 'martial',
    category: 'melee',
    damage: [{
      count: 1,
      die: 8,
      bonus: 0,
      type: 'slashing'
    }],
    properties: ['versatile'],
    versatile: [{
      count: 1,
      die: 10,
      bonus: 0,
      type: 'slashing'
    }]
  },
  glaive: {
    id: 'glaive',
    name: 'Glaive',
    type: 'martial',
    category: 'melee',
    damage: [{
      count: 1,
      die: 10,
      bonus: 0,
      type: 'slashing'
    }],
    properties: ['heavy', 'reach', 'two-handed']
  },
  greataxe: {
    id: 'greataxe',
    name: 'Greataxe',
    type: 'martial',
    category: 'melee',
    damage: [{
      count: 1,
      die: 12,
      bonus: 0,
      type: 'slashing'
    }],
    properties: ['heavy', 'two-handed']
  },
  greatsword: {
    id: 'greatsword',
    name: 'Greatsword',
    type: 'martial',
    category: 'melee',
    damage: [{
      count: 2,
      die: 6,
      bonus: 0,
      type: 'slashing'
    }],
    properties: ['heavy', 'two-handed']
  },
  longsword: {
    id: 'longsword',
    name: 'Longsword',
    type: 'martial',
    category: 'melee',
    damage: [{
      count: 1,
      die: 8,
      bonus: 0,
      type: 'slashing'
    }],
    properties: ['versatile'],
    versatile: [{
      count: 1,
      die: 10,
      bonus: 0,
      type: 'slashing'
    }]
  },
  maul: {
    id: 'maul',
    name: 'Maul',
    type: 'martial',
    category: 'melee',
    damage: [{
      count: 2,
      die: 6,
      bonus: 0,
      type: 'bludgeoning'
    }],
    properties: ['heavy', 'two-handed']
  },
  rapier: {
    id: 'rapier',
    name: 'Rapier',
    type: 'martial',
    category: 'melee',
    damage: [{
      count: 1,
      die: 8,
      bonus: 0,
      type: 'piercing'
    }],
    properties: ['finesse']
  },
  scimitar: {
    id: 'scimitar',
    name: 'Scimitar',
    type: 'martial',
    category: 'melee',
    damage: [{
      count: 1,
      die: 6,
      bonus: 0,
      type: 'slashing'
    }],
    properties: ['finesse', 'light']
  },
  shortsword: {
    id: 'shortsword',
    name: 'Shortsword',
    type: 'martial',
    category: 'melee',
    damage: [{
      count: 1,
      die: 6,
      bonus: 0,
      type: 'piercing'
    }],
    properties: ['finesse', 'light']
  },

  // Martial Ranged Weapons
  heavy_crossbow: {
    id: 'heavy_crossbow',
    name: 'Heavy Crossbow',
    type: 'martial',
    category: 'ranged',
    damage: [{
      count: 1,
      die: 10,
      bonus: 0,
      type: 'piercing'
    }],
    properties: ['ammunition', 'heavy', 'loading', 'two-handed'],
    range: { normal: 100, long: 400 }
  },
  longbow: {
    id: 'longbow',
    name: 'Longbow',
    type: 'martial',
    category: 'ranged',
    damage: [{
      count: 1,
      die: 8,
      bonus: 0,
      type: 'piercing'
    }],
    properties: ['ammunition', 'heavy', 'two-handed'],
    range: { normal: 150, long: 600 }
  }
}

export const weaponEnhancements: Record<string, WeaponEnhancement> = {
  plus_1: {
    id: 'plus_1',
    name: '+1 Weapon',
    description: 'You have a +1 bonus to attack and damage rolls made with this magic weapon.',
    attackBonus: 1,
    damageBonus: 1
  },
  plus_2: {
    id: 'plus_2',
    name: '+2 Weapon',
    description: 'You have a +2 bonus to attack and damage rolls made with this magic weapon.',
    attackBonus: 2,
    damageBonus: 2
  },
  plus_3: {
    id: 'plus_3',
    name: '+3 Weapon',
    description: 'You have a +3 bonus to attack and damage rolls made with this magic weapon.',
    attackBonus: 3,
    damageBonus: 3
  },
  flametongue: {
    id: 'flametongue',
    name: 'Flametongue',
    description: 'While the sword is ablaze, it deals an extra 2d6 fire damage to any target it hits.',
    additionalDamage: [{
      count: 2,
      die: 6,
      bonus: 0,
      type: 'fire'
    }]
  },
  frost_brand: {
    id: 'frost_brand',
    name: 'Frost Brand',
    description: 'When you hit with an attack using this magic sword, the target takes an extra 1d6 cold damage.',
    additionalDamage: [{
      count: 1,
      die: 6,
      bonus: 0,
      type: 'cold'
    }]
  }
}