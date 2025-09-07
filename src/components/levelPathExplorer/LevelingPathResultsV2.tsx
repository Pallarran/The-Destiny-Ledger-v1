import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import type { LevelingPathV2, LevelStepV2, PathMilestone } from '../../engine/targetBuildOptimizerV2'
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Target,
  BookOpen,
  Swords,
  Heart,
  Brain,
  ChevronRight
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface LevelingPathResultsV2Props {
  paths: LevelingPathV2[]
  onSelectPath: (pathId: string) => void
  selectedPathId?: string
}

export function LevelingPathResultsV2({
  paths,
  onSelectPath,
  selectedPathId
}: LevelingPathResultsV2Props) {
  if (paths.length === 0) {
    return (
      <Card className="h-full min-h-[500px] flex items-center justify-center">
        <CardContent>
          <div className="text-center space-y-4 py-12">
            <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <div>
              <p className="text-lg font-medium text-muted-foreground">
                No Leveling Paths Generated
              </p>
              <p className="text-sm text-muted-foreground/80 mt-1">
                Select a target build and optimization goal to generate paths
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const selectedPath = paths.find(p => p.id === selectedPathId) || paths[0]

  return (
    <div className="space-y-6">
      {/* Path Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Paths</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {paths.map((path, index) => (
              <Button
                key={path.id}
                variant={selectedPath.id === path.id ? 'default' : 'outline'}
                className="w-full justify-between"
                onClick={() => onSelectPath(path.id)}
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">
                    #{index + 1}
                  </Badge>
                  <span className="font-medium">{path.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Score:</span>
                  <span className="font-mono font-bold">
                    {Math.round(path.totalScore)}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Path Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Path Details</CardTitle>
            <Badge>{selectedPath.name}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="progression" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted p-1 rounded-lg">
              <TabsTrigger 
                value="progression" 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm border-0 data-[state=active]:border font-medium transition-all duration-200"
              >
                📈 Progression
              </TabsTrigger>
              <TabsTrigger 
                value="milestones" 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm border-0 data-[state=active]:border font-medium transition-all duration-200"
              >
                🎯 Milestones
              </TabsTrigger>
              <TabsTrigger 
                value="metrics" 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm border-0 data-[state=active]:border font-medium transition-all duration-200"
              >
                📊 Metrics
              </TabsTrigger>
              <TabsTrigger 
                value="summary" 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm border-0 data-[state=active]:border font-medium transition-all duration-200"
              >
                📋 Summary
              </TabsTrigger>
            </TabsList>

            <TabsContent value="progression" className="space-y-4 mt-4 p-4 border rounded-lg bg-muted/10">
              <div className="flex items-center gap-2 mb-3">
                📈 <h3 className="font-semibold text-lg">Level-by-Level Progression</h3>
              </div>
              <LevelProgression sequence={selectedPath.sequence} />
            </TabsContent>

            <TabsContent value="milestones" className="space-y-4 mt-4 p-4 border rounded-lg bg-muted/10">
              <div className="flex items-center gap-2 mb-3">
                🎯 <h3 className="font-semibold text-lg">Key Milestones</h3>
              </div>
              <MilestonesView milestones={selectedPath.keyMilestones} />
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4 mt-4 p-4 border rounded-lg bg-muted/10">
              <div className="flex items-center gap-2 mb-3">
                📊 <h3 className="font-semibold text-lg">Performance Metrics</h3>
              </div>
              <MetricsView path={selectedPath} />
            </TabsContent>

            <TabsContent value="summary" className="space-y-4 mt-4 p-4 border rounded-lg bg-muted/10">
              <div className="flex items-center gap-2 mb-3">
                📋 <h3 className="font-semibold text-lg">Build Summary</h3>
              </div>
              <PathSummary path={selectedPath} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function LevelProgression({ sequence }: { sequence: LevelStepV2[] }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground pb-2 border-b">
        <div className="col-span-1">Lvl</div>
        <div className="col-span-2">Class</div>
        <div className="col-span-2">Key Features</div>
        <div className="col-span-2">ASI/Feat</div>
        <div className="col-span-2">Spells</div>
        <div className="col-span-1">DPR</div>
        <div className="col-span-2">Power</div>
      </div>
      
      {sequence.map((step, index) => (
        <div 
          key={index}
          className={cn(
            "grid grid-cols-12 gap-2 py-2 text-sm border-b last:border-0",
            step.powerSpike && "bg-primary/5"
          )}
        >
          <div className="col-span-1 font-mono font-bold">
            {step.level}
          </div>
          
          <div className="col-span-2">
            <Badge variant="outline" className="text-xs">
              {step.classId} {step.classLevel}
            </Badge>
          </div>
          
          <div className="col-span-2 text-xs">
            {step.keyFeatures.slice(0, 1).join(', ')}
            {step.keyFeatures.length > 1 && ` +${step.keyFeatures.length - 1}`}
          </div>
          
          <div className="col-span-2">
            {step.asiOrFeat && (
              <div className="flex gap-1">
                {step.asiOrFeat === 'feat' && step.featId ? (
                  <Badge variant="secondary" className="text-xs">
                    <Brain className="w-2 h-2 mr-1" />
                    {step.featId.replace('_', ' ').toUpperCase()}
                  </Badge>
                ) : step.asiOrFeat === 'asi' && step.abilityIncreases ? (
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="w-2 h-2 mr-1" />
                    ASI: {Object.entries(step.abilityIncreases)
                      .filter(([_, value]) => value && value > 0)
                      .map(([ability, value]) => `${ability} +${value}`)
                      .join(', ')}
                  </Badge>
                ) : null}
              </div>
            )}
          </div>
          
          <div className="col-span-2">
            {step.spellsAvailable.length > 0 && (
              <div className="flex gap-1">
                {step.spellsAvailable.slice(0, 1).map(spell => (
                  <Badge key={spell.id} variant="secondary" className="text-xs">
                    {spell.name}
                  </Badge>
                ))}
                {step.spellsAvailable.length > 1 && (
                  <span className="text-xs text-muted-foreground">
                    +{step.spellsAvailable.length - 1}
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="col-span-1 font-mono text-sm">
            {step.dpr.toFixed(1)}
          </div>
          
          <div className="col-span-2">
            {step.powerSpike && (
              <Badge variant="default" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Power Spike
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function MilestonesView({ milestones }: { milestones: PathMilestone[] }) {
  const getIcon = (category: string) => {
    switch (category) {
      case 'combat': return <Swords className="w-4 h-4" />
      case 'spells': return <BookOpen className="w-4 h-4" />
      case 'defense': return <Shield className="w-4 h-4" />
      case 'utility': return <Brain className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'major': return 'text-red-500'
      case 'moderate': return 'text-yellow-500'
      case 'minor': return 'text-blue-500'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className="space-y-3">
      {milestones.map((milestone, index) => (
        <div key={index} className="flex gap-3 p-3 border rounded-lg">
          <div className="flex-shrink-0 mt-1">
            {getIcon(milestone.category)}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">Level {milestone.level}</span>
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium">{milestone.name}</span>
              <Badge 
                variant="outline" 
                className={cn("text-xs", getImpactColor(milestone.impact))}
              >
                {milestone.impact}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {milestone.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function MetricsView({ path }: { path: LevelingPathV2 }) {
  const metrics = path.levelMetrics

  return (
    <div className="space-y-4">
      {/* DPR Chart */}
      <div>
        <h4 className="font-medium mb-2">DPR Progression</h4>
        <div className="h-48 bg-muted/10 rounded-lg p-4">
          <div className="flex items-end justify-between h-full gap-1">
            {metrics.map((m, i) => {
              const maxDpr = Math.max(...metrics.map(metric => metric.dprWithSpells))
              const height = (m.dprWithSpells / maxDpr) * 100
              
              return (
                <div 
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end gap-1"
                >
                  <div className="text-xs font-mono">
                    {m.dprWithSpells.toFixed(0)}
                  </div>
                  <div 
                    className="w-full bg-primary rounded-t transition-all"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-muted-foreground">
                    {m.level}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Combat Metrics</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Peak DPR:</span>
              <span className="font-mono font-medium">
                {Math.max(...metrics.map(m => m.dprWithSpells)).toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Has Haste:</span>
              <span className="font-mono font-medium">
                {metrics.some(m => m.hasHaste) ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Extra Attack:</span>
              <span className="font-mono font-medium">
                Lvl {metrics.findIndex(m => m.hasExtraAttack) + 1 || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Utility Metrics</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Max Spell Slots:</span>
              <span className="font-mono font-medium">
                {Math.max(...metrics.map(m => 
                  Object.values(m.spellSlots).reduce((a, b) => a + b, 0)
                ))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Survival Score:</span>
              <span className="font-mono font-medium">
                {Math.max(...metrics.map(m => m.survivalScore)).toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Utility Score:</span>
              <span className="font-mono font-medium">
                {Math.max(...metrics.map(m => m.utilityScore)).toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PathSummary({ path }: { path: LevelingPathV2 }) {
  const summary = path.summary

  return (
    <div className="space-y-4">
      {/* Class Breakdown */}
      <div>
        <h4 className="font-medium mb-2">Class Distribution</h4>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(summary.classBreakdown).map(([classId, levels]) => (
            <Badge key={classId} variant="secondary" className="py-1">
              {classId} {levels}
            </Badge>
          ))}
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Performance</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Early DPR (1-10):</span>
              <span className="font-mono font-medium">
                {summary.averageEarlyDPR.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Late DPR (11-20):</span>
              <span className="font-mono font-medium">
                {summary.averageLateDPR.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Peak DPR Level:</span>
              <span className="font-mono font-medium">
                Level {summary.peakDPRLevel}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Build Type</h4>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Complexity:</span>
              <Badge variant="outline" className="text-xs">
                {summary.complexity}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Caster Levels:</span>
              <span className="font-mono font-medium">
                {summary.spellCasterLevels}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Martial Levels:</span>
              <span className="font-mono font-medium">
                {summary.martialLevels}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Scores */}
      <div>
        <h4 className="font-medium mb-2">Overall Scores</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-sm text-muted-foreground">Survival:</span>
            <div className="flex-1 bg-muted/20 rounded-full h-2">
              <div 
                className="bg-red-500 h-full rounded-full"
                style={{ width: `${Math.min(summary.survivalScore, 100)}%` }}
              />
            </div>
            <span className="text-sm font-mono">{summary.survivalScore.toFixed(0)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Utility:</span>
            <div className="flex-1 bg-muted/20 rounded-full h-2">
              <div 
                className="bg-blue-500 h-full rounded-full"
                style={{ width: `${Math.min(summary.utilityScore, 100)}%` }}
              />
            </div>
            <span className="text-sm font-mono">{summary.utilityScore.toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}