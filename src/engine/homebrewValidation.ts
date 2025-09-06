// Homebrew content validation system

import type { 
  BaseHomebrewContent,
  HomebrewClass,
  HomebrewSubclass, 
  HomebrewFeat,
  HomebrewSpell,
  HomebrewMagicItem,
  ValidationResult,
  ValidationError
} from '../types/homebrew'

// Base validation rules
export function validateBaseContent(content: BaseHomebrewContent): ValidationError[] {
  const errors: ValidationError[] = []

  // Required fields
  if (!content.id || content.id.trim() === '') {
    errors.push({ field: 'id', message: 'ID is required and cannot be empty', severity: 'error' })
  }

  if (!content.name || content.name.trim() === '') {
    errors.push({ field: 'name', message: 'Name is required and cannot be empty', severity: 'error' })
  }

  if (!content.description || content.description.trim() === '') {
    errors.push({ field: 'description', message: 'Description is required and cannot be empty', severity: 'error' })
  }

  if (!content.author || content.author.trim() === '') {
    errors.push({ field: 'author', message: 'Author is required and cannot be empty', severity: 'error' })
  }

  // ID format validation (lowercase, alphanumeric, hyphens/underscores only)
  const idPattern = /^[a-z0-9_-]+$/
  if (content.id && !idPattern.test(content.id)) {
    errors.push({ 
      field: 'id', 
      message: 'ID must contain only lowercase letters, numbers, hyphens, and underscores', 
      severity: 'error' 
    })
  }

  // Name length validation
  if (content.name && content.name.length > 50) {
    errors.push({ field: 'name', message: 'Name cannot exceed 50 characters', severity: 'warning' })
  }

  // Description length validation
  if (content.description && content.description.length > 1000) {
    errors.push({ field: 'description', message: 'Description cannot exceed 1000 characters', severity: 'warning' })
  }

  // Version format validation (semantic versioning)
  const versionPattern = /^\d+\.\d+\.\d+$/
  if (content.version && !versionPattern.test(content.version)) {
    errors.push({ 
      field: 'version', 
      message: 'Version must follow semantic versioning format (e.g., 1.0.0)', 
      severity: 'warning' 
    })
  }

  // Status validation
  const validStatuses = ['draft', 'testing', 'published']
  if (!validStatuses.includes(content.status)) {
    errors.push({ 
      field: 'status', 
      message: 'Status must be one of: draft, testing, published', 
      severity: 'error' 
    })
  }

  return errors
}

// Class validation
export function validateClass(classData: HomebrewClass): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Base content validation
  const baseErrors = validateBaseContent(classData)
  errors.push(...baseErrors.filter(e => e.severity === 'error'))
  warnings.push(...baseErrors.filter(e => e.severity === 'warning'))

  // Hit die validation
  const validHitDice = [6, 8, 10, 12]
  if (!validHitDice.includes(classData.hitDie)) {
    errors.push({ 
      field: 'hitDie', 
      message: 'Hit die must be 6, 8, 10, or 12', 
      severity: 'error' 
    })
  }

  // Primary ability validation
  if (!classData.primaryAbility || classData.primaryAbility.length === 0) {
    errors.push({ 
      field: 'primaryAbility', 
      message: 'At least one primary ability is required', 
      severity: 'error' 
    })
  }

  // Saving throw proficiencies validation
  if (!classData.savingThrowProficiencies || classData.savingThrowProficiencies.length !== 2) {
    errors.push({ 
      field: 'savingThrowProficiencies', 
      message: 'Exactly two saving throw proficiencies are required', 
      severity: 'error' 
    })
  }

  // Skill proficiencies validation
  if (classData.skillProficiencies) {
    if (classData.skillProficiencies.count < 2 || classData.skillProficiencies.count > 4) {
      warnings.push({ 
        field: 'skillProficiencies.count', 
        message: 'Skill proficiency count should typically be between 2-4', 
        severity: 'warning' 
      })
    }

    if (classData.skillProficiencies.choices.length < classData.skillProficiencies.count) {
      errors.push({ 
        field: 'skillProficiencies.choices', 
        message: 'Not enough skill choices provided for the specified count', 
        severity: 'error' 
      })
    }
  }

  // Class features validation
  if (!classData.classFeatures || classData.classFeatures.length === 0) {
    errors.push({ 
      field: 'classFeatures', 
      message: 'At least one class feature is required', 
      severity: 'error' 
    })
  }

  // Validate level 1 feature exists
  const hasLevel1Feature = classData.classFeatures?.some(feature => feature.level === 1)
  if (!hasLevel1Feature) {
    errors.push({ 
      field: 'classFeatures', 
      message: 'Class must have at least one feature at level 1', 
      severity: 'error' 
    })
  }

  // Subclass levels validation
  if (classData.subclassLevels && classData.subclassLevels.length > 0) {
    const firstSubclassLevel = Math.min(...classData.subclassLevels)
    if (firstSubclassLevel > 3) {
      warnings.push({ 
        field: 'subclassLevels', 
        message: 'First subclass level is typically 1, 2, or 3', 
        severity: 'warning' 
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

// Subclass validation
export function validateSubclass(subclassData: HomebrewSubclass): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Base content validation
  const baseErrors = validateBaseContent(subclassData)
  errors.push(...baseErrors.filter(e => e.severity === 'error'))
  warnings.push(...baseErrors.filter(e => e.severity === 'warning'))

  // Parent class validation
  if (!subclassData.className || subclassData.className.trim() === '') {
    errors.push({ 
      field: 'className', 
      message: 'Parent class name is required', 
      severity: 'error' 
    })
  }

  if (!subclassData.classId || subclassData.classId.trim() === '') {
    errors.push({ 
      field: 'classId', 
      message: 'Parent class ID is required', 
      severity: 'error' 
    })
  }

  // Subclass features validation
  if (!subclassData.subclassFeatures || subclassData.subclassFeatures.length === 0) {
    errors.push({ 
      field: 'subclassFeatures', 
      message: 'At least one subclass feature is required', 
      severity: 'error' 
    })
  }

  // Validate feature levels are reasonable
  if (subclassData.subclassFeatures) {
    const featureLevels = subclassData.subclassFeatures.map(f => f.level).sort((a, b) => a - b)
    const firstLevel = featureLevels[0]
    
    if (firstLevel && (firstLevel < 1 || firstLevel > 20)) {
      errors.push({ 
        field: 'subclassFeatures', 
        message: 'Feature levels must be between 1 and 20', 
        severity: 'error' 
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

// Feat validation
export function validateFeat(featData: HomebrewFeat): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Base content validation
  const baseErrors = validateBaseContent(featData)
  errors.push(...baseErrors.filter(e => e.severity === 'error'))
  warnings.push(...baseErrors.filter(e => e.severity === 'warning'))

  // Benefits validation
  if (!featData.benefits || featData.benefits.length === 0) {
    errors.push({ 
      field: 'benefits', 
      message: 'At least one benefit is required for a feat', 
      severity: 'error' 
    })
  }

  // Mechanics validation
  if (!featData.mechanics || featData.mechanics.length === 0) {
    warnings.push({ 
      field: 'mechanics', 
      message: 'Consider adding mechanical effects for the feat', 
      severity: 'warning' 
    })
  }

  // Ability score increase validation
  if (featData.abilityScoreIncrease) {
    const asi = featData.abilityScoreIncrease
    if (asi.count > 2 || asi.count < 1) {
      warnings.push({ 
        field: 'abilityScoreIncrease.count', 
        message: 'Ability score increases typically grant 1-2 points', 
        severity: 'warning' 
      })
    }
    
    if (asi.maximum !== 20) {
      warnings.push({ 
        field: 'abilityScoreIncrease.maximum', 
        message: 'Ability score maximum is typically 20', 
        severity: 'warning' 
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

// Spell validation
export function validateSpell(spellData: HomebrewSpell): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Base content validation
  const baseErrors = validateBaseContent(spellData)
  errors.push(...baseErrors.filter(e => e.severity === 'error'))
  warnings.push(...baseErrors.filter(e => e.severity === 'warning'))

  // Spell level validation
  if (spellData.level < 0 || spellData.level > 9) {
    errors.push({ 
      field: 'level', 
      message: 'Spell level must be between 0 (cantrip) and 9', 
      severity: 'error' 
    })
  }

  // School validation
  const validSchools = [
    'abjuration', 'conjuration', 'divination', 'enchantment',
    'evocation', 'illusion', 'necromancy', 'transmutation'
  ]
  if (!validSchools.includes(spellData.school.toLowerCase())) {
    errors.push({ 
      field: 'school', 
      message: 'Spell school must be one of the eight D&D schools of magic', 
      severity: 'error' 
    })
  }

  // Casting time validation
  if (!spellData.castingTime || !spellData.castingTime.unit) {
    errors.push({ 
      field: 'castingTime', 
      message: 'Casting time unit is required', 
      severity: 'error' 
    })
  }

  // Range validation
  if (!spellData.range || !spellData.range.type) {
    errors.push({ 
      field: 'range', 
      message: 'Range type is required', 
      severity: 'error' 
    })
  }

  // Duration validation
  if (!spellData.duration || !spellData.duration.type) {
    errors.push({ 
      field: 'duration', 
      message: 'Duration type is required', 
      severity: 'error' 
    })
  }

  // Class list validation
  if (!spellData.classes || spellData.classes.length === 0) {
    errors.push({ 
      field: 'classes', 
      message: 'At least one class must be able to cast this spell', 
      severity: 'error' 
    })
  }

  // Concentration validation
  if (spellData.duration.concentration && spellData.duration.type !== 'concentration') {
    errors.push({ 
      field: 'duration', 
      message: 'If concentration is true, duration type should be "concentration"', 
      severity: 'error' 
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

// Magic item validation
export function validateMagicItem(itemData: HomebrewMagicItem): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Base content validation
  const baseErrors = validateBaseContent(itemData)
  errors.push(...baseErrors.filter(e => e.severity === 'error'))
  warnings.push(...baseErrors.filter(e => e.severity === 'warning'))

  // Item type validation
  const validItemTypes = [
    'weapon', 'armor', 'shield', 'wondrous_item', 
    'potion', 'scroll', 'ring', 'rod', 'staff', 'wand'
  ]
  if (!validItemTypes.includes(itemData.itemType)) {
    errors.push({ 
      field: 'itemType', 
      message: 'Invalid item type specified', 
      severity: 'error' 
    })
  }

  // Rarity validation
  const validRarities = ['common', 'uncommon', 'rare', 'very_rare', 'legendary', 'artifact']
  if (!validRarities.includes(itemData.rarity)) {
    errors.push({ 
      field: 'rarity', 
      message: 'Invalid rarity specified', 
      severity: 'error' 
    })
  }

  // Properties validation
  if (!itemData.properties || itemData.properties.length === 0) {
    warnings.push({ 
      field: 'properties', 
      message: 'Consider adding at least one property to make the item useful', 
      severity: 'warning' 
    })
  }

  // Charges validation
  if (itemData.charges) {
    if (itemData.charges.maximum < 1) {
      errors.push({ 
        field: 'charges.maximum', 
        message: 'Maximum charges must be at least 1', 
        severity: 'error' 
      })
    }

    if (typeof itemData.charges.regain.amount === 'number' && 
        itemData.charges.regain.amount > itemData.charges.maximum) {
      warnings.push({ 
        field: 'charges.regain.amount', 
        message: 'Regain amount should not exceed maximum charges', 
        severity: 'warning' 
      })
    }
  }

  // Attunement validation for higher rarities
  if (['rare', 'very_rare', 'legendary', 'artifact'].includes(itemData.rarity) && 
      !itemData.attunement.required) {
    warnings.push({ 
      field: 'attunement', 
      message: 'Items of rare or higher rarity typically require attunement', 
      severity: 'warning' 
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

// Universal validation function
export function validateHomebrewContent(
  content: BaseHomebrewContent & { type: string }
): ValidationResult {
  switch (content.type) {
    case 'class':
      return validateClass(content as HomebrewClass)
    case 'subclass':
      return validateSubclass(content as HomebrewSubclass)
    case 'feat':
      return validateFeat(content as HomebrewFeat)
    case 'spell':
      return validateSpell(content as HomebrewSpell)
    case 'magic_item':
      return validateMagicItem(content as HomebrewMagicItem)
    default:
      return {
        valid: false,
        errors: [{ field: 'type', message: 'Unknown content type', severity: 'error' }],
        warnings: []
      }
  }
}