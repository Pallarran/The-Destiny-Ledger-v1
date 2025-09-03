import { useEffect } from 'react'
import { Panel } from '../components/ui/panel'
import { Button } from '../components/ui/button'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { usePathExplorerStore } from '../stores/pathExplorerStore'
import { COMMON_MILESTONES } from '../engine/pathOptimizer'
import { 
  Settings, 
  Target,
  Award,
  Loader2,
  Clock
} from 'lucide-react'

export function LevelPathExplorer() {
  const {
    objective,
    constraints,
    beamWidth,
    maxPaths,
    optimizedPaths,
    isOptimizing,
    lastOptimizationTime,
    selectedConstraintPreset,
    customMilestones,
    setObjective,
    setConstraints,
    setBeamWidth,
    setMaxPaths,
    loadConstraintPreset,
    toggleMilestone,
    optimizePaths,
    clearResults
  } = usePathExplorerStore()

  // Load default preset on mount
  useEffect(() => {
    if (!selectedConstraintPreset) {
      loadConstraintPreset('martial_dpr')
    }
  }, [selectedConstraintPreset, loadConstraintPreset])

  const availableMilestones = Object.values(COMMON_MILESTONES)

  return (
    <div className="space-y-6">
      <Panel>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Configuration Panel */}
          <div>
            <div title="Optimization Config" className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Objective</label>
                  <select 
                    value={objective}
                    onChange={(e) => setObjective(e.target.value as any)}
                    className="w-full p-2 border border-border rounded-md bg-transparent text-foreground"
                  >
                    <option value="l20_dpr">Maximize L20 DPR</option>
                    <option value="tier_average">Maximize Tier Average</option>
                    <option value="custom">Custom Mix</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Constraint Preset</label>
                  <select 
                    value={selectedConstraintPreset || ''}
                    onChange={(e) => loadConstraintPreset(e.target.value)}
                    className="w-full p-2 border border-border rounded-md bg-transparent text-foreground"
                  >
                    <option value="martial_dpr">Martial DPR Focus</option>
                    <option value="spellsword">Spellsword Hybrid</option>
                    <option value="rogue_hybrid">Rogue Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Max Classes: {constraints.maxClasses}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    value={constraints.maxClasses}
                    onChange={(e) => setConstraints({ maxClasses: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Must-Hit Milestones</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableMilestones.map((milestone) => (
                      <label key={milestone.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={customMilestones.includes(milestone.id)}
                          onChange={() => toggleMilestone(milestone.id)}
                          className="rounded"
                        />
                        <span>{milestone.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Beam Width</label>
                    <select 
                      value={beamWidth}
                      onChange={(e) => setBeamWidth(parseInt(e.target.value))}
                      className="w-full p-2 border border-border rounded-md bg-transparent text-foreground text-sm"
                    >
                      <option value={3}>3 (Fast)</option>
                      <option value={5}>5 (Balanced)</option>
                      <option value={8}>8 (Thorough)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Results</label>
                    <select 
                      value={maxPaths}
                      onChange={(e) => setMaxPaths(parseInt(e.target.value))}
                      className="w-full p-2 border border-border rounded-md bg-transparent text-foreground text-sm"
                    >
                      <option value={3}>3</option>
                      <option value={5}>5</option>
                      <option value={8}>8</option>
                    </select>
                  </div>
                </div>

                <Button 
                  onClick={optimizePaths}
                  disabled={isOptimizing}
                  variant="accent" 
                  className="w-full"
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Optimize Paths
                    </>
                  )}
                </Button>

                {lastOptimizationTime && (
                  <div className="flex items-center gap-2 text-xs text-muted pt-2 border-t border-border/20">
                    <Clock className="w-3 h-3" />
                    <span>Last run: {lastOptimizationTime.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Path Candidates</h3>
                <div className="flex items-center gap-4">
                  {optimizedPaths.length > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearResults}
                      className="text-xs"
                    >
                      Clear Results
                    </Button>
                  )}
                  <span className="text-sm text-muted">
                    {isOptimizing ? 'Optimizing...' : `${optimizedPaths.length} paths found`}
                  </span>
                </div>
              </div>

              {isOptimizing && (
                <div className="p-8">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
                    <h4 className="font-medium mb-2">Optimizing Character Progressions</h4>
                    <p className="text-sm text-muted mb-4">
                      Running beam search across {beamWidth} candidates per level...
                    </p>
                    <div className="flex justify-center gap-4 text-xs text-muted">
                      <span>• Evaluating multiclass combinations</span>
                      <span>• Calculating DPR projections</span>
                      <span>• Checking milestone requirements</span>
                    </div>
                  </div>
                </div>
              )}

              {!isOptimizing && optimizedPaths.length === 0 && (
                <div className="p-8">
                  <div className="text-center">
                    <Target className="w-12 h-12 text-muted mx-auto mb-4" />
                    <h4 className="font-medium mb-2">Ready to Optimize</h4>
                    <p className="text-sm text-muted">
                      Configure your constraints and click "Optimize Paths" to find the best character progression routes.
                    </p>
                  </div>
                </div>
              )}

              {optimizedPaths.map((path) => (
                <div key={path.id} className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{path.name}</h4>
                      <p className="text-sm text-muted">
                        {Object.entries(path.classBreakdown)
                          .map(([classId, levels]) => `${classId.charAt(0).toUpperCase() + classId.slice(1)} ${levels}`)
                          .join(' / ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-accent">{Math.round(path.finalDPR * 10) / 10}</div>
                      <div className="text-xs text-muted">Total 3-Round DPR</div>
                    </div>
                  </div>

                  {/* Real DPR Sparkline */}
                  <div className="mb-4">
                    <div className="h-16">
                      <ResponsiveContainer width="100%" height={"100%"}>
                        <LineChart data={path.dprProgression.map((dpr, level) => ({ level: level + 1, dpr }))}>
                          <XAxis 
                            dataKey="level" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={false}
                          />
                          <YAxis hide />
                          <Line 
                            type="monotone" 
                            dataKey="dpr" 
                            stroke="var(--accent)" 
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-xs text-muted text-center mt-1">Level 1-20 DPR Progression</div>
                  </div>

                  {/* Performance Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-panel/20 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm font-medium">{Math.round(path.averageDPR * 10) / 10}</div>
                      <div className="text-xs text-muted">Avg DPR</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{path.milestones.filter(m => m.achieved).length}</div>
                      <div className="text-xs text-muted">Milestones</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{Object.keys(path.classBreakdown).length}</div>
                      <div className="text-xs text-muted">Classes</div>
                    </div>
                  </div>

                  {/* Milestones */}
                  {path.milestones.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-gold" />
                        <span className="text-sm font-medium">Key Milestones</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {path.milestones.map((result, idx) => (
                          <span 
                            key={idx}
                            className={`px-2 py-1 text-xs rounded-md border ${
                              result.achieved 
                                ? 'bg-emerald/10 text-emerald border-emerald/20' 
                                : 'bg-danger/10 text-danger border-danger/20'
                            }`}
                            title={result.description}
                          >
                            {result.milestone.name} {result.levelAchieved && `(${result.levelAchieved})`}
                            {result.achieved ? ' ✓' : ' ✗'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}