import React from 'react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Star, TrendingUp, CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react'
import { buildToCombatState, getWeaponConfig } from '../../engine/simulator'
import { calculateBuildDPR } from '../../engine/calculations'
import { getBuildRating, getTreantmonkBaseline, type DPRRating } from '../../utils/dprThresholds'
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

interface AttackMetrics {
  hitBonus: number
  damageDice: string
  damageBonus: number
  hitChanceVsAC15: number
  avgDPR: number
  hitBreakdown?: {
    proficiencyBonus: number
    abilityModifier: number
    weaponEnhancement: number
    archeryBonus: number
    otherBonuses: number
  }
  damageBreakdown?: {
    abilityModifier: number
    weaponEnhancement: number
    duelingBonus: number
    otherBonuses: number
  }
}

interface HeroMetricsData {
  weaponName: string
  buildRating: DPRRating
  normalRating: DPRRating
  powerRating?: DPRRating
  normalPercentage: number
  powerPercentage?: number
  baseline: number
  keyStrength: string
  bestACRange: string
  additionalDamage: Array<{ source: string; dice: string }>
  normalAttack: AttackMetrics
  powerAttack?: AttackMetrics
  powerAttackAdvice?: string
  hasPowerAttack: boolean
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
  
  // Calculate breakdown components
  const archeryBonus = selectedFightingStyles.includes('archery') ? 2 : 0
  const otherAttackBonuses = combatState.attackBonuses.reduce((sum, bonus) => sum + bonus, 0)
  
  // Add fighting style bonuses to hit based on actual selected styles
  if (selectedFightingStyles.includes('archery')) {
    hitBonus += 2
  }
  
  const damageDice = `${weaponConfig.baseDamage.count}d${weaponConfig.baseDamage.die}`
  
  // Calculate damage bonus including fighting styles from build data
  let damageBonus = combatState.abilityModifier + 
    combatState.damageBonuses.reduce((sum, bonus) => sum + bonus, 0) + 
    (build.weaponEnhancementBonus || 0)
  
  // Calculate damage breakdown components
  const duelingBonus = selectedFightingStyles.includes('dueling') && !build.offHandWeapon ? 2 : 0
  const otherDamageBonuses = combatState.damageBonuses.reduce((sum, bonus) => sum + bonus, 0)
  
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

  // Calculate normal attack metrics vs AC 15
  const normalSimConfig: SimulationConfig = {
    targetAC: 15,
    rounds: 3,
    round0Buffs: config.round0BuffsEnabled,
    greedyResourceUse: config.greedyResourceUse,
    autoGWMSS: false // Force normal attacks
  }
  
  const normalAC15Result = calculateBuildDPR(combatState, weaponConfig, normalSimConfig)
  
  // Calculate power attack metrics if applicable
  let powerAC15Result = null
  let powerHitBonus = hitBonus
  let powerDamageBonus = damageBonus
  
  if (combatState.hasGWM || combatState.hasSharpshooter) {
    const powerSimConfig: SimulationConfig = {
      targetAC: 15,
      rounds: 3,
      round0Buffs: config.round0BuffsEnabled,
      greedyResourceUse: config.greedyResourceUse,
      autoGWMSS: false,
      forceGWMSS: true // Force power attacks
    }
    
    powerAC15Result = calculateBuildDPR(combatState, weaponConfig, powerSimConfig)
    powerHitBonus = hitBonus - 5 // -5 to hit for power attacks
    powerDamageBonus = damageBonus + 10 // +10 damage for power attacks
  }
  
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
        ...normalSimConfig, targetAC: point.ac, autoGWMSS: false 
      })
      const withPA = calculateBuildDPR(combatState, weaponConfig, { 
        ...normalSimConfig, targetAC: point.ac, autoGWMSS: true 
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
  const baseline = getTreantmonkBaseline(characterLevel)
  
  // Calculate ratings for both attack types
  const normalRating = getBuildRating(normalAC15Result.expectedDPR, normalAC15Result.hitChance, characterLevel)
  const normalPercentage = (normalAC15Result.expectedDPR / baseline) * 100
  
  let powerRating: DPRRating | undefined
  let powerPercentage: number | undefined
  if (powerAC15Result) {
    powerRating = getBuildRating(powerAC15Result.expectedDPR, powerAC15Result.hitChance, characterLevel)
    powerPercentage = (powerAC15Result.expectedDPR / baseline) * 100
  }
  
  // Overall build rating based on best available DPR
  const bestDPR = powerAC15Result && powerAC15Result.expectedDPR > normalAC15Result.expectedDPR 
    ? powerAC15Result.expectedDPR 
    : normalAC15Result.expectedDPR
  const bestHitChance = powerAC15Result && powerAC15Result.expectedDPR > normalAC15Result.expectedDPR
    ? powerAC15Result.hitChance
    : normalAC15Result.hitChance
  const buildRating = getBuildRating(bestDPR, bestHitChance, characterLevel)

  // Identify key strength
  let keyStrength = 'Consistent damage'
  if (combatState.sneakAttackDice > 0) keyStrength = 'Burst damage'
  else if (combatState.extraAttacks >= 2) keyStrength = 'Multiple attacks'
  else if (normalAC15Result.hitChance > 0.8) keyStrength = 'High accuracy'
  else if (combatState.hasGWM || combatState.hasSharpshooter) keyStrength = 'Power attacks'

  return {
    weaponName,
    buildRating,
    normalRating,
    powerRating,
    normalPercentage,
    powerPercentage,
    baseline,
    keyStrength,
    bestACRange,
    additionalDamage,
    normalAttack: {
      hitBonus,
      damageDice,
      damageBonus,
      hitChanceVsAC15: normalAC15Result.hitChance,
      avgDPR: normalAC15Result.expectedDPR,
      hitBreakdown: {
        proficiencyBonus: combatState.proficiencyBonus,
        abilityModifier: combatState.abilityModifier,
        weaponEnhancement: build.weaponEnhancementBonus || 0,
        archeryBonus,
        otherBonuses: otherAttackBonuses
      },
      damageBreakdown: {
        abilityModifier: combatState.abilityModifier,
        weaponEnhancement: build.weaponEnhancementBonus || 0,
        duelingBonus,
        otherBonuses: otherDamageBonuses
      }
    },
    powerAttack: powerAC15Result ? {
      hitBonus: powerHitBonus,
      damageDice,
      damageBonus: powerDamageBonus,
      hitChanceVsAC15: powerAC15Result.hitChance,
      avgDPR: powerAC15Result.expectedDPR
    } : undefined,
    powerAttackAdvice,
    hasPowerAttack: combatState.hasGWM || combatState.hasSharpshooter
  }
}

function getRatingColor(rating: DPRRating): string {
  switch (rating) {
    case 'excellent': return 'text-green-600 bg-green-500/10 border-green-500/20'
    case 'very-good': return 'text-blue-600 bg-blue-500/10 border-blue-500/20'
    case 'good': return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
    case 'poor': return 'text-orange-600 bg-orange-500/10 border-orange-500/20'
    case 'needs-work': return 'text-red-600 bg-red-500/10 border-red-500/20'
    default: return 'text-gray-600 bg-gray-500/10 border-gray-500/20'
  }
}


function getRatingIcon(rating: DPRRating) {
  switch (rating) {
    case 'excellent': return Star
    case 'very-good': return TrendingUp
    case 'good': return CheckCircle
    case 'poor': return AlertCircle
    case 'needs-work': return XCircle
    default: return CheckCircle
  }
}

// Helper component for info tooltips
function InfoTooltip({ children, breakdown }: { children: React.ReactNode; breakdown: string[] }) {
  return (
    <div className="group relative">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20 whitespace-nowrap">
        <div className="space-y-0.5">
          {breakdown.map((item, index) => (
            <div key={index}>{item}</div>
          ))}
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  )
}

// Helper to format breakdown tooltip
function formatBreakdown(breakdown: any, type: 'hit' | 'damage'): string[] {
  const parts: string[] = []
  
  // Show all applicable components, including zeros for transparency
  if (type === 'hit' && breakdown?.proficiencyBonus !== undefined) {
    const sign = breakdown.proficiencyBonus >= 0 ? '+' : ''
    parts.push(`Proficiency: ${sign}${breakdown.proficiencyBonus}`)
  }
  
  if (breakdown?.abilityModifier !== undefined) {
    const ability = type === 'damage' ? 'STR/DEX' : 'STR/DEX'
    const sign = breakdown.abilityModifier >= 0 ? '+' : ''
    parts.push(`${ability}: ${sign}${breakdown.abilityModifier}`)
  }
  
  if (breakdown?.weaponEnhancement !== undefined && breakdown.weaponEnhancement !== 0) {
    const sign = breakdown.weaponEnhancement >= 0 ? '+' : ''
    parts.push(`Magic Weapon: ${sign}${breakdown.weaponEnhancement}`)
  }
  
  if (breakdown?.archeryBonus !== undefined && breakdown.archeryBonus !== 0) {
    const sign = breakdown.archeryBonus >= 0 ? '+' : ''
    parts.push(`Archery: ${sign}${breakdown.archeryBonus}`)
  }
  
  if (breakdown?.duelingBonus !== undefined && breakdown.duelingBonus !== 0) {
    const sign = breakdown.duelingBonus >= 0 ? '+' : ''
    parts.push(`Dueling: ${sign}${breakdown.duelingBonus}`)
  }
  
  if (breakdown?.otherBonuses !== undefined && breakdown.otherBonuses !== 0) {
    const sign = breakdown.otherBonuses >= 0 ? '+' : ''
    parts.push(`Other: ${sign}${breakdown.otherBonuses}`)
  }
  
  return parts
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
  

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Header: Weapon Name */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent"></div>
          <span className="font-semibold text-foreground">{metrics.weaponName}</span>
        </div>

        {/* Normal Attack Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-muted uppercase tracking-wider">Normal Attack</div>
            <div className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 border ${getRatingColor(metrics.normalRating)}`}>
              {React.createElement(getRatingIcon(metrics.normalRating), { className: "w-3 h-3" })}
              <span className="capitalize">{metrics.normalRating.replace('-', ' ')}</span>
              <span className="opacity-75">({metrics.normalPercentage.toFixed(0)}%)</span>
            </div>
          </div>
          <div className="bg-muted/5 border border-border/20 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-center">
                <div className="text-xs text-muted mb-1 flex items-center justify-center gap-1">
                  To Hit
                  {metrics.normalAttack.hitBreakdown && (
                    <InfoTooltip breakdown={formatBreakdown(metrics.normalAttack.hitBreakdown, 'hit')}>
                      <Info className="w-3 h-3 text-muted hover:text-accent cursor-help" />
                    </InfoTooltip>
                  )}
                </div>
                <div className="font-semibold text-accent">+{metrics.normalAttack.hitBonus}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted mb-1 flex items-center justify-center gap-1">
                  Damage
                  {metrics.normalAttack.damageBreakdown && (
                    <InfoTooltip breakdown={formatBreakdown(metrics.normalAttack.damageBreakdown, 'damage')}>
                      <Info className="w-3 h-3 text-muted hover:text-accent cursor-help" />
                    </InfoTooltip>
                  )}
                </div>
                <div className="font-semibold text-emerald">
                  {metrics.normalAttack.damageDice}{metrics.normalAttack.damageBonus >= 0 ? '+' : ''}{metrics.normalAttack.damageBonus}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted mb-1">Avg DPR</div>
                <div className="font-semibold text-foreground">{metrics.normalAttack.avgDPR.toFixed(1)}</div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-border/10 text-center">
              <span className="text-xs text-muted">Hit vs AC 15: </span>
              <span className="text-xs font-medium text-accent">{Math.round(metrics.normalAttack.hitChanceVsAC15 * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Power Attack Section - Only show if available */}
        {metrics.hasPowerAttack && metrics.powerAttack && metrics.powerRating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-xs font-medium text-muted uppercase tracking-wider">Power Attack (-5/+10)</div>
                {metrics.powerAttackAdvice && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {metrics.powerAttackAdvice}
                  </Badge>
                )}
              </div>
              <div className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 border ${getRatingColor(metrics.powerRating)}`}>
                {React.createElement(getRatingIcon(metrics.powerRating), { className: "w-3 h-3" })}
                <span className="capitalize">{metrics.powerRating.replace('-', ' ')}</span>
                <span className="opacity-75">({metrics.powerPercentage?.toFixed(0)}%)</span>
              </div>
            </div>
            <div className="bg-purple/5 border border-purple/20 rounded-lg p-3">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <div className="text-xs text-muted mb-1">To Hit</div>
                  <div className="font-semibold text-purple">
                    +{metrics.powerAttack.hitBonus}
                    <span className="text-[10px] text-red-500 ml-1">(-5)</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted mb-1">Damage</div>
                  <div className="font-semibold text-purple">
                    {metrics.powerAttack.damageDice}{metrics.powerAttack.damageBonus >= 0 ? '+' : ''}{metrics.powerAttack.damageBonus}
                    <span className="text-[10px] text-green-500 ml-1">(+10)</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted mb-1">Avg DPR</div>
                  <div className="font-semibold text-foreground">{metrics.powerAttack.avgDPR.toFixed(1)}</div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-border/10 text-center">
                <span className="text-xs text-muted">Hit vs AC 15: </span>
                <span className="text-xs font-medium text-purple">{Math.round(metrics.powerAttack.hitChanceVsAC15 * 100)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Additional Damage Sources */}
        {metrics.additionalDamage.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted uppercase tracking-wider">Additional Damage</div>
            <div className="flex flex-wrap gap-2">
              {metrics.additionalDamage.map((dmg, idx) => (
                <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-purple/10 rounded border border-purple/20 text-xs">
                  <span className="text-muted">{dmg.source}:</span>
                  <span className="font-medium text-purple">{dmg.dice}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-muted/5 rounded">
            <div className="text-muted mb-1">Baseline</div>
            <div className="font-medium">{metrics.baseline.toFixed(1)}</div>
          </div>
          <div className="text-center p-2 bg-muted/5 rounded">
            <div className="text-muted mb-1">Best vs</div>
            <div className="font-medium text-[11px]">{metrics.bestACRange}</div>
          </div>
          <div className="text-center p-2 bg-muted/5 rounded">
            <div className="text-muted mb-1">Strength</div>
            <div className="font-medium text-[11px]">{metrics.keyStrength}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}