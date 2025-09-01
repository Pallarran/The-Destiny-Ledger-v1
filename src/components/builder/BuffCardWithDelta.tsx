import { useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Switch } from '../ui/switch'
import { DeltaPill } from '../ui/delta-pill'
import { useDPRDelta } from '../../hooks/useDPRDelta'
import { useDPRStore } from '../../stores/dprStore'
import { useSettingsStore } from '../../stores/settingsStore'
import type { BuildConfiguration } from '../../stores/types'

interface BuffCardWithDeltaProps {
  buff: any
  build: BuildConfiguration
  isActive: boolean
  isConflicted?: boolean
  status: 'active' | 'round0' | 'inactive'
  onToggle: () => void
  renderEffects: (buff: any) => string
}

export function BuffCardWithDelta({
  buff,
  build,
  isActive,
  isConflicted = false,
  status,
  onToggle,
  renderEffects
}: BuffCardWithDeltaProps) {
  const { calculateDelta, getDelta } = useDPRDelta()
  const { currentConfig } = useDPRStore()
  const { greedyResourceUse: defaultGreedy, autoCalculateGWMSS: defaultAutoGWMSS } = useSettingsStore()
  
  const deltaId = `buff-${buff.id}`
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
    
    // Create modified build with this buff toggled
    const modifiedBuild = {
      ...build,
      activeBuffs: isActive 
        ? (build.activeBuffs || []).filter(id => id !== buff.id)
        : [...(build.activeBuffs || []), buff.id]
    }
    
    // Calculate delta at AC 16 (typical target)
    calculateDelta(deltaId, build, modifiedBuild, baseConfig, 16)
  }, [build.id, build.activeBuffs, calculateDelta, deltaId, buff.id, isActive, currentConfig, defaultGreedy, defaultAutoGWMSS])
  
  return (
    <Card
      className={`transition-all ${
        isConflicted 
          ? 'ring-2 ring-danger border-danger/20 bg-danger/5'
          : isActive
          ? 'ring-2 ring-accent border-accent/20 bg-accent/5'
          : 'hover:border-accent/30'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="font-medium">{buff.name}</div>
              <Badge variant="outline" className="text-xs">
                {buff.actionCost}
              </Badge>
              {buff.concentration && (
                <Badge variant="outline" className="text-xs text-accent">
                  Concentration
                </Badge>
              )}
              {deltaResult && !deltaResult.isCalculating && (
                <DeltaPill value={isActive ? -deltaResult.value : deltaResult.value} />
              )}
            </div>
            
            <div className="text-sm text-muted mb-2">{buff.description}</div>
            
            <div className="text-sm font-medium text-emerald">
              {renderEffects(buff)}
            </div>
            
            <div className="text-xs text-muted mt-1">
              Duration: {buff.duration}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {status === 'round0' && (
              <Badge variant="secondary" className="text-xs bg-gold/10 text-gold">
                Round 0
              </Badge>
            )}
            <Switch
              checked={isActive}
              onCheckedChange={onToggle}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}