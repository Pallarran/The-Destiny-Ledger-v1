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
import { useBuilderStore } from '../stores/builderStore'
import { createDPRConfig } from '../stores/dprStore'
import { sampleBuilds } from '../utils/sampleBuilds'

export function DprLab() {
  const { currentBuild, loadBuild } = useBuilderStore()
  const { currentResult, currentConfig, setConfiguration, setResult, setCalculating } = useDPRStore()
  const { isInitialized, isCalculating, calculateDPRCurves, calculatePowerAttackBreakpoints } = useDPRWorker()
  
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
    if (currentBuild && !currentConfig) {
      const config = createDPRConfig(currentBuild.id)
      setConfiguration({ ...config, ...localConfig })
    }
  }, [currentBuild, currentConfig, localConfig, setConfiguration])
  
  const handleCalculate = async () => {
    if (!currentBuild || !isInitialized) return
    
    const config = {
      buildId: currentBuild.id,
      ...localConfig
    }
    
    setCalculating(true)
    
    try {
      // Calculate DPR curves
      const result = await calculateDPRCurves(currentBuild, config)
      if (result) {
        setResult(result)
      }
      
      // Calculate power attack breakpoints if the build has GWM/SS
      const hasGWMSS = currentBuild.levelTimeline.some(entry => 
        entry.featId === 'great_weapon_master' || entry.featId === 'sharpshooter'
      )
      
      if (hasGWMSS) {
        const breakpointData = await calculatePowerAttackBreakpoints(currentBuild, localConfig.acMin, localConfig.acMax)
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
                    disabled={!currentBuild || !isInitialized || isCalculating}
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
                  {!currentBuild && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-muted">No build selected</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadBuild(sampleBuilds.fighter)}
                          className="text-xs bg-panel hover:bg-border px-2 py-1 rounded"
                        >
                          Load Fighter
                        </button>
                        <button
                          onClick={() => loadBuild(sampleBuilds.rogue)}
                          className="text-xs bg-panel hover:bg-border px-2 py-1 rounded"
                        >
                          Load Rogue
                        </button>
                      </div>
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
                  <h4 className="font-medium mb-3">Current Build</h4>
                  {currentBuild ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Name:</span>
                        <span className="font-medium">{currentBuild.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Level:</span>
                        <span className="font-medium">{currentBuild.currentLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Race:</span>
                        <span className="font-medium capitalize">{currentBuild.race.replace('_', ' ')}</span>
                      </div>
                      {currentBuild.mainHandWeapon && (
                        <div className="flex justify-between">
                          <span>Weapon:</span>
                          <span className="font-medium capitalize">{currentBuild.mainHandWeapon.replace('_', ' ')}</span>
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
            <PanelHeader title="GWM/SS Breakpoints" className="text-panel bg-ink border-b border-border/20" />
            
            {breakpoints.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {breakpoints.slice(0, 10).map((bp, index) => (
                  <div key={index} className="flex items-center justify-between text-sm py-1">
                    <span>AC {bp.ac}</span>
                    <span className={bp.usesPowerAttack ? 'text-accent' : 'text-muted'}>
                      {bp.usesPowerAttack ? 'Use Power Attack' : 'Normal Attacks'}
                    </span>
                  </div>
                ))}
                {breakpoints.length > 10 && (
                  <div className="text-xs text-muted text-center pt-2">
                    ...and {breakpoints.length - 10} more
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted py-4 text-center">
                {currentBuild ? 'Run calculation to see breakpoints' : 'No GWM/SS feat detected'}
              </div>
            )}
          </Panel>

          {/* DPR Summary */}
          <Panel className="bg-panel">
            <PanelHeader title="DPR Summary" />
            {currentResult ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-lg font-bold">{Math.round(currentResult.totalDPR * 10) / 10}</div>
                    <div className="text-sm text-muted">Total 3-Round DPR</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold">{Math.round(currentResult.averageDPR * 10) / 10}</div>
                    <div className="text-sm text-muted">Average DPR / Round</div>
                  </div>
                </div>
                {currentResult.roundBreakdown && (
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Round 1:</span>
                      <span>{Math.round(currentResult.roundBreakdown[0] * 10) / 10} DPR</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Round 2:</span>
                      <span>{Math.round(currentResult.roundBreakdown[1] * 10) / 10} DPR</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Round 3:</span>
                      <span>{Math.round(currentResult.roundBreakdown[2] * 10) / 10} DPR</span>
                    </div>
                  </div>
                )}
                {typicalDPR && (
                  <div className="pt-3 border-t border-border/20">
                    <div className="text-sm text-muted mb-1">At AC 15:</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>Normal: <span className="font-medium">{typicalDPR.normal}</span></div>
                      <div>Advantage: <span className="font-medium">{typicalDPR.advantage}</span></div>
                      <div>Disadvantage: <span className="font-medium">{typicalDPR.disadvantage}</span></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted py-4 text-center">
                Run calculation to see DPR breakdown
              </div>
            )}
          </Panel>
        </div>
      </Panel>
    </div>
  )
}