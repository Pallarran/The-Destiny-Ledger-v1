import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Sword, Target } from 'lucide-react'
import { weapons } from '../../rules/srd/weapons'
import type { BuildConfiguration } from '../../stores/types'

interface WeaponInfoPanelProps {
  build: BuildConfiguration | null
}

interface WeaponInfo {
  id: string
  name: string
  damage: string
  properties: string[]
  category: 'melee' | 'ranged'
  abilityUsed: 'STR' | 'DEX'
  abilityModifier: number
}

function getWeaponInfo(build: BuildConfiguration): WeaponInfo | null {
  const weaponId = build.rangedWeapon || build.mainHandWeapon
  if (!weaponId) return null

  const weapon = weapons[weaponId]
  if (!weapon) return null

  // Calculate ability modifier used
  const strMod = Math.floor((build.abilityScores.STR - 10) / 2)
  const dexMod = Math.floor((build.abilityScores.DEX - 10) / 2)
  
  let abilityUsed: 'STR' | 'DEX' = 'STR'
  let abilityModifier = strMod

  if (weapon.properties.includes('finesse')) {
    // Finesse weapons use higher of STR or DEX
    if (dexMod > strMod) {
      abilityUsed = 'DEX'
      abilityModifier = dexMod
    }
  } else if (weapon.category === 'ranged') {
    // Ranged weapons use DEX
    abilityUsed = 'DEX'
    abilityModifier = dexMod
  }

  // Format damage string
  const damageRoll = weapon.damage[0]
  const damageString = `${damageRoll.count}d${damageRoll.die}${abilityModifier >= 0 ? '+' : ''}${abilityModifier}`

  return {
    id: weapon.id,
    name: weapon.name,
    damage: damageString,
    properties: weapon.properties,
    category: weapon.category,
    abilityUsed,
    abilityModifier
  }
}

function getDamageTypeColor(properties: string[]): string {
  // Simple heuristic based on weapon properties
  if (properties.includes('ammunition')) return 'text-yellow-600'
  if (properties.includes('finesse')) return 'text-purple-600'
  if (properties.includes('heavy')) return 'text-red-600'
  return 'text-blue-600'
}

export function WeaponInfoPanel({ build }: WeaponInfoPanelProps) {
  if (!build) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sword className="w-5 h-5" />
            Weapon Information
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

  const weaponInfo = getWeaponInfo(build)

  if (!weaponInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sword className="w-5 h-5" />
            Weapon Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted py-4">
            No weapon equipped
          </div>
        </CardContent>
      </Card>
    )
  }

  const Icon = weaponInfo.category === 'ranged' ? Target : Sword

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          Weapon Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weapon Name and Damage */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{weaponInfo.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Badge variant="outline" className="capitalize">
                {weaponInfo.category}
              </Badge>
              <span>•</span>
              <span className="capitalize">{weaponInfo.category} weapon</span>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getDamageTypeColor(weaponInfo.properties)}`}>
              {weaponInfo.damage}
            </div>
            <div className="text-xs text-muted">
              {weaponInfo.abilityUsed} modifier
            </div>
          </div>
        </div>

        {/* Weapon Properties */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Properties</h4>
          <div className="flex flex-wrap gap-1">
            {weaponInfo.properties.length > 0 ? (
              weaponInfo.properties.map((property) => (
                <Badge key={property} variant="secondary" className="text-xs capitalize">
                  {property}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted">No special properties</span>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted">Attack Ability</div>
            <div className="font-medium">
              {weaponInfo.abilityUsed} ({weaponInfo.abilityModifier >= 0 ? '+' : ''}{weaponInfo.abilityModifier})
            </div>
          </div>
          <div>
            <div className="text-muted">Damage Die</div>
            <div className="font-medium">
              {weapons[weaponInfo.id].damage[0].count}d{weapons[weaponInfo.id].damage[0].die}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}