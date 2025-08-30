import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { classes } from '../../rules/srd/classes'
import { feats } from '../../rules/srd/feats'
import { getClass } from '../../rules/loaders'
import { Plus, Sword, BookOpen, Shield, Star, ChevronRight, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import type { AbilityScore, AbilityScoreArray } from '../../rules/types'
import type { BuilderLevelEntry } from '../../types/character'

const CLASS_ICONS = {
  fighter: Sword,
  wizard: BookOpen,
  rogue: Shield,
  cleric: Star,
} as const

const CLASS_COLORS = {
  fighter: 'text-red-500 bg-red-500/10 border-red-500/20',
  wizard: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  rogue: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  cleric: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
} as const

interface LevelMilestone {
  level: number
  type: 'class' | 'asi' | 'feat' | 'archetype' | 'major_feature'
  description: string
  isComplete: boolean
  hasIssues: boolean
}

interface ASIFeatChoiceProps {
  level: number
  currentChoice?: 'asi' | 'feat' | null
  featId?: string
  abilityIncreases?: Partial<AbilityScoreArray>
  onChoice: (choice: 'asi' | 'feat', data?: { featId?: string; abilityIncreases?: Partial<AbilityScoreArray> }) => void
}

interface FightingStyleChoiceProps {
  level: number
  classId: string
  currentChoice?: string
  onChoice: (styleId: string) => void
}

interface ArchetypeChoiceProps {
  level: number
  classId: string
  currentChoice?: string
  onChoice: (archetypeId: string) => void
}

function ASIFeatChoice({ level, currentChoice, featId, abilityIncreases, onChoice }: ASIFeatChoiceProps) {
  const [selectedFeat, setSelectedFeat] = useState(featId || '')
  const [asiChoices, setAsiChoices] = useState<Partial<AbilityScoreArray>>(abilityIncreases || {})

  const availableFeats = Object.values(feats)
  const asiRemaining = 2 - Object.values(asiChoices).reduce((sum, val) => sum + (val || 0), 0)

  const handleFeatChange = (value: string) => {
    setSelectedFeat(value)
    onChoice('feat', { featId: value })
  }

  const handleASIChange = (ability: AbilityScore, change: number) => {
    const newChoices = {
      ...asiChoices,
      [ability]: (asiChoices[ability] || 0) + change
    }
    setAsiChoices(newChoices)
    onChoice('asi', { abilityIncreases: newChoices })
  }

  return (
    <Card className="border-accent/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="w-6 h-6 bg-accent/10 text-accent rounded-full flex items-center justify-center text-xs font-bold">
            {level}
          </div>
          ASI/Feat Choice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={currentChoice === 'asi' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChoice('asi', { abilityIncreases: {} })}
          >
            Ability Score Improvement
          </Button>
          <Button
            variant={currentChoice === 'feat' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChoice('feat', {})}
          >
            Feat
          </Button>
        </div>

        {currentChoice === 'feat' && (
          <div>
            <Select value={selectedFeat} onValueChange={handleFeatChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a feat..." />
              </SelectTrigger>
              <SelectContent>
                {availableFeats.map(feat => {
                  const hasPrerequisites = feat.prerequisites && feat.prerequisites.length > 0
                  const isHalfFeat = feat.abilityScoreIncrease !== undefined
                  
                  return (
                    <SelectItem key={feat.id} value={feat.id}>
                      <div className="w-full">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{feat.name}</div>
                          <div className="flex gap-1">
                            {isHalfFeat && (
                              <Badge variant="secondary" className="text-xs">
                                +1 ASI
                              </Badge>
                            )}
                            {hasPrerequisites && (
                              <Badge variant="outline" className="text-xs">
                                Prereq
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-muted truncate max-w-60 mt-1">
                          {feat.description}
                        </div>
                        {hasPrerequisites && (
                          <div className="text-xs text-danger mt-1">
                            Requires: {feat.prerequisites!.join(', ')}
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            {selectedFeat && feats[selectedFeat]?.abilityScoreIncrease && (
              <div className="mt-3 p-3 bg-accent/5 border border-accent/20 rounded">
                <div className="text-sm font-medium mb-2">
                  Half-Feat: Choose ability to increase (+1):
                </div>
                <div className="flex flex-wrap gap-2">
                  {feats[selectedFeat].abilityScoreIncrease!.choices.map(ability => (
                    <Button
                      key={ability}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Store both the feat and the ability choice
                        onChoice('feat', { 
                          featId: selectedFeat,
                          abilityIncreases: { [ability]: 1 }
                        })
                      }}
                      className="text-xs"
                    >
                      {ability} (+1)
                    </Button>
                  ))}
                </div>
                <div className="text-xs text-muted mt-2">
                  This feat provides both the feat benefits and a +1 ability score increase.
                </div>
              </div>
            )}
            
            {/* Display selected feat details */}
            {selectedFeat && feats[selectedFeat] && (
              <div className="mt-3 p-3 bg-panel/5 border border-border/20 rounded">
                <div className="text-sm font-medium mb-2">Feat Details:</div>
                <div className="space-y-2">
                  {feats[selectedFeat].features.map((feature, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="font-medium text-accent">{feature.name}</div>
                      <div className="text-muted">{feature.description}</div>
                    </div>
                  ))}
                </div>
                {feats[selectedFeat].prerequisites && (
                  <div className="mt-2 text-xs text-danger">
                    <span className="font-medium">Prerequisites:</span> {feats[selectedFeat].prerequisites!.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {currentChoice === 'asi' && (
          <div>
            <div className="text-sm font-medium mb-2">
              Distribute points (+{asiRemaining} remaining):
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as AbilityScore[]).map(ability => (
                <div key={ability} className="flex items-center gap-2">
                  <span className="text-sm font-mono w-8">{ability}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={(asiChoices[ability] || 0) <= 0}
                      onClick={() => handleASIChange(ability, -1)}
                      className="h-6 w-6 p-0"
                    >
                      -
                    </Button>
                    <span className="w-6 text-center text-sm">
                      {asiChoices[ability] || 0}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={asiRemaining <= 0 || (asiChoices[ability] || 0) >= 2}
                      onClick={() => handleASIChange(ability, 1)}
                      className="h-6 w-6 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function FightingStyleChoice({ level, classId, currentChoice, onChoice }: FightingStyleChoiceProps) {
  const [selectedStyle, setSelectedStyle] = useState(currentChoice || '')
  
  const classData = getClass(classId)
  const availableStyles = classData?.fightingStyles || []

  const handleStyleChange = (styleId: string) => {
    setSelectedStyle(styleId)
    onChoice(styleId)
  }

  return (
    <Card className="border-accent/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="w-6 h-6 bg-accent/10 text-accent rounded-full flex items-center justify-center text-xs font-bold">
            {level}
          </div>
          Fighting Style Choice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted mb-3">
          Choose a fighting style to specialize in:
        </div>
        
        <div className="grid gap-2">
          {availableStyles.map(style => (
            <button
              key={style.id}
              onClick={() => handleStyleChange(style.id)}
              className={`text-left p-3 rounded-lg border transition-colors ${
                selectedStyle === style.id
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-accent/50 hover:bg-accent/5'
              }`}
            >
              <div className="font-medium text-sm">{style.name}</div>
              <div className="text-xs text-muted mt-1">{style.description}</div>
            </button>
          ))}
        </div>
        
        {selectedStyle && (
          <div className="p-3 bg-emerald/5 border border-emerald/20 rounded">
            <div className="flex items-center gap-2 text-emerald text-sm">
              <CheckCircle className="w-4 h-4" />
              Fighting style selected successfully!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ArchetypeChoice({ level, classId, currentChoice, onChoice }: ArchetypeChoiceProps) {
  const [selectedArchetype, setSelectedArchetype] = useState(currentChoice || '')
  
  // For now, provide basic archetype options per class
  const archetypeOptions = {
    fighter: [
      { id: 'champion', name: 'Champion', description: 'Improved critical hit chance and athletic prowess.' },
      { id: 'battle_master', name: 'Battle Master', description: 'Tactical combat maneuvers and superiority dice.' },
      { id: 'eldritch_knight', name: 'Eldritch Knight', description: 'Blend of martial prowess and wizard spellcasting.' }
    ],
    rogue: [
      { id: 'thief', name: 'Thief', description: 'Enhanced climbing, stealth, and use of magic items.' },
      { id: 'assassin', name: 'Assassin', description: 'Deadly surprise attacks and infiltration skills.' },
      { id: 'arcane_trickster', name: 'Arcane Trickster', description: 'Combines roguish skills with wizard magic.' }
    ],
    wizard: [
      { id: 'evocation', name: 'School of Evocation', description: 'Mastery of destructive magic and sculpted spells.' },
      { id: 'abjuration', name: 'School of Abjuration', description: 'Protective magic and spell resistance.' }
    ],
    cleric: [
      { id: 'life', name: 'Life Domain', description: 'Enhanced healing and vitality magic.' },
      { id: 'war', name: 'War Domain', description: 'Divine magic focused on battle and conflict.' }
    ]
  } as const
  
  const availableArchetypes = archetypeOptions[classId as keyof typeof archetypeOptions] || []

  const handleArchetypeChange = (archetypeId: string) => {
    setSelectedArchetype(archetypeId)
    onChoice(archetypeId)
  }

  return (
    <Card className="border-accent/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="w-6 h-6 bg-accent/10 text-accent rounded-full flex items-center justify-center text-xs font-bold">
            {level}
          </div>
          Archetype Choice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted mb-3">
          Choose your {classId} archetype to specialize your abilities:
        </div>
        
        <div className="grid gap-2">
          {availableArchetypes.map(archetype => (
            <button
              key={archetype.id}
              onClick={() => handleArchetypeChange(archetype.id)}
              className={`text-left p-3 rounded-lg border transition-colors ${
                selectedArchetype === archetype.id
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-accent/50 hover:bg-accent/5'
              }`}
            >
              <div className="font-medium text-sm">{archetype.name}</div>
              <div className="text-xs text-muted mt-1">{archetype.description}</div>
            </button>
          ))}
        </div>
        
        {selectedArchetype && (
          <div className="p-3 bg-emerald/5 border border-emerald/20 rounded">
            <div className="flex items-center gap-2 text-emerald text-sm">
              <CheckCircle className="w-4 h-4" />
              Archetype selected successfully!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LevelMilestoneCard({ entry, milestone, classData, onFightingStyleClick, onArchetypeClick, onASIFeatClick, hasInteractiveFeatures }: {
  entry: BuilderLevelEntry
  milestone: LevelMilestone
  classData?: any
  onFightingStyleClick?: () => void
  onArchetypeClick?: () => void
  onASIFeatClick?: () => void
  hasInteractiveFeatures?: boolean
}) {
  const Icon = classData ? CLASS_ICONS[classData.id as keyof typeof CLASS_ICONS] || Sword : Clock
  const colorClass = classData ? CLASS_COLORS[classData.id as keyof typeof CLASS_COLORS] || '' : ''

  const StatusIcon = milestone.hasIssues ? AlertTriangle : 
                     milestone.isComplete ? CheckCircle : Clock

  const handleCardClick = () => {
    // Priority order for opening selections
    if (onFightingStyleClick) {
      onFightingStyleClick()
    } else if (onArchetypeClick) {
      onArchetypeClick()
    } else if (onASIFeatClick) {
      onASIFeatClick()
    }
  }

  return (
    <div className="relative">
      {/* Timeline connector */}
      <div className="absolute left-4 top-12 w-px h-full bg-border -z-10" />
      
      <Card className={`${colorClass} transition-all hover:shadow-md ${
        hasInteractiveFeatures ? 'cursor-pointer hover:border-accent/50' : ''
      }`} onClick={hasInteractiveFeatures ? handleCardClick : undefined}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Level Badge */}
            <div className="relative">
              <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold border-2 border-background shadow-sm">
                {entry.level}
              </div>
              <div className="absolute -bottom-1 -right-1">
                <StatusIcon className={`w-4 h-4 ${
                  milestone.hasIssues ? 'text-danger' : 
                  milestone.isComplete ? 'text-emerald' : 'text-muted'
                }`} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">
                  {classData?.name || entry.classId} {entry.level}
                </span>
                {entry.subclassId && (
                  <Badge variant="outline" className="text-xs">
                    {entry.subclassId}
                  </Badge>
                )}
              </div>
              
              <p className="text-xs text-muted mb-2">{milestone.description}</p>
              
              {/* Features */}
              {entry.features && entry.features.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {entry.features.map((featureId, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {featureId}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Selected Features */}
              <div className="flex flex-wrap gap-1 mb-2">
                {(entry as any).fightingStyle && (
                  <Badge variant="default" className="text-xs bg-emerald/10 text-emerald border-emerald/20">
                    <Sword className="w-3 h-3 mr-1" />
                    {classData?.fightingStyles?.find((fs: any) => fs.id === (entry as any).fightingStyle)?.name || (entry as any).fightingStyle}
                  </Badge>
                )}
                {(entry as any).archetype && (
                  <Badge variant="default" className="text-xs bg-blue/10 text-blue border-blue/20">
                    <Star className="w-3 h-3 mr-1" />
                    {(entry as any).archetype}
                  </Badge>
                )}
                {entry.asiOrFeat === 'feat' && entry.featId && (
                  <Badge variant="default" className="text-xs bg-purple/10 text-purple border-purple/20">
                    <Plus className="w-3 h-3 mr-1" />
                    {entry.featId}
                  </Badge>
                )}
                {entry.asiOrFeat === 'asi' && entry.abilityIncreases && (
                  <Badge variant="default" className="text-xs bg-orange/10 text-orange border-orange/20">
                    <Plus className="w-3 h-3 mr-1" />
                    ASI
                  </Badge>
                )}
              </div>

              {/* Validation Issues */}
              {entry.validationErrors && entry.validationErrors.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-danger">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{entry.validationErrors[0]}</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            {hasInteractiveFeatures && (
              <div className="flex items-center text-xs text-muted">
                <span className="mr-1">Click to {milestone.hasIssues ? 'choose' : 'change'}</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function EnhancedLevelTimeline() {
  const { currentBuild, addLevel, selectFeat, selectASI, updateLevel } = useCharacterBuilderStore()
  const [selectedClass, setSelectedClass] = useState('')
  const [showASIFeat, setShowASIFeat] = useState<number | null>(null)
  const [showFightingStyle, setShowFightingStyle] = useState<number | null>(null)
  const [showArchetype, setShowArchetype] = useState<number | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  
  if (!currentBuild) {
    return <div className="text-center text-muted">Loading class progression...</div>
  }
  
  const levels = [...(currentBuild.enhancedLevelTimeline || [])].sort((a, b) => a.level - b.level)
  const nextLevel = levels.length > 0 ? Math.max(...levels.map(l => l.level)) + 1 : 1
  const availableClasses = Object.values(classes)
  
  // Helper function to generate milestone data
  const generateMilestone = (entry: BuilderLevelEntry): LevelMilestone => {
    const classData = getClass(entry.classId)
    const classLevel = levels.filter(l => l.classId === entry.classId && l.level <= entry.level).length
    const features = classData?.features[classLevel] || []
    
    let type: LevelMilestone['type'] = 'class'
    let description = `Level ${classLevel} ${classData?.name || entry.classId}`
    
    // Get fighting style and archetype values early
    const fightingStyle = entry.fightingStyle || (entry as any).fightingStyle
    const archetype = entry.archetype || (entry as any).archetype
    
    // Detect special milestones
    const hasASI = features.some(f => f.rulesKey === 'asi')
    const hasArchetype = features.some(f => f.id.includes('archetype'))
    const hasFightingStyle = features.some(f => f.rulesKey === 'fighting_style')
    const hasMajorFeature = features.some(f => 
      f.rulesKey?.includes('extra_attack') || f.rulesKey?.includes('action_surge') || f.rulesKey?.includes('sneak_attack')
    )
    
    // Determine milestone type and description
    if (hasASI) {
      type = entry.asiOrFeat === 'feat' ? 'feat' : 'asi'
      description = entry.asiOrFeat === 'feat' ? `Feat: ${entry.featId || 'Choose feat'}` : 'Ability Score Improvement'
    } else if (hasArchetype) {
      type = 'archetype'
      description = `Choose ${classData?.name} archetype`
    } else if (hasFightingStyle) {
      type = 'major_feature'
      const fightingStyleName = fightingStyle ? 
        classData?.fightingStyles?.find(fs => fs.id === fightingStyle)?.name : 
        'Choose Fighting Style'
      description = `Fighting Style: ${fightingStyleName}`
    } else if (hasMajorFeature) {
      type = 'major_feature'
      description = features.find(f => f.rulesKey?.includes('extra_attack') || f.rulesKey?.includes('action_surge'))?.name || description
    }
    
    // Determine completion status
    const needsASIChoice = hasASI && !entry.asiOrFeat
    const needsFightingStyleChoice = hasFightingStyle && !fightingStyle
    const needsArchetypeChoice = hasArchetype && !archetype
    
    // A level is complete if all required choices are made
    const hasAllRequiredChoices = !needsASIChoice && !needsFightingStyleChoice && !needsArchetypeChoice
    const isComplete = hasAllRequiredChoices
    
    // Only show issues if there are actual choices needed
    const hasIssues = Boolean(
      (entry.validationErrors?.length || 0) > 0 || 
      needsASIChoice || 
      needsFightingStyleChoice || 
      needsArchetypeChoice
    )
    
    return {
      level: entry.level,
      type,
      description,
      isComplete,
      hasIssues
    }
  }

  const handleAddLevel = () => {
    if (selectedClass && nextLevel <= 20) {
      addLevel(selectedClass, nextLevel)
      setSelectedClass('')
    }
  }

  const handleASIFeatChoice = (level: number, choice: 'asi' | 'feat', data?: { featId?: string; abilityIncreases?: Partial<AbilityScoreArray> }) => {
    if (choice === 'feat' && data?.featId) {
      selectFeat(level, data.featId)
    } else if (choice === 'asi' && data?.abilityIncreases) {
      selectASI(level, data.abilityIncreases)
    }
    setShowASIFeat(null)
    // Force a re-render to update visual feedback
    setRefreshKey(prev => prev + 1)
  }

  const handleFightingStyleChoice = (level: number, styleId: string) => {
    console.log('Fighting style selected:', { level, styleId })
    // Store the fighting style choice in the level entry
    updateLevel(level, { fightingStyle: styleId, isCompleted: true })
    console.log('updateLevel called with:', { level, fightingStyle: styleId, isCompleted: true })
    setShowFightingStyle(null)
    // Force a re-render to update visual feedback
    setRefreshKey(prev => prev + 1)
  }

  const handleArchetypeChoice = (level: number, archetypeId: string) => {
    // Store the archetype choice in the level entry
    updateLevel(level, { archetype: archetypeId, isCompleted: true })
    setShowArchetype(null)
    // Force a re-render to update visual feedback
    setRefreshKey(prev => prev + 1)
  }

  // Trigger validation when levels change
  useEffect(() => {
    if (currentBuild) {
      const { validateCurrentStep } = useCharacterBuilderStore.getState()
      validateCurrentStep()
    }
  }, [currentBuild, levels])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-2">Class Progression</h2>
        <p className="text-muted">
          Build your character level by level. Choose classes, track features, and make ASI/feat decisions.
        </p>
      </div>
      
      {/* Add Level Section */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Level {nextLevel}
            {nextLevel > 20 && (
              <Badge variant="destructive">Max Level Reached</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Choose Class:</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class..." />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses.map(cls => {
                    const Icon = CLASS_ICONS[cls.id as keyof typeof CLASS_ICONS] || Sword
                    return (
                      <SelectItem key={cls.id} value={cls.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{cls.name}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleAddLevel} 
              disabled={!selectedClass || nextLevel > 20}
              className="w-full"
            >
              {nextLevel > 20 ? 'Maximum Level Reached' : `Add Level ${nextLevel}`}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Timeline */}
      {levels.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span>Level Timeline</span>
            <Badge variant="outline">{levels.length} levels</Badge>
          </h3>
          
          <div className="space-y-4 relative">
            {levels.map((entry) => {
              const milestone = generateMilestone(entry) // Generate fresh milestone data
              const classData = getClass(entry.classId)
              const classLevel = levels.filter(l => l.classId === entry.classId && l.level <= entry.level).length
              const features = classData?.features[classLevel] || []
              const hasASI = features.some(f => f.rulesKey === 'asi')
              const hasFightingStyle = features.some(f => f.rulesKey === 'fighting_style')
              const hasArchetype = features.some(f => f.id.includes('archetype'))
              
              
              // Create a unique key that includes the current data state to force re-render when data changes
              const dataKey = `${entry.level}-${(entry as any).fightingStyle || 'none'}-${(entry as any).archetype || 'none'}-${entry.asiOrFeat || 'none'}-${refreshKey}`
              
              return (
                <div key={dataKey}>
                  <LevelMilestoneCard 
                    key={`card-${dataKey}`}
                    entry={entry}
                    milestone={milestone}
                    classData={classData}
                    onFightingStyleClick={hasFightingStyle ? () => setShowFightingStyle(entry.level) : undefined}
                    onArchetypeClick={hasArchetype ? () => setShowArchetype(entry.level) : undefined}
                    onASIFeatClick={hasASI ? () => setShowASIFeat(entry.level) : undefined}
                    hasInteractiveFeatures={hasFightingStyle || hasArchetype || hasASI}
                  />
                  
                  {/* Fighting Style Choice */}
                  {hasFightingStyle && (showFightingStyle === entry.level || (!(entry as any).fightingStyle && showFightingStyle === null)) && (
                    <div className="ml-12 mt-2">
                      <FightingStyleChoice
                        level={entry.level}
                        classId={entry.classId}
                        currentChoice={(entry as any).fightingStyle}
                        onChoice={(styleId) => handleFightingStyleChoice(entry.level, styleId)}
                      />
                    </div>
                  )}
                  
                  {/* Archetype Choice */}
                  {hasArchetype && (showArchetype === entry.level || (!(entry as any).archetype && showArchetype === null)) && (
                    <div className="ml-12 mt-2">
                      <ArchetypeChoice
                        level={entry.level}
                        classId={entry.classId}
                        currentChoice={(entry as any).archetype}
                        onChoice={(archetypeId) => handleArchetypeChoice(entry.level, archetypeId)}
                      />
                    </div>
                  )}
                  
                  {/* ASI/Feat Choice */}
                  {hasASI && (showASIFeat === entry.level || (!entry.asiOrFeat && !showASIFeat)) && (
                    <div className="ml-12 mt-2">
                      <ASIFeatChoice
                        level={entry.level}
                        currentChoice={entry.asiOrFeat}
                        featId={entry.featId}
                        abilityIncreases={entry.abilityIncreases}
                        onChoice={(choice, data) => handleASIFeatChoice(entry.level, choice, data)}
                      />
                    </div>
                  )}
                  
                  {/* Show ASI/Feat button if not expanded */}
                  {hasASI && !entry.asiOrFeat && showASIFeat !== entry.level && (
                    <div className="ml-12 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowASIFeat(entry.level)}
                        className="text-xs"
                      >
                        <AlertTriangle className="w-3 h-3 mr-1 text-danger" />
                        Choose ASI or Feat
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Summary Stats */}
      {levels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progression Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-accent">{Math.max(...levels.map(l => l.level), 0)}</div>
                <div className="text-sm text-muted">Total Level</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{new Set(levels.map(l => l.classId)).size}</div>
                <div className="text-sm text-muted">Classes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{levels.filter(l => l.asiOrFeat === 'feat').length}</div>
                <div className="text-sm text-muted">Feats</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{levels.filter(l => l.asiOrFeat === 'asi').length}</div>
                <div className="text-sm text-muted">ASIs</div>
              </div>
            </div>
            
            {/* Validation Summary */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span>Progression Status:</span>
                <div className="flex items-center gap-2">
                  {(() => {
                    const currentMilestones = levels.map(generateMilestone)
                    const allComplete = currentMilestones.filter(m => m.isComplete).length === currentMilestones.length
                    const hasIssues = currentMilestones.some(m => m.hasIssues)
                    
                    if (allComplete) {
                      return (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald" />
                          <span className="text-emerald">Complete</span>
                        </>
                      )
                    } else if (hasIssues) {
                      return (
                        <>
                          <AlertTriangle className="w-4 h-4 text-danger" />
                          <span className="text-danger">Issues Found</span>
                        </>
                      )
                    } else {
                      return (
                        <>
                          <Clock className="w-4 h-4 text-muted" />
                          <span className="text-muted">In Progress</span>
                        </>
                      )
                    }
                  })()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}