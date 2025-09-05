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
 * Get available spells for a build based on actually selected spells
 */
function getAvailableSpells(build: BuildConfiguration): Set<string> {
  const availableSpells = new Set<string>()
  
  // First check if build has canonical spell list
  if (build.canonicalBuild?.spells) {
    for (const spellEntry of build.canonicalBuild.spells) {
      // Only include spells that are known or prepared
      if (spellEntry.known || spellEntry.prepared) {
        availableSpells.add(spellEntry.spell)
      }
    }
  }
  
  // Also check spellChoices in levelTimeline
  if (build.levelTimeline) {
    for (const level of build.levelTimeline) {
      if (level.spellChoices) {
        for (const spellId of level.spellChoices) {
          availableSpells.add(spellId)
        }
      }
    }
  }
  
  // Add spells from feats that grant specific spells
  if (build.levelTimeline) {
    for (const level of build.levelTimeline) {
      // Fey Touched grants Misty Step + 1st level enchantment/divination
      if (level.featId === 'fey_touched') {
        // Common choices for Fey Touched
        availableSpells.add('bless') // Common divination choice
        availableSpells.add('hex') // Common enchantment choice
      }
      
      // Shadow Touched grants Invisibility + 1st level illusion/necromancy
      if (level.featId === 'shadow_touched') {
        availableSpells.add('hex') // Necromancy spell
      }
      
      // Magic Initiate - check if they selected specific spells
      // Without more info, we can't assume which spells they took
    }
  }
  
  // If no spells are explicitly selected but the build has spellcasting classes,
  // we can make educated guesses about common buff spells they might have
  // but ONLY if we have no other spell data
  if (availableSpells.size === 0 && build.levelTimeline) {
    const classLevels: Record<string, number> = {}
    for (const level of build.levelTimeline) {
      classLevels[level.classId] = (classLevels[level.classId] || 0) + 1
    }
    
    // Only add the most common/obvious choices for each class
    // These are spells that are almost always taken
    const commonSpellsByClass: Record<string, { minLevel: number, spell: string }[]> = {
      'ranger': [
        { minLevel: 2, spell: 'hunters_mark' } // Almost every ranger takes this
      ],
      'warlock': [
        { minLevel: 1, spell: 'hex' } // Almost every warlock takes this
      ],
      'paladin': [
        { minLevel: 2, spell: 'bless' } // Very common paladin spell
      ],
      'cleric': [
        { minLevel: 1, spell: 'bless' } // Core cleric spell
      ]
    }
    
    for (const [classId, levels] of Object.entries(classLevels)) {
      const commonSpells = commonSpellsByClass[classId]
      if (commonSpells) {
        for (const { minLevel, spell } of commonSpells) {
          if (levels >= minLevel) {
            console.log(`No spell list found - assuming ${classId} has ${spell}`)
            availableSpells.add(spell)
          }
        }
      }
    }
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