import { useState, useMemo } from 'react'
import { FantasyFrame, FantasyPanel } from '../components/ui/fantasy-frame'
import { ChartFrame } from '../components/ui/chart-frame'
import { Button } from '../components/ui/button'
import { Switch } from '../components/ui/switch'
import { Badge } from '../components/ui/badge'
import { useVaultStore } from '../stores/vaultStore'
import { buildToCombatState, getWeaponConfig } from '../engine/simulator'
import { calculateBuildDPR } from '../engine/calculations'
import { getBuildRating } from '../utils/dprThresholds'
import type { BuildConfiguration } from '../stores/types'
import type { SimulationConfig } from '../engine/types'
import { Plus, X, TrendingUp, TrendingDown, Download, Eye, EyeOff, Minus } from 'lucide-react'
// Icons imported from recharts components
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'

// Color palette for builds
const COMPARISON_COLORS = [
  '#1E40AF', // Blue
  '#059669', // Green  
  '#C8A86B', // Gold
  '#DC2626', // Red
  '#7C3AED', // Purple
  '#EA580C', // Orange
]

// Calculate role scores for a build
const calculateRoleScores = (build: BuildConfiguration) => {
  const abilityScores = build.abilityScores || {}
  
  // Basic scoring based on ability scores and build characteristics
  const social = Math.min(100, ((abilityScores.CHA || 10) - 10) * 5 + 20)
  const defense = Math.min(100, ((abilityScores.CON || 10) - 8) * 4 + (build.armor ? 20 : 0) + (build.shield ? 15 : 0))
  const mobility = Math.min(100, ((abilityScores.DEX || 10) - 10) * 5 + 20)
  const support = Math.min(100, ((abilityScores.WIS || 10) - 10) * 3 + ((abilityScores.CHA || 10) - 10) * 2 + 15)
  const exploration = Math.min(100, ((abilityScores.WIS || 10) - 10) * 3 + ((abilityScores.INT || 10) - 10) * 3 + 20)
  const control = Math.min(100, ((abilityScores.INT || 10) - 10) * 4 + ((abilityScores.WIS || 10) - 10) * 2 + 20)

  return { social, defense, mobility, support, exploration, control }
}

// Calculate accurate DPR using the actual calculation engine
const calculateDprEstimate = (build: BuildConfiguration, ac: number) => {
  try {
    const combatState = buildToCombatState(build)
    const weaponId = build.rangedWeapon || build.mainHandWeapon || 'longsword'
    const weaponConfig = getWeaponConfig(weaponId, build.weaponEnhancementBonus || 0, combatState)
    
    if (!weaponConfig) {
      return 0
    }
    
    const simConfig: SimulationConfig = {
      targetAC: ac,
      rounds: 3,
      round0Buffs: false,
      greedyResourceUse: true,
      autoGWMSS: true // Use optimal power attack strategy
    }
    
    const result = calculateBuildDPR(combatState, weaponConfig, simConfig)
    
    // Return the higher of normal or power attack DPR (optimal play)
    if (result.withPowerAttack && result.withoutPowerAttack) {
      return Math.max(result.withPowerAttack, result.withoutPowerAttack)
    }
    
    return result.expectedDPR
  } catch (error) {
    console.warn('DPR calculation failed for build:', build.name, error)
    return 0
  }
}

export function Compare() {
  const { builds: vaultBuilds } = useVaultStore()
  const [selectedBuildIds, setSelectedBuildIds] = useState<string[]>([])
  const [showBuildSelector, setShowBuildSelector] = useState(false)
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false)

  // Get selected builds with comparison data
  const selectedBuilds = useMemo(() => {
    return selectedBuildIds
      .map(id => vaultBuilds.find(b => b.id === id))
      .filter((build): build is BuildConfiguration => !!build)
      .slice(0, 3) // Limit to 3 builds for readability
      .map((build, index) => ({
        ...build,
        color: COMPARISON_COLORS[index % COMPARISON_COLORS.length],
        roleScores: calculateRoleScores(build)
      }))
  }, [selectedBuildIds, vaultBuilds])

  // Generate DPR comparison data
  const dprData = useMemo(() => {
    const acRange = [10, 12, 14, 15, 16, 18, 20, 22, 25, 30]
    return acRange.map(ac => {
      const dataPoint: any = { ac }
      selectedBuilds.forEach(build => {
        dataPoint[build.id] = calculateDprEstimate(build, ac)
      })
      return dataPoint
    })
  }, [selectedBuilds])

  // Generate radar chart data  
  const radarData = useMemo(() => {
    const axes = ['Social', 'Defense', 'Mobility', 'Support', 'Exploration', 'Control']
    return axes.map(axis => {
      const dataPoint: any = { axis }
      selectedBuilds.forEach(build => {
        const scores = build.roleScores
        dataPoint[build.id] = scores[axis.toLowerCase() as keyof typeof scores]
      })
      return dataPoint
    })
  }, [selectedBuilds])

  const toggleBuildSelection = (buildId: string) => {
    setSelectedBuildIds(prev => 
      prev.includes(buildId) 
        ? prev.filter(id => id !== buildId)
        : prev.length < 3 ? [...prev, buildId] : prev
    )
  }

  // Calculate comparison metrics with change indicators
  const getComparisonMetrics = useMemo(() => {
    if (selectedBuilds.length < 2) return []

    const metrics = [
      { key: 'level', label: 'Level', getValue: (build: any) => Math.max(...(build.levelTimeline?.map((l: any) => l.level) || [1])) },
      { key: 'ac15Dpr', label: 'DPR vs AC 15', getValue: (build: any) => calculateDprEstimate(build, 15), format: (val: number) => val.toFixed(1) },
      { key: 'ac20Dpr', label: 'DPR vs AC 20', getValue: (build: any) => calculateDprEstimate(build, 20), format: (val: number) => val.toFixed(1) },
      { key: 'featCount', label: 'Feats', getValue: (build: any) => build.levelTimeline?.filter((l: any) => l.asiOrFeat === 'feat').length || 0 },
      { key: 'social', label: 'Social Score', getValue: (build: any) => Math.round(build.roleScores.social) },
      { key: 'defense', label: 'Defense Score', getValue: (build: any) => Math.round(build.roleScores.defense) },
      { key: 'mobility', label: 'Mobility Score', getValue: (build: any) => Math.round(build.roleScores.mobility) }
    ]

    return metrics.map(metric => {
      const values = selectedBuilds.map(build => metric.getValue(build))
      const min = Math.min(...values)
      const max = Math.max(...values)
      const hasDifference = min !== max

      return {
        ...metric,
        values,
        min,
        max,
        hasDifference,
        differences: values.map(val => val === max ? 'high' : val === min ? 'low' : 'mid')
      }
    })
  }, [selectedBuilds])

  // Export functionality
  const exportComparison = () => {
    const exportData = {
      builds: selectedBuilds.map(build => ({
        name: build.name,
        race: build.race,
        level: Math.max(...(build.levelTimeline?.map(l => l.level) || [1])),
        metrics: getComparisonMetrics.reduce((acc, metric) => {
          acc[metric.key] = metric.getValue(build)
          return acc
        }, {} as Record<string, any>)
      })),
      timestamp: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `build-comparison-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Show empty state when no builds selected
  if (selectedBuilds.length === 0) {
    return (
      <div className="space-y-6">
        <FantasyFrame title="COMPARE BUILDS" variant="ornate">
          
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-foreground mb-2">Select Builds to Compare</h3>
            <p className="text-muted mb-6">Choose up to 3 builds from your vault to analyze and compare their capabilities.</p>
            
            <Button onClick={() => setShowBuildSelector(!showBuildSelector)}>
              <Plus className="w-4 h-4 mr-2" />
              Select Builds
            </Button>
            
            {showBuildSelector && (
              <div className="mt-6 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {vaultBuilds.map((build) => (
                    <div 
                      key={build.id}
                      onClick={() => toggleBuildSelection(build.id)}
                      className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-panel/5 transition-colors"
                    >
                      <div className="flex-1 text-left">
                        <h4 className="font-medium text-sm">{build.name}</h4>
                        <p className="text-xs text-muted">
                          {build.race ? build.race.replace('_', ' ') : 'Unknown'} • Level {Math.max(...(build.levelTimeline?.map(l => l.level) || [1]))}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
                
                {vaultBuilds.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted">No builds found in your vault. Create some builds first!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </FantasyFrame>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FantasyFrame title="COMPARE BUILDS" variant="default" frameStyle="img-overlay">
        
        {/* Enhanced Build Selection Header with Controls */}
        <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 -mx-6 px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedBuilds.map((build) => (
                <div key={build.id} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: build.color }}
                  />
                  <span className="text-sm font-medium">{build.name}</span>
                  <button
                    onClick={() => setSelectedBuildIds(prev => prev.filter(id => id !== build.id))}
                    className="text-muted hover:text-destructive ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              {selectedBuilds.length >= 2 && (
                <>
                  {/* Show Differences Toggle */}
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showOnlyDifferences}
                      onCheckedChange={setShowOnlyDifferences}
                      id="show-differences"
                    />
                    <label htmlFor="show-differences" className="text-sm text-muted cursor-pointer">
                      {showOnlyDifferences ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      <span className="ml-1">Differences only</span>
                    </label>
                  </div>
                  
                  {/* Export Button */}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={exportComparison}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                </>
              )}
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowBuildSelector(!showBuildSelector)}
                disabled={selectedBuilds.length >= 3}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Build
              </Button>
            </div>
          </div>
        </div>
        
        {showBuildSelector && (
          <div className="mb-6 p-4 bg-panel/5 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {vaultBuilds
                .filter(build => !selectedBuildIds.includes(build.id))
                .map((build) => (
                  <div 
                    key={build.id}
                    onClick={() => toggleBuildSelection(build.id)}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-panel/5 transition-colors"
                  >
                    <div className="flex-1 text-left">
                      <h4 className="font-medium text-sm">{build.name}</h4>
                      <p className="text-xs text-muted">
                        {build.race ? build.race.replace('_', ' ') : 'Unknown'} • Level {Math.max(...(build.levelTimeline?.map(l => l.level) || [1]))}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Add
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Radar Chart */}
          <div className="lg:col-span-5">
            <ChartFrame title="Role Capabilities">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis 
                    dataKey="axis" 
                    tick={{ fontSize: 11, fill: 'var(--foreground)' }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]}
                    tickCount={6}
                    tick={{ fontSize: 10, fill: 'var(--muted)' }}
                  />
                  {selectedBuilds.map((build, index) => (
                    <Radar
                      key={build.id}
                      name={build.name}
                      dataKey={build.id}
                      stroke={build.color}
                      fill={build.color}
                      fillOpacity={0.1 + (index * 0.05)}
                      strokeWidth={2}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </ChartFrame>
          </div>

          {/* DPR Comparison Chart */}
          <div className="lg:col-span-7">
            <ChartFrame title="DPR vs Armor Class">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dprData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                      color: 'var(--foreground)'
                    }}
                  />
                  {selectedBuilds.map((build) => (
                    <Line 
                      key={build.id}
                      type="monotone" 
                      dataKey={build.id}
                      stroke={build.color}
                      strokeWidth={3}
                      name={build.name}
                      dot={{ fill: build.color, strokeWidth: 0, r: 3 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartFrame>
          </div>
        </div>

        {/* Enhanced Comparison Table */}
        {selectedBuilds.length >= 2 && (
          <div className="mt-6">
            <FantasyPanel title="Side-by-Side Comparison" className="sticky top-20 z-10">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-medium text-muted">Metric</th>
                        {selectedBuilds.map((build) => (
                          <th key={build.id} className="text-center py-3 px-2">
                            <div className="flex items-center justify-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: build.color }}
                              />
                              <span className="font-medium">{build.name}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getComparisonMetrics
                        .filter(metric => !showOnlyDifferences || metric.hasDifference)
                        .map((metric) => (
                          <tr key={metric.key} className="border-b border-border/50">
                            <td className="py-3 px-2 text-muted">{metric.label}</td>
                            {selectedBuilds.map((build, buildIndex) => {
                              const value = metric.getValue(build)
                              const difference = metric.differences[buildIndex]
                              const isHighest = difference === 'high'
                              const isLowest = difference === 'low'
                              
                              return (
                                <td key={build.id} className="py-3 px-2 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <span className={`font-medium ${
                                      isHighest ? 'text-green-600' : 
                                      isLowest && metric.hasDifference ? 'text-red-600' : 
                                      'text-foreground'
                                    }`}>
                                      {metric.format ? metric.format(value) : value}
                                    </span>
                                    {metric.hasDifference && isHighest && (
                                      <TrendingUp className="w-3 h-3 text-green-600" />
                                    )}
                                    {metric.hasDifference && isLowest && (
                                      <TrendingDown className="w-3 h-3 text-red-600" />
                                    )}
                                    {metric.hasDifference && difference === 'mid' && selectedBuilds.length > 2 && (
                                      <Minus className="w-3 h-3 text-muted" />
                                    )}
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      
                      {/* Build Ratings */}
                      <tr className="border-b border-border/50">
                        <td className="py-3 px-2 text-muted">Build Rating</td>
                        {selectedBuilds.map((build) => {
                          const level = Math.max(...(build.levelTimeline?.map(l => l.level) || [1]))
                          const ac15Dpr = calculateDprEstimate(build, 15)
                          const combatState = buildToCombatState(build)
                          const weaponId = build.rangedWeapon || build.mainHandWeapon || 'longsword'
                          const weaponConfig = getWeaponConfig(weaponId, build.weaponEnhancementBonus || 0, combatState)
                          let hitChance = 0.5
                          if (weaponConfig) {
                            try {
                              const result = calculateBuildDPR(combatState, weaponConfig, {
                                targetAC: 15, rounds: 3, round0Buffs: false, greedyResourceUse: true, autoGWMSS: true
                              })
                              hitChance = result.hitChance
                            } catch (e) {
                              console.warn('Hit chance calculation failed')
                            }
                          }
                          const buildRating = getBuildRating(ac15Dpr, hitChance, level)
                          
                          return (
                            <td key={build.id} className="py-3 px-2 text-center">
                              <Badge 
                                variant="outline" 
                                className={`capitalize ${
                                  buildRating === 'excellent' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                  buildRating === 'good' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                                  buildRating === 'average' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                                  'bg-red-500/10 text-red-600 border-red-500/20'
                                }`}
                              >
                                {buildRating.replace('-', ' ')}
                              </Badge>
                            </td>
                          )
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {showOnlyDifferences && getComparisonMetrics.filter(m => m.hasDifference).length === 0 && (
                  <div className="text-center py-8 text-muted">
                    <EyeOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No significant differences found between selected builds</p>
                    <p className="text-xs mt-1">Try disabling "Differences only" to see all metrics</p>
                  </div>
                )}
            </FantasyPanel>
          </div>
        )}
      </FantasyFrame>
    </div>
  )
}