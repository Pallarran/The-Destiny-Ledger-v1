import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Switch } from '../ui/switch'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { Sword, Shield } from 'lucide-react'

const MOCK_WEAPONS = [
  { id: 'longsword', name: 'Longsword', damage: '1d8 slashing', type: 'melee' },
  { id: 'greatsword', name: 'Greatsword', damage: '2d6 slashing', type: 'melee' },
  { id: 'dagger', name: 'Dagger', damage: '1d4 piercing', type: 'melee' },
  { id: 'longbow', name: 'Longbow', damage: '1d8 piercing', type: 'ranged' },
  { id: 'crossbow', name: 'Light Crossbow', damage: '1d8 piercing', type: 'ranged' }
]

const MOCK_ARMOR = [
  { id: 'leather', name: 'Leather Armor', ac: '11 + Dex mod', type: 'Light' },
  { id: 'chain_shirt', name: 'Chain Shirt', ac: '13 + Dex mod (max 2)', type: 'Medium' },
  { id: 'plate', name: 'Plate Armor', ac: '18', type: 'Heavy' }
]

export function EquipmentSelection() {
  const {
    currentBuild,
    setMainHandWeapon,
    setRangedWeapon,
    setArmor,
    toggleShield
  } = useCharacterBuilderStore()
  
  const [activeTab, setActiveTab] = useState<'weapons' | 'armor'>('weapons')
  
  if (!currentBuild) return null
  
  const selectedMainHand = MOCK_WEAPONS.find(w => w.id === currentBuild.selectedMainHand)
  const selectedRanged = MOCK_WEAPONS.find(w => w.id === currentBuild.selectedRanged)
  const selectedArmor = MOCK_ARMOR.find(a => a.id === currentBuild.selectedArmor)
  
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
                      <div className="text-sm text-muted">{selectedMainHand.damage}</div>
                    </div>
                    <Badge className="bg-accent/10 text-accent border-accent/20">Selected</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_WEAPONS.filter(w => w.type === 'melee').map((weapon) => (
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
                    <div className="text-sm text-muted">{weapon.damage}</div>
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
                      <div className="text-sm text-muted">{selectedRanged.damage}</div>
                    </div>
                    <Badge variant="secondary" className="bg-emerald/10 text-emerald border-emerald/20">
                      Selected
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_WEAPONS.filter(w => w.type === 'ranged').map((weapon) => (
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
                    <div className="text-sm text-muted">{weapon.damage}</div>
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
                      <div className="text-sm text-muted">AC {selectedArmor.ac} • {selectedArmor.type} Armor</div>
                    </div>
                    <Badge variant="secondary" className="bg-gold/10 text-gold border-gold/20">
                      Selected
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_ARMOR.map((armor) => (
                <Card
                  key={armor.id}
                  className={`cursor-pointer transition-all ${
                    selectedArmor?.id === armor.id 
                      ? 'ring-2 ring-gold border-gold/20 bg-gold/5' 
                      : 'hover:border-gold/30'
                  }`}
                  onClick={() => setArmor(armor.id)}
                >
                  <CardContent className="p-3">
                    <div className="font-medium">{armor.name}</div>
                    <div className="text-sm text-muted">AC {armor.ac}</div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {armor.type} Armor
                    </Badge>
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