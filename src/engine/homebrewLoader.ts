// Homebrew content integration with the rules system
import type {
  HomebrewClass,
  HomebrewSubclass,
  HomebrewFeat,
  HomebrewSpell,
  HomebrewMagicItem,
  HomebrewPack,
  ValidationResult
} from '../types/homebrew'
import type {
  ClassDefinition,
  SubclassDefinition,
  Feat,
  MagicItem,
  Feature
} from '../rules/types'
import type { Spell } from '../rules/srd/spells'
import { validateHomebrewContent } from './homebrewValidation'

// Storage keys for homebrew content
const HOMEBREW_STORAGE_KEYS = {
  classes: 'homebrew-classes',
  subclasses: 'homebrew-subclasses',
  feats: 'homebrew-feats',
  spells: 'homebrew-spells',
  magicItems: 'homebrew-magic-items',
  packs: 'homebrew-packs'
} as const

// Homebrew content store
class HomebrewStore {
  private classes: Map<string, HomebrewClass> = new Map()
  private subclasses: Map<string, HomebrewSubclass> = new Map()
  private feats: Map<string, HomebrewFeat> = new Map()
  private spells: Map<string, HomebrewSpell> = new Map()
  private magicItems: Map<string, HomebrewMagicItem> = new Map()
  private packs: Map<string, HomebrewPack> = new Map()
  private listeners: Set<() => void> = new Set()

  constructor() {
    this.loadFromStorage()
  }

  // Load homebrew content from localStorage
  private loadFromStorage(): void {
    try {
      // Load classes
      const storedClasses = localStorage.getItem(HOMEBREW_STORAGE_KEYS.classes)
      if (storedClasses) {
        const classes: HomebrewClass[] = JSON.parse(storedClasses)
        classes.forEach(cls => this.classes.set(cls.id, cls))
      }

      // Load subclasses
      const storedSubclasses = localStorage.getItem(HOMEBREW_STORAGE_KEYS.subclasses)
      if (storedSubclasses) {
        const subclasses: HomebrewSubclass[] = JSON.parse(storedSubclasses)
        subclasses.forEach(subcls => this.subclasses.set(subcls.id, subcls))
      }

      // Load feats
      const storedFeats = localStorage.getItem(HOMEBREW_STORAGE_KEYS.feats)
      if (storedFeats) {
        const feats: HomebrewFeat[] = JSON.parse(storedFeats)
        feats.forEach(feat => this.feats.set(feat.id, feat))
      }

      // Load spells
      const storedSpells = localStorage.getItem(HOMEBREW_STORAGE_KEYS.spells)
      if (storedSpells) {
        const spells: HomebrewSpell[] = JSON.parse(storedSpells)
        spells.forEach(spell => this.spells.set(spell.id, spell))
      }

      // Load magic items
      const storedItems = localStorage.getItem(HOMEBREW_STORAGE_KEYS.magicItems)
      if (storedItems) {
        const items: HomebrewMagicItem[] = JSON.parse(storedItems)
        items.forEach(item => this.magicItems.set(item.id, item))
      }

      // Load packs
      const storedPacks = localStorage.getItem(HOMEBREW_STORAGE_KEYS.packs)
      if (storedPacks) {
        const packs: HomebrewPack[] = JSON.parse(storedPacks)
        packs.forEach(pack => this.packs.set(pack.name, pack))
      }
    } catch (error) {
      console.warn('Failed to load homebrew content from storage:', error)
    }
  }

  // Save homebrew content to localStorage
  private saveToStorage(): void {
    try {
      localStorage.setItem(HOMEBREW_STORAGE_KEYS.classes, JSON.stringify(Array.from(this.classes.values())))
      localStorage.setItem(HOMEBREW_STORAGE_KEYS.subclasses, JSON.stringify(Array.from(this.subclasses.values())))
      localStorage.setItem(HOMEBREW_STORAGE_KEYS.feats, JSON.stringify(Array.from(this.feats.values())))
      localStorage.setItem(HOMEBREW_STORAGE_KEYS.spells, JSON.stringify(Array.from(this.spells.values())))
      localStorage.setItem(HOMEBREW_STORAGE_KEYS.magicItems, JSON.stringify(Array.from(this.magicItems.values())))
      localStorage.setItem(HOMEBREW_STORAGE_KEYS.packs, JSON.stringify(Array.from(this.packs.values())))
      
      this.notifyListeners()
    } catch (error) {
      console.warn('Failed to save homebrew content to storage:', error)
    }
  }

  // Notify listeners of changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener())
  }

  // Subscribe to changes
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  // Add homebrew content
  addClass(homebrewClass: HomebrewClass): ValidationResult {
    const validation = validateHomebrewContent(homebrewClass)
    if (!validation.valid) {
      return validation
    }

    this.classes.set(homebrewClass.id, homebrewClass)
    this.saveToStorage()
    return validation
  }

  addSubclass(subclass: HomebrewSubclass): ValidationResult {
    const validation = validateHomebrewContent(subclass)
    if (!validation.valid) {
      return validation
    }

    this.subclasses.set(subclass.id, subclass)
    this.saveToStorage()
    return validation
  }

  addFeat(feat: HomebrewFeat): ValidationResult {
    const validation = validateHomebrewContent(feat)
    if (!validation.valid) {
      return validation
    }

    this.feats.set(feat.id, feat)
    this.saveToStorage()
    return validation
  }

  addSpell(spell: HomebrewSpell): ValidationResult {
    const validation = validateHomebrewContent(spell)
    if (!validation.valid) {
      return validation
    }

    this.spells.set(spell.id, spell)
    this.saveToStorage()
    return validation
  }

  addMagicItem(item: HomebrewMagicItem): ValidationResult {
    const validation = validateHomebrewContent(item)
    if (!validation.valid) {
      return validation
    }

    this.magicItems.set(item.id, item)
    this.saveToStorage()
    return validation
  }

  // Remove homebrew content
  removeClass(id: string): boolean {
    const removed = this.classes.delete(id)
    if (removed) {
      this.saveToStorage()
    }
    return removed
  }

  removeSubclass(id: string): boolean {
    const removed = this.subclasses.delete(id)
    if (removed) {
      this.saveToStorage()
    }
    return removed
  }

  removeFeat(id: string): boolean {
    const removed = this.feats.delete(id)
    if (removed) {
      this.saveToStorage()
    }
    return removed
  }

  removeSpell(id: string): boolean {
    const removed = this.spells.delete(id)
    if (removed) {
      this.saveToStorage()
    }
    return removed
  }

  removeMagicItem(id: string): boolean {
    const removed = this.magicItems.delete(id)
    if (removed) {
      this.saveToStorage()
    }
    return removed
  }

  // Get homebrew content
  getClass(id: string): HomebrewClass | undefined {
    return this.classes.get(id)
  }

  getSubclass(id: string): HomebrewSubclass | undefined {
    return this.subclasses.get(id)
  }

  getFeat(id: string): HomebrewFeat | undefined {
    return this.feats.get(id)
  }

  getSpell(id: string): HomebrewSpell | undefined {
    return this.spells.get(id)
  }

  getMagicItem(id: string): HomebrewMagicItem | undefined {
    return this.magicItems.get(id)
  }

  // Get all homebrew content of a type
  getAllClasses(): HomebrewClass[] {
    return Array.from(this.classes.values())
  }

  getAllSubclasses(): HomebrewSubclass[] {
    return Array.from(this.subclasses.values())
  }

  getAllFeats(): HomebrewFeat[] {
    return Array.from(this.feats.values())
  }

  getAllSpells(): HomebrewSpell[] {
    return Array.from(this.spells.values())
  }

  getAllMagicItems(): HomebrewMagicItem[] {
    return Array.from(this.magicItems.values())
  }

  getAllPacks(): HomebrewPack[] {
    return Array.from(this.packs.values())
  }

  // Pack management
  addPack(pack: HomebrewPack): void {
    // Add all content from the pack
    pack.classes.forEach(cls => this.addClass(cls))
    pack.subclasses.forEach(subcls => this.addSubclass(subcls))
    pack.feats.forEach(feat => this.addFeat(feat))
    pack.spells.forEach(spell => this.addSpell(spell))
    pack.magicItems.forEach(item => this.addMagicItem(item))

    // Store the pack metadata
    this.packs.set(pack.name, pack)
    this.saveToStorage()
  }

  removePack(name: string): boolean {
    const pack = this.packs.get(name)
    if (!pack) return false

    // Remove all content from the pack
    pack.classes.forEach(cls => this.removeClass(cls.id))
    pack.subclasses.forEach(subcls => this.removeSubclass(subcls.id))
    pack.feats.forEach(feat => this.removeFeat(feat.id))
    pack.spells.forEach(spell => this.removeSpell(spell.id))
    pack.magicItems.forEach(item => this.removeMagicItem(item.id))

    // Remove the pack metadata
    this.packs.delete(name)
    this.saveToStorage()
    return true
  }

  // Search and filtering
  searchContent(query: string): {
    classes: HomebrewClass[]
    subclasses: HomebrewSubclass[]
    feats: HomebrewFeat[]
    spells: HomebrewSpell[]
    magicItems: HomebrewMagicItem[]
  } {
    const lowerQuery = query.toLowerCase()

    const matchesQuery = (content: { name: string; description: string; tags: string[] }) => {
      return content.name.toLowerCase().includes(lowerQuery) ||
             content.description.toLowerCase().includes(lowerQuery) ||
             content.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    }

    return {
      classes: this.getAllClasses().filter(matchesQuery),
      subclasses: this.getAllSubclasses().filter(matchesQuery),
      feats: this.getAllFeats().filter(matchesQuery),
      spells: this.getAllSpells().filter(matchesQuery),
      magicItems: this.getAllMagicItems().filter(matchesQuery)
    }
  }

  // Get content by status
  getContentByStatus(status: 'draft' | 'testing' | 'published') {
    return {
      classes: this.getAllClasses().filter(cls => cls.status === status),
      subclasses: this.getAllSubclasses().filter(subcls => subcls.status === status),
      feats: this.getAllFeats().filter(feat => feat.status === status),
      spells: this.getAllSpells().filter(spell => spell.status === status),
      magicItems: this.getAllMagicItems().filter(item => item.status === status)
    }
  }

  // Clear all homebrew content
  clearAll(): void {
    this.classes.clear()
    this.subclasses.clear()
    this.feats.clear()
    this.spells.clear()
    this.magicItems.clear()
    this.packs.clear()
    
    Object.values(HOMEBREW_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    
    this.notifyListeners()
  }

  // Export all content as a pack
  exportAllAsPack(packInfo: {
    name: string
    version: string
    author: string
    description: string
  }): HomebrewPack {
    return {
      ...packInfo,
      classes: this.getAllClasses(),
      subclasses: this.getAllSubclasses(),
      feats: this.getAllFeats(),
      spells: this.getAllSpells(),
      magicItems: this.getAllMagicItems(),
      createdAt: new Date()
    }
  }
}

// Global homebrew store instance
export const homebrewStore = new HomebrewStore()

// Conversion functions to integrate homebrew content with the rules system

export function convertHomebrewClassToClass(homebrewClass: HomebrewClass): ClassDefinition {
  return {
    id: homebrewClass.id,
    name: homebrewClass.name,
    hitDie: homebrewClass.hitDie,
    primaryAbilities: homebrewClass.primaryAbility,
    savingThrowProficiencies: homebrewClass.savingThrowProficiencies,
    skillChoices: homebrewClass.skillProficiencies.choices,
    skillChoiceCount: homebrewClass.skillProficiencies.count,
    features: homebrewClass.classFeatures.reduce((acc, feature) => {
      if (!acc[feature.level]) {
        acc[feature.level] = []
      }
      acc[feature.level].push({
        id: `${homebrewClass.id}-${feature.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: feature.name,
        description: feature.description,
        source: homebrewClass.source || 'homebrew'
      })
      return acc
    }, {} as Record<number, Feature[]>)
  }
}

export function convertHomebrewSubclassToSubclass(homebrewSubclass: HomebrewSubclass): SubclassDefinition {
  return {
    id: homebrewSubclass.id,
    name: homebrewSubclass.name,
    parentClass: homebrewSubclass.classId,
    features: homebrewSubclass.subclassFeatures.reduce((acc, feature) => {
      if (!acc[feature.level]) {
        acc[feature.level] = []
      }
      acc[feature.level].push({
        id: `${homebrewSubclass.id}-${feature.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: feature.name,
        description: feature.description,
        source: homebrewSubclass.source || 'homebrew'
      })
      return acc
    }, {} as Record<number, Feature[]>)
  }
}

export function convertHomebrewFeatToFeat(homebrewFeat: HomebrewFeat): Feat {
  return {
    id: homebrewFeat.id,
    name: homebrewFeat.name,
    description: homebrewFeat.description,
    prerequisites: homebrewFeat.prerequisites?.map(prereq => `${prereq.type}: ${prereq.value}`) || [],
    abilityScoreIncrease: homebrewFeat.abilityScoreIncrease ? {
      choices: homebrewFeat.abilityScoreIncrease.choices,
      count: homebrewFeat.abilityScoreIncrease.count
    } : undefined,
    features: homebrewFeat.benefits.map((benefit, index) => ({
      id: `${homebrewFeat.id}-benefit-${index}`,
      name: `Feat Benefit ${index + 1}`,
      description: benefit.description,
      source: homebrewFeat.source || 'homebrew'
    }))
  }
}

// Simple spell representation for homebrew content
export interface HomebrewSpellData {
  id: string
  name: string
  source: string
  level: number
  school: string
  description: string
  classes: string[]
}

export function convertHomebrewItemToMagicItem(homebrewItem: HomebrewMagicItem): MagicItem {
  return {
    id: homebrewItem.id,
    name: homebrewItem.name,
    rarity: homebrewItem.rarity,
    category: homebrewItem.itemType as any, // Convert itemType to category
    description: homebrewItem.description,
    attunement: homebrewItem.attunement.required,
    prerequisites: homebrewItem.attunement.restrictions || []
  }
}

// Spell conversion function
export function convertHomebrewSpellToSpell(homebrewSpell: HomebrewSpell): Spell {
  const convertComponents = (comp: HomebrewSpell['components']) => {
    const parts = []
    if (comp.verbal) parts.push('V')
    if (comp.somatic) parts.push('S')
    if (comp.material) {
      if (comp.materialComponent) {
        parts.push(`M (${comp.materialComponent})`)
      } else {
        parts.push('M')
      }
    }
    return parts.join(', ')
  }

  const convertRange = (range: HomebrewSpell['range']) => {
    if (range.type === 'self') return 'Self'
    if (range.type === 'touch') return 'Touch'
    if (range.type === 'sight') return 'Sight'
    if (range.type === 'unlimited') return 'Unlimited'
    if (range.type === 'ranged' && range.distance) {
      return `${range.distance} ${range.unit || 'feet'}`
    }
    return 'Touch'
  }

  const convertDuration = (duration: HomebrewSpell['duration']) => {
    if (duration.type === 'instantaneous') return 'Instantaneous'
    if (duration.type === 'permanent') return 'Until dispelled'
    if (duration.type === 'until_dispelled') return 'Until dispelled'
    if (duration.type === 'concentration' || duration.concentration) {
      if (duration.amount && duration.unit) {
        return `Concentration, up to ${duration.amount} ${duration.unit}${duration.amount > 1 ? 's' : ''}`
      }
      return 'Concentration'
    }
    if (duration.amount && duration.unit) {
      return `${duration.amount} ${duration.unit}${duration.amount > 1 ? 's' : ''}`
    }
    return 'Instantaneous'
  }

  const convertCastingTime = (castingTime: HomebrewSpell['castingTime']) => {
    if (castingTime.amount === 1) {
      if (castingTime.unit === 'action') return '1 action'
      if (castingTime.unit === 'bonus_action') return '1 bonus action'
      if (castingTime.unit === 'reaction') return '1 reaction'
    }
    return `${castingTime.amount} ${castingTime.unit}${castingTime.amount > 1 ? 's' : ''}`
  }

  return {
    id: homebrewSpell.id,
    name: homebrewSpell.name,
    level: homebrewSpell.level,
    school: homebrewSpell.school,
    castingTime: convertCastingTime(homebrewSpell.castingTime),
    range: convertRange(homebrewSpell.range),
    components: convertComponents(homebrewSpell.components),
    duration: convertDuration(homebrewSpell.duration),
    description: homebrewSpell.description,
    atHigherLevels: homebrewSpell.higherLevels,
    classes: homebrewSpell.classes,
    tags: []
  }
}

// Hook to get all homebrew content integrated with rules
export function getIntegratedHomebrewContent(): {
  classes: ClassDefinition[]
  subclasses: SubclassDefinition[]
  feats: Feat[]
  spells: Spell[]
  magicItems: MagicItem[]
} {
  return {
    classes: homebrewStore.getAllClasses().map(convertHomebrewClassToClass),
    subclasses: homebrewStore.getAllSubclasses().map(convertHomebrewSubclassToSubclass),
    feats: homebrewStore.getAllFeats().map(convertHomebrewFeatToFeat),
    spells: homebrewStore.getAllSpells().map(convertHomebrewSpellToSpell),
    magicItems: homebrewStore.getAllMagicItems().map(convertHomebrewItemToMagicItem)
  }
}

// Helper function to check if content is homebrew
export function isHomebrewContent(id: string): boolean {
  return homebrewStore.getClass(id) !== undefined ||
         homebrewStore.getSubclass(id) !== undefined ||
         homebrewStore.getFeat(id) !== undefined ||
         homebrewStore.getSpell(id) !== undefined ||
         homebrewStore.getMagicItem(id) !== undefined
}

// Export the store for external use
export { HomebrewStore }
export default homebrewStore