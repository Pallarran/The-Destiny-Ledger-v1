import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Sparkles, Plus, Target, Sword, Eye, Clock } from 'lucide-react'
import { getBuff } from '../../rules/loaders'
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
        effects: buff.effects
      })
    }
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

        {/* Ongoing Effects */}
        {ongoingEffects.length > 0 && (
          <div>
            {round0Effects.length > 0 && (
              <h4 className="text-sm font-medium text-foreground mb-2">
                Ongoing Effects
              </h4>
            )}
            <div className="space-y-2">
              {ongoingEffects.map((effect, index) => {
                const Icon = getEffectIcon(effect)
                const color = getEffectColor(effect)
                const summary = formatEffectSummary(effect)
                
                return (
                  <div key={`ongoing-${index}`} className="flex items-start gap-3 p-2 bg-green-500/5 rounded border border-green-500/20">
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