import type { 
  ClassDefinition, 
  SubclassDefinition, 
  Feat, 
  Weapon, 
  Buff 
} from './types'

import classesData from './data/classes.json'
import subclassesData from './data/subclasses.json' 
import featsData from './data/feats.json'
import weaponsData from './data/weapons.json'
import buffsData from './data/buffs.json'

// Data loaders with proper typing
export const loadClasses = (): Record<string, ClassDefinition> => {
  return classesData as Record<string, ClassDefinition>
}

export const loadSubclasses = (): Record<string, SubclassDefinition> => {
  return subclassesData as Record<string, SubclassDefinition>
}

export const loadFeats = (): Record<string, Feat> => {
  return featsData as Record<string, Feat>
}

export const loadWeapons = (): Record<string, Weapon> => {
  return weaponsData as Record<string, Weapon>
}

export const loadBuffs = (): Record<string, Buff> => {
  return buffsData as Record<string, Buff>
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