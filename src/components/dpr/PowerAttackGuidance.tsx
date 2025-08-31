import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Zap, TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle } from 'lucide-react'
import { buildToCombatState, getWeaponConfig } from '../../engine/simulator'
import { calculateBuildDPR } from '../../engine/calculations'
import type { BuildConfiguration } from '../../stores/types'
import type { SimulationConfig } from '../../engine/types'

interface PowerAttackGuidanceProps {
  build: BuildConfiguration | null
  config: {
    round0BuffsEnabled: boolean
    greedyResourceUse: boolean
    autoGWMSS: boolean
  }
}

interface PowerAttackBreakpoint {
  ac: number
  usePowerAttack: boolean
  withPowerAttack: number
  withoutPowerAttack: number
  advantage: number
  description: string
}

function calculatePowerAttackBreakpoints(
  build: BuildConfiguration,
  config: { round0BuffsEnabled: boolean; greedyResourceUse: boolean; autoGWMSS: boolean }
): PowerAttackBreakpoint[] {
  if (!build) return []

  const combatState = buildToCombatState(build)
  const weaponId = build.rangedWeapon || build.mainHandWeapon || 'longsword'
  const weaponConfig = getWeaponConfig(weaponId, 0)
  
  if (!weaponConfig) return []

  // Check if build has GWM or Sharpshooter
  if (!combatState.hasGWM && !combatState.hasSharpshooter) return []

  const breakpoints: PowerAttackBreakpoint[] = []

  // Test key AC values
  const testACs = [10, 12, 14, 15, 16, 18, 20, 22, 25]

  for (const ac of testACs) {
    const simConfig: SimulationConfig = {
      targetAC: ac,
      rounds: 3,
      round0Buffs: config.round0BuffsEnabled,
      greedyResourceUse: config.greedyResourceUse,
      autoGWMSS: false // Test both modes explicitly
    }

    // Calculate without power attack
    const withoutPA = calculateBuildDPR(combatState, weaponConfig, simConfig)
    
    // Calculate with power attack
    const withPA = calculateBuildDPR(combatState, weaponConfig, { ...simConfig, autoGWMSS: true })

    const usePowerAttack = withPA.expectedDPR > withoutPA.expectedDPR
    const advantage = withPA.expectedDPR - withoutPA.expectedDPR

    let description = ''
    if (ac <= 12) description = 'Low AC - Easy targets'
    else if (ac <= 15) description = 'Medium AC - Typical enemies'
    else if (ac <= 18) description = 'High AC - Armored foes'
    else description = 'Very High AC - Tough enemies'

    breakpoints.push({
      ac,
      usePowerAttack,
      withPowerAttack: withPA.expectedDPR,
      withoutPowerAttack: withoutPA.expectedDPR,
      advantage,
      description
    })
  }

  return breakpoints
}

function getBestStrategy(breakpoints: PowerAttackBreakpoint[]): {
  optimalRange: string
  recommendation: string
  explanation: string
} {
  const powerAttackGood = breakpoints.filter(bp => bp.usePowerAttack)
  const normalAttackGood = breakpoints.filter(bp => !bp.usePowerAttack)

  if (powerAttackGood.length === 0) {
    return {
      optimalRange: 'Never use power attack',
      recommendation: 'Always use normal attacks',
      explanation: 'Your build\'s accuracy is too low to benefit from the -5/+10 trade-off against any AC.'
    }
  }

  if (normalAttackGood.length === 0) {
    return {
      optimalRange: 'Always use power attack',
      recommendation: 'Use GWM/SS consistently',
      explanation: 'Your build has high enough accuracy to benefit from power attacks against all targets.'
    }
  }

  // Find the transition point
  const lastPowerAttackAC = Math.max(...powerAttackGood.map(bp => bp.ac))
  const firstNormalAttackAC = Math.min(...normalAttackGood.map(bp => bp.ac))

  if (lastPowerAttackAC < firstNormalAttackAC) {
    return {
      optimalRange: `Use power attack vs AC ${Math.min(...powerAttackGood.map(bp => bp.ac))}-${lastPowerAttackAC}`,
      recommendation: 'Switch tactics by AC',
      explanation: `Use power attack against lower AC enemies (${Math.min(...powerAttackGood.map(bp => bp.ac))}-${lastPowerAttackAC}), normal attacks against higher AC (${firstNormalAttackAC}+).`
    }
  }

  return {
    optimalRange: 'Mixed effectiveness',
    recommendation: 'Situational use',
    explanation: 'Power attack effectiveness varies. Check specific AC values for optimal strategy.'
  }
}

export function PowerAttackGuidance({ build, config }: PowerAttackGuidanceProps) {
  const [showDetailed, setShowDetailed] = useState(false)

  if (!build) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Power Attack Guidance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted py-4">
            No build selected
          </div>
        </CardContent>
      </Card>
    )
  }

  const combatState = buildToCombatState(build)
  
  // Check if build has relevant feats
  if (!combatState.hasGWM && !combatState.hasSharpshooter) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Power Attack Guidance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted py-4">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted" />
            <p>No power attack feats detected</p>
            <p className="text-xs mt-1">This guidance requires Great Weapon Master or Sharpshooter</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const breakpoints = calculatePowerAttackBreakpoints(build, config)
  const strategy = getBestStrategy(breakpoints)
  const featName = combatState.hasGWM ? 'Great Weapon Master' : 'Sharpshooter'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Power Attack Guidance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Feat Detection */}
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-foreground">{featName} detected</span>
          <Badge variant="secondary" className="text-xs">
            -5 hit / +10 damage
          </Badge>
        </div>

        {/* Strategy Recommendation */}
        <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-foreground mb-1">{strategy.recommendation}</h4>
              <p className="text-sm text-muted mb-2">{strategy.explanation}</p>
              <div className="text-xs font-medium text-accent">
                {strategy.optimalRange}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-foreground">Quick Reference</h4>
            <button
              onClick={() => setShowDetailed(!showDetailed)}
              className="text-xs text-accent hover:text-accent-foreground underline"
            >
              {showDetailed ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          <div className="space-y-2">
            {breakpoints.slice(0, showDetailed ? breakpoints.length : 4).map((bp, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-3 rounded border ${
                  bp.usePowerAttack 
                    ? 'bg-green-500/5 border-green-500/20' 
                    : 'bg-red-500/5 border-red-500/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium min-w-0">
                    AC {bp.ac}
                  </div>
                  <div className="text-xs text-muted">
                    {bp.description}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      bp.usePowerAttack ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {bp.usePowerAttack ? 'Use Power Attack' : 'Use Normal Attack'}
                    </div>
                    <div className="text-xs text-muted">
                      {bp.advantage > 0 ? '+' : ''}{bp.advantage.toFixed(1)} DPR advantage
                    </div>
                  </div>
                  
                  {bp.usePowerAttack ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {!showDetailed && breakpoints.length > 4 && (
            <div className="text-center text-xs text-muted mt-2">
              +{breakpoints.length - 4} more AC values...
            </div>
          )}
        </div>

        {/* Detailed Breakdown */}
        {showDetailed && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Damage Comparison</h4>
            <div className="space-y-2 text-xs">
              {breakpoints.map((bp, index) => (
                <div key={index} className="flex items-center justify-between py-1 border-b border-border/10 last:border-b-0">
                  <span className="font-mono">AC {bp.ac}</span>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-muted">Normal:</span>
                      <span className="ml-1 font-medium">{bp.withoutPowerAttack.toFixed(1)}</span>
                    </div>
                    <div>
                      <span className="text-muted">Power:</span>
                      <span className="ml-1 font-medium">{bp.withPowerAttack.toFixed(1)}</span>
                    </div>
                    <div className={`font-medium min-w-0 ${bp.advantage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {bp.advantage > 0 ? '+' : ''}{bp.advantage.toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="pt-3 border-t border-border/20">
          <div className="text-xs text-muted space-y-1">
            <p>💡 <strong>Tip:</strong> Power attacks trade accuracy for damage (-5 to hit, +10 damage)</p>
            <p>🎯 <strong>Best when:</strong> High attack bonus or advantage on attacks</p>
            <p>⚠️ <strong>Avoid when:</strong> Low accuracy or against high-AC enemies</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}