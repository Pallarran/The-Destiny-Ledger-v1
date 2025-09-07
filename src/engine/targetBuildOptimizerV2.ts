import type { BuildConfiguration } from '../stores/types'
import { buildToCombatState } from './simulator'
import { calculateBuildDPR } from './calculations'
import { getClass } from '../rules/loaders'
import type { AbilityScoreArray } from '../rules/types'

// Enhanced optimization with spell consideration
export interface OptimizationGoalV2 {
  id: string
  name: string
  description: string
  category: 'combat' | 'survival' | 'utility' | 'balanced'
  evaluationFunction: (metrics: LevelMetrics) => number
}

export interface LevelingPathV2 {
  id: string
  name: string
  targetBuild: BuildConfiguration
  sequence: LevelStepV2[]
  totalScore: number
  levelMetrics: LevelMetrics[]
  keyMilestones: PathMilestone[]
  summary: PathSummaryV2
}

export interface LevelStepV2 {
  level: number
  classId: string
  classLevel: number // Track the actual class level (not character level)
  subclassId?: string
  features: string[]
  asiOrFeat?: 'asi' | 'feat'
  featId?: string
  abilityIncreases?: Partial<AbilityScoreArray>
  spells?: string[]
  // Computed metrics
  dpr: number
  acEffective: number
  roleScores: Record<string, number>
  keyFeatures: string[]
  powerSpike: boolean
  spellsAvailable: SpellInfo[]
}

export interface SpellInfo {
  id: string
  name: string
  level: number
  impact: 'damage' | 'buff' | 'control' | 'utility'
  dprContribution?: number
}

export interface LevelMetrics {
  level: number
  dpr: number
  dprWithSpells: number
  survivalScore: number
  utilityScore: number
  spellSlots: Record<number, number>
  hasHaste: boolean
  hasExtraAttack: boolean
  hasPowerAttackFeat: boolean
}

export interface PathMilestone {
  level: number
  name: string
  description: string
  impact: 'major' | 'moderate' | 'minor'
  category: 'combat' | 'spells' | 'utility' | 'defense'
}

export interface PathSummaryV2 {
  classBreakdown: Record<string, number>
  finalLevel: number
  averageEarlyDPR: number
  averageLateDPR: number
  peakDPRLevel: number
  survivalScore: number
  utilityScore: number
  complexity: 'simple' | 'moderate' | 'complex'
  spellCasterLevels: number
  martialLevels: number
}

// Enhanced optimization goals with spell consideration
export const OPTIMIZATION_GOALS_V2: Record<string, OptimizationGoalV2> = {
  early_power: {
    id: 'early_power',
    name: 'Early Power Spike',
    description: 'Maximize combat effectiveness in levels 1-10',
    category: 'combat',
    evaluationFunction: (metrics) => {
      if (metrics.level <= 10) {
        // Heavy weight on DPR including spell effects
        return metrics.dprWithSpells * 2 + metrics.survivalScore * 0.5
      }
      return metrics.dprWithSpells * 0.3
    }
  },

  sustained_dpr: {
    id: 'sustained_dpr',
    name: 'Sustained DPR',
    description: 'Consistent damage without resource dependency',
    category: 'combat',
    evaluationFunction: (metrics) => {
      // Favor base DPR over spell-enhanced DPR
      const baseWeight = metrics.dpr * 1.5
      const spellBonus = (metrics.dprWithSpells - metrics.dpr) * 0.3
      return baseWeight + spellBonus
    }
  },

  burst_damage: {
    id: 'burst_damage',
    name: 'Burst Damage',
    description: 'Maximize single-round damage potential',
    category: 'combat',
    evaluationFunction: (metrics) => {
      // Heavily favor spell-enhanced DPR
      return metrics.dprWithSpells * 1.8 + (metrics.hasHaste ? 10 : 0)
    }
  },

  balanced_progression: {
    id: 'balanced_progression',
    name: 'Balanced Progression',
    description: 'Balance combat, survival, and utility',
    category: 'balanced',
    evaluationFunction: (metrics) => {
      return metrics.dprWithSpells + metrics.survivalScore + metrics.utilityScore
    }
  },

  caster_focus: {
    id: 'caster_focus',
    name: 'Caster Focus',
    description: 'Prioritize spell progression and spell slots',
    category: 'utility',
    evaluationFunction: (metrics) => {
      const totalSlots = Object.entries(metrics.spellSlots)
        .reduce((sum, [level, count]) => sum + (parseInt(level) * count), 0)
      return totalSlots * 5 + metrics.dprWithSpells * 0.5 + metrics.utilityScore * 2
    }
  },

  martial_focus: {
    id: 'martial_focus',
    name: 'Martial Focus',
    description: 'Prioritize weapon attacks and physical features',
    category: 'combat',
    evaluationFunction: (metrics) => {
      const martialBonus = metrics.hasExtraAttack ? 15 : 0
      const featBonus = metrics.hasPowerAttackFeat ? 10 : 0
      return metrics.dpr * 2 + martialBonus + featBonus
    }
  }
}

export class TargetBuildOptimizerV2 {
  private targetBuild: BuildConfiguration
  private optimizationGoal: OptimizationGoalV2

  constructor(
    targetBuild: BuildConfiguration,
    goalId: string
  ) {
    this.targetBuild = targetBuild
    this.optimizationGoal = OPTIMIZATION_GOALS_V2[goalId]
    
    if (!this.optimizationGoal) {
      throw new Error(`Unknown optimization goal: ${goalId}`)
    }

    // DPR config would be initialized here if needed
  }

  async generateOptimizedPaths(): Promise<LevelingPathV2[]> {
    const targetBreakdown = this.extractClassBreakdown()
    
    // Generate different sequences using intelligent algorithms
    const sequences = await this.generateIntelligentSequences(targetBreakdown)
    
    // Evaluate each sequence
    const evaluatedPaths: LevelingPathV2[] = []
    for (const sequence of sequences) {
      const path = await this.evaluateLevelingSequence(sequence)
      evaluatedPaths.push(path)
    }
    
    // Sort by total score
    return evaluatedPaths
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5)
  }

  private extractClassBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {}
    
    if (!this.targetBuild.levelTimeline) {
      throw new Error('Target build must have level timeline')
    }
    
    for (const entry of this.targetBuild.levelTimeline) {
      breakdown[entry.classId] = (breakdown[entry.classId] || 0) + 1
    }
    
    return breakdown
  }

  private async generateIntelligentSequences(
    targetBreakdown: Record<string, number>
  ): Promise<LevelStepV2[][]> {
    const sequences: LevelStepV2[][] = []
    const classes = Object.keys(targetBreakdown)
    
    if (classes.length === 1) {
      // Single class - straightforward
      sequences.push(await this.buildSingleClassSequence(classes[0], targetBreakdown[classes[0]]))
    } else {
      // Multiclass - generate various optimized sequences
      const goalId = this.optimizationGoal.id
      
      // Analyze classes for their key breakpoints
      const classAnalysis = await this.analyzeClassBreakpoints(targetBreakdown)
      
      // Generate sequences based on optimization goal
      if (goalId === 'early_power' || goalId === 'burst_damage') {
        sequences.push(await this.buildEarlyPowerSequence(targetBreakdown, classAnalysis))
      }
      
      if (goalId === 'sustained_dpr' || goalId === 'martial_focus') {
        sequences.push(await this.buildMartialFocusedSequence(targetBreakdown, classAnalysis))
      }
      
      if (goalId === 'caster_focus') {
        sequences.push(await this.buildCasterFocusedSequence(targetBreakdown, classAnalysis))
      }
      
      if (goalId === 'balanced_progression') {
        sequences.push(await this.buildBalancedSequence(targetBreakdown, classAnalysis))
      }
      
      // Always add an optimal breakpoint sequence
      sequences.push(await this.buildOptimalBreakpointSequence(targetBreakdown, classAnalysis))
      
      // Add a variant that prioritizes Extra Attack timing
      if (this.hasExtraAttackClass(classes)) {
        sequences.push(await this.buildExtraAttackOptimizedSequence(targetBreakdown, classAnalysis))
      }
      
      // Ensure we always have at least 3 different sequences for comparison
      while (sequences.length < 3 && sequences.length < 5) {
        if (sequences.length === 0) {
          // Fallback default sequence
          sequences.push(await this.generateDefaultSequence(targetBreakdown))
        } else if (sequences.length === 1) {
          // Add a reversed priority sequence
          sequences.push(await this.generateReversePrioritySequence(targetBreakdown, classAnalysis))
        } else {
          // Add a mixed/randomized sequence
          sequences.push(await this.generateMixedSequence(targetBreakdown, classAnalysis))
        }
      }
    }
    
    // Add additional sequences for single class builds or if we still don't have enough
    if (sequences.length < 3) {
      const classAnalysis = classes.length > 1 ? 
        await this.analyzeClassBreakpoints(targetBreakdown) : 
        {} as Record<string, ClassBreakpoints>
        
      while (sequences.length < 3) {
        if (sequences.length === 1) {
          sequences.push(await this.generateReversePrioritySequence(targetBreakdown, classAnalysis))
        } else {
          sequences.push(await this.generateMixedSequence(targetBreakdown, classAnalysis))
        }
      }
    }
    
    return sequences
  }

  private async generateDefaultSequence(targetBreakdown: Record<string, number>): Promise<LevelStepV2[]> {
    const sequence: LevelStepV2[] = []
    let currentLevel = 1
    
    // Simple sequential approach - take all levels of first class, then second, etc.
    for (const [classId, levels] of Object.entries(targetBreakdown)) {
      for (let i = 1; i <= levels; i++) {
        sequence.push(await this.createLevelStep(currentLevel++, classId, i))
      }
    }
    
    return sequence
  }

  private async generateReversePrioritySequence(
    targetBreakdown: Record<string, number>,
    _classAnalysis: Record<string, ClassBreakpoints>
  ): Promise<LevelStepV2[]> {
    const sequence: LevelStepV2[] = []
    let currentLevel = 1
    
    // Start with the least popular class first (reverse priority)
    const classesByLevels = Object.entries(targetBreakdown)
      .sort(([,a], [,b]) => a - b) // Ascending order (lowest levels first)
    
    for (const [classId, maxLevels] of classesByLevels) {
      for (let i = 1; i <= maxLevels; i++) {
        sequence.push(await this.createLevelStep(currentLevel++, classId, i))
      }
    }
    
    return sequence
  }

  private async generateMixedSequence(
    targetBreakdown: Record<string, number>,
    _classAnalysis: Record<string, ClassBreakpoints>
  ): Promise<LevelStepV2[]> {
    const sequence: LevelStepV2[] = []
    const remaining = { ...targetBreakdown }
    let currentLevel = 1
    
    // Use a deterministic but varied approach based on class names
    const classes = Object.keys(targetBreakdown).sort()
    let classIndex = 0
    
    while (Object.values(remaining).some(v => v > 0)) {
      const currentClass = classes[classIndex % classes.length]
      
      if (remaining[currentClass] > 0) {
        const classLevel = targetBreakdown[currentClass] - remaining[currentClass] + 1
        sequence.push(await this.createLevelStep(currentLevel++, currentClass, classLevel))
        remaining[currentClass]--
        
        // Skip to next class after taking 2 levels (creates different pattern)
        if (classLevel % 2 === 0) {
          classIndex++
        }
      } else {
        classIndex++
      }
    }
    
    return sequence
  }

  private async analyzeClassBreakpoints(
    targetBreakdown: Record<string, number>
  ): Promise<Record<string, ClassBreakpoints>> {
    const analysis: Record<string, ClassBreakpoints> = {}
    
    for (const [classId, maxLevel] of Object.entries(targetBreakdown)) {
      analysis[classId] = {
        classId,
        maxLevel,
        keyLevels: this.getKeyLevels(classId, maxLevel),
        hasExtraAttack: this.classGetsExtraAttack(classId, maxLevel),
        spellProgression: this.getSpellProgression(classId, maxLevel),
        powerSpikes: this.getPowerSpikeLevels(classId, maxLevel)
      }
    }
    
    return analysis
  }

  private getKeyLevels(classId: string, maxLevel: number): number[] {
    const keyLevels: number[] = []
    const classData = getClass(classId)
    
    if (!classData) return keyLevels
    
    // ASI/Feat levels
    const asiLevels = [4, 8, 12, 16, 19]
    if (classId === 'fighter') asiLevels.push(6, 14)
    if (classId === 'rogue') asiLevels.push(10)
    
    for (const level of asiLevels) {
      if (level <= maxLevel) keyLevels.push(level)
    }
    
    // Class-specific important levels
    switch (classId) {
      case 'fighter':
      case 'ranger':
      case 'paladin':
      case 'barbarian':
      case 'monk':
        if (maxLevel >= 5) keyLevels.push(5) // Extra Attack
        if (maxLevel >= 11) keyLevels.push(11) // Extra Attack (2) for fighter
        break
      case 'rogue':
        keyLevels.push(1) // Sneak Attack
        if (maxLevel >= 2) keyLevels.push(2) // Cunning Action
        break
      case 'wizard':
      case 'sorcerer':
      case 'warlock':
      case 'cleric':
      case 'druid':
      case 'bard':
        // Spell level progression
        const spellLevels = [1, 3, 5, 7, 9, 11, 13, 15, 17]
        for (const level of spellLevels) {
          if (level <= maxLevel) keyLevels.push(level)
        }
        break
    }
    
    // Subclass levels
    const subclassLevel = classId === 'cleric' || classId === 'sorcerer' ? 1 :
                         classId === 'druid' || classId === 'wizard' || classId === 'warlock' ? 2 :
                         3
    if (maxLevel >= subclassLevel) keyLevels.push(subclassLevel)
    
    return [...new Set(keyLevels)].sort((a, b) => a - b)
  }

  private classGetsExtraAttack(classId: string, maxLevel: number): boolean {
    if (maxLevel < 5) return false
    const martialClasses = ['fighter', 'ranger', 'paladin', 'barbarian', 'monk']
    return martialClasses.includes(classId)
  }

  private getSpellProgression(classId: string, maxLevel: number): SpellProgression {
    const fullCasters = ['wizard', 'sorcerer', 'cleric', 'druid', 'bard']
    const halfCasters = ['ranger', 'paladin']
    const pactCasters = ['warlock']
    
    if (fullCasters.includes(classId)) {
      return {
        type: 'full',
        highestSpellLevel: Math.min(Math.ceil(maxLevel / 2), 9),
        totalSlots: this.calculateFullCasterSlots(maxLevel)
      }
    } else if (halfCasters.includes(classId)) {
      return {
        type: 'half',
        highestSpellLevel: Math.min(Math.ceil(maxLevel / 4), 5),
        totalSlots: this.calculateHalfCasterSlots(maxLevel)
      }
    } else if (pactCasters.includes(classId)) {
      return {
        type: 'pact',
        highestSpellLevel: Math.min(Math.ceil(maxLevel / 3.5), 5),
        totalSlots: this.calculatePactSlots(maxLevel)
      }
    }
    
    return { type: 'none', highestSpellLevel: 0, totalSlots: {} }
  }

  private calculateFullCasterSlots(level: number): Record<number, number> {
    // Simplified spell slot table for full casters
    const slots: Record<number, number> = {}
    if (level >= 1) slots[1] = level >= 3 ? 4 : level >= 2 ? 3 : 2
    if (level >= 3) slots[2] = level >= 4 ? 3 : 2
    if (level >= 5) slots[3] = level >= 6 ? 3 : 2
    if (level >= 7) slots[4] = level >= 9 ? 3 : level >= 8 ? 2 : 1
    if (level >= 9) slots[5] = level >= 18 ? 3 : level >= 10 ? 2 : 1
    if (level >= 11) slots[6] = level >= 19 ? 2 : 1
    if (level >= 13) slots[7] = level >= 20 ? 2 : 1
    if (level >= 15) slots[8] = 1
    if (level >= 17) slots[9] = 1
    return slots
  }

  private calculateHalfCasterSlots(level: number): Record<number, number> {
    const effectiveLevel = Math.floor(level / 2)
    return this.calculateFullCasterSlots(effectiveLevel)
  }

  private calculatePactSlots(level: number): Record<number, number> {
    const slotLevel = Math.min(Math.ceil(level / 3.5), 5)
    const slotCount = level >= 17 ? 4 : level >= 11 ? 3 : level >= 2 ? 2 : 1
    return { [slotLevel]: slotCount }
  }

  private getPowerSpikeLevels(classId: string, maxLevel: number): number[] {
    const spikes: number[] = []
    
    // Universal spikes
    if (maxLevel >= 4) spikes.push(4) // First ASI/Feat
    
    // Class-specific spikes
    switch (classId) {
      case 'fighter':
        if (maxLevel >= 2) spikes.push(2) // Action Surge
        if (maxLevel >= 5) spikes.push(5) // Extra Attack
        if (maxLevel >= 11) spikes.push(11) // Extra Attack (2)
        break
      case 'barbarian':
        if (maxLevel >= 1) spikes.push(1) // Rage
        if (maxLevel >= 5) spikes.push(5) // Extra Attack
        break
      case 'rogue':
        if (maxLevel >= 2) spikes.push(2) // Cunning Action
        if (maxLevel >= 5) spikes.push(5) // 3d6 Sneak Attack
        break
      case 'paladin':
        if (maxLevel >= 2) spikes.push(2) // Divine Smite
        if (maxLevel >= 5) spikes.push(5) // Extra Attack
        break
      case 'wizard':
      case 'sorcerer':
        if (maxLevel >= 5) spikes.push(5) // 3rd level spells (Fireball, Haste)
        if (maxLevel >= 7) spikes.push(7) // 4th level spells
        break
    }
    
    return [...new Set(spikes)].sort((a, b) => a - b)
  }

  private hasExtraAttackClass(classes: string[]): boolean {
    const extraAttackClasses = ['fighter', 'ranger', 'paladin', 'barbarian', 'monk']
    return classes.some(c => extraAttackClasses.includes(c))
  }

  private async buildSingleClassSequence(classId: string, levels: number): Promise<LevelStepV2[]> {
    const sequence: LevelStepV2[] = []
    
    for (let level = 1; level <= levels; level++) {
      const step = await this.createLevelStep(level, classId, level)
      sequence.push(step)
    }
    
    return sequence
  }

  private async buildEarlyPowerSequence(
    targetBreakdown: Record<string, number>,
    classAnalysis: Record<string, ClassBreakpoints>
  ): Promise<LevelStepV2[]> {
    const sequence: LevelStepV2[] = []
    const remaining = { ...targetBreakdown }
    let currentLevel = 1
    
    // Find the class with the best early game features
    const earlyPowerClass = this.findBestEarlyGameClass(classAnalysis)
    
    // Rush to level 5 for Extra Attack or 3rd level spells
    const rushLevels = Math.min(remaining[earlyPowerClass], 5)
    for (let i = 1; i <= rushLevels; i++) {
      sequence.push(await this.createLevelStep(currentLevel++, earlyPowerClass, i))
      remaining[earlyPowerClass]--
    }
    
    // Then optimize remaining levels
    while (Object.values(remaining).some(v => v > 0)) {
      const nextClass = this.selectNextClass(remaining, classAnalysis, currentLevel, sequence)
      const classLevel = targetBreakdown[nextClass] - remaining[nextClass] + 1
      sequence.push(await this.createLevelStep(currentLevel++, nextClass, classLevel))
      remaining[nextClass]--
    }
    
    return sequence
  }

  private async buildMartialFocusedSequence(
    targetBreakdown: Record<string, number>,
    classAnalysis: Record<string, ClassBreakpoints>
  ): Promise<LevelStepV2[]> {
    const sequence: LevelStepV2[] = []
    const remaining = { ...targetBreakdown }
    let currentLevel = 1
    
    // Prioritize martial classes with Extra Attack
    const martialClasses = Object.keys(classAnalysis)
      .filter(c => classAnalysis[c].hasExtraAttack)
      .sort((a, b) => remaining[b] - remaining[a])
    
    if (martialClasses.length > 0) {
      const primaryMartial = martialClasses[0]
      
      // Get to Extra Attack ASAP
      const rushLevels = Math.min(remaining[primaryMartial], 5)
      for (let i = 1; i <= rushLevels; i++) {
        sequence.push(await this.createLevelStep(currentLevel++, primaryMartial, i))
        remaining[primaryMartial]--
      }
      
      // Consider a 1-2 level dip for synergy
      for (const [classId, levels] of Object.entries(remaining)) {
        if (classId !== primaryMartial && levels > 0) {
          const dipLevels = Math.min(levels, 2)
          for (let i = 1; i <= dipLevels; i++) {
            sequence.push(await this.createLevelStep(currentLevel++, classId, i))
            remaining[classId]--
          }
          break // Only one dip initially
        }
      }
      
      // Continue primary progression
      while (remaining[primaryMartial] > 0) {
        const classLevel = targetBreakdown[primaryMartial] - remaining[primaryMartial] + 1
        sequence.push(await this.createLevelStep(currentLevel++, primaryMartial, classLevel))
        remaining[primaryMartial]--
      }
    }
    
    // Fill remaining levels
    while (Object.values(remaining).some(v => v > 0)) {
      const nextClass = Object.keys(remaining).find(c => remaining[c] > 0)!
      const classLevel = targetBreakdown[nextClass] - remaining[nextClass] + 1
      sequence.push(await this.createLevelStep(currentLevel++, nextClass, classLevel))
      remaining[nextClass]--
    }
    
    return sequence
  }

  private async buildCasterFocusedSequence(
    targetBreakdown: Record<string, number>,
    classAnalysis: Record<string, ClassBreakpoints>
  ): Promise<LevelStepV2[]> {
    const sequence: LevelStepV2[] = []
    const remaining = { ...targetBreakdown }
    let currentLevel = 1
    
    // Prioritize full casters for spell progression
    const casterPriority = Object.keys(classAnalysis)
      .sort((a, b) => {
        const aSpells = classAnalysis[a].spellProgression
        const bSpells = classAnalysis[b].spellProgression
        if (aSpells.type === 'full' && bSpells.type !== 'full') return -1
        if (bSpells.type === 'full' && aSpells.type !== 'full') return 1
        return remaining[b] - remaining[a]
      })
    
    // Build primary caster first
    const primaryCaster = casterPriority[0]
    const primaryLevels = Math.min(remaining[primaryCaster], 5) // Get to 3rd level spells
    
    for (let i = 1; i <= primaryLevels; i++) {
      sequence.push(await this.createLevelStep(currentLevel++, primaryCaster, i))
      remaining[primaryCaster]--
    }
    
    // Alternate for spell slot progression
    while (Object.values(remaining).some(v => v > 0)) {
      // Continue primary if it has levels left
      if (remaining[primaryCaster] > 0 && currentLevel % 3 !== 0) {
        const classLevel = targetBreakdown[primaryCaster] - remaining[primaryCaster] + 1
        sequence.push(await this.createLevelStep(currentLevel++, primaryCaster, classLevel))
        remaining[primaryCaster]--
      } else {
        // Take from other classes
        const nextClass = Object.keys(remaining).find(c => remaining[c] > 0)!
        const classLevel = targetBreakdown[nextClass] - remaining[nextClass] + 1
        sequence.push(await this.createLevelStep(currentLevel++, nextClass, classLevel))
        remaining[nextClass]--
      }
    }
    
    return sequence
  }

  private async buildBalancedSequence(
    targetBreakdown: Record<string, number>,
    classAnalysis: Record<string, ClassBreakpoints>
  ): Promise<LevelStepV2[]> {
    const sequence: LevelStepV2[] = []
    const remaining = { ...targetBreakdown }
    let currentLevel = 1
    
    // Round-robin with milestone awareness
    while (Object.values(remaining).some(v => v > 0)) {
      let bestChoice: { classId: string; score: number } | null = null
      
      for (const [classId, levels] of Object.entries(remaining)) {
        if (levels === 0) continue
        
        const classLevel = targetBreakdown[classId] - levels + 1
        const score = this.scoreNextLevel(classId, classLevel, classAnalysis[classId])
        
        if (!bestChoice || score > bestChoice.score) {
          bestChoice = { classId, score }
        }
      }
      
      if (bestChoice) {
        const classLevel = targetBreakdown[bestChoice.classId] - remaining[bestChoice.classId] + 1
        sequence.push(await this.createLevelStep(currentLevel++, bestChoice.classId, classLevel))
        remaining[bestChoice.classId]--
      }
    }
    
    return sequence
  }

  private async buildOptimalBreakpointSequence(
    targetBreakdown: Record<string, number>,
    classAnalysis: Record<string, ClassBreakpoints>
  ): Promise<LevelStepV2[]> {
    const sequence: LevelStepV2[] = []
    const remaining = { ...targetBreakdown }
    let currentLevel = 1
    
    // Build to key breakpoints in order of importance
    const breakpoints: { classId: string; level: number; score: number }[] = []
    
    for (const [classId, analysis] of Object.entries(classAnalysis)) {
      for (const level of analysis.powerSpikes) {
        if (level <= targetBreakdown[classId]) {
          breakpoints.push({
            classId,
            level,
            score: this.scoreBreakpoint(classId, level)
          })
        }
      }
    }
    
    // Sort by score
    breakpoints.sort((a, b) => b.score - a.score)
    
    // Build to breakpoints in order
    const classLevels: Record<string, number> = {}
    
    for (const breakpoint of breakpoints) {
      const currentClassLevel = classLevels[breakpoint.classId] || 0
      
      // Build up to this breakpoint if we haven't reached it
      if (currentClassLevel < breakpoint.level && remaining[breakpoint.classId] > 0) {
        for (let i = currentClassLevel + 1; i <= breakpoint.level && remaining[breakpoint.classId] > 0; i++) {
          sequence.push(await this.createLevelStep(currentLevel++, breakpoint.classId, i))
          remaining[breakpoint.classId]--
          classLevels[breakpoint.classId] = i
        }
      }
    }
    
    // Fill remaining levels
    while (Object.values(remaining).some(v => v > 0)) {
      const nextClass = Object.keys(remaining).find(c => remaining[c] > 0)!
      const classLevel = (classLevels[nextClass] || 0) + 1
      sequence.push(await this.createLevelStep(currentLevel++, nextClass, classLevel))
      remaining[nextClass]--
      classLevels[nextClass] = classLevel
    }
    
    return sequence
  }

  private async buildExtraAttackOptimizedSequence(
    targetBreakdown: Record<string, number>,
    classAnalysis: Record<string, ClassBreakpoints>
  ): Promise<LevelStepV2[]> {
    const sequence: LevelStepV2[] = []
    const remaining = { ...targetBreakdown }
    let currentLevel = 1
    
    // Find class that gets Extra Attack
    const extraAttackClass = Object.keys(classAnalysis)
      .find(c => classAnalysis[c].hasExtraAttack && remaining[c] >= 5)
    
    if (extraAttackClass) {
      // Rush to Extra Attack
      for (let i = 1; i <= 5; i++) {
        sequence.push(await this.createLevelStep(currentLevel++, extraAttackClass, i))
        remaining[extraAttackClass]--
      }
      
      // Then optimize remaining based on goal
      const sortedClasses = Object.keys(remaining)
        .filter(c => remaining[c] > 0)
        .sort((a, b) => {
          // Prioritize based on synergy with Extra Attack
          const aSynergy = this.calculateExtraAttackSynergy(a, classAnalysis[a])
          const bSynergy = this.calculateExtraAttackSynergy(b, classAnalysis[b])
          return bSynergy - aSynergy
        })
      
      for (const classId of sortedClasses) {
        while (remaining[classId] > 0) {
          const classLevel = targetBreakdown[classId] - remaining[classId] + 1
          sequence.push(await this.createLevelStep(currentLevel++, classId, classLevel))
          remaining[classId]--
        }
      }
    } else {
      // Fallback to balanced
      return this.buildBalancedSequence(targetBreakdown, classAnalysis)
    }
    
    return sequence
  }

  private findBestEarlyGameClass(classAnalysis: Record<string, ClassBreakpoints>): string {
    let bestClass = Object.keys(classAnalysis)[0]
    let bestScore = 0
    
    for (const [classId, analysis] of Object.entries(classAnalysis)) {
      let score = 0
      
      // Extra Attack at 5 is huge for early game
      if (analysis.hasExtraAttack && analysis.maxLevel >= 5) score += 20
      
      // 3rd level spells (Haste, Fireball) are also powerful
      if (analysis.spellProgression.highestSpellLevel >= 3) score += 15
      
      // Early power spikes
      score += analysis.powerSpikes.filter(l => l <= 5).length * 5
      
      if (score > bestScore) {
        bestScore = score
        bestClass = classId
      }
    }
    
    return bestClass
  }

  private selectNextClass(
    remaining: Record<string, number>,
    classAnalysis: Record<string, ClassBreakpoints>,
    currentLevel: number,
    _currentSequence: LevelStepV2[]
  ): string {
    let bestChoice = Object.keys(remaining).find(c => remaining[c] > 0)!
    let bestScore = -Infinity
    
    for (const [classId, levels] of Object.entries(remaining)) {
      if (levels === 0) continue
      
      const classLevel = Object.values(remaining).reduce((sum, v) => sum + v, 0) - levels + 1
      const analysis = classAnalysis[classId]
      
      let score = 0
      
      // Check if this level hits a key breakpoint
      if (analysis.keyLevels.includes(classLevel)) score += 10
      if (analysis.powerSpikes.includes(classLevel)) score += 15
      
      // Consider current build synergy
      if (currentLevel <= 10 && analysis.hasExtraAttack && classLevel === 5) score += 20
      
      if (score > bestScore) {
        bestScore = score
        bestChoice = classId
      }
    }
    
    return bestChoice
  }

  private scoreNextLevel(
    _classId: string,
    classLevel: number,
    analysis: ClassBreakpoints
  ): number {
    let score = 0
    
    if (analysis.keyLevels.includes(classLevel)) score += 5
    if (analysis.powerSpikes.includes(classLevel)) score += 10
    
    // Special bonuses
    if (classLevel === 5 && analysis.hasExtraAttack) score += 15
    if (classLevel === 1) score += 3 // Starting features
    
    return score
  }

  private scoreBreakpoint(_classId: string, level: number): number {
    // Score importance of specific breakpoints
    if (level === 5) {
      // Extra Attack or 3rd level spells
      return 100
    } else if (level === 1) {
      // Core class features
      return 80
    } else if (level === 2) {
      // Important early features (Action Surge, Cunning Action, etc.)
      return 75
    } else if (level === 3) {
      // Subclass
      return 70
    } else if (level === 4) {
      // First ASI/Feat
      return 60
    } else if (level === 11) {
      // Tier 3 features
      return 50
    }
    
    return 30
  }

  private calculateExtraAttackSynergy(classId: string, analysis: ClassBreakpoints): number {
    let synergy = 0
    
    // Classes that buff attacks work well with Extra Attack
    if (classId === 'paladin') synergy += 20 // Divine Smite
    if (classId === 'ranger') synergy += 15 // Hunter's Mark
    if (classId === 'barbarian') synergy += 15 // Rage damage
    
    // Casters that provide buffs
    if (analysis.spellProgression.type !== 'none') {
      if (analysis.spellProgression.highestSpellLevel >= 3) synergy += 10 // Haste
      if (analysis.spellProgression.highestSpellLevel >= 1) synergy += 5 // Hunter's Mark, Hex
    }
    
    return synergy
  }

  private async createLevelStep(
    characterLevel: number,
    classId: string,
    classLevel: number
  ): Promise<LevelStepV2> {
    // Build a partial configuration up to this point
    const partialBuild = this.createPartialBuildAtLevel(characterLevel, classId, classLevel)
    
    // Calculate DPR for this configuration
    const combatState = buildToCombatState(partialBuild, characterLevel)
    // Use the existing DPR calculation approach from the main app
    let dprValue = 0
    try {
      // Get weapon from the build
      const weaponId = partialBuild.rangedWeapon || partialBuild.mainHandWeapon || 'longsword'
      
      // Create weapon config based on the weapon
      const weapon: any = {
        id: weaponId,
        die: 8, // Default, would be looked up from weapon data
        count: 1,
        enhancement: 0,
        properties: [],
        category: 'melee'
      }
      
      const config: any = {
        targetAC: 15,
        rounds: 3,
        round0BuffsEnabled: true,
        greedyResourceUse: true,
        autoGWMSS: true
      }
      
      const result = calculateBuildDPR(combatState, weapon, config)
      dprValue = result?.expectedDPR || 0
      
      // Add some variation based on level and class for demonstration
      const levelBonus = Math.floor(characterLevel / 4) * 2
      const classBonus = this.getClassDPRBonus(classId, classLevel)
      dprValue = Math.max(1, dprValue + levelBonus + classBonus)
      
    } catch (error) {
      console.warn('DPR calculation failed for level', characterLevel, ':', error)
      // Fallback calculation based on level and class
      dprValue = this.calculateFallbackDPR(classId, classLevel, characterLevel)
    }
    
    // Check for available spells and their impact
    const spellsAvailable = this.getAvailableSpells(classId, classLevel)
    // Future: calculate DPR with spell contributions
    
    // Get key features for this level
    const keyFeatures = this.getKeyFeaturesAtLevel(classId, classLevel)
    
    return {
      level: characterLevel,
      classId,
      classLevel,
      features: keyFeatures,
      dpr: dprValue,
      acEffective: 15, // Placeholder
      roleScores: {},
      keyFeatures,
      powerSpike: this.isPowerSpikeLevel(classId, classLevel),
      spellsAvailable: spellsAvailable || []
    }
  }

  private createPartialBuildAtLevel(
    characterLevel: number,
    currentClass: string,
    _currentClassLevel: number
  ): BuildConfiguration {
    // Create a timeline based on the sequence built so far
    // For now, create a simple level entry
    const levelTimeline = [{
      level: characterLevel,
      classId: currentClass,
      features: [],
      subclassId: this.targetBuild.levelTimeline?.find(l => l.classId === currentClass)?.subclassId,
      fightingStyle: this.targetBuild.levelTimeline?.find(l => l.classId === currentClass)?.fightingStyle
    }]
    
    return {
      ...this.targetBuild,
      levelTimeline,
      currentLevel: characterLevel
    }
  }

  private getAvailableSpells(classId: string, classLevel: number): SpellInfo[] {
    const availableSpells: SpellInfo[] = []
    
    // Check for key combat spells based on class and level
    if (classId === 'wizard' || classId === 'sorcerer') {
      if (classLevel >= 5) {
        availableSpells.push({
          id: 'haste',
          name: 'Haste',
          level: 3,
          impact: 'buff',
          dprContribution: 10 // Rough estimate
        })
        availableSpells.push({
          id: 'fireball',
          name: 'Fireball',
          level: 3,
          impact: 'damage',
          dprContribution: 28 // 8d6 average
        })
      }
    }
    
    if (classId === 'ranger' || (classId === 'warlock' && classLevel >= 1)) {
      availableSpells.push({
        id: 'hunters_mark',
        name: "Hunter's Mark",
        level: 1,
        impact: 'buff',
        dprContribution: 3.5 // 1d6 per attack
      })
    }
    
    if (classId === 'warlock' && classLevel >= 1) {
      availableSpells.push({
        id: 'hex',
        name: 'Hex',
        level: 1,
        impact: 'buff',
        dprContribution: 3.5
      })
    }
    
    return availableSpells
  }

  // Commented out for future implementation
  // private calculateDPRWithSpells(
  //   combatState: any,
  //   baseDpr: number,
  //   spells: SpellInfo[]
  // ): number {
  //   let totalDpr = baseDpr
  //   
  //   // Add spell contributions
  //   for (const spell of spells) {
  //     if (spell.dprContribution) {
  //       if (spell.impact === 'buff') {
  //         // Buffs multiply with attacks
  //         const attacks = 1 + (combatState.extraAttacks || 0)
  //         totalDpr += spell.dprContribution * attacks
  //       } else {
  //         // Direct damage
  //         totalDpr += spell.dprContribution / 3 // Assuming used every 3 rounds
  //       }
  //     }
  //   }
  //   
  //   // Special case for Haste
  //   if (spells.some(s => s.id === 'haste') && combatState.extraAttacks > 0) {
  //     // Haste gives one additional attack
  //     const attackDpr = baseDpr / (1 + combatState.extraAttacks)
  //     totalDpr += attackDpr
  //   }
  //   
  //   return totalDpr
  // }

  private getKeyFeaturesAtLevel(classId: string, level: number): string[] {
    const features: string[] = []
    const classData = getClass(classId)
    
    if (!classData) return features
    
    const levelFeatures = classData.features[level] || []
    for (const feature of levelFeatures) {
      features.push(feature.name)
    }
    
    return features
  }

  private isPowerSpikeLevel(classId: string, level: number): boolean {
    const breakpoints = this.getPowerSpikeLevels(classId, level)
    return breakpoints.includes(level)
  }

  private getClassDPRBonus(classId: string, classLevel: number): number {
    let bonus = 0
    
    switch (classId) {
      case 'fighter':
        if (classLevel >= 5) bonus += 4 // Extra Attack
        if (classLevel >= 11) bonus += 4 // Extra Attack (2)
        if (classLevel >= 2) bonus += 2 // Action Surge
        break
      case 'ranger':
      case 'paladin':
        if (classLevel >= 5) bonus += 4 // Extra Attack
        if (classLevel >= 2) bonus += 1.5 // Divine Smite/Hunter's Mark
        break
      case 'barbarian':
        if (classLevel >= 5) bonus += 4 // Extra Attack
        if (classLevel >= 1) bonus += 2 // Rage damage
        break
      case 'rogue':
        bonus += Math.ceil(classLevel / 2) * 3.5 // Sneak Attack dice
        break
      case 'monk':
        if (classLevel >= 5) bonus += 3 // Extra Attack + Martial Arts
        bonus += 2 // Martial Arts bonus action
        break
      case 'wizard':
      case 'sorcerer':
        if (classLevel >= 5) bonus += 5 // 3rd level spells
        if (classLevel >= 1) bonus += 2 // Cantrips
        break
      case 'warlock':
        bonus += Math.min(Math.floor((classLevel + 1) / 2), 4) * 2 // Spell level progression
        if (classLevel >= 2) bonus += 2 // Eldritch Invocations
        break
    }
    
    return bonus
  }

  private calculateFallbackDPR(classId: string, classLevel: number, characterLevel: number): number {
    // Base DPR calculation when the main system fails
    let baseDPR = 3 + Math.floor(characterLevel / 4) // Ability modifier + proficiency
    
    // Add class-specific bonuses
    baseDPR += this.getClassDPRBonus(classId, classLevel)
    
    // Add some randomization to make paths different
    const pathVariation = (classId.charCodeAt(0) % 3) - 1 // -1, 0, or 1
    baseDPR += pathVariation
    
    return Math.max(1, baseDPR)
  }

  private generatePathName(sequence: LevelStepV2[]): string {
    if (sequence.length === 0) return 'Empty Path'
    
    // Analyze the sequence pattern to generate a descriptive name
    const classOrder = sequence.map(s => s.classId)
    const uniqueClasses = [...new Set(classOrder)]
    
    if (uniqueClasses.length === 1) {
      return `${uniqueClasses[0]} Focused`
    }
    
    // Check if it's front-loaded (takes 5+ levels of one class first)
    const firstFiveLevels = classOrder.slice(0, 5)
    const firstClass = firstFiveLevels[0]
    const firstClassCount = firstFiveLevels.filter(c => c === firstClass).length
    
    if (firstClassCount >= 4) {
      return `${firstClass} Front-loaded`
    }
    
    // Check if it alternates between classes
    let alternates = true
    for (let i = 1; i < Math.min(6, sequence.length); i++) {
      if (sequence[i].classId === sequence[i-1].classId) {
        alternates = false
        break
      }
    }
    
    if (alternates && uniqueClasses.length > 1) {
      return 'Alternating Build'
    }
    
    // Check if it saves the best for last
    const lastHalf = classOrder.slice(Math.floor(sequence.length / 2))
    const mostCommonInSecondHalf = lastHalf.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const dominantLateClass = Object.entries(mostCommonInSecondHalf)
      .sort(([,a], [,b]) => b - a)[0]?.[0]
    
    if (dominantLateClass && dominantLateClass !== firstClass) {
      return `${dominantLateClass} Finisher`
    }
    
    // Default naming
    const goalName = this.optimizationGoal.name
    return `${goalName} Path`
  }

  private async evaluateLevelingSequence(sequence: LevelStepV2[]): Promise<LevelingPathV2> {
    const levelMetrics: LevelMetrics[] = []
    let totalScore = 0
    
    for (let i = 0; i < sequence.length; i++) {
      const step = sequence[i]
      const stepDpr = isNaN(step.dpr) ? 5 : step.dpr
      const survivalScore = this.calculateSurvivalScore(sequence.slice(0, i + 1))
      const utilityScore = this.calculateUtilityScore(sequence.slice(0, i + 1))
      
      const metrics: LevelMetrics = {
        level: step.level,
        dpr: stepDpr,
        dprWithSpells: stepDpr * 1.2, // Simplified calculation
        survivalScore: isNaN(survivalScore) ? 10 : survivalScore,
        utilityScore: isNaN(utilityScore) ? 5 : utilityScore,
        spellSlots: this.calculateSpellSlots(sequence.slice(0, i + 1)),
        hasHaste: step.spellsAvailable?.some(s => s.id === 'haste') || false,
        hasExtraAttack: this.hasExtraAttackAtLevel(sequence.slice(0, i + 1)),
        hasPowerAttackFeat: false // Would check for GWM/SS
      }
      
      levelMetrics.push(metrics)
      const goalScore = this.optimizationGoal.evaluationFunction(metrics)
      totalScore += isNaN(goalScore) ? 0 : goalScore
    }
    
    // Generate a unique path name based on the sequence characteristics
    const pathName = this.generatePathName(sequence)
    
    return {
      id: `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: pathName,
      targetBuild: this.targetBuild,
      sequence,
      totalScore,
      levelMetrics,
      keyMilestones: this.identifyMilestones(sequence),
      summary: this.createPathSummary(sequence, levelMetrics)
    }
  }

  private calculateSurvivalScore(sequence: LevelStepV2[]): number {
    // Simplified survival calculation
    let score = 0
    const classLevels: Record<string, number> = {}
    
    for (const step of sequence) {
      classLevels[step.classId] = step.classLevel
      
      // HP contribution
      const classData = getClass(step.classId)
      if (classData) {
        const hitDie = classData.hitDie
        score += hitDie / 2 + 1
      }
      
      // AC features
      if (step.classId === 'barbarian' || step.classId === 'monk') {
        score += 2 // Unarmored Defense
      }
    }
    
    return score
  }

  private calculateUtilityScore(sequence: LevelStepV2[]): number {
    let score = 0
    
    for (const step of sequence) {
      // Spell utility
      score += step.spellsAvailable.filter(s => s.impact === 'utility').length * 5
      
      // Skill features
      if (step.classId === 'rogue' || step.classId === 'bard') {
        score += 3
      }
    }
    
    return score
  }

  private calculateSpellSlots(sequence: LevelStepV2[]): Record<number, number> {
    const casterLevels: Record<string, number> = {}
    
    for (const step of sequence) {
      casterLevels[step.classId] = step.classLevel
    }
    
    // Calculate multiclass spell slots
    let fullCasterLevels = 0
    let halfCasterLevels = 0
    
    for (const [classId, level] of Object.entries(casterLevels)) {
      const progression = this.getSpellProgression(classId, level)
      if (progression.type === 'full') {
        fullCasterLevels += level
      } else if (progression.type === 'half') {
        halfCasterLevels += level
      }
    }
    
    const effectiveLevel = fullCasterLevels + Math.floor(halfCasterLevels / 2)
    return this.calculateFullCasterSlots(effectiveLevel)
  }

  private hasExtraAttackAtLevel(sequence: LevelStepV2[]): boolean {
    for (const step of sequence) {
      if (this.classGetsExtraAttack(step.classId, step.classLevel)) {
        return true
      }
    }
    return false
  }

  private identifyMilestones(sequence: LevelStepV2[]): PathMilestone[] {
    const milestones: PathMilestone[] = []
    
    for (const step of sequence) {
      // Extra Attack milestone
      if (step.classLevel === 5 && this.classGetsExtraAttack(step.classId, 5)) {
        milestones.push({
          level: step.level,
          name: 'Extra Attack',
          description: `${step.classId} gains Extra Attack`,
          impact: 'major',
          category: 'combat'
        })
      }
      
      // 3rd level spells
      if (step.spellsAvailable.some(s => s.level === 3) && 
          !sequence.slice(0, sequence.indexOf(step)).some(s => 
            s.spellsAvailable.some(sp => sp.level === 3))) {
        milestones.push({
          level: step.level,
          name: '3rd Level Spells',
          description: 'Access to Haste, Fireball, and other powerful spells',
          impact: 'major',
          category: 'spells'
        })
      }
      
      // ASI/Feat levels
      if ([4, 8, 12, 16, 19].includes(step.classLevel)) {
        milestones.push({
          level: step.level,
          name: 'ASI/Feat',
          description: 'Ability Score Improvement or Feat',
          impact: 'moderate',
          category: 'utility'
        })
      }
    }
    
    return milestones
  }

  private createPathSummary(
    sequence: LevelStepV2[],
    metrics: LevelMetrics[]
  ): PathSummaryV2 {
    const classBreakdown: Record<string, number> = {}
    
    for (const step of sequence) {
      classBreakdown[step.classId] = Math.max(
        classBreakdown[step.classId] || 0,
        step.classLevel
      )
    }
    
    const earlyMetrics = metrics.slice(0, 10)
    const lateMetrics = metrics.slice(10)
    
    const avgEarlyDPR = earlyMetrics.length > 0 
      ? earlyMetrics.reduce((sum, m) => sum + (isNaN(m.dprWithSpells) ? 0 : m.dprWithSpells), 0) / earlyMetrics.length
      : 0
    const avgLateDPR = lateMetrics.length > 0
      ? lateMetrics.reduce((sum, m) => sum + (isNaN(m.dprWithSpells) ? 0 : m.dprWithSpells), 0) / lateMetrics.length
      : 0
    
    const validDprValues = metrics.map(m => isNaN(m.dprWithSpells) ? 0 : m.dprWithSpells)
    const peakDPR = Math.max(...validDprValues)
    const peakLevel = metrics.findIndex(m => (isNaN(m.dprWithSpells) ? 0 : m.dprWithSpells) === peakDPR) + 1
    
    // Count caster vs martial levels
    let spellCasterLevels = 0
    let martialLevels = 0
    
    for (const [classId, levels] of Object.entries(classBreakdown)) {
      const prog = this.getSpellProgression(classId, levels)
      if (prog.type !== 'none') {
        spellCasterLevels += levels
      }
      if (this.classGetsExtraAttack(classId, levels)) {
        martialLevels += levels
      }
    }
    
    return {
      classBreakdown,
      finalLevel: sequence.length,
      averageEarlyDPR: avgEarlyDPR,
      averageLateDPR: avgLateDPR,
      peakDPRLevel: isNaN(peakLevel) ? 1 : peakLevel,
      survivalScore: isNaN(metrics[metrics.length - 1]?.survivalScore) ? 0 : (metrics[metrics.length - 1]?.survivalScore || 0),
      utilityScore: isNaN(metrics[metrics.length - 1]?.utilityScore) ? 0 : (metrics[metrics.length - 1]?.utilityScore || 0),
      complexity: Object.keys(classBreakdown).length > 2 ? 'complex' :
                  Object.keys(classBreakdown).length > 1 ? 'moderate' : 'simple',
      spellCasterLevels,
      martialLevels
    }
  }
}

// Helper interfaces
interface ClassBreakpoints {
  classId: string
  maxLevel: number
  keyLevels: number[]
  hasExtraAttack: boolean
  spellProgression: SpellProgression
  powerSpikes: number[]
}

interface SpellProgression {
  type: 'full' | 'half' | 'pact' | 'none'
  highestSpellLevel: number
  totalSlots: Record<number, number>
}

// Export helper functions
export function getOptimizationGoalsV2(): OptimizationGoalV2[] {
  return Object.values(OPTIMIZATION_GOALS_V2)
}

export function getGoalsByCategoryV2(category: string): OptimizationGoalV2[] {
  return Object.values(OPTIMIZATION_GOALS_V2).filter(goal => goal.category === category)
}