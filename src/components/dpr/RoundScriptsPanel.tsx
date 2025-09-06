import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  Zap, 
  Swords, 
  Clock, 
  AlertTriangle, 
  Info, 
  Plus, 
  X, 
  CheckCircle,
  XCircle 
} from 'lucide-react'
import type { 
  RoundScripts, 
  RoundScript, 
  RoundAction, 
  ActionOption, 
  ResourcePool,
  ActionEconomyValidation 
} from '../../engine/types'
import { validateActionEconomy, createDefaultResourcePool } from '../../engine/roundScripts'
import { getAvailableActions, getActionsByType } from '../../engine/actionLibrary'
import type { BuildConfiguration } from '../../stores/types'

interface RoundScriptsPanelProps {
  build: BuildConfiguration | null
  onScriptsChange?: (scripts: RoundScripts) => void
  className?: string
}

// Helper functions to extract character data from build
function extractClassData(build: BuildConfiguration | null): { classId: string; levels: number }[] {
  if (!build?.levelTimeline) return []
  
  const classLevels = new Map<string, number>()
  
  for (const entry of build.levelTimeline) {
    classLevels.set(entry.classId, (classLevels.get(entry.classId) || 0) + 1)
  }
  
  return Array.from(classLevels.entries()).map(([classId, levels]) => ({ classId, levels }))
}

function extractFeatures(build: BuildConfiguration | null): string[] {
  if (!build?.levelTimeline) return []
  
  const features = new Set<string>()
  
  for (const entry of build.levelTimeline) {
    if (entry.features) {
      entry.features.forEach(feature => features.add(feature))
    }
  }
  
  return Array.from(features)
}

function extractKnownSpells(build: BuildConfiguration | null): string[] {
  if (!build?.levelTimeline) return []
  
  const spells = new Set<string>()
  
  for (const entry of build.levelTimeline) {
    if (entry.spellChoices) {
      entry.spellChoices.forEach(spell => spells.add(spell))
    }
  }
  
  return Array.from(spells)
}

export function RoundScriptsPanel({ build, onScriptsChange, className }: RoundScriptsPanelProps) {
  const totalLevel = build?.levelTimeline?.length || 1
  const classes = extractClassData(build)
  const features = extractFeatures(build)
  const knownSpells = extractKnownSpells(build)
  
  // Initialize with default round scripts
  const [scripts, setScripts] = useState<RoundScripts>(() => {
    const initialResources = createDefaultResourcePool(totalLevel, classes)
    return {
      initialResources,
      round1: createEmptyRound(1, initialResources),
      round2: createEmptyRound(2, initialResources), 
      round3: createEmptyRound(3, initialResources)
    }
  })

  const [validation, setValidation] = useState<ActionEconomyValidation>()
  const [availableActions, setAvailableActions] = useState<ActionOption[]>([])

  // Update available actions when character changes
  useEffect(() => {
    const actions = getAvailableActions(totalLevel, classes, features, knownSpells)
    setAvailableActions(actions)
  }, [totalLevel, classes, features, knownSpells])

  // Validate scripts whenever they change
  useEffect(() => {
    const newValidation = validateActionEconomy(scripts)
    setValidation(newValidation)
    if (onScriptsChange) {
      onScriptsChange(scripts)
    }
  }, [scripts, onScriptsChange])

  const addAction = (roundNumber: 1 | 2 | 3, actionId: string) => {
    const action = availableActions.find(a => a.id === actionId)
    if (!action) return

    setScripts(prev => {
      const roundKey = `round${roundNumber}` as keyof Pick<RoundScripts, 'round1' | 'round2' | 'round3'>
      const round = prev[roundKey]
      
      const newAction: RoundAction = {
        actionId: action.id,
        option: action
      }

      return {
        ...prev,
        [roundKey]: {
          ...round,
          actions: [...round.actions, newAction]
        }
      }
    })
  }

  const removeAction = (roundNumber: 1 | 2 | 3, actionIndex: number) => {
    setScripts(prev => {
      const roundKey = `round${roundNumber}` as keyof Pick<RoundScripts, 'round1' | 'round2' | 'round3'>
      const round = prev[roundKey]
      
      return {
        ...prev,
        [roundKey]: {
          ...round,
          actions: round.actions.filter((_, i) => i !== actionIndex)
        }
      }
    })
  }

  const getRoundValidation = (roundNumber: 1 | 2 | 3) => {
    if (!validation) return null
    
    return {
      violations: validation.violations.filter(v => v.roundNumber === roundNumber),
      warnings: validation.warnings.filter(w => w.roundNumber === roundNumber)
    }
  }
  
  if (!build) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            Round Scripts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Select a build to plan round actions</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent" />
          Round Scripts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Validation Summary */}
        {validation && (
          <div className={`p-3 rounded-lg ${
            validation.isValid 
              ? 'bg-emerald-50 border border-emerald-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {validation.isValid ? (
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <span className={`font-medium text-sm ${
                validation.isValid ? 'text-emerald-700' : 'text-red-700'
              }`}>
                {validation.isValid ? 'Valid Action Economy' : `${validation.violations.length} Violations Found`}
              </span>
            </div>
            
            {validation.warnings.length > 0 && (
              <div className="text-xs text-orange-600 mb-2">
                {validation.warnings.length} optimization warnings
              </div>
            )}

            {/* Resource Usage Summary */}
            <div className="text-xs text-muted-foreground">
              <strong>Resources Used:</strong> {validation.resourceUsage.otherResourcesUsed.join(', ') || 'None'}
              {Object.entries(validation.resourceUsage.spellSlotsUsed).length > 0 && (
                <>
                  {', '}
                  {Object.entries(validation.resourceUsage.spellSlotsUsed)
                    .map(([level, count]) => `L${level} slots: ${count}`)
                    .join(', ')}
                </>
              )}
            </div>
          </div>
        )}

        {/* Round Tabs */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(roundNum => {
            const roundNumber = roundNum as 1 | 2 | 3
            const round = scripts[`round${roundNumber}` as keyof Pick<RoundScripts, 'round1' | 'round2' | 'round3'>]
            const roundValidation = getRoundValidation(roundNumber)
            
            return (
              <RoundPanel
                key={roundNumber}
                roundNumber={roundNumber}
                round={round}
                availableActions={availableActions}
                validation={roundValidation}
                onAddAction={(actionId) => addAction(roundNumber, actionId)}
                onRemoveAction={(index) => removeAction(roundNumber, index)}
              />
            )
          })}
        </div>

        {/* Global Warnings */}
        {(validation?.warnings?.filter(w => w.roundNumber === 1 && w.type === 'suboptimal-resource-use')?.length ?? 0) > 0 && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-sm text-orange-700">Optimization Suggestions</span>
            </div>
            {validation?.warnings
              ?.filter(w => w.roundNumber === 1 && w.type === 'suboptimal-resource-use')
              ?.map((warning, i) => (
                <div key={i} className="text-xs text-orange-600">
                  • {warning.message}
                  {warning.suggestion && (
                    <div className="text-orange-500 ml-2">→ {warning.suggestion}</div>
                  )}
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Supporting Components
interface RoundPanelProps {
  roundNumber: 1 | 2 | 3
  round: RoundScript
  availableActions: ActionOption[]
  validation: { violations: any[], warnings: any[] } | null
  onAddAction: (actionId: string) => void
  onRemoveAction: (index: number) => void
}

function RoundPanel({
  roundNumber,
  round,
  availableActions,
  validation,
  onAddAction,
  onRemoveAction
}: RoundPanelProps) {
  const [showAddAction, setShowAddAction] = useState(false)
  
  const hasViolations = (validation?.violations?.length ?? 0) > 0
  const hasWarnings = (validation?.warnings?.length ?? 0) > 0

  // Group available actions by type
  const actionActions = getActionsByType(availableActions, 'action')
  const bonusActions = getActionsByType(availableActions, 'bonus-action') 
  const freeActions = getActionsByType(availableActions, 'free')

  return (
    <Card className={`${hasViolations ? 'border-red-300' : hasWarnings ? 'border-orange-300' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span>Round {roundNumber}</span>
            {hasViolations && <XCircle className="w-4 h-4 text-red-500" />}
            {!hasViolations && hasWarnings && <AlertTriangle className="w-4 h-4 text-orange-500" />}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddAction(!showAddAction)}
            className="h-6 px-2"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {/* Current Actions */}
        <div className="space-y-1 min-h-[80px]">
          {round.actions.length === 0 ? (
            <div className="text-xs text-muted-foreground italic p-2 text-center">
              No actions planned
            </div>
          ) : (
            round.actions.map((action, index) => (
              <ActionCard
                key={index}
                action={action}
                onRemove={() => onRemoveAction(index)}
              />
            ))
          )}
        </div>

        {/* Add Action Interface */}
        {showAddAction && (
          <div className="space-y-2 border-t pt-2">
            <div className="text-xs font-medium text-muted-foreground">Add Action:</div>
            
            {actionActions.length > 0 && (
              <ActionTypeSection
                title="Actions"
                actions={actionActions}
                onSelect={(actionId) => {
                  onAddAction(actionId)
                  setShowAddAction(false)
                }}
              />
            )}
            
            {bonusActions.length > 0 && (
              <ActionTypeSection
                title="Bonus Actions"
                actions={bonusActions}
                onSelect={(actionId) => {
                  onAddAction(actionId)
                  setShowAddAction(false)
                }}
              />
            )}
            
            {freeActions.length > 0 && (
              <ActionTypeSection
                title="Free Actions"
                actions={freeActions}
                onSelect={(actionId) => {
                  onAddAction(actionId)
                  setShowAddAction(false)
                }}
              />
            )}
          </div>
        )}

        {/* Validation Messages */}
        {validation?.violations.map((violation, i) => (
          <div key={i} className="text-xs text-red-600 bg-red-50 p-2 rounded">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            {violation.message}
          </div>
        ))}
        
        {validation?.warnings.map((warning, i) => (
          <div key={i} className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
            <Info className="w-3 h-3 inline mr-1" />
            {warning.message}
            {warning.suggestion && (
              <div className="text-orange-500 ml-4 mt-1">💡 {warning.suggestion}</div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface ActionCardProps {
  action: RoundAction
  onRemove: () => void
}

function ActionCard({ action, onRemove }: ActionCardProps) {
  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'action': return <Swords className="w-3 h-3" />
      case 'bonus-action': return <Zap className="w-3 h-3" />
      case 'reaction': return <Clock className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  const getActionTypeColor = (type: string) => {
    switch (type) {
      case 'action': return 'bg-blue-100 text-blue-800'
      case 'bonus-action': return 'bg-purple-100 text-purple-800'
      case 'reaction': return 'bg-green-100 text-green-800'
      case 'free': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex items-center justify-between p-2 bg-panel/50 rounded border">
      <div className="flex items-center gap-2 flex-1">
        <Badge className={`text-xs px-1.5 py-0.5 ${getActionTypeColor(action.option.type)}`}>
          {getActionTypeIcon(action.option.type)}
          <span className="ml-1 capitalize">{action.option.type.replace('-', ' ')}</span>
        </Badge>
        <span className="text-sm font-medium">{action.option.name}</span>
        {action.option.cost.length > 0 && (
          <div className="text-xs text-muted-foreground">
            ({action.option.cost.map(c => 
              c.type === 'spell-slot' ? `L${c.level} slot` : c.type.replace('-', ' ')
            ).join(', ')})
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  )
}

interface ActionTypeSectionProps {
  title: string
  actions: ActionOption[]
  onSelect: (actionId: string) => void
}

function ActionTypeSection({ title, actions, onSelect }: ActionTypeSectionProps) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground mb-1">{title}:</div>
      <Select onValueChange={onSelect}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder={`Choose ${title.toLowerCase()}...`} />
        </SelectTrigger>
        <SelectContent>
          {actions.map(action => (
            <SelectItem key={action.id} value={action.id} className="text-xs">
              <div className="flex items-center justify-between w-full">
                <span>{action.name}</span>
                {action.cost.length > 0 && (
                  <span className="text-muted-foreground ml-2">
                    ({action.cost.map(c => 
                      c.type === 'spell-slot' ? `L${c.level}` : c.type.split('-')[0]
                    ).join(', ')})
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// Helper function to create empty round
function createEmptyRound(roundNumber: 1 | 2 | 3, resources: ResourcePool): RoundScript {
  return {
    roundNumber,
    actions: [],
    availableResources: { ...resources },
    notes: ''
  }
}