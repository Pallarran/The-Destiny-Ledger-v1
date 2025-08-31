import type { CharacterBuild } from './types'

/**
 * Calculate the maximum number of attunement slots for a character
 * Base: 3 slots
 * Artificer increases: 4 at level 10, 5 at level 14, 6 at level 18
 */
export function calculateMaxAttunementSlots(build: CharacterBuild): number {
  let maxSlots = 3 // Base attunement slots for all characters

  // Check for Artificer levels and their attunement bonuses
  // Try different possible level timeline properties
  const levelTimeline = build.levels || (build as any).levelTimeline || (build as any).enhancedLevelTimeline || []
  const artificerLevels = levelTimeline
    .filter((level: any) => level.classId === 'artificer')
    .length

  if (artificerLevels >= 18) {
    maxSlots = 6 // Magic Item Master
  } else if (artificerLevels >= 14) {
    maxSlots = 5 // Magic Item Savant
  } else if (artificerLevels >= 10) {
    maxSlots = 4 // Magic Item Adept
  }

  return maxSlots
}

/**
 * Get attunement status and warnings for a character build
 */
export function getAttunementStatus(build: CharacterBuild) {
  const maxSlots = calculateMaxAttunementSlots(build)
  const currentAttunements = build.equipment?.attunedItems?.length || 0
  const hasOverlimit = currentAttunements > maxSlots
  
  return {
    maxSlots,
    currentAttunements,
    availableSlots: Math.max(0, maxSlots - currentAttunements),
    hasOverlimit,
    warning: hasOverlimit 
      ? `Attuned to ${currentAttunements} items but can only attune to ${maxSlots}`
      : null
  }
}

/**
 * Check if a character can attune to an additional magic item
 */
export function canAttuneToItem(build: CharacterBuild): boolean {
  const status = getAttunementStatus(build)
  return !status.hasOverlimit && status.availableSlots > 0
}