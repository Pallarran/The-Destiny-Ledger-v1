import { useMemo } from 'react'
import { weapons } from '../rules/srd/weapons'
import type { BuildConfiguration } from '../stores/types'

interface ContextualFieldsConfig {
  showGWMFeats: boolean
  showSharpshooterFeats: boolean
  showCrossbowExpertFeats: boolean
  showPolearmMasterFeats: boolean
  showTwoHandedWeaponOptions: boolean
  showRangedWeaponOptions: boolean
  showLightWeaponOptions: boolean
  showHeavyWeaponOptions: boolean
  showFinesseWeaponOptions: boolean
  showReachWeaponOptions: boolean
}

/**
 * Hook that determines which UI fields should be visible based on build context
 * This reduces clutter by only showing relevant options for the current build
 */
export function useContextualFields(build: BuildConfiguration | null): ContextualFieldsConfig {
  return useMemo(() => {
    if (!build) {
      return {
        showGWMFeats: false,
        showSharpshooterFeats: false,
        showCrossbowExpertFeats: false,
        showPolearmMasterFeats: false,
        showTwoHandedWeaponOptions: false,
        showRangedWeaponOptions: false,
        showLightWeaponOptions: false,
        showHeavyWeaponOptions: false,
        showFinesseWeaponOptions: false,
        showReachWeaponOptions: false
      }
    }

    // Get current weapon info
    const currentWeaponId = build.mainHandWeapon || 'longsword'
    const currentWeapon = weapons[currentWeaponId]
    const rangedWeaponId = build.rangedWeapon
    const rangedWeapon = rangedWeaponId ? weapons[rangedWeaponId] : null
    
    // Check weapon properties
    const weaponProperties = currentWeapon?.properties || []
    
    const isHeavyWeapon = weaponProperties.includes('heavy')
    const isTwoHanded = weaponProperties.includes('two-handed') || isHeavyWeapon
    const isRangedWeapon = currentWeapon?.category === 'ranged' || !!rangedWeapon
    const isLightWeapon = weaponProperties.includes('light')
    const isFinesseWeapon = weaponProperties.includes('finesse')
    const isReachWeapon = weaponProperties.includes('reach')
    const isCrossbow = currentWeaponId.includes('crossbow') || rangedWeaponId?.includes('crossbow')
    const isPolearm = ['glaive', 'halberd', 'quarterstaff', 'spear', 'pike'].some(weapon => 
      currentWeaponId.includes(weapon) || rangedWeaponId?.includes(weapon)
    )
    
    // Check for existing feats in build
    const hasFeats = build.levelTimeline?.some(level => level.asiOrFeat === 'feat') || false
    const featSelections = build.levelTimeline
      ?.filter(level => level.asiOrFeat === 'feat')
      .flatMap(level => level.features || []) || []
    
    const hasGWM = featSelections.some(feat => feat.includes('great_weapon_master'))
    const hasSharpshooter = featSelections.some(feat => feat.includes('sharpshooter'))
    const hasCrossbowExpert = featSelections.some(feat => feat.includes('crossbow_expert'))
    const hasPolearmMaster = featSelections.some(feat => feat.includes('polearm_master'))

    return {
      // Show feat options based on weapon compatibility
      showGWMFeats: isHeavyWeapon || hasGWM || hasFeats,
      showSharpshooterFeats: isRangedWeapon || hasSharpshooter || hasFeats,
      showCrossbowExpertFeats: isCrossbow || hasCrossbowExpert || hasFeats,
      showPolearmMasterFeats: isPolearm || hasPolearmMaster || hasFeats,
      
      // Show weapon-specific options
      showTwoHandedWeaponOptions: isTwoHanded,
      showRangedWeaponOptions: isRangedWeapon,
      showLightWeaponOptions: isLightWeapon,
      showHeavyWeaponOptions: isHeavyWeapon,
      showFinesseWeaponOptions: isFinesseWeapon,
      showReachWeaponOptions: isReachWeapon
    }
  }, [build])
}

/**
 * Helper hook to get contextual descriptions for why certain options are available
 */
export function useContextualDescriptions(build: BuildConfiguration | null) {
  const context = useContextualFields(build)
  
  return useMemo(() => {
    const descriptions: Record<string, string> = {}
    
    if (context.showGWMFeats) {
      descriptions.gwm = "Available because you're using a heavy weapon"
    }
    
    if (context.showSharpshooterFeats) {
      descriptions.sharpshooter = "Available because you're using ranged weapons"
    }
    
    if (context.showCrossbowExpertFeats) {
      descriptions.crossbow_expert = "Available because you're using crossbows"
    }
    
    if (context.showPolearmMasterFeats) {
      descriptions.polearm_master = "Available because you're using polearms"
    }
    
    return descriptions
  }, [context])
}