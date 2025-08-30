import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { Link } from 'react-router-dom'
import { 
  Dices, 
  Sword, 
  CheckCircle,
  AlertTriangle,
  Save,
  Archive
} from 'lucide-react'

export function BuildSummary() {
  const { 
    currentBuild,
    validateAllSteps,
    updateBuild,
    saveBuild
  } = useCharacterBuilderStore()
  
  const [buildName, setBuildName] = useState(currentBuild?.name || '')
  const [buildNotes, setBuildNotes] = useState(currentBuild?.notes || '')
  
  if (!currentBuild) {
    return <div className="text-center text-muted">Loading build summary...</div>
  }
  
  const isValid = validateAllSteps()
  
  // Calculate basic stats
  const totalLevel = Math.max(...currentBuild.enhancedLevelTimeline.map(l => l.level), 1)
  const classBreakdown = currentBuild.enhancedLevelTimeline.reduce((acc, level) => {
    acc[level.classId] = (acc[level.classId] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const mainClass = Object.entries(classBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
  const featCount = currentBuild.enhancedLevelTimeline.filter(l => l.asiOrFeat === 'feat').length
  const asiCount = currentBuild.enhancedLevelTimeline.filter(l => l.asiOrFeat === 'asi').length
  
  const getAbilityModifier = (score: number) => Math.floor((score - 10) / 2)
  const formatModifier = (mod: number) => mod >= 0 ? `+${mod}` : `${mod}`
  
  const handleNameChange = (name: string) => {
    setBuildName(name)
    updateBuild({ name })
  }
  
  const handleNotesChange = (notes: string) => {
    setBuildNotes(notes)
    updateBuild({ notes })
  }
  
  const validationIssues = []
  if (!currentBuild.race) validationIssues.push('Race not selected')
  if (currentBuild.enhancedLevelTimeline.length === 0) validationIssues.push('No class levels defined')
  if (!buildName.trim()) validationIssues.push('Build name required')
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-panel mb-2">Build Summary</h2>
        <p className="text-muted">
          Review your completed character build, calculate DPR, and save to your vault.
        </p>
      </div>
      
      {/* Validation Issues Only */}
      {(validationIssues.length > 0 || isValid) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationIssues.length > 0 ? (
                <><AlertTriangle className="w-5 h-5" /> Build Validation</>
              ) : (
                <><CheckCircle className="w-5 h-5" /> Build Ready</>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {validationIssues.length > 0 && (
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Issues to Address
                </div>
                <ul className="text-sm text-destructive space-y-1">
                  {validationIssues.map((issue, index) => (
                    <li key={index} className="ml-4">• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {isValid && validationIssues.length === 0 && (
              <div className="bg-emerald/5 border border-emerald/20 rounded-lg p-3">
                <div className="flex items-center gap-2 text-emerald text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Build is valid and ready to save!
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Build Details */}
      <Card>
        <CardHeader>
          <CardTitle>Build Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buildName">Build Name *</Label>
                <Input
                  id="buildName"
                  value={buildName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter build name"
                />
              </div>
              <div>
                <Label htmlFor="buildNotes">Notes (Optional)</Label>
                <Input
                  id="buildNotes"
                  value={buildNotes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Build notes or description"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Character Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Character Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-panel/5 rounded-lg">
                <span className="text-sm font-medium">Race</span>
                <span className="text-sm capitalize">{(currentBuild.race || 'None').replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-panel/5 rounded-lg">
                <span className="text-sm font-medium">Background</span>
                <span className="text-sm capitalize">{(currentBuild.background || 'None').replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-panel/5 rounded-lg">
                <span className="text-sm font-medium">Level</span>
                <span className="text-sm font-bold">{totalLevel}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-panel/5 rounded-lg">
                <span className="text-sm font-medium">Primary Class</span>
                <span className="text-sm capitalize font-bold">{mainClass.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-panel/5 rounded-lg">
                <span className="text-sm font-medium">Feats Taken</span>
                <span className="text-sm font-bold">{featCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-panel/5 rounded-lg">
                <span className="text-sm font-medium">ASIs Taken</span>
                <span className="text-sm font-bold">{asiCount}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Final Ability Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dices className="w-5 h-5" />
            Final Ability Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
            {Object.entries(currentBuild.abilityScores).map(([ability, baseScore]) => {
              // Calculate final score with race bonuses (simplified race bonus logic)
              const getRaceBonus = (race: string, abilityName: string): number => {
                const raceBonuses: Record<string, Record<string, number>> = {
                  'human_variant': { 'STR': 1, 'DEX': 1 }, // Simplified
                  'elf': { 'DEX': 2 },
                  'dwarf': { 'CON': 2 },
                  'halfling': { 'DEX': 2 },
                  'dragonborn': { 'STR': 2, 'CHA': 1 },
                  'gnome': { 'INT': 2 },
                  'half_elf': { 'CHA': 2 },
                  'half_orc': { 'STR': 2, 'CON': 1 },
                  'tiefling': { 'INT': 1, 'CHA': 2 }
                }
                return raceBonuses[race]?.[abilityName] || 0
              }
              
              const raceBonus = getRaceBonus(currentBuild.race || '', ability)
              const finalScore = baseScore + raceBonus
              const modifier = getAbilityModifier(finalScore)
              
              return (
                <div key={ability} className="p-3 bg-panel/5 rounded-lg">
                  <div className="font-semibold text-panel">{ability}</div>
                  <div className="text-2xl font-bold text-panel">{finalScore}</div>
                  <div className="text-sm text-muted">{formatModifier(modifier)}</div>
                  {raceBonus > 0 && (
                    <div className="text-xs text-muted">
                      ({baseScore} + {raceBonus} race)
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Equipment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sword className="w-5 h-5" />
            Equipment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-panel mb-3">Weapons</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Main Hand:</span>
                  <span>{currentBuild.selectedMainHand || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Ranged:</span>
                  <span>{currentBuild.selectedRanged || 'None'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-panel mb-3">Defense</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Armor:</span>
                  <span>{currentBuild.selectedArmor || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Shield:</span>
                  <span>{currentBuild.hasShield ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      
      {/* Save to Vault */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5" />
            Save Build
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Archive className="w-12 h-12 text-accent mx-auto mb-4" />
            <p className="text-muted mb-4">
              Save this build to your vault for future reference and comparison.
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={saveBuild}
                disabled={!isValid || !buildName.trim()}
                variant="accent"
                className="min-w-[120px]"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Build
              </Button>
              <Button asChild variant="outline">
                <Link to="/vault">
                  <Archive className="w-4 h-4 mr-2" />
                  View Vault
                </Link>
              </Button>
            </div>
            {(!isValid || !buildName.trim()) && (
              <p className="text-destructive text-sm mt-2">
                {!buildName.trim() ? 'Build name is required' : 'Complete the build to save'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Level Progression Summary */}
      {currentBuild.enhancedLevelTimeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Level Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentBuild.enhancedLevelTimeline
                .sort((a, b) => a.level - b.level)
                .map(entry => (
                  <div key={entry.level} className="flex items-center justify-between p-2 bg-panel/5 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-accent/10 text-accent rounded-full flex items-center justify-center text-xs font-bold">
                        {entry.level}
                      </div>
                      <span className="font-medium">{entry.classId}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {entry.asiOrFeat && (
                        <Badge variant="outline" className="text-xs">
                          {entry.asiOrFeat === 'feat' ? 'Feat' : 'ASI'}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {entry.features.length} features
                      </Badge>
                    </div>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}