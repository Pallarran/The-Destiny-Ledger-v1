import { useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Switch } from '../ui/switch'
import { DeltaPill } from '../ui/delta-pill'
import { useDPRDelta } from '../../hooks/useDPRDelta'
import { useDPRStore } from '../../stores/dprStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { Crown } from 'lucide-react'
import type { BuildConfiguration } from '../../stores/types'
import type { Feat } from '../../rules/types'

interface FeatCardWithDeltaProps {
  feat: Feat
  featId: string
  build: BuildConfiguration
  isSelected: boolean
  onToggle: () => void
  icon?: React.ComponentType<{ className?: string }>
  colorClass?: string
}

export function FeatCardWithDelta({
  feat,
  featId,
  build,
  isSelected,
  onToggle,
  icon: Icon = Crown,
  colorClass = 'text-gray-600 bg-gray-500/10 border-gray-500/20'
}: FeatCardWithDeltaProps) {
  const { calculateDelta, getDelta } = useDPRDelta()
  const { currentConfig } = useDPRStore()
  const { greedyResourceUse: defaultGreedy, autoCalculateGWMSS: defaultAutoGWMSS } = useSettingsStore()
  
  const deltaId = `feat-${featId}`
  const deltaResult = getDelta(deltaId)
  
  // Calculate delta when component mounts or build changes
  useEffect(() => {
    if (!build || !currentConfig) return
    
    // Create base config for delta calculation
    const baseConfig = {
      ...currentConfig,
      round0BuffsEnabled: false,
      greedyResourceUse: defaultGreedy,
      autoGWMSS: defaultAutoGWMSS,
      acMin: 10,
      acMax: 30,
      acStep: 1,
      advantageState: 'normal' as const
    }
    
    // Create modified build with this feat toggled
    // This is a simplified implementation - in reality we'd need to properly modify the level timeline
    const modifiedBuild = {
      ...build,
      // For now, we'll simulate the feat being present by using build metadata
      metadata: {
        ...build.metadata,
        simulatedFeats: isSelected
          ? (build.metadata?.simulatedFeats || []).filter(id => id !== featId)
          : [...(build.metadata?.simulatedFeats || []), featId]
      }
    }
    
    // Calculate delta at AC 16 (typical target)
    calculateDelta(deltaId, build, modifiedBuild, baseConfig, 16)
  }, [build.id, build.levelTimeline, calculateDelta, deltaId, featId, isSelected, currentConfig, defaultGreedy, defaultAutoGWMSS])
  
  return (
    <Card className={`transition-all ${isSelected ? 'ring-2 ring-accent' : 'hover:shadow-md'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" />
              <h4 className="font-medium">{feat.name}</h4>
              <Badge variant="outline" className={`text-xs ${colorClass}`}>
                Combat Feat
              </Badge>
              {deltaResult && !deltaResult.isCalculating && (
                <DeltaPill value={isSelected ? -deltaResult.value : deltaResult.value} />
              )}
              {deltaResult?.isCalculating && (
                <Badge variant="outline" className="text-xs animate-pulse">
                  Calculating...
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">{feat.description}</p>
            
            <div className="space-y-2">
              {feat.features.map((feature, idx) => (
                <div key={idx} className="p-2 bg-muted/20 rounded text-xs">
                  <div className="font-medium">{feature.name}</div>
                  <div className="text-muted-foreground">{feature.description}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="ml-4 flex flex-col items-center gap-2">
            <Switch
              checked={isSelected}
              onCheckedChange={onToggle}
            />
            {isSelected && (
              <Badge variant="secondary" className="text-xs">
                Selected
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}