import type { BuildConfiguration } from '../stores/types'

/**
 * Core D&D 5e party roles for composition analysis
 */
export type PartyRole = 'tank' | 'damage' | 'support' | 'control' | 'utility' | 'healer'

/**
 * Synergy types between party members
 */
export type SynergyType = 
  | 'buff_stacking'      // Multiple buffs that stack together
  | 'combo_setup'        // One character sets up, another executes
  | 'resource_sharing'   // Bardic inspiration, etc.
  | 'positioning'        // Tactical positioning advantages
  | 'damage_amplification' // Vulnerability, advantage granting
  | 'defensive_layering'  // Multiple defensive abilities
  | 'spell_synergy'      // Spell combinations

/**
 * Individual party member analysis
 */
export interface PartyMemberAnalysis {
  buildId: string
  buildName: string
  level: number
  
  // Role assessment (0-10 scale)
  roleScores: Record<PartyRole, number>
  primaryRole: PartyRole
  secondaryRole?: PartyRole
  
  // Key capabilities
  capabilities: {
    averageDPR: number
    ac: number
    hitPoints: number
    savingThrows: Record<string, number> // ability -> modifier
    spellSaveDC?: number
    healingPerRound?: number
    controlOptions: number // number of control spells/abilities
  }
  
  // Unique contributions
  uniqueContributions: string[] // e.g., "Counterspell", "Healing Word", "Expertise"
}

/**
 * Synergy between two party members
 */
export interface PartySynergy {
  memberA: string // buildId
  memberB: string // buildId
  synergyType: SynergyType
  name: string // e.g., "Bless + Elven Accuracy", "Hold Person + Sneak Attack"
  description: string
  estimatedBenefit: number // 0-10 scale
  requirements?: string[] // conditions needed for synergy
}

/**
 * Overall party composition analysis
 */
export interface PartyCompositionAnalysis {
  members: PartyMemberAnalysis[]
  size: number // 1-5
  averageLevel: number
  
  // Role coverage (0-10 scale per role)
  roleCoverage: Record<PartyRole, number>
  
  // Identified synergies
  synergies: PartySynergy[]
  synergyScore: number // Overall synergy rating 0-10
  
  // Balance analysis
  balance: {
    frontline: number // Number of front-line capable members
    backline: number // Number of back-line members
    rangedDamage: number
    meleeDamage: number
    spellcasters: number
    martials: number
  }
  
  // Weakness identification
  weaknesses: Array<{
    type: 'role_gap' | 'low_synergy' | 'resource_conflict' | 'positioning_issues'
    severity: 'minor' | 'moderate' | 'major'
    description: string
    suggestions: string[]
  }>
  
  // Recommendations
  recommendations: Array<{
    type: 'add_member' | 'swap_member' | 'adjust_build' | 'tactical'
    priority: 'low' | 'medium' | 'high'
    description: string
    expectedImprovement: string
  }>
}

/**
 * Configuration for party optimization
 */
export interface PartyOptimizationConfig {
  // Party constraints
  maxSize: number // 1-5
  targetLevel?: number // If set, suggests adjustments to reach this level
  
  // Encounter assumptions
  encounterTypes: Array<'combat' | 'social' | 'exploration' | 'puzzle'>
  combatDuration: 'short' | 'medium' | 'long' // affects resource considerations
  enemyTypes: Array<'single' | 'multiple' | 'mixed'>
  
  // Optimization priorities
  priorities: {
    roleBalance: number // 0-10
    synergy: number // 0-10
    damageOutput: number // 0-10
    survivability: number // 0-10
    versatility: number // 0-10
  }
  
  // Advanced options
  considerMulticlass: boolean
  allowRespeccing: boolean
  includeHomebrewBuilds: boolean
}

/**
 * Main Party Optimizer Engine
 * 
 * Analyzes party composition, identifies synergies and weaknesses,
 * and provides recommendations for optimal party balance.
 */
export class PartyOptimizer {
  private builds: BuildConfiguration[]
  // TODO: Use config for advanced optimization features
  // private config: PartyOptimizationConfig
  
  constructor(builds: BuildConfiguration[], config: PartyOptimizationConfig) {
    this.builds = builds.slice(0, config.maxSize) // Limit to max size
    // this.config = config
  }
  
  /**
   * Perform complete party analysis
   */
  public analyze(): PartyCompositionAnalysis {
    const memberAnalyses = this.builds.map(build => this.analyzeMember(build))
    const synergies = this.identifySynergies(memberAnalyses)
    const roleCoverage = this.assessRoleCoverage(memberAnalyses)
    const balance = this.assessBalance(memberAnalyses)
    const weaknesses = this.identifyWeaknesses(memberAnalyses, roleCoverage, balance)
    const recommendations = this.generateRecommendations(memberAnalyses, weaknesses)
    
    return {
      members: memberAnalyses,
      size: this.builds.length,
      averageLevel: this.calculateAverageLevel(),
      roleCoverage,
      synergies,
      synergyScore: this.calculateSynergyScore(synergies),
      balance,
      weaknesses,
      recommendations
    }
  }
  
  /**
   * Analyze individual party member
   */
  private analyzeMember(build: BuildConfiguration): PartyMemberAnalysis {
    const level = Math.max(...(build.levelTimeline?.map(l => l.level) || [1]))
    
    // Calculate role scores based on build characteristics
    const roleScores = this.calculateRoleScores(build)
    const primaryRole = this.determinePrimaryRole(roleScores)
    const secondaryRole = this.determineSecondaryRole(roleScores, primaryRole)
    
    return {
      buildId: build.id,
      buildName: build.name,
      level,
      roleScores,
      primaryRole,
      secondaryRole,
      capabilities: this.assessCapabilities(build),
      uniqueContributions: this.identifyUniqueContributions(build)
    }
  }
  
  /**
   * Calculate role scores for a build (0-10 scale)
   */
  private calculateRoleScores(build: BuildConfiguration): Record<PartyRole, number> {
    // This would analyze the build's classes, spells, feats, etc.
    // For now, return placeholder values based on class heuristics
    const hasSpellcaster = build.levelTimeline?.some(l => 
      ['wizard', 'cleric', 'druid', 'sorcerer', 'bard', 'warlock'].includes(l.classId)
    ) || false
    
    const hasMartial = build.levelTimeline?.some(l => 
      ['fighter', 'barbarian', 'paladin', 'ranger', 'rogue', 'monk'].includes(l.classId)
    ) || false
    
    return {
      tank: hasMartial && build.levelTimeline?.some(l => ['fighter', 'barbarian', 'paladin'].includes(l.classId)) ? 8 : 2,
      damage: hasMartial || hasSpellcaster ? 7 : 3,
      support: hasSpellcaster && build.levelTimeline?.some(l => ['cleric', 'bard'].includes(l.classId)) ? 8 : 2,
      control: hasSpellcaster && build.levelTimeline?.some(l => ['wizard', 'druid', 'bard'].includes(l.classId)) ? 7 : 2,
      utility: hasSpellcaster || build.levelTimeline?.some(l => ['rogue', 'bard', 'ranger'].includes(l.classId)) ? 6 : 3,
      healer: build.levelTimeline?.some(l => ['cleric', 'druid'].includes(l.classId)) ? 9 : 
              build.levelTimeline?.some(l => ['paladin', 'ranger', 'bard'].includes(l.classId)) ? 4 : 1
    }
  }
  
  /**
   * Determine primary role based on highest score
   */
  private determinePrimaryRole(roleScores: Record<PartyRole, number>): PartyRole {
    return Object.entries(roleScores).reduce((a, b) => 
      roleScores[a[0] as PartyRole] > roleScores[b[0] as PartyRole] ? a : b
    )[0] as PartyRole
  }
  
  /**
   * Determine secondary role (second highest, must be within 2 points of primary)
   */
  private determineSecondaryRole(roleScores: Record<PartyRole, number>, primaryRole: PartyRole): PartyRole | undefined {
    const sortedRoles = Object.entries(roleScores)
      .filter(([role]) => role !== primaryRole)
      .sort((a, b) => b[1] - a[1])
    
    if (sortedRoles.length > 0 && sortedRoles[0][1] >= roleScores[primaryRole] - 2) {
      return sortedRoles[0][0] as PartyRole
    }
    return undefined
  }
  
  /**
   * Assess combat and utility capabilities
   */
  private assessCapabilities(build: BuildConfiguration): PartyMemberAnalysis['capabilities'] {
    const level = Math.max(...(build.levelTimeline?.map(l => l.level) || [1]))
    
    return {
      averageDPR: level * 6, // Placeholder estimation
      ac: 12 + level, // Placeholder
      hitPoints: level * 8, // Placeholder
      savingThrows: {
        strength: Math.floor((build.abilityScores.STR - 10) / 2),
        dexterity: Math.floor((build.abilityScores.DEX - 10) / 2),
        constitution: Math.floor((build.abilityScores.CON - 10) / 2),
        intelligence: Math.floor((build.abilityScores.INT - 10) / 2),
        wisdom: Math.floor((build.abilityScores.WIS - 10) / 2),
        charisma: Math.floor((build.abilityScores.CHA - 10) / 2)
      },
      spellSaveDC: this.calculateSpellSaveDC(build),
      healingPerRound: this.estimateHealing(build),
      controlOptions: this.countControlOptions(build)
    }
  }
  
  private calculateSpellSaveDC(build: BuildConfiguration): number | undefined {
    const hasSpellcaster = build.levelTimeline?.some(l => 
      ['wizard', 'cleric', 'druid', 'sorcerer', 'bard', 'warlock', 'paladin', 'ranger'].includes(l.classId)
    )
    if (!hasSpellcaster) return undefined
    
    // Simplified DC calculation
    const level = Math.max(...(build.levelTimeline?.map(l => l.level) || [1]))
    const profBonus = Math.ceil(level / 4) + 1
    const castingMod = 3 // Assuming +3 casting modifier average
    return 8 + profBonus + castingMod
  }
  
  private estimateHealing(build: BuildConfiguration): number | undefined {
    const hasHealer = build.levelTimeline?.some(l => 
      ['cleric', 'druid', 'paladin', 'ranger', 'bard'].includes(l.classId)
    )
    if (!hasHealer) return undefined
    
    const level = Math.max(...(build.levelTimeline?.map(l => l.level) || [1]))
    return level * 3 // Rough estimate
  }
  
  private countControlOptions(build: BuildConfiguration): number {
    const hasController = build.levelTimeline?.some(l => 
      ['wizard', 'druid', 'bard', 'warlock', 'sorcerer'].includes(l.classId)
    )
    if (!hasController) return 0
    
    const level = Math.max(...(build.levelTimeline?.map(l => l.level) || [1]))
    return Math.floor(level / 3) + 1 // Rough estimate of control spells/abilities
  }
  
  /**
   * Identify unique contributions each member brings
   */
  private identifyUniqueContributions(build: BuildConfiguration): string[] {
    const contributions: string[] = []
    const classes = build.levelTimeline?.map(l => l.classId) || []
    
    if (classes.includes('rogue')) contributions.push('Expertise', 'Sneak Attack', 'Thieves\' Tools')
    if (classes.includes('bard')) contributions.push('Bardic Inspiration', 'Jack of All Trades')
    if (classes.includes('cleric')) contributions.push('Healing', 'Turn Undead', 'Divine Magic')
    if (classes.includes('wizard')) contributions.push('Ritual Casting', 'Spell Versatility')
    if (classes.includes('paladin')) contributions.push('Lay on Hands', 'Divine Sense', 'Aura of Protection')
    if (classes.includes('barbarian')) contributions.push('Rage', 'Danger Sense')
    if (classes.includes('ranger')) contributions.push('Favored Enemy', 'Natural Explorer')
    if (classes.includes('warlock')) contributions.push('Eldritch Invocations', 'Short Rest Recovery')
    
    return contributions
  }
  
  /**
   * Identify synergies between party members
   */
  private identifySynergies(members: PartyMemberAnalysis[]): PartySynergy[] {
    const synergies: PartySynergy[] = []
    
    // Check all pairs for synergies
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const memberA = members[i]
        const memberB = members[j]
        
        // Example synergy detection (would be much more sophisticated in practice)
        if (memberA.uniqueContributions.includes('Sneak Attack') && 
            memberB.uniqueContributions.includes('Divine Magic')) {
          synergies.push({
            memberA: memberA.buildId,
            memberB: memberB.buildId,
            synergyType: 'combo_setup',
            name: 'Hold Person + Sneak Attack',
            description: 'Paralyzed enemies grant automatic critical hits for Sneak Attack',
            estimatedBenefit: 8
          })
        }
        
        if (memberA.uniqueContributions.includes('Bardic Inspiration') && 
            memberB.roleScores.damage >= 7) {
          synergies.push({
            memberA: memberA.buildId,
            memberB: memberB.buildId,
            synergyType: 'damage_amplification',
            name: 'Bardic Inspiration + High DPR',
            description: 'Bardic Inspiration boosts key attack rolls and damage',
            estimatedBenefit: 6
          })
        }
      }
    }
    
    return synergies
  }
  
  /**
   * Assess how well each role is covered by the party
   */
  private assessRoleCoverage(members: PartyMemberAnalysis[]): Record<PartyRole, number> {
    const coverage: Record<PartyRole, number> = {
      tank: 0, damage: 0, support: 0, control: 0, utility: 0, healer: 0
    }
    
    // Sum the best score for each role
    for (const role of Object.keys(coverage) as PartyRole[]) {
      const bestScore = Math.max(...members.map(m => m.roleScores[role]), 0)
      coverage[role] = Math.min(10, bestScore)
    }
    
    return coverage
  }
  
  /**
   * Assess party balance in various dimensions
   */
  private assessBalance(members: PartyMemberAnalysis[]): PartyCompositionAnalysis['balance'] {
    return {
      frontline: members.filter(m => m.roleScores.tank >= 6).length,
      backline: members.filter(m => m.roleScores.tank < 6).length,
      rangedDamage: members.filter(m => m.roleScores.damage >= 6).length, // Simplified
      meleeDamage: members.filter(m => m.roleScores.damage >= 6).length, // Simplified
      spellcasters: members.filter(m => m.capabilities.spellSaveDC !== undefined).length,
      martials: members.filter(m => m.capabilities.spellSaveDC === undefined).length
    }
  }
  
  /**
   * Identify party weaknesses
   */
  private identifyWeaknesses(
    _members: PartyMemberAnalysis[], 
    roleCoverage: Record<PartyRole, number>,
    balance: PartyCompositionAnalysis['balance']
  ): PartyCompositionAnalysis['weaknesses'] {
    const weaknesses: PartyCompositionAnalysis['weaknesses'] = []
    
    // Check for role gaps
    for (const [role, coverage] of Object.entries(roleCoverage)) {
      if (coverage < 3) {
        weaknesses.push({
          type: 'role_gap',
          severity: 'major',
          description: `Very poor ${role} coverage (${coverage}/10)`,
          suggestions: [`Add a ${role}-focused character`, `Multiclass existing member into ${role}`]
        })
      } else if (coverage < 5) {
        weaknesses.push({
          type: 'role_gap',
          severity: 'moderate',
          description: `Weak ${role} coverage (${coverage}/10)`,
          suggestions: [`Improve ${role} capabilities through feat selection`, `Consider ${role} subclass options`]
        })
      }
    }
    
    // Check for balance issues
    if (balance.frontline === 0) {
      weaknesses.push({
        type: 'positioning_issues',
        severity: 'major',
        description: 'No frontline fighters - party vulnerable to melee enemies',
        suggestions: ['Add a tank or melee fighter', 'Focus on control and positioning']
      })
    }
    
    if (balance.spellcasters === 0) {
      weaknesses.push({
        type: 'role_gap',
        severity: 'moderate',
        description: 'No spellcasters - limited magical solutions',
        suggestions: ['Add a spellcaster', 'Take Magic Initiate feats', 'Use magic items']
      })
    }
    
    return weaknesses
  }
  
  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(
    members: PartyMemberAnalysis[], 
    weaknesses: PartyCompositionAnalysis['weaknesses']
  ): PartyCompositionAnalysis['recommendations'] {
    const recommendations: PartyCompositionAnalysis['recommendations'] = []
    
    // Address major weaknesses first
    for (const weakness of weaknesses.filter(w => w.severity === 'major')) {
      recommendations.push({
        type: weakness.type === 'role_gap' ? 'add_member' : 'tactical',
        priority: 'high',
        description: weakness.suggestions[0],
        expectedImprovement: `Addresses critical ${weakness.type.replace('_', ' ')}`
      })
    }
    
    // Suggest synergy improvements
    if (members.length >= 2) {
      recommendations.push({
        type: 'tactical',
        priority: 'medium',
        description: 'Focus on coordinated tactics to maximize existing synergies',
        expectedImprovement: 'Increases effective party power through teamwork'
      })
    }
    
    return recommendations
  }
  
  /**
   * Helper methods
   */
  private calculateAverageLevel(): number {
    const levels = this.builds.map(build => 
      Math.max(...(build.levelTimeline?.map(l => l.level) || [1]))
    )
    return levels.reduce((sum, level) => sum + level, 0) / levels.length
  }
  
  private calculateSynergyScore(synergies: PartySynergy[]): number {
    if (synergies.length === 0) return 0
    const totalBenefit = synergies.reduce((sum, synergy) => sum + synergy.estimatedBenefit, 0)
    return Math.min(10, totalBenefit / synergies.length)
  }
}