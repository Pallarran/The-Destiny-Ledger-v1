import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { TargetBuildModal } from '../components/levelPathExplorer/TargetBuildModal'
import { CustomTargetModal } from '../components/levelPathExplorer/CustomTargetModal'
import { OptimizationGoalModalV2 } from '../components/levelPathExplorer/OptimizationGoalModalV2'
import { LevelingPathResultsV2 } from '../components/levelPathExplorer/LevelingPathResultsV2'
import { getOptimizationGoalsV2 } from '../engine/targetBuildOptimizerV2'
import { DynamicPathOptimizer } from '../engine/dynamicPathOptimizer'
import { useVaultStore } from '../stores/vaultStore'
import type { LevelingPathV2 } from '../engine/targetBuildOptimizerV2'
import type { BuildConfiguration, CustomTargetConfiguration } from '../stores/types'
import { RouteIcon, Target, Settings2, TrendingUp } from 'lucide-react'

export function LevelPathExplorer() {
  const { builds } = useVaultStore()
  
  // Build selection state
  const [selectedBuildId, setSelectedBuildId] = useState<string>()
  
  // Custom target state (shown for non-level-20 builds)
  const [customTarget, setCustomTarget] = useState<CustomTargetConfiguration>()
  
  // Shared state
  const [selectedGoalId, setSelectedGoalId] = useState<string>()
  const [levelingPaths, setLevelingPaths] = useState<LevelingPathV2[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [selectedPathId, setSelectedPathId] = useState<string>()
  
  // Modal state
  const [showBuildModal, setShowBuildModal] = useState(false)
  const [showCustomTargetModal, setShowCustomTargetModal] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)

  const selectedBuild = selectedBuildId ? builds.find(b => b.id === selectedBuildId) : undefined
  const selectedGoal = selectedGoalId ? getOptimizationGoalsV2().find(g => g.id === selectedGoalId) : undefined
  
  // Determine if we should show custom target option (for non-level-20 builds)
  const showCustomTargetOption = selectedBuild && selectedBuild.currentLevel < 20

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
    if (!selectedGoalId) return

    setIsOptimizing(true)
    setLevelingPaths([])
    
    try {
      let optimizer: DynamicPathOptimizer
      
      if (customTarget) {
        // Use custom target if defined
        optimizer = DynamicPathOptimizer.fromCustomTarget(customTarget, selectedGoalId)
      } else if (selectedBuildId) {
        // Use selected build
        const targetBuild = builds.find(b => b.id === selectedBuildId)
        if (!targetBuild) return
        optimizer = DynamicPathOptimizer.fromBuild(targetBuild, selectedGoalId)
      } else {
        return // No target defined
      }
      
      const paths = await optimizer.generateOptimalPaths()
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

      {/* Main Layout: Left Column Controls + Right Column Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Target Build Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Target Build
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedBuild ? (
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg bg-primary/5 border-primary/20">
                    <div className="font-medium text-sm">{selectedBuild.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Level {selectedBuild.currentLevel} • {
                        Object.entries(getClassBreakdown(selectedBuild))
                          .map(([classId, levels]) => `${classId} ${levels}`)
                          .join(' / ')
                      }
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowBuildModal(true)}
                    className="w-full text-sm"
                    size="sm"
                  >
                    Change Build
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setShowBuildModal(true)}
                  className="w-full"
                  size="sm"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Select Build
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Custom Target Option - Only shown for non-level-20 builds */}
          {showCustomTargetOption && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5" />
                  Custom Target
                </CardTitle>
                <div className="text-xs text-muted-foreground">
                  Define a different target build to optimize towards
                </div>
              </CardHeader>
              <CardContent>
                {customTarget ? (
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg bg-secondary/5 border-secondary/20">
                      <div className="font-medium text-sm">{customTarget.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Level {customTarget.totalLevel} • {
                          customTarget.entries
                            .map(entry => `${entry.classId} ${entry.levels}`)
                            .join(' / ')
                        }
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCustomTargetModal(true)}
                        className="flex-1 text-sm"
                        size="sm"
                      >
                        Edit Target
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => setCustomTarget(undefined)}
                        className="text-sm"
                        size="sm"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={() => setShowCustomTargetModal(true)}
                    className="w-full"
                    size="sm"
                    variant="outline"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Define Custom Target
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Optimization Goal Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Optimization Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedGoal ? (
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg bg-primary/5 border-primary/20">
                    <div className="font-medium text-sm">{selectedGoal.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {selectedGoal.description}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowGoalModal(true)}
                    className="w-full text-sm"
                    size="sm"
                  >
                    Change Goal
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setShowGoalModal(true)}
                  className="w-full"
                  size="sm"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Select Goal
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Generate Button */}
          {(selectedBuild || customTarget) && selectedGoalId && (
            <Button
              onClick={handleOptimize}
              disabled={isOptimizing}
              className="w-full"
            >
              {isOptimizing ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Settings2 className="w-4 h-4 mr-2" />
                  Generate Paths
                </>
              )}
            </Button>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-2">
          <LevelingPathResultsV2
            paths={levelingPaths}
            onSelectPath={setSelectedPathId}
            selectedPathId={selectedPathId}
          />
        </div>
      </div>

      {/* Modals */}
      <TargetBuildModal
        isOpen={showBuildModal}
        onClose={() => setShowBuildModal(false)}
        selectedBuildId={selectedBuildId}
        onBuildSelect={setSelectedBuildId}
      />

      <CustomTargetModal
        isOpen={showCustomTargetModal}
        onClose={() => setShowCustomTargetModal(false)}
        onTargetDefine={setCustomTarget}
        sourceBuild={selectedBuild}
      />
      
      <OptimizationGoalModalV2
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        selectedGoalId={selectedGoalId}
        onGoalSelect={setSelectedGoalId}
      />
    </div>
  )
}