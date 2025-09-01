// Unified DPR thresholds for consistent assessment across components
export interface DPRThresholds {
  excellent: number
  good: number
  average: number
  low: number
}

/**
 * Get level-adjusted DPR thresholds for build assessment
 * Based on D&D 5e tier expectations:
 * - Tier 1 (1-4): Basic threats, ~3-5 DPR per attack expected
 * - Tier 2 (5-10): Regional threats, ~5-8 DPR per attack expected  
 * - Tier 3 (11-16): World threats, ~8-12 DPR per attack expected
 * - Tier 4 (17-20): Cosmic threats, ~12-15 DPR per attack expected
 */
export function getLevelAdjustedDPRThresholds(level: number): DPRThresholds {
  if (level <= 4) {
    // Tier 1: Local Heroes
    return { 
      excellent: 15,  // Outstanding for tier
      good: 10,       // Above average
      average: 7,     // Expected baseline
      low: 5          // Below expected
    }
  } else if (level <= 10) {
    // Tier 2: Heroes of the Realm  
    return { 
      excellent: 25,  // Outstanding for tier
      good: 18,       // Above average
      average: 12,    // Expected baseline
      low: 10         // Below expected
    }
  } else if (level <= 16) {
    // Tier 3: Masters of the Realm
    return { 
      excellent: 35,  // Outstanding for tier
      good: 25,       // Above average
      average: 18,    // Expected baseline
      low: 15         // Below expected
    }
  } else {
    // Tier 4: Masters of the World
    return { 
      excellent: 45,  // Outstanding for tier
      good: 32,       // Above average
      average: 25,    // Expected baseline
      low: 20         // Below expected
    }
  }
}

/**
 * Get a build rating based on DPR and hit chance
 */
export function getBuildRating(
  avgDPR: number, 
  hitChance: number, 
  level: number
): 'excellent' | 'good' | 'average' | 'needs-work' {
  const thresholds = getLevelAdjustedDPRThresholds(level)
  
  // Excellent: High DPR and good accuracy
  if (avgDPR >= thresholds.excellent && hitChance > 0.65) {
    return 'excellent'
  }
  // Good: Good DPR and decent accuracy
  else if (avgDPR >= thresholds.good && hitChance > 0.55) {
    return 'good'
  }
  // Average: Average DPR or decent DPR with poor accuracy
  else if (avgDPR >= thresholds.average && hitChance > 0.45) {
    return 'average'
  }
  // Needs work: Low DPR or very poor accuracy
  else {
    return 'needs-work'
  }
}

/**
 * Get descriptive text for a DPR value at a given level
 */
export function describeDPR(avgDPR: number, level: number): string {
  const thresholds = getLevelAdjustedDPRThresholds(level)
  
  if (avgDPR >= thresholds.excellent) {
    return `Excellent damage output for level ${level}`
  } else if (avgDPR >= thresholds.good) {
    return `Good damage output for level ${level}`
  } else if (avgDPR >= thresholds.average) {
    return `Average damage output for level ${level}`
  } else if (avgDPR >= thresholds.low) {
    return `Below average damage for level ${level}`
  } else {
    return `Low damage output for level ${level}`
  }
}