// DPR calculation worker using Comlink
import { expose } from 'comlink'
import { generateDPRCurves, buildToCombatState, getWeaponConfig } from '../engine/simulator'
import { calculateBuildDPR } from '../engine/calculations'
import type { BuildConfiguration, DPRConfiguration, DPRResult } from '../stores/types'
import type { SimulationConfig } from '../engine/types'

// Worker API exposed via Comlink
const dprWorkerAPI = {
  // Calculate DPR for a single AC value
  async calculateSingleDPR(
    build: BuildConfiguration,
    targetAC: number,
    config: Partial<DPRConfiguration> = {}
  ): Promise<{
    dpr: number
    hitChance: number
    critChance: number
    breakdown: {
      round1: number
      round2: number
      round3: number
      total: number
    }
  }> {
    try {
      const combatState = buildToCombatState(build)
      const weaponId = build.rangedWeapon || build.mainHandWeapon || 'longsword'
      const weaponConfig = getWeaponConfig(weaponId, build.weaponEnhancementBonus || 0, combatState)
      
      if (!weaponConfig) {
        throw new Error(`Invalid weapon: ${weaponId}`)
      }
      
      const simConfig: SimulationConfig = {
        targetAC,
        rounds: 3,
        round0Buffs: config.round0BuffsEnabled ?? true,
        greedyResourceUse: config.greedyResourceUse ?? true,
        autoGWMSS: config.autoGWMSS ?? true
      }
      
      const result = calculateBuildDPR(combatState, weaponConfig, simConfig)
      
      return {
        dpr: result.expectedDPR,
        hitChance: result.hitChance,
        critChance: result.critChance,
        breakdown: {
          round1: result.breakdown.round1,
          round2: result.breakdown.round2,
          round3: result.breakdown.round3,
          total: result.breakdown.total
        }
      }
    } catch (error) {
      throw new Error(`DPR calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },

  // Calculate full DPR curves across AC range
  async calculateDPRCurves(
    build: BuildConfiguration,
    config: DPRConfiguration
  ): Promise<DPRResult> {    
    try {
      const result = generateDPRCurves(build, config)
      return result
    } catch (error) {
      throw new Error(`DPR curve calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },

  // Calculate GWM/SS breakpoints for a range of AC values
  async calculatePowerAttackBreakpoints(
    build: BuildConfiguration,
    acMin: number = 10,
    acMax: number = 30
  ): Promise<{
    ac: number
    usesPowerAttack: boolean
    normalDamage: number
    powerAttackDamage: number
    description: string
  }[]> {
    try {
      const combatState = buildToCombatState(build)
      const weaponId = build.rangedWeapon || build.mainHandWeapon || 'longsword'
      const weaponConfig = getWeaponConfig(weaponId, build.weaponEnhancementBonus || 0, combatState)
      
      if (!weaponConfig) {
        throw new Error(`Invalid weapon: ${weaponId}`)
      }
      
      const breakpoints = []
      
      for (let ac = acMin; ac <= acMax; ac++) {
        // Calculate without power attack
        const normalConfig: SimulationConfig = {
          targetAC: ac,
          rounds: 3,
          round0Buffs: true,
          greedyResourceUse: true,
          autoGWMSS: false
        }
        const normalResult = calculateBuildDPR(combatState, weaponConfig, normalConfig)
        
        // Calculate optimal (with auto GWM/SS)
        const optimalConfig: SimulationConfig = {
          ...normalConfig,
          autoGWMSS: true
        }
        const optimalResult = calculateBuildDPR(combatState, weaponConfig, optimalConfig)
        
        const usesPowerAttack = optimalResult.shouldUsePowerAttack || false
        
        breakpoints.push({
          ac,
          usesPowerAttack,
          normalDamage: normalResult.expectedDPR,
          powerAttackDamage: optimalResult.expectedDPR,
          description: usesPowerAttack 
            ? `Use power attack (+${(optimalResult.expectedDPR - normalResult.expectedDPR).toFixed(1)} DPR)`
            : `Normal attacks better (+${(normalResult.expectedDPR - optimalResult.expectedDPR).toFixed(1)} DPR)`
        })
      }
      
      return breakpoints
    } catch (error) {
      throw new Error(`Breakpoint calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },

  // Compare multiple builds at a specific AC
  async compareBuildDPR(
    builds: BuildConfiguration[],
    targetAC: number,
    config: Partial<DPRConfiguration> = {}
  ): Promise<{
    buildId: string
    name: string
    dpr: number
    hitChance: number
    critChance: number
  }[]> {
    try {
      const results = []
      
      for (const build of builds) {
        const singleResult = await this.calculateSingleDPR(build, targetAC, config)
        results.push({
          buildId: build.id,
          name: build.name,
          dpr: singleResult.dpr,
          hitChance: singleResult.hitChance,
          critChance: singleResult.critChance
        })
      }
      
      return results.sort((a, b) => b.dpr - a.dpr) // Sort by DPR descending
    } catch (error) {
      throw new Error(`Build comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },

  // Performance test - calculate how long operations take
  async performanceTest(): Promise<{
    singleCalculationMs: number
    curveCalculationMs: number
    memoryUsage?: number
  }> {
    // Mock build for testing
    const testBuild: BuildConfiguration = {
      id: 'test-build',
      name: 'Performance Test Build',
      createdAt: new Date(),
      updatedAt: new Date(),
      race: 'human',
      abilityMethod: 'pointbuy',
      abilityScores: { STR: 16, DEX: 14, CON: 14, INT: 10, WIS: 12, CHA: 8 },
      pointBuyLimit: 27,
      levelTimeline: [
        { level: 1, classId: 'fighter', features: [] },
        { level: 2, classId: 'fighter', features: [] },
        { level: 3, classId: 'fighter', features: [] },
        { level: 4, classId: 'fighter', features: [], asiOrFeat: 'asi' },
        { level: 5, classId: 'fighter', features: [] }
      ],
      currentLevel: 5,
      mainHandWeapon: 'longsword',
      rangedWeapon: 'longbow',
      weaponEnhancements: [],
      weaponEnhancementBonus: 0,
      armorEnhancementBonus: 0,
      activeBuffs: [],
      round0Buffs: []
    }
    
    // Test single calculation
    const singleStart = performance.now()
    await this.calculateSingleDPR(testBuild, 15)
    const singleTime = performance.now() - singleStart
    
    // Test curve calculation
    const curveStart = performance.now()
    const curveConfig: DPRConfiguration = {
      buildId: testBuild.id,
      acMin: 10,
      acMax: 30,
      acStep: 1,
      advantageState: 'normal',
      round0BuffsEnabled: true,
      greedyResourceUse: true,
      autoGWMSS: true
    }
    await this.calculateDPRCurves(testBuild, curveConfig)
    const curveTime = performance.now() - curveStart
    
    return {
      singleCalculationMs: singleTime,
      curveCalculationMs: curveTime,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || undefined
    }
  }
}

// Expose the API to the main thread
expose(dprWorkerAPI)

export type DPRWorkerAPI = typeof dprWorkerAPI