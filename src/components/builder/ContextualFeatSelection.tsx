import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { ContextualReveal, ContextualSection } from '../ui/contextual-reveal'
import { FeatCardWithDelta } from './FeatCardWithDelta'
import { useContextualFields, useContextualDescriptions } from '../../hooks/useContextualFields'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { Sword, Target, Zap, Crown } from 'lucide-react'
import { feats } from '../../rules/srd/feats'
import type { BuildConfiguration } from '../../stores/types'

interface ContextualFeatSelectionProps {
  build: BuildConfiguration | null
  onFeatToggle?: (featId: string, enabled: boolean) => void
  className?: string
}

const FEAT_ICONS = {
  great_weapon_master: Sword,
  sharpshooter: Target,
  crossbow_expert: Zap,
  polearm_master: Crown
} as const

const FEAT_COLORS = {
  great_weapon_master: 'text-red-600 bg-red-500/10 border-red-500/20',
  sharpshooter: 'text-green-600 bg-green-500/10 border-green-500/20',
  crossbow_expert: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
  polearm_master: 'text-purple-600 bg-purple-500/10 border-purple-500/20'
} as const

export function ContextualFeatSelection({
  build,
  onFeatToggle,
  className
}: ContextualFeatSelectionProps) {
  const { currentBuild } = useCharacterBuilderStore()
  const activeBuild = build || currentBuild
  const contextualFields = useContextualFields(activeBuild)
  const descriptions = useContextualDescriptions(activeBuild)
  
  if (!activeBuild) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Contextual Feat Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Crown className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Build a character to see relevant feat options</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // Get currently selected feats
  const selectedFeats = activeBuild.levelTimeline
    ?.filter(level => level.asiOrFeat === 'feat')
    .flatMap(level => level.features || []) || []
  
  const isFeatSelected = (featId: string) => {
    return selectedFeats.some(featFeature => featFeature.includes(featId))
  }
  
  const handleFeatToggle = (featId: string) => {
    const isCurrentlySelected = isFeatSelected(featId)
    
    if (onFeatToggle) {
      onFeatToggle(featId, !isCurrentlySelected)
    } else {
      // Default behavior - add/remove feat from build
      // This is a simplified implementation
      console.log(`Toggle feat: ${featId}, currently selected: ${isCurrentlySelected}`)
    }
  }
  
  const renderFeatCard = (featId: keyof typeof feats, feat: typeof feats[keyof typeof feats]) => {
    const Icon = FEAT_ICONS[featId as keyof typeof FEAT_ICONS] || Crown
    const colorClass = FEAT_COLORS[featId as keyof typeof FEAT_COLORS] || 'text-gray-600 bg-gray-500/10 border-gray-500/20'
    const isSelected = isFeatSelected(featId)
    
    return (
      <FeatCardWithDelta
        key={featId}
        feat={feat}
        featId={featId}
        build={activeBuild}
        isSelected={isSelected}
        onToggle={() => handleFeatToggle(featId)}
        icon={Icon}
        colorClass={colorClass}
      />
    )
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Contextual Feat Options</CardTitle>
        <p className="text-sm text-muted-foreground">
          Feats relevant to your current weapon and build choices
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Power Attack Feats */}
        <ContextualReveal
          show={contextualFields.showGWMFeats}
          title="Great Weapon Master"
          description={descriptions.gwm}
          expandable={false}
        >
          {renderFeatCard('great_weapon_master', feats.great_weapon_master)}
        </ContextualReveal>
        
        <ContextualReveal
          show={contextualFields.showSharpshooterFeats}
          title="Sharpshooter"
          description={descriptions.sharpshooter}
          expandable={false}
        >
          {renderFeatCard('sharpshooter', feats.sharpshooter)}
        </ContextualReveal>
        
        {/* Weapon-Specific Feats */}
        <ContextualReveal
          show={contextualFields.showCrossbowExpertFeats}
          title="Crossbow Expert"
          description={descriptions.crossbow_expert}
          expandable={false}
        >
          {renderFeatCard('crossbow_expert', feats.crossbow_expert)}
        </ContextualReveal>
        
        <ContextualReveal
          show={contextualFields.showPolearmMasterFeats}
          title="Polearm Master"
          description={descriptions.polearm_master}
          expandable={false}
        >
          {renderFeatCard('polearm_master', feats.polearm_master)}
        </ContextualReveal>
        
        {/* Show message when no contextual feats are available */}
        <ContextualSection
          show={contextualFields.showGWMFeats || contextualFields.showSharpshooterFeats || contextualFields.showCrossbowExpertFeats || contextualFields.showPolearmMasterFeats}
          fallbackMessage="Select weapons to see relevant combat feats. Heavy weapons enable Great Weapon Master, ranged weapons enable Sharpshooter, etc."
        >
          <div className="mt-4 p-3 bg-accent/5 border border-accent/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> Contextual feat recommendations update as you change your weapon selections. 
              This helps you focus on feats that synergize with your build.
            </p>
          </div>
        </ContextualSection>
      </CardContent>
    </Card>
  )
}