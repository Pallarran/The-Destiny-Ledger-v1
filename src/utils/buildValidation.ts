import type { CharacterBuild, CharacterLevel } from '@/rules/types'
import { classesData } from '@/rules/data/classes.json'
import { subclassesData } from '@/rules/data/subclasses.json'
import { weaponsData } from '@/rules/data/weapons.json'

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

export function validateBuild(build: CharacterBuild): ValidationError[] {
  const errors: ValidationError[] = []

  // Name validation
  if (!build.name || build.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Build name is required',
      severity: 'error'
    })
  }

  // Ability scores validation
  const abilityTotal = Object.values(build.abilityScores).reduce((sum, score) => sum + score, 0)
  if (abilityTotal < 27) {
    errors.push({
      field: 'abilityScores',
      message: 'Ability scores appear unusually low',
      severity: 'warning'
    })
  }

  Object.entries(build.abilityScores).forEach(([ability, score]) => {
    if (score < 3 || score > 20) {
      errors.push({
        field: `abilityScores.${ability}`,
        message: `${ability} score must be between 3 and 20`,
        severity: 'error'
      })
    }
  })

  // Level progression validation
  if (build.levels.length === 0) {
    errors.push({
      field: 'levels',
      message: 'At least one level is required',
      severity: 'error'
    })
  }

  if (build.levels.length > 20) {
    errors.push({
      field: 'levels',
      message: 'Maximum character level is 20',
      severity: 'error'
    })
  }

  // Validate each level
  build.levels.forEach((level, index) => {
    const levelErrors = validateLevel(level, index, build.levels)
    errors.push(...levelErrors)
  })

  // Equipment validation
  const equipmentErrors = validateEquipment(build)
  errors.push(...equipmentErrors)

  // Class progression validation
  const progressionErrors = validateClassProgression(build.levels)
  errors.push(...progressionErrors)

  return errors
}

function validateLevel(level: CharacterLevel, index: number, allLevels: CharacterLevel[]): ValidationError[] {
  const errors: ValidationError[] = []
  const field = `levels[${index}]`

  // Level number validation
  if (level.level !== index + 1) {
    errors.push({
      field: `${field}.level`,
      message: `Level ${index + 1} has incorrect level number: ${level.level}`,
      severity: 'error'
    })
  }

  // Class validation
  const classData = classesData.find(c => c.id === level.classId)
  if (!classData) {
    errors.push({
      field: `${field}.classId`,
      message: `Invalid class ID: ${level.classId}`,
      severity: 'error'
    })
    return errors // Can't validate further without class data
  }

  // Subclass validation
  if (level.subclassId) {
    const subclassData = subclassesData.find(s => s.id === level.subclassId)
    if (!subclassData) {
      errors.push({
        field: `${field}.subclassId`,
        message: `Invalid subclass ID: ${level.subclassId}`,
        severity: 'error'
      })
    } else if (subclassData.parentClass !== level.classId) {
      errors.push({
        field: `${field}.subclassId`,
        message: `Subclass ${subclassData.name} is not valid for ${classData.name}`,
        severity: 'error'
      })
    }

    // Check if subclass is available at this level
    const classLevel = getClassLevel(level.classId, index, allLevels)
    const minSubclassLevel = subclassData.availableAt || 3
    if (classLevel < minSubclassLevel) {
      errors.push({
        field: `${field}.subclassId`,
        message: `${subclassData.name} is not available until ${classData.name} level ${minSubclassLevel}`,
        severity: 'error'
      })
    }
  }

  return errors
}

function validateEquipment(build: CharacterBuild): ValidationError[] {
  const errors: ValidationError[] = []

  // Main hand weapon validation
  if (build.equipment.mainHand) {
    const weapon = weaponsData.find(w => w.id === build.equipment.mainHand)
    if (!weapon) {
      errors.push({
        field: 'equipment.mainHand',
        message: `Invalid weapon ID: ${build.equipment.mainHand}`,
        severity: 'error'
      })
    }
  }

  // Off-hand weapon validation
  if (build.equipment.offHand) {
    const offhandWeapon = weaponsData.find(w => w.id === build.equipment.offHand)
    if (!offhandWeapon) {
      errors.push({
        field: 'equipment.offHand',
        message: `Invalid off-hand weapon ID: ${build.equipment.offHand}`,
        severity: 'error'
      })
    } else {
      // Validate two-weapon fighting rules
      if (!build.equipment.mainHand) {
        errors.push({
          field: 'equipment.offHand',
          message: 'Cannot use off-hand weapon without main-hand weapon',
          severity: 'error'
        })
      } else {
        const mainWeapon = weaponsData.find(w => w.id === build.equipment.mainHand)
        if (mainWeapon) {
          if (!offhandWeapon.properties.includes('light')) {
            errors.push({
              field: 'equipment.offHand',
              message: 'Off-hand weapon must have the Light property',
              severity: 'error'
            })
          }

          if (!mainWeapon.properties.includes('light') && !mainWeapon.properties.includes('versatile')) {
            errors.push({
              field: 'equipment.mainHand',
              message: 'Main-hand weapon must have Light or Versatile property for two-weapon fighting',
              severity: 'error'
            })
          }
        }
      }
    }
  }

  // Shield validation
  if (build.equipment.shield && build.equipment.offHand) {
    errors.push({
      field: 'equipment.shield',
      message: 'Cannot use both shield and off-hand weapon',
      severity: 'error'
    })
  }

  return errors
}

function validateClassProgression(levels: CharacterLevel[]): ValidationError[] {
  const errors: ValidationError[] = []

  // Check for valid multiclassing combinations
  const classIds = [...new Set(levels.map(level => level.classId))]
  
  if (classIds.length > 1) {
    // This is a multiclass build - could add multiclassing prerequisite checks here
    errors.push({
      field: 'levels',
      message: 'Multiclassing detected - ensure ability score prerequisites are met',
      severity: 'warning'
    })
  }

  // Check for early subclass selection
  levels.forEach((level, index) => {
    if (level.subclassId) {
      const classLevel = getClassLevel(level.classId, index, levels)
      if (classLevel < 3) {
        errors.push({
          field: `levels[${index}].subclassId`,
          message: 'Most subclasses are not available before 3rd level',
          severity: 'warning'
        })
      }
    }
  })

  return errors
}

function getClassLevel(classId: string, upToIndex: number, levels: CharacterLevel[]): number {
  return levels.slice(0, upToIndex + 1).filter(level => level.classId === classId).length
}

export function hasErrors(errors: ValidationError[]): boolean {
  return errors.some(error => error.severity === 'error')
}

export function hasWarnings(errors: ValidationError[]): boolean {
  return errors.some(error => error.severity === 'warning')
}

export function getErrorsByField(errors: ValidationError[], field: string): ValidationError[] {
  return errors.filter(error => error.field === field || error.field.startsWith(`${field}.`))
}

export function getErrorCount(errors: ValidationError[]): { errors: number; warnings: number } {
  return {
    errors: errors.filter(e => e.severity === 'error').length,
    warnings: errors.filter(e => e.severity === 'warning').length
  }
}