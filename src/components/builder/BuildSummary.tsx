import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Save, Download } from 'lucide-react'
import { useBuilderStore } from '@/stores/builderStore'
import { useDPRStore } from '@/stores/dprStore'
import { useDatabase } from '@/hooks/useDatabase'
import { classesData } from '@/rules/data/classes.json'
import { weaponsData } from '@/rules/data/weapons.json'
import type { AbilityScore } from '@/rules/types'

const ABILITY_NAMES: Record<AbilityScore, string> = {
  STR: 'Strength',
  DEX: 'Dexterity', 
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma'
}

export function BuildSummary() {
  const { currentBuild, isDirty } = useBuilderStore()
  const { dprResults, isCalculating, calculateDPR } = useDPRStore()
  const { saveBuild } = useDatabase()
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (currentBuild) {
      calculateDPR(currentBuild)
    }
  }, [currentBuild, calculateDPR])

  if (!currentBuild) return null

  const handleSave = async () => {
    if (!currentBuild) return
    
    setIsSaving(true)
    try {
      await saveBuild(currentBuild)
    } catch (error) {
      console.error('Failed to save build:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    if (!currentBuild) return
    
    const exportData = {
      ...currentBuild,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentBuild.name.replace(/[^a-z0-9]/gi, '_')}_build.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getModifier = (score: number): number => Math.floor((score - 10) / 2)
  const getProficiencyBonus = (): number => Math.ceil(currentBuild.levels.length / 4) + 1

  const getClassLevels = () => {
    return currentBuild.levels.reduce((acc, level) => {
      acc[level.classId] = (acc[level.classId] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  const getMainWeapon = () => {
    if (!currentBuild.equipment.mainHand) return null
    return weaponsData.find(w => w.id === currentBuild.equipment.mainHand)
  }

  const getOffhandWeapon = () => {
    if (!currentBuild.equipment.offHand) return null
    return weaponsData.find(w => w.id === currentBuild.equipment.offHand)
  }

  const mainWeapon = getMainWeapon()
  const offhandWeapon = getOffhandWeapon()
  const classLevels = getClassLevels()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{currentBuild.name}</CardTitle>
              <CardDescription>
                Level {currentBuild.levels.length} Character Build Summary
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button onClick={handleSave} disabled={!isDirty || isSaving} size="sm">
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? 'Saving...' : 'Save Build'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Race</Label>
              <p className="font-medium capitalize">{currentBuild.race.replace('-', ' ')}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Total Level</Label>
              <p className="font-medium">{currentBuild.levels.length}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Proficiency Bonus</Label>
              <p className="font-medium">+{getProficiencyBonus()}</p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">Class Levels</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(classLevels).map(([classId, levels]) => {
                const classData = classesData.find(c => c.id === classId)
                return (
                  <Badge key={classId} variant="default">
                    {classData?.name} {levels}
                  </Badge>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ability Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(Object.keys(ABILITY_NAMES) as AbilityScore[]).map((ability) => (
              <div key={ability} className="text-center">
                <Label className="text-sm font-medium text-muted-foreground">
                  {ABILITY_NAMES[ability]}
                </Label>
                <div className="mt-1">
                  <div className="text-2xl font-bold">
                    {currentBuild.abilityScores[ability]}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getModifier(currentBuild.abilityScores[ability]) >= 0 ? '+' : ''}
                    {getModifier(currentBuild.abilityScores[ability])}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {(mainWeapon || offhandWeapon) && (
        <Card>
          <CardHeader>
            <CardTitle>Equipment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mainWeapon && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Main Hand</Label>
                <div className="mt-1">
                  <div className="font-medium">{mainWeapon.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {mainWeapon.damage.dice}d{mainWeapon.damage.die} {mainWeapon.damage.type}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {mainWeapon.properties.map(prop => (
                      <Badge key={prop} variant="secondary" className="text-xs">
                        {prop}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {offhandWeapon && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Off Hand</Label>
                <div className="mt-1">
                  <div className="font-medium">{offhandWeapon.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {offhandWeapon.damage.dice}d{offhandWeapon.damage.die} {offhandWeapon.damage.type}
                  </div>
                </div>
              </div>
            )}

            {currentBuild.equipment.armor && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Armor</Label>
                <div className="mt-1 capitalize">
                  {currentBuild.equipment.armor.replace('-', ' ')}
                  {currentBuild.equipment.shield && ' + Shield'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Damage Analysis</CardTitle>
          <CardDescription>
            DPR calculations against various AC targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isCalculating ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Calculating DPR...</span>
                <span>Please wait</span>
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          ) : dprResults ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {dprResults.averageDPR.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Average DPR</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {dprResults.maxDPR.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Max DPR</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {dprResults.optimalAC}
                  </div>
                  <div className="text-sm text-muted-foreground">Optimal AC</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {dprResults.gwmThreshold || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">GWM Threshold</div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                  DPR by AC Level
                </Label>
                <div className="grid grid-cols-5 gap-2 text-sm">
                  {dprResults.dprCurve.slice(0, 10).map((point) => (
                    <div key={point.ac} className="text-center">
                      <div className="font-mono font-medium">{point.dpr.toFixed(1)}</div>
                      <div className="text-muted-foreground">AC {point.ac}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No DPR data available. Add weapons to see damage analysis.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`} {...props}>
      {children}
    </label>
  )
}