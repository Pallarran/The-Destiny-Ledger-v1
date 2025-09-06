import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  Target, 
  Search, 
  BookOpen, 
  Users,
  Zap,
  Shield,
  Sparkles,
  BarChart3,
  TrendingUp
} from 'lucide-react'
import { useVaultStore } from '../../stores/vaultStore'
import type { BuildConfiguration } from '../../stores/types'
import { getOptimizationGoals, getGoalsByCategory } from '../../engine/targetBuildOptimizer'

interface TargetBuildSelectorProps {
  selectedBuildId?: string
  selectedGoalId?: string
  onBuildSelect: (buildId: string) => void
  onGoalSelect: (goalId: string) => void
  onOptimize: () => void
  isOptimizing: boolean
}

export function TargetBuildSelector({
  selectedBuildId,
  selectedGoalId,
  onBuildSelect,
  onGoalSelect,
  onOptimize,
  isOptimizing
}: TargetBuildSelectorProps) {
  const { builds } = useVaultStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGoalCategory, setSelectedGoalCategory] = useState<string>('all')

  const optimizationGoals = getOptimizationGoals()
  const goalCategories = ['all', 'combat', 'survival', 'utility', 'balanced']

  // Filter builds based on search
  const filteredBuilds = builds.filter(build => 
    build.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    build.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Filter goals by category
  const filteredGoals = selectedGoalCategory === 'all' 
    ? optimizationGoals
    : getGoalsByCategory(selectedGoalCategory)

  const selectedBuild = builds.find(b => b.id === selectedBuildId)

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'combat': return <Zap className="w-4 h-4" />
      case 'survival': return <Shield className="w-4 h-4" />
      case 'utility': return <Sparkles className="w-4 h-4" />
      case 'balanced': return <BarChart3 className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  // Extract class breakdown from build
  const getClassBreakdown = (build: BuildConfiguration): Record<string, number> => {
    const breakdown: Record<string, number> = {}
    if (build.levelTimeline) {
      for (const entry of build.levelTimeline) {
        breakdown[entry.classId] = (breakdown[entry.classId] || 0) + 1
      }
    }
    return breakdown
  }

  return (
    <div className="space-y-6">
      {/* Target Build Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Select Target Build
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose a build from your vault to optimize the leveling path for
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search builds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-md bg-transparent"
            />
          </div>

          {/* Build List */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredBuilds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No builds found</p>
                <p className="text-sm">Create builds in the Character Builder first</p>
              </div>
            ) : (
              filteredBuilds.map((build) => {
                const classBreakdown = getClassBreakdown(build)
                const isSelected = selectedBuildId === build.id
                
                return (
                  <div
                    key={build.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50 hover:bg-accent/5'
                    }`}
                    onClick={() => onBuildSelect(build.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{build.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Level {build.currentLevel} • {
                            Object.entries(classBreakdown)
                              .map(([classId, levels]) => `${classId} ${levels}`)
                              .join(' / ')
                          }
                        </div>
                        {build.tags && build.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {build.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {build.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{build.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="text-primary">
                          <Target className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Goal Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Optimization Goal
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            What should the leveling path optimize for?
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {goalCategories.map(category => (
              <Button
                key={category}
                variant={selectedGoalCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedGoalCategory(category)}
                className="capitalize"
              >
                {getCategoryIcon(category)}
                <span className="ml-2">{category === 'all' ? 'All Goals' : category}</span>
              </Button>
            ))}
          </div>

          {/* Goal Selection */}
          <div className="grid grid-cols-1 gap-3">
            {filteredGoals.map(goal => (
              <div
                key={goal.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedGoalId === goal.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-accent/5'
                }`}
                onClick={() => onGoalSelect(goal.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getCategoryIcon(goal.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{goal.name}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {goal.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {goal.description}
                    </p>
                  </div>
                  {selectedGoalId === goal.id && (
                    <div className="text-primary">
                      <Target className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Build Summary */}
      {selectedBuild && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selected Build Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium">{selectedBuild.name}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  (Level {selectedBuild.currentLevel})
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Classes:</div>
                  {Object.entries(getClassBreakdown(selectedBuild)).map(([classId, levels]) => (
                    <div key={classId} className="flex justify-between">
                      <span className="capitalize">{classId}</span>
                      <span>{levels} levels</span>
                    </div>
                  ))}
                </div>
                
                <div>
                  <div className="text-muted-foreground mb-1">Race:</div>
                  <div className="capitalize">{selectedBuild.race?.replace('_', ' ')}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimize Button */}
      <div className="flex justify-center">
        <Button
          onClick={onOptimize}
          disabled={!selectedBuildId || !selectedGoalId || isOptimizing}
          size="lg"
          className="w-full max-w-md"
        >
          {isOptimizing ? (
            <>
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              Optimizing Leveling Path...
            </>
          ) : (
            <>
              <Users className="w-4 h-4 mr-2" />
              Generate Optimal Leveling Paths
            </>
          )}
        </Button>
      </div>
    </div>
  )
}