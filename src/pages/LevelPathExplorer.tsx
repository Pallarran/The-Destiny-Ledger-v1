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
import type { BuildConfiguration, PathGenerationMode, CustomTargetConfiguration } from '../stores/types'
import { RouteIcon, Target, Settings2, TrendingUp, ToggleLeft, ToggleRight } from 'lucide-react'

export function LevelPathExplorer() {
  const { builds } = useVaultStore()
  
  // Mode state
  const [mode, setMode] = useState<PathGenerationMode>('existing-build')
  
  // Existing build mode state
  const [selectedBuildId, setSelectedBuildId] = useState<string>()
  
  // Custom target mode state  
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
    
    // Check if we have required data based on mode
    if (mode === 'existing-build' && !selectedBuildId) return
    if (mode === 'custom-target' && !customTarget) return

    setIsOptimizing(true)
    setLevelingPaths([])
    
    try {
      let optimizer: DynamicPathOptimizer
      
      if (mode === 'existing-build') {
        const targetBuild = builds.find(b => b.id === selectedBuildId)
        if (!targetBuild) return
        optimizer = DynamicPathOptimizer.fromBuild(targetBuild, selectedGoalId)
      } else {
        if (!customTarget) return
        optimizer = DynamicPathOptimizer.fromCustomTarget(customTarget, selectedGoalId)
      }
      
      const paths = await optimizer.generateOptimalPaths()
      setLevelingPaths(paths)
    } catch (error) {
      console.error('Error optimizing leveling paths:', error)
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleModeSwitch = () => {
    const newMode = mode === 'existing-build' ? 'custom-target' : 'existing-build'
    setMode(newMode)
    
    // Clear previous results when switching modes
    setLevelingPaths([])
    setSelectedPathId(undefined)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RouteIcon className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Level Path Explorer</h1>
            <p className="text-muted-foreground">
              {mode === 'existing-build' 
                ? 'Select a target build from your vault and find the optimal leveling sequence to reach it'
                : 'Define a custom target build and find the optimal leveling sequence to reach it'
              }
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-3">
          <span className={`text-sm ${mode === 'existing-build' ? 'font-medium' : 'text-muted-foreground'}`}>
            Vault Build
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleModeSwitch}
            className="p-1 h-8 w-8"
          >
            {mode === 'existing-build' ? (
              <ToggleLeft className="w-6 h-6" />
            ) : (
              <ToggleRight className="w-6 h-6 text-primary" />
            )}
          </Button>
          <span className={`text-sm ${mode === 'custom-target' ? 'font-medium' : 'text-muted-foreground'}`}>
            Custom Target
          </span>
        </div>
      </div>

      {/* Main Layout: Left Column Controls + Right Column Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Target Selection - Conditional based on mode */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {mode === 'existing-build' ? 'Target Build' : 'Custom Target'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mode === 'existing-build' ? (
                // Existing Build Mode
                selectedBuild ? (
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
                )
              ) : (
                // Custom Target Mode
                customTarget ? (
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg bg-primary/5 border-primary/20">
                      <div className="font-medium text-sm">{customTarget.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Level {customTarget.totalLevel} • {
                          customTarget.entries
                            .map(entry => `${entry.classId} ${entry.levels}`)
                            .join(' / ')
                        }
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCustomTargetModal(true)}
                      className="w-full text-sm"
                      size="sm"
                    >
                      Change Target
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={() => setShowCustomTargetModal(true)}
                    className="w-full"
                    size="sm"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Define Target
                  </Button>
                )
              )}
            </CardContent>
          </Card>

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
          {((mode === 'existing-build' && selectedBuild) || (mode === 'custom-target' && customTarget)) && selectedGoalId && (
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