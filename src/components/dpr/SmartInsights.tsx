import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { buildToCombatState, getWeaponConfig } from '../../engine/simulator'
import { calculateBuildDPR } from '../../engine/calculations'
import type { BuildConfiguration, DPRResult } from '../../stores/types'
import type { SimulationConfig } from '../../engine/types'

interface SmartInsightsProps {
  build: BuildConfiguration | null
  result: DPRResult | null
  config: {
    round0BuffsEnabled: boolean
    greedyResourceUse: boolean
    autoGWMSS: boolean
  }
}

interface Insight {
  type: 'strength' | 'weakness' | 'opportunity' | 'tip'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

function generateInsights(
  build: BuildConfiguration,
  result: DPRResult,
  config: { round0BuffsEnabled: boolean; greedyResourceUse: boolean; autoGWMSS: boolean }
): Insight[] {
  const insights: Insight[] = []
  const combatState = buildToCombatState(build)
  const weaponId = build.rangedWeapon || build.mainHandWeapon || 'longsword'
  const weaponConfig = getWeaponConfig(weaponId, 0)
  
  if (!weaponConfig) return insights

  // Calculate some reference points
  const simConfig: SimulationConfig = {
    targetAC: 15,
    rounds: 3,
    round0Buffs: config.round0BuffsEnabled,
    greedyResourceUse: config.greedyResourceUse,
    autoGWMSS: config.autoGWMSS
  }
  
  const ac15Result = calculateBuildDPR(combatState, weaponConfig, simConfig)
  const avgDPR = result.averageDPR
  const hitChance = ac15Result.hitChance

  // Analyze DPR performance
  if (avgDPR > 25) {
    insights.push({
      type: 'strength',
      title: 'Excellent Damage Output',
      description: `Your ${avgDPR.toFixed(1)} average DPR puts you in the top tier for damage dealing. You'll consistently contribute significant damage in combat.`,
      priority: 'high'
    })
  } else if (avgDPR < 12) {
    insights.push({
      type: 'weakness',
      title: 'Low Damage Output',
      description: `At ${avgDPR.toFixed(1)} average DPR, your damage is below optimal. Consider improving your weapon, ability scores, or adding damage-boosting features.`,
      priority: 'high'
    })
  }

  // Analyze accuracy
  if (hitChance < 0.5) {
    insights.push({
      type: 'weakness',
      title: 'Accuracy Concerns',
      description: `With only ${Math.round(hitChance * 100)}% hit chance vs AC 15, you'll miss frequently. Focus on improving attack bonuses before adding damage.`,
      priority: 'high'
    })
  } else if (hitChance > 0.8) {
    insights.push({
      type: 'strength',
      title: 'Excellent Accuracy',
      description: `Your ${Math.round(hitChance * 100)}% hit chance vs AC 15 means you rarely miss. This consistent accuracy amplifies your damage output.`,
      priority: 'medium'
    })
  }

  // Power attack analysis
  if (combatState.hasGWM || combatState.hasSharpshooter) {
    const withoutPA = calculateBuildDPR(combatState, weaponConfig, { ...simConfig, autoGWMSS: false })
    const withPA = calculateBuildDPR(combatState, weaponConfig, { ...simConfig, autoGWMSS: true })
    
    if (withPA.expectedDPR > withoutPA.expectedDPR * 1.1) {
      insights.push({
        type: 'strength',
        title: 'Power Attacks Excel',
        description: `Your power attacks add ${(withPA.expectedDPR - withoutPA.expectedDPR).toFixed(1)} DPR vs AC 15. Use them against most enemies for optimal damage.`,
        priority: 'medium'
      })
    } else if (withPA.expectedDPR < withoutPA.expectedDPR * 0.9) {
      insights.push({
        type: 'tip',
        title: 'Power Attacks Risky',
        description: `Power attacks reduce your DPR by ${(withoutPA.expectedDPR - withPA.expectedDPR).toFixed(1)} vs AC 15. Only use against low-AC enemies (AC 12-14).`,
        priority: 'medium'
      })
    }
  }

  // Multi-attack analysis
  if (combatState.extraAttacks >= 2) {
    insights.push({
      type: 'strength',
      title: 'Multiple Attack Synergy',
      description: `Your ${combatState.extraAttacks + 1} attacks per round create excellent synergy with on-hit effects and consistent damage application.`,
      priority: 'low'
    })
  } else if (combatState.extraAttacks === 0) {
    const level = Math.max(...(build.levelTimeline?.map(l => l.level) || [1]))
    if (level >= 5) {
      insights.push({
        type: 'opportunity',
        title: 'Missing Extra Attack',
        description: `At level ${level}, most martial builds have Extra Attack. Consider multiclassing into Fighter, Ranger, or Paladin for more attacks.`,
        priority: 'medium'
      })
    }
  }

  // Sneak attack analysis
  if (combatState.sneakAttackDice > 0) {
    insights.push({
      type: 'tip',
      title: 'Advantage Synergy',
      description: `Your ${combatState.sneakAttackDice}d6 Sneak Attack damage scales excellently with advantage. Seek flanking, hiding, or ally support.`,
      priority: 'medium'
    })
  }

  // Buff analysis
  if (build.activeBuffs?.length > 0 || build.round0Buffs?.length > 0) {
    const totalBuffs = (build.activeBuffs?.length || 0) + (build.round0Buffs?.length || 0)
    insights.push({
      type: 'strength',
      title: 'Buff Integration',
      description: `Your ${totalBuffs} active buff${totalBuffs > 1 ? 's' : ''} show good preparation. Pre-combat setup can significantly boost your effectiveness.`,
      priority: 'low'
    })
  } else {
    insights.push({
      type: 'opportunity',
      title: 'Unused Buff Potential',
      description: `Consider adding spells like Bless, Hunter's Mark, or Hex to boost your combat effectiveness. Even simple buffs can add 2-4 DPR.`,
      priority: 'low'
    })
  }

  // Advantage curve analysis
  const normalDPR = result.normalCurve.find(p => p.ac === 15)?.dpr || 0
  const advantageDPR = result.advantageCurve.find(p => p.ac === 15)?.dpr || 0
  const advantageGain = advantageDPR - normalDPR
  
  if (advantageGain > avgDPR * 0.3) {
    insights.push({
      type: 'opportunity',
      title: 'High Advantage Value',
      description: `Advantage adds ${advantageGain.toFixed(1)} DPR (${Math.round(advantageGain/normalDPR*100)}% increase) vs AC 15. Prioritize sources of advantage.`,
      priority: 'medium'
    })
  }

  // Sort by priority
  const priorityOrder = { high: 3, medium: 2, low: 1 }
  insights.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
  
  return insights
}

function getInsightIcon(type: string) {
  switch (type) {
    case 'strength': return CheckCircle
    case 'weakness': return AlertTriangle
    case 'opportunity': return TrendingUp
    case 'tip': return Info
    default: return Lightbulb
  }
}

function getInsightColor(type: string): string {
  switch (type) {
    case 'strength': return 'bg-emerald/5 border-emerald/20'
    case 'weakness': return 'bg-danger/5 border-danger/20'
    case 'opportunity': return 'bg-accent/5 border-accent/20'
    case 'tip': return 'bg-purple/5 border-purple/20'
    default: return 'bg-muted/5 border-muted/20'
  }
}

export function SmartInsights({ build, result, config }: SmartInsightsProps) {
  if (!build || !result) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="w-4 h-4" />
            Smart Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted py-8">
            <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">Run analysis to get personalized insights</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const insights = generateInsights(build, result, config)

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="w-4 h-4" />
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {insights.map((insight, index) => {
          const Icon = getInsightIcon(insight.type)
          const colors = getInsightColor(insight.type)
          
          return (
            <div 
              key={index} 
              className={`p-2 rounded-lg border ${colors}`}
            >
              <div className="flex items-start gap-2">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  insight.type === 'strength' ? 'text-emerald' :
                  insight.type === 'weakness' ? 'text-danger' :
                  insight.type === 'opportunity' ? 'text-accent' :
                  insight.type === 'tip' ? 'text-purple' :
                  'text-muted'
                }`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-foreground">{insight.title}</h4>
                    <Badge 
                      variant="outline" 
                      className="text-xs px-1.5 py-0 capitalize"
                    >
                      {insight.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
        
        {insights.length === 0 && (
          <div className="text-center text-muted py-4">
            <div className="text-sm">No specific insights available</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}