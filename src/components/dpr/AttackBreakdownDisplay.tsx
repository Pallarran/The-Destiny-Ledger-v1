import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Target, Plus, Minus } from 'lucide-react'
import { weapons } from '../../rules/srd/weapons'
import type { BuildConfiguration } from '../../stores/types'

interface AttackBreakdownDisplayProps {
  build: BuildConfiguration | null
}

interface AttackBreakdown {
  abilityModifier: number
  abilityType: 'STR' | 'DEX'
  proficiencyBonus: number
  fightingStyleBonus: number
  weaponEnhancement: number
  miscBonuses: number
  totalBonus: number
  attacksPerRound: number
}

function getAttackBreakdown(build: BuildConfiguration): AttackBreakdown | null {
  if (!build) return null

  const weaponId = build.rangedWeapon || build.mainHandWeapon
  if (!weaponId) return null

  const weapon = weapons[weaponId]
  if (!weapon) return null

  // Calculate level and proficiency
  const level = Math.max(...(build.levelTimeline?.map(l => l.level) || [1]), 1)
  const proficiencyBonus = Math.ceil(level / 4) + 1

  // Calculate ability modifier
  const strMod = Math.floor((build.abilityScores.STR - 10) / 2)
  const dexMod = Math.floor((build.abilityScores.DEX - 10) / 2)
  
  let abilityModifier = strMod
  let abilityType: 'STR' | 'DEX' = 'STR'

  if (weapon.properties.includes('finesse')) {
    if (dexMod > strMod) {
      abilityModifier = dexMod
      abilityType = 'DEX'
    }
  } else if (weapon.category === 'ranged') {
    abilityModifier = dexMod
    abilityType = 'DEX'
  }

  // Fighting style bonuses
  let fightingStyleBonus = 0
  const fighterLevels = (build.levelTimeline || []).filter(entry => entry.classId === 'fighter').length
  
  if (fighterLevels >= 1) {
    // Archery fighting style for ranged weapons
    if (weapon.category === 'ranged') {
      fightingStyleBonus = 2
    }
    // Note: Dueling would be +0 to hit, +2 to damage
  }

  // Calculate attacks per round based on level and class
  let attacksPerRound = 1
  
  // Extra Attack feature
  if (fighterLevels >= 5) {
    attacksPerRound = 2
  }
  if (fighterLevels >= 11) {
    attacksPerRound = 3
  }
  if (fighterLevels >= 20) {
    attacksPerRound = 4
  }

  // Check for other classes with extra attack
  const rangerLevels = (build.levelTimeline || []).filter(entry => entry.classId === 'ranger').length
  const paladinLevels = (build.levelTimeline || []).filter(entry => entry.classId === 'paladin').length
  const barbarianLevels = (build.levelTimeline || []).filter(entry => entry.classId === 'barbarian').length

  if ((rangerLevels >= 5 || paladinLevels >= 5 || barbarianLevels >= 5) && attacksPerRound === 1) {
    attacksPerRound = 2
  }

  // Weapon enhancement (assume +0 for now, could be extracted from build data)
  const weaponEnhancement = 0

  // Misc bonuses (could include buffs, magic items, etc.)
  const miscBonuses = 0

  const totalBonus = abilityModifier + proficiencyBonus + fightingStyleBonus + weaponEnhancement + miscBonuses

  return {
    abilityModifier,
    abilityType,
    proficiencyBonus,
    fightingStyleBonus,
    weaponEnhancement,
    miscBonuses,
    totalBonus,
    attacksPerRound
  }
}

export function AttackBreakdownDisplay({ build }: AttackBreakdownDisplayProps) {
  if (!build) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Attack Breakdown
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

  const breakdown = getAttackBreakdown(build)

  if (!breakdown) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Attack Breakdown
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

  const bonusComponents = [
    { label: `${breakdown.abilityType} Modifier`, value: breakdown.abilityModifier, color: 'text-blue-600' },
    { label: 'Proficiency', value: breakdown.proficiencyBonus, color: 'text-emerald-600' },
    ...(breakdown.fightingStyleBonus > 0 ? [{ label: 'Fighting Style', value: breakdown.fightingStyleBonus, color: 'text-purple-600' }] : []),
    ...(breakdown.weaponEnhancement > 0 ? [{ label: 'Enhancement', value: breakdown.weaponEnhancement, color: 'text-yellow-600' }] : []),
    ...(breakdown.miscBonuses !== 0 ? [{ label: 'Miscellaneous', value: breakdown.miscBonuses, color: breakdown.miscBonuses > 0 ? 'text-green-600' : 'text-red-600' }] : [])
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Attack Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Attack Bonus */}
        <div className="text-center p-4 bg-accent/10 rounded-lg border border-accent/20">
          <div className="text-3xl font-bold text-accent">
            {breakdown.totalBonus >= 0 ? '+' : ''}{breakdown.totalBonus}
          </div>
          <div className="text-sm text-muted">Total Attack Bonus</div>
        </div>

        {/* Breakdown Components */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Breakdown</h4>
          
          {bonusComponents.map((component, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-sm text-foreground">{component.label}</span>
              <div className="flex items-center gap-1">
                {component.value > 0 ? (
                  <Plus className="w-3 h-3 text-green-600" />
                ) : component.value < 0 ? (
                  <Minus className="w-3 h-3 text-red-600" />
                ) : null}
                <span className={`font-medium ${component.color}`}>
                  {component.value >= 0 ? '+' : ''}{component.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Stats */}
        <div className="pt-3 border-t border-border/20">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted">Attacks per Round</div>
              <div className="font-medium text-accent">
                {breakdown.attacksPerRound}
              </div>
            </div>
            <div>
              <div className="text-muted">Attack Roll</div>
              <div className="font-medium">
                1d20{breakdown.totalBonus >= 0 ? '+' : ''}{breakdown.totalBonus}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}