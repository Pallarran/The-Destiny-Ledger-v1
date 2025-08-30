import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Switch } from '../ui/switch'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { Sword, Shield } from 'lucide-react'
import { weapons } from '../../rules/srd/weapons'
import { armor } from '../../rules/srd/armor'

// Helper function to format weapon damage
const formatWeaponDamage = (damageRolls: any[]) => {
  return damageRolls.map(roll => 
    `${roll.count}d${roll.die}${roll.bonus > 0 ? `+${roll.bonus}` : ''} ${roll.type}`
  ).join(' + ')
}

// Helper function to format armor AC
const formatArmorAC = (armorData: any) => {
  let acString = armorData.ac.toString()
  if (armorData.dexModifier === 'full') {
    acString += ' + Dex mod'
  } else if (armorData.dexModifier === 'limited') {
    acString += ` + Dex mod (max ${armorData.dexMax})`
  }
  return acString
}

export function EquipmentSelection() {
  const {
    currentBuild,
    setMainHandWeapon,
    setRangedWeapon,
    setArmor,
    toggleShield
  } = useCharacterBuilderStore()
  
  const [activeTab, setActiveTab] = useState<'weapons' | 'armor'>('weapons')
  
  if (!currentBuild) {
    return <div className="text-center text-muted">Loading equipment options...</div>
  }
  
  const selectedMainHand = currentBuild.selectedMainHand ? weapons[currentBuild.selectedMainHand] : null
  const selectedRanged = currentBuild.selectedRanged ? weapons[currentBuild.selectedRanged] : null
  const selectedArmor = currentBuild.selectedArmor ? armor[currentBuild.selectedArmor] : null
  
  // Filter weapons by category
  const meleeWeapons = Object.values(weapons).filter(w => w.category === 'melee')
  const rangedWeapons = Object.values(weapons).filter(w => w.category === 'ranged')
  const armorOptions = Object.values(armor)
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-panel mb-2">Equipment Selection</h2>
        <p className="text-muted">
          Choose your weapons and armor. Equipment affects your combat effectiveness and AC.
        </p>
      </div>
      
      {/* Equipment Tabs */}
      <div className="flex border-b border-border/20">
        <Button
          variant={activeTab === 'weapons' ? "accent" : "ghost"}
          onClick={() => setActiveTab('weapons')}
          className="rounded-none border-b-2 border-transparent"
        >
          <Sword className="w-4 h-4 mr-2" />
          Weapons
        </Button>
        <Button
          variant={activeTab === 'armor' ? "accent" : "ghost"}
          onClick={() => setActiveTab('armor')}
          className="rounded-none border-b-2 border-transparent"
        >
          <Shield className="w-4 h-4 mr-2" />
          Armor
        </Button>
      </div>
      
      {/* Weapons Tab */}
      {activeTab === 'weapons' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-panel mb-3">Main Hand Weapon</h3>
            {selectedMainHand && (
              <Card className="mb-3 border-accent/20 bg-accent/5">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{selectedMainHand.name}</div>
                      <div className="text-sm text-muted">{formatWeaponDamage(selectedMainHand.damage)}</div>
                      {selectedMainHand.properties.length > 0 && (
                        <div className="text-xs text-muted mt-1">
                          {selectedMainHand.properties.join(', ')}
                        </div>
                      )}
                    </div>
                    <Badge className="bg-accent/10 text-accent border-accent/20">Selected</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {meleeWeapons.map((weapon) => (
                <Card
                  key={weapon.id}
                  className={`cursor-pointer transition-all ${
                    selectedMainHand?.id === weapon.id 
                      ? 'ring-2 ring-accent border-accent/20 bg-accent/5' 
                      : 'hover:border-accent/30'
                  }`}
                  onClick={() => setMainHandWeapon(weapon.id)}
                >
                  <CardContent className="p-3">
                    <div className="font-medium">{weapon.name}</div>
                    <div className="text-sm text-muted">{formatWeaponDamage(weapon.damage)}</div>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {weapon.type}
                      </Badge>
                      {weapon.properties.slice(0, 2).map(prop => (
                        <Badge key={prop} variant="outline" className="text-xs">
                          {prop}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-panel mb-3">Ranged Weapon</h3>
            {selectedRanged && (
              <Card className="mb-3 border-emerald/20 bg-emerald/5">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{selectedRanged.name}</div>
                      <div className="text-sm text-muted">{formatWeaponDamage(selectedRanged.damage)}</div>
                      {selectedRanged.properties.length > 0 && (
                        <div className="text-xs text-muted mt-1">
                          {selectedRanged.properties.join(', ')}
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="bg-emerald/10 text-emerald border-emerald/20">
                      Selected
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rangedWeapons.map((weapon) => (
                <Card
                  key={weapon.id}
                  className={`cursor-pointer transition-all ${
                    selectedRanged?.id === weapon.id 
                      ? 'ring-2 ring-emerald border-emerald/20 bg-emerald/5' 
                      : 'hover:border-emerald/30'
                  }`}
                  onClick={() => setRangedWeapon(weapon.id)}
                >
                  <CardContent className="p-3">
                    <div className="font-medium">{weapon.name}</div>
                    <div className="text-sm text-muted">{formatWeaponDamage(weapon.damage)}</div>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {weapon.type}
                      </Badge>
                      {weapon.properties.slice(0, 2).map(prop => (
                        <Badge key={prop} variant="outline" className="text-xs">
                          {prop}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Armor Tab */}
      {activeTab === 'armor' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-panel mb-3">Armor</h3>
            {selectedArmor && (
              <Card className="mb-3 border-gold/20 bg-gold/5">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{selectedArmor.name}</div>
                      <div className="text-sm text-muted">AC {formatArmorAC(selectedArmor)} • {selectedArmor.type} Armor</div>
                      {selectedArmor.strengthRequirement && (
                        <div className="text-xs text-muted mt-1">
                          Requires STR {selectedArmor.strengthRequirement}
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20">
                      Selected
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {armorOptions.map((armorItem) => (
                <Card
                  key={armorItem.id}
                  className={`cursor-pointer transition-all ${
                    selectedArmor?.id === armorItem.id 
                      ? 'ring-2 ring-gold border-gold/20 bg-gold/5' 
                      : 'hover:border-gold/30'
                  }`}
                  onClick={() => setArmor(armorItem.id)}
                >
                  <CardContent className="p-3">
                    <div className="font-medium">{armorItem.name}</div>
                    <div className="text-sm text-muted">AC {formatArmorAC(armorItem)}</div>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {armorItem.type} Armor
                      </Badge>
                      {armorItem.stealthDisadvantage && (
                        <Badge variant="outline" className="text-xs text-danger">
                          Stealth Disadv.
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Shield */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-accent" />
                  <div>
                    <div className="font-medium">Shield</div>
                    <div className="text-sm text-muted">+2 AC (requires free hand)</div>
                  </div>
                </div>
                <Switch
                  checked={currentBuild.hasShield || false}
                  onCheckedChange={toggleShield}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Equipment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-panel mb-3">Weapons</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Main Hand:</span>
                  <span>{selectedMainHand?.name || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Ranged:</span>
                  <span>{selectedRanged?.name || 'None'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-panel mb-3">Protection</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Armor:</span>
                  <span>{selectedArmor?.name || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Shield:</span>
                  <span>{currentBuild.hasShield ? 'Yes (+2 AC)' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}