import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { AlertTriangle, Minus, Zap, Shield, Eye, Sword, Clock } from 'lucide-react'

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

interface RoundScriptsProps {
  scripts: RoundScript[]
  onUpdateScript: (roundIndex: number, script: RoundScript) => void
  availableActions: RoundAction[]
  className?: string
}

const ACTION_ICONS = {
  action: Sword,
  bonus_action: Zap,
  reaction: Shield,
  free: Clock,
  concentration: Eye
}

const ACTION_COLORS = {
  action: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  bonus_action: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  reaction: 'bg-green-500/10 text-green-600 border-green-500/20',
  free: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  concentration: 'bg-purple-500/10 text-purple-600 border-purple-500/20'
}

function detectConflicts(script: RoundScript): { hasConflicts: boolean; conflicts: string[] } {
  const usedSlots = {
    action: false,
    bonus_action: false,
    reaction: false,
    concentration: false
  }
  
  const conflicts: string[] = []
  
  for (const action of script.actions) {
    if (action.type === 'action') {
      if (usedSlots.action) {
        conflicts.push(`Multiple actions in Round ${script.round}`)
      }
      usedSlots.action = true
    } else if (action.type === 'bonus_action') {
      if (usedSlots.bonus_action) {
        conflicts.push(`Multiple bonus actions in Round ${script.round}`)
      }
      usedSlots.bonus_action = true
    } else if (action.type === 'reaction') {
      if (usedSlots.reaction) {
        conflicts.push(`Multiple reactions in Round ${script.round}`)
      }
      usedSlots.reaction = true
    } else if (action.type === 'concentration') {
      if (usedSlots.concentration) {
        conflicts.push(`Multiple concentration effects in Round ${script.round}`)
      }
      usedSlots.concentration = true
    }
    
    // Check for specific conflicts
    if (action.conflicts) {
      const conflictingActions = script.actions.filter(a => 
        a.id !== action.id && action.conflicts?.includes(a.id)
      )
      if (conflictingActions.length > 0) {
        conflicts.push(`${action.name} conflicts with ${conflictingActions.map(a => a.name).join(', ')} in Round ${script.round}`)
      }
    }
  }
  
  return {
    hasConflicts: conflicts.length > 0,
    conflicts
  }
}

export function RoundScripts({ scripts, onUpdateScript, availableActions, className }: RoundScriptsProps) {
  const [expandedRound, setExpandedRound] = useState<number | null>(0)
  
  const addActionToRound = (roundIndex: number, actionId: string) => {
    const action = availableActions.find(a => a.id === actionId)
    if (!action) return
    
    const updatedScript = {
      ...scripts[roundIndex],
      actions: [...scripts[roundIndex].actions, action]
    }
    
    onUpdateScript(roundIndex, updatedScript)
  }
  
  const removeActionFromRound = (roundIndex: number, actionId: string) => {
    const updatedScript = {
      ...scripts[roundIndex],
      actions: scripts[roundIndex].actions.filter(a => a.id !== actionId)
    }
    
    onUpdateScript(roundIndex, updatedScript)
  }
  
  return (
    <div className={className}>
      <div className="space-y-4">
        {scripts.map((script, roundIndex) => {
          const { hasConflicts, conflicts } = detectConflicts(script)
          const isExpanded = expandedRound === roundIndex
          
          return (
            <Card 
              key={script.round} 
              className={`transition-all ${hasConflicts ? 'ring-2 ring-red-500/20 border-red-500/20 bg-red-50/50' : ''}`}
            >
              <CardHeader 
                className="pb-3 cursor-pointer"
                onClick={() => setExpandedRound(isExpanded ? null : roundIndex)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm font-bold">
                      {script.round}
                    </div>
                    Round {script.round}
                    {hasConflicts && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {script.actions.length} action{script.actions.length !== 1 ? 's' : ''}
                    </Badge>
                    {hasConflicts && (
                      <Badge variant="destructive" className="text-xs">
                        {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Action Summary */}
                {script.actions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {script.actions.map((action) => {
                      const ActionIcon = ACTION_ICONS[action.type]
                      return (
                        <Badge 
                          key={action.id}
                          variant="outline" 
                          className={`text-xs ${ACTION_COLORS[action.type]}`}
                        >
                          <ActionIcon className="w-3 h-3 mr-1" />
                          {action.name}
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  {/* Conflicts Display */}
                  {hasConflicts && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-600">Action Economy Conflicts</span>
                      </div>
                      <ul className="text-sm text-red-600 space-y-1">
                        {conflicts.map((conflict, idx) => (
                          <li key={idx}>• {conflict}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Current Actions */}
                  <div className="space-y-3">
                    {script.actions.map((action) => {
                      const ActionIcon = ACTION_ICONS[action.type]
                      return (
                        <div 
                          key={action.id}
                          className="flex items-start justify-between p-3 border border-border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <ActionIcon className="w-4 h-4 text-muted" />
                              <span className="font-medium">{action.name}</span>
                              <Badge variant="outline" className={`text-xs ${ACTION_COLORS[action.type]}`}>
                                {action.cost}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                            {action.duration && (
                              <p className="text-xs text-muted mt-1">Duration: {action.duration}</p>
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeActionFromRound(roundIndex, action.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      )
                    })}
                    
                    {/* Add Action */}
                    <div className="flex items-center gap-2">
                      <Select onValueChange={(value) => addActionToRound(roundIndex, value)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Add action..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableActions
                            .filter(action => !script.actions.find(a => a.id === action.id))
                            .map((action) => {
                              const ActionIcon = ACTION_ICONS[action.type]
                              return (
                                <SelectItem key={action.id} value={action.id}>
                                  <div className="flex items-center gap-2">
                                    <ActionIcon className="w-4 h-4" />
                                    <span>{action.name}</span>
                                    <Badge variant="outline" className={`text-xs ml-auto ${ACTION_COLORS[action.type]}`}>
                                      {action.cost}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              )
                            })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {script.actions.length === 0 && (
                      <div className="text-center text-muted-foreground py-6">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No actions planned for this round</p>
                        <p className="text-xs">Add actions using the dropdown above</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}