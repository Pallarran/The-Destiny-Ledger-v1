import { useState, useMemo } from 'react'
import { Panel, PanelHeader } from '../components/ui/panel'
import { ChartFrame } from '../components/ui/chart-frame'
import { Button } from '../components/ui/button'
import { useVaultStore } from '../stores/vaultStore'
import type { BuildConfiguration } from '../stores/types'
import { Plus, X } from 'lucide-react'
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

// Calculate DPR estimates (simplified for now)
const calculateDprEstimate = (build: BuildConfiguration, ac: number) => {
  const level = Math.max(...(build.levelTimeline?.map(l => l.level) || [1]), 1)
  const strMod = Math.floor(((build.abilityScores?.STR || 10) - 10) / 2)
  const dexMod = Math.floor(((build.abilityScores?.DEX || 10) - 10) / 2)
  
  // Very basic DPR calculation - this would be much more sophisticated in reality
  const profBonus = Math.ceil(level / 4) + 1
  const attackMod = Math.max(strMod, dexMod) + profBonus
  const hitChance = Math.max(0.05, Math.min(0.95, (21 + attackMod - ac) / 20))
  const avgDamage = 8 + Math.max(strMod, dexMod) // Base weapon damage estimate
  
  return hitChance * avgDamage * (level <= 4 ? 1 : level <= 10 ? 2 : 3) // Attacks scale with level
}

export function Compare() {
  const { builds: vaultBuilds } = useVaultStore()
  const [selectedBuildIds, setSelectedBuildIds] = useState<string[]>([])
  const [showBuildSelector, setShowBuildSelector] = useState(false)

  // Get selected builds with comparison data
  const selectedBuilds = useMemo(() => {
    return selectedBuildIds
      .map(id => vaultBuilds.find(b => b.id === id))
      .filter((build): build is BuildConfiguration => !!build)
      .slice(0, 6) // Limit to 6 builds for readability
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
        : prev.length < 6 ? [...prev, buildId] : prev
    )
  }

  // Show empty state when no builds selected
  if (selectedBuilds.length === 0) {
    return (
      <div className="space-y-6">
        <Panel>
          <PanelHeader title="COMPARE BUILDS" />
          
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-foreground mb-2">Select Builds to Compare</h3>
            <p className="text-muted mb-6">Choose 2-6 builds from your vault to analyze and compare their capabilities.</p>
            
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
        </Panel>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader title="COMPARE BUILDS" />
        
        {/* Build Selection Header */}
        <div className="flex items-center justify-between mb-6">
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
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setShowBuildSelector(!showBuildSelector)}
            disabled={selectedBuilds.length >= 6}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Build
          </Button>
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

        {/* Build Comparison Summary */}
        <div className="mt-6">
          <ChartFrame title="Build Statistics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {selectedBuilds.map((build) => {
                const level = Math.max(...(build.levelTimeline?.map(l => l.level) || [1]))
                const classBreakdown = build.levelTimeline?.reduce((acc: Record<string, number>, levelEntry) => {
                  acc[levelEntry.classId] = (acc[levelEntry.classId] || 0) + 1
                  return acc
                }, {} as Record<string, number>) || {}
                const mainClass = Object.entries(classBreakdown).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'None'
                const featCount = build.levelTimeline?.filter(l => l.asiOrFeat === 'feat').length || 0
                const avgDpr = dprData.reduce((sum, point) => sum + (point[build.id] || 0), 0) / dprData.length

                return (
                  <div key={build.id} className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: build.color }}
                      />
                      <h4 className="font-semibold">{build.name}</h4>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted">Race:</span>
                        <span className="capitalize">{(build.race || 'Unknown').replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Level:</span>
                        <span>{level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Main Class:</span>
                        <span className="capitalize">{mainClass.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Feats:</span>
                        <span>{featCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Avg DPR:</span>
                        <span className="font-medium">{avgDpr.toFixed(1)}</span>
                      </div>
                      
                      <div className="pt-2 mt-2 border-t border-border/20">
                        <div className="text-xs text-muted mb-1">Top Role Scores</div>
                        {Object.entries(build.roleScores)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 3)
                          .map(([role, score]) => (
                            <div key={role} className="flex justify-between text-xs">
                              <span className="capitalize">{role}:</span>
                              <span>{Math.round(score)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ChartFrame>
        </div>
      </Panel>
    </div>
  )
}