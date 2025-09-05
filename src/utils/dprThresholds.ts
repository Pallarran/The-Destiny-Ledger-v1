// Treantmonk's baseline damage system for D&D 5e optimization
export type DPRRating = 'needs-work' | 'poor' | 'good' | 'very-good' | 'excellent'

export interface DPRThresholds {
  excellent: number
  good: number
  average: number
  low: number
}

/**
 * Get Treantmonk's baseline damage for a given level
 * These baselines already factor in hit chance and crit chance
 */
export function getTreantmonkBaseline(level: number): number {
  if (level === 1) return 5.85
  if (level >= 2 && level <= 3) return 7.65
  if (level === 4) return 8.25
  if (level >= 5 && level <= 7) return 16.5
  if (level >= 8 && level <= 10) return 17.7
  if (level >= 11 && level <= 12) return 26.55
  if (level >= 13 && level <= 16) return 26.55
  if (level >= 17 && level <= 20) return 35.4
  
  // Fallback for invalid levels
  return 5.85
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