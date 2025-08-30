import { useState, useEffect } from 'react'
import { Panel, PanelHeader } from '../components/ui/panel'
import { ChartFrame } from '../components/ui/chart-frame'
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
  
  const [localConfig, setLocalConfig] = useState<{
    acMin: number
    acMax: number
    acStep: number
    advantageState: 'normal' | 'advantage' | 'disadvantage'
    round0BuffsEnabled: boolean
    greedyResourceUse: boolean
    autoGWMSS: boolean
  }>({
    acMin: 10,
    acMax: 30,
    acStep: 1,
    advantageState: 'normal',
    round0BuffsEnabled: true,
    greedyResourceUse: true,
    autoGWMSS: true
  })
  
  const [breakpoints, setBreakpoints] = useState<any[]>([])
  
  // Initialize config when build changes
  useEffect(() => {
    if (selectedBuild && !currentConfig) {
      const config = createDPRConfig(selectedBuild.id)
      setConfiguration({ ...config, ...localConfig })
    }
  }, [selectedBuild, currentConfig, localConfig, setConfiguration])
  
  // Update selectedBuild when builderCurrentBuild changes
  useEffect(() => {
    if (builderCurrentBuild) {
      const exportedBuild = exportToBuildConfiguration()
      if (exportedBuild && exportedBuild.id !== selectedBuild?.id) {
        setSelectedBuild(exportedBuild)
      }
    }
  }, [builderCurrentBuild, exportToBuildConfiguration, selectedBuild?.id])
  
  const handleCalculate = async () => {
    if (!selectedBuild || !isInitialized) return
    
    const config = {
      buildId: selectedBuild.id,
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
        const breakpointData = await calculatePowerAttackBreakpoints(selectedBuild, localConfig.acMin, localConfig.acMax)
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
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-4">
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
                  
                  {/* Build Selection */}
                  {!selectedBuild && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-muted">Select a build to analyze</p>
                      {vaultBuilds.length > 0 ? (
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {vaultBuilds.slice(0, 5).map((build) => (
                            <button
                              key={build.id}
                              onClick={() => setSelectedBuild(build)}
                              className="w-full text-left text-xs bg-panel hover:bg-border px-2 py-1 rounded flex items-center justify-between"
                            >
                              <span>{build.name}</span>
                              <span className="text-muted">Lv.{Math.max(...(build.levelTimeline?.map(l => l.level) || [1]))}</span>
                            </button>
                          ))}
                          {vaultBuilds.length > 5 && (
                            <div className="text-xs text-muted text-center">+{vaultBuilds.length - 5} more in vault</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-muted">No builds in vault. Create a build first!</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Advantage Settings */}
                <div>
                  <h4 className="font-medium mb-3">Advantage State</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="advantage" 
                        checked={localConfig.advantageState === 'normal'}
                        onChange={() => setLocalConfig(prev => ({ ...prev, advantageState: 'normal' }))}
                      />
                      <span>Normal</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="advantage" 
                        checked={localConfig.advantageState === 'advantage'}
                        onChange={() => setLocalConfig(prev => ({ ...prev, advantageState: 'advantage' }))}
                      />
                      <span>Advantage</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        name="advantage" 
                        checked={localConfig.advantageState === 'disadvantage'}
                        onChange={() => setLocalConfig(prev => ({ ...prev, advantageState: 'disadvantage' }))}
                      />
                      <span>Disadvantage</span>
                    </label>
                  </div>
                </div>

                {/* AC Range */}
                <div>
                  <h4 className="font-medium mb-3">AC Range ({localConfig.acMin}-{localConfig.acMax})</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm mb-1">Min AC</label>
                      <input 
                        type="number" 
                        min="1" 
                        max="25" 
                        value={localConfig.acMin}
                        onChange={(e) => setLocalConfig(prev => ({ ...prev, acMin: parseInt(e.target.value) || 10 }))}
                        className="w-full px-2 py-1 bg-panel border border-border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Max AC</label>
                      <input 
                        type="number" 
                        min="15" 
                        max="35" 
                        value={localConfig.acMax}
                        onChange={(e) => setLocalConfig(prev => ({ ...prev, acMax: parseInt(e.target.value) || 30 }))}
                        className="w-full px-2 py-1 bg-panel border border-border rounded text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Build Status */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Current Build</h4>
                    {selectedBuild && (
                      <button
                        onClick={() => setSelectedBuild(null)}
                        className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded hover:bg-destructive/20"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {selectedBuild ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Name:</span>
                        <span className="font-medium">{selectedBuild.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Level:</span>
                        <span className="font-medium">{Math.max(...(selectedBuild.levelTimeline?.map(l => l.level) || [1]))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Race:</span>
                        <span className="font-medium capitalize">{selectedBuild.race?.replace('_', ' ') || 'Unknown'}</span>
                      </div>
                      {selectedBuild.mainHandWeapon && (
                        <div className="flex justify-between">
                          <span>Main Weapon:</span>
                          <span className="font-medium capitalize">{selectedBuild.mainHandWeapon.replace('_', ' ')}</span>
                        </div>
                      )}
                      {selectedBuild.rangedWeapon && (
                        <div className="flex justify-between">
                          <span>Ranged:</span>
                          <span className="font-medium capitalize">{selectedBuild.rangedWeapon.replace('_', ' ')}</span>
                        </div>
                      )}
                      {selectedBuild.activeBuffs && selectedBuild.activeBuffs.length > 0 && (
                        <div>
                          <span className="text-muted">Active Buffs:</span>
                          <div className="mt-1 space-y-1">
                            {selectedBuild.activeBuffs.slice(0, 3).map(buffId => (
                              <div key={buffId} className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">
                                {buffId.replace('_', ' ')}
                              </div>
                            ))}
                            {selectedBuild.activeBuffs.length > 3 && (
                              <div className="text-xs text-muted">+{selectedBuild.activeBuffs.length - 3} more</div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Class Breakdown */}
                      {selectedBuild.levelTimeline && selectedBuild.levelTimeline.length > 0 && (
                        <div>
                          <span className="text-muted">Classes:</span>
                          <div className="mt-1 text-xs">
                            {Object.entries(
                              selectedBuild.levelTimeline.reduce((acc: Record<string, number>, level) => {
                                acc[level.classId] = (acc[level.classId] || 0) + 1
                                return acc
                              }, {} as Record<string, number>)
                            ).map(([classId, levels]) => (
                              <span key={classId} className="mr-2 capitalize">
                                {classId.replace('_', ' ')} {levels}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted">No build selected</div>
                  )}
                </div>

                {/* Additional Options */}
                <div className="space-y-3">
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
                    <span className="text-sm font-medium">Auto GWM/SS</span>
                    <input 
                      type="checkbox" 
                      checked={localConfig.autoGWMSS}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, autoGWMSS: e.target.checked }))}
                      className="rounded"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium">Round 0 Buffs</span>
                    <input 
                      type="checkbox" 
                      checked={localConfig.round0BuffsEnabled}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, round0BuffsEnabled: e.target.checked }))}
                      className="rounded"
                    />
                  </label>
                </div>
              </div>
            </Panel>
          </div>

          {/* Chart Panel */}
          <div className="lg:col-span-8">
            <ChartFrame title="Expected Damage Per Round (DPR)">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="ac" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'var(--muted)' }}
                    label={{ value: 'Target AC (10-30)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: 'var(--muted)' } }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'var(--muted)' }}
                    label={{ value: 'Damage', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'var(--muted)' } }}
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
                    dot={{ fill: 'var(--ink)', strokeWidth: 0, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="advantage" 
                    stroke="var(--accent)" 
                    strokeWidth={3}
                    name="Advantage"
                    dot={{ fill: 'var(--accent)', strokeWidth: 0, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="disadvantage" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="Disadvantage"
                    dot={{ fill: '#ef4444', strokeWidth: 0, r: 4 }}
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
      </Panel>
    </div>
  )
}