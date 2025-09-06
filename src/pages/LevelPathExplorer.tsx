import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { TargetBuildModal } from '../components/levelPathExplorer/TargetBuildModal'
import { OptimizationGoalSelector } from '../components/levelPathExplorer/OptimizationGoalSelector'
import { LevelingPathResults } from '../components/levelPathExplorer/LevelingPathResults'
import { TargetBuildOptimizer } from '../engine/targetBuildOptimizer'
import { useVaultStore } from '../stores/vaultStore'
import type { LevelingPath } from '../engine/targetBuildOptimizer'
import type { BuildConfiguration } from '../stores/types'
import { RouteIcon, Target, Settings2 } from 'lucide-react'

export function LevelPathExplorer() {
  const { builds } = useVaultStore()
  const [selectedBuildId, setSelectedBuildId] = useState<string>()
  const [selectedGoalId, setSelectedGoalId] = useState<string>()
  const [levelingPaths, setLevelingPaths] = useState<LevelingPath[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [selectedPathId, setSelectedPathId] = useState<string>()
  const [showBuildModal, setShowBuildModal] = useState(false)

  const selectedBuild = selectedBuildId ? builds.find(b => b.id === selectedBuildId) : undefined

  const getClassBreakdown = (build: BuildConfiguration): Record<string, number> => {
    const breakdown: Record<string, number> = {}
    if (build.levelTimeline) {
      for (const entry of build.levelTimeline) {
        breakdown[entry.classId] = (breakdown[entry.classId] || 0) + 1
      }
    }
    return breakdown
  }

  const handleOptimize = async () => {
    if (!selectedBuildId || !selectedGoalId) return

    const targetBuild = builds.find(b => b.id === selectedBuildId)
    if (!targetBuild) return

    setIsOptimizing(true)
    setLevelingPaths([])
    
    try {
      const optimizer = new TargetBuildOptimizer(targetBuild, selectedGoalId)
      const paths = await optimizer.generateLevelingPaths()
      setLevelingPaths(paths)
    } catch (error) {
      console.error('Error optimizing leveling paths:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <RouteIcon className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Level Path Explorer</h1>
          <p className="text-muted-foreground">
            Select a target build from your vault and find the optimal leveling sequence to reach it
          </p>
        </div>
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Target Build Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Target Build
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose a build from your vault to optimize the leveling path for
            </p>
          </CardHeader>
          <CardContent>
            {selectedBuild ? (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{selectedBuild.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Level {selectedBuild.currentLevel} • {
                          Object.entries(getClassBreakdown(selectedBuild))
                            .map(([classId, levels]) => `${classId} ${levels}`)
                            .join(' / ')
                        }
                      </div>
                      {selectedBuild.tags && selectedBuild.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {selectedBuild.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {selectedBuild.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{selectedBuild.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setShowBuildModal(true)}
                  className="w-full"
                >
                  Change Target Build
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => setShowBuildModal(true)}
                className="w-full"
              >
                <Target className="w-4 h-4 mr-2" />
                Select Target Build
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Optimization Goal Selection */}
        <OptimizationGoalSelector
          selectedGoalId={selectedGoalId}
          onGoalSelect={setSelectedGoalId}
        />
      </div>

      {/* Optimize Button */}
      {selectedBuild && selectedGoalId && (
        <div className="flex justify-center">
          <Button
            onClick={handleOptimize}
            disabled={isOptimizing}
            size="lg"
            className="px-8"
          >
            {isOptimizing ? (
              <>
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                Optimizing Leveling Path...
              </>
            ) : (
              <>
                <Settings2 className="w-4 h-4 mr-2" />
                Generate Optimal Leveling Paths
              </>
            )}
          </Button>
        </div>
      )}

      {/* Leveling Path Results */}
      <LevelingPathResults
        paths={levelingPaths}
        onSelectPath={setSelectedPathId}
        selectedPathId={selectedPathId}
      />

      {/* Target Build Selection Modal */}
      <TargetBuildModal
        isOpen={showBuildModal}
        onClose={() => setShowBuildModal(false)}
        selectedBuildId={selectedBuildId}
        onBuildSelect={setSelectedBuildId}
      />
    </div>
  )
}