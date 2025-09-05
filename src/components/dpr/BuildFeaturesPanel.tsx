import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Star, Swords, Zap, Shield } from 'lucide-react'
import { getClass, getFeat } from '../../rules/loaders'
import type { BuildConfiguration } from '../../stores/types'
import type { Feature, Feat } from '../../rules/types'

interface BuildFeaturesPanelProps {
  build: BuildConfiguration | null
}

interface ExtractedFeature {
  id: string
  name: string
  description: string
  source: string
  level: number
  classId: string
  type: 'class' | 'subclass' | 'feat'
  rulesKey?: string
}

function extractBuildFeatures(build: BuildConfiguration): ExtractedFeature[] {
  if (!build?.levelTimeline) return []

  const extractedFeatures: ExtractedFeature[] = []
  const targetLevel = Math.max(...build.levelTimeline.map(l => l.level))

  // Track class levels for multiclassing
  const classLevels: Record<string, number> = {}

  // Extract class and subclass features
  for (const levelEntry of build.levelTimeline) {
    if (levelEntry.level > targetLevel) break

    const classData = getClass(levelEntry.classId)
    if (!classData) continue

    // Update class level count
    classLevels[levelEntry.classId] = (classLevels[levelEntry.classId] || 0) + 1
    const currentClassLevel = classLevels[levelEntry.classId]

    // Get class features for this class level (not character level)
    const classFeatures = classData.features[currentClassLevel] || []
    for (const feature of classFeatures) {
      if (isDPRRelevantFeature(feature)) {
        extractedFeatures.push({
          id: feature.id,
          name: feature.name,
          description: feature.description,
          source: classData.name,
          level: currentClassLevel, // Use class level, not character level
          classId: levelEntry.classId,
          type: 'class',
          rulesKey: feature.rulesKey
        })
      }
    }

    // Extract fighting styles  
    if (levelEntry.fightingStyle) {
      const fightingStyleNames: Record<string, string> = {
        'archery': 'Archery',
        'defense': 'Defense', 
        'dueling': 'Dueling',
        'great_weapon_fighting': 'Great Weapon Fighting',
        'protection': 'Protection',
        'two_weapon_fighting': 'Two-Weapon Fighting',
        'blessed_warrior': 'Blessed Warrior',
        'blind_fighting': 'Blind Fighting',
        'druidic_warrior': 'Druidic Warrior',
        'thrown_weapon_fighting': 'Thrown Weapon Fighting',
        'unarmed_fighting': 'Unarmed Fighting',
        'superior_technique': 'Superior Technique'
      }
      
      const fightingStyleDesc: Record<string, string> = {
        'archery': '+2 to attack rolls with ranged weapons',
        'defense': '+1 AC while wearing armor',
        'dueling': '+2 damage with one-handed weapons',
        'great_weapon_fighting': 'Reroll 1s and 2s on damage dice',
        'protection': 'Use reaction to impose disadvantage',
        'two_weapon_fighting': 'Add ability modifier to off-hand damage',
        'blessed_warrior': 'Learn two Cleric cantrips',
        'blind_fighting': '10 ft blindsight',
        'druidic_warrior': 'Learn two Druid cantrips',
        'thrown_weapon_fighting': '+2 damage with thrown weapons',
        'unarmed_fighting': '1d6+STR unarmed strikes',
        'superior_technique': 'Learn one maneuver and gain one superiority die'
      }
      
      const styleName = fightingStyleNames[levelEntry.fightingStyle] || levelEntry.fightingStyle
      const styleDesc = fightingStyleDesc[levelEntry.fightingStyle] || 'Fighting style benefit'
      
      extractedFeatures.push({
        id: `fighting_style_${levelEntry.fightingStyle}`,
        name: `Fighting Style: ${styleName}`,
        description: styleDesc,
        source: classData.name,
        level: currentClassLevel,
        classId: levelEntry.classId,
        type: 'class',
        rulesKey: levelEntry.fightingStyle
      })
    }

    // Extract feats
    if (levelEntry.featId) {
      const feat = getFeat(levelEntry.featId)
      if (feat && isDPRRelevantFeat(feat)) {
        // Get the primary rulesKey from the feat's features
        const primaryFeature = feat.features.find(f => f.rulesKey)
        extractedFeatures.push({
          id: feat.id,
          name: feat.name,
          description: feat.description,
          source: 'Feat',
          level: levelEntry.level, // Keep character level for feats
          classId: levelEntry.classId,
          type: 'feat',
          rulesKey: primaryFeature?.rulesKey
        })
      }
    }
  }

  // Extract feats from downtime training
  if (build.downtimeTraining?.trainedFeats) {
    for (const featId of build.downtimeTraining.trainedFeats) {
      const feat = getFeat(featId)
      if (feat && isDPRRelevantFeat(feat)) {
        const primaryFeature = feat.features.find(f => f.rulesKey)
        extractedFeatures.push({
          id: feat.id,
          name: feat.name,
          description: feat.description,
          source: 'Downtime Training',
          level: targetLevel, // Use target level since training happens outside level progression
          classId: 'training',
          type: 'feat',
          rulesKey: primaryFeature?.rulesKey
        })
      }
    }
  }

  // Sort by level and then by type priority
  return extractedFeatures.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level
    const typePriority = { feat: 0, class: 1, subclass: 2 }
    return typePriority[a.type] - typePriority[b.type]
  })
}

function isDPRRelevantFeature(feature: Feature): boolean {
  if (!feature.rulesKey) return false
  
  const dprRelevantKeys = [
    // Fighter features
    'extra_attack',
    'extra_attack_1',
    'extra_attack_2', 
    'extra_attack_3',
    'action_surge',
    'second_wind',
    'indomitable',
    
    // Fighting Styles
    'great_weapon_fighting',
    'dueling',
    'archery',
    'defense',
    'two_weapon_fighting',
    'blessed_warrior',
    'protection',
    'superior_technique',
    
    // Rogue features
    'sneak_attack',
    'cunning_action',
    'uncanny_dodge',
    'evasion',
    'reliable_talent',
    'assassinate',
    'assassins_strike',
    
    // Barbarian features
    'rage',
    'reckless_attack',
    'brutal_critical',
    'frenzy',
    'mindless_rage',
    
    // Ranger features
    'hunters_mark_spell',
    'favored_enemy',
    'hunters_prey',
    'colossus_slayer',
    'giant_killer',
    'volley',
    'whirlwind_attack',
    
    // Paladin features
    'divine_smite',
    'divine_strike',
    'improved_divine_smite',
    'aura_of_protection',
    
    // Monk features
    'martial_arts',
    'ki',
    'flurry_of_blows',
    'stunning_strike',
    
    // Critical features
    'improved_critical',
    'superior_critical',
    
    // Battle Master
    'combat_superiority',
    'maneuvers',
    
    // Warlock
    'eldritch_blast',
    'agonizing_blast',
    'hex',
    'hexblades_curse',
    'thirsting_blade',
    'lifedrinker'
  ]
  
  return dprRelevantKeys.includes(feature.rulesKey)
}

function isDPRRelevantFeat(feat: Feat): boolean {
  const dprRelevantFeats = [
    // Power attack feats
    'great_weapon_master',
    'sharpshooter',
    
    // Weapon mastery feats
    'crossbow_expert',
    'polearm_master',
    'dual_wielder',
    
    // Tactical feats
    'sentinel',
    'mobile',
    'alert',
    'lucky',
    'mage_slayer',
    
    // Accuracy feats
    'elven_accuracy',
    
    // Magic feats
    'fey_touched',
    'shadow_touched',
    'telekinetic',
    'telepathic',
    'magic_initiate',
    'ritual_caster',
    'spell_sniper',
    'war_caster',
    
    // Damage type feats
    'crusher',
    'piercer',
    'slasher',
    
    // Defense feats
    'tough',
    'resilient',
    'defensive_duelist',
    'shield_master',
    'medium_armor_master',
    'heavy_armor_master',
    
    // Other combat feats
    'savage_attacker',
    'charger',
    'grappler',
    'tavern_brawler',
    'fighting_initiate',
    'martial_adept'
  ]
  
  // Check feat ID
  if (dprRelevantFeats.includes(feat.id)) return true
  
  // Check feat features for relevant rules keys
  return feat.features.some(feature => 
    feature.rulesKey && dprRelevantFeats.includes(feature.rulesKey)
  )
}

function getFeatureIcon(feature: ExtractedFeature) {
  if (feature.type === 'feat') return Star
  if (feature.rulesKey?.includes('attack')) return Swords
  if (feature.rulesKey?.includes('defense') || feature.rulesKey?.includes('armor')) return Shield
  return Zap
}

function getFeatureColor(feature: ExtractedFeature): string {
  switch (feature.type) {
    case 'feat': return 'text-yellow-600'
    case 'class': return 'text-blue-600'
    case 'subclass': return 'text-purple-600'
    default: return 'text-gray-600'
  }
}

export function BuildFeaturesPanel({ build }: BuildFeaturesPanelProps) {
  if (!build) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Combat Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted py-4">
            No build selected
          </div>
        </CardContent>
      </Card>
    )
  }

  const features = extractBuildFeatures(build)

  if (features.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Combat Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted py-4">
            No DPR-relevant features found
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Combat Features
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {features.map((feature, index) => {
          const Icon = getFeatureIcon(feature)
          const color = getFeatureColor(feature)
          
          return (
            <div key={index} className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg border border-accent/10">
              <div className="flex-shrink-0">
                <Icon className={`w-4 h-4 mt-0.5 ${color}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm text-foreground">{feature.name}</h4>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      {feature.type === 'class' ? `${feature.source} ${feature.level}` : `Lvl ${feature.level}`}
                    </Badge>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 capitalize">
                      {feature.type}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-xs text-muted line-clamp-2">
                  {feature.description}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted">
                    {feature.source}
                  </span>
                  {feature.rulesKey && (
                    <span className="text-xs font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                      {feature.rulesKey}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        
        {features.length > 0 && (
          <div className="pt-2 border-t border-border/20">
            <div className="text-xs text-muted text-center">
              {features.length} combat-relevant feature{features.length !== 1 ? 's' : ''} found
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}