import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { 
  Dices, 
  Sword
} from 'lucide-react'

export function BuildSummary() {
  const { 
    currentBuild
  } = useCharacterBuilderStore()
  
  if (!currentBuild) {
    return <div className="text-center text-muted">Loading build summary...</div>
  }
  
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
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-panel mb-2">Build Summary</h2>
        <p className="text-muted">
          Review your completed character build and calculate DPR.
        </p>
      </div>
      
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
              // Calculate final score with race bonuses
              const getRaceBonus = (race: string, abilityName: string): number => {
                const raceBonuses: Record<string, Record<string, number>> = {
                  'human_variant': { 'STR': 1, 'DEX': 1 }, // Simplified - variant human gets +1 to two chosen abilities
                  'elf_high': { 'DEX': 2, 'INT': 1 },
                  'dwarf_mountain': { 'CON': 2, 'STR': 2 },
                  'halfling_lightfoot': { 'DEX': 2, 'CHA': 1 },
                  'dragonborn': { 'STR': 2, 'CHA': 1 },
                  'tiefling': { 'CHA': 2, 'INT': 1 }
                }
                return raceBonuses[race]?.[abilityName] || 0
              }
              
              const raceBonus = getRaceBonus(currentBuild.race || '', ability)
              const finalScore = baseScore + raceBonus
              const modifier = getAbilityModifier(finalScore)
              
              return (
                <div key={ability} className="p-3 bg-panel/5 rounded-lg">
                  <div className="font-semibold">{ability}</div>
                  <div className="text-2xl font-bold text-accent">{finalScore}</div>
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
      
      {/* Level Progression Summary */}
      {currentBuild.enhancedLevelTimeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Level Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...currentBuild.enhancedLevelTimeline]
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