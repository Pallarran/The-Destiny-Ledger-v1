import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Crosshair, Shield, TrendingUp, Zap } from 'lucide-react'
import { buildToCombatState, getWeaponConfig } from '../../engine/simulator'
import { calculateBuildDPR } from '../../engine/calculations'
import type { BuildConfiguration, DPRResult } from '../../stores/types'

interface TacticalAdviceProps {
  build: BuildConfiguration | null
  result: DPRResult | null
  config: {
    round0BuffsEnabled: boolean
    greedyResourceUse: boolean
    autoGWMSS: boolean
  }
}

interface TacticalRecommendation {
  category: 'positioning' | 'targeting' | 'resources' | 'timing'
  title: string
  advice: string
  priority: 'high' | 'medium' | 'low'
  situational?: string
}

function generateTacticalAdvice(
  build: BuildConfiguration,
  result: DPRResult,
  config: { round0BuffsEnabled: boolean; greedyResourceUse: boolean; autoGWMSS: boolean }
): TacticalRecommendation[] {
  const advice: TacticalRecommendation[] = []
  const combatState = buildToCombatState(build)
  const weaponId = build.rangedWeapon || build.mainHandWeapon || 'longsword'
  const weaponConfig = getWeaponConfig(weaponId, 0)
  
  if (!weaponConfig) return advice

  // Power Attack targeting advice
  if (combatState.hasGWM || combatState.hasSharpshooter) {
    const lowAC = calculateBuildDPR(combatState, weaponConfig, {
      targetAC: 12, rounds: 3, round0Buffs: config.round0BuffsEnabled,
      greedyResourceUse: config.greedyResourceUse, autoGWMSS: false
    })
    const lowACPA = calculateBuildDPR(combatState, weaponConfig, {
      targetAC: 12, rounds: 3, round0Buffs: config.round0BuffsEnabled,
      greedyResourceUse: config.greedyResourceUse, autoGWMSS: true
    })
    const highAC = calculateBuildDPR(combatState, weaponConfig, {
      targetAC: 18, rounds: 3, round0Buffs: config.round0BuffsEnabled,
      greedyResourceUse: config.greedyResourceUse, autoGWMSS: false
    })
    const highACPA = calculateBuildDPR(combatState, weaponConfig, {
      targetAC: 18, rounds: 3, round0Buffs: config.round0BuffsEnabled,
      greedyResourceUse: config.greedyResourceUse, autoGWMSS: true
    })

    if (lowACPA.expectedDPR > lowAC.expectedDPR && highACPA.expectedDPR < highAC.expectedDPR) {
      advice.push({
        category: 'targeting',
        title: 'Smart Power Attack Targeting',
        advice: 'Use power attacks against low-AC enemies (AC 12-15), switch to normal attacks against heavily armored foes (AC 16+).',
        priority: 'high',
        situational: 'Check enemy AC before committing'
      })
    } else if (lowACPA.expectedDPR > lowAC.expectedDPR) {
      advice.push({
        category: 'targeting',
        title: 'Power Attacks Beneficial',
        advice: 'Your accuracy supports power attacks against most enemies. Use liberally for maximum damage output.',
        priority: 'medium'
      })
    } else {
      advice.push({
        category: 'targeting',
        title: 'Avoid Power Attacks',
        advice: 'Your accuracy is too low for power attacks to be effective. Focus on normal attacks and improving hit chance.',
        priority: 'high'
      })
    }
  }

  // Advantage seeking advice
  const normalDPR = result.normalCurve.find(p => p.ac === 15)?.dpr || 0
  const advantageDPR = result.advantageCurve.find(p => p.ac === 15)?.dpr || 0
  const advantageValue = advantageDPR - normalDPR

  if (advantageValue > normalDPR * 0.25) {
    advice.push({
      category: 'positioning',
      title: 'High Advantage Value',
      advice: `Advantage adds ${advantageValue.toFixed(1)} DPR. Prioritize flanking, hiding, or ally assistance for consistent advantage.`,
      priority: 'medium',
      situational: 'Worth tactical positioning'
    })
  }

  // Sneak Attack positioning
  if (combatState.sneakAttackDice > 0) {
    advice.push({
      category: 'positioning',
      title: 'Sneak Attack Setup',
      advice: `Your ${combatState.sneakAttackDice}d6 Sneak Attack requires advantage or an ally within 5ft of target. Position strategically.`,
      priority: 'high',
      situational: 'Essential for damage output'
    })
  }

  // Resource management for buffs
  if (build.activeBuffs?.length > 0 || build.round0Buffs?.length > 0) {
    advice.push({
      category: 'resources',
      title: 'Pre-Combat Preparation',
      advice: 'Your build benefits significantly from pre-combat buffs. Use them before important encounters.',
      priority: 'medium',
      situational: 'When you can predict combat'
    })
  }

  // Multi-attack optimization
  if (combatState.extraAttacks >= 1) {
    advice.push({
      category: 'targeting',
      title: 'Target Prioritization',
      advice: 'With multiple attacks, focus fire on single targets rather than spreading damage. Eliminate threats quickly.',
      priority: 'medium'
    })
  }

  // Action surge timing (if available)
  if (combatState.actionSurge) {
    advice.push({
      category: 'timing',
      title: 'Action Surge Timing',
      advice: 'Use Action Surge in round 1 when all buffs are active and you have advantage. Maximum nova damage potential.',
      priority: 'high',
      situational: 'Save for important encounters'
    })
  }

  // Range vs melee positioning
  if (weaponConfig.properties.includes('ammunition')) {
    advice.push({
      category: 'positioning',
      title: 'Ranged Positioning',
      advice: 'Stay at maximum range to avoid opportunity attacks. Use cover and elevation when possible.',
      priority: 'low'
    })
  } else if (weaponConfig.properties.includes('reach')) {
    advice.push({
      category: 'positioning',
      title: 'Reach Advantage',
      advice: 'Use your 10ft reach to attack without provoking opportunity attacks. Control battlefield positioning.',
      priority: 'medium'
    })
  }

  // Concentration protection
  if (build.activeBuffs?.some(buff => 
    ['hunters_mark', 'hex', 'bless', 'haste'].includes(buff)
  )) {
    advice.push({
      category: 'positioning',
      title: 'Protect Concentration',
      advice: 'You have concentration spells active. Avoid frontline combat and use cover to maintain buffs.',
      priority: 'high',
      situational: 'While concentrating'
    })
  }

  // Sort by priority and limit
  const priorityOrder = { high: 3, medium: 2, low: 1 }
  advice.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
  
  return advice.slice(0, 3)
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'targeting': return Crosshair
    case 'positioning': return Shield
    case 'resources': return Zap
    case 'timing': return TrendingUp
    default: return Crosshair
  }
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'targeting': return 'bg-danger/10'
    case 'positioning': return 'bg-accent/10'
    case 'resources': return 'bg-purple/10'
    case 'timing': return 'bg-emerald/10'
    default: return 'bg-muted/10'
  }
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high': return 'border-danger/20'
    case 'medium': return 'border-warning/20'
    case 'low': return 'border-muted/20'
    default: return 'border-muted/20'
  }
}

export function TacticalAdvice({ build, result, config }: TacticalAdviceProps) {
  if (!build || !result) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Crosshair className="w-4 h-4" />
            Tactical Advice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted py-8">
            <Crosshair className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">Run analysis to get tactical recommendations</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const recommendations = generateTacticalAdvice(build, result, config)

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Crosshair className="w-4 h-4" />
          Tactical Advice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {recommendations.map((rec, index) => {
          const Icon = getCategoryIcon(rec.category)
          const categoryColor = getCategoryColor(rec.category)
          const priorityColor = getPriorityColor(rec.priority)
          
          return (
            <div 
              key={index} 
              className={`p-2 rounded-lg border ${priorityColor}`}
            >
              <div className="flex items-start gap-2">
                <div className={`p-1.5 rounded ${categoryColor} flex-shrink-0`}>
                  <Icon className={`w-3 h-3 ${
                    rec.category === 'targeting' ? 'text-danger' :
                    rec.category === 'positioning' ? 'text-accent' :
                    rec.category === 'resources' ? 'text-purple' :
                    rec.category === 'timing' ? 'text-emerald' :
                    'text-muted'
                  }`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-foreground">{rec.title}</h4>
                    <Badge 
                      variant="outline" 
                      className="text-xs px-1.5 py-0 capitalize"
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted leading-relaxed mb-1">
                    {rec.advice}
                  </p>
                  {rec.situational && (
                    <p className="text-xs text-muted/70 italic">
                      {rec.situational}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        
        {recommendations.length === 0 && (
          <div className="text-center text-muted py-4">
            <div className="text-sm">No specific tactical advice available</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}