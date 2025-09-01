import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { TrendingUp, Target, Zap, Shield } from 'lucide-react'
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
  const weaponConfig = getWeaponConfig(weaponId, 0)
  
  if (!weaponConfig) return null
  
  // Calculate weapon info
  const weaponName = weaponId.charAt(0).toUpperCase() + weaponId.slice(1).replace(/_/g, ' ')
  const hitBonus = combatState.proficiencyBonus + combatState.abilityModifier + 
    combatState.attackBonuses.reduce((sum, bonus) => sum + bonus, 0) + 
    (weaponConfig.enhancement || 0)
  const damageDice = `${weaponConfig.baseDamage.count}d${weaponConfig.baseDamage.die}`
  const damageBonus = combatState.abilityModifier + 
    combatState.damageBonuses.reduce((sum, bonus) => sum + bonus, 0) + 
    (weaponConfig.enhancement || 0)
  
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
  
  // Determine best AC range where DPR > 80% of max
  const maxDPR = Math.max(...result.normalCurve.map(point => point.dpr))
  const effectivePoints = result.normalCurve.filter(point => point.dpr > maxDPR * 0.8)
  const bestACRange = effectivePoints.length > 0 
    ? `AC ${Math.min(...effectivePoints.map(p => p.ac))}-${Math.max(...effectivePoints.map(p => p.ac))}`
    : 'High AC targets'

  // Power attack advice
  let powerAttackAdvice = 'Not applicable'
  if (combatState.hasGWM || combatState.hasSharpshooter) {
    const withoutPA = calculateBuildDPR(combatState, weaponConfig, { ...simConfig, autoGWMSS: false })
    const withPA = calculateBuildDPR(combatState, weaponConfig, { ...simConfig, autoGWMSS: true })
    
    if (withPA.expectedDPR > withoutPA.expectedDPR * 1.05) {
      powerAttackAdvice = 'Use vs low AC'
    } else if (withPA.expectedDPR > withoutPA.expectedDPR * 0.95) {
      powerAttackAdvice = 'Situational'
    } else {
      powerAttackAdvice = 'Avoid mostly'
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

function getHitBonusBreakdown(metrics: HeroMetricsData, build: BuildConfiguration): string {
  const combatState = buildToCombatState(build)
  const weaponId = build.rangedWeapon || build.mainHandWeapon || 'longsword'
  const weaponConfig = getWeaponConfig(weaponId, 0)
  
  if (!weaponConfig) return 'Hit bonus breakdown unavailable'
  
  const breakdown: string[] = []
  
  // Base components
  breakdown.push(`Proficiency: +${combatState.proficiencyBonus}`)
  breakdown.push(`Ability: +${combatState.abilityModifier}`)
  
  // Additional bonuses
  if (combatState.attackBonuses.length > 0) {
    const totalAttackBonuses = combatState.attackBonuses.reduce((sum, bonus) => sum + bonus, 0)
    if (totalAttackBonuses !== 0) {
      breakdown.push(`Features/Buffs: ${totalAttackBonuses >= 0 ? '+' : ''}${totalAttackBonuses}`)
    }
  }
  
  // Weapon enhancement
  if (weaponConfig.enhancement && weaponConfig.enhancement > 0) {
    breakdown.push(`Enhancement: +${weaponConfig.enhancement}`)
  }
  
  return `Hit Bonus Breakdown:\n${breakdown.join('\n')}\nTotal: +${metrics.hitBonus}`
}

function getDamageBonusBreakdown(metrics: HeroMetricsData, build: BuildConfiguration): string {
  const combatState = buildToCombatState(build)
  const weaponId = build.rangedWeapon || build.mainHandWeapon || 'longsword'
  const weaponConfig = getWeaponConfig(weaponId, 0)
  
  if (!weaponConfig) return 'Damage bonus breakdown unavailable'
  
  const breakdown: string[] = []
  
  // Base components
  breakdown.push(`Ability: +${combatState.abilityModifier}`)
  
  // Additional bonuses
  if (combatState.damageBonuses.length > 0) {
    const totalDamageBonuses = combatState.damageBonuses.reduce((sum, bonus) => sum + bonus, 0)
    if (totalDamageBonuses !== 0) {
      breakdown.push(`Features/Buffs: ${totalDamageBonuses >= 0 ? '+' : ''}${totalDamageBonuses}`)
    }
  }
  
  // Weapon enhancement
  if (weaponConfig.enhancement && weaponConfig.enhancement > 0) {
    breakdown.push(`Enhancement: +${weaponConfig.enhancement}`)
  }
  
  return `Damage Bonus Breakdown:\n${breakdown.join('\n')}\nTotal: ${metrics.damageBonus >= 0 ? '+' : ''}${metrics.damageBonus}`
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
              {/* Hit Bonus with Tooltip */}
              <div 
                className="flex items-center gap-1 px-2 py-1 bg-accent/10 rounded border border-accent/30 cursor-help" 
                title={getHitBonusBreakdown(metrics, build)}
              >
                <span className="text-muted">Hit:</span>
                <span className="font-semibold text-accent">+{metrics.hitBonus}</span>
              </div>
              {/* Damage with Tooltip */}
              <div 
                className="flex items-center gap-1 px-2 py-1 bg-emerald/10 rounded border border-emerald/30 cursor-help"
                title={getDamageBonusBreakdown(metrics, build)}
              >
                <span className="text-muted">{metrics.damageDice}</span>
                <span className="font-semibold text-emerald">
                  {metrics.damageBonus >= 0 ? '+' : ''}{metrics.damageBonus}
                </span>
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
                <span className="text-muted">Effective vs:</span>
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