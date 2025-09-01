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

  // Build rating based on DPR and hit chance
  let buildRating: 'excellent' | 'good' | 'average' | 'needs-work'
  const avgDPR = result.averageDPR
  const hitChance = ac15Result.hitChance
  
  if (avgDPR > 25 && hitChance > 0.65) buildRating = 'excellent'
  else if (avgDPR > 18 && hitChance > 0.55) buildRating = 'good'
  else if (avgDPR > 12 && hitChance > 0.45) buildRating = 'average'
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
        {/* Weapon Info Row */}
        <div className="border-b border-border/20 pb-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">{metrics.weaponName}</span>
            <span className="text-muted">
              <span className="text-accent">+{metrics.hitBonus}</span> to hit
            </span>
            <span className="text-muted">
              {metrics.damageDice} <span className="text-accent">{metrics.damageBonus >= 0 ? '+' : ''}{metrics.damageBonus}</span>
            </span>
          </div>
          {metrics.additionalDamage.length > 0 && (
            <div className="flex items-center gap-3 mt-1 text-xs text-muted">
              {metrics.additionalDamage.map((dmg, idx) => (
                <span key={idx}>
                  {dmg.source}: <span className="text-purple">{dmg.dice}</span>
                </span>
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