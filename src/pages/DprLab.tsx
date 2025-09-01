import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Panel, PanelHeader } from '../components/ui/panel'
import { ChartFrame } from '../components/ui/chart-frame'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import CombatRoundOptimizer from '../components/optimizer/CombatRoundOptimizer'
import { BuildFeaturesPanel } from '../components/dpr/BuildFeaturesPanel'
import { ActiveEffectsDisplay } from '../components/dpr/ActiveEffectsDisplay'
import { ACAnalysisPanel } from '../components/dpr/ACAnalysisPanel'
import { PowerAttackGuidance } from '../components/dpr/PowerAttackGuidance'
import { HeroMetrics } from '../components/dpr/HeroMetrics'
import { SmartInsights } from '../components/dpr/SmartInsights'
import { TacticalAdvice } from '../components/dpr/TacticalAdvice'
import { 
  Loader2,
  RefreshCw,
  CheckCircle
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useDPRWorker } from '../hooks/useDPRWorker'
import { useDPRStore } from '../stores/dprStore'
import { useVaultStore } from '../stores/vaultStore'
import { useCharacterBuilderStore } from '../stores/characterBuilderStore'
import { useSettingsStore } from '../stores/settingsStore'
import { createDPRConfig } from '../stores/dprStore'

export function DprLab() {
  const { builds: vaultBuilds } = useVaultStore()
  const { currentBuild: builderCurrentBuild, exportToBuildConfiguration } = useCharacterBuilderStore()
  const { currentResult, currentConfig, selectedBuild: storeSelectedBuild, setConfiguration, setResult, setCalculating, setSelectedBuild } = useDPRStore()
  const { isInitialized, isCalculating, calculateDPRCurves } = useDPRWorker()
  
  // Get default settings from settings store
  const { greedyResourceUse: defaultGreedy, autoCalculateGWMSS: defaultAutoGWMSS } = useSettingsStore()
  
  // Use selected build from store, fallback to builder build if available
  const selectedBuild = useMemo(() => {
    if (storeSelectedBuild) {
      return storeSelectedBuild
    }
    if (builderCurrentBuild) {
      return exportToBuildConfiguration()
    }
    return null
  }, [storeSelectedBuild, builderCurrentBuild, exportToBuildConfiguration])
  
  // Track when user manually wants to select a different build
  const [manualBuildSelection, setManualBuildSelection] = useState(false)
  // Track if user has selected a vault build (to prevent auto-override)
  const [hasSelectedVaultBuild, setHasSelectedVaultBuild] = useState(false)
  
  // Ref to track if we're already in the process of calculating
  const isAutoCalculatingRef = useRef(false)
  
  const localConfig = useMemo(() => ({
    round0BuffsEnabled: false,
    greedyResourceUse: defaultGreedy,
    autoGWMSS: defaultAutoGWMSS
  }), [defaultGreedy, defaultAutoGWMSS])
  
  // Fixed config for DPR calculations (AC range etc.)
  const fixedConfig = useMemo(() => ({
    acMin: 10,
    acMax: 30,
    acStep: 1,
    advantageState: 'normal' as const // Always calculate all three curves
  }), [])
  
  
  // Initialize config when build changes
  useEffect(() => {
    if (selectedBuild && !currentConfig) {
      const config = createDPRConfig(selectedBuild.id)
      setConfiguration({ ...config, ...fixedConfig, ...localConfig })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBuild, currentConfig, setConfiguration, fixedConfig]) // Exclude localConfig to prevent loops

  // Sync local config changes to DPR store
  useEffect(() => {
    if (currentConfig && selectedBuild) {
      const updatedConfig = { ...currentConfig, ...localConfig }
      // Only update if the config actually changed
      if (JSON.stringify(updatedConfig) !== JSON.stringify(currentConfig)) {
        setConfiguration(updatedConfig)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localConfig, currentConfig, selectedBuild, setConfiguration]) // Track actual values

  // Handle auto-switching from builder build (but not if user has manually selected vault build)
  useEffect(() => {
    // Only auto-set if no build is currently selected and conditions are met
    if (!storeSelectedBuild && builderCurrentBuild && !manualBuildSelection && !hasSelectedVaultBuild) {
      const exportedBuild = exportToBuildConfiguration()
      if (exportedBuild) {
        setSelectedBuild(exportedBuild)
      }
    }
  }, [builderCurrentBuild, manualBuildSelection, hasSelectedVaultBuild, storeSelectedBuild, setSelectedBuild, exportToBuildConfiguration])

  // Calculate DPR when build or config changes
  const handleCalculate = useCallback(async () => {
    if (!selectedBuild || !isInitialized) return
    
    setCalculating(true)
    try {
      const config = createDPRConfig(selectedBuild.id)
      const result = await calculateDPRCurves(selectedBuild, { ...config, ...fixedConfig, ...localConfig })
      if (result) {
        setResult(result)
      }
      
    } catch (error) {
      console.error('DPR calculation failed:', error)
    } finally {
      setCalculating(false)
    }
  }, [selectedBuild, isInitialized, fixedConfig, localConfig, calculateDPRCurves, setCalculating, setResult])
  
  // Auto-calculate DPR when build changes or when conditions are met
  useEffect(() => {
    const triggerAutoCalculation = () => {
      if (selectedBuild && isInitialized && !isCalculating && !isAutoCalculatingRef.current) {
        isAutoCalculatingRef.current = true
        handleCalculate().finally(() => {
          isAutoCalculatingRef.current = false
        })
      }
    }
    triggerAutoCalculation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBuild?.id, isInitialized, isCalculating])

  // State for power attack data
  const [powerAttackData, setPowerAttackData] = useState<{
    normal: Array<{ac: number, powerAttack: number}>
    advantage: Array<{ac: number, powerAttack: number}>
    disadvantage: Array<{ac: number, powerAttack: number}>
  } | null>(null)
  const [hasPowerAttack, setHasPowerAttack] = useState(false)
  
  // State for curve visibility
  const [curveVisibility, setCurveVisibility] = useState({
    normal: true,
    advantage: true,
    disadvantage: true
  })

  // Calculate power attack data when build or result changes
  useEffect(() => {
    const calculatePowerAttackData = async () => {
      if (!currentResult || !selectedBuild) {
        setPowerAttackData(null)
        setHasPowerAttack(false)
        return
      }
      
      try {
        const { buildToCombatState, getWeaponConfig } = await import('../engine/simulator')
        
        const combatState = buildToCombatState(selectedBuild)
        
        // Debug logging
        console.log('Power Attack Debug:', {
          hasGWM: combatState.hasGWM,
          hasSharpshooter: combatState.hasSharpshooter,
          weaponId: selectedBuild.rangedWeapon || selectedBuild.mainHandWeapon || 'longsword'
        })
        
        // Only calculate if build has GWM or Sharpshooter
        if (!combatState.hasGWM && !combatState.hasSharpshooter) {
          setPowerAttackData(null)
          setHasPowerAttack(false)
          return
        }
        
        setHasPowerAttack(true)
        
        const weaponId = selectedBuild.rangedWeapon || selectedBuild.mainHandWeapon || 'longsword'
        const weaponConfig = getWeaponConfig(weaponId, selectedBuild.weaponEnhancementBonus || 0, combatState)
        
        if (!weaponConfig) {
          setPowerAttackData(null)
          return
        }
        
        // Check if the build can use power attacks
        const canUseGWM = combatState.hasGWM && weaponConfig.properties.includes('heavy')
        const canUseSharpshooter = combatState.hasSharpshooter && weaponConfig.properties.includes('ammunition')
        const canUsePowerAttack = canUseGWM || canUseSharpshooter
        
        if (!canUsePowerAttack) {
          setPowerAttackData(null)
          return
        }
        
        // Extract power attack DPR from the existing calculation results
        const normalPAData = currentResult.normalCurve.map(point => ({
          ac: point.ac,
          powerAttack: point.withPowerAttack || 0
        }))

        const advantagePAData = currentResult.advantageCurve.map(point => ({
          ac: point.ac,
          powerAttack: point.withPowerAttack || 0
        }))

        const disadvantagePAData = currentResult.disadvantageCurve.map(point => ({
          ac: point.ac,
          powerAttack: point.withPowerAttack || 0
        }))
        
        const newPowerAttackData = {
          normal: normalPAData,
          advantage: advantagePAData,
          disadvantage: disadvantagePAData
        }
        
        console.log('Setting power attack data:', {
          normalCount: normalPAData.length,
          advantageCount: advantagePAData.length,
          disadvantageCount: disadvantagePAData.length,
          firstNormalPoint: normalPAData[0]
        })
        
        setPowerAttackData(newPowerAttackData)
      } catch (error) {
        console.warn('Failed to calculate power attack data:', error)
        setPowerAttackData(null)
        setHasPowerAttack(false)
      }
    }
    
    calculatePowerAttackData()
  }, [currentResult, selectedBuild, localConfig])

  // Format display data for the chart
  const displayData = useMemo(() => {
    if (!currentResult || !selectedBuild) return []
    
    // Debug: Check if power attack data is available
    console.log('DisplayData useMemo running:', {
      hasPowerAttackData: !!powerAttackData,
      powerAttackDataKeys: powerAttackData ? Object.keys(powerAttackData) : 'null'
    })
    
    return currentResult.normalCurve.map(point => {
      const baseData: {
        ac: number
        normal: number
        advantage: number
        disadvantage: number
        normalPA?: number
        advantagePA?: number
        disadvantagePA?: number
      } = {
        ac: point.ac,
        normal: point.dpr,
        advantage: currentResult.advantageCurve.find(advPoint => advPoint.ac === point.ac)?.dpr || 0,
        disadvantage: currentResult.disadvantageCurve.find(disPoint => disPoint.ac === point.ac)?.dpr || 0
      }
      
      // Add power attack data if available
      if (powerAttackData) {
        const normalPAPoint = powerAttackData.normal.find(pa => pa.ac === point.ac)
        const advantagePAPoint = powerAttackData.advantage.find(pa => pa.ac === point.ac)
        const disadvantagePAPoint = powerAttackData.disadvantage.find(pa => pa.ac === point.ac)
        
        if (normalPAPoint) {
          baseData.normalPA = normalPAPoint.powerAttack
          // Debug logging for first few AC values
          if (point.ac <= 12) {
            console.log(`Chart Data AC ${point.ac}: Normal=${point.dpr}, NormalPA=${normalPAPoint.powerAttack}`)
          }
        }
        if (advantagePAPoint) baseData.advantagePA = advantagePAPoint.powerAttack
        if (disadvantagePAPoint) baseData.disadvantagePA = disadvantagePAPoint.powerAttack
      } else {
        // Debug: Power attack data not available
        if (point.ac <= 12) {
          console.log(`No power attack data available for AC ${point.ac}`)
        }
      }
      
      return baseData
    })
  }, [currentResult, selectedBuild, powerAttackData])

  return (
    <div className="h-full">
      <Panel className="h-full flex flex-col">
        <PanelHeader title="DPR Lab" />
        
        <div className="space-y-6 flex-1 overflow-y-auto">
          {/* Build Selection */}
          {selectedBuild ? (
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/20 text-accent rounded-full flex items-center justify-center text-lg font-bold">
                    {Math.max(...(selectedBuild.levelTimeline?.map(l => l.level) || [1]))}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg text-foreground">{selectedBuild.name}</h3>
                      <button
                        onClick={() => {
                          setSelectedBuild(null)
                          setManualBuildSelection(true)
                          setHasSelectedVaultBuild(false) // Reset vault build selection
                        }}
                        className="px-2 py-1 text-xs bg-muted/10 hover:bg-muted/20 rounded transition-colors text-muted hover:text-foreground"
                      >
                        Change Build
                      </button>
                    </div>
                    <p className="text-sm text-muted">
                      <span className="capitalize">{selectedBuild.race?.replace('_', ' ') || 'Unknown'}</span>
                      {selectedBuild.levelTimeline && selectedBuild.levelTimeline.length > 0 && (
                        <span> • {
                          Object.entries(
                            selectedBuild.levelTimeline.reduce((acc, level) => {
                              acc[level.classId] = (acc[level.classId] || 0) + 1
                              return acc
                            }, {} as Record<string, number>)
                          ).map(([classId, levels]) => `${classId.replace('_', ' ')} ${levels}`).join(', ')}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Auto-calculation status */}
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Auto-calculated</span>
                  </div>
                  
                  {/* Manual recalculate button */}
                  <button
                    onClick={() => handleCalculate()}
                    disabled={isCalculating}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 rounded transition-colors disabled:opacity-50"
                    title="Recalculate DPR"
                  >
                    {isCalculating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Recalc
                  </button>
                </div>
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
                          setHasSelectedVaultBuild(false) // This is a builder build, not vault
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
                            setManualBuildSelection(true) // Keep manual selection true for vault builds
                            setHasSelectedVaultBuild(true) // Mark that user has selected a vault build
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
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="overview" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-sm px-3 py-2">
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-sm px-3 py-2">
                <span className="hidden sm:inline">Analysis</span>
                <span className="sm:hidden">Chart</span>
              </TabsTrigger>
              <TabsTrigger value="combat-optimizer" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-sm px-3 py-2">
                <span className="hidden sm:inline">Optimizer</span>
                <span className="sm:hidden">Opt</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Overview Tab - High-level metrics and key insights */}
            <TabsContent value="overview" className="mt-6 space-y-4">
              {/* Top Row: Hero Metrics and DPR Chart */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                <HeroMetrics build={selectedBuild} result={currentResult} config={localConfig} />
                <ChartFrame title="DPR vs Armor Class">
                  {/* Visibility Toggles */}
                  <div className="flex gap-2 p-2 border-b border-border/20">
                    <button
                      onClick={() => setCurveVisibility(prev => ({ ...prev, normal: !prev.normal }))}
                      className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded transition-colors ${
                        curveVisibility.normal 
                          ? 'bg-ink/10 text-foreground' 
                          : 'bg-muted/20 text-muted line-through'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--ink)' }} />
                      Normal
                    </button>
                    <button
                      onClick={() => setCurveVisibility(prev => ({ ...prev, advantage: !prev.advantage }))}
                      className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded transition-colors ${
                        curveVisibility.advantage 
                          ? 'bg-accent/10 text-foreground' 
                          : 'bg-muted/20 text-muted line-through'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                      Advantage
                    </button>
                    <button
                      onClick={() => setCurveVisibility(prev => ({ ...prev, disadvantage: !prev.disadvantage }))}
                      className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded transition-colors ${
                        curveVisibility.disadvantage 
                          ? 'bg-danger/10 text-foreground' 
                          : 'bg-muted/20 text-muted line-through'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--danger)' }} />
                      Disadvantage
                    </button>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={280}>
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
                        formatter={(value: number) => value.toFixed(1)}
                        contentStyle={{
                          backgroundColor: 'var(--panel)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          color: 'var(--ink)'
                        }}
                      />
                      {curveVisibility.normal && (
                        <Line 
                          type="monotone" 
                          dataKey="normal" 
                          stroke="var(--ink)" 
                          strokeWidth={3}
                          name="Normal"
                          dot={{ fill: 'var(--ink)', strokeWidth: 0, r: 3 }}
                        />
                      )}
                      {curveVisibility.advantage && (
                        <Line 
                          type="monotone" 
                          dataKey="advantage" 
                          stroke="var(--accent)" 
                          strokeWidth={3}
                          name="Advantage"
                          dot={{ fill: 'var(--accent)', strokeWidth: 0, r: 3 }}
                        />
                      )}
                      {curveVisibility.disadvantage && (
                        <Line 
                          type="monotone" 
                          dataKey="disadvantage" 
                          stroke="var(--danger)" 
                          strokeWidth={3}
                          name="Disadvantage"
                          dot={{ fill: 'var(--danger)', strokeWidth: 0, r: 3 }}
                        />
                      )}
                      {hasPowerAttack && (
                        <>
                          {curveVisibility.normal && (
                            <Line 
                              type="monotone" 
                              dataKey="normalPA" 
                              stroke="var(--ink)" 
                              strokeWidth={3}
                              strokeDasharray="5 5"
                              name="Normal (PA)"
                              dot={{ fill: 'var(--ink)', strokeWidth: 0, r: 3 }}
                            />
                          )}
                          {curveVisibility.advantage && (
                            <Line 
                              type="monotone" 
                              dataKey="advantagePA" 
                              stroke="var(--accent)" 
                              strokeWidth={3}
                              strokeDasharray="5 5"
                              name="Advantage (PA)"
                              dot={{ fill: 'var(--accent)', strokeWidth: 0, r: 3 }}
                            />
                          )}
                          {curveVisibility.disadvantage && (
                            <Line 
                              type="monotone" 
                              dataKey="disadvantagePA" 
                              stroke="var(--danger)" 
                              strokeWidth={3}
                              strokeDasharray="5 5"
                              name="Disadvantage (PA)"
                              dot={{ fill: 'var(--danger)', strokeWidth: 0, r: 3 }}
                            />
                          )}
                        </>
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </ChartFrame>
              </div>
              
              {/* Bottom Row: Smart Insights and Tactical Advice side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <SmartInsights build={selectedBuild} result={currentResult} config={localConfig} />
                <TacticalAdvice build={selectedBuild} result={currentResult} config={localConfig} />
              </div>
            </TabsContent>

            {/* Analysis Tab - Detailed breakdowns and analysis */}
            <TabsContent value="analysis" className="mt-6">
              <div className="space-y-6">
                {/* Build Features Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <BuildFeaturesPanel build={selectedBuild} />
                  <ActiveEffectsDisplay build={selectedBuild} />
                </div>
                
                {/* AC-Specific Analysis */}
                <ACAnalysisPanel build={selectedBuild} config={localConfig} />
                
                {/* Power Attack and Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <PowerAttackGuidance build={selectedBuild} config={localConfig} />
                  
                  {/* Detailed Performance Metrics */}
                  <Panel className="bg-panel">
                    <PanelHeader title="Performance Breakdown" />
                    {currentResult ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-accent/5 rounded-lg border border-accent/10">
                            <div className="text-2xl font-bold text-accent">{Math.round(currentResult.totalDPR * 10) / 10}</div>
                            <div className="text-xs text-muted">3-Round Total</div>
                          </div>
                          <div className="text-center p-3 bg-emerald/5 rounded-lg border border-emerald/10">
                            <div className="text-2xl font-bold text-emerald">{Math.round(currentResult.averageDPR * 10) / 10}</div>
                            <div className="text-xs text-muted">Average/Round</div>
                          </div>
                        </div>
                        
                        {currentResult.roundBreakdown && (
                          <div>
                            <div className="text-sm font-medium text-panel mb-2">Round-by-Round</div>
                            <div className="space-y-2">
                              {currentResult.roundBreakdown.map((roundDPR, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <span className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-medium flex items-center justify-center">
                                      {index + 1}
                                    </div>
                                    Round {index + 1}
                                  </span>
                                  <span className="font-mono">{Math.round(roundDPR * 10) / 10}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-muted py-8">
                        <div className="text-sm">Run analysis to see detailed breakdown</div>
                      </div>
                    )}
                  </Panel>
                </div>
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