import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { DeltaPill } from '../ui/delta-pill'
import { ContextualReveal } from '../ui/contextual-reveal'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { useDPRDelta } from '../../hooks/useDPRDelta'
import { useDPRStore } from '../../stores/dprStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useContextualFields } from '../../hooks/useContextualFields'
import { Sword, Shield, Info, Target, Crown } from 'lucide-react'
import { weapons } from '../../rules/srd/weapons'
import { armor } from '../../rules/srd/armor'
import { useEffect } from 'react'

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
    toggleShield,
    setWeaponEnhancementBonus,
    setArmorEnhancementBonus
  } = useCharacterBuilderStore()
  
  // Delta calculation hooks
  const { calculateDelta, getDelta } = useDPRDelta()
  const { currentConfig } = useDPRStore()
  const { greedyResourceUse: defaultGreedy, autoCalculateGWMSS: defaultAutoGWMSS } = useSettingsStore()
  
  // Contextual field visibility
  const contextualFields = useContextualFields(currentBuild)
  
  const shieldDeltaId = 'shield-toggle'
  const shieldDelta = getDelta(shieldDeltaId)
  
  // Calculate shield delta when build changes
  useEffect(() => {
    if (!currentBuild || !currentConfig) return
    
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
    
    // Create modified build with shield toggled
    const modifiedBuild = {
      ...currentBuild,
      hasShield: !currentBuild.hasShield
    }
    
    // Calculate delta at AC 16 (typical target)
    calculateDelta(shieldDeltaId, currentBuild, modifiedBuild, baseConfig, 16)
  }, [currentBuild?.id, currentBuild?.hasShield, calculateDelta, shieldDeltaId, currentConfig, defaultGreedy, defaultAutoGWMSS])
  
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
    
    // Add armor enhancement bonus
    if (selectedArmor && currentBuild.armorEnhancementBonus > 0) {
      baseAC += currentBuild.armorEnhancementBonus
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
          
          {/* Weapon Enhancement Bonus */}
          {currentBuild.selectedMainHand && (
            <div className="space-y-2">
              <Label className="text-sm">Magic Enhancement</Label>
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((bonus) => (
                  <button
                    key={bonus}
                    onClick={() => setWeaponEnhancementBonus(bonus)}
                    className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                      currentBuild.weaponEnhancementBonus === bonus
                        ? 'bg-accent text-white border-accent'
                        : 'bg-background text-foreground border-border hover:border-accent'
                    }`}
                  >
                    {bonus === 0 ? 'None' : `+${bonus}`}
                  </button>
                ))}
              </div>
              {currentBuild.weaponEnhancementBonus > 0 && (
                <div className="text-xs text-muted">
                  +{currentBuild.weaponEnhancementBonus} to attack and damage rolls
                </div>
              )}
            </div>
          )}
          
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
            
            {/* Armor Enhancement Bonus */}
            {currentBuild.selectedArmor && (
              <div className="space-y-2">
                <Label className="text-sm">Magic Enhancement</Label>
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((bonus) => (
                    <button
                      key={bonus}
                      onClick={() => setArmorEnhancementBonus(bonus)}
                      className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                        currentBuild.armorEnhancementBonus === bonus
                          ? 'bg-emerald text-white border-emerald'
                          : 'bg-background text-foreground border-border hover:border-emerald'
                      }`}
                    >
                      {bonus === 0 ? 'None' : `+${bonus}`}
                    </button>
                  ))}
                </div>
                {currentBuild.armorEnhancementBonus > 0 && (
                  <div className="text-xs text-muted">
                    +{currentBuild.armorEnhancementBonus} to AC
                  </div>
                )}
              </div>
            )}
            
            {/* Shield Toggle */}
            <div className="flex items-center justify-between p-3 border border-gold/20 rounded-lg">
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="shield-toggle" className="text-sm font-medium">
                    Use Shield
                  </Label>
                  {shieldDelta && !shieldDelta.isCalculating && (
                    <DeltaPill value={currentBuild.hasShield ? -shieldDelta.value : shieldDelta.value} />
                  )}
                </div>
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
                  {selectedArmor && currentBuild.armorEnhancementBonus > 0 && (
                    <div className="flex justify-between">
                      <span>Enhancement</span>
                      <span className="font-medium text-accent">+{currentBuild.armorEnhancementBonus}</span>
                    </div>
                  )}
                  <div className="border-t pt-1 mt-1">
                    <div className="flex justify-between font-semibold">
                      <span>Total AC</span>
                      <span className="text-emerald">{calculateAC()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Show armor requirements and penalties */}
                {selectedArmor && (
                  <div className="mt-2 pt-2 border-t border-emerald/20">
                    {selectedArmor.strengthRequirement && (
                      <div className="text-xs text-amber-600">
                        Requires Strength {selectedArmor.strengthRequirement}
                      </div>
                    )}
                    {selectedArmor.stealthDisadvantage && (
                      <div className="text-xs text-danger">
                        Disadvantage on Stealth checks
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Contextual Feat Recommendations */}
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-panel">Recommended Feats</h3>
          <p className="text-sm text-muted-foreground">
            Based on your weapon choices, these feats would synergize well with your build
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ContextualReveal
              show={contextualFields.showGWMFeats}
              title="Great Weapon Master"
              description="Perfect for heavy weapons like greatswords"
            >
              <Card className="border-red-500/20 bg-red-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sword className="w-4 h-4 text-red-600" />
                    <span className="font-medium">Great Weapon Master</span>
                    <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600">
                      Heavy Weapons
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    -5 attack for +10 damage with heavy weapons. Works great with your current weapon choice.
                  </p>
                </CardContent>
              </Card>
            </ContextualReveal>
            
            <ContextualReveal
              show={contextualFields.showSharpshooterFeats}
              title="Sharpshooter"
              description="Essential for ranged weapon builds"
            >
              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Sharpshooter</span>
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600">
                      Ranged Weapons
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    -5 attack for +10 damage with ranged weapons. Ignore cover and long range penalties.
                  </p>
                </CardContent>
              </Card>
            </ContextualReveal>
            
            <ContextualReveal
              show={contextualFields.showPolearmMasterFeats}
              title="Polearm Master"
              description="Excellent with reach weapons"
            >
              <Card className="border-purple-500/20 bg-purple-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">Polearm Master</span>
                    <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600">
                      Polearms
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Bonus action attack and opportunity attacks when enemies enter reach.
                  </p>
                </CardContent>
              </Card>
            </ContextualReveal>
            
            <ContextualReveal
              show={contextualFields.showCrossbowExpertFeats}
              title="Crossbow Expert"
              description="Specialized for crossbow users"
            >
              <Card className="border-blue-500/20 bg-blue-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Crossbow Expert</span>
                    <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600">
                      Crossbows
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ignore loading property, no disadvantage at close range, bonus action hand crossbow attack.
                  </p>
                </CardContent>
              </Card>
            </ContextualReveal>
          </div>
          
          {!(contextualFields.showGWMFeats || contextualFields.showSharpshooterFeats || contextualFields.showPolearmMasterFeats || contextualFields.showCrossbowExpertFeats) && (
            <div className="text-center py-6 text-muted-foreground">
              <Info className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select weapons to see feat recommendations</p>
              <p className="text-xs">Feat suggestions will appear based on weapon properties and synergies</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  )
}