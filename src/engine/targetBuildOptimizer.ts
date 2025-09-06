import type { BuildConfiguration } from '../stores/types'
import type { AbilityScoreArray } from '../rules/types'

// Optimization objectives for target build path planning
export interface OptimizationGoal {
  id: string
  name: string
  description: string
  category: 'combat' | 'survival' | 'utility' | 'balanced'
  evaluationFunction: (path: LevelingPath, level: number) => number
}

// A specific leveling sequence to reach a target build
export interface LevelingPath {
  id: string
  name: string
  targetBuild: BuildConfiguration
  sequence: LevelStep[]
  totalScore: number
  levelScores: number[]
  keyMilestones: PathMilestone[]
  summary: PathSummary
}

export interface LevelStep {
  level: number
  classId: string
  subclassId?: string
  features: string[]
  asiOrFeat?: 'asi' | 'feat'
  featId?: string
  abilityIncreases?: Partial<AbilityScoreArray>
  spells?: string[]
  // Analysis for this step
  dpr?: number
  roleScores?: Record<string, number>
  keyFeatures: string[]
  powerSpike: boolean
}

export interface PathMilestone {
  level: number
  name: string
  description: string
  impact: 'major' | 'moderate' | 'minor'
  category: 'combat' | 'spells' | 'utility' | 'defense'
}

export interface PathSummary {
  classBreakdown: Record<string, number>
  finalLevel: number
  averageEarlyDPR: number  // Levels 1-10
  averageLateDPR: number   // Levels 11-20
  peakDPRLevel: number
  survivalScore: number
  utilityScore: number
  complexity: 'simple' | 'moderate' | 'complex'
}

// Predefined optimization goals
export const OPTIMIZATION_GOALS: Record<string, OptimizationGoal> = {
  early_dpr: {
    id: 'early_dpr',
    name: 'Early Game DPR',
    description: 'Maximize damage per round in levels 1-10',
    category: 'combat',
    evaluationFunction: (path, _level) => {
      if (_level <= 10) {
        return path.levelScores[_level - 1] || 0
      }
      // Diminishing returns for later levels
      return (path.levelScores[_level - 1] || 0) * 0.3
    }
  },
  
  late_dpr: {
    id: 'late_dpr', 
    name: 'Late Game DPR',
    description: 'Maximize damage per round in levels 11-20',
    category: 'combat',
    evaluationFunction: (path, _level) => {
      if (_level >= 11) {
        return path.levelScores[_level - 1] || 0
      }
      // Early levels matter less
      return (path.levelScores[_level - 1] || 0) * 0.5
    }
  },

  consistent_dpr: {
    id: 'consistent_dpr',
    name: 'Consistent DPR',
    description: 'Maintain steady damage throughout all levels',
    category: 'combat', 
    evaluationFunction: (path, _level) => {
      const currentScore = path.levelScores[_level - 1] || 0
      
      // Penalize large power gaps
      if (_level > 1) {
        const previousScore = path.levelScores[_level - 2] || 0
        const variance = Math.abs(currentScore - previousScore)
        return currentScore - (variance * 0.2)
      }
      return currentScore
    }
  },

  early_survival: {
    id: 'early_survival',
    name: 'Early Survivability', 
    description: 'Prioritize HP, AC, and saves in early levels',
    category: 'survival',
    evaluationFunction: (_path, _level) => {
      // Implementation would analyze HP, AC, saving throw bonuses
      // Placeholder for now
      return _level <= 10 ? _level * 2 : _level
    }
  },

  spell_progression: {
    id: 'spell_progression',
    name: 'Spell Progression',
    description: 'Optimize spell slot and spell level progression',
    category: 'utility',
    evaluationFunction: (_path, _level) => {
      // Would analyze spell slots available and highest spell level
      // Placeholder for now  
      return _level * 1.5
    }
  },

  multiclass_synergy: {
    id: 'multiclass_synergy',
    name: 'Multiclass Synergy',
    description: 'Maximize synergistic interactions between classes',
    category: 'balanced',
    evaluationFunction: (_path, _level) => {
      // Would analyze class feature interactions
      // Placeholder for now
      return _level
    }
  },

  skill_monkey: {
    id: 'skill_monkey', 
    name: 'Skill Monkey',
    description: 'Optimize skill proficiencies and expertise timing',
    category: 'utility',
    evaluationFunction: (_path, _level) => {
      // Would count skills, expertise, and utility features
      // Placeholder for now
      return _level * 1.2
    }
  },

  nova_damage: {
    id: 'nova_damage',
    name: 'Nova Damage',  
    description: 'Optimize for maximum single-round burst damage',
    category: 'combat',
    evaluationFunction: (_path, _level) => {
      // Would analyze spell slots, smites, action surge, etc.
      // Placeholder for now
      return _level * 3
    }
  }
}

export class TargetBuildOptimizer {
  private targetBuild: BuildConfiguration
  private optimizationGoal: OptimizationGoal

  constructor(targetBuild: BuildConfiguration, goalId: string) {
    this.targetBuild = targetBuild
    this.optimizationGoal = OPTIMIZATION_GOALS[goalId]
    
    if (!this.optimizationGoal) {
      throw new Error(`Unknown optimization goal: ${goalId}`)
    }
  }

  // Main method: generate optimal leveling paths for the target build
  async generateLevelingPaths(): Promise<LevelingPath[]> {
    console.log('Generating leveling paths for target build:', this.targetBuild.name)
    console.log('Optimization goal:', this.optimizationGoal.name)

    // Extract target class breakdown from the build
    const targetBreakdown = this.extractClassBreakdown()
    
    // Generate all possible leveling sequences
    const possibleSequences = this.generateLevelingSequences(targetBreakdown)
    
    // Evaluate each sequence
    const evaluatedPaths: LevelingPath[] = []
    
    for (const sequence of possibleSequences) {
      const path = await this.evaluateLevelingSequence(sequence)
      evaluatedPaths.push(path)
    }
    
    // Sort by total score and return top results
    return evaluatedPaths
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5) // Return top 5 paths
  }

  // Extract class level breakdown from target build
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

  // Generate all possible leveling sequences to reach target breakdown
  private generateLevelingSequences(targetBreakdown: Record<string, number>): LevelStep[][] {
    const sequences: LevelStep[][] = []
    
    // This is a complex combinatorial problem
    // For now, generate some common patterns
    
    // Pattern 1: Single class to milestone, then multiclass
    // Pattern 2: Early multiclass for synergy
    // Pattern 3: Alternating levels
    // Pattern 4: Late multiclass for capstone
    
    // Implementation placeholder - would need sophisticated algorithm
    
    // Generate at least one simple sequence for testing
    const simpleSequence: LevelStep[] = []
    let currentLevel = 1
    
    for (const [classId, levels] of Object.entries(targetBreakdown)) {
      for (let i = 0; i < levels; i++) {
        simpleSequence.push({
          level: currentLevel++,
          classId,
          features: [],
          keyFeatures: [],
          powerSpike: false
        })
      }
    }
    
    sequences.push(simpleSequence)
    
    return sequences
  }

  // Evaluate a specific leveling sequence
  private async evaluateLevelingSequence(sequence: LevelStep[]): Promise<LevelingPath> {
    const levelScores: number[] = []
    let totalScore = 0
    
    // Create a build configuration for each level and evaluate
    for (let i = 0; i < sequence.length; i++) {
      const currentLevel = i + 1
      const partialBuild = this.createPartialBuild(sequence.slice(0, i + 1))
      
      // Calculate score for this level
      const levelScore = await this.evaluatePartialBuild(partialBuild, currentLevel)
      levelScores.push(levelScore)
      
      // Apply optimization goal weighting
      const weightedScore = this.optimizationGoal.evaluationFunction({ 
        levelScores, 
        targetBuild: this.targetBuild 
      } as LevelingPath, currentLevel)
      
      totalScore += weightedScore
    }

    return {
      id: `path_${Date.now()}`,
      name: `${this.optimizationGoal.name} Path`,
      targetBuild: this.targetBuild,
      sequence,
      totalScore,
      levelScores,
      keyMilestones: this.identifyMilestones(sequence),
      summary: this.createPathSummary(sequence, levelScores)
    }
  }

  // Create partial build for evaluation
  private createPartialBuild(partialSequence: LevelStep[]): BuildConfiguration {
    // Create a simplified build config based on the sequence so far
    const levelTimeline = partialSequence.map((step, index) => ({
      level: index + 1,
      classId: step.classId,
      subclassId: step.subclassId,
      features: step.features,
      asiOrFeat: step.asiOrFeat,
      featId: step.featId,
      abilityIncreases: step.abilityIncreases,
      spells: step.spells
    }))

    return {
      ...this.targetBuild,
      levelTimeline,
      currentLevel: partialSequence.length
    }
  }

  // Evaluate partial build (placeholder - would use DPR calculator, role scoring, etc.)
  private async evaluatePartialBuild(_build: BuildConfiguration, level: number): Promise<number> {
    // This would integrate with existing DPR calculation and role scoring
    // For now, return a placeholder score
    return level * 5 + Math.random() * 10
  }

  // Identify key milestones in the leveling path
  private identifyMilestones(sequence: LevelStep[]): PathMilestone[] {
    const milestones: PathMilestone[] = []
    
    // Look for common power spikes
    for (let i = 0; i < sequence.length; i++) {
      const step = sequence[i]
      const level = step.level
      
      // Check for major milestones
      if (level === 5) {
        milestones.push({
          level,
          name: 'Tier 2 Milestone',
          description: 'Extra Attack and 3rd level spells available',
          impact: 'major',
          category: 'combat'
        })
      }
      
      if (level === 11) {
        milestones.push({
          level, 
          name: 'Tier 3 Milestone',
          description: '6th level spells and improved class features',
          impact: 'major',
          category: 'combat'
        })
      }
      
      // Add more milestone detection logic
    }
    
    return milestones
  }

  // Create summary of the leveling path
  private createPathSummary(sequence: LevelStep[], levelScores: number[]): PathSummary {
    const classBreakdown: Record<string, number> = {}
    
    for (const step of sequence) {
      classBreakdown[step.classId] = (classBreakdown[step.classId] || 0) + 1
    }
    
    const earlyScores = levelScores.slice(0, 10)
    const lateScores = levelScores.slice(10)
    
    const averageEarlyDPR = earlyScores.reduce((sum, score) => sum + score, 0) / earlyScores.length
    const averageLateDPR = lateScores.length > 0 
      ? lateScores.reduce((sum, score) => sum + score, 0) / lateScores.length 
      : 0
      
    const peakDPRLevel = levelScores.indexOf(Math.max(...levelScores)) + 1
    
    return {
      classBreakdown,
      finalLevel: sequence.length,
      averageEarlyDPR,
      averageLateDPR,
      peakDPRLevel,
      survivalScore: 0, // Placeholder
      utilityScore: 0,  // Placeholder
      complexity: Object.keys(classBreakdown).length > 2 ? 'complex' : 'moderate'
    }
  }
}

// Helper function to get available optimization goals
export function getOptimizationGoals(): OptimizationGoal[] {
  return Object.values(OPTIMIZATION_GOALS)
}

// Helper function to get goals by category
export function getGoalsByCategory(category: string): OptimizationGoal[] {
  return Object.values(OPTIMIZATION_GOALS).filter(goal => goal.category === category)
}