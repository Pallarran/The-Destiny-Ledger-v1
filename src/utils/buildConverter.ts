import type { BuildConfiguration, CanonicalBuild } from '../stores/types'

/**
 * Converts legacy BuildConfiguration to canonical Build format
 * This enables gradual migration toward the review document's recommended structure
 */
export function convertToCanonicalBuild(legacy: BuildConfiguration): CanonicalBuild {
  // Extract class path from level timeline
  const classPath: Array<{ cls: string; levels: number; subclass?: string }> = []
  const classLevels = new Map<string, { levels: number; subclass?: string }>()
  
  for (const entry of legacy.levelTimeline || []) {
    const existing = classLevels.get(entry.classId)
    if (existing) {
      existing.levels += 1
      if (entry.subclassId) {
        existing.subclass = entry.subclassId
      }
    } else {
      classLevels.set(entry.classId, {
        levels: 1,
        subclass: entry.subclassId
      })
    }
  }
  
  for (const [classId, info] of classLevels) {
    classPath.push({
      cls: classId,
      levels: info.levels,
      subclass: info.subclass
    })
  }
  
  // Extract abilities (including downtime training bonuses)
  const baseAbilities = {
    STR: legacy.abilityScores?.STR || 10,
    DEX: legacy.abilityScores?.DEX || 10,
    CON: legacy.abilityScores?.CON || 10,
    INT: legacy.abilityScores?.INT || 10,
    WIS: legacy.abilityScores?.WIS || 10,
    CHA: legacy.abilityScores?.CHA || 10
  }
  
  // Apply downtime training ability bonuses
  const abilities = { ...baseAbilities }
  if (legacy.downtimeTraining?.abilityTraining) {
    abilities.STR += legacy.downtimeTraining.abilityTraining.STR || 0
    abilities.DEX += legacy.downtimeTraining.abilityTraining.DEX || 0
    abilities.CON += legacy.downtimeTraining.abilityTraining.CON || 0
    abilities.INT += legacy.downtimeTraining.abilityTraining.INT || 0
    abilities.WIS += legacy.downtimeTraining.abilityTraining.WIS || 0
    abilities.CHA += legacy.downtimeTraining.abilityTraining.CHA || 0
  }
  
  // Extract features from level timeline
  const features = legacy.levelTimeline?.flatMap(entry => entry.features || []) || []
  
  // Extract maneuver choices from level timeline
  const maneuverChoices = legacy.levelTimeline?.flatMap(entry => entry.maneuverChoices || []) || []
  
  // Extract metamagic choices from level timeline
  const metamagicChoices = legacy.levelTimeline?.flatMap(entry => entry.metamagicChoices || []) || []
  
  // Extract eldritch invocation choices from level timeline
  const eldritchInvocationChoices = legacy.levelTimeline?.flatMap(entry => entry.eldritchInvocationChoices || []) || []
  
  // Extract feats from level timeline and downtime training
  const levelFeats = legacy.levelTimeline
    ?.filter(entry => entry.asiOrFeat === 'feat')
    .map(entry => entry.featId)
    .filter((feat): feat is string => Boolean(feat)) || []
  
  const downtimeFeats = legacy.downtimeTraining?.trainedFeats || []
  const feats = [...levelFeats, ...downtimeFeats]
  
  // Extract fighting styles from level timeline
  const fightingStyles = legacy.levelTimeline
    ?.map(entry => entry.fightingStyle)
    .filter((style): style is string => Boolean(style)) || []
  
  // Build equipment array
  const weapons: string[] = []
  if (legacy.mainHandWeapon) weapons.push(legacy.mainHandWeapon)
  if (legacy.offHandWeapon) weapons.push(legacy.offHandWeapon)
  if (legacy.rangedWeapon) weapons.push(legacy.rangedWeapon)
  
  // Map legacy buffs to canonical toggles
  const activeBuffsSet = new Set(legacy.activeBuffs || [])
  
  return {
    identity: {
      name: legacy.name,
      level: legacy.currentLevel,
      classPath
    },
    abilities,
    profs: {
      skills: [
        ...(legacy.skillProficiencies || []),
        ...(legacy.downtimeTraining?.trainedSkillProficiencies || [])
      ],
      saves: [], // TODO: Extract from class features
      expertise: [
        // Expertise from level timeline (rogue/bard class features)
        ...(legacy.levelTimeline?.flatMap(entry => entry.expertiseChoices || []) || []),
        // Expertise from downtime training
        ...(legacy.downtimeTraining?.trainedSkillExpertise || [])
      ]
    },
    features,
    feats,
    fightingStyles,
    maneuvers: maneuverChoices,
    metamagic: metamagicChoices,
    eldritchInvocations: eldritchInvocationChoices,
    spells: [], // TODO: Extract from build if spellcaster
    equipment: {
      weapons,
      armor: legacy.armor,
      shield: legacy.shield || false
    },
    resources: {
      // TODO: Extract from class features and level progression
    },
    toggles: {
      advantage: 'normal', // TODO: Map from current advantage state
      sharpshooter: activeBuffsSet.has('sharpshooter'),
      greatWeaponMaster: activeBuffsSet.has('great_weapon_master'),
      hex: activeBuffsSet.has('hex'),
      huntersMark: activeBuffsSet.has('hunters_mark'),
      bless: activeBuffsSet.has('bless'),
      faerieFire: activeBuffsSet.has('faerie_fire')
    }
  }
}

/**
 * Converts canonical Build back to legacy BuildConfiguration format
 * This ensures backward compatibility during migration
 */
export function convertToLegacyBuild(canonical: CanonicalBuild): Partial<BuildConfiguration> {
  // Build level timeline from class path
  const levelTimeline = []
  let currentLevel = 1
  
  for (const classEntry of canonical.identity.classPath) {
    for (let i = 0; i < classEntry.levels; i++) {
      levelTimeline.push({
        level: currentLevel++,
        classId: classEntry.cls,
        subclassId: classEntry.subclass,
        features: [], // TODO: Populate from canonical.features for this level
        asiOrFeat: undefined, // TODO: Determine from canonical.feats
        featId: undefined,
        maneuverChoices: [], // TODO: Distribute canonical.maneuvers to correct levels
        metamagicChoices: [], // TODO: Distribute canonical.metamagic to correct levels
        eldritchInvocationChoices: [] // TODO: Distribute canonical.eldritchInvocations to correct levels
      })
    }
  }
  
  // Convert abilities back to legacy format
  const abilityScores = {
    STR: canonical.abilities.STR,
    DEX: canonical.abilities.DEX,
    CON: canonical.abilities.CON,
    INT: canonical.abilities.INT,
    WIS: canonical.abilities.WIS,
    CHA: canonical.abilities.CHA
  }
  
  // Extract weapons
  const weapons = canonical.equipment.weapons
  const mainHandWeapon = weapons[0]
  const offHandWeapon = weapons[1]
  const rangedWeapon = weapons.find(w => w.includes('bow') || w.includes('crossbow'))
  
  // Convert toggles to active buffs
  const activeBuffs: string[] = []
  if (canonical.toggles.sharpshooter) activeBuffs.push('sharpshooter')
  if (canonical.toggles.greatWeaponMaster) activeBuffs.push('great_weapon_master')
  if (canonical.toggles.hex) activeBuffs.push('hex')
  if (canonical.toggles.huntersMark) activeBuffs.push('hunters_mark')
  if (canonical.toggles.bless) activeBuffs.push('bless')
  if (canonical.toggles.faerieFire) activeBuffs.push('faerie_fire')
  
  return {
    name: canonical.identity.name,
    currentLevel: canonical.identity.level,
    abilityScores: abilityScores as any,
    levelTimeline,
    mainHandWeapon,
    offHandWeapon,
    rangedWeapon,
    armor: canonical.equipment.armor,
    shield: canonical.equipment.shield,
    activeBuffs,
    skillProficiencies: canonical.profs.skills
  }
}

/**
 * Utility to check if a build configuration has canonical build data
 */
export function hasCanonicalBuild(build: BuildConfiguration): boolean {
  return !!build.canonicalBuild
}

/**
 * Gets the canonical build data, converting from legacy format if needed
 */
export function getCanonicalBuild(build: BuildConfiguration): CanonicalBuild {
  if (build.canonicalBuild) {
    return build.canonicalBuild
  }
  
  // Convert on-the-fly from legacy format
  return convertToCanonicalBuild(build)
}

/**
 * Updates a build configuration with canonical build data
 */
export function updateCanonicalBuild(
  build: BuildConfiguration,
  canonical: CanonicalBuild
): BuildConfiguration {
  return {
    ...build,
    canonicalBuild: canonical,
    updatedAt: new Date()
  }
}