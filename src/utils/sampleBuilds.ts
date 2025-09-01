import type { BuildConfiguration } from '../stores/types'

export const sampleFighterBuild: BuildConfiguration = {
  id: 'sample-fighter-gwm',
  name: 'Sample Fighter (Great Weapon Master)',
  createdAt: new Date(),
  updatedAt: new Date(),
  race: 'human_variant',
  abilityMethod: 'pointbuy',
  abilityScores: {
    STR: 16,
    DEX: 14,
    CON: 15,
    INT: 10,
    WIS: 13,
    CHA: 8
  },
  pointBuyLimit: 27,
  levelTimeline: [
    { level: 1, classId: 'fighter', features: [], featId: 'great_weapon_master' },
    { level: 2, classId: 'fighter', features: [] },
    { level: 3, classId: 'fighter', features: [] },
    { level: 4, classId: 'fighter', features: [], asiOrFeat: 'asi' },
    { level: 5, classId: 'fighter', features: [] }
  ],
  currentLevel: 5,
  mainHandWeapon: 'greatsword',
  weaponEnhancements: [],
  weaponEnhancementBonus: 0,
  armorEnhancementBonus: 0,
  activeBuffs: [],
  round0Buffs: []
}

export const sampleRogueBuild: BuildConfiguration = {
  id: 'sample-rogue-ss',
  name: 'Sample Rogue (Sharpshooter)',
  createdAt: new Date(),
  updatedAt: new Date(),
  race: 'human_variant', 
  abilityMethod: 'pointbuy',
  abilityScores: {
    STR: 8,
    DEX: 16,
    CON: 14,
    INT: 12,
    WIS: 13,
    CHA: 10
  },
  pointBuyLimit: 27,
  levelTimeline: [
    { level: 1, classId: 'rogue', features: [], featId: 'sharpshooter' },
    { level: 2, classId: 'rogue', features: [] },
    { level: 3, classId: 'rogue', features: [] },
    { level: 4, classId: 'rogue', features: [], asiOrFeat: 'asi' }
  ],
  currentLevel: 4,
  mainHandWeapon: 'shortsword',
  rangedWeapon: 'longbow',
  weaponEnhancements: [],
  weaponEnhancementBonus: 0,
  armorEnhancementBonus: 0,
  activeBuffs: [],
  round0Buffs: []
}

export const sampleBuilds = {
  fighter: sampleFighterBuild,
  rogue: sampleRogueBuild
}