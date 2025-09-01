import type { AbilityScoreArray } from '../rules/types'

// Weapon training entry for specific weapon types
export interface WeaponTrainingEntry {
  weaponType: string // Weapon type ID (e.g., "longsword", "longbow", "dagger")
  attackBonus: number // Training bonus to attack rolls (1-3)
  damageBonus: number // Training bonus to damage rolls (1-3)
}

// Individual training session representing downtime between chapters/adventures
export interface DowntimeTrainingSession {
  id: string
  name: string // User-friendly name (e.g., "Chapter 2 Downtime", "Winter Training")
  description?: string
  createdAt: Date
  
  // What was trained during this session
  featsTrained: string[] // Feat IDs learned through training
  abilityImprovements: Partial<AbilityScoreArray> // Ability score increases (can exceed 20)
  skillsTrained: string[] // New skill proficiencies gained
  expertiseGained: string[] // Skills upgraded to expertise
  weaponTraining: WeaponTrainingEntry[] // Weapon-specific training bonuses
}

// Complete downtime training data for a character
export interface DowntimeTraining {
  sessions: DowntimeTrainingSession[]
  
  // Computed totals (derived from all sessions)
  trainedFeats: string[]
  abilityTraining: Partial<AbilityScoreArray> // Total ability increases from all training
  trainedSkillProficiencies: string[]
  trainedSkillExpertise: string[]
  weaponTraining: Record<string, { attackBonus: number, damageBonus: number }> // Aggregated by weapon type
}

// Training limits per session (to prevent abuse)
export interface TrainingLimits {
  maxAbilityIncreasePerSession: number // Default: 1
  maxSkillsPerSession: number // Default: 2
  maxFeatsPerSession: number // Default: 1
  maxWeaponTrainingPerSession: number // Default: 1 point total
}

export const DEFAULT_TRAINING_LIMITS: TrainingLimits = {
  maxAbilityIncreasePerSession: 1,
  maxSkillsPerSession: 2, 
  maxFeatsPerSession: 1,
  maxWeaponTrainingPerSession: 1
}