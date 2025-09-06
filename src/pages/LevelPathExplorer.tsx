import { useState } from 'react'
import { TargetBuildSelector } from '../components/levelPathExplorer/TargetBuildSelector'
import { LevelingPathResults } from '../components/levelPathExplorer/LevelingPathResults'
import { TargetBuildOptimizer } from '../engine/targetBuildOptimizer'
import { useVaultStore } from '../stores/vaultStore'
import type { LevelingPath } from '../engine/targetBuildOptimizer'
import { RouteIcon } from 'lucide-react'

export function LevelPathExplorer() {
  const { builds } = useVaultStore()
  const [selectedBuildId, setSelectedBuildId] = useState<string>()
  const [selectedGoalId, setSelectedGoalId] = useState<string>()
  const [levelingPaths, setLevelingPaths] = useState<LevelingPath[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [selectedPathId, setSelectedPathId] = useState<string>()

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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Target Build Selector */}
        <div className="lg:col-span-2">
          <TargetBuildSelector
            selectedBuildId={selectedBuildId}
            selectedGoalId={selectedGoalId}
            onBuildSelect={setSelectedBuildId}
            onGoalSelect={setSelectedGoalId}
            onOptimize={handleOptimize}
            isOptimizing={isOptimizing}
          />
        </div>

        {/* Leveling Path Results */}
        <div className="lg:col-span-3">
          <LevelingPathResults
            paths={levelingPaths}
            onSelectPath={setSelectedPathId}
            selectedPathId={selectedPathId}
          />
        </div>
      </div>
    </div>
  )
}