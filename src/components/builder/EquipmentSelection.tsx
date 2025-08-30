import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { Sword, Shield, Info } from 'lucide-react'
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
    acString += ' + Dex'
  } else if (armorData.dexModifier === 'limited') {
    acString += ` + Dex (max ${armorData.dexMax})`
  }
  return acString
}

// Group weapons by type
const groupWeaponsByType = (weaponList: typeof weapons) => {
  const grouped: Record<string, typeof weapons[string][]> = {
    'Simple Melee': [],
    'Martial Melee': [],
    'Simple Ranged': [],
    'Martial Ranged': []
  }
  
  Object.values(weaponList).forEach(weapon => {
    if (weapon.category === 'melee') {
      if (weapon.type === 'martial') {
        grouped['Martial Melee'].push(weapon)
      } else {
        grouped['Simple Melee'].push(weapon)
      }
    } else {
      if (weapon.type === 'martial') {
        grouped['Martial Ranged'].push(weapon)
      } else {
        grouped['Simple Ranged'].push(weapon)
      }
    }
  })
  
  return grouped
}

// Group armor by type
const groupArmorByType = (armorList: typeof armor) => {
  const grouped: Record<string, typeof armor[string][]> = {
    'Light Armor': [],
    'Medium Armor': [],
    'Heavy Armor': []
  }
  
  Object.values(armorList).forEach(armorItem => {
    if (armorItem.type === 'light') {
      grouped['Light Armor'].push(armorItem)
    } else if (armorItem.type === 'medium') {
      grouped['Medium Armor'].push(armorItem)
    } else if (armorItem.type === 'heavy') {
      grouped['Heavy Armor'].push(armorItem)
    }
  })
  
  return grouped
}

export function EquipmentSelection() {
  const {
    currentBuild,
    setMainHandWeapon,
    setArmor,
    toggleShield
  } = useCharacterBuilderStore()
  
  if (!currentBuild) {
    return <div className="text-center text-muted">Loading equipment options...</div>
  }
  
  const selectedWeapon = currentBuild.selectedMainHand ? weapons[currentBuild.selectedMainHand] : null
  const selectedArmor = currentBuild.selectedArmor ? armor[currentBuild.selectedArmor] : null
  
  const groupedWeapons = groupWeaponsByType(weapons)
  const groupedArmor = groupArmorByType(armor)
  
  // Calculate AC with current equipment
  const calculateAC = () => {
    let baseAC = 10
    const dexMod = Math.floor((currentBuild.abilityScores.DEX - 10) / 2)
    
    if (selectedArmor) {
      baseAC = selectedArmor.ac
      if (selectedArmor.dexModifier === 'full') {
        baseAC += dexMod
      } else if (selectedArmor.dexModifier === 'limited') {
        baseAC += Math.min(dexMod, selectedArmor.dexMax || 2)
      }
    } else {
      baseAC += dexMod // Unarmored
    }
    
    if (currentBuild.hasShield) {
      baseAC += 2
    }
    
    return baseAC
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-panel mb-2">Equipment Selection</h2>
        <p className="text-muted">
          Choose your weapon and armor. Your current AC is <span className="font-bold text-accent">{calculateAC()}</span>.
        </p>
      </div>
      
      {/* Single Equipment Tab */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weapon Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-panel flex items-center gap-2">
            <Sword className="w-5 h-5 text-accent" />
            Weapon
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="weapon-select">Select Weapon</Label>
            <Select 
              value={currentBuild.selectedMainHand || 'none'} 
              onValueChange={(value) => setMainHandWeapon(value === 'none' ? '' : value)}
            >
              <SelectTrigger id="weapon-select">
                <SelectValue placeholder="Choose a weapon..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No weapon</SelectItem>
                {Object.entries(groupedWeapons).map(([type, weaponList]) => (
                  weaponList.length > 0 && (
                    <div key={type}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted">{type}</div>
                      {weaponList.map(weapon => (
                        <SelectItem key={weapon.id} value={weapon.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{weapon.name}</span>
                            <span className="text-xs text-muted ml-2">
                              {formatWeaponDamage(weapon.damage)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  )
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedWeapon && (
            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="p-4 space-y-3">
                <div>
                  <div className="font-semibold text-panel">{selectedWeapon.name}</div>
                  <div className="text-sm text-muted mt-1">
                    {selectedWeapon.type === 'martial' ? 'Martial' : 'Simple'} {selectedWeapon.category} weapon
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs font-medium text-muted mb-1">Damage</div>
                    <Badge variant="outline" className="text-xs">
                      {formatWeaponDamage(selectedWeapon.damage)}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted mb-1">Range</div>
                    <Badge variant="secondary" className="text-xs">
                      {typeof selectedWeapon.range === 'object' 
                        ? `${selectedWeapon.range.normal}/${selectedWeapon.range.long}` 
                        : selectedWeapon.range || 'Melee'}
                    </Badge>
                  </div>
                </div>
                
                {selectedWeapon.properties.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted mb-1">Properties</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedWeapon.properties.map((prop, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {prop}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Armor & Shield Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-panel flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold" />
            Armor & Shield
          </h3>
          
          <div className="space-y-4">
            {/* Armor Selection */}
            <div className="space-y-2">
              <Label htmlFor="armor-select">Select Armor</Label>
              <Select 
                value={currentBuild.selectedArmor || 'none'} 
                onValueChange={(value) => setArmor(value === 'none' ? '' : value)}
              >
                <SelectTrigger id="armor-select">
                  <SelectValue placeholder="Choose armor..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No armor (unarmored)</SelectItem>
                  {Object.entries(groupedArmor).map(([type, armorList]) => (
                    armorList.length > 0 && (
                      <div key={type}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted">{type}</div>
                        {armorList.map(armorItem => (
                          <SelectItem key={armorItem.id} value={armorItem.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{armorItem.name}</span>
                              <span className="text-xs text-muted ml-2">
                                AC {formatArmorAC(armorItem)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Shield Toggle */}
            <div className="flex items-center justify-between p-3 border border-gold/20 rounded-lg">
              <div>
                <Label htmlFor="shield-toggle" className="text-sm font-medium">
                  Use Shield
                </Label>
                <div className="text-xs text-muted mt-1">
                  Adds +2 to AC when equipped
                </div>
              </div>
              <Switch
                id="shield-toggle"
                checked={currentBuild.hasShield}
                onCheckedChange={toggleShield}
              />
            </div>
            
            {/* AC Summary */}
            <Card className="border-emerald/20 bg-emerald/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald" />
                  AC Calculation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold text-emerald text-center mb-3">
                  AC: {calculateAC()}
                </div>
                
                <div className="space-y-1 text-xs">
                  {selectedArmor ? (
                    <>
                      <div className="flex justify-between">
                        <span>Base ({selectedArmor.name})</span>
                        <span className="font-medium">{selectedArmor.ac}</span>
                      </div>
                      {selectedArmor.dexModifier !== 'none' && (
                        <div className="flex justify-between">
                          <span>Dex Modifier</span>
                          <span className="font-medium">
                            {selectedArmor.dexModifier === 'limited' 
                              ? `+${Math.min(Math.floor((currentBuild.abilityScores.DEX - 10) / 2), selectedArmor.dexMax || 2)}`
                              : `+${Math.floor((currentBuild.abilityScores.DEX - 10) / 2)}`
                            }
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>Base (Unarmored)</span>
                        <span className="font-medium">10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dex Modifier</span>
                        <span className="font-medium">
                          +{Math.floor((currentBuild.abilityScores.DEX - 10) / 2)}
                        </span>
                      </div>
                    </>
                  )}
                  {currentBuild.hasShield && (
                    <div className="flex justify-between">
                      <span>Shield</span>
                      <span className="font-medium">+2</span>
                    </div>
                  )}
                  <div className="border-t pt-1 mt-1">
                    <div className="flex justify-between font-semibold">
                      <span>Total AC</span>
                      <span className="text-emerald">{calculateAC()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {selectedArmor && (
              <Card className="border-gold/20 bg-gold/5">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <div className="font-semibold text-panel">{selectedArmor.name}</div>
                    <div className="text-sm text-muted mt-1">
                      {selectedArmor.type.charAt(0).toUpperCase() + selectedArmor.type.slice(1)} armor
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs font-medium text-muted mb-1">Base AC</div>
                      <Badge variant="outline" className="text-xs">
                        {formatArmorAC(selectedArmor)}
                      </Badge>
                    </div>
                    {selectedArmor.strengthRequirement && (
                      <div>
                        <div className="text-xs font-medium text-muted mb-1">Str Required</div>
                        <Badge variant="secondary" className="text-xs">
                          {selectedArmor.strengthRequirement}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {selectedArmor.stealthDisadvantage && (
                    <div className="p-2 bg-danger/10 border border-danger/20 rounded">
                      <div className="text-xs text-danger font-medium">
                        Disadvantage on Stealth checks
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}