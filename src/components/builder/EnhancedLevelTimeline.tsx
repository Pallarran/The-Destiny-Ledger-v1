import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { ClassIcon } from '../ui/class-icon'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { classes } from '../../rules/srd/classes'
import { feats } from '../../rules/srd/feats'
import { subclasses } from '../../rules/srd/subclasses'
import { getClass } from '../../rules/loaders'
import { getProficiencyBonus } from '../../rules/srd/skills'
import { Plus, Sword, ChevronRight, AlertTriangle, CheckCircle, Clock, Heart, TrendingUp, Sparkles, Trash2, Crown, Target, TreePine, Star } from 'lucide-react'
import type { BuilderLevelEntry, CharacterBuilder } from '../../types/character'
import type { ClassDefinition, Feature, Feat, AbilityScore } from '../../rules/types'
import type { Subclass } from '../../rules/srd/subclasses'

// Helper type for subclass features
type SubclassFeature = {
  level: number
  name: string
  description: string
  rulesKey?: string
}

// Interface for level section data - flexible to handle various section types
interface LevelSection {
  type: string
  title?: string
  features?: (Feature | {name: string, description: string})[]
  benefits?: ({
    name: string
    description: string
    showMulticlassInfo?: boolean
    icon?: any
    isBonus?: boolean
  })[]
  options?: any[]
  selectedOptions?: any[]
  selectedFeat?: string
  selectedAbilityIncreases?: Record<string, number>
  onSelect?: (id: string) => void
  onASI?: (increases: Record<AbilityScore, number>) => void
  onMultiSelect?: (ids: string[]) => void
  // Allow any additional properties for specific section types
  [key: string]: any
}
import { ExpertiseSelection } from './ExpertiseSelection'
import { ManeuverSelection } from './ManeuverSelection'
import { MetamagicSelection } from './MetamagicSelection'
import { EldritchInvocationSelection } from './EldritchInvocationSelection'
import { MysticArcanumSelection } from './MysticArcanumSelection'
import { PactBoonSelection } from './PactBoonSelection'
import { RangerFeatureSelection } from './RangerFeatureSelection'
import { SpellSelection } from './SpellSelection'
import { ThirdCasterSpellSelection } from './ThirdCasterSpellSelection'
import { WizardSpellPreparation } from './WizardSpellPreparation'
import { PreparedCasterSpellPreparation } from './PreparedCasterSpellPreparation'
import { MulticlassSpellInfo } from './MulticlassSpellSummary'
import { maneuvers, getManeuverProgression } from '../../rules/srd/maneuvers'
import { metamagicOptions, getMetamagicProgression } from '../../rules/srd/metamagic'
import { eldritchInvocations, getInvocationProgression } from '../../rules/srd/eldritchInvocations'
import { allMysticArcanumSpells, getMysticArcanumAvailableAtLevel } from '../../rules/srd/mysticArcanum'
import { pactBoons } from '../../rules/srd/pactBoons'
import { favoredEnemies, naturalExplorerTerrains, getRangerFeaturesAtLevel } from '../../rules/srd/rangerFeatures'
import { spellsKnownProgression } from '../../rules/srd/spells'

// Use ClassIcon component instead of Lucide icons

// Helper function to calculate hit points gained at level
function calculateHitPointsGained(classData: ClassDefinition | null, isFirstLevel: boolean): number {
  if (!classData?.hitDie) return 0
  
  if (isFirstLevel) {
    // First level gets max hit die + CON modifier (handled elsewhere)
    return classData.hitDie
  } else {
    // Subsequent levels get average of hit die + CON modifier (handled elsewhere)
    return Math.floor(classData.hitDie / 2) + 1
  }
}

// Spell slot progression for full casters (Wizard, Cleric, Bard, Sorcerer)
const FULL_CASTER_SLOTS = {
  1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [3, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [4, 2, 0, 0, 0, 0, 0, 0, 0],
  4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
  5: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  6: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  7: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  9: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
} as const

// Half caster progression (Paladin, Ranger)
const HALF_CASTER_SLOTS = {
  1: [0, 0, 0, 0, 0],
  2: [2, 0, 0, 0, 0],
  3: [3, 0, 0, 0, 0],
  4: [3, 0, 0, 0, 0],
  5: [4, 2, 0, 0, 0],
  6: [4, 2, 0, 0, 0],
  7: [4, 3, 0, 0, 0],
  8: [4, 3, 0, 0, 0],
  9: [4, 3, 2, 0, 0],
  10: [4, 3, 2, 0, 0],
  11: [4, 3, 3, 0, 0],
  12: [4, 3, 3, 0, 0],
  13: [4, 3, 3, 1, 0],
  14: [4, 3, 3, 1, 0],
  15: [4, 3, 3, 2, 0],
  16: [4, 3, 3, 2, 0],
  17: [4, 3, 3, 3, 1],
  18: [4, 3, 3, 3, 1],
  19: [4, 3, 3, 3, 2],
  20: [4, 3, 3, 3, 2]
} as const

// Third caster progression (Eldritch Knight Fighter, Arcane Trickster Rogue)
const THIRD_CASTER_SLOTS = {
  1: [0, 0, 0, 0],
  2: [0, 0, 0, 0],
  3: [2, 0, 0, 0],
  4: [3, 0, 0, 0],
  5: [3, 0, 0, 0],
  6: [3, 0, 0, 0],
  7: [4, 2, 0, 0],
  8: [4, 2, 0, 0],
  9: [4, 2, 0, 0],
  10: [4, 3, 0, 0],
  11: [4, 3, 0, 0],
  12: [4, 3, 0, 0],
  13: [4, 3, 2, 0],
  14: [4, 3, 2, 0],
  15: [4, 3, 2, 0],
  16: [4, 3, 3, 0],
  17: [4, 3, 3, 0],
  18: [4, 3, 3, 0],
  19: [4, 3, 3, 1],
  20: [4, 3, 3, 1]
} as const

// Warlock pact magic progression
const WARLOCK_PACT_SLOTS = {
  1: [1, 0, 0, 0, 0], // 1 slot, level 1
  2: [0, 2, 0, 0, 0], // 2 slots, level 2
  3: [0, 2, 0, 0, 0], // 2 slots, level 2
  4: [0, 2, 0, 0, 0], // 2 slots, level 2
  5: [0, 0, 2, 0, 0], // 2 slots, level 3
  6: [0, 0, 2, 0, 0], // 2 slots, level 3
  7: [0, 0, 2, 0, 0], // 2 slots, level 3
  8: [0, 0, 2, 0, 0], // 2 slots, level 3
  9: [0, 0, 0, 2, 0], // 2 slots, level 4
  10: [0, 0, 0, 2, 0], // 2 slots, level 4
  11: [0, 0, 0, 3, 0], // 3 slots, level 4
  12: [0, 0, 0, 3, 0], // 3 slots, level 4
  13: [0, 0, 0, 3, 0], // 3 slots, level 4
  14: [0, 0, 0, 3, 0], // 3 slots, level 4
  15: [0, 0, 0, 3, 0], // 3 slots, level 4
  16: [0, 0, 0, 3, 0], // 3 slots, level 4
  17: [0, 0, 0, 0, 4], // 4 slots, level 5
  18: [0, 0, 0, 0, 4], // 4 slots, level 5
  19: [0, 0, 0, 0, 4], // 4 slots, level 5
  20: [0, 0, 0, 0, 4]  // 4 slots, level 5
} as const

// Multiclass spell slot table (D&D 5e rules)
const MULTICLASS_SPELL_SLOTS = {
  1: [2, 0, 0, 0, 0, 0, 0, 0, 0],
  2: [3, 0, 0, 0, 0, 0, 0, 0, 0],
  3: [4, 2, 0, 0, 0, 0, 0, 0, 0],
  4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
  5: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  6: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  7: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  9: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
} as const

// Calculate multiclass caster level based on D&D 5e rules
function calculateMulticlassCasterLevel(timeline: BuilderLevelEntry[]): number {
  let casterLevel = 0
  
  const classLevels: Record<string, number> = {}
  const subclassLevels: Record<string, number> = {}
  
  // Count levels per class/subclass
  timeline.forEach(entry => {
    classLevels[entry.classId] = (classLevels[entry.classId] || 0) + 1
    if (entry.subclassId) {
      const key = `${entry.classId}_${entry.subclassId}`
      subclassLevels[key] = (subclassLevels[key] || 0) + 1
    }
  })
  
  // Full casters: add full levels
  const fullCasters = ['wizard', 'cleric', 'bard', 'sorcerer', 'druid']
  fullCasters.forEach(classId => {
    if (classLevels[classId]) {
      casterLevel += classLevels[classId]
    }
  })
  
  // Half casters: add half levels (rounded down)
  const halfCasters = ['paladin', 'ranger', 'artificer']
  halfCasters.forEach(classId => {
    if (classLevels[classId]) {
      casterLevel += Math.floor(classLevels[classId] / 2)
    }
  })
  
  // Third casters: add 1/3 levels (rounded down)
  const thirdCasterSubclasses = ['fighter_eldritch_knight', 'rogue_arcane_trickster']
  thirdCasterSubclasses.forEach(key => {
    if (subclassLevels[key]) {
      casterLevel += Math.floor(subclassLevels[key] / 3)
    }
  })
  
  return casterLevel
}

// Check if this is a multiclass build with multiple caster classes
function isMulticlassBuild(timeline: BuilderLevelEntry[], upToLevel: number): boolean {
  const relevantTimeline = timeline.filter(entry => entry.level <= upToLevel)
  const casterClasses = new Set<string>()
  
  relevantTimeline.forEach(entry => {
    // Full casters
    if (['wizard', 'cleric', 'bard', 'sorcerer', 'druid'].includes(entry.classId)) {
      casterClasses.add(entry.classId)
    }
    // Half casters
    else if (['paladin', 'ranger', 'artificer'].includes(entry.classId)) {
      casterClasses.add(entry.classId)
    }
    // Third casters
    else if ((entry.classId === 'fighter' && entry.subclassId === 'eldritch_knight') ||
             (entry.classId === 'rogue' && entry.subclassId === 'arcane_trickster')) {
      casterClasses.add(`${entry.classId}_${entry.subclassId}`)
    }
    // Note: Warlock uses Pact Magic which is separate, but can still be multiclassed
    else if (entry.classId === 'warlock') {
      casterClasses.add(entry.classId)
    }
  })
  
  return casterClasses.size > 1
}

// Get multiclass spell slots for a given total character level
function getMulticlassSpellSlots(timeline: BuilderLevelEntry[], upToLevel: number): number[] | null {
  const relevantTimeline = timeline.filter(entry => entry.level <= upToLevel)
  const casterLevel = calculateMulticlassCasterLevel(relevantTimeline)
  
  if (casterLevel === 0) return null
  
  const slots = MULTICLASS_SPELL_SLOTS[Math.min(casterLevel, 20) as keyof typeof MULTICLASS_SPELL_SLOTS]
  return slots ? [...slots] : null // Convert readonly array to mutable array
}

// Helper function to get spell progression for a class (single class or individual class in multiclass)
function getSpellProgression(classId: string, classLevel: number, subclass?: string): number[] | null {
  const fullCasters = ['wizard', 'cleric', 'bard', 'sorcerer', 'druid']
  const halfCasters = ['paladin', 'ranger', 'artificer']
  
  // Handle subclass third casters
  if (classId === 'fighter' && subclass === 'eldritch_knight') {
    const slots = THIRD_CASTER_SLOTS[classLevel as keyof typeof THIRD_CASTER_SLOTS]
    return slots ? [...slots] : null
  }
  if (classId === 'rogue' && subclass === 'arcane_trickster') {
    const slots = THIRD_CASTER_SLOTS[classLevel as keyof typeof THIRD_CASTER_SLOTS]
    return slots ? [...slots] : null
  }
  
  // Handle Warlock pact magic (separate from multiclass slots)
  if (classId === 'warlock') {
    const slots = WARLOCK_PACT_SLOTS[classLevel as keyof typeof WARLOCK_PACT_SLOTS]
    return slots ? [...slots] : null
  }
  
  if (fullCasters.includes(classId)) {
    const slots = FULL_CASTER_SLOTS[classLevel as keyof typeof FULL_CASTER_SLOTS]
    return slots ? [...slots] : null
  } else if (halfCasters.includes(classId)) {
    const slots = HALF_CASTER_SLOTS[classLevel as keyof typeof HALF_CASTER_SLOTS]
    return slots ? [...slots] : null
  }
  
  return null
}

// Helper function to get level progression benefits
function getLevelBenefits(level: number, classData: ClassDefinition | null, isFirstClassLevel: boolean) {
  const proficiencyBonus = getProficiencyBonus(level)
  const hitPointsGained = calculateHitPointsGained(classData, isFirstClassLevel)
  
  return {
    proficiencyBonus,
    hitPointsGained,
    isProficiencyBonusIncrease: level === 1 || (level - 1) % 4 === 0
  }
}



function LevelMilestoneCard({ entry, classData, classLevel, currentBuild, updateLevel, selectFeat, selectASI, setSkillProficiencies, removeLevel, canRemove }: {
  entry: BuilderLevelEntry
  classData?: ClassDefinition | null
  classLevel: number
  currentBuild: CharacterBuilder | null
  updateLevel: (level: number, updates: Partial<BuilderLevelEntry>) => void
  selectFeat: (level: number, featId: string) => void
  selectASI: (level: number, abilityIncreases: Record<AbilityScore, number>) => void
  setSkillProficiencies: (skills: string[]) => void
  removeLevel?: (level: number) => void
  canRemove?: boolean
}) {
  const { getAllKnownFeats } = useCharacterBuilderStore()
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  
  // Get known feats to prevent duplicates
  const knownFeats = getAllKnownFeats()
  
  // Get class features for this level
  const classFeatures = classData?.features?.[classLevel] || []
  
  // Calculate level benefits
  const isFirstClassLevel = classLevel === 1
  const levelBenefits = getLevelBenefits(entry.level, classData || null, isFirstClassLevel)
  
  // Check for spell progression - use multiclass if multiple caster classes exist
  const timeline = currentBuild?.enhancedLevelTimeline || []
  const isMulticlass = isMulticlassBuild(timeline, entry.level)
  
  let spellSlots: number[] | null = null
  let prevSpellSlots: number[] | null = null
  let pactMagicSlots: number[] | null = null
  let prevPactMagicSlots: number[] | null = null
  
  // Handle Warlock pact magic (always separate)
  if (entry.classId === 'warlock') {
    pactMagicSlots = getSpellProgression(entry.classId, classLevel, entry.subclassId)
    prevPactMagicSlots = classLevel > 1 ? getSpellProgression(entry.classId, classLevel - 1, entry.subclassId) : null
  }
  
  if (isMulticlass) {
    // Use multiclass spell slot calculation (excludes warlock)
    spellSlots = getMulticlassSpellSlots(timeline, entry.level)
    prevSpellSlots = entry.level > 1 ? getMulticlassSpellSlots(timeline, entry.level - 1) : null
  } else {
    // Use single class spell slot calculation (unless it's warlock, handled above)
    if (entry.classId !== 'warlock') {
      spellSlots = getSpellProgression(entry.classId, classLevel, entry.subclassId)
      prevSpellSlots = classLevel > 1 ? getSpellProgression(entry.classId, classLevel - 1, entry.subclassId) : null
    }
  }
  
  // Create comprehensive feature/choice list
  const sections = []
  
  // 0. Level Benefits (automatic progression)
  const benefits = []
  
  // Hit Points
  benefits.push({
    name: `Hit Points`,
    description: `Gain ${levelBenefits.hitPointsGained} HP (${isFirstClassLevel ? 'max' : 'avg'} of d${classData?.hitDie || '?'} + CON modifier)`,
    icon: Heart,
    isBonus: false
  })
  
  // Proficiency Bonus  
  if (levelBenefits.isProficiencyBonusIncrease) {
    benefits.push({
      name: 'Proficiency Bonus',
      description: `Proficiency bonus increases to +${levelBenefits.proficiencyBonus}`,
      icon: TrendingUp,
      isBonus: true
    })
  }
  
  // Regular Spell Progression
  if (spellSlots) {
    const newSlots: string[] = []
    const improvedSlots: string[] = []
    
    spellSlots.forEach((slots, level) => {
      const prevSlots = prevSpellSlots?.[level] || 0
      if (slots > 0 && prevSlots === 0) {
        newSlots.push(`${slots} level ${level + 1}`)
      } else if (slots > prevSlots) {
        improvedSlots.push(`${slots} level ${level + 1} (+${slots - prevSlots})`)
      }
    })
    
    if (newSlots.length > 0) {
      benefits.push({
        name: isMulticlass ? 'New Multiclass Spell Slots' : 'New Spell Slots',
        description: `Gain ${newSlots.join(', ')} spell slots`,
        icon: Sparkles,
        isBonus: true,
        showMulticlassInfo: isMulticlass
      })
    }
    
    if (improvedSlots.length > 0) {
      benefits.push({
        name: isMulticlass ? 'Improved Multiclass Spell Slots' : 'Improved Spell Slots', 
        description: `Increase to ${improvedSlots.join(', ')} spell slots`,
        icon: Sparkles,
        isBonus: true,
        showMulticlassInfo: isMulticlass
      })
    }
  }
  
  // Pact Magic Progression (separate from regular spell slots)
  if (pactMagicSlots) {
    const newPactSlots: string[] = []
    const improvedPactSlots: string[] = []
    
    pactMagicSlots.forEach((slots, level) => {
      const prevSlots = prevPactMagicSlots?.[level] || 0
      if (slots > 0 && prevSlots === 0) {
        newPactSlots.push(`${slots} level ${level + 1}`)
      } else if (slots > prevSlots) {
        improvedPactSlots.push(`${slots} level ${level + 1} (+${slots - prevSlots})`)
      }
    })
    
    if (newPactSlots.length > 0) {
      benefits.push({
        name: 'New Pact Magic Slots',
        description: `Gain ${newPactSlots.join(', ')} pact magic slots`,
        icon: Sparkles,
        isBonus: true
      })
    }
    
    if (improvedPactSlots.length > 0) {
      benefits.push({
        name: 'Improved Pact Magic Slots',
        description: `Increase to ${improvedPactSlots.join(', ')} pact magic slots`,
        icon: Sparkles,
        isBonus: true
      })
    }
  }
  
  if (benefits.length > 0) {
    sections.push({
      id: 'level_benefits',
      title: 'Level Benefits',
      type: 'benefits',
      isComplete: true,
      benefits: benefits
    })
  }
  
  // 0.5. Spell Slots Summary (for spellcasters)
  if (spellSlots && spellSlots.some(slots => slots > 0)) {
    sections.push({
      id: 'spell_slots',
      title: isMulticlass ? 'Multiclass Spell Slots' : 'Spell Slots',
      type: 'spell_slots',
      isComplete: true,
      spellSlots: spellSlots
    })
  }
  
  // 0.6. Pact Magic Slots Summary (for warlocks)
  if (pactMagicSlots && pactMagicSlots.some(slots => slots > 0)) {
    sections.push({
      id: 'pact_magic_slots',
      title: 'Pact Magic Slots',
      type: 'pact_magic_slots',
      isComplete: true,
      spellSlots: pactMagicSlots
    })
  }
  
  // 1. Class Features (automatic)
  const autoFeatures = classFeatures.filter((f: Feature) => 
    f.rulesKey !== 'fighting_style' && f.rulesKey !== 'asi' && f.rulesKey !== 'archetype' && f.rulesKey !== 'archetype_feature'
  )
  if (autoFeatures.length > 0) {
    sections.push({
      id: 'class_features',
      title: 'Class Features',
      type: 'auto',
      isComplete: true,
      features: autoFeatures.map((f: Feature) => ({ 
        name: f.name, 
        description: f.description,
        source: f.source 
      }))
    })
  }
  
  // 1a. Expertise Choice (for Rogue/Bard features)
  const expertiseFeature = classFeatures.find((f: Feature) => 
    f.id === 'expertise_rogue' || f.id === 'expertise_rogue_6' || f.id === 'expertise_bard'
  )
  if (expertiseFeature) {
    const expertiseCount = expertiseFeature.id === 'expertise_rogue' || expertiseFeature.id === 'expertise_bard' ? 2 : 2
    const currentExpertise = entry.expertiseChoices || []
    
    sections.push({
      id: 'expertise',
      title: `Expertise (${expertiseFeature.name})`,
      type: 'expertise',
      isComplete: currentExpertise.length === expertiseCount,
      expertiseCount: expertiseCount,
      currentExpertise: currentExpertise
    })
  }

  // 1b. Maneuver Choice (for Battle Master Fighter)
  let maneuverFeature = null
  if (entry.subclassId === 'battle_master') {
    const progression = getManeuverProgression(entry.level)
    if (progression) {
      // Look for explicit Battle Master features at this level
      const subclass = Object.values(subclasses).find((sub: Subclass) => sub.id === entry.subclassId)
      if (subclass && subclass.features) {
        const subclassFeatures = subclass.features.filter((f: SubclassFeature) => f.level === classLevel)
        maneuverFeature = subclassFeatures.find((f: SubclassFeature) => 
          f.name === 'Combat Superiority' || f.name === 'Improved Combat Superiority'
        )
      }
      
      // If no explicit feature but progression shows maneuvers should be available, create a virtual feature
      if (!maneuverFeature && progression.count > 0) {
        maneuverFeature = {
          name: 'Additional Maneuvers',
          description: `You learn additional maneuvers as part of your Battle Master training.`
        }
      }
    }
  }
  if (maneuverFeature) {
    const progression = getManeuverProgression(entry.level)
    if (progression) {
      const currentManeuvers = entry.maneuverChoices || []
      
      sections.push({
        id: 'maneuvers',
        title: `Combat Maneuvers (${maneuverFeature.name})`,
        type: 'maneuvers',
        isComplete: currentManeuvers.length === progression.count,
        maneuverCount: progression.count,
        currentManeuvers: currentManeuvers,
        progression: progression
      })
    }
  }

  // 1c. Metamagic Choice (for Sorcerer)
  let metamagicFeature = null
  if (entry.classId === 'sorcerer') {
    // Look for explicit Sorcerer metamagic features at this level
    metamagicFeature = classFeatures.find((f: Feature) => 
      f.id === 'metamagic' || f.id === 'metamagic_2' || f.id === 'metamagic_3'
    )
    
    if (metamagicFeature) {
      const progression = getMetamagicProgression(entry.level)
      if (progression) {
        const currentMetamagic = entry.metamagicChoices || []
        
        sections.push({
          id: 'metamagic',
          title: `Metamagic (${metamagicFeature.name})`,
          type: 'metamagic',
          isComplete: currentMetamagic.length === progression.count,
          metamagicCount: progression.count,
          currentMetamagic: currentMetamagic,
          progression: progression
        })
      }
    }
  }

  // 1d. Eldritch Invocation Choice (for Warlock)
  let eldritchInvocationFeature = null
  if (entry.classId === 'warlock') {
    // Look for explicit Warlock eldritch invocation features at this level
    eldritchInvocationFeature = classFeatures.find((f: Feature) => 
      f.id === 'eldritch_invocations' || f.id.includes('invocation')
    )
    
    if (eldritchInvocationFeature || entry.level >= 2) {
      const invocationCount = getInvocationProgression(entry.level)
      if (invocationCount > 0) {
        const currentInvocations = entry.eldritchInvocationChoices || []
        
        sections.push({
          id: 'eldritch_invocations',
          title: `Eldritch Invocations (${invocationCount} known)`,
          type: 'eldritch_invocations',
          isComplete: currentInvocations.length === invocationCount,
          invocationCount: invocationCount,
          currentInvocations: currentInvocations,
          level: entry.level,
          pactBoon: undefined // TODO: Get actual pact boon from earlier levels
        })
      }
    }
  }

  // 1e. Mystic Arcanum Choice (for Warlock)
  if (entry.classId === 'warlock') {
    const availableArcanumLevels = getMysticArcanumAvailableAtLevel(entry.level)
    
    for (const spellLevel of availableArcanumLevels) {
      const currentMysticArcanum = entry.mysticArcanumChoices || {}
      const hasSpellAtLevel = !!currentMysticArcanum[spellLevel]
      
      // Check if this is the level where this Mystic Arcanum becomes available
      const shouldShow = (
        (spellLevel === 6 && entry.level === 11) ||
        (spellLevel === 7 && entry.level === 13) ||
        (spellLevel === 8 && entry.level === 15) ||
        (spellLevel === 9 && entry.level === 17)
      )
      
      if (shouldShow) {
        sections.push({
          id: `mystic_arcanum_${spellLevel}`,
          title: `Mystic Arcanum (${spellLevel === 6 ? '6th' : spellLevel === 7 ? '7th' : spellLevel === 8 ? '8th' : '9th'} Level)`,
          type: 'mystic_arcanum',
          isComplete: hasSpellAtLevel,
          spellLevel: spellLevel,
          currentSpell: currentMysticArcanum[spellLevel],
        })
      }
    }
  }

  // 1f. Pact Boon Choice (for Warlock level 3)
  if (entry.classId === 'warlock' && entry.level === 3) {
    const currentPactBoon = entry.pactBoonChoice
    
    sections.push({
      id: 'pact_boon',
      title: 'Pact Boon',
      type: 'pact_boon',
      isComplete: !!currentPactBoon,
      currentPactBoon: currentPactBoon,
    })
  }

  // 1g. Ranger Features (Favored Enemy & Natural Explorer)
  if (entry.classId === 'ranger') {
    const rangerFeatures = getRangerFeaturesAtLevel(entry.level)
    
    // Favored Enemy selection
    if (rangerFeatures.favoredEnemy) {
      const currentFavoredEnemy = entry.favoredEnemyChoice
      
      sections.push({
        id: 'favored_enemy',
        title: 'Favored Enemy',
        type: 'favored_enemy',
        isComplete: !!currentFavoredEnemy,
        currentSelection: currentFavoredEnemy,
      })
    }
    
    // Natural Explorer selection
    if (rangerFeatures.naturalExplorer) {
      const currentNaturalExplorer = entry.naturalExplorerChoice
      
      sections.push({
        id: 'natural_explorer',
        title: 'Natural Explorer',
        type: 'natural_explorer',
        isComplete: !!currentNaturalExplorer,
        currentSelection: currentNaturalExplorer,
      })
    }
  }

  // 2. Fighting Style Choice
  const hasFightingStyle = classFeatures.some((f: Feature) => f.rulesKey === 'fighting_style')
  if (hasFightingStyle) {
    const availableStyles = classData?.fightingStyles || []
    sections.push({
      id: 'fighting_style',
      title: 'Fighting Style',
      type: 'choice',
      isComplete: !!entry.fightingStyle,
      currentChoice: entry.fightingStyle,
      options: availableStyles.map((style) => ({
        id: style.id,
        name: style.name,
        description: style.description
      })),
      onChoice: (styleId: string) => {
        updateLevel(entry.level, { fightingStyle: styleId })
        setExpandedSection(null)
      }
    })
  }

  // 3. Archetype Choice (initial selection only)
  const hasArchetype = classFeatures.some((f: Feature) => f.rulesKey === 'archetype')
  if (hasArchetype) {
    const availableSubclasses = Object.values(subclasses).filter((sub: Subclass) => sub.className === entry.classId)
    sections.push({
      id: 'archetype',
      title: `${classData?.name} Archetype`,
      type: 'choice',
      isComplete: !!entry.archetype,
      currentChoice: entry.archetype,
      options: availableSubclasses.map((subclass: Subclass) => ({
        id: subclass.id,
        name: subclass.name,
        description: subclass.description
      })),
      onChoice: (archetypeId: string) => {
        updateLevel(entry.level, { archetype: archetypeId, subclassId: archetypeId })
        setExpandedSection(null)
      }
    })
  }

  // 3b. Archetype Features (automatic)
  const archetypeFeatures = classFeatures.filter((f: Feature) => f.rulesKey === 'archetype_feature')
  if (archetypeFeatures.length > 0) {
    // Get the specific archetype features from the selected subclass
    // Look for archetype in this level first, or find it from earlier levels of the same class
    let selectedArchetype = entry.archetype
    if (!selectedArchetype && currentBuild?.enhancedLevelTimeline) {
      const earlierArchetypeEntry = (currentBuild.enhancedLevelTimeline || [])
        .filter((e: BuilderLevelEntry) => e.classId === entry.classId && e.level < entry.level && e.archetype)
        .sort((a: BuilderLevelEntry, b: BuilderLevelEntry) => b.level - a.level)[0]
      selectedArchetype = earlierArchetypeEntry?.archetype
    }
    
    const specificArchetypeFeatures = []
    
    if (selectedArchetype) {
      // Find the subclass data
      const subclass = Object.values(subclasses).find((sub: Subclass) => sub.id === selectedArchetype)
      if (subclass && subclass.features) {
        // Get features for this class level from the subclass (features is an array, not keyed by level)
        const subclassFeatures = subclass.features.filter((f: SubclassFeature) => f.level === classLevel)
        if (subclassFeatures && subclassFeatures.length > 0) {
          specificArchetypeFeatures.push(...subclassFeatures.map((f: SubclassFeature) => ({ 
            name: f.name, 
            description: f.description 
          })))
        }
      }
    } else {
      // No specific archetype features to display
    }
    
    sections.push({
      id: 'archetype_features',
      title: 'Archetype Features',
      type: 'auto',
      isComplete: true,
      features: specificArchetypeFeatures.length > 0 
        ? specificArchetypeFeatures 
        : archetypeFeatures.map((f: Feature) => ({ 
            name: f.name, 
            description: f.description,
            source: f.source
          }))
    })
  }

  // 3e. Spell Selection (for spellcasting classes)
  const fullCasters = ['wizard', 'cleric', 'bard', 'sorcerer', 'druid']
  const halfCasters = ['paladin', 'ranger', 'artificer']
  const isSpellcaster = fullCasters.includes(entry.classId) || halfCasters.includes(entry.classId)
  
  if (isSpellcaster && classLevel > 0) {
    // Get spell progression from rules
    const classProgression = spellsKnownProgression[entry.classId as keyof typeof spellsKnownProgression]
    const spellProgression = classProgression ? {
      cantripsKnown: classProgression.cantrips[classLevel - 1] || 0,
      spellsKnown: classProgression.spellsKnown[classLevel - 1] || 0
    } : null
    const previousProgression = classProgression && classLevel > 1 ? {
      cantripsKnown: classProgression.cantrips[classLevel - 2] || 0,
      spellsKnown: classProgression.spellsKnown[classLevel - 2] || 0
    } : null
    
    // Check if this level grants new spells
    const gainsSpells = spellProgression && (
      !previousProgression ||
      spellProgression.spellsKnown > previousProgression.spellsKnown ||
      spellProgression.cantripsKnown > previousProgression.cantripsKnown
    )
    
    if (gainsSpells) {
      const currentSpells = entry.spellChoices || []
      
      // Get all spells known from previous levels (consider multiclassing with same spell list)
      let previousSpells = currentBuild?.enhancedLevelTimeline
        ?.filter((e: BuilderLevelEntry) => e.level < entry.level && (
          e.classId === entry.classId || // Same class
          (entry.classId === 'wizard' && e.classId === 'fighter' && e.subclassId === 'eldritch_knight') || // EK spells count for Wizard
          (e.classId === 'wizard' && entry.classId === 'fighter' && entry.subclassId === 'eldritch_knight') // Wizard spells count for EK
        ))
        ?.flatMap((e: BuilderLevelEntry) => e.spellChoices || []) || []
      
      // Get racial spells to exclude from class progression limits
      const racialSpells: string[] = []
      
      // High Elf gets a wizard cantrip - applies to wizards and classes that share wizard spell list
      if (currentBuild?.race === 'elf' && currentBuild?.subrace === 'high_elf' && currentBuild?.highElfCantrip) {
        if (entry.classId === 'wizard' || 
           (entry.classId === 'fighter' && entry.subclassId === 'eldritch_knight') ||
           (entry.classId === 'rogue' && entry.subclassId === 'arcane_trickster')) {
          racialSpells.push(currentBuild.highElfCantrip)
        }
      }
      
      // Calculate how many new spells can be learned this level (excluding racial spells from previous count)
      const allPreviousCantrips = previousSpells.filter((spellId: string) => {
        // We'd need to check if spell is cantrip, but for now assume based on common patterns
        return spellId.includes('cantrip') || ['fire_bolt', 'ray_of_frost', 'mage_hand', 'minor_illusion', 'prestidigitation', 'guidance', 'sacred_flame', 'spare_the_dying', 'druidcraft', 'produce_flame', 'vicious_mockery'].includes(spellId)
      })
      const racialCantrips = racialSpells.filter((spellId: string) => {
        return spellId.includes('cantrip') || ['fire_bolt', 'ray_of_frost', 'mage_hand', 'minor_illusion', 'prestidigitation', 'guidance', 'sacred_flame', 'spare_the_dying', 'druidcraft', 'produce_flame', 'vicious_mockery'].includes(spellId)
      })
      
      // Only count class progression cantrips, not racial cantrips
      const previousClassCantrips = allPreviousCantrips.filter((spell: string) => !racialCantrips.includes(spell))
      const previousLeveledSpells = previousSpells.filter((spellId: string) => !allPreviousCantrips.includes(spellId))
      
      const newCantripsToLearn = Math.max(0, spellProgression.cantripsKnown - previousClassCantrips.length)
      
      // Wizards have special spell learning rules - they add 2 spells to their spellbook each level
      let newSpellsToLearn: number
      if (entry.classId === 'wizard') {
        // Level 1 wizard gets 6 spells, each subsequent level gets 2 more
        newSpellsToLearn = classLevel === 1 ? 6 : 2
      } else {
        // Other spellcasters use the normal progression
        newSpellsToLearn = Math.max(0, spellProgression.spellsKnown - previousLeveledSpells.length)
      }
      
      
      // Add racial spells back to previousSpells for display purposes in spell selection
      previousSpells = [...previousSpells, ...racialSpells]
      
      // Different handling for wizard vs other casters
      if (entry.classId === 'wizard') {
        sections.push({
          id: 'wizard_spellbook',
          title: `Add Spells to Spellbook`,
          type: 'wizard_spellbook',
          isComplete: currentSpells.length >= (newCantripsToLearn + newSpellsToLearn),
          selectedSpells: currentSpells,
          previousSpells: previousSpells,
          newCantripsToLearn: newCantripsToLearn,
          newSpellsToLearn: newSpellsToLearn,
          spellsKnown: spellProgression.spellsKnown,
          cantripsKnown: spellProgression.cantripsKnown
        })
      } else {
        // For prepared casters (artificer, cleric, druid, paladin) and known casters (bard, sorcerer)
        const isPreparedCaster = ['artificer', 'cleric', 'druid', 'paladin'].includes(entry.classId)
        sections.push({
          id: 'spell_selection',
          title: isPreparedCaster ? `Select Cantrips` : `Spell Selection`,
          type: 'spell_selection',
          isComplete: currentSpells.length >= (newCantripsToLearn + newSpellsToLearn),
          selectedSpells: currentSpells,
          previousSpells: previousSpells,
          newCantripsToLearn: newCantripsToLearn,
          newSpellsToLearn: newSpellsToLearn,
          spellsKnown: spellProgression.spellsKnown,
          cantripsKnown: spellProgression.cantripsKnown
        })
      }
    }
  }
  
  // 3f. Third Caster Spell Selection (Eldritch Knight, Arcane Trickster)
  const isThirdCaster = (entry.classId === 'fighter' && entry.subclassId === 'eldritch_knight') ||
                       (entry.classId === 'rogue' && entry.subclassId === 'arcane_trickster')
  
  if (isThirdCaster && classLevel >= 3) { // Third casters start at level 3
    const subclassId = entry.subclassId as 'eldritch_knight' | 'arcane_trickster'
    const classProgression = spellsKnownProgression[subclassId]
    const spellProgression = classProgression ? {
      cantripsKnown: classProgression.cantrips[classLevel - 1] || 0,
      spellsKnown: classProgression.spellsKnown[classLevel - 1] || 0
    } : null
    const previousProgression = classProgression && classLevel > 3 ? {
      cantripsKnown: classProgression.cantrips[classLevel - 2] || 0,
      spellsKnown: classProgression.spellsKnown[classLevel - 2] || 0
    } : null
    
    // Check if this level grants new spells
    const gainsSpells = spellProgression && (
      classLevel === 3 || // First spell level
      !previousProgression ||
      spellProgression.spellsKnown > previousProgression.spellsKnown ||
      spellProgression.cantripsKnown > previousProgression.cantripsKnown
    )
    
    if (gainsSpells) {
      const currentSpells = entry.spellChoices || []
      
      // Get all spells known from previous levels (consider multiclassing with same spell list)
      let previousSpells = currentBuild?.enhancedLevelTimeline
        ?.filter((e: BuilderLevelEntry) => e.level < entry.level && (
          (e.classId === entry.classId && e.subclassId === subclassId) || // Same subclass
          (subclassId === 'eldritch_knight' && e.classId === 'wizard') || // Wizard spells count for EK
          (subclassId === 'arcane_trickster' && e.classId === 'wizard') // Wizard spells count for AT (they also use wizard list)
        ))
        ?.flatMap((e: BuilderLevelEntry) => e.spellChoices || []) || []
      
      // Add racial spells to previously known spells for third casters
      const racialSpells: string[] = []
      
      // High Elf gets a wizard cantrip - relevant for Eldritch Knight (uses wizard spells)
      if (currentBuild?.race === 'elf' && currentBuild?.subrace === 'high_elf' && currentBuild?.highElfCantrip) {
        if (subclassId === 'eldritch_knight') { // Eldritch Knight uses wizard spell list
          racialSpells.push(currentBuild.highElfCantrip)
        }
      }
      
      previousSpells = [...previousSpells, ...racialSpells]
      
      // Calculate how many new spells can be learned this level
      const previousCantrips = previousSpells.filter((spellId: string) => {
        // We'd need to check if spell is cantrip, but for now assume based on common patterns
        return spellId.includes('cantrip') || ['fire_bolt', 'ray_of_frost', 'mage_hand', 'minor_illusion', 'prestidigitation', 'guidance', 'sacred_flame', 'spare_the_dying', 'druidcraft', 'produce_flame', 'vicious_mockery'].includes(spellId)
      })
      const previousLeveledSpells = previousSpells.filter((spellId: string) => !previousCantrips.includes(spellId))
      
      const newCantripsToLearn = Math.max(0, spellProgression.cantripsKnown - previousCantrips.length)
      const newSpellsToLearn = Math.max(0, spellProgression.spellsKnown - previousLeveledSpells.length)
      
      sections.push({
        id: 'third_caster_spells',
        title: `${subclassId === 'eldritch_knight' ? 'Eldritch Knight' : 'Arcane Trickster'} Spells`,
        type: 'third_caster_spells',
        isComplete: currentSpells.length >= (newCantripsToLearn + newSpellsToLearn),
        selectedSpells: currentSpells,
        previousSpells: previousSpells, // Pass previously known spells
        newCantripsToLearn: newCantripsToLearn,
        newSpellsToLearn: newSpellsToLearn,
        spellsKnown: spellProgression.spellsKnown,
        cantripsKnown: spellProgression.cantripsKnown,
        subclassId: subclassId
      })
    }
  }

  // 4. ASI/Feat Choice
  const hasASI = classFeatures.some((f: Feature) => f.rulesKey === 'asi')
  if (hasASI) {
    sections.push({
      id: 'asi_feat',
      title: 'Ability Score Improvement or Feat',
      type: 'asi_feat',
      isComplete: !!entry.asiOrFeat,
      currentChoice: entry.asiOrFeat,
      selectedFeat: entry.featId,
      abilityIncreases: entry.abilityIncreases,
      onASI: (increases: Record<AbilityScore, number>) => {
        selectASI(entry.level, increases)
        setExpandedSection(null)
      },
      onFeat: (featId: string) => {
        selectFeat(entry.level, featId)
        setExpandedSection(null)
      }
    })
  }

  // 4b. Wizard Spell Preparation (separate from spellbook) - for any wizard in multiclass
  const wizardLevelsUpToHere = currentBuild?.enhancedLevelTimeline
    ?.filter((e: BuilderLevelEntry) => e.level <= entry.level && e.classId === 'wizard') || []
  
  if (wizardLevelsUpToHere.length > 0) {
    // Get all spells in spellbook from all wizard levels up to this point
    const spellbookSpells = wizardLevelsUpToHere
      ?.flatMap((e: BuilderLevelEntry) => e.spellChoices || [])
      ?.filter((spellId: string) => {
        // Filter out cantrips as they can't be prepared
        const commonCantrips = ['fire_bolt', 'ray_of_frost', 'mage_hand', 'minor_illusion', 'prestidigitation']
        return !spellId.includes('cantrip') && !commonCantrips.includes(spellId)
      }) || []

    const totalWizardLevels = wizardLevelsUpToHere.length

    // Get currently prepared spells (stored on the latest entry)
    const preparedSpells = entry.preparedSpells || []
    
    if (spellbookSpells.length > 0 && entry.classId === 'wizard') {
      sections.push({
        id: 'wizard_preparation',
        title: `Prepare Wizard Spells`,
        type: 'wizard_preparation',
        isComplete: true, // Always optional - wizard can change these daily
        spellbookSpells: spellbookSpells,
        preparedSpells: preparedSpells,
        wizardLevel: totalWizardLevels // Total wizard levels, not class level
      })
    }
  }

  // 4c. Prepared Caster Spell Preparation (artificer, cleric, druid, paladin) - separate from cantrip selection
  const preparedCasterClasses = ['artificer', 'cleric', 'druid', 'paladin']
  const preparedCasterLevelsUpToHere = currentBuild?.enhancedLevelTimeline
    ?.filter((e: BuilderLevelEntry) => e.level <= entry.level && preparedCasterClasses.includes(e.classId)) || []
  
  
  if (preparedCasterLevelsUpToHere.length > 0) {
    // Group by class (in case of multiclass between prepared casters)
    const preparedCastersByClass: Record<string, BuilderLevelEntry[]> = {}
    preparedCasterLevelsUpToHere.forEach((e: BuilderLevelEntry) => {
      if (!preparedCastersByClass[e.classId]) {
        preparedCastersByClass[e.classId] = []
      }
      preparedCastersByClass[e.classId].push(e)
    })

    // For each prepared caster class, show spell preparation
    Object.entries(preparedCastersByClass).forEach(([classId, levels]) => {
      const totalClassLevels = levels.length
      
      // Get currently prepared spells (stored on the latest entry)
      const preparedSpells = entry.preparedSpells || []
      
      if (totalClassLevels > 0 && entry.classId === classId) {
        sections.push({
          id: `${classId}_preparation`,
          title: `Prepare ${classId.charAt(0).toUpperCase() + classId.slice(1)} Spells`,
          type: 'prepared_caster_preparation',
          isComplete: true, // Always optional - can change these daily
          classId: classId,
          preparedSpells: preparedSpells,
          classLevel: totalClassLevels // Total levels in this class
        })
      }
    })
  }

  // 5. Skills (Level 1 only)
  if (entry.level === 1 && classLevel === 1) {
    const classSkills = classData?.skillChoices || []
    const skillCount = classData?.skillChoiceCount || 2
    const selectedSkills = currentBuild?.skillProficiencies || []
    
    sections.push({
      id: 'skills',
      title: `Class Skills (Choose ${skillCount})`,
      type: 'skills',
      isComplete: selectedSkills.length >= skillCount,
      availableSkills: classSkills,
      selectedSkills: selectedSkills,
      skillCount: skillCount,
    })
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  const allComplete = sections.filter(s => s.type !== 'auto').every(s => s.isComplete)

  return (
    <div className="relative">
      {/* Timeline connector */}
      <div className="absolute left-4 top-6 w-px h-full bg-border/50 -z-10" />
      
      {/* Main Level Card */}
      <Card className={`border-2 transition-all ${
        allComplete ? 'border-emerald/40 bg-emerald/5' : 'border-border bg-card'
      }`}>
        <CardContent className="p-4">
          {/* Level Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold border-2 border-background shadow-sm">
              {entry.level}
            </div>
            <div className="flex items-center gap-2">
              {classData ? (
                <ClassIcon className={classData.id} size="md" fallback={<Clock className="w-5 h-5" />} />
              ) : (
                <Clock className="w-5 h-5" />
              )}
              <span className="font-semibold text-base">
                {classData?.name || entry.classId} {classLevel}
              </span>
              {entry.subclassId && (
                <Badge variant="outline" className="text-xs">
                  {entry.subclassId}
                </Badge>
              )}
            </div>
            <div className="ml-auto flex items-center gap-2">
              {canRemove && removeLevel && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`Remove level ${entry.level}? This action cannot be undone.`)) {
                      removeLevel(entry.level)
                    }
                  }}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  title={`Remove level ${entry.level}`}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
              
              {allComplete ? (
                <CheckCircle className="w-5 h-5 text-emerald" />
              ) : (
                <div className="flex items-center gap-1 text-xs text-muted">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>{sections.filter(s => !s.isComplete && s.type !== 'auto').length} pending</span>
                </div>
              )}
            </div>
          </div>

          {/* Multiclass Spell Summary - removed, now shown as info bubble next to spell slot benefits */}
          
          {/* Feature Sections */}
          <div className="space-y-3">
            {sections.map((section) => (
              <div key={section.id} className="border rounded-lg overflow-hidden">
                {/* Section Header */}
                <div
                  className={`p-3 cursor-pointer transition-colors ${
                    section.isComplete 
                      ? 'bg-emerald/10 border-emerald/20' 
                      : section.type === 'auto' 
                      ? 'bg-blue/5 border-blue/20'
                      : 'bg-red/10 border-red/20'
                  } ${section.type !== 'auto' ? 'hover:bg-opacity-80' : ''}`}
                  onClick={() => section.type !== 'auto' && toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        section.isComplete ? 'bg-emerald text-white' : 'bg-red-500 text-white'
                      }`}>
                        {section.isComplete ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                      </div>
                      <span className="font-medium text-sm">{section.title}</span>
                      {section.isComplete && section.currentChoice && (
                        <Badge variant="secondary" className="text-xs">
                          {section.currentChoice.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                    {section.type !== 'auto' && (
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        expandedSection === section.id ? 'rotate-90' : ''
                      }`} />
                    )}
                  </div>
                  
                  {/* Auto features display */}
                  {section.type === 'auto' && section.features && (
                    <div className="mt-2 pt-2 border-t border-current/20">
                      <div className="space-y-1">
                        {section.features.map((feature: Feature | {name: string, description: string}, idx: number) => (
                          <div key={idx} className="text-xs">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {feature.name}
                              </Badge>
                            </div>
                            {feature.description && (
                              <div className="mt-1 text-muted pl-1">
                                {feature.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Benefits display */}
                  {section.type === 'benefits' && section.benefits && (
                    <div className="mt-2 pt-2 border-t border-current/20">
                      <div className="space-y-1">
                        {section.benefits.map((benefit: {name: string, description: string, showMulticlassInfo?: boolean, icon?: any, isBonus?: boolean}, idx: number) => {
                          const IconComponent = benefit.icon
                          return (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              <IconComponent className={`w-3 h-3 ${benefit.isBonus ? 'text-gold' : 'text-red-500'}`} />
                              <span className="font-medium">{benefit.name}:</span>
                              <span className="text-muted">{benefit.description}</span>
                              {benefit.showMulticlassInfo && (
                                <MulticlassSpellInfo currentLevel={entry.level} />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Spell Slots display */}
                  {(section.type === 'spell_slots' || section.type === 'pact_magic_slots') && section.spellSlots && (
                    <div className="mt-2 pt-2 border-t border-current/20">
                      <div className="grid grid-cols-10 gap-1 text-xs min-w-0">
                        <div className="font-medium text-center">L1</div>
                        <div className="font-medium text-center">L2</div>
                        <div className="font-medium text-center">L3</div>
                        <div className="font-medium text-center">L4</div>
                        <div className="font-medium text-center">L5</div>
                        <div className="font-medium text-center">L6</div>
                        <div className="font-medium text-center">L7</div>
                        <div className="font-medium text-center">L8</div>
                        <div className="font-medium text-center">L9</div>
                        <div className="font-medium text-center">{section.type === 'pact_magic_slots' ? 'Pact' : 'Slots'}</div>
                        {section.spellSlots.map((slots: number, idx: number) => (
                          <div key={idx} className={`text-center ${slots > 0 ? 'text-accent font-medium' : 'text-muted'}`}>
                            {slots || '-'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Expertise Selection */}
                  {section.type === 'expertise' && (
                    <div className="mt-2 pt-2 border-t border-current/20">
                      {section.currentExpertise && section.currentExpertise.length > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <Crown className="w-3 h-3 text-purple-600" />
                            <span className="font-medium">Current Expertise:</span>
                          </div>
                          <div className="flex flex-wrap gap-1 ml-5">
                            {section.currentExpertise.map((skill: string) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill.charAt(0).toUpperCase() + skill.slice(1)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Choose {section.expertiseCount} skills for expertise</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Maneuver Selection */}
                  {section.type === 'maneuvers' && (
                    <div className="mt-2 pt-2 border-t border-current/20">
                      {section.currentManeuvers && section.currentManeuvers.length > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <Sword className="w-3 h-3 text-orange-600" />
                            <span className="font-medium">Current Maneuvers:</span>
                          </div>
                          <div className="flex flex-wrap gap-1 ml-5">
                            {section.currentManeuvers.map((maneuverId: string) => (
                              <Badge key={maneuverId} variant="secondary" className="text-xs">
                                {maneuvers[maneuverId]?.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Choose {section.maneuverCount} maneuvers</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Metamagic Selection */}
                  {section.type === 'metamagic' && (
                    <div className="mt-2 pt-2 border-t border-current/20">
                      {section.currentMetamagic && section.currentMetamagic.length > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            <span className="font-medium">Current Metamagic:</span>
                          </div>
                          <div className="flex flex-wrap gap-1 ml-5">
                            {section.currentMetamagic.map((metamagicId: string) => (
                              <Badge key={metamagicId} variant="secondary" className="text-xs">
                                {metamagicOptions[metamagicId]?.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Choose {section.metamagicCount} metamagic options</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Eldritch Invocation Selection */}
                  {section.type === 'eldritch_invocations' && (
                    <div className="mt-2 pt-2 border-t border-current/20">
                      {section.currentInvocations && section.currentInvocations.length > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <Star className="w-3 h-3 text-purple-600" />
                            <span className="font-medium">Current Invocations:</span>
                          </div>
                          <div className="flex flex-wrap gap-1 ml-5">
                            {section.currentInvocations.map((invocationId: string) => (
                              <Badge key={invocationId} variant="secondary" className="text-xs">
                                {eldritchInvocations[invocationId]?.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Choose {section.invocationCount} eldritch invocations</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mystic Arcanum Selection */}
                  {section.type === 'mystic_arcanum' && (
                    <div className="mt-2 pt-2 border-t border-current/20">
                      {section.currentSpell ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <Crown className="w-3 h-3 text-purple-600" />
                            <span className="font-medium">Mystic Arcanum:</span>
                          </div>
                          <div className="flex flex-wrap gap-1 ml-5">
                            <Badge variant="secondary" className="text-xs">
                              {allMysticArcanumSpells[section.spellLevel as keyof typeof allMysticArcanumSpells]?.[section.currentSpell]?.name}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Choose {section.spellLevel === 6 ? '6th' : section.spellLevel === 7 ? '7th' : section.spellLevel === 8 ? '8th' : '9th'}-level Mystic Arcanum spell</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pact Boon Selection */}
                  {section.type === 'pact_boon' && (
                    <div className="mt-2 pt-2 border-t border-current/20">
                      {section.currentPactBoon ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <Crown className="w-3 h-3 text-purple-600" />
                            <span className="font-medium">Pact Boon:</span>
                          </div>
                          <div className="flex flex-wrap gap-1 ml-5">
                            <Badge variant="secondary" className="text-xs">
                              {pactBoons[section.currentPactBoon]?.name}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Choose your Pact Boon</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Favored Enemy Selection */}
                  {section.type === 'favored_enemy' && (
                    <div className="mt-2 pt-2 border-t border-current/20">
                      {section.currentSelection ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <Target className="w-3 h-3 text-green-600" />
                            <span className="font-medium">Favored Enemy:</span>
                          </div>
                          <div className="flex flex-wrap gap-1 ml-5">
                            <Badge variant="secondary" className="text-xs">
                              {favoredEnemies[section.currentSelection]?.name}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Choose your Favored Enemy</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Natural Explorer Selection */}
                  {section.type === 'natural_explorer' && (
                    <div className="mt-2 pt-2 border-t border-current/20">
                      {section.currentSelection ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <TreePine className="w-3 h-3 text-green-600" />
                            <span className="font-medium">Natural Explorer:</span>
                          </div>
                          <div className="flex flex-wrap gap-1 ml-5">
                            <Badge variant="secondary" className="text-xs">
                              {naturalExplorerTerrains[section.currentSelection]?.name}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Choose your Natural Explorer terrain</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Expandable Content */}
                {expandedSection === section.id && renderSectionContent(section)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  function renderSectionContent(section: LevelSection) {
    switch (section.type) {
      case 'expertise':
        return (
          <div className="p-3 bg-panel/5">
            <ExpertiseSelection
              level={entry.level}
              expertiseCount={section.expertiseCount}
              currentExpertise={section.currentExpertise}
              onExpertiseSelected={(expertise) => {
                updateLevel(entry.level, { expertiseChoices: expertise })
                // Only close when all choices are made
                if (expertise.length === section.expertiseCount) {
                  setExpandedSection(null)
                }
              }}
              className="border-none bg-transparent"
            />
          </div>
        )

      case 'maneuvers':
        return (
          <div className="p-3 bg-panel/5">
            <ManeuverSelection
              level={entry.level}
              maneuverCount={section.maneuverCount}
              currentManeuvers={section.currentManeuvers}
              onManeuversSelected={(maneuvers) => {
                updateLevel(entry.level, { maneuverChoices: maneuvers })
                // Only close when all choices are made
                if (maneuvers.length === section.maneuverCount) {
                  setExpandedSection(null)
                }
              }}
              className="border-none bg-transparent"
            />
          </div>
        )

      case 'metamagic':
        return (
          <div className="p-3 bg-panel/5">
            <MetamagicSelection
              metamagicCount={section.metamagicCount}
              currentMetamagic={section.currentMetamagic}
              onMetamagicSelected={(metamagic) => {
                updateLevel(entry.level, { metamagicChoices: metamagic })
                // Only close when all choices are made
                if (metamagic.length === section.metamagicCount) {
                  setExpandedSection(null)
                }
              }}
              className="border-none bg-transparent"
            />
          </div>
        )

      case 'eldritch_invocations':
        return (
          <div className="p-3 bg-panel/5">
            <EldritchInvocationSelection
              level={section.level}
              invocationCount={section.invocationCount}
              currentInvocations={section.currentInvocations}
              pactBoon={section.pactBoon}
              onInvocationsSelected={(invocations) => {
                updateLevel(entry.level, { eldritchInvocationChoices: invocations })
                // Only close when all choices are made
                if (invocations.length === section.invocationCount) {
                  setExpandedSection(null)
                }
              }}
              className="border-none bg-transparent"
            />
          </div>
        )

      case 'mystic_arcanum':
        return (
          <div className="p-3 bg-panel/5">
            <MysticArcanumSelection
              spellLevel={section.spellLevel}
              currentSpell={section.currentSpell}
              onSpellSelected={(spellId) => {
                const currentChoices = entry.mysticArcanumChoices || {}
                const updatedChoices = { ...currentChoices }
                
                if (spellId) {
                  updatedChoices[section.spellLevel] = spellId
                } else {
                  delete updatedChoices[section.spellLevel]
                }
                
                updateLevel(entry.level, { mysticArcanumChoices: updatedChoices })
                // Close when spell is selected
                if (spellId) {
                  setExpandedSection(null)
                }
              }}
              className="border-none bg-transparent"
            />
          </div>
        )

      case 'pact_boon':
        return (
          <div className="p-3 bg-panel/5">
            <PactBoonSelection
              currentPactBoon={section.currentPactBoon}
              onPactBoonSelected={(pactBoonId) => {
                updateLevel(entry.level, { pactBoonChoice: pactBoonId })
                // Close when pact boon is selected
                if (pactBoonId) {
                  setExpandedSection(null)
                }
              }}
              className="border-none bg-transparent"
            />
          </div>
        )

      case 'favored_enemy':
        return (
          <div className="p-3 bg-panel/5">
            <RangerFeatureSelection
              featureType="favored_enemy"
              currentSelection={section.currentSelection}
              onSelectionChanged={(selection) => {
                updateLevel(entry.level, { favoredEnemyChoice: selection })
                // Close when selection is made
                if (selection) {
                  setExpandedSection(null)
                }
              }}
              className="border-none bg-transparent"
            />
          </div>
        )

      case 'natural_explorer':
        return (
          <div className="p-3 bg-panel/5">
            <RangerFeatureSelection
              featureType="natural_explorer"
              currentSelection={section.currentSelection}
              onSelectionChanged={(selection) => {
                updateLevel(entry.level, { naturalExplorerChoice: selection })
                // Close when selection is made
                if (selection) {
                  setExpandedSection(null)
                }
              }}
              className="border-none bg-transparent"
            />
          </div>
        )

      case 'spell_selection':
        return (
          <div className="p-3 bg-panel/5">
            <SpellSelection
              classId={entry.classId}
              level={classLevel}
              selectedSpells={section.selectedSpells || []}
              onSpellsChange={(spells) => {
                updateLevel(entry.level, { spellChoices: spells })
              }}
              spellsKnown={section.spellsKnown}
              cantripsKnown={section.cantripsKnown}
              previousSpells={section.previousSpells}
              newCantripsToLearn={section.newCantripsToLearn}
              newSpellsToLearn={section.newSpellsToLearn}
              subclassId={entry.subclassId}
            />
          </div>
        )

      case 'wizard_spellbook':
        return (
          <div className="p-3 bg-panel/5">
            <SpellSelection
              classId={entry.classId}
              level={classLevel}
              selectedSpells={section.selectedSpells || []}
              onSpellsChange={(spells) => {
                updateLevel(entry.level, { spellChoices: spells })
              }}
              spellsKnown={section.spellsKnown}
              cantripsKnown={section.cantripsKnown}
              previousSpells={section.previousSpells}
              newCantripsToLearn={section.newCantripsToLearn}
              newSpellsToLearn={section.newSpellsToLearn}
              subclassId={entry.subclassId}
            />
          </div>
        )

      case 'wizard_preparation':
        return (
          <div className="p-3 bg-panel/5">
            <WizardSpellPreparation
              level={section.wizardLevel}
              spellbookSpells={section.spellbookSpells || []}
              preparedSpells={section.preparedSpells || []}
              onPreparedSpellsChange={(spells) => {
                updateLevel(entry.level, { preparedSpells: spells })
              }}
            />
          </div>
        )

      case 'prepared_caster_preparation':
        return (
          <div className="p-3 bg-panel/5">
            <PreparedCasterSpellPreparation
              classId={section.classId}
              level={section.classLevel}
              preparedSpells={section.preparedSpells || []}
              onPreparedSpellsChange={(spells) => {
                updateLevel(entry.level, { preparedSpells: spells })
              }}
            />
          </div>
        )

      case 'third_caster_spells':
        return (
          <div className="p-3 bg-panel/5">
            <ThirdCasterSpellSelection
              subclassId={section.subclassId}
              level={entry.level}
              selectedSpells={section.selectedSpells || []}
              onSpellsChange={(spells) => {
                updateLevel(entry.level, { spellChoices: spells })
              }}
              spellsKnown={section.spellsKnown}
              cantripsKnown={section.cantripsKnown}
              previousSpells={section.previousSpells}
              newCantripsToLearn={section.newCantripsToLearn}
              newSpellsToLearn={section.newSpellsToLearn}
            />
          </div>
        )

      case 'choice':
        return (
          <div className="p-3 bg-panel/5">
            <div className="space-y-2">
              {section.options?.map((option: any) => (
                <label
                  key={option.id}
                  className="flex items-start gap-2 p-2 rounded hover:bg-accent/5 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`${section.id}-${entry.level}`}
                    value={option.id}
                    checked={section.currentChoice === option.id}
                    onChange={() => section.onChoice(option.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{option.name}</div>
                    <div className="text-xs text-muted">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )

      case 'asi_feat':
        return (
          <div className="p-3 bg-panel/5">
            <div className="space-y-3">
              {/* ASI/Feat Choice */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`asi-feat-${entry.level}`}
                    checked={section.currentChoice === 'asi'}
                    onChange={() => {
                      updateLevel(entry.level, { asiOrFeat: 'asi' })
                    }}
                  />
                  <span className="text-sm font-medium">Ability Score Improvement</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`asi-feat-${entry.level}`}
                    checked={section.currentChoice === 'feat'}
                    onChange={() => {
                      // Just set the choice to 'feat' mode, actual feat selection happens below
                      updateLevel(entry.level, { asiOrFeat: 'feat' })
                    }}
                  />
                  <span className="text-sm font-medium">Feat</span>
                </label>
              </div>

              {/* ASI Selection Interface */}
              {section.currentChoice === 'asi' && (
                <div className="pl-6 border-l-2 border-accent/20">
                  <div className="text-xs font-medium text-muted mb-2">Choose Ability Increases:</div>
                  <div className="text-xs text-muted mb-2">You can increase one ability by 2, or two different abilities by 1 each.</div>
                  <div className="space-y-2">
                    {/* Single +2 Option */}
                    <div className="space-y-1">
                      <div className="text-xs font-medium">Increase one ability by 2:</div>
                      <div className="grid grid-cols-3 gap-2">
                        {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((ability) => (
                          <label key={`single-${ability}`} className="flex items-center gap-1 text-xs cursor-pointer">
                            <input
                              type="radio"
                              name={`asi-single-${entry.level}`}
                              onChange={() => {
                                const increases = { [ability]: 2 }
                                updateLevel(entry.level, { abilityIncreases: increases })
                              }}
                              checked={section.abilityIncreases?.[ability] === 2 && Object.keys(section.abilityIncreases || {}).length === 1}
                            />
                            <span>{ability} +2</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    {/* Two +1 Options */}
                    <div className="space-y-1">
                      <div className="text-xs font-medium">Or increase two abilities by 1 each:</div>
                      <div className="text-xs text-muted mb-2">Click two different abilities:</div>
                      <div className="grid grid-cols-3 gap-2">
                        {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map((ability) => (
                          <label key={`double-${ability}`} className="flex items-center gap-1 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                const currentIncreases = section.abilityIncreases || {}
                                const newIncreases = { ...currentIncreases }
                                
                                if (e.target.checked) {
                                  // Add this ability (+1), but limit to 2 total abilities
                                  const selectedCount = Object.keys(newIncreases).length
                                  if (selectedCount < 2) {
                                    newIncreases[ability] = 1
                                  }
                                } else {
                                  // Remove this ability
                                  delete newIncreases[ability]
                                }
                                
                                updateLevel(entry.level, { abilityIncreases: newIncreases })
                              }}
                              checked={section.abilityIncreases?.[ability] === 1}
                              disabled={
                                !section.abilityIncreases?.[ability] && 
                                Object.keys(section.abilityIncreases || {}).length >= 2
                              }
                            />
                            <span>{ability} +1</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Show appropriate sub-selection */}
              {section.currentChoice === 'feat' && (
                <div className="pl-6 border-l-2 border-accent/20">
                  <div className="text-xs font-medium text-muted mb-2">Choose Feat:</div>
                  <Select 
                    value={section.selectedFeat || ""} 
                    onValueChange={(featId) => {
                      const selectedFeat = Object.values(feats).find((f: Feat) => f.id === featId)
                      
                      // If feat has ability score increase options, we need to handle that
                      if (selectedFeat?.abilityScoreIncrease) {
                        // Just store the feat selection for now, ability score choice comes next
                        updateLevel(entry.level, { 
                          asiOrFeat: 'feat', 
                          featId: featId,
                          // Clear any previous ability increases while user makes choice
                          abilityIncreases: undefined
                        })
                      } else {
                        // Regular feat without ability score increase
                        section.onFeat(featId)
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a feat..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {Object.values(feats).sort((a: Feat, b: Feat) => a.name.localeCompare(b.name)).map((feat: Feat) => {
                        const isKnown = knownFeats.includes(feat.id)
                        return (
                          <SelectItem key={feat.id} value={feat.id} disabled={isKnown}>
                            <div className="flex flex-col gap-1">
                              <div className="font-medium">
                                <div className="flex items-center gap-2">
                                  <span className={isKnown ? "text-muted-foreground" : ""}>{feat.name}</span>
                                  {isKnown && <span className="text-xs text-muted-foreground">(Known)</span>}
                                </div>
                                {feat.abilityScoreIncrease && (
                                  <span className={`ml-2 text-xs px-1 rounded ${isKnown ? 'bg-muted text-muted-foreground' : 'bg-accent/10 text-accent'}`}>
                                    +1 Ability Score
                                  </span>
                                )}
                              </div>
                              <div className={`text-xs line-clamp-2 ${isKnown ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                                {feat.description}
                              </div>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  
                  {/* Half-feat ability score selection */}
                  {section.selectedFeat && (() => {
                    const selectedFeat = Object.values(feats).find((f: Feat) => f.id === section.selectedFeat)
                    if (!selectedFeat?.abilityScoreIncrease) return null
                    
                    return (
                      <div className="mt-3 p-3 bg-accent/5 rounded-lg border border-accent/20">
                        <div className="text-xs font-medium text-muted mb-2">
                          Choose +1 Ability Score Increase:
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedFeat.abilityScoreIncrease.choices.map((ability: AbilityScore) => (
                            <label 
                              key={ability}
                              className="flex items-center gap-2 p-2 rounded hover:bg-accent/10 cursor-pointer text-sm"
                            >
                              <input 
                                type="radio" 
                                name={`half-feat-asi-${entry.level}`}
                                checked={section.abilityIncreases?.[ability] === 1}
                                onChange={() => {
                                  // Set both the feat and the ability score increase
                                  updateLevel(entry.level, {
                                    asiOrFeat: 'feat',
                                    featId: section.selectedFeat,
                                    abilityIncreases: { [ability]: 1 }
                                  })
                                  setExpandedSection(null)
                                }}
                              />
                              <span>{ability} +1</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        )

      case 'skills':
        return (
          <div className="p-3 bg-panel/5">
            <div className="text-xs text-muted mb-2">
              Select {section.skillCount} skills ({section.selectedSkills.length}/{section.skillCount})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {section.availableSkills.map((skill: string) => (
                <label key={skill} className="flex items-center gap-2 p-1 rounded hover:bg-accent/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={section.selectedSkills.includes(skill)}
                    disabled={!section.selectedSkills.includes(skill) && section.selectedSkills.length >= section.skillCount}
                    onChange={() => {
                      const currentSkills = section.selectedSkills
                      const newSkills = currentSkills.includes(skill)
                        ? currentSkills.filter((s: string) => s !== skill)
                        : [...currentSkills, skill]
                      setSkillProficiencies(newSkills)
                    }}
                  />
                  <span className="text-xs">{skill}</span>
                </label>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }
}

export function EnhancedLevelTimeline() {
  const { currentBuild, addLevel, removeLevel, selectFeat, selectASI, updateLevel, setSkillProficiencies } = useCharacterBuilderStore()
  const [selectedClass, setSelectedClass] = useState('')
  
  if (!currentBuild) {
    return <div className="text-center text-muted">Loading class progression...</div>
  }
  
  const levels = [...(currentBuild.enhancedLevelTimeline || [])].sort((a, b) => a.level - b.level)
  const nextLevel = levels.length > 0 ? Math.max(...levels.map(l => l.level)) + 1 : 1
  const availableClasses = Object.values(classes).sort((a, b) => a.name.localeCompare(b.name))
  

  const handleAddLevel = () => {
    if (selectedClass && nextLevel <= 20) {
      addLevel(selectedClass, nextLevel)
      setSelectedClass('')
    }
  }


  // Trigger validation when levels change
  useEffect(() => {
    if (currentBuild) {
      const { validateCurrentStep } = useCharacterBuilderStore.getState()
      validateCurrentStep()
    }
  }, [currentBuild, levels])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-2">Class Progression</h2>
        <p className="text-muted">
          Build your character level by level. Choose classes, track features, and make ASI/feat decisions.
        </p>
      </div>
      
      {/* Add Level Section */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Choose Class:</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class..." />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses.map(cls => {
                    return (
                      <SelectItem key={cls.id} value={cls.id}>
                        <div className="flex items-center gap-2">
                          <ClassIcon className={cls.id} size="sm" fallback={<Sword className="w-4 h-4" />} />
                          <span>{cls.name}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleAddLevel} 
              disabled={!selectedClass || nextLevel > 20}
              className="w-full"
            >
              {nextLevel > 20 ? 'Maximum Level Reached' : 'Add Level'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Timeline */}
      {levels.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <span>Level Timeline</span>
            <Badge variant="outline">{levels.length} levels</Badge>
          </h3>
          
          <div className="space-y-4 relative">
            {levels.map((entry) => {
              const classData = getClass(entry.classId)
              const classLevel = levels.filter(l => l.classId === entry.classId && l.level <= entry.level).length
              const maxLevel = Math.max(...levels.map(l => l.level))
              const isHighestLevel = entry.level === maxLevel
              const canRemove = isHighestLevel && levels.length > 1 // Can't remove if it's the only level
              
              return (
                <LevelMilestoneCard 
                  key={entry.level}
                  entry={entry}
                  classData={classData}
                  classLevel={classLevel}
                  currentBuild={currentBuild}
                  updateLevel={updateLevel}
                  selectFeat={selectFeat}
                  selectASI={selectASI}
                  setSkillProficiencies={setSkillProficiencies}
                  removeLevel={removeLevel}
                  canRemove={canRemove}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}