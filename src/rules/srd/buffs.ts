import type { Buff } from '../types'

export const buffs: Record<string, Buff> = {
  // 1st Level Spells
  bless: {
    id: 'bless',
    name: 'Bless',
    description: 'You bless up to three creatures of your choice within range. Whenever a target makes an attack roll or a saving throw before the spell ends, the target can roll a d4 and add the number rolled to the attack roll or saving throw.',
    concentration: true,
    duration: '1 minute',
    actionCost: 'action',
    allowedRound0: true,
    effects: {
      attackBonus: 2.5 // Average of d4
    }
  },
  hunters_mark: {
    id: 'hunters_mark',
    name: "Hunter's Mark",
    description: 'You choose a creature you can see within range and mystically mark it as your quarry. Until the spell ends, you deal an extra 1d6 damage to the target whenever you hit it with a weapon attack.',
    concentration: true,
    duration: '1 hour',
    actionCost: 'bonus',
    allowedRound0: true,
    effects: {
      onHitDamage: [{
        count: 1,
        die: 6,
        bonus: 0,
        type: 'force' // Magical damage
      }]
    }
  },
  hex: {
    id: 'hex',
    name: 'Hex',
    description: 'You place a curse on a creature that you can see within range. Until the spell ends, you deal an extra 1d6 necrotic damage to the target whenever you hit it with an attack.',
    concentration: true,
    duration: '1 hour',
    actionCost: 'bonus',
    allowedRound0: true,
    effects: {
      onHitDamage: [{
        count: 1,
        die: 6,
        bonus: 0,
        type: 'necrotic'
      }]
    }
  },
  divine_favor: {
    id: 'divine_favor',
    name: 'Divine Favor',
    description: 'Your prayer empowers you with divine radiance. Until the spell ends, your weapon attacks deal an extra 1d4 radiant damage on a hit.',
    concentration: true,
    duration: '1 minute',
    actionCost: 'bonus',
    allowedRound0: true,
    effects: {
      onHitDamage: [{
        count: 1,
        die: 4,
        bonus: 0,
        type: 'radiant'
      }]
    }
  },

  // 2nd Level Spells
  magic_weapon: {
    id: 'magic_weapon',
    name: 'Magic Weapon',
    description: 'You touch a nonmagical weapon. Until the spell ends, that weapon becomes a magic weapon with a +1 bonus to attack rolls and damage rolls.',
    concentration: true,
    duration: '1 hour',
    actionCost: 'bonus',
    allowedRound0: true,
    effects: {
      attackBonus: 1,
      damageBonus: 1
    }
  },

  // 3rd Level Spells
  haste: {
    id: 'haste',
    name: 'Haste',
    description: 'Choose a willing creature that you can see within range. Until the spell ends, the target\'s speed is doubled, it gains a +2 bonus to AC, it has advantage on Dexterity saving throws, and it gains an additional action on each of its turns.',
    concentration: true,
    duration: '1 minute',
    actionCost: 'action',
    allowedRound0: true,
    effects: {
      additionalAttacks: 1, // One extra weapon attack
      advantage: false // AC bonus handled separately
    }
  },
  elemental_weapon: {
    id: 'elemental_weapon',
    name: 'Elemental Weapon',
    description: 'A nonmagical weapon you touch becomes a magic weapon. Choose one of the following damage types: acid, cold, fire, lightning, or thunder. For the duration, the weapon has a +1 bonus to attack rolls and deals an extra 1d4 damage of the chosen type when it hits.',
    concentration: true,
    duration: '1 hour',
    actionCost: 'action',
    allowedRound0: true,
    effects: {
      attackBonus: 1,
      onHitDamage: [{
        count: 1,
        die: 4,
        bonus: 0,
        type: 'fire' // Default to fire, could be configurable
      }]
    }
  },

  // 4th Level Spells
  greater_invisibility: {
    id: 'greater_invisibility',
    name: 'Greater Invisibility',
    description: 'You or a creature you touch becomes invisible until the spell ends. Anything the target is wearing or carrying is invisible as long as it is on the target\'s person.',
    concentration: true,
    duration: '1 minute',
    actionCost: 'action',
    allowedRound0: true,
    effects: {
      advantage: true // Attacks from invisibility have advantage
    }
  },

  // Non-concentration buffs
  true_strike: {
    id: 'true_strike',
    name: 'True Strike',
    description: 'You extend your hand and point a finger at a target in range. Your magic grants you a brief insight into the target\'s defenses. On your next turn, you gain advantage on your first attack roll against the target.',
    concentration: false,
    duration: '1 round',
    actionCost: 'action',
    allowedRound0: false,
    effects: {
      advantage: true
    }
  },
  barbarian_rage: {
    id: 'barbarian_rage',
    name: 'Rage',
    description: 'In battle, you fight with primal ferocity. On your turn, you can enter a rage as a bonus action. While raging, you gain advantage on Strength checks and Strength saving throws, +2 damage to melee weapon attacks using Strength, and resistance to bludgeoning, piercing, and slashing damage.',
    concentration: false,
    duration: '1 minute',
    actionCost: 'bonus',
    allowedRound0: false,
    effects: {
      damageBonus: 2 // +2 to Strength-based melee damage
    }
  },
  fighting_spirit: {
    id: 'fighting_spirit',
    name: 'Fighting Spirit',
    description: 'As a bonus action on your turn, you can give yourself advantage on weapon attack rolls until the end of the current turn. When you do so, you also gain 5 temporary hit points.',
    concentration: false,
    duration: '1 round',
    actionCost: 'bonus',
    allowedRound0: false,
    effects: {
      advantage: true
    }
  },
  action_surge: {
    id: 'action_surge',
    name: 'Action Surge',
    description: 'On your turn, you can take one additional action on top of your regular action and a possible bonus action.',
    concentration: false,
    duration: 'instantaneous',
    actionCost: 'free',
    allowedRound0: false,
    effects: {
      additionalAttacks: 1 // Represents extra action for attacks
    }
  }
}