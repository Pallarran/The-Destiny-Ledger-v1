import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  Trophy,
  Target,
  Clock,
  BarChart3,
  Zap,
  Shield,
  Sparkles,
  ChevronRight,
  Star,
  AlertCircle
} from 'lucide-react'
import type { LevelingPath, PathMilestone } from '../../engine/targetBuildOptimizer'

interface LevelingPathResultsProps {
  paths: LevelingPath[]
  onSelectPath?: (pathId: string) => void
  selectedPathId?: string
}

export function LevelingPathResults({ 
  paths, 
  onSelectPath,
  selectedPathId 
}: LevelingPathResultsProps) {
  if (paths.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Select a target build and optimization goal to generate leveling paths
          </p>
        </CardContent>
      </Card>
    )
  }

  const getMilestoneIcon = (milestone: PathMilestone) => {
    switch (milestone.category) {
      case 'combat': return <Zap className="w-3 h-3" />
      case 'defense': return <Shield className="w-3 h-3" />
      case 'utility': return <Sparkles className="w-3 h-3" />
      case 'spells': return <Star className="w-3 h-3" />
      default: return <Target className="w-3 h-3" />
    }
  }

  const getMilestoneColor = (impact: string) => {
    switch (impact) {
      case 'major': return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20'
      case 'moderate': return 'text-blue-600 bg-blue-500/10 border-blue-500/20'  
      case 'minor': return 'text-gray-600 bg-gray-500/10 border-gray-500/20'
      default: return 'text-gray-600 bg-gray-500/10 border-gray-500/20'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-semibold">Optimal Leveling Paths</h3>
        <Badge variant="secondary">{paths.length} paths found</Badge>
      </div>

      <div className="space-y-4">
        {paths.map((path, index) => {
          const isSelected = selectedPathId === path.id
          const isTop = index === 0
          
          return (
            <Card 
              key={path.id}
              className={`relative ${
                isSelected 
                  ? 'ring-2 ring-primary' 
                  : 'hover:shadow-md transition-shadow cursor-pointer'
              }`}
              onClick={() => onSelectPath?.(path.id)}
            >
              {isTop && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-yellow-500 text-yellow-50">
                    <Trophy className="w-3 h-3 mr-1" />
                    Best
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-muted-foreground">#{index + 1}</span>
                    {path.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Score: {path.totalScore.toFixed(1)}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${path.summary.complexity === 'complex' 
                        ? 'text-orange-600 border-orange-500/20' 
                        : 'text-green-600 border-green-500/20'
                      }`}
                    >
                      {path.summary.complexity}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Class Breakdown Summary */}
                <div>
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Final Build Breakdown
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(path.summary.classBreakdown).map(([classId, levels]) => (
                      <Badge key={classId} variant="secondary" className="text-xs">
                        {classId.charAt(0).toUpperCase() + classId.slice(1)} {levels}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Early DPR (L1-10):</div>
                    <div className="font-medium">{path.summary.averageEarlyDPR.toFixed(1)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Late DPR (L11-20):</div>
                    <div className="font-medium">
                      {path.summary.averageLateDPR > 0 ? path.summary.averageLateDPR.toFixed(1) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Peak DPR Level:</div>
                    <div className="font-medium">Level {path.summary.peakDPRLevel}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Final Level:</div>
                    <div className="font-medium">Level {path.summary.finalLevel}</div>
                  </div>
                </div>

                {/* Key Milestones */}
                {path.keyMilestones.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Key Milestones
                    </div>
                    <div className="space-y-1">
                      {path.keyMilestones.slice(0, 3).map((milestone, idx) => (
                        <div 
                          key={idx}
                          className={`flex items-center gap-2 text-xs p-2 rounded border ${getMilestoneColor(milestone.impact)}`}
                        >
                          {getMilestoneIcon(milestone)}
                          <span className="font-medium">L{milestone.level}:</span>
                          <span>{milestone.name}</span>
                        </div>
                      ))}
                      {path.keyMilestones.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{path.keyMilestones.length - 3} more milestones...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Leveling Sequence Preview */}
                <div>
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <ChevronRight className="w-4 h-4" />
                    Leveling Sequence Preview
                  </div>
                  
                  <div className="bg-accent/5 rounded-lg p-3">
                    <div className="flex flex-wrap items-center gap-1 text-xs">
                      {path.sequence.slice(0, 10).map((step, idx) => {
                        const isLastInSequence = idx === path.sequence.length - 1
                        const isPowerSpike = step.powerSpike
                        
                        return (
                          <div key={idx} className="flex items-center">
                            <span 
                              className={`px-2 py-1 rounded ${
                                isPowerSpike 
                                  ? 'bg-yellow-200 text-yellow-800 font-medium' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              L{step.level}: {step.classId.substring(0, 3).toUpperCase()}
                            </span>
                            {!isLastInSequence && idx < 9 && (
                              <ChevronRight className="w-3 h-3 mx-1 text-muted-foreground" />
                            )}
                          </div>
                        )
                      })}
                      
                      {path.sequence.length > 10 && (
                        <div className="text-muted-foreground">
                          ... +{path.sequence.length - 10} more levels
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Path complexity: {path.summary.complexity}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button size="sm">
                      Use This Path
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Additional Information */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-900 mb-1">How to Read These Results</div>
              <ul className="text-blue-700 space-y-1 text-xs">
                <li>• <strong>Early/Late DPR</strong>: Average damage per round in tier 1-2 vs tier 3-4</li>
                <li>• <strong>Peak DPR Level</strong>: The character level where damage output is highest</li>
                <li>• <strong>Power Spikes</strong>: Highlighted levels with major capability increases</li>
                <li>• <strong>Complexity</strong>: How difficult the multiclassing sequence is to execute</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}