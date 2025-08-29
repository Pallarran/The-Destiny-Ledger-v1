import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useBuilderStore } from '@/stores/builderStore'
import { weaponsData } from '@/rules/data/weapons.json'
import type { WeaponDefinition, Equipment } from '@/rules/types'

export function EquipmentSelection() {
  const { currentBuild, updateBuild } = useBuilderStore()

  if (!currentBuild) return null

  const updateEquipment = (updates: Partial<Equipment>) => {
    updateBuild({
      equipment: { ...currentBuild.equipment, ...updates }
    })
  }

  const getWeaponById = (id: string): WeaponDefinition | undefined => {
    return weaponsData.find(w => w.id === id)
  }

  const canWieldTwoHanded = (weaponId: string): boolean => {
    const weapon = getWeaponById(weaponId)
    return weapon?.properties.includes('versatile') || weapon?.properties.includes('two-handed') || false
  }

  const isCompatibleOffhand = (mainHandId: string, offHandId: string): boolean => {
    const mainWeapon = getWeaponById(mainHandId)
    const offWeapon = getWeaponById(offHandId)
    
    if (!mainWeapon || !offWeapon) return false
    
    // Must have light property for TWF
    if (!offWeapon.properties.includes('light')) return false
    
    // Main hand must also be light or versatile
    return mainWeapon.properties.includes('light') || mainWeapon.properties.includes('versatile')
  }

  const meleeWeapons = weaponsData.filter(w => w.category === 'melee')
  const rangedWeapons = weaponsData.filter(w => w.category === 'ranged')
  const availableOffhands = weaponsData.filter(w => 
    currentBuild.equipment.mainHand && 
    isCompatibleOffhand(currentBuild.equipment.mainHand, w.id)
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Weapons</CardTitle>
          <CardDescription>
            Select your character's weapons for damage calculation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="mainhand" className="text-base font-medium">
              Main Hand Weapon
            </Label>
            <select
              id="mainhand"
              value={currentBuild.equipment.mainHand || ''}
              onChange={(e) => updateEquipment({ 
                mainHand: e.target.value || null,
                offHand: null // Reset off-hand when changing main hand
              })}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">No weapon selected</option>
              <optgroup label="Melee Weapons">
                {meleeWeapons.map(weapon => (
                  <option key={weapon.id} value={weapon.id}>
                    {weapon.name} ({weapon.damage.dice}d{weapon.damage.die} + {weapon.damage.type})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Ranged Weapons">
                {rangedWeapons.map(weapon => (
                  <option key={weapon.id} value={weapon.id}>
                    {weapon.name} ({weapon.damage.dice}d{weapon.damage.die} + {weapon.damage.type})
                  </option>
                ))}
              </optgroup>
            </select>

            {currentBuild.equipment.mainHand && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-1">
                  {getWeaponById(currentBuild.equipment.mainHand)?.properties.map(prop => (
                    <Badge key={prop} variant="secondary" className="text-xs">
                      {prop}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {currentBuild.equipment.mainHand && availableOffhands.length > 0 && (
            <div>
              <Label htmlFor="offhand" className="text-base font-medium">
                Off-Hand Weapon (Two-Weapon Fighting)
              </Label>
              <select
                id="offhand"
                value={currentBuild.equipment.offHand || ''}
                onChange={(e) => updateEquipment({ offHand: e.target.value || null })}
                className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">No off-hand weapon</option>
                {availableOffhands.map(weapon => (
                  <option key={weapon.id} value={weapon.id}>
                    {weapon.name} ({weapon.damage.dice}d{weapon.damage.die} + {weapon.damage.type})
                  </option>
                ))}
              </select>

              {currentBuild.equipment.offHand && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {getWeaponById(currentBuild.equipment.offHand)?.properties.map(prop => (
                      <Badge key={prop} variant="secondary" className="text-xs">
                        {prop}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Defensive Equipment</CardTitle>
          <CardDescription>
            Configure armor and shields (affects AC calculations)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="armor" className="text-base font-medium">
              Armor Type
            </Label>
            <select
              id="armor"
              value={currentBuild.equipment.armor || ''}
              onChange={(e) => updateEquipment({ armor: e.target.value || null })}
              className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="">No armor</option>
              <option value="leather">Leather Armor (11 + Dex)</option>
              <option value="studded">Studded Leather (12 + Dex)</option>
              <option value="chain-shirt">Chain Shirt (13 + Dex, max 2)</option>
              <option value="scale-mail">Scale Mail (14 + Dex, max 2)</option>
              <option value="chain-mail">Chain Mail (16)</option>
              <option value="splint">Splint Armor (17)</option>
              <option value="plate">Plate Armor (18)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="shield"
              checked={currentBuild.equipment.shield}
              onCheckedChange={(checked) => updateEquipment({ shield: checked })}
            />
            <Label htmlFor="shield">Using Shield (+2 AC)</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Other Equipment</CardTitle>
          <CardDescription>
            Additional magical items or equipment (for future expansion)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-muted p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Magical items and other equipment will be added in a future update
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function BuffSelection() {
  const { currentBuild, updateBuild } = useBuilderStore()

  if (!currentBuild) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Buffs & Conditions</CardTitle>
        <CardDescription>
          Configure temporary bonuses and conditions affecting your character
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-dashed border-muted p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Buff selection interface will be implemented in the next phase
          </p>
        </div>
      </CardContent>
    </Card>
  )
}