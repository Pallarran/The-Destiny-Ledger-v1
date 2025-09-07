import type { BuildConfiguration, CustomTargetConfiguration } from '../stores/types'
import { getClass } from '../rules/loaders'
import { generateDPRCurves } from './simulator'
import type { 
  OptimizationGoalV2, 
  LevelingPathV2, 
  LevelStepV2, 
  LevelMetrics,
  PathMilestone,
  PathSummaryV2 
} from './targetBuildOptimizerV2'
import { OPTIMIZATION_GOALS_V2 } from './targetBuildOptimizerV2'

interface DecisionPoint {
  characterLevel: number
  availableClasses: string[]
  remainingLevels: Record<string, number>
  currentPath: LevelStepV2[]
}

interface ClassChoice {
  classId: string
  classLevel: number
  score: number
  metrics: LevelMetrics
  step: LevelStepV2
}

export class DynamicPathOptimizer {
  private targetBuild?: BuildConfiguration
  private customTarget?: CustomTargetConfiguration
  private optimizationGoal: OptimizationGoalV2
  private targetBreakdown: Record<string, number>
  private maxLevel: number

  constructor(target: BuildConfiguration | CustomTargetConfiguration, goalId: string) {
    this.optimizationGoal = OPTIMIZATION_GOALS_V2[goalId]
    
    if (!this.optimizationGoal) {
      throw new Error(`Unknown optimization goal: ${goalId}`)
    }

    if ('levelTimeline' in target) {
      // BuildConfiguration
      this.targetBuild = target
      this.targetBreakdown = this.extractClassBreakdown()
    } else {
      // CustomTargetConfiguration  
      this.customTarget = target
      this.targetBreakdown = this.extractCustomTargetBreakdown()
    }
    
    this.maxLevel = Object.values(this.targetBreakdown).reduce((sum, levels) => sum + levels, 0)
  }

  static fromBuild(targetBuild: BuildConfiguration, goalId: string): DynamicPathOptimizer {
    return new DynamicPathOptimizer(targetBuild, goalId)
  }

  static fromCustomTarget(customTarget: CustomTargetConfiguration, goalId: string): DynamicPathOptimizer {
    return new DynamicPathOptimizer(customTarget, goalId)
  }

  async generateOptimalPaths(): Promise<LevelingPathV2[]> {
    console.log('Generating dynamically optimized paths for:', this.optimizationGoal.name)
    
    const paths: LevelingPathV2[] = []
    
    // Generate multiple optimal paths using different strategies
    paths.push(await this.generateGreedyOptimalPath())
    paths.push(await this.generateLookaheadOptimalPath(2)) // 2-level lookahead
    paths.push(await this.generateBalancedOptimalPath())
    
    return paths.sort((a, b) => b.totalScore - a.totalScore)
  }

  private async generateGreedyOptimalPath(): Promise<LevelingPathV2> {
    const currentPath: LevelStepV2[] = []
    const remaining = { ...this.targetBreakdown }
    
    for (let characterLevel = 1; characterLevel <= this.maxLevel; characterLevel++) {
      const decisionPoint: DecisionPoint = {
        characterLevel,
        availableClasses: Object.keys(remaining).filter(c => remaining[c] > 0),
        remainingLevels: { ...remaining },
        currentPath: [...currentPath]
      }
      
      const optimalChoice = await this.evaluateOptimalChoice(decisionPoint)
      
      currentPath.push(optimalChoice.step)
      remaining[optimalChoice.classId]--
      
      console.log(`Level ${characterLevel}: Chose ${optimalChoice.classId} (score: ${optimalChoice.score.toFixed(2)})`)
    }
    
    return this.createPathFromSequence(currentPath, 'Greedy Optimal')
  }

  private async generateLookaheadOptimalPath(lookaheadDepth: number): Promise<LevelingPathV2> {
    const currentPath: LevelStepV2[] = []
    const remaining = { ...this.targetBreakdown }
    
    for (let characterLevel = 1; characterLevel <= this.maxLevel; characterLevel++) {
      const decisionPoint: DecisionPoint = {
        characterLevel,
        availableClasses: Object.keys(remaining).filter(c => remaining[c] > 0),
        remainingLevels: { ...remaining },
        currentPath: [...currentPath]
      }
      
      const optimalChoice = await this.evaluateWithLookahead(decisionPoint, lookaheadDepth)
      
      currentPath.push(optimalChoice.step)
      remaining[optimalChoice.classId]--
    }
    
    return this.createPathFromSequence(currentPath, `Lookahead Optimal (${lookaheadDepth})`)
  }

  private async generateBalancedOptimalPath(): Promise<LevelingPathV2> {
    const currentPath: LevelStepV2[] = []
    const remaining = { ...this.targetBreakdown }
    
    for (let characterLevel = 1; characterLevel <= this.maxLevel; characterLevel++) {
      const decisionPoint: DecisionPoint = {
        characterLevel,
        availableClasses: Object.keys(remaining).filter(c => remaining[c] > 0),
        remainingLevels: { ...remaining },
        currentPath: [...currentPath]
      }
      
      // Balance current optimization with long-term considerations
      const choices = await this.evaluateAllChoices(decisionPoint)
      
      // Weight choices by both immediate benefit and future potential
      const weightedChoices = choices.map(choice => ({
        ...choice,
        balancedScore: choice.score * 0.7 + this.getFuturePotential(choice, remaining) * 0.3
      }))
      
      const optimalChoice = weightedChoices.reduce((best, current) => 
        current.balancedScore > best.balancedScore ? current : best
      )
      
      currentPath.push(optimalChoice.step)
      remaining[optimalChoice.classId]--
    }
    
    return this.createPathFromSequence(currentPath, 'Balanced Optimal')
  }

  private async evaluateOptimalChoice(decisionPoint: DecisionPoint): Promise<ClassChoice> {
    const choices = await this.evaluateAllChoices(decisionPoint)
    return choices.reduce((best, current) => current.score > best.score ? current : best)
  }

  private async evaluateAllChoices(decisionPoint: DecisionPoint): Promise<ClassChoice[]> {
    const choices: ClassChoice[] = []
    
    for (const classId of decisionPoint.availableClasses) {
      const choice = await this.evaluateClassChoice(decisionPoint, classId)
      if (choice) {
        choices.push(choice)
      }
    }
    
    return choices
  }

  private async evaluateClassChoice(
    decisionPoint: DecisionPoint, 
    classId: string
  ): Promise<ClassChoice | null> {
    try {
      // Calculate what level this class would be at
      const currentClassLevels = this.calculateCurrentClassLevels(decisionPoint.currentPath)
      const classLevel = (currentClassLevels[classId] || 0) + 1
      
      // Create the step for this choice
      const step = await this.createLevelStep(
        decisionPoint.characterLevel,
        classId,
        classLevel,
        decisionPoint.currentPath
      )
      
      // Calculate metrics for this step
      const metrics = this.calculateLevelMetrics(step, [...decisionPoint.currentPath, step])
      
      // Evaluate based on optimization goal
      const score = this.optimizationGoal.evaluationFunction(metrics)
      
      return {
        classId,
        classLevel,
        score: isNaN(score) ? 0 : score,
        metrics,
        step
      }
    } catch (error) {
      console.warn(`Failed to evaluate choice ${classId} at level ${decisionPoint.characterLevel}:`, error)
      return null
    }
  }

  private async evaluateWithLookahead(
    decisionPoint: DecisionPoint, 
    depth: number
  ): Promise<ClassChoice> {
    if (depth === 0 || decisionPoint.availableClasses.length === 0) {
      return this.evaluateOptimalChoice(decisionPoint)
    }
    
    const choices: (ClassChoice & { totalScore: number })[] = []
    
    for (const classId of decisionPoint.availableClasses) {
      const immediateChoice = await this.evaluateClassChoice(decisionPoint, classId)
      if (!immediateChoice) continue
      
      // Look ahead to see what this choice leads to
      const nextRemaining = { ...decisionPoint.remainingLevels }
      nextRemaining[classId]--
      
      const nextDecisionPoint: DecisionPoint = {
        characterLevel: decisionPoint.characterLevel + 1,
        availableClasses: Object.keys(nextRemaining).filter(c => nextRemaining[c] > 0),
        remainingLevels: nextRemaining,
        currentPath: [...decisionPoint.currentPath, immediateChoice.step]
      }
      
      let futureScore = 0
      if (nextDecisionPoint.characterLevel <= this.maxLevel) {
        const futureChoice = await this.evaluateWithLookahead(nextDecisionPoint, depth - 1)
        futureScore = futureChoice.score
      }
      
      choices.push({
        ...immediateChoice,
        totalScore: immediateChoice.score + futureScore * 0.8 // Discount future rewards
      })
    }
    
    return choices.reduce((best, current) => 
      current.totalScore > best.totalScore ? current : best
    )
  }

  private getFuturePotential(choice: ClassChoice, remaining: Record<string, number>): number {
    let potential = 0
    
    // Consider upcoming power spikes for this class
    const upcomingLevels = remaining[choice.classId] - 1
    for (let level = choice.classLevel + 1; level <= choice.classLevel + upcomingLevels; level++) {
      if (this.isPowerSpikeLevel(choice.classId, level)) {
        potential += 10 / (level - choice.classLevel) // Closer spikes are more valuable
      }
    }
    
    // Consider synergies with other classes
    for (const [classId, levels] of Object.entries(remaining)) {
      if (classId !== choice.classId && levels > 0) {
        potential += this.calculateClassSynergy(choice.classId, classId) * levels
      }
    }
    
    return potential
  }

  private calculateCurrentClassLevels(path: LevelStepV2[]): Record<string, number> {
    const levels: Record<string, number> = {}
    for (const step of path) {
      levels[step.classId] = Math.max(levels[step.classId] || 0, step.classLevel)
    }
    return levels
  }

  private async createLevelStep(
    characterLevel: number,
    classId: string,
    classLevel: number,
    previousSteps: LevelStepV2[]
  ): Promise<LevelStepV2> {
    const progressionBuild = this.createProgressionBuild([...previousSteps, {
      level: characterLevel,
      classId,
      classLevel,
      features: [],
      dpr: 0,
      acEffective: 15,
      roleScores: {},
      keyFeatures: [],
      powerSpike: false,
      spellsAvailable: []
    }])
    
    let dprValue = 0
    try {
      const dprConfig = {
        buildId: progressionBuild.id,
        acMin: 15,
        acMax: 15,
        acStep: 1,
        advantageState: 'normal' as const,
        round0BuffsEnabled: true,
        greedyResourceUse: true,
        autoGWMSS: true,
        assumeSneakAttack: true,
        customDamageBonus: 0
      }
      
      const result = generateDPRCurves(progressionBuild, dprConfig)
      const ac15Result = result.normalCurve.find(point => point.ac === 15)
      dprValue = ac15Result?.dpr || result.normalCurve[0]?.dpr || 0
      
      if (dprValue < 0.5) {
        dprValue = this.calculateFallbackDPR(classId, classLevel, characterLevel)
      }
    } catch (error) {
      dprValue = this.calculateFallbackDPR(classId, classLevel, characterLevel)
    }
    
    const spellsAvailable = this.getAvailableSpells(classId, classLevel)
    const keyFeatures = this.getKeyFeaturesAtLevel(classId, classLevel)
    
    return {
      level: characterLevel,
      classId,
      classLevel,
      features: keyFeatures,
      dpr: dprValue,
      acEffective: 15,
      roleScores: {},
      keyFeatures,
      powerSpike: this.isPowerSpikeLevel(classId, classLevel),
      spellsAvailable: spellsAvailable || []
    }
  }

  private createProgressionBuild(steps: LevelStepV2[]): BuildConfiguration {
    const levelTimeline = steps.map(step => {
      let originalEntry = undefined
      let subclassId = undefined
      let fightingStyle = undefined
      
      if (this.targetBuild?.levelTimeline) {
        originalEntry = this.targetBuild.levelTimeline.find(l => 
          l.classId === step.classId && l.level <= step.classLevel
        )
        
        if (!originalEntry) {
          const classEntry = this.targetBuild.levelTimeline.find(l => l.classId === step.classId)
          subclassId = classEntry?.subclassId
          fightingStyle = classEntry?.fightingStyle
        } else {
          subclassId = originalEntry.subclassId
          fightingStyle = originalEntry.fightingStyle
        }
      } else if (this.customTarget) {
        // For custom targets, try to find subclass from entries
        const targetEntry = this.customTarget.entries.find(e => e.classId === step.classId)
        subclassId = targetEntry?.subclassId
      }
      
      return {
        level: step.level,
        classId: step.classId,
        subclassId,
        fightingStyle,
        features: step.features || [],
        asiOrFeat: originalEntry?.asiOrFeat,
        featId: originalEntry?.featId,
        abilityIncreases: originalEntry?.abilityIncreases,
        spells: step.spellsAvailable?.map(s => s.id) || []
      }
    })
    
    // Create a base configuration
    const baseConfig: BuildConfiguration = {
      id: `progression_${Date.now()}`,
      name: 'Progression Build',
      createdAt: new Date(),
      updatedAt: new Date(),
      race: this.targetBuild?.race || this.customTarget?.race || 'human',
      subrace: this.targetBuild?.subrace || this.customTarget?.subrace,
      background: this.targetBuild?.background || this.customTarget?.background,
      baseAbilityScores: this.targetBuild?.baseAbilityScores || this.customTarget?.baseAbilityScores || {
        STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8
      },
      abilityMethod: this.targetBuild?.abilityMethod || 'standard',
      abilityScores: this.targetBuild?.abilityScores || {
        STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8
      },
      pointBuyLimit: this.targetBuild?.pointBuyLimit || 27,
      levelTimeline,
      currentLevel: steps[steps.length - 1]?.level || 1,
      weaponEnhancements: this.targetBuild?.weaponEnhancements || [],
      weaponEnhancementBonus: this.targetBuild?.weaponEnhancementBonus || 0,
      armorEnhancementBonus: this.targetBuild?.armorEnhancementBonus || 0,
      activeBuffs: this.targetBuild?.activeBuffs || [],
      round0Buffs: this.targetBuild?.round0Buffs || []
    }
    
    return baseConfig
  }

  private calculateLevelMetrics(step: LevelStepV2, fullPath: LevelStepV2[]): LevelMetrics {
    const spellSlots = this.calculateSpellSlots(fullPath)
    
    return {
      level: step.level,
      dpr: step.dpr,
      dprWithSpells: step.dpr * 1.2, // Enhanced with spells
      survivalScore: this.calculateSurvivalScore(fullPath),
      utilityScore: this.calculateUtilityScore(fullPath),
      spellSlots,
      hasHaste: step.spellsAvailable?.some(s => s.id === 'haste') || false,
      hasExtraAttack: this.hasExtraAttackAtLevel(fullPath),
      hasPowerAttackFeat: false // Would check for GWM/SS
    }
  }

  private async createPathFromSequence(
    sequence: LevelStepV2[], 
    name: string
  ): Promise<LevelingPathV2> {
    const levelMetrics = sequence.map((step, i) => 
      this.calculateLevelMetrics(step, sequence.slice(0, i + 1))
    )
    
    const totalScore = levelMetrics.reduce((sum, metrics) => {
      const score = this.optimizationGoal.evaluationFunction(metrics)
      return sum + (isNaN(score) ? 0 : score)
    }, 0)
    
    // Create a reference build for the path result
    const referenceBuild = this.targetBuild || this.createBuildFromCustomTarget()
    
    return {
      id: `dynamic_path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      targetBuild: referenceBuild,
      sequence,
      totalScore,
      levelMetrics,
      keyMilestones: this.identifyMilestones(sequence),
      summary: this.createPathSummary(sequence, levelMetrics)
    }
  }

  // Helper methods (simplified versions of the ones from the original optimizer)
  private extractClassBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {}
    if (!this.targetBuild?.levelTimeline) {
      throw new Error('Target build must have level timeline')
    }
    
    for (const entry of this.targetBuild.levelTimeline) {
      breakdown[entry.classId] = (breakdown[entry.classId] || 0) + 1
    }
    
    return breakdown
  }

  private extractCustomTargetBreakdown(): Record<string, number> {
    const breakdown: Record<string, number> = {}
    if (!this.customTarget?.entries) {
      throw new Error('Custom target must have entries')
    }
    
    for (const entry of this.customTarget.entries) {
      breakdown[entry.classId] = (breakdown[entry.classId] || 0) + entry.levels
    }
    
    return breakdown
  }

  private createBuildFromCustomTarget(): BuildConfiguration {
    if (!this.customTarget) {
      throw new Error('Cannot create build from undefined custom target')
    }
    
    // Create level timeline from custom target entries
    const levelTimeline = []
    let currentLevel = 1
    
    for (const entry of this.customTarget.entries) {
      for (let i = 0; i < entry.levels; i++) {
        levelTimeline.push({
          level: currentLevel,
          classId: entry.classId,
          subclassId: entry.subclassId,
          features: [],
          asiOrFeat: undefined,
          featId: undefined,
          abilityIncreases: undefined,
          notes: undefined,
          fightingStyle: undefined,
          archetype: undefined,
          expertiseChoices: undefined,
          maneuverChoices: undefined,
          metamagicChoices: undefined,
          eldritchInvocationChoices: undefined,
          mysticArcanumChoices: undefined,
          pactBoonChoice: undefined,
          favoredEnemyChoice: undefined,
          naturalExplorerChoice: undefined,
          spellChoices: undefined
        })
        currentLevel++
      }
    }
    
    return {
      id: `custom_target_${Date.now()}`,
      name: this.customTarget.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      race: this.customTarget.race || 'human',
      subrace: this.customTarget.subrace,
      background: this.customTarget.background,
      baseAbilityScores: this.customTarget.baseAbilityScores || {
        STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8
      },
      abilityMethod: 'standard',
      abilityScores: this.customTarget.baseAbilityScores || {
        STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8
      },
      pointBuyLimit: 27,
      levelTimeline,
      currentLevel: this.customTarget.totalLevel,
      weaponEnhancements: [],
      weaponEnhancementBonus: 0,
      armorEnhancementBonus: 0,
      activeBuffs: [],
      round0Buffs: []
    }
  }

  private calculateFallbackDPR(classId: string, classLevel: number, characterLevel: number): number {
    let baseDPR = 3 + Math.floor(characterLevel / 4)
    
    switch (classId) {
      case 'fighter':
        if (classLevel >= 5) baseDPR += 6
        if (classLevel >= 2) baseDPR += 2
        break
      case 'rogue':
        baseDPR += Math.ceil(classLevel / 2) * 3.5
        break
      case 'barbarian':
        if (classLevel >= 5) baseDPR += 6
        if (classLevel >= 1) baseDPR += 2
        break
    }
    
    return Math.max(1, baseDPR)
  }

  private getAvailableSpells(classId: string, classLevel: number): any[] {
    const spells: any[] = []
    
    if ((classId === 'wizard' || classId === 'sorcerer') && classLevel >= 5) {
      spells.push({ id: 'haste', name: 'Haste', level: 3, impact: 'buff' })
    }
    
    if ((classId === 'ranger' || classId === 'warlock') && classLevel >= 1) {
      spells.push({ id: 'hunters_mark', name: "Hunter's Mark", level: 1, impact: 'buff' })
    }
    
    return spells
  }

  private getKeyFeaturesAtLevel(classId: string, level: number): string[] {
    const features: string[] = []
    const classData = getClass(classId)
    
    if (classData && classData.features[level]) {
      features.push(...classData.features[level].map(f => f.name))
    }
    
    return features
  }

  private isPowerSpikeLevel(classId: string, level: number): boolean {
    const powerSpikes: Record<string, number[]> = {
      fighter: [1, 2, 5, 11],
      rogue: [1, 2, 3, 5],
      barbarian: [1, 5],
      wizard: [1, 3, 5, 9],
      sorcerer: [1, 3, 5, 9]
    }
    
    return powerSpikes[classId]?.includes(level) || false
  }

  private calculateClassSynergy(class1: string, class2: string): number {
    const synergies: Record<string, Record<string, number>> = {
      fighter: { wizard: 3, rogue: 2 },
      rogue: { fighter: 2, wizard: 1 },
      wizard: { fighter: 3, rogue: 1 },
      barbarian: { fighter: 2 }
    }
    
    return synergies[class1]?.[class2] || 1
  }

  private calculateSpellSlots(sequence: LevelStepV2[]): Record<number, number> {
    // Simplified spell slot calculation
    const casterLevels: Record<string, number> = {}
    
    for (const step of sequence) {
      casterLevels[step.classId] = Math.max(casterLevels[step.classId] || 0, step.classLevel)
    }
    
    let fullCasterLevels = 0
    const fullCasters = ['wizard', 'sorcerer', 'cleric', 'druid', 'bard']
    
    for (const [classId, level] of Object.entries(casterLevels)) {
      if (fullCasters.includes(classId)) {
        fullCasterLevels += level
      }
    }
    
    const slots: Record<number, number> = {}
    if (fullCasterLevels >= 1) slots[1] = Math.min(4, fullCasterLevels + 1)
    if (fullCasterLevels >= 3) slots[2] = Math.min(3, Math.floor(fullCasterLevels / 2))
    if (fullCasterLevels >= 5) slots[3] = Math.min(3, Math.floor(fullCasterLevels / 3))
    
    return slots
  }

  private calculateSurvivalScore(sequence: LevelStepV2[]): number {
    return sequence.length * 2 + sequence.filter(s => s.classId === 'barbarian').length * 3
  }

  private calculateUtilityScore(sequence: LevelStepV2[]): number {
    return sequence.length + sequence.filter(s => s.classId === 'rogue' || s.classId === 'wizard').length * 2
  }

  private hasExtraAttackAtLevel(sequence: LevelStepV2[]): boolean {
    const martialClasses = ['fighter', 'ranger', 'paladin', 'barbarian', 'monk']
    return sequence.some(step => martialClasses.includes(step.classId) && step.classLevel >= 5)
  }

  private identifyMilestones(sequence: LevelStepV2[]): PathMilestone[] {
    const milestones: PathMilestone[] = []
    
    for (const step of sequence) {
      if (step.powerSpike) {
        milestones.push({
          level: step.level,
          name: `${step.classId} Power Spike`,
          description: `${step.classId} reaches level ${step.classLevel}`,
          impact: 'major' as const,
          category: 'combat' as const
        })
      }
    }
    
    return milestones
  }

  private createPathSummary(sequence: LevelStepV2[], metrics: LevelMetrics[]): PathSummaryV2 {
    const classBreakdown: Record<string, number> = {}
    
    for (const step of sequence) {
      classBreakdown[step.classId] = Math.max(
        classBreakdown[step.classId] || 0,
        step.classLevel
      )
    }
    
    const earlyMetrics = metrics.slice(0, 10)
    const lateMetrics = metrics.slice(10)
    
    const averageEarlyDPR = earlyMetrics.length > 0 
      ? earlyMetrics.reduce((sum, m) => sum + (isNaN(m.dprWithSpells) ? 0 : m.dprWithSpells), 0) / earlyMetrics.length
      : 0
    const averageLateDPR = lateMetrics.length > 0
      ? lateMetrics.reduce((sum, m) => sum + (isNaN(m.dprWithSpells) ? 0 : m.dprWithSpells), 0) / lateMetrics.length
      : 0
    
    const validDprValues = metrics.map(m => isNaN(m.dprWithSpells) ? 0 : m.dprWithSpells)
    const peakDPR = Math.max(...validDprValues)
    const peakLevel = metrics.findIndex(m => (isNaN(m.dprWithSpells) ? 0 : m.dprWithSpells) === peakDPR) + 1
    
    return {
      classBreakdown,
      finalLevel: sequence.length,
      averageEarlyDPR,
      averageLateDPR,
      peakDPRLevel: isNaN(peakLevel) ? 1 : peakLevel,
      survivalScore: isNaN(metrics[metrics.length - 1]?.survivalScore) ? 0 : (metrics[metrics.length - 1]?.survivalScore || 0),
      utilityScore: isNaN(metrics[metrics.length - 1]?.utilityScore) ? 0 : (metrics[metrics.length - 1]?.utilityScore || 0),
      complexity: Object.keys(classBreakdown).length > 2 ? 'complex' : 
                  Object.keys(classBreakdown).length > 1 ? 'moderate' : 'simple',
      spellCasterLevels: 0, // Simplified
      martialLevels: 0 // Simplified
    }
  }
}