import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Target, TrendingUp, TrendingDown, Minus, Dice6, Sword } from 'lucide-react'
import { buildToCombatState, getWeaponConfig } from '../../engine/simulator'
import { calculateBuildDPR } from '../../engine/calculations'
import type { BuildConfiguration } from '../../stores/types'
import type { SimulationConfig } from '../../engine/types'

interface ACAnalysisPanelProps {
  build: BuildConfiguration | null
  config: {
    round0BuffsEnabled: boolean
    greedyResourceUse: boolean
    autoGWMSS: boolean
  }
}

interface ACAnalysis {
  ac: number
  hitChance: number
  critChance: number
  missChance: number
  normalDamage: number
  critDamage: number
  expectedDamagePerAttack: number
  attacksPerRound: number
  expectedDPR: number
  attackBonus: number
  advantageAnalysis: {
    normal: { hitChance: number; critChance: number; dpr: number }
    advantage: { hitChance: number; critChance: number; dpr: number }
    disadvantage: { hitChance: number; critChance: number; dpr: number }
  }
}

function calculateACAnalysis(
  build: BuildConfiguration,
  targetAC: number,
  config: { round0BuffsEnabled: boolean; greedyResourceUse: boolean; autoGWMSS: boolean }
): ACAnalysis | null {
  if (!build) return null

  const combatState = buildToCombatState(build)
  const weaponId = build.rangedWeapon || build.mainHandWeapon || 'longsword'
  const weaponConfig = getWeaponConfig(weaponId, 0)
  
  if (!weaponConfig) return null

  const simConfig: SimulationConfig = {
    targetAC,
    rounds: 3,
    round0Buffs: config.round0BuffsEnabled,
    greedyResourceUse: config.greedyResourceUse,
    autoGWMSS: config.autoGWMSS
  }

  // Calculate for normal conditions
  const normalResult = calculateBuildDPR(combatState, weaponConfig, simConfig)
  
  // Calculate with advantage
  const advState = { ...combatState, hasAdvantage: true, hasDisadvantage: false }
  const advResult = calculateBuildDPR(advState, weaponConfig, simConfig)
  
  // Calculate with disadvantage  
  const disState = { ...combatState, hasAdvantage: false, hasDisadvantage: true }
  const disResult = calculateBuildDPR(disState, weaponConfig, simConfig)

  // Calculate attack bonus (simplified extraction)
  let attackBonus = combatState.proficiencyBonus + combatState.abilityModifier
  attackBonus += combatState.attackBonuses.reduce((sum, bonus) => sum + bonus, 0)
  
  // Apply fighting style bonuses (simplified)
  if (combatState.fightingStyles.includes('archery')) {
    attackBonus += 2
  }

  return {
    ac: targetAC,
    hitChance: normalResult.hitChance,
    critChance: normalResult.critChance,
    missChance: normalResult.missChance,
    normalDamage: normalResult.normalDamage,
    critDamage: normalResult.critDamage,
    expectedDamagePerAttack: normalResult.expectedDamagePerAttack,
    attacksPerRound: normalResult.attacksPerRound,
    expectedDPR: normalResult.expectedDPR,
    attackBonus,
    advantageAnalysis: {
      normal: {
        hitChance: normalResult.hitChance,
        critChance: normalResult.critChance,
        dpr: normalResult.expectedDPR
      },
      advantage: {
        hitChance: advResult.hitChance,
        critChance: advResult.critChance,
        dpr: advResult.expectedDPR
      },
      disadvantage: {
        hitChance: disResult.hitChance,
        critChance: disResult.critChance,
        dpr: disResult.expectedDPR
      }
    }
  }
}

export function ACAnalysisPanel({ build, config }: ACAnalysisPanelProps) {
  const [selectedAC, setSelectedAC] = useState(15)

  if (!build) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            AC-Specific Analysis
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

  const analysis = calculateACAnalysis(build, selectedAC, config)

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            AC-Specific Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted py-4">
            Unable to analyze build
          </div>
        </CardContent>
      </Card>
    )
  }

  // Common AC values with descriptions
  const commonACs = [
    { value: 12, label: 'AC 12', description: 'Unarmored/Light' },
    { value: 14, label: 'AC 14', description: 'Medium Armor' },
    { value: 15, label: 'AC 15', description: 'Typical Enemy' },
    { value: 16, label: 'AC 16', description: 'Heavy Armor' },
    { value: 18, label: 'AC 18', description: 'Plate + Shield' },
    { value: 20, label: 'AC 20', description: 'High-Level Boss' },
    { value: 22, label: 'AC 22', description: 'Very High AC' },
    { value: 25, label: 'AC 25', description: 'Maximum AC' }
  ]

  const formatPercent = (value: number) => `${Math.round(value * 100)}%`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          AC-Specific Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AC Selector */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Target Armor Class</h4>
          <div className="grid grid-cols-4 gap-2">
            {commonACs.map((ac) => (
              <button
                key={ac.value}
                onClick={() => setSelectedAC(ac.value)}
                className={`p-2 rounded text-xs text-center transition-colors ${
                  selectedAC === ac.value
                    ? 'bg-accent text-accent-foreground border-2 border-accent'
                    : 'bg-muted/20 hover:bg-muted/40 border border-border'
                }`}
              >
                <div className="font-medium">{ac.label}</div>
                <div className="text-xs text-muted truncate">{ac.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Attack Analysis */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Attack Analysis</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-500/5 rounded border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-600">
                {formatPercent(analysis.hitChance)}
              </div>
              <div className="text-xs text-muted">Hit Chance</div>
            </div>
            
            <div className="text-center p-3 bg-yellow-500/5 rounded border border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-600">
                {formatPercent(analysis.critChance)}
              </div>
              <div className="text-xs text-muted">Crit Chance</div>
            </div>
            
            <div className="text-center p-3 bg-red-500/5 rounded border border-red-500/20">
              <div className="text-2xl font-bold text-red-600">
                {formatPercent(analysis.missChance)}
              </div>
              <div className="text-xs text-muted">Miss Chance</div>
            </div>
          </div>
          
          <div className="mt-3 text-center text-sm text-muted">
            Attack Roll: 1d20 + {analysis.attackBonus} vs AC {selectedAC}
          </div>
        </div>

        {/* Damage Analysis */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Damage Analysis</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/20">
              <div className="flex items-center gap-2">
                <Sword className="w-4 h-4 text-green-600" />
                <span className="text-sm">Normal Hit</span>
              </div>
              <span className="font-medium text-green-600">
                {analysis.normalDamage.toFixed(1)} damage
              </span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-border/20">
              <div className="flex items-center gap-2">
                <Dice6 className="w-4 h-4 text-yellow-600" />
                <span className="text-sm">Critical Hit</span>
              </div>
              <span className="font-medium text-yellow-600">
                {analysis.critDamage.toFixed(1)} damage
              </span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-border/20">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-sm">Expected per Attack</span>
              </div>
              <span className="font-medium text-accent">
                {analysis.expectedDamagePerAttack.toFixed(1)} damage
              </span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-accent" />
                <span className="text-sm">Attacks per Round</span>
              </div>
              <span className="font-medium text-accent">
                {analysis.attacksPerRound}
              </span>
            </div>
          </div>
        </div>

        {/* Advantage Analysis */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Advantage/Disadvantage Impact</h4>
          <div className="space-y-2">
            {/* Normal */}
            <div className="flex items-center justify-between py-2 px-3 bg-gray-500/5 rounded border border-gray-500/20">
              <div className="flex items-center gap-2">
                <Minus className="w-4 h-4 text-gray-600" />
                <span className="text-sm">Normal</span>
                <Badge variant="outline" className="text-xs">
                  {formatPercent(analysis.advantageAnalysis.normal.hitChance)} hit
                </Badge>
              </div>
              <span className="font-medium">
                {analysis.advantageAnalysis.normal.dpr.toFixed(1)} DPR
              </span>
            </div>

            {/* Advantage */}
            <div className="flex items-center justify-between py-2 px-3 bg-green-500/5 rounded border border-green-500/20">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm">Advantage</span>
                <Badge variant="outline" className="text-xs">
                  {formatPercent(analysis.advantageAnalysis.advantage.hitChance)} hit
                </Badge>
              </div>
              <div className="text-right">
                <div className="font-medium text-green-600">
                  {analysis.advantageAnalysis.advantage.dpr.toFixed(1)} DPR
                </div>
                <div className="text-xs text-green-600">
                  +{(analysis.advantageAnalysis.advantage.dpr - analysis.advantageAnalysis.normal.dpr).toFixed(1)}
                </div>
              </div>
            </div>

            {/* Disadvantage */}
            <div className="flex items-center justify-between py-2 px-3 bg-red-500/5 rounded border border-red-500/20">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-sm">Disadvantage</span>
                <Badge variant="outline" className="text-xs">
                  {formatPercent(analysis.advantageAnalysis.disadvantage.hitChance)} hit
                </Badge>
              </div>
              <div className="text-right">
                <div className="font-medium text-red-600">
                  {analysis.advantageAnalysis.disadvantage.dpr.toFixed(1)} DPR
                </div>
                <div className="text-xs text-red-600">
                  {(analysis.advantageAnalysis.disadvantage.dpr - analysis.advantageAnalysis.normal.dpr).toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="pt-3 border-t border-border/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {analysis.expectedDPR.toFixed(1)} DPR
            </div>
            <div className="text-xs text-muted">
              Expected damage per round vs AC {selectedAC}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}