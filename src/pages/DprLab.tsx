import { useState, useEffect } from 'react'
import { Panel, PanelHeader } from '../components/ui/panel'
import { ChartFrame } from '../components/ui/chart-frame'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import CombatRoundOptimizer from '../components/optimizer/CombatRoundOptimizer'
import { 
  PlayIcon,
  Loader2
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useDPRWorker } from '../hooks/useDPRWorker'
import { useDPRStore } from '../stores/dprStore'
import { useVaultStore } from '../stores/vaultStore'
import { useCharacterBuilderStore } from '../stores/characterBuilderStore'
import { createDPRConfig } from '../stores/dprStore'
import type { BuildConfiguration } from '../stores/types'

export function DprLab() {
  const { builds: vaultBuilds } = useVaultStore()
  const { currentBuild: builderCurrentBuild, exportToBuildConfiguration } = useCharacterBuilderStore()
  const { currentResult, currentConfig, setConfiguration, setResult, setCalculating } = useDPRStore()
  const { isInitialized, isCalculating, calculateDPRCurves, calculatePowerAttackBreakpoints } = useDPRWorker()
  
  // State for selected build - convert current builder build to BuildConfiguration format
  const [selectedBuild, setSelectedBuild] = useState<BuildConfiguration | null>(() => {
    if (builderCurrentBuild) {
      return exportToBuildConfiguration()
    }
    return null
  })
  
  // Track when user manually wants to select a different build
  const [manualBuildSelection, setManualBuildSelection] = useState(false)
  
  const [localConfig, setLocalConfig] = useState<{
    round0BuffsEnabled: boolean
    greedyResourceUse: boolean
    autoGWMSS: boolean
  }>({
    round0BuffsEnabled: true,
    greedyResourceUse: true,
    autoGWMSS: true
  })
  
  // Fixed config per specification
  const fixedConfig = {
    acMin: 10,
    acMax: 30,
    acStep: 1,
    advantageState: 'normal' as const // Always calculate all three curves
  }
  
  const [breakpoints, setBreakpoints] = useState<any[]>([])
  
  // Initialize config when build changes
  useEffect(() => {
    if (selectedBuild && !currentConfig) {
      const config = createDPRConfig(selectedBuild.id)
      setConfiguration({ ...config, ...fixedConfig, ...localConfig })
    }
  }, [selectedBuild, currentConfig, fixedConfig, localConfig, setConfiguration])
  
  // Update selectedBuild when builderCurrentBuild changes (only if not manually selecting)
  useEffect(() => {
    if (builderCurrentBuild && !manualBuildSelection) {
      const exportedBuild = exportToBuildConfiguration()
      if (exportedBuild && exportedBuild.id !== selectedBuild?.id) {
        setSelectedBuild(exportedBuild)
      }
    }
  }, [builderCurrentBuild, exportToBuildConfiguration, selectedBuild?.id, manualBuildSelection])
  
  const handleCalculate = async () => {
    if (!selectedBuild || !isInitialized) return
    
    const config = {
      buildId: selectedBuild.id,
      ...fixedConfig,
      ...localConfig
    }
    
    setCalculating(true)
    
    try {
      // Calculate DPR curves
      const result = await calculateDPRCurves(selectedBuild, config)
      if (result) {
        setResult(result)
      }
      
      // Calculate power attack breakpoints if the build has GWM/SS
      const hasGWMSS = selectedBuild.levelTimeline?.some(entry => 
        entry.featId === 'great_weapon_master' || entry.featId === 'sharpshooter'
      )
      
      if (hasGWMSS) {
        const breakpointData = await calculatePowerAttackBreakpoints(selectedBuild, fixedConfig.acMin, fixedConfig.acMax)
        if (breakpointData) {
          setBreakpoints(breakpointData)
        }
      }
    } catch (error) {
      console.error('DPR calculation failed:', error)
    }
  }
  
  // Transform data for chart
  const chartData = currentResult ? 
    currentResult.normalCurve.map((point, index) => ({
      ac: point.ac,
      normal: Math.round(point.dpr * 10) / 10,
      advantage: currentResult.advantageCurve[index] ? Math.round(currentResult.advantageCurve[index].dpr * 10) / 10 : 0,
      disadvantage: currentResult.disadvantageCurve[index] ? Math.round(currentResult.disadvantageCurve[index].dpr * 10) / 10 : 0
    })) : []
  
  // Get typical DPR at AC 15
  const typicalDPR = chartData.find(point => point.ac === 15)
  
  // Placeholder data if no results
  const displayData = chartData.length > 0 ? chartData : [
    { ac: 10, normal: 12, advantage: 15, disadvantage: 9 },
    { ac: 15, normal: 10, advantage: 13, disadvantage: 7 },
    { ac: 20, normal: 6, advantage: 9, disadvantage: 3 },
    { ac: 25, normal: 3, advantage: 5, disadvantage: 1 },
    { ac: 30, normal: 1, advantage: 2, disadvantage: 0.5 }
  ]

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader title="DPR LAB" />
        
        {/* Build Selection Header */}
        <div className="mb-6">
          {selectedBuild ? (
            <div className="flex items-center justify-between p-4 bg-accent/5 border border-accent/20 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-accent/10 text-accent rounded-full flex items-center justify-center text-sm font-bold">
                    {Math.max(...(selectedBuild.levelTimeline?.map(l => l.level) || [1]))}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{selectedBuild.name}</h3>
                    <p className="text-sm text-muted capitalize">
                      {selectedBuild.race?.replace('_', ' ') || 'Unknown'} • 
                      {selectedBuild.levelTimeline && selectedBuild.levelTimeline.length > 0 && (
                        <span className="ml-1">
                          {Object.entries(
                            selectedBuild.levelTimeline.reduce((acc: Record<string, number>, level) => {
                              acc[level.classId] = (acc[level.classId] || 0) + 1
                              return acc
                            }, {} as Record<string, number>)
                          ).map(([classId, levels]) => `${classId.replace('_', ' ')} ${levels}`).join(', ')}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedBuild(null)
                    setManualBuildSelection(true)
                  }}
                  className="px-3 py-1 text-sm bg-muted/10 hover:bg-muted/20 rounded transition-colors"
                >
                  Change Build
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 border-2 border-dashed border-border rounded-lg">
              <h3 className="text-lg font-semibold text-foreground mb-2">Select a Build to Analyze</h3>
              <p className="text-muted mb-4">Choose from your vault or current Character Builder session</p>
              
              <div className="space-y-4">
                {/* Current Builder Build (if available) */}
                {builderCurrentBuild && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Current Builder Session</h4>
                    <button
                      onClick={() => {
                        const exportedBuild = exportToBuildConfiguration()
                        if (exportedBuild) {
                          setSelectedBuild(exportedBuild)
                          setManualBuildSelection(false)
                        }
                      }}
                      className="flex items-center gap-3 p-3 text-left bg-accent/10 hover:bg-accent/20 border border-accent/30 hover:border-accent/50 rounded-lg transition-colors group w-full"
                    >
                      <div className="w-10 h-10 bg-accent/20 text-accent rounded-full flex items-center justify-center text-sm font-bold group-hover:bg-accent/30 transition-colors">
                        {Math.max(...((builderCurrentBuild.enhancedLevelTimeline || []).map((l: any) => l.level) || [1]))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{builderCurrentBuild.name}</h4>
                        <p className="text-xs text-muted truncate capitalize">
                          {builderCurrentBuild.race?.replace('_', ' ') || 'Unknown'} • Current Build
                        </p>
                      </div>
                    </button>
                  </div>
                )}
                
                {/* Vault Builds */}
                {vaultBuilds.length > 0 && (
                  <div>
                    {builderCurrentBuild && <h4 className="text-sm font-medium text-foreground mb-2">Vault Builds</h4>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
                      {vaultBuilds.map((build) => (
                        <button
                          key={build.id}
                          onClick={() => {
                            setSelectedBuild(build)
                            setManualBuildSelection(false)
                          }}
                          className="flex items-center gap-3 p-3 text-left bg-panel/50 hover:bg-panel border border-border hover:border-accent/50 rounded-lg transition-colors group"
                        >
                          <div className="w-10 h-10 bg-accent/10 text-accent rounded-full flex items-center justify-center text-sm font-bold group-hover:bg-accent/20 transition-colors">
                            {Math.max(...(build.levelTimeline?.map(l => l.level) || [1]))}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate">{build.name}</h4>
                            <p className="text-xs text-muted truncate capitalize">
                              {build.race?.replace('_', ' ') || 'Unknown'}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {!builderCurrentBuild && vaultBuilds.length === 0 && (
                  <div>
                    <p className="text-muted mb-4">No builds found in your vault.</p>
                    <p className="text-sm text-muted">Create builds in the Character Builder to analyze their DPR performance.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {selectedBuild && (
          <Tabs defaultValue="dpr-analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dpr-analysis">DPR Analysis</TabsTrigger>
              <TabsTrigger value="combat-optimizer">Combat Optimizer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dpr-analysis" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Configuration Panel */}
            <div className="lg:col-span-5">
              <Panel className="bg-ink text-panel">
                <PanelHeader title="Simulation Config" className="text-panel bg-ink border-b border-border/20" />
                
                <div className="space-y-6">
                {/* Calculate Button */}
                <div className="mb-6">
                  <button
                    onClick={handleCalculate}
                    disabled={!selectedBuild || !isInitialized || isCalculating}
                    className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-medium"
                  >
                    {isCalculating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <PlayIcon className="w-4 h-4" />
                        Calculate DPR
                      </>
                    )}
                  </button>
                  
                </div>

                {/* Fixed Parameters Info */}
                <div>
                  <h4 className="font-medium mb-3">Analysis Parameters</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted">AC Range:</span>
                      <span>10-30 (fixed)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Curves:</span>
                      <span>Normal/Advantage/Disadvantage</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Combat Duration:</span>
                      <span>3 Rounds (nova)</span>
                    </div>
                  </div>
                </div>


                {/* Simulation Options */}
                <div>
                  <h4 className="font-medium mb-3">Options</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium">Round 0 Buffs</span>
                      <input 
                        type="checkbox" 
                        checked={localConfig.round0BuffsEnabled}
                        onChange={(e) => setLocalConfig(prev => ({ ...prev, round0BuffsEnabled: e.target.checked }))}
                        className="rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium">Greedy Resource Use</span>
                      <input 
                        type="checkbox" 
                        checked={localConfig.greedyResourceUse}
                        onChange={(e) => setLocalConfig(prev => ({ ...prev, greedyResourceUse: e.target.checked }))}
                        className="rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm font-medium">Auto GWM/SS Optimization</span>
                      <input 
                        type="checkbox" 
                        checked={localConfig.autoGWMSS}
                        onChange={(e) => setLocalConfig(prev => ({ ...prev, autoGWMSS: e.target.checked }))}
                        className="rounded"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          {/* Chart Panel */}
          <div className="lg:col-span-7">
            <ChartFrame title="Expected Damage Per Round (DPR)">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="ac" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'var(--muted)' }}
                    label={{ value: 'Target AC', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: 'var(--muted)' } }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'var(--muted)' }}
                    label={{ value: 'DPR', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'var(--muted)' } }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--panel)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--ink)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="normal" 
                    stroke="var(--ink)" 
                    strokeWidth={3}
                    name="Normal"
                    dot={{ fill: 'var(--ink)', strokeWidth: 0, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="advantage" 
                    stroke="var(--accent)" 
                    strokeWidth={3}
                    name="Advantage"
                    dot={{ fill: 'var(--accent)', strokeWidth: 0, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="disadvantage" 
                    stroke="var(--danger)" 
                    strokeWidth={3}
                    name="Disadvantage"
                    dot={{ fill: 'var(--danger)', strokeWidth: 0, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartFrame>
          </div>
        </div>
        
        {/* Results Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* SS/GWM Breakpoints */}
          <Panel className="bg-ink text-panel">
            <PanelHeader title="GWM/SS Optimization" className="text-panel bg-ink border-b border-border/20" />
            
            {breakpoints.length > 0 ? (
              <div className="space-y-3">
                <div className="text-xs text-muted mb-2">
                  Shows when to use power attack (-5 to hit, +10 damage) vs normal attacks
                </div>
                
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {breakpoints.slice(0, 15).map((bp, index) => (
                    <div key={index} className="flex items-center justify-between text-sm py-1 border-b border-border/10 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono w-8">AC{bp.ac}</span>
                        <div className={`w-2 h-2 rounded-full ${bp.usesPowerAttack ? 'bg-accent' : 'bg-muted'}`} />
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-medium ${bp.usesPowerAttack ? 'text-accent' : 'text-panel'}`}>
                          {bp.usesPowerAttack ? 'Power Attack' : 'Normal Attack'}
                        </div>
                        <div className="text-xs text-muted">
                          {bp.usesPowerAttack ? 
                            `+${((bp.powerAttackDamage || 0) - (bp.normalDamage || 0)).toFixed(1)} DPR` :
                            `Best option`
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {breakpoints.length > 15 && (
                  <div className="text-xs text-muted text-center pt-2 border-t border-border/20">
                    Showing first 15 of {breakpoints.length} AC values
                  </div>
                )}
                
                {/* Summary */}
                <div className="pt-2 border-t border-border/20">
                  <div className="text-xs text-muted mb-1">Quick Reference:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-accent">●</span> Power Attack Better
                    </div>
                    <div>
                      <span className="text-muted">●</span> Normal Attack Better
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted py-4 text-center">
                {selectedBuild && (selectedBuild.levelTimeline?.some(entry => 
                  entry.featId === 'great_weapon_master' || entry.featId === 'sharpshooter'
                )) ? 
                  'Run calculation to see power attack optimization' : 
                  selectedBuild ? 'No GWM/Sharpshooter feat detected in build' : 'Select a build to analyze'
                }
              </div>
            )}
          </Panel>

          {/* DPR Summary */}
          <Panel className="bg-panel">
            <PanelHeader title="Combat Performance Analysis" />
            {currentResult ? (
              <div className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-accent/5 rounded-lg border border-accent/10">
                    <div className="text-2xl font-bold text-accent">{Math.round(currentResult.totalDPR * 10) / 10}</div>
                    <div className="text-xs text-muted">Total 3-Round DPR</div>
                  </div>
                  <div className="text-center p-3 bg-emerald/5 rounded-lg border border-emerald/10">
                    <div className="text-2xl font-bold text-emerald">{Math.round(currentResult.averageDPR * 10) / 10}</div>
                    <div className="text-xs text-muted">Average per Round</div>
                  </div>
                </div>
                
                {/* Round by Round */}
                {currentResult.roundBreakdown && (
                  <div>
                    <div className="text-sm font-medium text-panel mb-2">Round-by-Round Breakdown</div>
                    <div className="space-y-2">
                      {currentResult.roundBreakdown.map((roundDPR, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-medium flex items-center justify-center">
                              {index + 1}
                            </div>
                            Round {index + 1}
                            {index === 0 && ' (Action Surge)'}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono">{Math.round(roundDPR * 10) / 10}</span>
                            <div className="w-16 bg-border/20 rounded-full h-2">
                              <div 
                                className="bg-accent rounded-full h-2 transition-all"
                                style={{width: `${Math.min(100, (roundDPR / Math.max(...currentResult.roundBreakdown)) * 100)}%`}}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* AC Performance */}
                {typicalDPR && (
                  <div className="pt-3 border-t border-border/20">
                    <div className="text-sm font-medium text-panel mb-2">Performance vs AC 15 (Typical Enemy)</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 bg-panel/30 rounded">
                        <div className="text-sm font-medium">{typicalDPR.normal}</div>
                        <div className="text-xs text-muted">Normal</div>
                      </div>
                      <div className="text-center p-2 bg-accent/10 rounded border border-accent/20">
                        <div className="text-sm font-medium text-accent">{typicalDPR.advantage}</div>
                        <div className="text-xs text-muted">Advantage</div>
                      </div>
                      <div className="text-center p-2 bg-danger/10 rounded border border-danger/20">
                        <div className="text-sm font-medium text-danger">{typicalDPR.disadvantage}</div>
                        <div className="text-xs text-muted">Disadvantage</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Performance Insights */}
                <div className="pt-3 border-t border-border/20">
                  <div className="text-sm font-medium text-panel mb-2">Performance Insights</div>
                  <div className="space-y-1 text-xs text-muted">
                    {typicalDPR && (
                      <>
                        <div>• Advantage increases DPR by {Math.round(((typicalDPR.advantage - typicalDPR.normal) / typicalDPR.normal) * 100)}%</div>
                        <div>• Disadvantage reduces DPR by {Math.round(((typicalDPR.normal - typicalDPR.disadvantage) / typicalDPR.normal) * 100)}%</div>
                      </>
                    )}
                    {currentResult.roundBreakdown && currentResult.roundBreakdown[0] > currentResult.roundBreakdown[1] && (
                      <div>• Round 1 is strongest due to Action Surge/nova resources</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted py-8 text-center">
                <div className="mb-2">⚡ Run calculation to see detailed combat analysis</div>
                <div className="text-xs">DPR curves, round breakdowns, and optimization tips</div>
              </div>
            )}
          </Panel>
        </div>
              </TabsContent>
            
            <TabsContent value="combat-optimizer" className="mt-6">
              <CombatRoundOptimizer />
            </TabsContent>
            
          </Tabs>
        )}
      </Panel>
    </div>
  )
}