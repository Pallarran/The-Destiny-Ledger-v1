import { calculateBuildDPR } from './calculations'
import type { CombatState, SimulationConfig, WeaponConfig } from './types'
import type { BuildConfiguration, DPRConfiguration, DPRResult } from '../stores/types'
import { getClass, getFeat, getWeapon, getBuff } from '../rules/loaders'

// Convert a build configuration to combat state
export function buildToCombatState(build: BuildConfiguration, level?: number): CombatState {
  const targetLevel = level || build.currentLevel
  
  // Calculate proficiency bonus
  const proficiencyBonus = Math.ceil(targetLevel / 4) + 1
  
  // Get primary ability modifier (simplified - would need more logic for finesse weapons, etc.)
  const primaryAbility = Math.max(build.abilityScores.STR, build.abilityScores.DEX)
  const abilityModifier = Math.floor((primaryAbility - 10) / 2)
  
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
  
  // Process level timeline
  for (const entry of build.levelTimeline) {
    if (entry.level > targetLevel) break
    
    // Check for Extra Attack
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
        } else if (feature.rulesKey === 'sneak_attack') {
          // Calculate sneak attack dice based on rogue level
          const rogueLevels = build.levelTimeline.filter(e => 
            e.classId === 'rogue' && e.level <= targetLevel
          ).length
          state.sneakAttackDice = Math.ceil(rogueLevels / 2)
        }
      }
      
      // Check for fighting styles
      if (entry.classId === 'fighter' && entry.level >= 1) {
        // Would need to track which fighting style was chosen
        // For now, assume archery if using ranged weapon
        if (build.rangedWeapon) {
          state.fightingStyles.push('archery')
        } else if (build.mainHandWeapon && !build.offHandWeapon) {
          state.fightingStyles.push('dueling')
        }
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
  
  // Process active buffs
  for (const buffId of build.activeBuffs) {
    const buff = getBuff(buffId)
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
      
      // Set specific buff flags
      if (buff.id === 'bless') state.hasBless = true
      if (buff.id === 'haste') state.hasHaste = true
      if (buff.id === 'hunters_mark') state.hasHuntersMark = true
      if (buff.id === 'hex') state.hasHex = true
      if (buff.id === 'elemental_weapon') state.hasElementalWeapon = true
    }
  }
  
  return state
}

// Convert weapon ID to weapon config
export function getWeaponConfig(weaponId: string, enhancement: number = 0): WeaponConfig | null {
  const weapon = getWeapon(weaponId)
  if (!weapon) return null
  
  return {
    baseDamage: {
      count: weapon.damage[0].count,
      die: weapon.damage[0].die,
      rerollOnes: false,
      rerollTwos: false
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
  const weaponConfig = getWeaponConfig(weaponId, 0) // TODO: Handle weapon enhancements
  
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
  
  // Calculate totals and averages
  const totalDPR = normalCurve.reduce((sum, point) => sum + point.dpr, 0)
  const averageDPR = totalDPR / normalCurve.length
  
  // Get breakdown for AC 15 (typical)
  const typicalAC = 15
  const typicalConfig: SimulationConfig = {
    targetAC: typicalAC,
    rounds: 3,
    round0Buffs: config.round0BuffsEnabled,
    greedyResourceUse: config.greedyResourceUse,
    autoGWMSS: config.autoGWMSS
  }
  const typicalResult = calculateBuildDPR(combatState, weaponConfig, typicalConfig)
  
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