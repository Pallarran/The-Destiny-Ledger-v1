import { calculateBuildDPR } from './calculations'
import type { CombatState, SimulationConfig, WeaponConfig } from './types'
import type { BuildConfiguration, DPRConfiguration, DPRResult } from '../stores/types'
import { getClass, getFeat } from '../rules/loaders'
import { weapons } from '../rules/srd/weapons'
import { buffs } from '../rules/srd/buffs'

// Convert a build configuration to combat state
export function buildToCombatState(build: BuildConfiguration, level?: number): CombatState {
  const targetLevel = level || Math.max(...(build.levelTimeline?.map(l => l.level) || [1]), 1)
  
  // Calculate proficiency bonus
  const proficiencyBonus = Math.ceil(targetLevel / 4) + 1
  
  // Determine which weapon to use and get ability modifier
  const weaponId = build.rangedWeapon || build.mainHandWeapon
  let abilityModifier = Math.floor((build.abilityScores.STR - 10) / 2) // Default STR
  
  if (weaponId) {
    const weapon = weapons[weaponId]
    if (weapon) {
      // Check if weapon has finesse property or is ranged
      if (weapon.properties.includes('finesse') || weapon.category === 'ranged') {
        const strMod = Math.floor((build.abilityScores.STR - 10) / 2)
        const dexMod = Math.floor((build.abilityScores.DEX - 10) / 2)
        // Use higher of STR or DEX for finesse, DEX for ranged
        abilityModifier = weapon.category === 'ranged' ? dexMod : Math.max(strMod, dexMod)
      }
    }
  } else {
    // No weapon selected, use best of STR/DEX
    const strMod = Math.floor((build.abilityScores.STR - 10) / 2)
    const dexMod = Math.floor((build.abilityScores.DEX - 10) / 2)
    abilityModifier = Math.max(strMod, dexMod)
  }
  
  // Initialize combat state
  const state: CombatState = {
    proficiencyBonus,
    abilityModifier,
    attackBonuses: [],
    damageBonuses: [],
    extraAttacks: 0,
    actionSurge: false,
    sneakAttackDice: 0,
    fightingStyles: [],
    hasGWM: false,
    hasSharpshooter: false,
    hasCrossbowExpert: false,
    hasPolearmMaster: false,
    hasAdvantage: false,
    hasDisadvantage: false,
    hasBless: false,
    hasHaste: false,
    hasHuntersMark: false,
    hasHex: false,
    hasElementalWeapon: false
  }
  
  // Calculate class levels first
  const classLevels = new Map<string, number>()
  for (const entry of build.levelTimeline) {
    if (entry.level > targetLevel) break
    classLevels.set(entry.classId, (classLevels.get(entry.classId) || 0) + 1)
  }
  
  // Set sneak attack based on rogue levels
  const rogueLevel = classLevels.get('rogue') || 0
  state.sneakAttackDice = Math.ceil(rogueLevel / 2)
  
  // Process level timeline for features and fighting styles
  for (const entry of build.levelTimeline) {
    if (entry.level > targetLevel) break
    
    // Check for class features
    const classData = getClass(entry.classId)
    if (classData) {
      const features = classData.features[entry.level] || []
      for (const feature of features) {
        if (feature.rulesKey === 'extra_attack') {
          state.extraAttacks = 1
        } else if (feature.rulesKey === 'extra_attack_2') {
          state.extraAttacks = 2
        } else if (feature.rulesKey === 'extra_attack_3') {
          state.extraAttacks = 3
        } else if (feature.rulesKey === 'action_surge') {
          state.actionSurge = true
        }
      }
      
      // Check for fighting styles from actual build data
      if (entry.fightingStyle) {
        state.fightingStyles.push(entry.fightingStyle as any)
      }
    }
    
    // Check for feats
    if (entry.featId) {
      const feat = getFeat(entry.featId)
      if (feat) {
        if (feat.id === 'great_weapon_master') state.hasGWM = true
        if (feat.id === 'sharpshooter') state.hasSharpshooter = true
        if (feat.id === 'crossbow_expert') state.hasCrossbowExpert = true
        if (feat.id === 'polearm_master') state.hasPolearmMaster = true
      }
    }
  }
  
  // Process active buffs from our SRD data
  const allActiveBuffs = [...(build.activeBuffs || []), ...(build.round0Buffs || [])]
  for (const buffId of allActiveBuffs) {
    const buff = buffs[buffId]
    if (buff) {
      if (buff.effects.attackBonus) {
        state.attackBonuses.push(buff.effects.attackBonus)
      }
      if (buff.effects.damageBonus) {
        state.damageBonuses.push(buff.effects.damageBonus)
      }
      if (buff.effects.advantage) {
        state.hasAdvantage = true
      }
      if (buff.effects.additionalAttacks) {
        state.extraAttacks += buff.effects.additionalAttacks
      }
      
      // Set specific buff flags for mechanics
      if (buff.id === 'bless') state.hasBless = true
      if (buff.id === 'haste') state.hasHaste = true
      if (buff.id === 'hunters_mark') state.hasHuntersMark = true
      if (buff.id === 'hex') state.hasHex = true
      if (buff.id === 'elemental_weapon') state.hasElementalWeapon = true
      if (buff.id === 'barbarian_rage') {
        // Rage only applies to STR-based melee attacks
        if (weaponId && weapons[weaponId]?.category === 'melee' && !weapons[weaponId]?.properties.includes('finesse')) {
          state.damageBonuses.push(2) // Rage damage
        }
      }
      
      // Add on-hit damage (Hunter's Mark, Hex, etc.)
      if (buff.effects.onHitDamage && buff.effects.onHitDamage.length > 0) {
        const onHitDamage = buff.effects.onHitDamage[0]
        // Convert to expected damage value
        const expectedDamage = onHitDamage.count * (onHitDamage.die + 1) / 2 + onHitDamage.bonus
        state.damageBonuses.push(expectedDamage)
      }
    }
  }
  
  // Apply weapon training bonuses
  if (build.downtimeTraining?.weaponTraining && weaponId) {
    const weapon = weapons[weaponId]
    if (weapon && build.downtimeTraining.weaponTraining[weaponId]) {
      const weaponTraining = build.downtimeTraining.weaponTraining[weaponId]
      if (weaponTraining.attackBonus > 0) {
        state.attackBonuses.push(weaponTraining.attackBonus)
      }
      if (weaponTraining.damageBonus > 0) {
        state.damageBonuses.push(weaponTraining.damageBonus)
      }
    }
  }
  
  return state
}

// Convert weapon ID to weapon config
export function getWeaponConfig(weaponId: string, enhancement: number = 0, combatState?: CombatState): WeaponConfig | null {
  const weapon = weapons[weaponId]
  if (!weapon) return null
  
  // Check if weapon has Great Weapon Fighting style applicable
  const isHeavyTwoHanded = weapon.properties.includes('heavy') && weapon.properties.includes('two-handed')
  const hasGWF = combatState?.fightingStyles.includes('gwf') || false
  
  return {
    baseDamage: {
      count: weapon.damage[0].count,
      die: weapon.damage[0].die,
      rerollOnes: hasGWF && isHeavyTwoHanded,
      rerollTwos: hasGWF && isHeavyTwoHanded
    },
    properties: weapon.properties as any[],
    damageType: weapon.damage[0].type as any,
    enhancement
  }
}

// Generate DPR curves across AC range
export function generateDPRCurves(
  build: BuildConfiguration,
  config: DPRConfiguration
): DPRResult {
  const combatState = buildToCombatState(build)
  
  // Determine which weapon to use
  const weaponId = build.rangedWeapon || build.mainHandWeapon || 'longsword'
  const weaponConfig = getWeaponConfig(weaponId, build.weaponEnhancementBonus || 0, combatState)
  
  if (!weaponConfig) {
    throw new Error(`Invalid weapon: ${weaponId}`)
  }
  
  // Generate curves for each advantage state
  const normalCurve: Array<{ ac: number; dpr: number }> = []
  const advantageCurve: Array<{ ac: number; dpr: number }> = []
  const disadvantageCurve: Array<{ ac: number; dpr: number }> = []
  const gwmSSBreakpoints: Array<{
    ac: number
    useGWMSS: boolean
    withPowerAttack: number
    withoutPowerAttack: number
  }> = []
  
  // Calculate for each AC value
  for (let ac = config.acMin; ac <= config.acMax; ac += config.acStep) {
    const simConfig: SimulationConfig = {
      targetAC: ac,
      rounds: 3,
      round0Buffs: config.round0BuffsEnabled,
      greedyResourceUse: config.greedyResourceUse,
      autoGWMSS: config.autoGWMSS
    }
    
    // Normal
    const normalResult = calculateBuildDPR(combatState, weaponConfig, simConfig)
    normalCurve.push({ ac, dpr: normalResult.expectedDPR })
    
    // Advantage
    const advState = { ...combatState, hasAdvantage: true, hasDisadvantage: false }
    const advResult = calculateBuildDPR(advState, weaponConfig, simConfig)
    advantageCurve.push({ ac, dpr: advResult.expectedDPR })
    
    // Disadvantage
    const disState = { ...combatState, hasAdvantage: false, hasDisadvantage: true }
    const disResult = calculateBuildDPR(disState, weaponConfig, simConfig)
    disadvantageCurve.push({ ac, dpr: disResult.expectedDPR })
    
    // GWM/SS breakpoints
    if (combatState.hasGWM || combatState.hasSharpshooter) {
      // Calculate with and without power attack
      const withoutPA = calculateBuildDPR(
        combatState,
        weaponConfig,
        { ...simConfig, autoGWMSS: false }
      )
      
      const withPA = calculateBuildDPR(
        combatState,
        weaponConfig,
        { ...simConfig, autoGWMSS: true }
      )
      
      gwmSSBreakpoints.push({
        ac,
        useGWMSS: normalResult.shouldUsePowerAttack || false,
        withPowerAttack: withPA.expectedDPR,
        withoutPowerAttack: withoutPA.expectedDPR
      })
    }
  }
  
  // Get breakdown for AC 15 (typical) for summary stats
  const typicalAC = 15
  const typicalConfig: SimulationConfig = {
    targetAC: typicalAC,
    rounds: 3,
    round0Buffs: config.round0BuffsEnabled,
    greedyResourceUse: config.greedyResourceUse,
    autoGWMSS: config.autoGWMSS
  }
  const typicalResult = calculateBuildDPR(combatState, weaponConfig, typicalConfig)
  
  // Use breakdown from AC 15 for summary stats
  const totalDPR = typicalResult.breakdown.total
  const averageDPR = typicalResult.breakdown.average
  
  return {
    buildId: build.id,
    config,
    timestamp: new Date(),
    totalDPR,
    averageDPR,
    roundBreakdown: [
      typicalResult.breakdown.round1,
      typicalResult.breakdown.round2,
      typicalResult.breakdown.round3
    ],
    normalCurve,
    advantageCurve,
    disadvantageCurve,
    gwmSSBreakpoints
  }
}