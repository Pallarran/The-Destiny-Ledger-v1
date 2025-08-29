import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useBuilderStore } from '@/stores/builderStore'
import type { AbilityScore, AbilityScores } from '@/rules/types'

const ABILITY_NAMES: Record<AbilityScore, string> = {
  STR: 'Strength',
  DEX: 'Dexterity', 
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma'
}

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8]
const POINT_BUY_COSTS = [0, 1, 2, 3, 4, 5, 7, 9] // Index = score - 8, value = point cost

export function AbilityScoreAssignment() {
  const { currentBuild, updateBuild } = useBuilderStore()
  const [method, setMethod] = useState<'standard' | 'pointbuy' | 'manual'>('standard')
  const [pointBuyScores, setPointBuyScores] = useState<AbilityScores>({
    STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8
  })
  const [standardAssignment, setStandardAssignment] = useState<(AbilityScore | null)[]>(
    new Array(6).fill(null)
  )

  if (!currentBuild) return null

  const calculatePointsUsed = (scores: AbilityScores): number => {
    return Object.values(scores).reduce((total, score) => {
      return total + (POINT_BUY_COSTS[score - 8] || 0)
    }, 0)
  }

  const getModifier = (score: number): number => Math.floor((score - 10) / 2)

  const handleStandardArrayAssignment = (arrayIndex: number, ability: AbilityScore) => {
    const newAssignment = [...standardAssignment]
    
    // Remove this ability from any previous assignment
    const existingIndex = newAssignment.indexOf(ability)
    if (existingIndex !== -1) {
      newAssignment[existingIndex] = null
    }
    
    // Assign to new position
    newAssignment[arrayIndex] = ability
    setStandardAssignment(newAssignment)
    
    // Update the build
    const newScores = { ...currentBuild.abilityScores }
    newAssignment.forEach((assignedAbility, index) => {
      if (assignedAbility) {
        newScores[assignedAbility] = STANDARD_ARRAY[index]
      }
    })
    updateBuild({ abilityScores: newScores })
  }

  const handlePointBuyChange = (ability: AbilityScore, value: number) => {
    const clampedValue = Math.max(8, Math.min(15, value))
    const newScores = { ...pointBuyScores, [ability]: clampedValue }
    setPointBuyScores(newScores)
    
    if (calculatePointsUsed(newScores) <= 27) {
      updateBuild({ abilityScores: newScores })
    }
  }

  const handleManualChange = (ability: AbilityScore, value: number) => {
    const clampedValue = Math.max(3, Math.min(18, value))
    const newScores = { ...currentBuild.abilityScores, [ability]: clampedValue }
    updateBuild({ abilityScores: newScores })
  }

  const pointsUsed = method === 'pointbuy' ? calculatePointsUsed(pointBuyScores) : 0
  const pointsRemaining = 27 - pointsUsed

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ability Scores</CardTitle>
        <CardDescription>
          Assign your character's ability scores using one of the standard methods
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={method} onValueChange={(v) => setMethod(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="standard">Standard Array</TabsTrigger>
            <TabsTrigger value="pointbuy">Point Buy</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="standard" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Assign the standard array values (15, 14, 13, 12, 10, 8) to your abilities
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Available Scores</h4>
                {STANDARD_ARRAY.map((score, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant={standardAssignment[index] ? "default" : "outline"}>
                      {score}
                    </Badge>
                    <span className="text-sm">
                      {standardAssignment[index] ? `→ ${ABILITY_NAMES[standardAssignment[index]!]}` : 'Unassigned'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Assign to Abilities</h4>
                {(Object.keys(ABILITY_NAMES) as AbilityScore[]).map((ability) => (
                  <div key={ability} className="flex items-center gap-2">
                    <Label className="w-16 text-sm">{ability}</Label>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                      value={standardAssignment.indexOf(ability) !== -1 ? standardAssignment.indexOf(ability) : ''}
                      onChange={(e) => {
                        if (e.target.value !== '') {
                          handleStandardArrayAssignment(parseInt(e.target.value), ability)
                        }
                      }}
                    >
                      <option value="">Select score...</option>
                      {STANDARD_ARRAY.map((score, index) => (
                        <option 
                          key={index} 
                          value={index}
                          disabled={standardAssignment[index] !== null && standardAssignment[index] !== ability}
                        >
                          {score} {standardAssignment[index] && standardAssignment[index] !== ability ? '(taken)' : ''}
                        </option>
                      ))}
                    </select>
                    <Badge variant="secondary">
                      {currentBuild.abilityScores[ability]} ({getModifier(currentBuild.abilityScores[ability]) >= 0 ? '+' : ''}{getModifier(currentBuild.abilityScores[ability])})
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pointbuy" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Purchase ability scores using a 27-point budget (8-15 range)
              </p>
              <Badge variant={pointsRemaining >= 0 ? "default" : "destructive"}>
                {pointsRemaining} points remaining
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(ABILITY_NAMES) as AbilityScore[]).map((ability) => (
                <div key={ability} className="space-y-2">
                  <Label>{ABILITY_NAMES[ability]}</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePointBuyChange(ability, pointBuyScores[ability] - 1)}
                      disabled={pointBuyScores[ability] <= 8}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-mono">
                      {pointBuyScores[ability]}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePointBuyChange(ability, pointBuyScores[ability] + 1)}
                      disabled={pointBuyScores[ability] >= 15 || pointsRemaining < (POINT_BUY_COSTS[pointBuyScores[ability] + 1 - 8] - POINT_BUY_COSTS[pointBuyScores[ability] - 8])}
                    >
                      +
                    </Button>
                    <Badge variant="secondary" className="ml-2">
                      {getModifier(pointBuyScores[ability]) >= 0 ? '+' : ''}{getModifier(pointBuyScores[ability])}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({POINT_BUY_COSTS[pointBuyScores[ability] - 8]} pts)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manually enter ability scores (3-18 range) for custom arrays or rolled stats
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(ABILITY_NAMES) as AbilityScore[]).map((ability) => (
                <div key={ability} className="space-y-2">
                  <Label htmlFor={ability}>{ABILITY_NAMES[ability]}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={ability}
                      type="number"
                      min={3}
                      max={18}
                      value={currentBuild.abilityScores[ability]}
                      onChange={(e) => handleManualChange(ability, parseInt(e.target.value) || 8)}
                      className="w-20"
                    />
                    <Badge variant="secondary">
                      {getModifier(currentBuild.abilityScores[ability]) >= 0 ? '+' : ''}{getModifier(currentBuild.abilityScores[ability])}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}