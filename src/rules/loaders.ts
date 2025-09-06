import type { 
  ClassDefinition, 
  SubclassDefinition, 
  Feat, 
  Weapon, 
  WeaponEnhancement,
  Buff 
} from './types'
import type { Race } from './srd/races'
import type { Spell } from './srd/spells'
import type { MagicItem } from './types'

import { classes } from './srd/classes'
import { subclasses } from './srd/subclasses'
import { weapons, weaponEnhancements } from './srd/weapons'
import { feats } from './srd/feats'
import { races } from './srd/races'
import { buffs } from './srd/buffs'
import { allSpells } from './srd/spells'
import { magicItems } from './srd/magicItems'
import { getIntegratedHomebrewContent } from '../engine/homebrewLoader'

// Data loaders with homebrew integration
export const loadClasses = (): Record<string, ClassDefinition> => {
  const homebrewContent = getIntegratedHomebrewContent()
  const merged = { ...classes }
  
  // Add homebrew classes
  homebrewContent.classes.forEach(homebrewClass => {
    merged[homebrewClass.id] = homebrewClass
  })
  
  return merged
}

export const loadSubclasses = (): Record<string, SubclassDefinition> => {
  const homebrewContent = getIntegratedHomebrewContent()
  const merged = { ...subclasses as unknown as Record<string, SubclassDefinition> }
  
  // Add homebrew subclasses
  homebrewContent.subclasses.forEach(homebrewSubclass => {
    merged[homebrewSubclass.id] = homebrewSubclass
  })
  
  return merged
}

export const loadFeats = (): Record<string, Feat> => {
  const homebrewContent = getIntegratedHomebrewContent()
  const merged = { ...feats }
  
  // Add homebrew feats
  homebrewContent.feats.forEach(homebrewFeat => {
    merged[homebrewFeat.id] = homebrewFeat
  })
  
  return merged
}

export const loadWeapons = (): Record<string, Weapon> => {
  return weapons
}

export const loadWeaponEnhancements = (): Record<string, WeaponEnhancement> => {
  return weaponEnhancements
}

export const loadSpells = (): Record<string, Spell> => {
  const homebrewContent = getIntegratedHomebrewContent()
  const merged = { ...allSpells }
  
  // Add homebrew spells
  homebrewContent.spells.forEach(homebrewSpell => {
    merged[homebrewSpell.id] = homebrewSpell
  })
  
  return merged
}

export const loadMagicItems = (): Record<string, MagicItem> => {
  const homebrewContent = getIntegratedHomebrewContent()
  const merged = { ...magicItems }
  
  // Add homebrew magic items
  homebrewContent.magicItems.forEach(homebrewItem => {
    merged[homebrewItem.id] = homebrewItem
  })
  
  return merged
}

export const loadBuffs = (): Record<string, Buff> => {
  return buffs
}

export const loadRaces = (): Record<string, Race> => {
  return races
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

export const getSpell = (spellId: string): Spell | undefined => {
  return loadSpells()[spellId]
}

export const getMagicItem = (itemId: string): MagicItem | undefined => {
  return loadMagicItems()[itemId]
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

export const getAllRaces = (): Race[] => {
  return Object.values(loadRaces())
}

export const getAllSpells = (): Spell[] => {
  return Object.values(loadSpells())
}

export const getAllMagicItems = (): MagicItem[] => {
  return Object.values(loadMagicItems())
}

export const getRace = (raceId: string): Race | undefined => {
  return loadRaces()[raceId]
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