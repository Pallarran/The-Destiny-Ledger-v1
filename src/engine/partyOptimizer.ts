import type { BuildConfiguration } from '../stores/types'
import { generateDPRCurves } from './simulator'

/**
 * Core D&D 5e party roles for composition analysis
 */
export type PartyRole = 'tank' | 'damage' | 'support' | 'control' | 'utility' | 'healer'

/**
 * Subclass role modifier for specific role contributions
 */
export interface SubclassRoleModifier {
  tank?: number
  damage?: number
  support?: number
  control?: number
  utility?: number
  healer?: number
}

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
  maxSize: number // 1-8
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
    const capabilities = this.assessCapabilities(build)
    
    // Intelligent build analysis instead of generic class assumptions
    const buildConcept = this.analyzeBuildConcept(build)
    const hasSpellcaster = build.levelTimeline?.some(l => 
      ['wizard', 'cleric', 'druid', 'sorcerer', 'bard', 'warlock'].includes(l.classId)
    ) || false
    
    const scores: Record<PartyRole, number> = {
      tank: 0,
      damage: 0,
      support: 0,
      control: 0,
      utility: 0,
      healer: 0
    }
    
    // Tank scoring based on actual defensive capabilities
    scores.tank = this.calculateTankScore(build, capabilities, buildConcept)
    
    // Damage scoring based on actual DPR and combat focus
    scores.damage = this.calculateDamageScore(build, capabilities, buildConcept)
    
    // Support/Control/Utility/Healer based on spells and abilities
    if (hasSpellcaster) {
      scores.support = build.levelTimeline?.some(l => ['cleric', 'bard'].includes(l.classId)) ? 8 : 4
      scores.control = build.levelTimeline?.some(l => ['wizard', 'druid', 'bard'].includes(l.classId)) ? 7 : 3
      scores.healer = build.levelTimeline?.some(l => ['cleric', 'druid'].includes(l.classId)) ? 9 : 
                    build.levelTimeline?.some(l => ['paladin', 'ranger', 'bard'].includes(l.classId)) ? 4 : 1
    }
    
    scores.utility = hasSpellcaster || build.levelTimeline?.some(l => ['rogue', 'bard', 'ranger'].includes(l.classId)) ? 6 : 3
    
    // Apply subclass modifiers with multiclass weighting
    const subclassModifiers = this.calculateSubclassModifiers(build)
    for (const role of Object.keys(scores) as PartyRole[]) {
      scores[role] = Math.max(0, Math.min(10, scores[role] + (subclassModifiers[role] || 0)))
    }
    
    return scores
  }

  /**
   * Calculate weighted subclass modifiers for multiclass builds
   */
  private calculateSubclassModifiers(build: BuildConfiguration): SubclassRoleModifier {
    if (!build.levelTimeline || build.levelTimeline.length === 0) {
      return {}
    }

    const totalLevel = build.levelTimeline.length
    const classLevelCounts: Record<string, number> = {}
    const classSubclasses: Record<string, string> = {}

    // Count levels per class and track subclasses
    for (const entry of build.levelTimeline) {
      classLevelCounts[entry.classId] = (classLevelCounts[entry.classId] || 0) + 1
      if (entry.subclassId) {
        classSubclasses[entry.classId] = entry.subclassId
      }
    }

    const aggregatedModifiers: SubclassRoleModifier = {}

    // Weight subclass modifiers by class level proportion
    for (const [classId, levels] of Object.entries(classLevelCounts)) {
      const subclassId = classSubclasses[classId]
      if (subclassId) {
        const weight = levels / totalLevel
        const subclassModifiers = this.getSubclassRoleModifiers(subclassId)
        
        for (const [role, modifier] of Object.entries(subclassModifiers)) {
          const roleKey = role as PartyRole
          aggregatedModifiers[roleKey] = (aggregatedModifiers[roleKey] || 0) + (modifier * weight)
        }
      }
    }

    return aggregatedModifiers
  }

  private analyzeBuildConcept(build: BuildConfiguration) {
    const isRangedBuild = build.rangedWeapon || 
      (build.levelTimeline?.find(entry => 
        entry.fightingStyle?.toLowerCase().includes('archery')
      )) ? true : false
    
    const isHeavyArmorBuild = build.armor && 
      ['plate', 'splint', 'chain'].some(armor => 
        build.armor!.toLowerCase().includes(armor)
      )
    
    const isFinesseBuild = build.mainHandWeapon && 
      ['rapier', 'shortsword', 'scimitar', 'dagger'].some(weapon => 
        build.mainHandWeapon!.toLowerCase().includes(weapon)
      )

    return {
      isRangedBuild,
      isHeavyArmorBuild,
      isFinesseBuild,
      hasShield: build.shield || false
    }
  }

  private calculateTankScore(build: BuildConfiguration, capabilities: any, concept: any): number {
    let score = 0
    
    // Heavy armor and shields strongly indicate tanking
    if (concept.isHeavyArmorBuild) score += 4
    if (concept.hasShield) score += 3
    
    // Ranged builds are typically not tanks
    if (concept.isRangedBuild) score -= 3
    
    // High AC indicates tanking capability
    if (capabilities.ac >= 18) score += 3
    else if (capabilities.ac >= 15) score += 2
    
    // Tank classes with appropriate gear
    const tankClasses = ['fighter', 'paladin', 'barbarian']
    if (build.levelTimeline?.some(l => tankClasses.includes(l.classId))) {
      if (concept.isHeavyArmorBuild || concept.hasShield) score += 2
      else score -= 1 // Tank class but not tanky gear
    }
    
    return Math.max(0, Math.min(10, score))
  }

  private calculateDamageScore(build: BuildConfiguration, capabilities: any, concept: any): number {
    let score = 0
    
    // Base DPR contribution (most important factor)
    if (capabilities.averageDPR >= 30) score += 4
    else if (capabilities.averageDPR >= 20) score += 3
    else if (capabilities.averageDPR >= 15) score += 2
    else score += 1
    
    // Martial classes typically have good damage
    const damageClasses = ['fighter', 'barbarian', 'paladin', 'ranger', 'rogue', 'monk']
    if (build.levelTimeline?.some(l => damageClasses.includes(l.classId))) score += 2
    
    // Damage spellcasters
    const blasterCasters = ['wizard', 'sorcerer', 'warlock']
    if (build.levelTimeline?.some(l => blasterCasters.includes(l.classId))) score += 2
    
    // Ranged builds are often primary damage dealers
    if (concept.isRangedBuild) score += 1
    
    return Math.max(0, Math.min(10, score))
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
   * Assess combat and utility capabilities using real calculations
   */
  private assessCapabilities(build: BuildConfiguration): PartyMemberAnalysis['capabilities'] {
    // Calculate real DPR using the same system as DPR Lab
    let averageDPR = 5 // Fallback
    try {
      const dprConfig = {
        buildId: build.id,
        acMin: 15,
        acMax: 15,
        acStep: 1,
        advantageState: 'normal' as const,
        round0BuffsEnabled: false,
        greedyResourceUse: false,
        autoGWMSS: false,
        assumeSneakAttack: false,
        customDamageBonus: 0
      }
      
      const result = generateDPRCurves(build, dprConfig)
      const ac15Result = result.normalCurve.find(point => point.ac === 15)
      averageDPR = ac15Result?.dpr || result.normalCurve[0]?.dpr || 5
    } catch (error) {
      // Use class-based estimation as fallback
      averageDPR = this.estimateDPRFromBuild(build)
    }

    // Calculate real AC from equipment
    const calculatedAC = this.calculateAC(build)
    
    // Calculate real HP
    const hitPoints = this.calculateHP(build)
    
    return {
      averageDPR,
      ac: calculatedAC,
      hitPoints,
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

  private estimateDPRFromBuild(build: BuildConfiguration): number {
    const level = build.currentLevel || 1
    let baseDPR = 3 + Math.floor(level / 4)
    
    // Analyze build for DPR multipliers
    const hasExtraAttack = build.levelTimeline?.some(l => 
      ['fighter', 'paladin', 'barbarian', 'ranger'].includes(l.classId) && l.level >= 5
    )
    if (hasExtraAttack) baseDPR *= 2
    
    const hasRogue = build.levelTimeline?.some(l => l.classId === 'rogue')
    if (hasRogue) baseDPR += Math.ceil(level / 2) * 3.5 // Sneak attack
    
    return Math.max(5, baseDPR)
  }

  private calculateAC(build: BuildConfiguration): number {
    let ac = 10 + Math.floor((build.abilityScores.DEX - 10) / 2) // Base AC + DEX
    
    if (build.armor) {
      const armor = build.armor.toLowerCase()
      if (armor.includes('leather')) ac = 11 + Math.floor((build.abilityScores.DEX - 10) / 2)
      else if (armor.includes('studded')) ac = 12 + Math.floor((build.abilityScores.DEX - 10) / 2)
      else if (armor.includes('chain')) ac = 13 + Math.min(2, Math.floor((build.abilityScores.DEX - 10) / 2))
      else if (armor.includes('scale')) ac = 14 + Math.min(2, Math.floor((build.abilityScores.DEX - 10) / 2))
      else if (armor.includes('breastplate')) ac = 14 + Math.min(2, Math.floor((build.abilityScores.DEX - 10) / 2))
      else if (armor.includes('splint')) ac = 17
      else if (armor.includes('plate')) ac = 18
    }
    
    if (build.shield) ac += 2
    if (build.armorEnhancementBonus) ac += build.armorEnhancementBonus
    
    return ac
  }

  private calculateHP(build: BuildConfiguration): number {
    const level = build.currentLevel || 1
    const conMod = Math.floor((build.abilityScores.CON - 10) / 2)
    
    let hp = 0
    if (build.levelTimeline) {
      for (const entry of build.levelTimeline) {
        const hitDie = this.getClassHitDie(entry.classId)
        hp += Math.floor(hitDie / 2) + 1 + conMod // Average roll + CON
      }
    } else {
      // Fallback calculation
      hp = level * (6 + conMod) // Assuming d8 hit die average
    }
    
    return Math.max(1, hp)
  }

  private getClassHitDie(classId: string): number {
    const hitDice: Record<string, number> = {
      barbarian: 12,
      fighter: 10,
      paladin: 10,
      ranger: 10,
      monk: 8,
      rogue: 8,
      bard: 8,
      cleric: 8,
      druid: 8,
      warlock: 8,
      wizard: 6,
      sorcerer: 6
    }
    return hitDice[classId] || 8
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

  /**
   * Get subclass-specific role modifiers
   */
  private getSubclassRoleModifiers(subclassId: string): SubclassRoleModifier {
    return SUBCLASS_ROLE_MODIFIERS[subclassId] || {}
  }
}

/**
 * Comprehensive subclass role modifiers based on mechanical analysis
 * Each modifier represents the additional role capability the subclass provides (0-4 scale)
 */
const SUBCLASS_ROLE_MODIFIERS: Record<string, SubclassRoleModifier> = {
  // Fighter Subclasses
  champion: { damage: 2, tank: 1 }, // Improved Critical, Superior Critical
  battle_master: { damage: 3, control: 2, utility: 1 }, // Maneuvers provide damage and tactical control
  eldritch_knight: { damage: 1, control: 2, utility: 2 }, // War Magic, spell utility
  purple_dragon_knight: { support: 2, healer: 1, tank: 1 }, // Rally, healing abilities

  // Rogue Subclasses  
  thief: { utility: 3, damage: 1 }, // Fast Hands, Use Magic Device
  assassin: { damage: 3, utility: 1 }, // Assassinate, Death Strike
  arcane_trickster: { control: 2, utility: 3, damage: 1 }, // Mage Hand Legerdemain, spells
  scout: { utility: 2, damage: 1 }, // Skirmisher, Superior Mobility
  swashbuckler: { damage: 2, support: 1 }, // Fancy Footwork, Panache

  // Wizard Subclasses
  evocation: { damage: 4 }, // Sculpt Spells, Overchannel
  abjuration: { tank: 3, support: 2 }, // Arcane Ward, Counterspell mastery
  divination: { control: 4, utility: 2 }, // Portent, Third Eye
  enchantment: { control: 3, support: 1 }, // Hypnotic Gaze, Charm abilities
  illusion: { control: 2, utility: 3 }, // Malleable Illusions, Illusory Reality
  necromancy: { damage: 2, utility: 1, support: 1 }, // Undead Thralls, Grim Harvest
  conjuration: { control: 2, utility: 2, support: 1 }, // Minor Conjuration, Misty Step recovery
  transmutation: { utility: 3, support: 1 }, // Minor Alchemy, Master Transmuter
  chronurgy: { control: 3, support: 2 }, // Chronal Shift, Arcane Abeyance
  graviturgy: { control: 4, damage: 1 }, // Gravity Well, Event Horizon

  // Cleric Subclasses
  life: { healer: 4, support: 2 }, // Disciple of Life, Supreme Healing
  war: { damage: 2, tank: 2 }, // War Priest, Guided Strike
  nature: { control: 1, utility: 2, healer: 2 }, // Nature's Wrath, Master of Nature
  knowledge: { utility: 4, support: 1 }, // Knowledge of the Ages, Visions of the Past
  light: { damage: 3, control: 1 }, // Burning Hands, Corona of Light
  tempest: { damage: 3, control: 2 }, // Destructive Wrath, Thunderbolt Strike
  trickery: { utility: 3, control: 1 }, // Blessing of the Trickster, Cloak of Shadows
  forge: { tank: 2, support: 2, utility: 1 }, // Blessing of the Forge, Armor/Weapon enhancement
  grave: { healer: 3, control: 2 }, // Circle of Mortality, Sentinel at Death's Door

  // Barbarian Subclasses
  berserker: { damage: 3, tank: 1 }, // Frenzy, Intimidating Presence
  totem_warrior: { tank: 3, utility: 1 }, // Totem resistances and abilities
  ancestral_guardian: { tank: 3, support: 1 }, // Ancestral Protectors, Spirit Shield
  storm_herald: { damage: 2, support: 1 }, // Storm Aura benefits party
  zealot: { damage: 4 }, // Divine Fury, Zealous Presence

  // Bard Subclasses
  lore: { support: 3, utility: 3, control: 1 }, // Cutting Words, Additional Magical Secrets
  valor: { damage: 2, tank: 1, support: 2 }, // Combat Inspiration, Extra Attack
  glamour: { support: 4, control: 1 }, // Mantle of Inspiration, Enthralling Performance
  swords: { damage: 3, utility: 1 }, // Blade Flourishes, Fighting Style
  whispers: { damage: 2, utility: 2 }, // Psychic Blades, Mantle of Whispers

  // Paladin Subclasses
  devotion: { tank: 2, support: 2, healer: 1 }, // Sacred Weapon, Turn the Unholy
  ancients: { tank: 2, control: 2, support: 1 }, // Nature's Wrath, Aura of Warding
  vengeance: { damage: 4, utility: 1 }, // Hunter's Mark, Relentless Avenger

  // Ranger Subclasses
  hunter: { damage: 3, utility: 1 }, // Hunter's Prey, Multiattack Defense
  beast_master: { damage: 1, utility: 2, support: 1 }, // Animal Companion abilities

  // Sorcerer Subclasses
  draconic_bloodline: { damage: 2, tank: 1, utility: 1 }, // Elemental Affinity, Dragon Wings
  wild_magic: { damage: 1, control: 1, utility: 2 }, // Wild Magic Surge unpredictability
  aberrant_mind: { control: 3, utility: 2 }, // Telepathic Speech, Psionic Spells
  clockwork_soul: { control: 2, support: 2, utility: 1 }, // Restore Balance, Clockwork Magic
  divine_soul: { healer: 3, support: 2 }, // Cleric spell access, Empowered Healing

  // Warlock Subclasses
  fiend: { damage: 3, healer: 1 }, // Dark One's Blessing, Fiendish Resilience
  archfey: { control: 3, utility: 1 }, // Fey Presence, Misty Escape
  great_old_one: { control: 2, utility: 2 }, // Telepathic Communication, Create Thrall
  genie: { damage: 2, utility: 3 }, // Genie's Vessel, Elemental Gift

  // Monk Subclasses
  open_hand: { control: 2, tank: 1, damage: 1 }, // Open Hand Technique, Quivering Palm
  shadow: { utility: 3, damage: 1 }, // Shadow Arts, Shadow Step
  four_elements: { damage: 2, control: 2 }, // Elemental Disciplines

  // Druid Subclasses
  land: { control: 2, utility: 2, support: 1 }, // Natural Recovery, Land's Stride
  moon: { tank: 3, damage: 2 }, // Wild Shape improvements, Elemental Wild Shape

  // Artificer Subclasses
  alchemist: { healer: 3, support: 3 }, // Experimental Elixir, Alchemical Savant
  armorer: { tank: 3, utility: 1 }, // Magical Tinkering, Armor Model features
  battle_smith: { damage: 2, support: 1, utility: 1 }, // Steel Defender, Battle Ready
}