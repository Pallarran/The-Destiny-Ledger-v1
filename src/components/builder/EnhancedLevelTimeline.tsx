import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { classes } from '../../rules/srd/classes'
import { feats } from '../../rules/srd/feats'
import { subclasses } from '../../rules/srd/subclasses'
import { getClass } from '../../rules/loaders'
import { Plus, Sword, BookOpen, Shield, Star, ChevronRight, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import type { BuilderLevelEntry } from '../../types/character'

const CLASS_ICONS = {
  fighter: Sword,
  wizard: BookOpen,
  rogue: Shield,
  cleric: Star,
} as const



function LevelMilestoneCard({ entry, classData, classLevel, currentBuild, updateLevel, selectFeat, selectASI, setSkillProficiencies }: {
  entry: BuilderLevelEntry
  classData?: any
  classLevel: number
  currentBuild: any
  updateLevel: (level: number, updates: any) => void
  selectFeat: (level: number, featId: string) => void
  selectASI: (level: number, abilityIncreases: any) => void
  setSkillProficiencies: (skills: string[]) => void
}) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const Icon = classData ? CLASS_ICONS[classData.id as keyof typeof CLASS_ICONS] || Sword : Clock

  // Get class features for this level
  const classFeatures = classData?.features[classLevel] || []
  
  // Create comprehensive feature/choice list
  const sections = []
  
  // 1. Class Features (automatic)
  const autoFeatures = classFeatures.filter((f: any) => 
    f.rulesKey !== 'fighting_style' && f.rulesKey !== 'asi' && f.rulesKey !== 'archetype' && f.rulesKey !== 'archetype_feature'
  )
  if (autoFeatures.length > 0) {
    sections.push({
      id: 'class_features',
      title: 'Class Features',
      type: 'auto',
      isComplete: true,
      features: autoFeatures.map((f: any) => ({ name: f.name, description: f.description }))
    })
  }

  // 2. Fighting Style Choice
  const hasFightingStyle = classFeatures.some((f: any) => f.rulesKey === 'fighting_style')
  if (hasFightingStyle) {
    const availableStyles = classData?.fightingStyles || []
    sections.push({
      id: 'fighting_style',
      title: 'Fighting Style',
      type: 'choice',
      isComplete: !!entry.fightingStyle,
      currentChoice: entry.fightingStyle,
      options: availableStyles.map((style: any) => ({
        id: style.id,
        name: style.name,
        description: style.description
      })),
      onChoice: (styleId: string) => {
        updateLevel(entry.level, { fightingStyle: styleId })
        setExpandedSection(null)
      }
    })
  }

  // 3. Archetype Choice (initial selection only)
  const hasArchetype = classFeatures.some((f: any) => f.rulesKey === 'archetype')
  if (hasArchetype) {
    const availableSubclasses = Object.values(subclasses).filter((sub: any) => sub.className === entry.classId)
    sections.push({
      id: 'archetype',
      title: `${classData?.name} Archetype`,
      type: 'choice',
      isComplete: !!entry.archetype,
      currentChoice: entry.archetype,
      options: availableSubclasses.map((subclass: any) => ({
        id: subclass.id,
        name: subclass.name,
        description: subclass.description
      })),
      onChoice: (archetypeId: string) => {
        updateLevel(entry.level, { archetype: archetypeId })
        setExpandedSection(null)
      }
    })
  }

  // 3b. Archetype Features (automatic)
  const archetypeFeatures = classFeatures.filter((f: any) => f.rulesKey === 'archetype_feature')
  if (archetypeFeatures.length > 0) {
    // Get the specific archetype features from the selected subclass
    // Look for archetype in this level first, or find it from earlier levels of the same class
    let selectedArchetype = entry.archetype
    if (!selectedArchetype && currentBuild?.enhancedLevelTimeline) {
      const earlierArchetypeEntry = currentBuild.enhancedLevelTimeline
        .filter((e: any) => e.classId === entry.classId && e.level < entry.level && e.archetype)
        .sort((a: any, b: any) => b.level - a.level)[0]
      selectedArchetype = earlierArchetypeEntry?.archetype
    }
    
    const specificArchetypeFeatures = []
    
    if (selectedArchetype) {
      // Find the subclass data
      const subclass = Object.values(subclasses).find((sub: any) => sub.id === selectedArchetype)
      console.log('Archetype lookup:', { selectedArchetype, subclass: subclass?.name, classLevel })
      if (subclass && subclass.features) {
        // Get features for this class level from the subclass (features is an array, not keyed by level)
        const subclassFeatures = subclass.features.filter((f: any) => f.level === classLevel)
        console.log('Subclass features for level', classLevel, ':', subclassFeatures)
        if (subclassFeatures && subclassFeatures.length > 0) {
          specificArchetypeFeatures.push(...subclassFeatures.map((f: any) => ({ 
            name: f.name, 
            description: f.description 
          })))
        }
      }
    } else {
      console.log('No archetype selected for entry:', entry)
    }
    
    sections.push({
      id: 'archetype_features',
      title: 'Archetype Features',
      type: 'auto',
      isComplete: true,
      features: specificArchetypeFeatures.length > 0 
        ? specificArchetypeFeatures 
        : archetypeFeatures.map((f: any) => ({ name: f.name, description: f.description }))
    })
  }

  // 4. ASI/Feat Choice
  const hasASI = classFeatures.some((f: any) => f.rulesKey === 'asi')
  if (hasASI) {
    sections.push({
      id: 'asi_feat',
      title: 'Ability Score Improvement or Feat',
      type: 'asi_feat',
      isComplete: !!entry.asiOrFeat,
      currentChoice: entry.asiOrFeat,
      selectedFeat: entry.featId,
      abilityIncreases: entry.abilityIncreases,
      onASI: (increases: any) => {
        selectASI(entry.level, increases)
        setExpandedSection(null)
      },
      onFeat: (featId: string) => {
        selectFeat(entry.level, featId)
        setExpandedSection(null)
      }
    })
  }

  // 5. Skills (Level 1 only)
  if (entry.level === 1 && classLevel === 1) {
    const classSkills = classData?.skillChoices || []
    const skillCount = classData?.skillChoiceCount || 2
    const selectedSkills = currentBuild.skillProficiencies || []
    
    sections.push({
      id: 'skills',
      title: `Class Skills (Choose ${skillCount})`,
      type: 'skills',
      isComplete: selectedSkills.length >= skillCount,
      availableSkills: classSkills,
      selectedSkills: selectedSkills,
      skillCount: skillCount,
    })
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  const allComplete = sections.filter(s => s.type !== 'auto').every(s => s.isComplete)

  return (
    <div className="relative">
      {/* Timeline connector */}
      <div className="absolute left-4 top-6 w-px h-full bg-border/50 -z-10" />
      
      {/* Main Level Card */}
      <Card className={`border-2 transition-all ${
        allComplete ? 'border-emerald/40 bg-emerald/5' : 'border-border bg-card'
      }`}>
        <CardContent className="p-4">
          {/* Level Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold border-2 border-background shadow-sm">
              {entry.level}
            </div>
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5" />
              <span className="font-semibold text-base">
                {classData?.name || entry.classId} {classLevel}
              </span>
              {entry.subclassId && (
                <Badge variant="outline" className="text-xs">
                  {entry.subclassId}
                </Badge>
              )}
            </div>
            <div className="ml-auto">
              {allComplete ? (
                <CheckCircle className="w-5 h-5 text-emerald" />
              ) : (
                <div className="flex items-center gap-1 text-xs text-muted">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>{sections.filter(s => !s.isComplete && s.type !== 'auto').length} pending</span>
                </div>
              )}
            </div>
          </div>

          {/* Feature Sections */}
          <div className="space-y-3">
            {sections.map((section) => (
              <div key={section.id} className="border rounded-lg overflow-hidden">
                {/* Section Header */}
                <div
                  className={`p-3 cursor-pointer transition-colors ${
                    section.isComplete 
                      ? 'bg-emerald/10 border-emerald/20' 
                      : section.type === 'auto' 
                      ? 'bg-blue/5 border-blue/20'
                      : 'bg-red/10 border-red/20'
                  } ${section.type !== 'auto' ? 'hover:bg-opacity-80' : ''}`}
                  onClick={() => section.type !== 'auto' && toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        section.isComplete ? 'bg-emerald text-white' : 'bg-red-500 text-white'
                      }`}>
                        {section.isComplete ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                      </div>
                      <span className="font-medium text-sm">{section.title}</span>
                      {section.isComplete && section.currentChoice && (
                        <Badge variant="secondary" className="text-xs">
                          {section.currentChoice.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                    {section.type !== 'auto' && (
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        expandedSection === section.id ? 'rotate-90' : ''
                      }`} />
                    )}
                  </div>
                  
                  {/* Auto features display */}
                  {section.type === 'auto' && section.features && (
                    <div className="mt-2 pt-2 border-t border-current/20">
                      <div className="flex flex-wrap gap-1">
                        {section.features.map((feature: any, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Expandable Content */}
                {expandedSection === section.id && renderSectionContent(section)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  function renderSectionContent(section: any) {
    switch (section.type) {
      case 'choice':
        return (
          <div className="p-3 bg-panel/5">
            <div className="space-y-2">
              {section.options.map((option: any) => (
                <label
                  key={option.id}
                  className="flex items-start gap-2 p-2 rounded hover:bg-accent/5 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`${section.id}-${entry.level}`}
                    value={option.id}
                    checked={section.currentChoice === option.id}
                    onChange={() => section.onChoice(option.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{option.name}</div>
                    <div className="text-xs text-muted">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )

      case 'asi_feat':
        return (
          <div className="p-3 bg-panel/5">
            <div className="space-y-3">
              {/* ASI/Feat Choice */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`asi-feat-${entry.level}`}
                    checked={section.currentChoice === 'asi'}
                    onChange={() => {
                      updateLevel(entry.level, { asiOrFeat: 'asi' })
                    }}
                  />
                  <span className="text-sm font-medium">Ability Score Improvement</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`asi-feat-${entry.level}`}
                    checked={section.currentChoice === 'feat'}
                    onChange={() => {
                      // Just set the choice to 'feat' mode, actual feat selection happens below
                      updateLevel(entry.level, { asiOrFeat: 'feat' })
                    }}
                  />
                  <span className="text-sm font-medium">Feat</span>
                </label>
              </div>

              {/* ASI Selection Interface */}
              {section.currentChoice === 'asi' && (
                <div className="pl-6 border-l-2 border-accent/20">
                  <div className="text-xs font-medium text-muted mb-2">Choose Ability Increases:</div>
                  <div className="text-xs text-muted mb-2">You can increase one ability by 2, or two different abilities by 1 each.</div>
                  <div className="space-y-2">
                    {/* Single +2 Option */}
                    <div className="space-y-1">
                      <div className="text-xs font-medium">Increase one ability by 2:</div>
                      <div className="grid grid-cols-3 gap-2">
                        {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((ability) => (
                          <label key={`single-${ability}`} className="flex items-center gap-1 text-xs cursor-pointer">
                            <input
                              type="radio"
                              name={`asi-single-${entry.level}`}
                              onChange={() => {
                                const increases = { [ability]: 2 }
                                updateLevel(entry.level, { abilityIncreases: increases })
                              }}
                              checked={section.abilityIncreases?.[ability] === 2 && Object.keys(section.abilityIncreases || {}).length === 1}
                            />
                            <span>{ability} +2</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    {/* Two +1 Options */}
                    <div className="space-y-1">
                      <div className="text-xs font-medium">Or increase two abilities by 1 each:</div>
                      <div className="text-xs text-muted mb-2">Click two different abilities:</div>
                      <div className="grid grid-cols-3 gap-2">
                        {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((ability) => (
                          <label key={`double-${ability}`} className="flex items-center gap-1 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                const currentIncreases = section.abilityIncreases || {}
                                const newIncreases = { ...currentIncreases }
                                
                                if (e.target.checked) {
                                  // Add this ability (+1), but limit to 2 total abilities
                                  const selectedCount = Object.keys(newIncreases).length
                                  if (selectedCount < 2) {
                                    newIncreases[ability] = 1
                                  }
                                } else {
                                  // Remove this ability
                                  delete newIncreases[ability]
                                }
                                
                                updateLevel(entry.level, { abilityIncreases: newIncreases })
                              }}
                              checked={section.abilityIncreases?.[ability] === 1}
                              disabled={
                                !section.abilityIncreases?.[ability] && 
                                Object.keys(section.abilityIncreases || {}).length >= 2
                              }
                            />
                            <span>{ability} +1</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Show appropriate sub-selection */}
              {section.currentChoice === 'feat' && (
                <div className="pl-6 border-l-2 border-accent/20">
                  <div className="text-xs font-medium text-muted mb-2">Choose Feat:</div>
                  <Select 
                    value={section.selectedFeat || ""} 
                    onValueChange={(featId) => section.onFeat(featId)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a feat..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {Object.values(feats).map((feat: any) => (
                        <SelectItem key={feat.id} value={feat.id}>
                          <div className="flex flex-col gap-1">
                            <div className="font-medium">{feat.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {feat.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        )

      case 'skills':
        return (
          <div className="p-3 bg-panel/5">
            <div className="text-xs text-muted mb-2">
              Select {section.skillCount} skills ({section.selectedSkills.length}/{section.skillCount})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {section.availableSkills.map((skill: string) => (
                <label key={skill} className="flex items-center gap-2 p-1 rounded hover:bg-accent/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={section.selectedSkills.includes(skill)}
                    disabled={!section.selectedSkills.includes(skill) && section.selectedSkills.length >= section.skillCount}
                    onChange={() => {
                      const currentSkills = section.selectedSkills
                      const newSkills = currentSkills.includes(skill)
                        ? currentSkills.filter((s: string) => s !== skill)
                        : [...currentSkills, skill]
                      setSkillProficiencies(newSkills)
                    }}
                  />
                  <span className="text-xs">{skill}</span>
                </label>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }
}

export function EnhancedLevelTimeline() {
  const { currentBuild, addLevel, selectFeat, selectASI, updateLevel, setSkillProficiencies } = useCharacterBuilderStore()
  const [selectedClass, setSelectedClass] = useState('')
  
  if (!currentBuild) {
    return <div className="text-center text-muted">Loading class progression...</div>
  }
  
  const levels = [...(currentBuild.enhancedLevelTimeline || [])].sort((a, b) => a.level - b.level)
  const nextLevel = levels.length > 0 ? Math.max(...levels.map(l => l.level)) + 1 : 1
  const availableClasses = Object.values(classes)
  

  const handleAddLevel = () => {
    if (selectedClass && nextLevel <= 20) {
      addLevel(selectedClass, nextLevel)
      setSelectedClass('')
    }
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
            Add Level
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
              {nextLevel > 20 ? 'Maximum Level Reached' : 'Add Level'}
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
              const classData = getClass(entry.classId)
              const classLevel = levels.filter(l => l.classId === entry.classId && l.level <= entry.level).length
              
              return (
                <LevelMilestoneCard 
                  key={entry.level}
                  entry={entry}
                  classData={classData}
                  classLevel={classLevel}
                  currentBuild={currentBuild}
                  updateLevel={updateLevel}
                  selectFeat={selectFeat}
                  selectASI={selectASI}
                  setSkillProficiencies={setSkillProficiencies}
                />
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
                  <CheckCircle className="w-4 h-4 text-emerald" />
                  <span className="text-emerald">{levels.length} levels configured</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}