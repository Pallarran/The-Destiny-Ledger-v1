import type { 
  ClassDefinition, 
  SubclassDefinition, 
  Feat, 
  Weapon, 
  WeaponEnhancement,
  Buff 
} from './types'

import { classes } from './srd/classes'
import { weapons, weaponEnhancements } from './srd/weapons'
import { feats } from './srd/feats'

// Data loaders with proper typing
export const loadClasses = (): Record<string, ClassDefinition> => {
  return classes
}

export const loadSubclasses = (): Record<string, SubclassDefinition> => {
  // TODO: Add subclass data
  return {}
}

export const loadFeats = (): Record<string, Feat> => {
  return feats
}

export const loadWeapons = (): Record<string, Weapon> => {
  return weapons
}

export const loadWeaponEnhancements = (): Record<string, WeaponEnhancement> => {
  return weaponEnhancements
}

export const loadBuffs = (): Record<string, Buff> => {
  // TODO: Add buff data
  return {}
}

// Convenience functions
export const getClass = (classId: string): ClassDefinition | undefined => {
  return loadClasses()[classId]
}

export const getSubclass = (subclassId: string): SubclassDefinition | undefined => {
  return loadSubclasses()[subclassId]
}

export const getFeat = (featId: string): Feat | undefined => {
  return loadFeats()[featId]
}

export const getWeapon = (weaponId: string): Weapon | undefined => {
  return loadWeapons()[weaponId]
}

export const getBuff = (buffId: string): Buff | undefined => {
  return loadBuffs()[buffId]
}

export const getWeaponEnhancement = (enhancementId: string): WeaponEnhancement | undefined => {
  return loadWeaponEnhancements()[enhancementId]
}

// Get all items of a type as arrays
export const getAllClasses = (): ClassDefinition[] => {
  return Object.values(loadClasses())
}

export const getAllSubclasses = (): SubclassDefinition[] => {
  return Object.values(loadSubclasses())
}

export const getAllFeats = (): Feat[] => {
  return Object.values(loadFeats())
}

export const getAllWeapons = (): Weapon[] => {
  return Object.values(loadWeapons())
}

export const getAllWeaponEnhancements = (): WeaponEnhancement[] => {
  return Object.values(loadWeaponEnhancements())
}

export const getAllBuffs = (): Buff[] => {
  return Object.values(loadBuffs())
}

// Filtered getters
export const getSubclassesForClass = (classId: string): SubclassDefinition[] => {
  return getAllSubclasses().filter(subclass => subclass.parentClass === classId)
}

export const getMeleeWeapons = (): Weapon[] => {
  return getAllWeapons().filter(weapon => weapon.category === 'melee')
}

export const getRangedWeapons = (): Weapon[] => {
  return getAllWeapons().filter(weapon => weapon.category === 'ranged')
}

export const getConcentrationBuffs = (): Buff[] => {
  return getAllBuffs().filter(buff => buff.concentration)
}

export const getRound0Buffs = (): Buff[] => {
  return getAllBuffs().filter(buff => buff.allowedRound0)
}