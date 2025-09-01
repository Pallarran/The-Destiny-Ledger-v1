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
  normal: {
    withPowerAttack: number
    withoutPowerAttack: number
    usePowerAttack: boolean
    advantage: number
  }
  withAdvantage: {
    withPowerAttack: number
    withoutPowerAttack: number
    usePowerAttack: boolean
    advantage: number
  }
  withDisadvantage: {
    withPowerAttack: number
    withoutPowerAttack: number
    usePowerAttack: boolean
    advantage: number
  }
}

interface ACRange {
  start: number
  end: number
  recommendation: 'power' | 'normal'
}

function calculatePowerAttackBreakpoints(
  build: BuildConfiguration,
  config: { round0BuffsEnabled: boolean; greedyResourceUse: boolean; autoGWMSS: boolean }
): PowerAttackBreakpoint[] {
  if (!build) return []

  const combatState = buildToCombatState(build)
  const weaponId = build.rangedWeapon || build.mainHandWeapon || 'longsword'
  const weaponConfig = getWeaponConfig(weaponId, build.weaponEnhancementBonus || 0, combatState)
  
  if (!weaponConfig) return []

  // Check if build has GWM or Sharpshooter
  if (!combatState.hasGWM && !combatState.hasSharpshooter) return []

  const breakpoints: PowerAttackBreakpoint[] = []

  // Test comprehensive AC range
  const testACs = []
  for (let ac = 10; ac <= 30; ac++) {
    testACs.push(ac)
  }

  for (const ac of testACs) {
    const simConfig: SimulationConfig = {
      targetAC: ac,
      rounds: 3,
      round0Buffs: config.round0BuffsEnabled,
      greedyResourceUse: config.greedyResourceUse,
      autoGWMSS: false // We'll calculate both explicitly
    }

    // Normal attacks
    const normalState = combatState
    const normalResult = calculateBuildDPR(normalState, weaponConfig, simConfig)
    
    // Advantage
    const advState = { ...combatState, hasAdvantage: true, hasDisadvantage: false }
    const advResult = calculateBuildDPR(advState, weaponConfig, simConfig)
    
    // Disadvantage
    const disState = { ...combatState, hasAdvantage: false, hasDisadvantage: true }
    const disResult = calculateBuildDPR(disState, weaponConfig, simConfig)

    breakpoints.push({
      ac,
      normal: {
        withPowerAttack: normalResult.withPowerAttack || 0,
        withoutPowerAttack: normalResult.withoutPowerAttack || 0,
        usePowerAttack: (normalResult.withPowerAttack || 0) > (normalResult.withoutPowerAttack || 0),
        advantage: (normalResult.withPowerAttack || 0) - (normalResult.withoutPowerAttack || 0)
      },
      withAdvantage: {
        withPowerAttack: advResult.withPowerAttack || 0,
        withoutPowerAttack: advResult.withoutPowerAttack || 0,
        usePowerAttack: (advResult.withPowerAttack || 0) > (advResult.withoutPowerAttack || 0),
        advantage: (advResult.withPowerAttack || 0) - (advResult.withoutPowerAttack || 0)
      },
      withDisadvantage: {
        withPowerAttack: disResult.withPowerAttack || 0,
        withoutPowerAttack: disResult.withoutPowerAttack || 0,
        usePowerAttack: (disResult.withPowerAttack || 0) > (disResult.withoutPowerAttack || 0),
        advantage: (disResult.withPowerAttack || 0) - (disResult.withoutPowerAttack || 0)
      }
    })
  }

  return breakpoints
}

function findACRanges(breakpoints: PowerAttackBreakpoint[], state: 'normal' | 'withAdvantage' | 'withDisadvantage'): ACRange[] {
  const ranges: ACRange[] = []
  let currentRange: ACRange | null = null
  
  for (const bp of breakpoints) {
    const usePowerAttack = bp[state].usePowerAttack
    const recommendation = usePowerAttack ? 'power' : 'normal'
    
    if (!currentRange || currentRange.recommendation !== recommendation) {
      if (currentRange) {
        ranges.push(currentRange)
      }
      currentRange = {
        start: bp.ac,
        end: bp.ac,
        recommendation
      }
    } else {
      currentRange.end = bp.ac
    }
  }
  
  if (currentRange) {
    ranges.push(currentRange)
  }
  
  return ranges
}


export function PowerAttackGuidance({ build, config }: PowerAttackGuidanceProps) {
  const [showDetailed, setShowDetailed] = useState(false)
  const [selectedAdvantageState, setSelectedAdvantageState] = useState<'normal' | 'withAdvantage' | 'withDisadvantage'>('normal')

  if (!build) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Power Attack Analysis
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
            Power Attack Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted py-4">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted" />
            <p>No power attack feats detected</p>
            <p className="text-xs mt-1">This analysis requires Great Weapon Master or Sharpshooter</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const breakpoints = calculatePowerAttackBreakpoints(build, config)
  const featName = combatState.hasGWM ? 'Great Weapon Master' : 'Sharpshooter'
  
  // Get AC ranges for each advantage state
  const normalRanges = findACRanges(breakpoints, 'normal')
  const advantageRanges = findACRanges(breakpoints, 'withAdvantage')
  const disadvantageRanges = findACRanges(breakpoints, 'withDisadvantage')
  
  // Get currently selected ranges
  const currentRanges = selectedAdvantageState === 'normal' ? normalRanges :
                       selectedAdvantageState === 'withAdvantage' ? advantageRanges :
                       disadvantageRanges

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Power Attack Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Feat Detection */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-foreground">{featName}</span>
            <Badge variant="secondary" className="text-xs">
              -5 hit / +10 damage
            </Badge>
          </div>
        </div>

        {/* Advantage State Selector */}
        <div className="flex gap-2 p-1 bg-muted/20 rounded-lg">
          <button
            onClick={() => setSelectedAdvantageState('withDisadvantage')}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-colors ${
              selectedAdvantageState === 'withDisadvantage' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted hover:text-foreground'
            }`}
          >
            Disadvantage
          </button>
          <button
            onClick={() => setSelectedAdvantageState('normal')}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-colors ${
              selectedAdvantageState === 'normal' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted hover:text-foreground'
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => setSelectedAdvantageState('withAdvantage')}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-colors ${
              selectedAdvantageState === 'withAdvantage' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted hover:text-foreground'
            }`}
          >
            Advantage
          </button>
        </div>

        {/* AC Range Recommendations */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Target className="w-4 h-4" />
            Optimal AC Ranges for {selectedAdvantageState === 'normal' ? 'Normal Attacks' : 
                                   selectedAdvantageState === 'withAdvantage' ? 'Attacks with Advantage' :
                                   'Attacks with Disadvantage'}
          </h4>
          
          <div className="space-y-2">
            {currentRanges.map((range, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  range.recommendation === 'power'
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-blue-500/5 border-blue-500/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  {range.recommendation === 'power' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-blue-600" />
                  )}
                  <div>
                    <div className="text-sm font-medium">
                      AC {range.start}{range.start !== range.end ? `-${range.end}` : ''}
                    </div>
                    <div className="text-xs text-muted">
                      {range.end - range.start + 1} AC value{range.end !== range.start ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className={`text-sm font-medium ${
                  range.recommendation === 'power' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {range.recommendation === 'power' ? 'Use Power Attack' : 'Use Normal Attack'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Analysis Toggle */}
        <div>
          <button
            onClick={() => setShowDetailed(!showDetailed)}
            className="flex items-center gap-2 text-sm text-accent hover:text-accent-foreground"
          >
            <span>{showDetailed ? 'Hide' : 'Show'} Detailed Analysis</span>
            <span className="text-xs">({breakpoints.length} AC values)</span>
          </button>
        </div>

        {/* Detailed Breakdown */}
        {showDetailed && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">
              Complete DPR Analysis - {selectedAdvantageState === 'normal' ? 'Normal' : 
                                       selectedAdvantageState === 'withAdvantage' ? 'Advantage' :
                                       'Disadvantage'}
            </h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/20">
                    <th className="text-left py-2 px-2">AC</th>
                    <th className="text-right py-2 px-2">Normal</th>
                    <th className="text-right py-2 px-2">Power</th>
                    <th className="text-right py-2 px-2">Diff</th>
                    <th className="text-center py-2 px-2">Best</th>
                  </tr>
                </thead>
                <tbody>
                  {breakpoints.map((bp, index) => {
                    const data = bp[selectedAdvantageState]
                    return (
                      <tr key={index} className="border-b border-border/10 hover:bg-muted/20">
                        <td className="py-1.5 px-2 font-mono">{bp.ac}</td>
                        <td className="text-right py-1.5 px-2">{data.withoutPowerAttack.toFixed(1)}</td>
                        <td className="text-right py-1.5 px-2">{data.withPowerAttack.toFixed(1)}</td>
                        <td className={`text-right py-1.5 px-2 font-medium ${
                          data.advantage > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {data.advantage > 0 ? '+' : ''}{data.advantage.toFixed(1)}
                        </td>
                        <td className="text-center py-1.5 px-2">
                          <Badge variant={data.usePowerAttack ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                            {data.usePowerAttack ? 'PWR' : 'NRM'}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Comparison Summary */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="text-center p-2 bg-muted/20 rounded">
                <div className="text-[10px] text-muted uppercase">Disadvantage</div>
                <div className="text-xs font-medium mt-1">
                  {disadvantageRanges.filter(r => r.recommendation === 'power').length > 0 
                    ? `AC ${Math.min(...disadvantageRanges.filter(r => r.recommendation === 'power').map(r => r.start))}-${Math.max(...disadvantageRanges.filter(r => r.recommendation === 'power').map(r => r.end))}`
                    : 'Never'}
                </div>
              </div>
              <div className="text-center p-2 bg-muted/20 rounded">
                <div className="text-[10px] text-muted uppercase">Normal</div>
                <div className="text-xs font-medium mt-1">
                  {normalRanges.filter(r => r.recommendation === 'power').length > 0 
                    ? `AC ${Math.min(...normalRanges.filter(r => r.recommendation === 'power').map(r => r.start))}-${Math.max(...normalRanges.filter(r => r.recommendation === 'power').map(r => r.end))}`
                    : 'Never'}
                </div>
              </div>
              <div className="text-center p-2 bg-muted/20 rounded">
                <div className="text-[10px] text-muted uppercase">Advantage</div>
                <div className="text-xs font-medium mt-1">
                  {advantageRanges.filter(r => r.recommendation === 'power').length > 0 
                    ? `AC ${Math.min(...advantageRanges.filter(r => r.recommendation === 'power').map(r => r.start))}-${Math.max(...advantageRanges.filter(r => r.recommendation === 'power').map(r => r.end))}`
                    : 'Never'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Insights */}
        <div className="pt-3 border-t border-border/20">
          <div className="text-xs text-muted space-y-1">
            <p>📊 <strong>Three-Phase Pattern:</strong> Power attack typically excels at low AC, struggles mid-range, then improves at very high AC</p>
            <p>🎯 <strong>Advantage Impact:</strong> Advantage significantly extends the viable power attack range</p>
            <p>⚠️ <strong>Disadvantage Impact:</strong> Disadvantage severely limits power attack effectiveness</p>
            <p>💡 <strong>Rule of Thumb:</strong> If you hit on 8+ normally, power attack is often worth it below AC 15</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}