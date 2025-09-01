import type { AbilityScoreArray } from '../rules/types'
import type { BuildConfiguration, LevelEntry } from '../stores/types'
import { generateDPRCurves } from './simulator'
import { createDPRConfig } from '../stores/dprStore'
import { getClass } from '../rules/loaders'

// Path optimization types
export interface PathConstraints {
  maxClasses: number
  mustHitMilestones: Milestone[]
  roleTargets: RoleTarget[]
  allowedClasses: string[]
  forbiddenCombos: string[][]
}

export interface Milestone {
  id: string
  name: string
  description: string
  deadlineLevel: number
  checkFunction: (path: LevelPath, level: number) => boolean
}

export interface RoleTarget {
  role: 'social' | 'control' | 'exploration' | 'defense' | 'support' | 'mobility'
  targetLevel: number
  minimumScore: number
}

export interface LevelPath {
  id: string
  name: string
  levels: LevelEntry[]
  totalLevels: number
  classBreakdown: Record<string, number>
  finalDPR: number
  averageDPR: number
  milestones: MilestoneResult[]
  dprProgression: number[]
  score: number
}

export interface MilestoneResult {
  milestone: Milestone
  achieved: boolean
  levelAchieved?: number
  description: string
}

export interface OptimizationConfig {
  objective: 'l20_dpr' | 'tier_average' | 'custom'
  constraints: PathConstraints
  beamWidth: number
  maxPaths: number
  baseAbilityScores: AbilityScoreArray
  race: string
  background?: string
}

// Predefined milestones
export const COMMON_MILESTONES: Record<string, Milestone> = {
  extra_attack: {
    id: 'extra_attack',
    name: 'Extra Attack',
    description: 'Gain Extra Attack feature',
    deadlineLevel: 5,
    checkFunction: (path, level) => {
      const levelEntry = path.levels.find(l => l.level === level)
      if (!levelEntry) return false
      
      const classData = getClass(levelEntry.classId)
      if (!classData) return false
      
      // Check if this class level grants Extra Attack
      const features = classData.features[level - (path.classBreakdown[levelEntry.classId] || 0) + 1] || []
      return features.some(f => f.rulesKey === 'extra_attack')
    }
  },
  sneak_attack_2d6: {
    id: 'sneak_attack_2d6',
    name: 'Sneak Attack +2d6',
    description: 'Have at least 3 rogue levels (2d6 sneak attack)',
    deadlineLevel: 8,
    checkFunction: (path, level) => {
      const levelsToCheck = path.levels.filter(l => l.level <= level)
      const rogueLevels = levelsToCheck.filter(l => l.classId === 'rogue').length
      return rogueLevels >= 3
    }
  },
  spellcasting_3rd: {
    id: 'spellcasting_3rd',
    name: '3rd Level Spells',
    description: 'Access to 3rd level spells',
    deadlineLevel: 10,
    checkFunction: (path, level) => {
      const levelsToCheck = path.levels.filter(l => l.level <= level)
      const fullCasterLevels = levelsToCheck.filter(l => 
        ['wizard', 'cleric', 'druid', 'sorcerer', 'bard', 'warlock'].includes(l.classId)
      ).length
      return fullCasterLevels >= 5
    }
  }
}

// Core optimization engine
export class PathOptimizer {
  private config: OptimizationConfig
  private memo: Map<string, number> = new Map()

  constructor(config: OptimizationConfig) {
    this.config = config
  }

  // Main optimization method using beam search
  async optimizePaths(): Promise<LevelPath[]> {
    console.log('Starting path optimization with config:', this.config)
    
    // Initialize with level 1 options for each allowed class
    let currentBeam: Partial<LevelPath>[] = this.config.constraints.allowedClasses.map(classId => ({
      id: `${classId}_1`,
      name: `${classId.charAt(0).toUpperCase() + classId.slice(1)} Path`,
      levels: [{
        level: 1,
        classId,
        features: [],
        asiOrFeat: undefined
      }],
      totalLevels: 1,
      classBreakdown: { [classId]: 1 },
      milestones: [],
      dprProgression: [0], // Will be calculated later
      score: 0
    }))

    // Beam search for levels 2-20
    for (let level = 2; level <= 20; level++) {
      console.log(`Optimizing level ${level}, beam size: ${currentBeam.length}`)
      
      const nextBeam: Partial<LevelPath>[] = []
      
      for (const path of currentBeam) {
        const expansions = await this.expandPath(path, level)
        nextBeam.push(...expansions)
      }
      
      // Evaluate and prune to beam width
      const evaluatedBeam = await Promise.all(
        nextBeam.map(async (path) => ({
          ...path,
          score: await this.evaluatePath(path, level)
        }))
      )
      
      // Filter out paths that violate constraints
      const validPaths = evaluatedBeam.filter(path => 
        this.satisfiesConstraints(path, level)
      )
      
      // Sort by score and keep top beamWidth
      currentBeam = validPaths
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, this.config.beamWidth)
    }

    // Calculate final results for top paths
    const finalPaths: LevelPath[] = []
    const topPaths = currentBeam.slice(0, this.config.maxPaths)
    
    for (const partialPath of topPaths) {
      const completePath = await this.finalizePath(partialPath)
      if (completePath) {
        finalPaths.push(completePath)
      }
    }

    console.log(`Optimization complete. Found ${finalPaths.length} paths`)
    return finalPaths.sort((a, b) => b.finalDPR - a.finalDPR)
  }

  // Expand a path by adding one level
  private async expandPath(path: Partial<LevelPath>, nextLevel: number): Promise<Partial<LevelPath>[]> {
    if (!path.levels || !path.classBreakdown) return []
    
    const expansions: Partial<LevelPath>[] = []
    
    // Try continuing each existing class
    for (const classId of Object.keys(path.classBreakdown)) {
      if (this.canAddClass(path, classId, nextLevel)) {
        expansions.push(this.createExpansion(path, classId, nextLevel))
      }
    }
    
    // Try adding new classes if under the limit
    const currentClassCount = Object.keys(path.classBreakdown).length
    if (currentClassCount < this.config.constraints.maxClasses) {
      for (const classId of this.config.constraints.allowedClasses) {
        if (!path.classBreakdown[classId] && this.canAddClass(path, classId, nextLevel)) {
          expansions.push(this.createExpansion(path, classId, nextLevel))
        }
      }
    }
    
    return expansions
  }

  // Create a new path expansion
  private createExpansion(path: Partial<LevelPath>, classId: string, level: number): Partial<LevelPath> {
    if (!path.levels || !path.classBreakdown) {
      throw new Error('Invalid path structure')
    }

    const newLevels = [...path.levels, {
      level,
      classId,
      features: [],
      asiOrFeat: this.shouldTakeFeat(path, classId, level) ? 'feat' as const : 'asi' as const
    }]
    
    const newClassBreakdown = {
      ...path.classBreakdown,
      [classId]: (path.classBreakdown[classId] || 0) + 1
    }
    
    return {
      ...path,
      id: `${Object.keys(newClassBreakdown).join('_')}_${level}`,
      levels: newLevels,
      totalLevels: level,
      classBreakdown: newClassBreakdown
    }
  }

  // Check if we can add a level in this class
  private canAddClass(path: Partial<LevelPath>, classId: string, _level: number): boolean {
    // Check forbidden combinations
    const currentClasses = Object.keys(path.classBreakdown || {})
    for (const forbidden of this.config.constraints.forbiddenCombos) {
      if (forbidden.includes(classId) && forbidden.some(c => currentClasses.includes(c))) {
        return false
      }
    }
    
    return true
  }

  // Determine if this level should take a feat vs ASI
  private shouldTakeFeat(path: Partial<LevelPath>, classId: string, _level: number): boolean {
    // Simple heuristic: take key feats at strategic levels
    const totalLevel = path.totalLevels || 1
    
    // Take GWM/SS at level 4 or 6 for martial classes
    if ((totalLevel === 4 || totalLevel === 6) && 
        ['fighter', 'ranger', 'paladin', 'barbarian'].includes(classId)) {
      return true
    }
    
    // Otherwise prefer ASI for now
    return false
  }

  // Evaluate a path's quality
  private async evaluatePath(path: Partial<LevelPath>, currentLevel: number): Promise<number> {
    if (!path.levels) return 0
    
    const pathKey = this.getPathKey(path, currentLevel)
    if (this.memo.has(pathKey)) {
      return this.memo.get(pathKey)!
    }
    
    let score = 0
    
    // Build a temporary BuildConfiguration for DPR calculation
    const tempBuild = this.pathToBuildConfig(path, currentLevel)
    if (!tempBuild) return 0
    
    try {
      // Calculate DPR at this level (simplified for optimization speed)
      const quickDPR = await this.calculateQuickDPR(tempBuild)
      
      if (this.config.objective === 'l20_dpr') {
        // Project final DPR based on current level
        score = quickDPR * (20 / currentLevel)
      } else if (this.config.objective === 'tier_average') {
        // Weight current DPR by tier importance
        const tier = Math.ceil(currentLevel / 5)
        score = quickDPR * tier
      }
      
      // Penalty for not hitting milestones on time
      const missedMilestones = this.config.constraints.mustHitMilestones.filter(m => 
        currentLevel >= m.deadlineLevel && !m.checkFunction(path as LevelPath, currentLevel)
      )
      score -= missedMilestones.length * 50
      
    } catch (error) {
      console.warn('Error evaluating path:', error)
      score = 0
    }
    
    this.memo.set(pathKey, score)
    return score
  }

  // Check if path satisfies constraints
  private satisfiesConstraints(path: Partial<LevelPath>, level: number): boolean {
    if (!path.classBreakdown) return false
    
    // Check class limit
    if (Object.keys(path.classBreakdown).length > this.config.constraints.maxClasses) {
      return false
    }
    
    // Check mandatory milestones
    for (const milestone of this.config.constraints.mustHitMilestones) {
      if (level >= milestone.deadlineLevel) {
        if (!milestone.checkFunction(path as LevelPath, level)) {
          return false
        }
      }
    }
    
    return true
  }

  // Convert path to BuildConfiguration for DPR calculation
  private pathToBuildConfig(path: Partial<LevelPath>, level: number): BuildConfiguration | null {
    if (!path.levels) return null
    
    return {
      id: path.id || 'temp',
      name: path.name || 'Temp Path',
      createdAt: new Date(),
      updatedAt: new Date(),
      race: this.config.race,
      background: this.config.background,
      abilityMethod: 'manual' as const,
      abilityScores: this.config.baseAbilityScores,
      pointBuyLimit: 27,
      levelTimeline: path.levels.filter(l => l.level <= level),
      currentLevel: level,
      weaponEnhancements: [],
      weaponEnhancementBonus: 0,
      armorEnhancementBonus: 0,
      activeBuffs: [],
      round0Buffs: []
    }
  }

  // Quick DPR calculation for optimization
  private async calculateQuickDPR(build: BuildConfiguration): Promise<number> {
    try {
      // Use a simplified DPR calculation for speed
      // Target AC 15 (typical), normal conditions
      const level = build.currentLevel
      const strMod = Math.floor((build.abilityScores.STR - 10) / 2)
      const dexMod = Math.floor((build.abilityScores.DEX - 10) / 2)
      const profBonus = Math.ceil(level / 4) + 1
      
      // Estimate attacks and damage
      let attacks = 1
      let damagePerAttack = 8 + Math.max(strMod, dexMod)
      
      // Account for Extra Attack
      const hasExtraAttack = build.levelTimeline.some(entry => {
        const classData = getClass(entry.classId)
        if (!classData) return false
        
        const classLevel = build.levelTimeline.filter(l => l.classId === entry.classId && l.level <= entry.level).length
        const features = classData.features[classLevel] || []
        return features.some(f => f.rulesKey === 'extra_attack')
      })
      
      if (hasExtraAttack) attacks = 2
      if (level >= 11) attacks = Math.min(3, attacks + 1) // Some classes get more
      
      // Estimate hit chance against AC 15
      const attackBonus = Math.max(strMod, dexMod) + profBonus
      const hitChance = Math.max(0.05, Math.min(0.95, (21 + attackBonus - 15) / 20))
      
      return attacks * hitChance * damagePerAttack
    } catch (error) {
      console.warn('Quick DPR calculation failed:', error)
      return 0
    }
  }

  // Finalize a path with complete calculations
  private async finalizePath(partialPath: Partial<LevelPath>): Promise<LevelPath | null> {
    if (!partialPath.levels || !partialPath.classBreakdown) return null
    
    const build = this.pathToBuildConfig(partialPath, 20)
    if (!build) return null
    
    try {
      // Calculate full DPR curves
      const dprConfig = createDPRConfig(build.id)
      const dprResult = generateDPRCurves(build, dprConfig)
      
      // Calculate milestone results
      const milestoneResults: MilestoneResult[] = this.config.constraints.mustHitMilestones.map(milestone => ({
        milestone,
        achieved: milestone.checkFunction(partialPath as LevelPath, 20),
        levelAchieved: this.findMilestoneLevel(partialPath, milestone),
        description: milestone.description
      }))
      
      // Calculate DPR progression
      const dprProgression: number[] = []
      for (let level = 1; level <= 20; level++) {
        const levelBuild = this.pathToBuildConfig(partialPath, level)
        if (levelBuild) {
          const quickDPR = await this.calculateQuickDPR(levelBuild)
          dprProgression.push(quickDPR)
        } else {
          dprProgression.push(0)
        }
      }
      
      return {
        id: partialPath.id!,
        name: this.generatePathName(partialPath),
        levels: partialPath.levels,
        totalLevels: 20,
        classBreakdown: partialPath.classBreakdown,
        finalDPR: dprResult.totalDPR,
        averageDPR: dprResult.averageDPR,
        milestones: milestoneResults,
        dprProgression,
        score: dprResult.totalDPR
      }
    } catch (error) {
      console.error('Error finalizing path:', error)
      return null
    }
  }

  // Generate a descriptive name for the path
  private generatePathName(path: Partial<LevelPath>): string {
    if (!path.classBreakdown) return 'Unknown Path'
    
    const classes = Object.entries(path.classBreakdown)
      .sort(([,a], [,b]) => b - a)
      .map(([classId, levels]) => `${classId.charAt(0).toUpperCase() + classId.slice(1)} ${levels}`)
    
    if (classes.length === 1) {
      return `Pure ${classes[0].split(' ')[0]}`
    } else {
      return classes.join(' / ')
    }
  }

  // Find what level a milestone was achieved
  private findMilestoneLevel(path: Partial<LevelPath>, milestone: Milestone): number | undefined {
    for (let level = 1; level <= 20; level++) {
      if (milestone.checkFunction(path as LevelPath, level)) {
        return level
      }
    }
    return undefined
  }

  // Generate path key for memoization
  private getPathKey(path: Partial<LevelPath>, level: number): string {
    if (!path.classBreakdown) return 'invalid'
    
    const classString = Object.entries(path.classBreakdown)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([classId, levels]) => `${classId}:${levels}`)
      .join(',')
    
    return `${classString}@${level}`
  }
}

// Helper function to create common constraint sets
export function createCommonConstraints(): Record<string, PathConstraints> {
  return {
    martial_dpr: {
      maxClasses: 2,
      mustHitMilestones: [COMMON_MILESTONES.extra_attack],
      roleTargets: [],
      allowedClasses: ['fighter', 'ranger', 'paladin', 'barbarian', 'rogue'],
      forbiddenCombos: [['barbarian', 'monk']] // Unarmored Defense conflict
    },
    spellsword: {
      maxClasses: 2,
      mustHitMilestones: [COMMON_MILESTONES.extra_attack, COMMON_MILESTONES.spellcasting_3rd],
      roleTargets: [],
      allowedClasses: ['fighter', 'paladin', 'ranger', 'wizard', 'sorcerer', 'warlock'],
      forbiddenCombos: []
    },
    rogue_hybrid: {
      maxClasses: 3,
      mustHitMilestones: [COMMON_MILESTONES.sneak_attack_2d6],
      roleTargets: [],
      allowedClasses: ['rogue', 'fighter', 'ranger', 'cleric'],
      forbiddenCombos: []
    }
  }
}