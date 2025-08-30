import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { getRace } from '../../rules/loaders'
import { 
  Dices, 
  Sword,
  Info
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
                <span className="text-sm capitalize">
                  {currentBuild.race ? getRace(currentBuild.race)?.name || currentBuild.race : 'None'}
                  {currentBuild.subrace && ` (${currentBuild.subrace.replace('_', ' ')})`}
                </span>
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
          <div className="space-y-4">
            {/* Show racial bonuses if any */}
            {currentBuild.race && (
              <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">Racial Ability Bonuses Applied</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const race = getRace(currentBuild.race)
                    const racialBonuses: Record<string, number> = {}
                    
                    // Base race bonuses
                    race?.abilityScoreIncrease?.forEach(asi => {
                      racialBonuses[asi.ability] = (racialBonuses[asi.ability] || 0) + asi.bonus
                    })
                    
                    // Subrace bonuses
                    if (currentBuild.subrace && race?.subraces) {
                      const subrace = race.subraces.find(s => s.id === currentBuild.subrace)
                      subrace?.abilityScoreIncrease?.forEach(asi => {
                        racialBonuses[asi.ability] = (racialBonuses[asi.ability] || 0) + asi.bonus
                      })
                    }
                    
                    return Object.entries(racialBonuses).map(([ability, bonus]) => (
                      <Badge key={ability} variant="outline" className="text-xs">
                        {ability} +{bonus}
                      </Badge>
                    ))
                  })()}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
              {Object.entries(currentBuild.finalAbilityScores || currentBuild.abilityScores).map(([ability, score]) => {
                const modifier = getAbilityModifier(score)
                const baseScore = currentBuild.baseAbilityScores?.[ability as keyof typeof currentBuild.baseAbilityScores] || score
                const hasBonus = baseScore !== score
                
                return (
                  <div key={ability} className="p-3 bg-panel/5 rounded-lg">
                    <div className="font-semibold">{ability}</div>
                    <div className="text-2xl font-bold text-accent">{score}</div>
                    <div className="text-sm text-muted">{formatModifier(modifier)}</div>
                    {hasBonus && (
                      <div className="text-xs text-emerald">
                        (base: {baseScore})
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
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
                  <span className="text-muted">Weapon:</span>
                  <span>{currentBuild.selectedMainHand || 'None'}</span>
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
      
    </div>
  )
}