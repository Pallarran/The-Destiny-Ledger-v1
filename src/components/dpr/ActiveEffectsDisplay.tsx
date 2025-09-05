import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Sparkles, Plus, Target, Sword, Eye, Clock, Zap, Shield } from 'lucide-react'
import { getBuff } from '../../rules/loaders'
import { buildToCombatState } from '../../engine/simulator'
import type { BuildConfiguration } from '../../stores/types'

interface ActiveEffectsDisplayProps {
  build: BuildConfiguration | null
}

interface ProcessedEffect {
  id: string
  name: string
  description: string
  isRound0: boolean
  concentration: boolean
  duration: string
  actionCost: string
  source?: 'buff' | 'class' | 'fighting-style' | 'feat'
  effects: {
    attackBonus?: number
    damageBonus?: number
    advantage?: boolean
    disadvantage?: boolean
    additionalAttacks?: number
    onHitDamage?: Array<{count: number, die: number, bonus: number, type: string}>
  }
}

function extractActiveEffects(build: BuildConfiguration): ProcessedEffect[] {
  if (!build) return []

  const processedEffects: ProcessedEffect[] = []
  
  // Process active buffs (ongoing effects)
  for (const buffId of build.activeBuffs || []) {
    const buff = getBuff(buffId)
    if (buff) {
      processedEffects.push({
        id: buff.id,
        name: buff.name,
        description: buff.description,
        isRound0: false,
        concentration: buff.concentration,
        duration: buff.duration,
        actionCost: buff.actionCost,
        source: 'buff',
        effects: buff.effects
      })
    }
  }

  // Process round 0 buffs (pre-combat setup)
  for (const buffId of build.round0Buffs || []) {
    const buff = getBuff(buffId)
    if (buff) {
      processedEffects.push({
        id: buff.id,
        name: buff.name,
        description: buff.description,
        isRound0: true,
        concentration: buff.concentration,
        duration: buff.duration,
        actionCost: buff.actionCost,
        source: 'buff',
        effects: buff.effects
      })
    }
  }

  // Extract computed effects from combat state
  const combatState = buildToCombatState(build)
  
  // Extra Attacks
  if (combatState.extraAttacks > 0) {
    processedEffects.push({
      id: 'extra_attacks',
      name: 'Extra Attack',
      description: `Make ${combatState.extraAttacks} additional attack${combatState.extraAttacks > 1 ? 's' : ''} when you take the Attack action`,
      isRound0: false,
      concentration: false,
      duration: 'Passive',
      actionCost: 'passive',
      source: 'class',
      effects: {
        additionalAttacks: combatState.extraAttacks
      }
    })
  }
  
  // Action Surge
  if (combatState.actionSurge) {
    processedEffects.push({
      id: 'action_surge',
      name: 'Action Surge',
      description: 'Gain one additional action on your turn',
      isRound0: false,
      concentration: false,
      duration: '1 use per rest',
      actionCost: 'passive',
      source: 'class',
      effects: {
        additionalAttacks: combatState.extraAttacks + 1 // Effectively doubles attacks
      }
    })
  }
  
  // Sneak Attack
  if (combatState.sneakAttackDice > 0) {
    processedEffects.push({
      id: 'sneak_attack',
      name: 'Sneak Attack',
      description: `Deal an extra ${combatState.sneakAttackDice}d6 damage when you have advantage or an ally is nearby`,
      isRound0: false,
      concentration: false,
      duration: 'Passive',
      actionCost: 'passive',
      source: 'class',
      effects: {
        onHitDamage: [{ count: combatState.sneakAttackDice, die: 6, bonus: 0, type: 'sneak' }]
      }
    })
  }
  
  // Critical Range
  if (combatState.critRange && combatState.critRange < 20) {
    processedEffects.push({
      id: 'improved_critical',
      name: combatState.critRange === 18 ? 'Superior Critical' : 'Improved Critical',
      description: `Critical hits on ${combatState.critRange}-20`,
      isRound0: false,
      concentration: false,
      duration: 'Passive',
      actionCost: 'passive',
      source: 'class',
      effects: {}
    })
  }
  
  // Fighting Styles
  for (const style of combatState.fightingStyles) {
    let styleName = ''
    let styleDesc = ''
    let styleEffects: Record<string, number> = {}
    
    switch (style) {
      case 'archery':
        styleName = 'Archery Fighting Style'
        styleDesc = '+2 bonus to ranged weapon attack rolls'
        styleEffects = { attackBonus: 2 }
        break
      case 'dueling':
        styleName = 'Dueling Fighting Style'
        styleDesc = '+2 damage when wielding a one-handed weapon with no other weapon'
        styleEffects = { damageBonus: 2 }
        break
      case 'gwf':
        styleName = 'Great Weapon Fighting'
        styleDesc = 'Reroll 1s and 2s on weapon damage dice'
        styleEffects = {}
        break
      case 'defense':
        styleName = 'Defense Fighting Style'
        styleDesc = '+1 AC while wearing armor'
        styleEffects = {}
        break
      case 'two-weapon':
        styleName = 'Two-Weapon Fighting'
        styleDesc = 'Add ability modifier to off-hand attacks'
        styleEffects = {}
        break
    }
    
    if (styleName) {
      processedEffects.push({
        id: `fighting_style_${style}`,
        name: styleName,
        description: styleDesc,
        isRound0: false,
        concentration: false,
        duration: 'Passive',
        actionCost: 'passive',
        source: 'fighting-style',
        effects: styleEffects
      })
    }
  }
  
  // Feat Effects
  if (combatState.hasGWM) {
    processedEffects.push({
      id: 'great_weapon_master',
      name: 'Great Weapon Master',
      description: 'Take -5 penalty to attack for +10 damage with heavy weapons',
      isRound0: false,
      concentration: false,
      duration: 'Passive',
      actionCost: 'passive',
      source: 'feat',
      effects: {}
    })
  }
  
  if (combatState.hasSharpshooter) {
    processedEffects.push({
      id: 'sharpshooter',
      name: 'Sharpshooter',
      description: 'Take -5 penalty to attack for +10 damage with ranged weapons',
      isRound0: false,
      concentration: false,
      duration: 'Passive',
      actionCost: 'passive',
      source: 'feat',
      effects: {}
    })
  }
  
  if (combatState.hasCrossbowExpert) {
    processedEffects.push({
      id: 'crossbow_expert',
      name: 'Crossbow Expert',
      description: 'Ignore loading property and make bonus action attacks with hand crossbows',
      isRound0: false,
      concentration: false,
      duration: 'Passive',
      actionCost: 'passive',
      source: 'feat',
      effects: {}
    })
  }
  
  if (combatState.hasPolearmMaster) {
    processedEffects.push({
      id: 'polearm_master',
      name: 'Polearm Master',
      description: 'Make bonus action attacks with polearms and opportunity attacks when enemies enter reach',
      isRound0: false,
      concentration: false,
      duration: 'Passive',
      actionCost: 'passive',
      source: 'feat',
      effects: {}
    })
  }
  
  // Other Class Features
  if (combatState.hasRage) {
    processedEffects.push({
      id: 'rage',
      name: 'Rage',
      description: 'Advantage on STR checks, +2 damage on STR melee attacks, resistance to physical damage',
      isRound0: false,
      concentration: false,
      duration: '1 minute',
      actionCost: 'bonus action',
      source: 'class',
      effects: {
        damageBonus: 2,
        advantage: true
      }
    })
  }
  
  if (combatState.hasMartialArts) {
    processedEffects.push({
      id: 'martial_arts',
      name: 'Martial Arts',
      description: 'Use DEX for unarmed strikes, make bonus action unarmed strikes',
      isRound0: false,
      concentration: false,
      duration: 'Passive',
      actionCost: 'passive',
      source: 'class',
      effects: {}
    })
  }
  
  if (combatState.hasAssassinate) {
    processedEffects.push({
      id: 'assassinate',
      name: 'Assassinate',
      description: 'Advantage on attacks against creatures that haven\'t acted yet, critical hits on surprised creatures',
      isRound0: false,
      concentration: false,
      duration: 'Passive',
      actionCost: 'passive',
      source: 'class',
      effects: {
        advantage: true
      }
    })
  }
  
  if (combatState.hasFrenzy) {
    processedEffects.push({
      id: 'frenzy',
      name: 'Frenzy',
      description: 'Make bonus action attacks while raging',
      isRound0: false,
      concentration: false,
      duration: 'While raging',
      actionCost: 'bonus action',
      source: 'class',
      effects: {
        additionalAttacks: 1
      }
    })
  }
  
  if (combatState.superiorityDice) {
    processedEffects.push({
      id: 'combat_superiority',
      name: 'Combat Superiority',
      description: `${combatState.superiorityDice.count}d${combatState.superiorityDice.die} superiority dice for combat maneuvers`,
      isRound0: false,
      concentration: false,
      duration: 'Short rest',
      actionCost: 'varies',
      source: 'class',
      effects: {}
    })
  }

  return processedEffects
}

function getEffectIcon(effect: ProcessedEffect) {
  if (effect.effects.advantage) return Eye
  if (effect.effects.attackBonus && effect.effects.attackBonus > 0) return Target
  if (effect.effects.damageBonus && effect.effects.damageBonus > 0) return Sword
  if (effect.effects.additionalAttacks) return Plus
  return Sparkles
}

function getEffectColor(effect: ProcessedEffect): string {
  if (effect.isRound0) return 'text-blue-600'
  if (effect.concentration) return 'text-purple-600'
  if (effect.source === 'class') return 'text-amber-600'
  if (effect.source === 'fighting-style') return 'text-cyan-600'
  if (effect.source === 'feat') return 'text-red-600'
  return 'text-green-600'
}

function formatEffectSummary(effect: ProcessedEffect): string[] {
  const summary: string[] = []
  
  if (effect.effects.attackBonus) {
    summary.push(`${effect.effects.attackBonus > 0 ? '+' : ''}${effect.effects.attackBonus} Attack`)
  }
  
  if (effect.effects.damageBonus) {
    summary.push(`${effect.effects.damageBonus > 0 ? '+' : ''}${effect.effects.damageBonus} Damage`)
  }
  
  if (effect.effects.advantage) {
    summary.push('Advantage')
  }
  
  if (effect.effects.disadvantage) {
    summary.push('Disadvantage')
  }
  
  if (effect.effects.additionalAttacks) {
    summary.push(`+${effect.effects.additionalAttacks} Attack${effect.effects.additionalAttacks > 1 ? 's' : ''}`)
  }
  
  if (effect.effects.onHitDamage && effect.effects.onHitDamage.length > 0) {
    const damage = effect.effects.onHitDamage[0]
    summary.push(`+${damage.count}d${damage.die} ${damage.type}`)
  }
  
  return summary
}

export function ActiveEffectsDisplay({ build }: ActiveEffectsDisplayProps) {
  if (!build) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Active Effects
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

  const effects = extractActiveEffects(build)

  if (effects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Active Effects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted py-4">
            No active effects or buffs
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group effects by type
  const ongoingEffects = effects.filter(e => !e.isRound0)
  const round0Effects = effects.filter(e => e.isRound0)
  
  // Further group ongoing effects by source
  const buffEffects = ongoingEffects.filter(e => e.source === 'buff')
  const classEffects = ongoingEffects.filter(e => e.source === 'class')  
  const fightingStyleEffects = ongoingEffects.filter(e => e.source === 'fighting-style')
  const featEffects = ongoingEffects.filter(e => e.source === 'feat')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Active Effects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Round 0 Effects */}
        {round0Effects.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Pre-Combat Setup
            </h4>
            <div className="space-y-2">
              {round0Effects.map((effect, index) => {
                const Icon = getEffectIcon(effect)
                const color = getEffectColor(effect)
                const summary = formatEffectSummary(effect)
                
                return (
                  <div key={`r0-${index}`} className="flex items-start gap-3 p-2 bg-blue-500/5 rounded border border-blue-500/20">
                    <Icon className={`w-4 h-4 mt-0.5 ${color}`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-sm text-foreground">{effect.name}</h5>
                        {effect.concentration && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            Conc.
                          </Badge>
                        )}
                      </div>
                      
                      {summary.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {summary.map((s, i) => (
                            <span key={i} className="text-xs bg-blue-600/10 text-blue-700 px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted">
                        <span>{effect.duration}</span>
                        <span className="capitalize">{effect.actionCost}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Class Features */}
        {classEffects.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Class Features
            </h4>
            <div className="space-y-2">
              {classEffects.map((effect, index) => {
                const Icon = getEffectIcon(effect)
                const color = getEffectColor(effect)
                const summary = formatEffectSummary(effect)
                
                return (
                  <div key={`class-${index}`} className="flex items-start gap-3 p-2 bg-amber-500/5 rounded border border-amber-500/20">
                    <Icon className={`w-4 h-4 mt-0.5 ${color}`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-sm text-foreground">{effect.name}</h5>
                      </div>
                      
                      {summary.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {summary.map((s, i) => (
                            <span key={i} className="text-xs bg-amber-600/10 text-amber-700 px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted">
                        <span>{effect.duration}</span>
                        <span className="capitalize">{effect.actionCost}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Fighting Styles */}
        {fightingStyleEffects.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Fighting Styles
            </h4>
            <div className="space-y-2">
              {fightingStyleEffects.map((effect, index) => {
                const Icon = getEffectIcon(effect)
                const color = getEffectColor(effect)
                const summary = formatEffectSummary(effect)
                
                return (
                  <div key={`fighting-${index}`} className="flex items-start gap-3 p-2 bg-cyan-500/5 rounded border border-cyan-500/20">
                    <Icon className={`w-4 h-4 mt-0.5 ${color}`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-sm text-foreground">{effect.name}</h5>
                      </div>
                      
                      {summary.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {summary.map((s, i) => (
                            <span key={i} className="text-xs bg-cyan-600/10 text-cyan-700 px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted">
                        <span>{effect.duration}</span>
                        <span className="capitalize">{effect.actionCost}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Feat Effects */}
        {featEffects.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
              <Target className="w-3 h-3" />
              Feats
            </h4>
            <div className="space-y-2">
              {featEffects.map((effect, index) => {
                const Icon = getEffectIcon(effect)
                const color = getEffectColor(effect)
                const summary = formatEffectSummary(effect)
                
                return (
                  <div key={`feat-${index}`} className="flex items-start gap-3 p-2 bg-red-500/5 rounded border border-red-500/20">
                    <Icon className={`w-4 h-4 mt-0.5 ${color}`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-sm text-foreground">{effect.name}</h5>
                      </div>
                      
                      {summary.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {summary.map((s, i) => (
                            <span key={i} className="text-xs bg-red-600/10 text-red-700 px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted">
                        <span>{effect.duration}</span>
                        <span className="capitalize">{effect.actionCost}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Active Buffs/Spells */}
        {buffEffects.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Active Buffs
            </h4>
            <div className="space-y-2">
              {buffEffects.map((effect, index) => {
                const Icon = getEffectIcon(effect)
                const color = getEffectColor(effect)
                const summary = formatEffectSummary(effect)
                
                return (
                  <div key={`buff-${index}`} className="flex items-start gap-3 p-2 bg-green-500/5 rounded border border-green-500/20">
                    <Icon className={`w-4 h-4 mt-0.5 ${color}`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-sm text-foreground">{effect.name}</h5>
                        {effect.concentration && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            Conc.
                          </Badge>
                        )}
                      </div>
                      
                      {summary.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {summary.map((s, i) => (
                            <span key={i} className="text-xs bg-green-600/10 text-green-700 px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted">
                        <span>{effect.duration}</span>
                        <span className="capitalize">{effect.actionCost}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {/* Summary */}
        <div className="pt-2 border-t border-border/20">
          <div className="text-xs text-muted text-center">
            {round0Effects.length > 0 && `${round0Effects.length} pre-combat`}
            {round0Effects.length > 0 && ongoingEffects.length > 0 && ' • '}
            {ongoingEffects.length > 0 && `${ongoingEffects.length} ongoing`}
            {effects.length === 0 && 'No active effects'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}