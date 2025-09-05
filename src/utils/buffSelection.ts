import { buffs } from '../rules/srd/buffs'
import type { BuildConfiguration } from '../stores/types'
import type { Buff } from '../rules/types'
import { getClass } from '../rules/loaders'

interface BuffPriority {
  buffId: string
  priority: number
  buff: Buff
}

// Priority scores for different buff types based on DPR impact
const BUFF_PRIORITIES: Record<string, number> = {
  // High priority - direct damage increases
  'haste': 100,              // Extra attack is huge for DPR
  'hunters_mark': 90,        // 1d6 per hit
  'hex': 89,                 // 1d6 per hit (slightly lower than hunter's mark)
  'divine_favor': 85,        // 1d4 per hit
  'holy_weapon': 95,         // 2d8 per hit (5th level)
  
  // Medium priority - attack/damage bonuses
  'bless': 70,               // +2.5 to attack rolls
  'magic_weapon': 75,        // +1 attack and damage
  'elemental_weapon': 80,    // +1 to +3 attack and damage
  'greater_magic_weapon': 82, // +2 or +3 attack and damage
  
  // Lower priority - situational
  'enlarge_reduce': 60,      // +1d4 damage but size changes
  'flame_arrows': 65,        // Only for ranged attacks
  'crusaders_mantle': 55,    // Area effect, not self-only
  
  // Defensive (lower priority for DPR)
  'shield_of_faith': 30,     // AC only
  'blur': 35,                // Defensive only
  'mirror_image': 40,        // Defensive only
}

/**
 * Get available spells for a build based on class levels and spell lists
 */
function getAvailableSpells(build: BuildConfiguration): Set<string> {
  const availableSpells = new Set<string>()
  
  if (!build.levelTimeline) return availableSpells
  
  // Track class levels
  const classLevels: Record<string, number> = {}
  for (const level of build.levelTimeline) {
    classLevels[level.classId] = (classLevels[level.classId] || 0) + 1
  }
  
  // Check each class for spell access
  for (const [classId, levels] of Object.entries(classLevels)) {
    const classData = getClass(classId)
    if (!classData) continue
    
    // Classes with spell access and their associated buffs
    const spellAccessByClass: Record<string, { minLevel: number, spells: string[] }[]> = {
      'cleric': [
        { minLevel: 1, spells: ['bless', 'divine_favor', 'shield_of_faith'] },
        { minLevel: 3, spells: ['magic_weapon'] },
        { minLevel: 5, spells: ['crusaders_mantle'] },
        { minLevel: 9, spells: ['holy_weapon'] }
      ],
      'paladin': [
        { minLevel: 2, spells: ['bless', 'divine_favor'] },
        { minLevel: 5, spells: ['magic_weapon'] },
        { minLevel: 9, spells: ['crusaders_mantle'] },
        { minLevel: 17, spells: ['holy_weapon'] }
      ],
      'ranger': [
        { minLevel: 2, spells: ['hunters_mark'] },
        { minLevel: 5, spells: ['magic_weapon'] },
        { minLevel: 9, spells: ['flame_arrows'] },
        { minLevel: 13, spells: ['greater_magic_weapon'] }
      ],
      'warlock': [
        { minLevel: 1, spells: ['hex'] },
        { minLevel: 3, spells: ['blur', 'mirror_image'] },
        { minLevel: 5, spells: ['elemental_weapon'] }
      ],
      'wizard': [
        { minLevel: 1, spells: ['magic_weapon'] },
        { minLevel: 3, spells: ['blur', 'enlarge_reduce', 'mirror_image'] },
        { minLevel: 5, spells: ['haste', 'elemental_weapon', 'flame_arrows'] },
        { minLevel: 7, spells: ['greater_magic_weapon'] }
      ],
      'sorcerer': [
        { minLevel: 1, spells: ['magic_weapon'] },
        { minLevel: 3, spells: ['blur', 'enlarge_reduce', 'mirror_image'] },
        { minLevel: 5, spells: ['haste', 'elemental_weapon', 'flame_arrows'] },
        { minLevel: 7, spells: ['greater_magic_weapon'] }
      ],
      'bard': [
        { minLevel: 3, spells: ['blur', 'enlarge_reduce', 'mirror_image'] },
        { minLevel: 5, spells: ['haste'] },
        { minLevel: 7, spells: ['greater_magic_weapon'] }
      ],
      'artificer': [
        { minLevel: 1, spells: ['bless'] },
        { minLevel: 5, spells: ['magic_weapon', 'blur', 'enlarge_reduce'] },
        { minLevel: 9, spells: ['haste', 'elemental_weapon'] }
      ],
      // Subclass-specific (Eldritch Knight)
      'fighter': [
        { minLevel: 3, spells: ['shield_of_faith'] }, // EK gets wizard spells
        { minLevel: 7, spells: ['blur', 'enlarge_reduce', 'magic_weapon'] },
        { minLevel: 13, spells: ['haste', 'elemental_weapon'] },
        { minLevel: 19, spells: ['greater_magic_weapon'] }
      ],
      // Arcane Trickster
      'rogue': [
        { minLevel: 3, spells: ['blur'] },
        { minLevel: 7, spells: ['mirror_image'] },
        { minLevel: 13, spells: ['haste'] }
      ]
    }
    
    const classSpells = spellAccessByClass[classId]
    if (classSpells) {
      for (const { minLevel, spells } of classSpells) {
        if (levels >= minLevel) {
          spells.forEach(spell => availableSpells.add(spell))
        }
      }
    }
  }
  
  // Add spells from feats
  if (build.levelTimeline.some(l => l.featId === 'fey_touched')) {
    availableSpells.add('bless')
    availableSpells.add('hex')
  }
  
  if (build.levelTimeline.some(l => l.featId === 'shadow_touched')) {
    availableSpells.add('hex')
  }
  
  if (build.levelTimeline.some(l => l.featId === 'magic_initiate')) {
    // Could be any 1st level spell - add common ones
    availableSpells.add('bless')
    availableSpells.add('hex')
    availableSpells.add('hunters_mark')
  }
  
  return availableSpells
}

/**
 * Automatically select the best buffs for a build
 * @param build The build configuration
 * @param respectConcentration If true, only select one concentration spell
 * @returns Array of buff IDs to apply
 */
export function autoSelectOptimalBuffs(
  build: BuildConfiguration,
  respectConcentration: boolean = true
): { activeBuffs: string[], round0Buffs: string[] } {
  const availableSpells = getAvailableSpells(build)
  
  // Get all available buffs with their priorities
  const availableBuffs: BuffPriority[] = []
  
  for (const spellId of availableSpells) {
    const buff = buffs[spellId]
    if (buff) {
      availableBuffs.push({
        buffId: spellId,
        priority: BUFF_PRIORITIES[spellId] || 50,
        buff
      })
    }
  }
  
  // Sort by priority (highest first)
  availableBuffs.sort((a, b) => b.priority - a.priority)
  
  const selectedActiveBuffs: string[] = []
  const selectedRound0Buffs: string[] = []
  let hasConcentration = false
  
  for (const { buffId, buff } of availableBuffs) {
    // Skip if this is a concentration spell and we already have one
    if (respectConcentration && buff.concentration && hasConcentration) {
      continue
    }
    
    // Add the buff
    if (buff.allowedRound0 && buff.actionCost !== 'action') {
      // Prefer round 0 for bonus action buffs
      selectedRound0Buffs.push(buffId)
    } else {
      selectedActiveBuffs.push(buffId)
    }
    
    if (buff.concentration) {
      hasConcentration = true
    }
    
    // Limit total buffs to avoid complexity
    if (selectedActiveBuffs.length + selectedRound0Buffs.length >= 3) {
      break
    }
  }
  
  return {
    activeBuffs: selectedActiveBuffs,
    round0Buffs: selectedRound0Buffs
  }
}

/**
 * Get a description of why certain buffs were selected
 */
export function explainBuffSelection(
  build: BuildConfiguration,
  selectedBuffs: { activeBuffs: string[], round0Buffs: string[] }
): string {
  const explanations: string[] = []
  const allBuffs = [...selectedBuffs.activeBuffs, ...selectedBuffs.round0Buffs]
  
  for (const buffId of allBuffs) {
    const buff = buffs[buffId]
    if (buff) {
      let reason = `${buff.name}: `
      
      if (buff.effects.additionalAttacks) {
        reason += `+${buff.effects.additionalAttacks} attack${buff.effects.additionalAttacks > 1 ? 's' : ''}`
      } else if (buff.effects.onHitDamage && buff.effects.onHitDamage.length > 0) {
        const damage = buff.effects.onHitDamage[0]
        reason += `+${damage.count}d${damage.die} damage per hit`
      } else if (buff.effects.attackBonus) {
        reason += `+${buff.effects.attackBonus} to attack rolls`
      } else if (buff.effects.damageBonus) {
        reason += `+${buff.effects.damageBonus} to damage`
      }
      
      if (buff.concentration) {
        reason += ' (concentration)'
      }
      
      explanations.push(reason)
    }
  }
  
  return explanations.join(', ')
}