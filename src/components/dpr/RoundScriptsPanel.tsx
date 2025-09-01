import { useState, useMemo } from 'react'
import { Panel, PanelHeader } from '../ui/panel'
import { RoundScripts } from '../ui/round-scripts'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card, CardContent } from '../ui/card'
import { RotateCcw, Save, AlertCircle, CheckCircle } from 'lucide-react'
import type { BuildConfiguration } from '../../stores/types'

interface RoundAction {
  id: string
  type: 'action' | 'bonus_action' | 'reaction' | 'free' | 'concentration'
  name: string
  description: string
  cost: string
  duration?: string
  conflicts?: string[]
}

interface RoundScript {
  round: number
  actions: RoundAction[]
  notes?: string
}

interface RoundScriptsPanelProps {
  build: BuildConfiguration | null
  onScriptsChange?: (scripts: RoundScript[]) => void
  className?: string
}

// Sample available actions - in a real app, this would be generated from the build
const getAvailableActions = (build: BuildConfiguration | null): RoundAction[] => {
  if (!build) return []
  
  const actions: RoundAction[] = [
    // Basic actions
    {
      id: 'attack',
      type: 'action',
      name: 'Attack',
      description: 'Make weapon attacks based on your Extra Attack feature',
      cost: 'Action'
    },
    {
      id: 'dash',
      type: 'action',
      name: 'Dash',
      description: 'Double your speed for this turn',
      cost: 'Action'
    },
    {
      id: 'dodge',
      type: 'action',
      name: 'Dodge',
      description: 'Attackers have disadvantage against you until your next turn',
      cost: 'Action'
    },
    
    // Bonus actions
    {
      id: 'off_hand_attack',
      type: 'bonus_action',
      name: 'Off-hand Attack',
      description: 'Attack with light weapon in off-hand',
      cost: 'Bonus Action',
      conflicts: ['action_surge_attack'] // Example conflict
    },
    {
      id: 'action_surge_attack',
      type: 'bonus_action',
      name: 'Action Surge Attack (War Magic)',
      description: 'Make one weapon attack after casting a cantrip',
      cost: 'Bonus Action',
      conflicts: ['off_hand_attack']
    }
  ]
  
  // Add spell actions based on build
  if (build.activeBuffs?.includes('hex')) {
    actions.push({
      id: 'hex',
      type: 'bonus_action',
      name: 'Hex',
      description: 'Curse a target for +1d6 necrotic damage',
      cost: 'Bonus Action',
      duration: 'Concentration, up to 1 hour'
    })
  }
  
  if (build.activeBuffs?.includes('hunters_mark')) {
    actions.push({
      id: 'hunters_mark',
      type: 'bonus_action',
      name: "Hunter's Mark",
      description: 'Mark a target for +1d6 damage and tracking',
      cost: 'Bonus Action',
      duration: 'Concentration, up to 1 hour'
    })
  }
  
  // Add class-specific actions
  const hasActionSurge = build.levelTimeline?.some(level => 
    level.classId === 'fighter' && level.level >= 2
  )
  
  if (hasActionSurge) {
    actions.push({
      id: 'action_surge',
      type: 'free',
      name: 'Action Surge',
      description: 'Take an additional Action on your turn',
      cost: 'Free (1/short rest)'
    })
  }
  
  return actions
}

const getDefaultScripts = (): RoundScript[] => [
  { round: 1, actions: [] },
  { round: 2, actions: [] },
  { round: 3, actions: [] }
]

export function RoundScriptsPanel({ build, onScriptsChange, className }: RoundScriptsPanelProps) {
  const [scripts, setScripts] = useState<RoundScript[]>(getDefaultScripts())
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  const availableActions = useMemo(() => getAvailableActions(build), [build])
  
  const handleScriptUpdate = (roundIndex: number, script: RoundScript) => {
    const newScripts = [...scripts]
    newScripts[roundIndex] = script
    setScripts(newScripts)
    setHasUnsavedChanges(true)
    
    if (onScriptsChange) {
      onScriptsChange(newScripts)
    }
  }
  
  const resetScripts = () => {
    setScripts(getDefaultScripts())
    setHasUnsavedChanges(false)
  }
  
  const saveScripts = () => {
    // In a real app, this would save to the build configuration
    console.log('Saving round scripts:', scripts)
    setHasUnsavedChanges(false)
  }
  
  // Calculate total conflicts across all rounds
  const totalConflicts = scripts.reduce((total, script) => {
    const usedSlots = { action: 0, bonus_action: 0, reaction: 0, concentration: 0 }
    let conflicts = 0
    
    for (const action of script.actions) {
      if (action.type in usedSlots) {
        usedSlots[action.type as keyof typeof usedSlots]++
      }
    }
    
    if (usedSlots.action > 1) conflicts++
    if (usedSlots.bonus_action > 1) conflicts++
    if (usedSlots.reaction > 1) conflicts++
    if (usedSlots.concentration > 1) conflicts++
    
    return total + conflicts
  }, 0)
  
  if (!build) {
    return (
      <Panel className={className}>
        <PanelHeader title="Round Scripts" />
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Select a build to plan round actions</p>
          </div>
        </CardContent>
      </Panel>
    )
  }
  
  return (
    <Panel className={className}>
      <PanelHeader title="Round Scripts">
        <div className="flex items-center gap-2">
          {totalConflicts > 0 && (
            <Badge variant="destructive" className="text-xs">
              {totalConflicts} conflict{totalConflicts !== 1 ? 's' : ''}
            </Badge>
          )}
          {totalConflicts === 0 && scripts.some(s => s.actions.length > 0) && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
              <CheckCircle className="w-3 h-3 mr-1" />
              Valid
            </Badge>
          )}
        </div>
      </PanelHeader>
      
      <CardContent className="space-y-4">
        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Plan your combat actions for the first 3 rounds
          </div>
          
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-xs text-amber-600">
                Unsaved changes
              </Badge>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetScripts}
              className="gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={saveScripts}
              disabled={!hasUnsavedChanges}
              className="gap-1"
            >
              <Save className="w-3 h-3" />
              Save
            </Button>
          </div>
        </div>
        
        {/* Scripts */}
        <RoundScripts
          scripts={scripts}
          onUpdateScript={handleScriptUpdate}
          availableActions={availableActions}
        />
        
        {/* Summary Card */}
        {scripts.some(s => s.actions.length > 0) && (
          <Card className="bg-muted/20">
            <CardContent className="p-4">
              <div className="text-sm">
                <div className="font-medium mb-2">Round Summary</div>
                <div className="space-y-1">
                  {scripts.map(script => (
                    <div key={script.round} className="flex justify-between">
                      <span>Round {script.round}:</span>
                      <span className="text-muted-foreground">
                        {script.actions.length === 0 
                          ? 'No actions'
                          : `${script.actions.length} action${script.actions.length !== 1 ? 's' : ''}`
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Panel>
  )
}