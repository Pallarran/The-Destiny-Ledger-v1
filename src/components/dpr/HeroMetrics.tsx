import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { TrendingUp, Target, Zap, Shield, Info } from 'lucide-react'
import { useState } from 'react'
import { buildToCombatState, getWeaponConfig } from '../../engine/simulator'
import { calculateBuildDPR } from '../../engine/calculations'
import type { BuildConfiguration, DPRResult } from '../../stores/types'
import type { SimulationConfig } from '../../engine/types'

interface HeroMetricsProps {
  build: BuildConfiguration | null
  result: DPRResult | null
  config: {
    round0BuffsEnabled: boolean
    greedyResourceUse: boolean
    autoGWMSS: boolean
  }
}

interface HeroMetricsData {
  avgDPR: number
  hitChanceVsAC15: number
  bestACRange: string
  powerAttackAdvice: string
  buildRating: 'excellent' | 'good' | 'average' | 'needs-work'
  keyStrength: string
  weaponName: string
  hitBonus: number
  damageDice: string
  damageBonus: number
  additionalDamage: Array<{ source: string; dice: string }>
}

function calculateHeroMetrics(
  build: BuildConfiguration, 
  result: DPRResult | null, 
  config: { round0BuffsEnabled: boolean; greedyResourceUse: boolean; autoGWMSS: boolean }
): HeroMetricsData | null {
  if (!build || !result) return null

  const combatState = buildToCombatState(build)
  const weaponId = build.rangedWeapon || build.mainHandWeapon || 'longsword'
  const weaponConfig = getWeaponConfig(weaponId, build.weaponEnhancementBonus || 0, combatState)
  
  if (!weaponConfig) return null
  
  // Calculate weapon info
  const weaponName = weaponId.charAt(0).toUpperCase() + weaponId.slice(1).replace(/_/g, ' ')
  
  // Get fighting styles directly from build data
  const selectedFightingStyles = build.levelTimeline
    .filter(entry => entry.fightingStyle)
    .map(entry => entry.fightingStyle!)
  
  // Calculate hit bonus including fighting styles from build data
  let hitBonus = combatState.proficiencyBonus + combatState.abilityModifier + 
    combatState.attackBonuses.reduce((sum, bonus) => sum + bonus, 0) + 
    (build.weaponEnhancementBonus || 0)
  
  // Add fighting style bonuses to hit based on actual selected styles
  if (selectedFightingStyles.includes('archery')) {
    hitBonus += 2
  }
  
  const damageDice = `${weaponConfig.baseDamage.count}d${weaponConfig.baseDamage.die}`
  
  // Calculate damage bonus including fighting styles from build data
  let damageBonus = combatState.abilityModifier + 
    combatState.damageBonuses.reduce((sum, bonus) => sum + bonus, 0) + 
    (build.weaponEnhancementBonus || 0)
  
  // Add fighting style bonuses to damage based on actual selected styles
  if (selectedFightingStyles.includes('dueling') && !build.offHandWeapon) {
    damageBonus += 2
  }
  
  // Collect additional damage sources
  const additionalDamage: Array<{ source: string; dice: string }> = []
  
  if (combatState.sneakAttackDice > 0) {
    additionalDamage.push({ source: 'Sneak Attack', dice: `${combatState.sneakAttackDice}d6` })
  }
  
  if (combatState.hasHuntersMark) {
    additionalDamage.push({ source: "Hunter's Mark", dice: '1d6' })
  }
  
  if (combatState.hasHex) {
    additionalDamage.push({ source: 'Hex', dice: '1d6' })
  }
  
  if (combatState.hasElementalWeapon) {
    additionalDamage.push({ source: 'Elemental Weapon', dice: '1d4' })
  }
  
  if (weaponConfig.specialProperties?.flametongue) {
    additionalDamage.push({ source: 'Flametongue', dice: '2d6' })
  }
  
  if (weaponConfig.specialProperties?.frostbrand) {
    additionalDamage.push({ source: 'Frostbrand', dice: '1d6' })
  }

  // Calculate hit chance vs AC 15 (typical enemy)
  const simConfig: SimulationConfig = {
    targetAC: 15,
    rounds: 3,
    round0Buffs: config.round0BuffsEnabled,
    greedyResourceUse: config.greedyResourceUse,
    autoGWMSS: config.autoGWMSS
  }
  
  const ac15Result = calculateBuildDPR(combatState, weaponConfig, simConfig)
  
  // Determine optimal AC range where DPR > 80% of max (where build excels)
  const maxDPR = Math.max(...result.normalCurve.map(point => point.dpr))
  const effectivePoints = result.normalCurve.filter(point => point.dpr > maxDPR * 0.8)
  const bestACRange = effectivePoints.length > 0 
    ? `AC ${Math.min(...effectivePoints.map(p => p.ac))}-${Math.max(...effectivePoints.map(p => p.ac))} (optimal)`
    : 'High AC enemies'

  // Power attack advice with specific AC thresholds
  let powerAttackAdvice = 'Not applicable'
  if (combatState.hasGWM || combatState.hasSharpshooter) {
    // Find the AC breakpoint where power attack becomes less effective
    const featName = combatState.hasGWM ? 'GWM' : 'SS'
    const paBreakpoint = result.normalCurve.find(point => {
      const withoutPA = calculateBuildDPR(combatState, weaponConfig, { 
        ...simConfig, targetAC: point.ac, autoGWMSS: false 
      })
      const withPA = calculateBuildDPR(combatState, weaponConfig, { 
        ...simConfig, targetAC: point.ac, autoGWMSS: true 
      })
      return withPA.expectedDPR <= withoutPA.expectedDPR
    })
    
    if (paBreakpoint) {
      powerAttackAdvice = `${featName}: Use vs AC ≤${paBreakpoint.ac - 1}`
    } else {
      powerAttackAdvice = `${featName}: Always beneficial`
    }
  }

  // Get character level for scaling baselines
  const characterLevel = Math.max(...(build.levelTimeline?.map(l => l.level) || [1]))
  
  // Level-adjusted DPR thresholds for build rating
  const getLevelAdjustedThresholds = (level: number) => {
    if (level <= 4) return { excellent: 15, good: 10, average: 6 }      // Tier 1
    else if (level <= 10) return { excellent: 25, good: 18, average: 12 } // Tier 2  
    else if (level <= 16) return { excellent: 35, good: 25, average: 18 } // Tier 3
    else return { excellent: 45, good: 32, average: 25 }                  // Tier 4
  }
  
  const thresholds = getLevelAdjustedThresholds(characterLevel)

  // Build rating based on level-adjusted DPR and hit chance
  let buildRating: 'excellent' | 'good' | 'average' | 'needs-work'
  const avgDPR = result.averageDPR
  const hitChance = ac15Result.hitChance
  
  if (avgDPR > thresholds.excellent && hitChance > 0.65) buildRating = 'excellent'
  else if (avgDPR > thresholds.good && hitChance > 0.55) buildRating = 'good'
  else if (avgDPR > thresholds.average && hitChance > 0.45) buildRating = 'average'
  else buildRating = 'needs-work'

  // Identify key strength
  let keyStrength = 'Consistent damage'
  if (combatState.sneakAttackDice > 0) keyStrength = 'Burst damage'
  else if (combatState.extraAttacks >= 2) keyStrength = 'Multiple attacks'
  else if (hitChance > 0.8) keyStrength = 'High accuracy'
  else if (combatState.hasGWM || combatState.hasSharpshooter) keyStrength = 'Power attacks'

  return {
    avgDPR,
    hitChanceVsAC15: hitChance,
    bestACRange,
    powerAttackAdvice,
    buildRating,
    keyStrength,
    weaponName,
    hitBonus,
    damageDice,
    damageBonus,
    additionalDamage
  }
}

function getRatingColor(rating: string): string {
  switch (rating) {
    case 'excellent': return 'text-green-600 bg-green-500/10 border-green-500/20'
    case 'good': return 'text-blue-600 bg-blue-500/10 border-blue-500/20'
    case 'average': return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20'
    case 'needs-work': return 'text-red-600 bg-red-500/10 border-red-500/20'
    default: return 'text-gray-600 bg-gray-500/10 border-gray-500/20'
  }
}

function getHitBonusBreakdown(metrics: HeroMetricsData, build: BuildConfiguration): { components: Array<{label: string, value: string}>, total: number } {
  const combatState = buildToCombatState(build)
  const weaponId = build.rangedWeapon || build.mainHandWeapon || 'longsword'
  const weaponConfig = getWeaponConfig(weaponId, build.weaponEnhancementBonus || 0, combatState)
  
  const components: Array<{label: string, value: string}> = []
  
  if (!weaponConfig) {
    return { components: [{label: 'Error', value: 'N/A'}], total: 0 }
  }
  
  // Get fighting styles directly from build data
  const selectedFightingStyles = build.levelTimeline
    .filter(entry => entry.fightingStyle)
    .map(entry => entry.fightingStyle!)
  
  // Base components
  components.push({label: 'Proficiency', value: `+${combatState.proficiencyBonus}`})
  components.push({label: 'Ability', value: `+${combatState.abilityModifier}`})
  
  // Fighting style bonuses from actual build data
  if (selectedFightingStyles.includes('archery')) {
    components.push({label: 'Archery Style', value: '+2'})
  }
  
  // Additional bonuses
  if (combatState.attackBonuses.length > 0) {
    const totalAttackBonuses = combatState.attackBonuses.reduce((sum, bonus) => sum + bonus, 0)
    if (totalAttackBonuses !== 0) {
      components.push({label: 'Features/Buffs', value: `${totalAttackBonuses >= 0 ? '+' : ''}${totalAttackBonuses}`})
    }
  }
  
  // Weapon enhancement
  if (build.weaponEnhancementBonus && build.weaponEnhancementBonus > 0) {
    components.push({label: 'Enhancement', value: `+${build.weaponEnhancementBonus}`})
  }
  
  return { components, total: metrics.hitBonus }
}

function getDamageBonusBreakdown(metrics: HeroMetricsData, build: BuildConfiguration): { components: Array<{label: string, value: string}>, total: number } {
  const combatState = buildToCombatState(build)
  const weaponId = build.rangedWeapon || build.mainHandWeapon || 'longsword'
  const weaponConfig = getWeaponConfig(weaponId, build.weaponEnhancementBonus || 0, combatState)
  
  const components: Array<{label: string, value: string}> = []
  
  if (!weaponConfig) {
    return { components: [{label: 'Error', value: 'N/A'}], total: 0 }
  }
  
  // Get fighting styles directly from build data
  const selectedFightingStyles = build.levelTimeline
    .filter(entry => entry.fightingStyle)
    .map(entry => entry.fightingStyle!)
  
  // Base components
  components.push({label: 'Ability', value: `+${combatState.abilityModifier}`})
  
  // Fighting style bonuses from actual build data
  if (selectedFightingStyles.includes('dueling') && !build.offHandWeapon) {
    components.push({label: 'Dueling Style', value: '+2'})
  }
  
  // Additional bonuses
  if (combatState.damageBonuses.length > 0) {
    const totalDamageBonuses = combatState.damageBonuses.reduce((sum, bonus) => sum + bonus, 0)
    if (totalDamageBonuses !== 0) {
      components.push({label: 'Features/Buffs', value: `${totalDamageBonuses >= 0 ? '+' : ''}${totalDamageBonuses}`})
    }
  }
  
  // Weapon enhancement
  if (build.weaponEnhancementBonus && build.weaponEnhancementBonus > 0) {
    components.push({label: 'Enhancement', value: `+${build.weaponEnhancementBonus}`})
  }
  
  return { components, total: metrics.damageBonus }
}

function getRatingIcon(rating: string) {
  switch (rating) {
    case 'excellent': return TrendingUp
    case 'good': return Target
    case 'average': return Shield
    case 'needs-work': return Zap
    default: return Target
  }
}

export function HeroMetrics({ build, result, config }: HeroMetricsProps) {
  const [showHitTooltip, setShowHitTooltip] = useState(false)
  const [showDamageTooltip, setShowDamageTooltip] = useState(false)
  
  if (!build || !result) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-muted">
            <div className="text-sm">Select a build to see key metrics</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const metrics = calculateHeroMetrics(build, result, config)
  
  if (!metrics) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-muted">
            <div className="text-sm">Unable to calculate metrics</div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  const hitBreakdown = getHitBonusBreakdown(metrics, build)
  const damageBreakdown = getDamageBonusBreakdown(metrics, build)

  const RatingIcon = getRatingIcon(metrics.buildRating)
  const ratingColors = getRatingColor(metrics.buildRating)

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {/* Weapon Info Row - Enhanced */}
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <span className="font-semibold text-foreground">{metrics.weaponName}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {/* Hit Bonus with Info Icon */}
              <div className="flex items-center gap-1 px-2 py-1 bg-accent/10 rounded border border-accent/30">
                <span className="text-muted">Hit:</span>
                <span className="font-semibold text-accent">+{metrics.hitBonus}</span>
                <div 
                  className="relative inline-flex items-center"
                  onMouseEnter={() => setShowHitTooltip(true)}
                  onMouseLeave={() => setShowHitTooltip(false)}
                >
                  <Info className="w-3 h-3 text-muted/40 hover:text-muted/70 transition-colors cursor-help ml-1" />
                  
                  {/* Hit Bonus Tooltip */}
                  {showHitTooltip && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 bg-ink text-panel text-xs rounded-lg border border-border/20 shadow-lg p-3 min-w-48">
                      <div className="space-y-1">
                        <div className="font-medium mb-2 text-accent">Hit Bonus Breakdown</div>
                        {hitBreakdown.components.map((comp, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="text-muted">{comp.label}:</span>
                            <span className="font-mono">{comp.value}</span>
                          </div>
                        ))}
                        <div className="mt-2 pt-2 border-t border-border/20 flex justify-between font-medium">
                          <span>Total:</span>
                          <span className="text-accent">+{hitBreakdown.total}</span>
                        </div>
                      </div>
                      
                      {/* Tooltip arrow */}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-ink border-l border-t border-border/20 rotate-45"></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Damage with Info Icon */}
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald/10 rounded border border-emerald/30">
                <span className="text-muted">{metrics.damageDice}</span>
                <span className="font-semibold text-emerald">
                  {metrics.damageBonus >= 0 ? '+' : ''}{metrics.damageBonus}
                </span>
                <div 
                  className="relative inline-flex items-center"
                  onMouseEnter={() => setShowDamageTooltip(true)}
                  onMouseLeave={() => setShowDamageTooltip(false)}
                >
                  <Info className="w-3 h-3 text-muted/40 hover:text-muted/70 transition-colors cursor-help ml-1" />
                  
                  {/* Damage Bonus Tooltip */}
                  {showDamageTooltip && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 bg-ink text-panel text-xs rounded-lg border border-border/20 shadow-lg p-3 min-w-48">
                      <div className="space-y-1">
                        <div className="font-medium mb-2 text-emerald">Damage Bonus Breakdown</div>
                        {damageBreakdown.components.map((comp, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="text-muted">{comp.label}:</span>
                            <span className="font-mono">{comp.value}</span>
                          </div>
                        ))}
                        <div className="mt-2 pt-2 border-t border-border/20 flex justify-between font-medium">
                          <span>Total:</span>
                          <span className="text-emerald">{damageBreakdown.total >= 0 ? '+' : ''}{damageBreakdown.total}</span>
                        </div>
                      </div>
                      
                      {/* Tooltip arrow */}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-ink border-l border-t border-border/20 rotate-45"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {metrics.additionalDamage.length > 0 && (
            <div className="flex items-center gap-3 text-xs">
              {metrics.additionalDamage.map((dmg, idx) => (
                <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-purple/10 rounded border border-purple/20">
                  <span className="text-muted">{dmg.source}:</span>
                  <span className="font-medium text-purple">{dmg.dice}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Primary Metrics */}
          <div className="space-y-3">
            {/* DPR - Main metric */}
            <div className="text-center">
              <div className="text-3xl font-bold text-accent">
                {metrics.avgDPR.toFixed(1)}
              </div>
              <div className="text-xs text-muted">Average DPR</div>
            </div>

            {/* Hit Chance */}
            <div className="text-center">
              <div className="text-xl font-semibold text-accent/80">
                {Math.round(metrics.hitChanceVsAC15 * 100)}%
              </div>
              <div className="text-xs text-muted">Hit vs AC 15</div>
            </div>
          </div>

          {/* Build Assessment */}
          <div className="space-y-3">
            {/* Rating */}
            <div className={`p-2 rounded-lg border flex items-center gap-2 ${ratingColors}`}>
              <RatingIcon className="w-4 h-4" />
              <div>
                <div className="font-medium capitalize text-xs">
                  {metrics.buildRating.replace('-', ' ')}
                </div>
                <div className="text-xs opacity-80">
                  {metrics.keyStrength}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted">Best vs:</span>
                <Badge variant="outline" className="text-xs">
                  {metrics.bestACRange}
                </Badge>
              </div>
              
              {metrics.powerAttackAdvice !== 'Not applicable' && (
                <div className="flex justify-between items-center">
                  <span className="text-muted">Power Attack:</span>
                  <span className="text-xs font-medium">
                    {metrics.powerAttackAdvice}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}