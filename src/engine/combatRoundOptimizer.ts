// Combat Round Optimizer types and interfaces
import type { BuildConfiguration } from '../stores/types'

/**
 * Action types available in D&D 5e combat
 */
export type ActionType = 'action' | 'bonus' | 'reaction' | 'free' | 'movement'

/**
 * Resource types that can be consumed
 */
export type ResourceType = 'spell_slot_1' | 'spell_slot_2' | 'spell_slot_3' | 'spell_slot_4' | 'spell_slot_5' | 
  'spell_slot_6' | 'spell_slot_7' | 'spell_slot_8' | 'spell_slot_9' | 'action_surge' | 'rage' | 'ki' | 
  'sorcery_points' | 'bardic_inspiration' | 'channel_divinity'

/**
 * Individual action that can be taken in combat
 */
export interface CombatAction {
  id: string
  name: string
  actionType: ActionType
  description: string
  
  // Resource requirements
  resourceCosts?: Record<ResourceType, number>
  
  // Prerequisites for this action
  prerequisites?: {
    minLevel?: number
    classFeatures?: string[]
    spellsKnown?: string[]
    equipped?: string[] // weapons, items, etc.
  }
  
  // Expected damage output
  expectedDamage: {
    single?: number // damage vs single target
    multiple?: number // damage vs multiple targets (AoE)
    healing?: number // healing output
  }
  
  // Additional effects
  effects?: {
    buffSelf?: string[]
    debuffTarget?: string[]
    controlEffect?: 'stun' | 'prone' | 'restrained' | 'incapacitated'
    duration?: number // in rounds
  }
  
  // Restrictions on usage
  restrictions?: {
    oncePerTurn?: boolean
    oncePerRound?: boolean
    oncePerCombat?: boolean
    requiresTarget?: boolean
    rangeRestriction?: number
  }
}

/**
 * State of available resources at any point in combat
 */
export interface ResourceState {
  // Spell slots by level
  spellSlots: Record<number, number>
  
  // Class-specific resources
  actionSurges: number
  rageUses: number
  kiPoints: number
  sorceryPoints: number
  bardicInspiration: number
  channelDivinity: number
  
  // Per-encounter abilities
  usedOncePerCombat: Set<string>
  
  // Concentration tracking
  concentrationSpell?: string
}

/**
 * A planned sequence of actions for a single combat round
 */
export interface RoundPlan {
  roundNumber: number
  actions: Array<{
    action: CombatAction
    target?: 'single' | 'multiple' | 'self'
    timing?: 'start' | 'during' | 'end'
  }>
  
  // Expected outcomes
  expectedDamage: number
  expectedHealing: number
  resourcesConsumed: Partial<Record<ResourceType, number>>
  
  // State changes
  buffsGained: string[]
  debuffsApplied: string[]
  concentrationChanged?: string
}

/**
 * Complete combat optimization result
 */
export interface CombatOptimizationResult {
  totalExpectedDamage: number
  roundPlans: [RoundPlan, RoundPlan, RoundPlan] // exactly 3 rounds
  
  // Resource efficiency
  resourcesUsed: Partial<Record<ResourceType, number>>
  resourceEfficiency: number // damage per resource point
  
  // Alternative strategies
  alternativeStrategies?: {
    name: string
    totalDamage: number
    description: string
    roundPlans: [RoundPlan, RoundPlan, RoundPlan]
  }[]
}

/**
 * Configuration for combat optimization
 */
export interface CombatOptimizationConfig {
  // Target parameters  
  targetAC: number
  numberOfTargets: number
  targetType: 'single' | 'group' | 'mixed'
  
  // Combat assumptions
  roundsToOptimize: 3 // Fixed for PRD v1.3
  advantageState: 'normal' | 'advantage' | 'disadvantage'
  
  // Resource usage strategy
  resourceStrategy: 'conservative' | 'balanced' | 'aggressive'
  allowNovaDamage: boolean // spend all resources quickly
  
  // Tactical preferences
  prioritizeControl: boolean
  prioritizeSurvivability: boolean
  includeReactions: boolean
}

/**
 * Main Combat Round Optimizer Engine
 * 
 * Analyzes a character build and determines the optimal sequence of actions
 * across 3 combat rounds to maximize damage output while considering
 * resource constraints and tactical considerations.
 */
export class CombatRoundOptimizer {
  private build: BuildConfiguration
  private config: CombatOptimizationConfig
  
  constructor(build: BuildConfiguration, config: CombatOptimizationConfig) {
    this.build = build
    this.config = config
  }
  
  /**
   * Generate basic optimization result placeholder
   * In a full implementation, this would analyze the build and calculate optimal sequences
   */
  
  /**
   * Main optimization method - finds the best action sequence for 3 rounds
   */
  public optimize(): CombatOptimizationResult {
    const bestSequence = this.findOptimalSequence()
    
    return {
      totalExpectedDamage: bestSequence.totalDamage,
      roundPlans: bestSequence.roundPlans,
      resourcesUsed: bestSequence.resourcesUsed,
      resourceEfficiency: bestSequence.totalDamage / this.calculateResourceValue(bestSequence.resourcesUsed),
      alternativeStrategies: this.generateAlternativeStrategies()
    }
  }
  
  /**
   * Use dynamic programming / branch-and-bound to find optimal action sequence
   */
  private findOptimalSequence(): { 
    totalDamage: number
    roundPlans: [RoundPlan, RoundPlan, RoundPlan]
    resourcesUsed: Partial<Record<ResourceType, number>>
  } {
    // This would implement the core optimization algorithm
    // For now, return a placeholder with estimated damage based on build level
    const estimatedDamage = Math.max(...(this.build.levelTimeline?.map(l => l.level) || [1])) * 5
    
    return {
      totalDamage: estimatedDamage * 3,
      roundPlans: [
        { 
          roundNumber: 1, 
          actions: [], 
          expectedDamage: estimatedDamage, 
          expectedHealing: 0, 
          resourcesConsumed: {}, 
          buffsGained: [], 
          debuffsApplied: [] 
        },
        { 
          roundNumber: 2, 
          actions: [], 
          expectedDamage: estimatedDamage, 
          expectedHealing: 0, 
          resourcesConsumed: {}, 
          buffsGained: [], 
          debuffsApplied: [] 
        },
        { 
          roundNumber: 3, 
          actions: [], 
          expectedDamage: estimatedDamage, 
          expectedHealing: 0, 
          resourcesConsumed: {}, 
          buffsGained: [], 
          debuffsApplied: [] 
        }
      ],
      resourcesUsed: {
        action_surge: this.config.resourceStrategy === 'aggressive' ? 1 : 0
      }
    }
  }
  
  /**
   * Calculate the "value" of resources consumed (for efficiency calculation)
   */
  private calculateResourceValue(resources: Partial<Record<ResourceType, number>>): number {
    // This would assign point values to different resource types
    return Object.values(resources).reduce((sum, count) => sum + (count || 0), 1) // avoid division by zero
  }
  
  /**
   * Generate alternative strategies for comparison
   */
  private generateAlternativeStrategies(): Array<{
    name: string
    totalDamage: number
    description: string
    roundPlans: [RoundPlan, RoundPlan, RoundPlan]
  }> {
    return []
  }
}