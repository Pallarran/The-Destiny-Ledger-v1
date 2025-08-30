import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { RuneCorners } from '../ui/rune-corners'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import type { AbilityScore } from '../../rules/types'
import type { AbilityAssignmentMethod } from '../../types/character'
import { 
  Calculator, 
  Edit3, 
  AlertTriangle,
  TrendingUp,
  Minus,
  Plus
} from 'lucide-react'

const ABILITY_LABELS = {
  STR: 'Strength',
  DEX: 'Dexterity', 
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma'
}

const ABILITY_DESCRIPTIONS = {
  STR: 'Physical power, athletics, melee damage',
  DEX: 'Agility, stealth, ranged attacks, AC',
  CON: 'Health, stamina, concentration saves',
  INT: 'Reasoning, knowledge, investigation',
  WIS: 'Awareness, insight, perception',
  CHA: 'Force of personality, social skills'
}

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]

const POINT_BUY_COSTS = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
}

function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`
}

export function AbilityScoreAssignment() {
  const {
    currentBuild,
    setAbilityAssignmentMethod,
    setAbilityScore
  } = useCharacterBuilderStore()
  
  const [localScores, setLocalScores] = useState(currentBuild?.baseAbilityScores || currentBuild?.abilityScores || {
    STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8
  })
  
  const [standardArrayAssignment, setStandardArrayAssignment] = useState<Record<AbilityScore, number>>(() => {
    // Initialize from current build if it exists and uses standard array
    if (currentBuild?.abilityAssignmentMethod === 'standard' && currentBuild?.abilityScores) {
      return currentBuild.abilityScores as Record<AbilityScore, number>
    }
    return { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 }
  })
  
  // Auto-detect method only when necessary (no stored method or invalid combination)
  const autoDetectMethod = () => {
    if (!currentBuild) return 'pointbuy'
    
    const storedMethod = currentBuild.abilityAssignmentMethod
    // Check base scores (without racial bonuses) for method detection
    const scores = Object.values(currentBuild.baseAbilityScores || currentBuild.abilityScores)
    
    // If we have a stored method, validate it against the scores
    if (storedMethod) {
      const hasScoresAbove15 = scores.some(score => score > 15)
      const hasScoresBelow8 = scores.some(score => score < 8)
      
      // Only override if the stored method is incompatible with the scores
      if ((storedMethod === 'pointbuy' || storedMethod === 'standard') && (hasScoresAbove15 || hasScoresBelow8)) {
        return 'custom' // Scores are incompatible with point-buy/standard array
      }
      
      // Return the stored method if compatible
      return storedMethod
    }
    
    // No stored method - auto-detect based on scores (legacy builds)
    const hasScoresAbove15 = scores.some(score => score > 15)
    const hasScoresBelow8 = scores.some(score => score < 8)
    
    if (hasScoresAbove15 || hasScoresBelow8) {
      return 'custom'
    }
    
    // Check if it matches standard array exactly
    const standardArray = [15, 14, 13, 12, 10, 8]
    const sortedScores = [...scores].sort((a, b) => b - a)
    const sortedStandard = [...standardArray].sort((a, b) => b - a)
    if (JSON.stringify(sortedScores) === JSON.stringify(sortedStandard)) {
      return 'standard'
    }
    
    // Default to point-buy for compatible scores
    return 'pointbuy'
  }
  
  const method = autoDetectMethod()
  
  useEffect(() => {
    if (currentBuild?.baseAbilityScores) {
      // Use base scores for editing (without racial bonuses)
      setLocalScores(currentBuild.baseAbilityScores)
      
      // Update the method in store ONLY if auto-detection suggests incompatibility
      const detectedMethod = autoDetectMethod()
      if (currentBuild.abilityAssignmentMethod !== detectedMethod) {
        // Only update if the stored method is actually incompatible
        const scores = Object.values(currentBuild.abilityScores)
        const hasScoresAbove15 = scores.some(score => score > 15)
        const hasScoresBelow8 = scores.some(score => score < 8)
        const storedMethod = currentBuild.abilityAssignmentMethod
        
        if ((storedMethod === 'pointbuy' || storedMethod === 'standard') && (hasScoresAbove15 || hasScoresBelow8)) {
          // Only update if truly incompatible
          setAbilityAssignmentMethod(detectedMethod)
        }
      }
      
      // Also update standard array assignment if this is a standard array build
      if (method === 'standard') {
        setStandardArrayAssignment(currentBuild.abilityScores as Record<AbilityScore, number>)
      }
    }
  }, [currentBuild?.abilityScores, currentBuild?.abilityAssignmentMethod])
  
  // Trigger validation when component mounts or scores change
  useEffect(() => {
    if (currentBuild) {
      // Trigger initial validation to enable Next button if valid
      const { validateCurrentStep } = useCharacterBuilderStore.getState()
      validateCurrentStep()
    }
  }, [currentBuild, localScores])
  
  const handleMethodChange = (newMethod: AbilityAssignmentMethod) => {
    setAbilityAssignmentMethod(newMethod)
    
    // Apply default scores based on method
    if (newMethod === 'standard') {
      // Start with unassigned (8s show as placeholders)
      const unassignedScores = { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 }
      setLocalScores(unassignedScores)
      setStandardArrayAssignment({ STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 })
      Object.entries(unassignedScores).forEach(([ability, score]) => {
        setAbilityScore(ability as AbilityScore, score)
      })
    } else if (newMethod === 'pointbuy' || newMethod === 'custom') {
      // Start with all 8s for point buy and manual entry
      const baseScores = { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 }
      setLocalScores(baseScores)
      Object.entries(baseScores).forEach(([ability, score]) => {
        setAbilityScore(ability as AbilityScore, score)
      })
    }
  }
  
  const handleScoreChange = (ability: AbilityScore, value: number) => {
    const newValue = Math.max(8, Math.min(20, value))
    setLocalScores(prev => ({ ...prev, [ability]: newValue }))
    setAbilityScore(ability, newValue)
  }
  
  const handleStandardArrayAssignment = (ability: AbilityScore, arrayValue: number) => {
    // Find current assignment and swap
    const currentAssignment = { ...standardArrayAssignment }
    const currentAbility = Object.keys(currentAssignment).find(
      key => currentAssignment[key as AbilityScore] === arrayValue
    ) as AbilityScore
    
    if (currentAbility) {
      currentAssignment[currentAbility] = currentAssignment[ability]
    }
    currentAssignment[ability] = arrayValue
    
    setStandardArrayAssignment(currentAssignment)
    setLocalScores(currentAssignment)
    
    Object.entries(currentAssignment).forEach(([abilityKey, score]) => {
      setAbilityScore(abilityKey as AbilityScore, score)
    })
  }
  
  const calculatePointBuyTotal = () => {
    let total = 0
    Object.values(localScores).forEach(score => {
      total += POINT_BUY_COSTS[score as keyof typeof POINT_BUY_COSTS] || 0
    })
    return total
  }
  
  const remainingPoints = 27 - calculatePointBuyTotal()
  const canIncrease = (score: number) => {
    if (score >= 15) return false
    const nextCost = POINT_BUY_COSTS[(score + 1) as keyof typeof POINT_BUY_COSTS] || 0
    const currentCost = POINT_BUY_COSTS[score as keyof typeof POINT_BUY_COSTS] || 0
    return (nextCost - currentCost) <= remainingPoints
  }
  
  const canDecrease = (score: number) => score > 8
  
  if (!currentBuild) {
    return <div className="text-center text-muted">Loading ability scores...</div>
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-panel mb-2">Ability Score Assignment</h2>
        <p className="text-muted">
          Choose how you want to determine your character&apos;s ability scores. These form the foundation of your character&apos;s capabilities.
        </p>
      </div>
      
      {/* Compact Method Selection */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={method === 'pointbuy' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleMethodChange('pointbuy')}
            className={method === 'pointbuy' ? 'bg-accent text-ink' : ''}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Point Buy (27pts)
          </Button>
          <Button
            variant={method === 'standard' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleMethodChange('standard')}
            className={method === 'standard' ? 'bg-accent text-ink' : ''}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Standard Array
          </Button>
          <Button
            variant={method === 'custom' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleMethodChange('custom')}
            className={method === 'custom' ? 'bg-accent text-ink' : ''}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Manual Entry
          </Button>
        </div>
        
        {/* Method Description */}
        <div className="text-sm text-muted bg-panel/5 rounded-lg p-3">
          {method === 'pointbuy' && (
            <span><strong>Point Buy:</strong> Spend exactly 27 points to purchase ability scores (8-15 range). Must use all points per D&D 5e rules.</span>
          )}
          {method === 'standard' && (
            <span><strong>Standard Array:</strong> Assign each predetermined score (15, 14, 13, 12, 10, 8) to exactly one ability. Each value must be used once.</span>
          )}
          {method === 'custom' && (
            <span><strong>Manual Entry:</strong> Enter ability scores manually (8-20 range). Use for rolled stats, variant rules, or homebrew campaigns.</span>
          )}
        </div>
      </div>
      
      {/* Point Buy Status */}
      {method === 'pointbuy' && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-accent" />
              <span className="font-medium">Point Buy Budget</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted">
                Used: <span className="font-medium">{calculatePointBuyTotal()}/27</span>
              </div>
              <Badge 
                variant={remainingPoints === 0 ? "default" : remainingPoints > 0 ? "secondary" : "destructive"}
              >
                {remainingPoints === 0 ? "Complete" : `${Math.abs(remainingPoints)} ${remainingPoints > 0 ? "remaining" : "over budget"}`}
              </Badge>
              {remainingPoints !== 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <AlertTriangle className={`w-4 h-4 ${remainingPoints > 0 ? 'text-amber-500' : 'text-destructive'}`} />
                  <span className={remainingPoints > 0 ? 'text-amber-600' : 'text-destructive'}>
                    {remainingPoints > 0 ? 'Must spend all 27 points' : 'Over 27 point limit'}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Standard Array Available Values */}
      {method === 'standard' && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="font-medium">Available Array Values</span>
            </div>
            <div className="flex items-center gap-2">
              {STANDARD_ARRAY.map(value => {
                const used = Object.values(standardArrayAssignment).filter(v => v === value).length
                const available = 1 - used
                return (
                  <Badge 
                    key={value}
                    variant={available > 0 ? "secondary" : "outline"}
                    className={available > 0 ? "bg-accent/10 text-accent" : "opacity-50"}
                  >
                    {value} {available === 0 && "✓"}
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Ability Score Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(ABILITY_LABELS).map(([ability, label]) => {
          const score = localScores[ability as AbilityScore]
          const modifier = getAbilityModifier(score)
          
          return (
            <Card key={ability} className="relative overflow-hidden">
              <RuneCorners opacity={0.35} className="text-gold" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">{ability}</CardTitle>
                    <CardDescription className="text-sm">
                      {label}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    {method === 'standard' && standardArrayAssignment[ability as AbilityScore] === 0 ? (
                      <div className="text-2xl font-bold text-muted">--</div>
                    ) : (
                      <div className="text-3xl font-bold text-accent">{score}</div>
                    )}
                    <div className="text-sm text-muted">
                      {method === 'standard' && standardArrayAssignment[ability as AbilityScore] === 0 
                        ? 'Unassigned' 
                        : `(${formatModifier(modifier)})`
                      }
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted mb-3">
                  {ABILITY_DESCRIPTIONS[ability as keyof typeof ABILITY_DESCRIPTIONS]}
                </p>
                
                {method === 'pointbuy' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleScoreChange(ability as AbilityScore, score - 1)}
                      disabled={!canDecrease(score)}
                      className="w-8 h-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <div className="flex-1 text-center text-sm font-medium">
                      Cost: {POINT_BUY_COSTS[score as keyof typeof POINT_BUY_COSTS] || 0}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleScoreChange(ability as AbilityScore, score + 1)}
                      disabled={!canIncrease(score)}
                      className="w-8 h-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                
                {method === 'standard' && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted">Assign array value:</Label>
                    <div className="flex flex-wrap gap-1">
                      {STANDARD_ARRAY.map(value => (
                        <Button
                          key={value}
                          variant={standardArrayAssignment[ability as AbilityScore] === value ? "accent" : "outline"}
                          size="sm"
                          onClick={() => handleStandardArrayAssignment(ability as AbilityScore, value)}
                          className="w-8 h-8 p-0 text-xs"
                        >
                          {value}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {method === 'custom' && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted">Custom score:</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleScoreChange(ability as AbilityScore, score - 1)}
                        disabled={score <= 8}
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Input
                        type="number"
                        min={8}
                        max={20}
                        value={score}
                        onChange={(e) => handleScoreChange(ability as AbilityScore, parseInt(e.target.value) || 8)}
                        className="flex-1 text-center"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleScoreChange(ability as AbilityScore, score + 1)}
                        disabled={score >= 20}
                        className="w-8 h-8 p-0"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
      
    </div>
  )
}