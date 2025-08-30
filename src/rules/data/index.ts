import classesDataJson from './classes.json'
import subclassesDataJson from './subclasses.json'
import weaponsDataJson from './weapons.json'

// Re-export SRD data
export { weapons, weaponEnhancements } from '../srd/weapons'
export { armor, shields } from '../srd/armor'
export { buffs } from '../srd/buffs'
export { feats } from '../srd/feats'

export const classesData = Object.values(classesDataJson)
export const subclassesData = Object.values(subclassesDataJson)  
export const weaponsData = Object.values(weaponsDataJson)