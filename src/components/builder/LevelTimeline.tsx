import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useBuilderStore } from '@/stores/builderStore'
import { classesData } from '@/rules/data/classes.json'
import { subclassesData } from '@/rules/data/subclasses.json'
import type { CharacterLevel, ClassDefinition, SubclassDefinition } from '@/rules/types'

export function LevelTimeline() {
  const { currentBuild, updateBuild } = useBuilderStore()
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null)

  if (!currentBuild) return null

  const addLevel = () => {
    const newLevel = currentBuild.levels.length + 1
    const lastLevel = currentBuild.levels[currentBuild.levels.length - 1]
    
    const newCharacterLevel: CharacterLevel = {
      level: newLevel,
      classId: lastLevel?.classId || 'fighter',
      subclassId: lastLevel?.subclassId || null,
      features: [],
      spells: []
    }

    updateBuild({
      levels: [...currentBuild.levels, newCharacterLevel]
    })
  }

  const removeLevel = (levelIndex: number) => {
    if (currentBuild.levels.length <= 1) return
    
    const newLevels = currentBuild.levels.filter((_, index) => index !== levelIndex)
    // Renumber levels
    const renumberedLevels = newLevels.map((level, index) => ({
      ...level,
      level: index + 1
    }))
    
    updateBuild({ levels: renumberedLevels })
  }

  const updateLevel = (levelIndex: number, updates: Partial<CharacterLevel>) => {
    const newLevels = [...currentBuild.levels]
    newLevels[levelIndex] = { ...newLevels[levelIndex], ...updates }
    updateBuild({ levels: newLevels })
  }

  const getClassLevels = (classId: string): number => {
    return currentBuild.levels.filter(level => level.classId === classId).length
  }

  const getAvailableSubclasses = (classId: string): SubclassDefinition[] => {
    return subclassesData.filter(sub => sub.parentClass === classId)
  }

  const getClassFeatures = (classId: string, classLevel: number): string[] => {
    const classData = classesData.find(c => c.id === classId)
    if (!classData) return []

    const features: string[] = []
    
    // Add base class features for this level
    Object.entries(classData.features).forEach(([level, levelFeatures]) => {
      if (parseInt(level) === classLevel) {
        features.push(...levelFeatures.map(f => f.name))
      }
    })

    return features
  }

  const getSubclassFeatures = (subclassId: string, classLevel: number): string[] => {
    const subclassData = subclassesData.find(s => s.id === subclassId)
    if (!subclassData) return []

    const features: string[] = []
    
    // Add subclass features for this level
    Object.entries(subclassData.features).forEach(([level, levelFeatures]) => {
      if (parseInt(level) === classLevel) {
        features.push(...levelFeatures.map(f => f.name))
      }
    })

    return features
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Level Progression</CardTitle>
              <CardDescription>
                Plan your character's advancement through levels 1-20
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                Level {currentBuild.levels.length}
              </Badge>
              <Button onClick={addLevel} size="sm" disabled={currentBuild.levels.length >= 20}>
                <Plus className="h-4 w-4 mr-1" />
                Add Level
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-2">
        {currentBuild.levels.map((level, levelIndex) => {
          const classData = classesData.find(c => c.id === level.classId)
          const subclassData = level.subclassId ? subclassesData.find(s => s.id === level.subclassId) : null
          const classLevel = getClassLevels(level.classId)
          const classFeatures = getClassFeatures(level.classId, classLevel)
          const subclassFeatures = level.subclassId ? getSubclassFeatures(level.subclassId, classLevel) : []
          const isExpanded = expandedLevel === levelIndex

          return (
            <Card key={levelIndex} className="relative">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge className="shrink-0">
                      Level {level.level}
                    </Badge>
                    
                    <div className="flex items-center gap-2">
                      <select
                        value={level.classId}
                        onChange={(e) => updateLevel(levelIndex, { classId: e.target.value, subclassId: null })}
                        className="rounded-md border border-input bg-background px-3 py-1 text-sm"
                      >
                        {classesData.map(cls => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                      
                      <Badge variant="secondary">
                        {classData?.name} {classLevel}
                      </Badge>
                    </div>

                    {getAvailableSubclasses(level.classId).length > 0 && classLevel >= 3 && (
                      <select
                        value={level.subclassId || ''}
                        onChange={(e) => updateLevel(levelIndex, { subclassId: e.target.value || null })}
                        className="rounded-md border border-input bg-background px-3 py-1 text-sm"
                      >
                        <option value="">Select subclass...</option>
                        {getAvailableSubclasses(level.classId).map(sub => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                      </select>
                    )}

                    {subclassData && (
                      <Badge variant="outline">
                        {subclassData.name}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedLevel(isExpanded ? null : levelIndex)}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLevel(levelIndex)}
                      disabled={currentBuild.levels.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    <div>
                      <h4 className="font-medium mb-2">Features Gained</h4>
                      <div className="space-y-2">
                        {classFeatures.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-muted-foreground">
                              {classData?.name} Features
                            </h5>
                            <div className="flex flex-wrap gap-1">
                              {classFeatures.map(feature => (
                                <Badge key={feature} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {subclassFeatures.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-muted-foreground">
                              {subclassData?.name} Features
                            </h5>
                            <div className="flex flex-wrap gap-1">
                              {subclassFeatures.map(feature => (
                                <Badge key={feature} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {classFeatures.length === 0 && subclassFeatures.length === 0 && (
                          <p className="text-sm text-muted-foreground italic">
                            No new features at this level
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Progression Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Hit Points:</span>
                          <span className="ml-2 font-mono">
                            {classData ? Math.floor(classData.hitDie / 2) + 1 : 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Proficiency:</span>
                          <span className="ml-2 font-mono">
                            +{Math.ceil(level.level / 4) + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-3">Class Distribution</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(
              currentBuild.levels.reduce((acc, level) => {
                acc[level.classId] = (acc[level.classId] || 0) + 1
                return acc
              }, {} as Record<string, number>)
            ).map(([classId, levels]) => {
              const classData = classesData.find(c => c.id === classId)
              return (
                <Badge key={classId} variant="default">
                  {classData?.name} {levels}
                </Badge>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}