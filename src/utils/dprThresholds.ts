// Treantmonk's baseline damage system for D&D 5e optimization
export type DPRRating = 'needs-work' | 'poor' | 'good' | 'very-good' | 'excellent'

export interface DPRThresholds {
  excellent: number
  good: number
  average: number
  low: number
}

/**
 * Get dynamic target AC based on character level
 * Level 1-4: AC 13
 * Level 5-10: AC 15
 * Level 11-16: AC 17
 * Level 17-20: AC 19
 */
export function getDynamicTargetAC(level: number): number {
  if (level >= 1 && level <= 4) return 13
  if (level >= 5 && level <= 10) return 15
  if (level >= 11 && level <= 16) return 17
  if (level >= 17 && level <= 20) return 19
  
  // Fallback for invalid levels
  return 15
}

/**
 * Get Treantmonk's baseline damage for a given level
 * These baselines already factor in hit chance and crit chance
 * Updated values:
 * Level 1-3: 9
 * Level 4: 10.4
 * Level 5-7: 19
 * Level 8: 21.9
 * Level 9-10: 23.9
 * Level 11-12: 34.5
 * Level 13-16: 37.6
 * Level 17-19: 39.4
 * Level 20: 52.5
 */
export function getTreantmonkBaseline(level: number): number {
  if (level >= 1 && level <= 3) return 9
  if (level === 4) return 10.4
  if (level >= 5 && level <= 7) return 19
  if (level === 8) return 21.9
  if (level >= 9 && level <= 10) return 23.9
  if (level >= 11 && level <= 12) return 34.5
  if (level >= 13 && level <= 16) return 37.6
  if (level >= 17 && level <= 19) return 39.4
  if (level === 20) return 52.5
  
  // Fallback for invalid levels
  return 9
}

/**
 * Get level-adjusted DPR thresholds for build assessment
 * Using Treantmonk's baseline system
 */
export function getLevelAdjustedDPRThresholds(level: number): DPRThresholds {
  const baseline = getTreantmonkBaseline(level)
  
  return {
    excellent: baseline * 2,      // Excellent: 200% of baseline
    good: baseline * 1.5,         // Very Good: 150% of baseline
    average: baseline,            // Good: 100% of baseline
    low: baseline * 0.5          // Needs work: 50% of baseline
  }
}

/**
 * Get a build rating based on DPR using Treantmonk's system
 * DPR should already factor in hit chance (expected DPR)
 */
export function getBuildRating(
  avgDPR: number, 
  _hitChance: number, 
  level: number
): DPRRating {
  const baseline = getTreantmonkBaseline(level)
  const percentage = (avgDPR / baseline) * 100
  
  if (percentage >= 200) {
    return 'excellent'
  } else if (percentage >= 150) {
    return 'very-good'
  } else if (percentage >= 100) {
    return 'good'
  } else if (percentage > 50) {
    return 'poor'
  } else {
    return 'needs-work'
  }
}

/**
 * Get descriptive text for a DPR value at a given level
 */
export function describeDPR(avgDPR: number, level: number): string {
  const baseline = getTreantmonkBaseline(level)
  const percentage = (avgDPR / baseline) * 100
  
  if (percentage >= 200) {
    return `Excellent damage output (${percentage.toFixed(0)}% of baseline)`
  } else if (percentage >= 150) {
    return `Very good damage output (${percentage.toFixed(0)}% of baseline)`
  } else if (percentage >= 100) {
    return `Good damage output (${percentage.toFixed(0)}% of baseline)`
  } else if (percentage > 50) {
    return `Poor damage output (${percentage.toFixed(0)}% of baseline)`
  } else {
    return `Needs work (${percentage.toFixed(0)}% of baseline)`
  }
}