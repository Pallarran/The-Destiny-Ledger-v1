import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Switch } from '../ui/switch'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { Sparkles, AlertTriangle, Clock, Zap } from 'lucide-react'
import { buffs } from '../../rules/srd/buffs'

export function BuffSelection() {
  const {
    currentBuild,
    toggleBuff,
    setRound0Buffs
  } = useCharacterBuilderStore()
  
  const [activeTab, setActiveTab] = useState<'concentration' | 'nonconcentration' | 'round0'>('concentration')
  
  if (!currentBuild) {
    return <div className="text-center text-muted">Loading buff options...</div>
  }
  
  const activeBuff = currentBuild.activeBuffs || []
  const round0Buffs = currentBuild.round0Buffs || []
  
  // Filter buffs by type
  const concentrationBuffs = Object.values(buffs).filter(b => b.concentration)
  const nonConcentrationBuffs = Object.values(buffs).filter(b => !b.concentration)
  const round0Available = Object.values(buffs).filter(b => b.allowedRound0)
  
  // Check for concentration conflicts
  const activeConcentrationBuffs = activeBuff
    .map(id => buffs[id])
    .filter(buff => buff?.concentration)
  
  const hasConcentrationConflict = activeConcentrationBuffs.length > 1
  
  // Helper to get buff status
  const getBuffStatus = (buffId: string) => {
    if (activeBuff.includes(buffId)) return 'active'
    if (round0Buffs.includes(buffId)) return 'round0'
    return 'inactive'
  }
  
  // Helper to render buff effects
  const renderBuffEffects = (buff: any) => {
    const effects = []
    if (buff.effects.attackBonus) effects.push(`+${buff.effects.attackBonus} attack`)
    if (buff.effects.damageBonus) effects.push(`+${buff.effects.damageBonus} damage`)
    if (buff.effects.advantage) effects.push('advantage on attacks')
    if (buff.effects.additionalAttacks) effects.push(`+${buff.effects.additionalAttacks} attack`)
    if (buff.effects.onHitDamage) {
      const onHit = buff.effects.onHitDamage[0]
      effects.push(`+${onHit.count}d${onHit.die} ${onHit.type} on hit`)
    }
    return effects.join(', ')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-panel mb-2">Buffs & Spells</h2>
        <p className="text-muted">
          Select active buffs that affect your combat performance. Concentration spells conflict with each other.
        </p>
        {hasConcentrationConflict && (
          <div className="mt-3 p-3 bg-danger/10 border border-danger/20 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-danger" />
            <span className="text-sm text-danger">
              Multiple concentration effects active! Only one can be maintained at a time.
            </span>
          </div>
        )}
      </div>
      
      {/* Buff Tabs */}
      <div className="flex border-b border-border/20">
        <Button
          variant={activeTab === 'concentration' ? "accent" : "ghost"}
          onClick={() => setActiveTab('concentration')}
          className="rounded-none border-b-2 border-transparent"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Concentration
        </Button>
        <Button
          variant={activeTab === 'nonconcentration' ? "accent" : "ghost"}
          onClick={() => setActiveTab('nonconcentration')}
          className="rounded-none border-b-2 border-transparent"
        >
          <Zap className="w-4 h-4 mr-2" />
          Other Buffs
        </Button>
        <Button
          variant={activeTab === 'round0' ? "accent" : "ghost"}
          onClick={() => setActiveTab('round0')}
          className="rounded-none border-b-2 border-transparent"
        >
          <Clock className="w-4 h-4 mr-2" />
          Round 0 Setup
        </Button>
      </div>
      
      {/* Concentration Buffs */}
      {activeTab === 'concentration' && (
        <div className="space-y-4">
          <div className="text-sm text-muted mb-4">
            Concentration spells require your concentration to maintain. You can only concentrate on one spell at a time.
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {concentrationBuffs.map((buff) => {
              const status = getBuffStatus(buff.id)
              const isActive = status === 'active'
              const isConflicted = hasConcentrationConflict && isActive
              
              return (
                <Card
                  key={buff.id}
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
                          <Badge variant="outline" className="text-xs text-accent">
                            Concentration
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted mb-2">{buff.description}</div>
                        
                        <div className="text-sm font-medium text-emerald">
                          {renderBuffEffects(buff)}
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
                          onCheckedChange={() => toggleBuff(buff.id)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Non-concentration Buffs */}
      {activeTab === 'nonconcentration' && (
        <div className="space-y-4">
          <div className="text-sm text-muted mb-4">
            Non-concentration abilities and short-duration effects that can stack with other buffs.
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {nonConcentrationBuffs.map((buff) => {
              const status = getBuffStatus(buff.id)
              const isActive = status === 'active'
              
              return (
                <Card
                  key={buff.id}
                  className={`transition-all ${
                    isActive
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
                        </div>
                        
                        <div className="text-sm text-muted mb-2">{buff.description}</div>
                        
                        <div className="text-sm font-medium text-emerald">
                          {renderBuffEffects(buff)}
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
                          onCheckedChange={() => toggleBuff(buff.id)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Round 0 Setup */}
      {activeTab === 'round0' && (
        <div className="space-y-4">
          <div className="text-sm text-muted mb-4">
            Round 0 represents pre-combat setup. You can cast spells and activate abilities before initiative is rolled.
            Be aware of concentration limits and action economy.
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {round0Available.map((buff) => {
              const inRound0 = round0Buffs.includes(buff.id)
              const isConcentration = buff.concentration
              
              return (
                <Card
                  key={buff.id}
                  className={`transition-all ${
                    inRound0
                      ? 'ring-2 ring-gold border-gold/20 bg-gold/5'
                      : 'hover:border-gold/30'
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
                          {isConcentration && (
                            <Badge variant="outline" className="text-xs text-accent">
                              Concentration
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted mb-2">{buff.description}</div>
                        
                        <div className="text-sm font-medium text-emerald">
                          {renderBuffEffects(buff)}
                        </div>
                      </div>
                      
                      <Switch
                        checked={inRound0}
                        onCheckedChange={() => {
                          if (inRound0) {
                            setRound0Buffs(round0Buffs.filter(id => id !== buff.id))
                          } else {
                            setRound0Buffs([...round0Buffs, buff.id])
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Active Buffs Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Active Effects Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {activeBuff.length === 0 && round0Buffs.length === 0 ? (
            <div className="text-sm text-muted text-center py-4">
              No buffs currently active
            </div>
          ) : (
            <div className="space-y-3">
              {activeBuff.length > 0 && (
                <div>
                  <h4 className="font-semibold text-panel mb-2">Combat Buffs</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeBuff.map(buffId => {
                      const buff = buffs[buffId]
                      return buff ? (
                        <Badge
                          key={buffId}
                          variant="secondary"
                          className={`${buff.concentration ? 'bg-accent/10 text-accent' : 'bg-emerald/10 text-emerald'}`}
                        >
                          {buff.name}
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}
              
              {round0Buffs.length > 0 && (
                <div>
                  <h4 className="font-semibold text-panel mb-2">Round 0 Setup</h4>
                  <div className="flex flex-wrap gap-2">
                    {round0Buffs.map(buffId => {
                      const buff = buffs[buffId]
                      return buff ? (
                        <Badge key={buffId} variant="secondary" className="bg-gold/10 text-gold">
                          {buff.name}
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}
              
              {hasConcentrationConflict && (
                <div className="p-2 bg-danger/10 border border-danger/20 rounded text-sm text-danger">
                  ⚠️ Concentration conflict detected - only one concentration effect can be active
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}