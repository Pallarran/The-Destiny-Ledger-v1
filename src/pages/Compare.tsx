import { useState, useMemo } from 'react'
import { Panel } from '../components/ui/panel'
import { ChartFrame } from '../components/ui/chart-frame'
import { Button } from '../components/ui/button'
import { Switch } from '../components/ui/switch'
import { ClassIcon, getPrimaryClass } from '../components/ui/class-icon'
import { Badge } from '../components/ui/badge'
import { useVaultStore } from '../stores/vaultStore'
import { buildToCombatState, getWeaponConfig } from '../engine/simulator'
import { calculateBuildDPR } from '../engine/calculations'
import { getBuildRating } from '../utils/dprThresholds'
// TODO: Import spell data when available
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

// === CAPABILITY ANALYSIS FUNCTIONS ===

// Analyze spell contributions to role capabilities
const analyzeSpellCapabilities = (build: BuildConfiguration) => {
  const capabilities = {
    social: 0,
    defense: 0,
    mobility: 0,
    support: 0,
    exploration: 0,
    control: 0
  }

  // Get all known spells from level timeline
  const knownSpells = new Set<string>()
  
  build.levelTimeline?.forEach(entry => {
    entry.spellChoices?.forEach(spellId => knownSpells.add(spellId))
  })

  // Add racial cantrips
  if (build.highElfCantrip) {
    knownSpells.add(build.highElfCantrip)
  }

  // Analyze known spells by name for capabilities
  knownSpells.forEach(spellId => {
    const spellName = spellId.toLowerCase()
    
    // Social spells (charm, illusion, social interaction)
    if (spellName.includes('charm') || spellName.includes('suggestion') || 
        spellName.includes('friends') || spellName.includes('disguise') ||
        spellName.includes('invisibility') || spellName.includes('illusion') ||
        spellName.includes('enthrall') || spellName.includes('modify_memory')) {
      capabilities.social += 3
    }

    // Support spells (healing, buffs, aid)
    if (spellName.includes('heal') || spellName.includes('cure') || 
        spellName.includes('bless') || spellName.includes('aid') ||
        spellName.includes('guidance') || spellName.includes('bardic') ||
        spellName.includes('restoration') || spellName.includes('revivify')) {
      capabilities.support += 3
    }

    // Control spells (save-or-suck, battlefield control)
    if (spellName.includes('hold') || spellName.includes('sleep') || 
        spellName.includes('web') || spellName.includes('slow') ||
        spellName.includes('banishment') || spellName.includes('polymorph') ||
        spellName.includes('counterspell') || spellName.includes('dispel')) {
      capabilities.control += 3
    }

    // Exploration spells (utility, detection, travel)
    if (spellName.includes('detect') || spellName.includes('locate') || 
        spellName.includes('identify') || spellName.includes('comprehend') ||
        spellName.includes('find') || spellName.includes('scrying') ||
        spellName.includes('clairvoyance') || spellName.includes('commune')) {
      capabilities.exploration += 3
    }

    // Defense spells (protection, warding, resistance)
    if (spellName.includes('shield') || spellName.includes('ward') || 
        spellName.includes('protection') || spellName.includes('sanctuary') ||
        spellName.includes('armor') || spellName.includes('resistance') ||
        spellName.includes('absorb') || spellName.includes('stoneskin')) {
      capabilities.defense += 3
    }

    // Mobility spells (movement, teleportation, travel)
    if (spellName.includes('fly') || spellName.includes('dimension') || 
        spellName.includes('misty') || spellName.includes('expeditious') ||
        spellName.includes('teleport') || spellName.includes('transport') ||
        spellName.includes('freedom') || spellName.includes('spider_climb')) {
      capabilities.mobility += 3
    }
  })

  return capabilities
}

// Analyze skill contributions to role capabilities  
const analyzeSkillCapabilities = (build: BuildConfiguration) => {
  const capabilities = {
    social: 0,
    defense: 0,
    mobility: 0,
    support: 0,
    exploration: 0,
    control: 0
  }

  const skillProfs = build.skillProficiencies || []
  const expertise: string[] = [] // TODO: Extract expertise from build when available

  // Helper function to add skill value
  const addSkillValue = (skillId: string, category: keyof typeof capabilities) => {
    if (skillProfs.includes(skillId)) {
      capabilities[category] += expertise.includes(skillId) ? 6 : 3 // Double for expertise
    }
  }

  // Social skills
  addSkillValue('deception', 'social')
  addSkillValue('intimidation', 'social') 
  addSkillValue('persuasion', 'social')
  addSkillValue('performance', 'social')

  // Exploration skills
  addSkillValue('investigation', 'exploration')
  addSkillValue('perception', 'exploration')
  addSkillValue('survival', 'exploration')
  addSkillValue('nature', 'exploration')
  addSkillValue('history', 'exploration')
  addSkillValue('arcana', 'exploration')
  addSkillValue('religion', 'exploration')

  // Support skills
  addSkillValue('medicine', 'support')
  addSkillValue('insight', 'support')
  addSkillValue('animalHandling', 'support')

  // Mobility skills
  addSkillValue('acrobatics', 'mobility')
  addSkillValue('athletics', 'mobility')
  addSkillValue('stealth', 'mobility')

  // Control skills (magical knowledge)
  addSkillValue('arcana', 'control')
  addSkillValue('religion', 'control')

  return capabilities
}

// Analyze feat contributions to role capabilities
const analyzeFeatCapabilities = (build: BuildConfiguration) => {
  const capabilities = {
    social: 0,
    defense: 0,
    mobility: 0,
    support: 0,
    exploration: 0,
    control: 0
  }

  const buildFeats = new Set<string>()
  
  // From level timeline
  build.levelTimeline?.forEach(entry => {
    if (entry.featId) buildFeats.add(entry.featId)
  })
  
  // From downtime training
  build.downtimeTraining?.trainedFeats?.forEach(feat => buildFeats.add(feat))

  buildFeats.forEach(featId => {
    switch (featId) {
      case 'actor':
      case 'linguist': 
        capabilities.social += 4
        break
      case 'observant':
        capabilities.exploration += 4
        capabilities.social += 2
        break
      case 'healer':
      case 'inspiring_leader':
        capabilities.support += 4
        break
      case 'spell_sniper':
      case 'metamagic_adept':
      case 'fey_touched':
      case 'shadow_touched':
        capabilities.control += 4
        break
      case 'mobile':
      case 'alert':
        capabilities.mobility += 4
        break
      case 'tough':
      case 'resilient':
      case 'lucky':
        capabilities.defense += 4
        break
      case 'keen_mind':
        capabilities.exploration += 4
        break
      case 'skill_expert':
        // Adds expertise, but we'd need to know which skills
        capabilities.exploration += 2
        capabilities.social += 2
        break
    }
  })

  return capabilities
}

// Analyze class/subclass feature contributions to role capabilities
const analyzeFeatureCapabilities = (build: BuildConfiguration) => {
  const capabilities = {
    social: 0,
    defense: 0,
    mobility: 0,
    support: 0,
    exploration: 0,
    control: 0
  }

  const buildFeatures = new Set<string>()
  
  // From level timeline
  build.levelTimeline?.forEach(entry => {
    entry.features?.forEach(feature => buildFeatures.add(feature))
  })

  buildFeatures.forEach(featureId => {
    // Based on common D&D features - this could be expanded with a feature database
    const featureLower = featureId.toLowerCase()
    
    // Social features
    if (featureLower.includes('charm') || featureLower.includes('persuasion') || 
        featureLower.includes('deception') || featureLower.includes('intimidation') ||
        featureLower.includes('bardic_inspiration') || featureLower.includes('expertise')) {
      capabilities.social += 3
    }

    // Support features 
    if (featureLower.includes('heal') || featureLower.includes('cure') || 
        featureLower.includes('blessing') || featureLower.includes('aid') ||
        featureLower.includes('bardic_inspiration') || featureLower.includes('guidance')) {
      capabilities.support += 3
    }

    // Control features
    if (featureLower.includes('spell') || featureLower.includes('magic') || 
        featureLower.includes('invocation') || featureLower.includes('metamagic') ||
        featureLower.includes('enchant') || featureLower.includes('illusion')) {
      capabilities.control += 3
    }

    // Defense features
    if (featureLower.includes('armor') || featureLower.includes('shield') || 
        featureLower.includes('resist') || featureLower.includes('ward') ||
        featureLower.includes('defense') || featureLower.includes('tough')) {
      capabilities.defense += 3
    }

    // Mobility features
    if (featureLower.includes('speed') || featureLower.includes('movement') || 
        featureLower.includes('dash') || featureLower.includes('climb') ||
        featureLower.includes('fly') || featureLower.includes('teleport')) {
      capabilities.mobility += 3
    }

    // Exploration features
    if (featureLower.includes('detect') || featureLower.includes('sense') || 
        featureLower.includes('track') || featureLower.includes('survival') ||
        featureLower.includes('nature') || featureLower.includes('investigate')) {
      capabilities.exploration += 3
    }
  })

  return capabilities
}

// Enhanced role score calculation
const calculateRoleScores = (build: BuildConfiguration) => {
  const abilityScores = build.abilityScores || {}
  
  // Base ability score contributions (reduced weight)
  const baseScores = {
    social: Math.max(0, ((abilityScores.CHA || 10) - 10) * 2),
    defense: Math.max(0, ((abilityScores.CON || 10) - 10) * 2 + (build.armor ? 8 : 0) + (build.shield ? 6 : 0)), 
    mobility: Math.max(0, ((abilityScores.DEX || 10) - 10) * 2),
    support: Math.max(0, ((abilityScores.WIS || 10) - 10) * 1.5 + ((abilityScores.CHA || 10) - 10) * 1),
    exploration: Math.max(0, ((abilityScores.WIS || 10) - 10) * 1.5 + ((abilityScores.INT || 10) - 10) * 1.5),
    control: Math.max(0, ((abilityScores.INT || 10) - 10) * 2 + ((abilityScores.WIS || 10) - 10) * 1)
  }

  // Get capability bonuses from all sources
  const spellCaps = analyzeSpellCapabilities(build)
  const skillCaps = analyzeSkillCapabilities(build)
  const featCaps = analyzeFeatCapabilities(build)
  const featureCaps = analyzeFeatureCapabilities(build)

  // Combine all sources with weights
  const social = Math.min(100, baseScores.social + spellCaps.social + skillCaps.social + featCaps.social + featureCaps.social + 10)
  const defense = Math.min(100, baseScores.defense + spellCaps.defense + skillCaps.defense + featCaps.defense + featureCaps.defense + 10)
  const mobility = Math.min(100, baseScores.mobility + spellCaps.mobility + skillCaps.mobility + featCaps.mobility + featureCaps.mobility + 10)  
  const support = Math.min(100, baseScores.support + spellCaps.support + skillCaps.support + featCaps.support + featureCaps.support + 10)
  const exploration = Math.min(100, baseScores.exploration + spellCaps.exploration + skillCaps.exploration + featCaps.exploration + featureCaps.exploration + 10)
  const control = Math.min(100, baseScores.control + spellCaps.control + skillCaps.control + featCaps.control + featureCaps.control + 10)

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
        <Panel>
          
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
        </Panel>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Panel>
        
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
                  <ClassIcon 
                    className={getPrimaryClass(build) || 'fighter'} 
                    size="sm" 
                    fallback={null}
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
            <div className="sticky top-20 z-10">
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
                              <ClassIcon 
                                className={getPrimaryClass(build) || 'fighter'} 
                                size="sm" 
                                fallback={null}
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
                                    <span className={`font-semibold ${
                                      isHighest ? 'text-emerald-700' : 
                                      isLowest && metric.hasDifference ? 'text-danger' : 
                                      'text-ink'
                                    }`}>
                                      {metric.format ? metric.format(value) : value}
                                    </span>
                                    {metric.hasDifference && isHighest && (
                                      <TrendingUp className="w-3 h-3 text-emerald-700" />
                                    )}
                                    {metric.hasDifference && isLowest && (
                                      <TrendingDown className="w-3 h-3 text-danger" />
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
                                  buildRating === 'very-good' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                                  buildRating === 'good' ? 'bg-emerald/10 text-emerald border-emerald/20' :
                                  buildRating === 'poor' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' :
                                  'bg-red-500/10 text-danger border-red-500/20'
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
            </div>
          </div>
        )}
      </Panel>
    </div>
  )
}