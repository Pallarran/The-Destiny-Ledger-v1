import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { getRace, getClass } from '../../rules/loaders'
import type { ClassDefinition } from '../../rules/types'
import { getAllSkills, getProficiencyBonus } from '../../rules/srd/skills'
import { getCanonicalBuild } from '../../utils/buildConverter'
import { armor } from '../../rules/srd/armor'
import { 
  Dices, 
  Sword,
  Shield,
  Brain,
  Sparkles,
  User
} from 'lucide-react'

// Spell slot progression tables
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

const WARLOCK_PACT_SLOTS = {
  1: [1, 0, 0, 0, 0],
  2: [0, 2, 0, 0, 0],
  3: [0, 2, 0, 0, 0],
  4: [0, 2, 0, 0, 0],
  5: [0, 0, 2, 0, 0],
  6: [0, 0, 2, 0, 0],
  7: [0, 0, 2, 0, 0],
  8: [0, 0, 2, 0, 0],
  9: [0, 0, 0, 2, 0],
  10: [0, 0, 0, 2, 0],
  11: [0, 0, 0, 3, 0],
  12: [0, 0, 0, 3, 0],
  13: [0, 0, 0, 3, 0],
  14: [0, 0, 0, 3, 0],
  15: [0, 0, 0, 3, 0],
  16: [0, 0, 0, 3, 0],
  17: [0, 0, 0, 0, 4],
  18: [0, 0, 0, 0, 4],
  19: [0, 0, 0, 0, 4],
  20: [0, 0, 0, 0, 4]
} as const

// Helper function to calculate total spell slots for multiclass builds
function calculateTotalSpellSlots(timeline: any[]) {
  // Group levels by class and subclass
  const classLevels: Record<string, number> = {}
  const subclassInfo: Record<string, string> = {}
  
  timeline.forEach(entry => {
    const key = `${entry.classId}`
    classLevels[key] = (classLevels[key] || 0) + 1
    // Store subclass info (later entries will overwrite earlier ones, which is fine)
    if (entry.subclassId) {
      subclassInfo[key] = entry.subclassId
    }
  })

  // For Fighter and Rogue, look for subclass in later levels if not found
  Object.keys(classLevels).forEach(classId => {
    if ((classId === 'fighter' || classId === 'rogue') && !subclassInfo[classId]) {
      // Search through timeline for subclass selection (usually at level 3+)
      const subclassEntry = timeline.find(entry => entry.classId === classId && entry.subclassId)
      if (subclassEntry) {
        subclassInfo[classId] = subclassEntry.subclassId
      }
    }
  })

  // Check if single class (simpler calculation)
  const classKeys = Object.keys(classLevels)
  if (classKeys.length === 1) {
    const classId = classKeys[0]
    const levels = classLevels[classId]
    const subclassId = subclassInfo[classId]
    
    // Handle warlock pact magic
    if (classId === 'warlock') {
      const slots = WARLOCK_PACT_SLOTS[levels as keyof typeof WARLOCK_PACT_SLOTS]
      return {
        spellSlots: null,
        warlockSlots: slots || null
      }
    }

    // Get single class spell slots
    let slots: readonly number[] | null = null
    
    if (['wizard', 'cleric', 'bard', 'sorcerer', 'druid'].includes(classId)) {
      slots = FULL_CASTER_SLOTS[levels as keyof typeof FULL_CASTER_SLOTS]
    }
    else if (['paladin', 'ranger', 'artificer'].includes(classId)) {
      slots = HALF_CASTER_SLOTS[levels as keyof typeof HALF_CASTER_SLOTS]
    }
    else if (classId === 'fighter' && subclassId === 'eldritch_knight') {
      slots = THIRD_CASTER_SLOTS[levels as keyof typeof THIRD_CASTER_SLOTS]
    }
    else if (classId === 'rogue' && subclassId === 'arcane_trickster') {
      slots = THIRD_CASTER_SLOTS[levels as keyof typeof THIRD_CASTER_SLOTS]
    }
    
    return {
      spellSlots: slots ? [...slots] : null,
      warlockSlots: null
    }
  }

  // Multiclass calculation (simplified - use highest single class for now)
  let bestSlots: number[] | null = null
  let warlockSlots: number[] | null = null
  
  Object.entries(classLevels).forEach(([classId, levels]) => {
    const subclassId = subclassInfo[classId]
    
    if (classId === 'warlock') {
      const slots = WARLOCK_PACT_SLOTS[levels as keyof typeof WARLOCK_PACT_SLOTS]
      if (slots) {
        warlockSlots = [...slots]
      }
      return
    }

    let slots: readonly number[] | null = null
    
    if (['wizard', 'cleric', 'bard', 'sorcerer', 'druid'].includes(classId)) {
      slots = FULL_CASTER_SLOTS[levels as keyof typeof FULL_CASTER_SLOTS]
    }
    else if (['paladin', 'ranger', 'artificer'].includes(classId)) {
      slots = HALF_CASTER_SLOTS[levels as keyof typeof HALF_CASTER_SLOTS]
    }
    else if (classId === 'fighter' && subclassId === 'eldritch_knight') {
      slots = THIRD_CASTER_SLOTS[levels as keyof typeof THIRD_CASTER_SLOTS]
    }
    else if (classId === 'rogue' && subclassId === 'arcane_trickster') {
      slots = THIRD_CASTER_SLOTS[levels as keyof typeof THIRD_CASTER_SLOTS]
    }

    // Use the highest spell progression found
    if (slots && (!bestSlots || slots.some(s => s > 0))) {
      bestSlots = [...slots]
    }
  })

  return {
    spellSlots: bestSlots,
    warlockSlots: warlockSlots
  }
}

export function BuildSummary() {
  const { 
    currentBuild
  } = useCharacterBuilderStore()
  
  if (!currentBuild) {
    return <div className="text-center text-muted">Loading character sheet...</div>
  }
  
  // Get canonical build for expertise information  
  const canonicalBuild = getCanonicalBuild(currentBuild)
  
  // Calculate basic stats
  const timeline = currentBuild.enhancedLevelTimeline || []
  const totalLevel = timeline.length > 0 ? Math.max(...timeline.map(l => l.level), 1) : 1
  const classBreakdown = timeline.reduce((acc, level) => {
    acc[level.classId] = (acc[level.classId] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const mainClass = Object.entries(classBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
  const mainClassData = getClass(mainClass) as ClassDefinition | undefined
  const proficiencyBonus = getProficiencyBonus(totalLevel)
  
  const getAbilityModifier = (score: number) => Math.floor((score - 10) / 2)
  const formatModifier = (mod: number) => mod >= 0 ? `+${mod}` : `${mod}`
  
  // Get final ability scores (with racial bonuses)
  const abilityScores = currentBuild.finalAbilityScores || currentBuild.abilityScores
  
  // Calculate saving throw bonuses
  const savingThrows = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map(ability => {
    const isProficient = mainClassData?.savingThrowProficiencies?.includes(ability as keyof typeof abilityScores) || false
    const abilityMod = getAbilityModifier(abilityScores[ability as keyof typeof abilityScores])
    const bonus = abilityMod + (isProficient ? proficiencyBonus : 0)
    return {
      ability,
      isProficient,
      bonus,
      modifier: formatModifier(bonus)
    }
  })
  
  // Get background skills (hardcoded for now since backgrounds aren't in a proper data file)
  const getBackgroundSkills = (background: string): string[] => {
    const backgroundSkills: Record<string, string[]> = {
      'acolyte': ['Insight', 'Religion'],
      'criminal': ['Deception', 'Stealth'],
      'folk_hero': ['Animal Handling', 'Survival'],
      'noble': ['History', 'Persuasion'],
      'sage': ['Arcana', 'History'],
      'soldier': ['Athletics', 'Intimidation'],
      'hermit': ['Medicine', 'Religion'],
      'entertainer': ['Acrobatics', 'Performance'],
      'guild_artisan': ['Insight', 'Persuasion'],
      'outlander': ['Athletics', 'Survival']
    }
    return backgroundSkills[background] || []
  }
  
  const backgroundSkills = getBackgroundSkills(currentBuild.background || '')
  
  // Calculate skill bonuses
  const skillBonuses = getAllSkills().map(skill => {
    const abilityMod = getAbilityModifier(abilityScores[skill.ability as keyof typeof abilityScores])
    // Check proficiency from class skills OR background skills
    // Note: skillProficiencies stores lowercase skill names, skill.name is capitalized
    const isProficient = currentBuild.skillProficiencies?.some(profSkill => 
      profSkill.toLowerCase() === skill.name.toLowerCase()
    ) || backgroundSkills.some(bgSkill => 
      bgSkill.toLowerCase() === skill.name.toLowerCase()
    ) || false
    
    // Check expertise from canonical build AND legacy timeline (for backwards compatibility)
    const hasCanonicalExpertise = canonicalBuild.profs.expertise.some(expertiseSkill => 
      expertiseSkill.toLowerCase() === skill.name.toLowerCase()
    )
    const hasLegacyExpertise = currentBuild?.levelTimeline?.some(entry => 
      entry.expertiseChoices?.some(expertiseSkill => 
        expertiseSkill.toLowerCase() === skill.name.toLowerCase()
      )
    ) || false
    const hasDowntimeExpertise = currentBuild?.downtimeTraining?.trainedSkillExpertise?.some(expertiseSkill =>
      expertiseSkill.toLowerCase() === skill.name.toLowerCase()
    ) || false
    
    const hasExpertise = hasCanonicalExpertise || hasLegacyExpertise || hasDowntimeExpertise
    
    let bonus = abilityMod
    if (isProficient) bonus += proficiencyBonus
    if (hasExpertise) bonus += proficiencyBonus
    
    return {
      ...skill,
      isProficient,
      hasExpertise,
      bonus,
      modifier: formatModifier(bonus)
    }
  })
  
  // Calculate combat stats with actual equipment
  const dexMod = getAbilityModifier(abilityScores.DEX)
  const selectedArmor = currentBuild.selectedArmor ? armor[currentBuild.selectedArmor] : null
  
  // Calculate AC properly with equipment
  const calculateAC = () => {
    let baseAC = 10
    
    if (selectedArmor) {
      baseAC = selectedArmor.ac
      if (selectedArmor.dexModifier === 'full') {
        baseAC += dexMod
      } else if (selectedArmor.dexModifier === 'limited') {
        baseAC += Math.min(dexMod, selectedArmor.dexMax || 2)
      }
      // No dex bonus for heavy armor (dexModifier === 'none')
    } else {
      baseAC += dexMod // Unarmored
    }
    
    if (currentBuild.hasShield) {
      baseAC += 2
    }
    
    // Add armor enhancement bonus
    if (selectedArmor && currentBuild.armorEnhancementBonus > 0) {
      baseAC += currentBuild.armorEnhancementBonus
    }
    
    return baseAC
  }
  
  const actualAC = calculateAC()
  const initiative = dexMod
  
  // Calculate HP (assuming average HP per level for now)
  const conMod = getAbilityModifier(abilityScores.CON)
  const baseHP = mainClassData?.hitDie || 8
  const totalHP = baseHP + conMod + (totalLevel - 1) * (Math.floor(baseHP / 2) + 1 + conMod)
  
  // Calculate spell slots
  const spellSlotData = calculateTotalSpellSlots(timeline)
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-panel mb-2">Character Sheet</h2>
        <p className="text-muted">Complete overview of {currentBuild.name || 'your character'}</p>
      </div>
      
      {/* Core Identity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Character Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="w-4 h-4" />
              Character Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Level</span>
              <span className="font-bold">{totalLevel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Class</span>
              <span className="capitalize">{mainClass.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Race</span>
              <span className="capitalize">
                {currentBuild.race ? getRace(currentBuild.race)?.name || currentBuild.race : 'None'}
                {currentBuild.subrace && ` (${currentBuild.subrace.replace('_', ' ')})`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Background</span>
              <span className="capitalize">{(currentBuild.background || 'None').replace('_', ' ')}</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Combat Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sword className="w-4 h-4" />
              Combat Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Armor Class</span>
              <span className="font-bold text-accent">{actualAC}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Initiative</span>
              <span className="font-bold">{formatModifier(initiative)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Hit Points</span>
              <span className="font-bold text-danger">{totalHP}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Proficiency</span>
              <span className="font-bold">+{proficiencyBonus}</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Equipment */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Equipment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Weapon</span>
              <span>{currentBuild.selectedMainHand || 'None'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Armor</span>
              <span>{currentBuild.selectedArmor || 'None'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Shield</span>
              <span>{currentBuild.hasShield ? 'Yes' : 'No'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Ability Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dices className="w-5 h-5" />
            Ability Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {Object.entries(abilityScores).map(([ability, score]) => {
              const modifier = getAbilityModifier(score)
              
              return (
                <div key={ability} className="text-center p-3 bg-panel/5 rounded-lg">
                  <div className="text-xs font-medium text-muted mb-1">{ability}</div>
                  <div className="text-2xl font-bold text-accent">{score}</div>
                  <div className="text-sm font-medium">{formatModifier(modifier)}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Saving Throws */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Saving Throws
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3">
            {savingThrows.map(save => (
              <div key={save.ability} className="text-center p-2 bg-panel/5 rounded">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className={`w-2 h-2 rounded-full ${save.isProficient ? 'bg-emerald' : 'bg-muted'}`} />
                  <span className="text-sm font-medium">{save.ability}</span>
                </div>
                <Badge variant={save.isProficient ? "default" : "secondary"} className="text-xs">
                  {save.modifier}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald" />
              Proficient
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {skillBonuses.map(skill => (
              <div key={skill.name} className="flex items-center gap-3 p-2 bg-panel/5 rounded hover:bg-panel/10 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  skill.hasExpertise ? 'bg-gold' : 
                  skill.isProficient ? 'bg-emerald' : 
                  'bg-muted'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{skill.name}</div>
                  <div className="text-xs text-muted">({skill.ability})</div>
                </div>
                <Badge 
                  variant={skill.isProficient ? "default" : "secondary"} 
                  className={`text-xs shrink-0 ${skill.hasExpertise ? 'bg-gold text-ink' : ''}`}
                >
                  {skill.modifier}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-4 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-muted" />
              Untrained
            </span>
            <span className="inline-flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald" />
              Proficient
            </span>
            <span className="inline-flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gold" />
              Expertise
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Spell Slots */}
      {(spellSlotData.spellSlots || spellSlotData.warlockSlots) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Spell Slots
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {spellSlotData.spellSlots && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Spell Slots</h4>
                <div className="grid grid-cols-10 gap-1 text-xs min-w-0">
                  <div className="font-medium text-center">Lv</div>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                    <div key={level} className="font-medium text-center">{level}</div>
                  ))}
                  <div className="font-medium text-center">Slots</div>
                  {spellSlotData.spellSlots.map((slots, idx) => (
                    <div key={idx} className={`text-center ${slots > 0 ? 'text-accent font-medium' : 'text-muted'}`}>
                      {slots || '-'}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {spellSlotData.warlockSlots && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Warlock Pact Magic</h4>
                <div className="grid grid-cols-6 gap-1 text-xs min-w-0">
                  <div className="font-medium text-center">Lv</div>
                  {[1, 2, 3, 4, 5].map(level => (
                    <div key={level} className="font-medium text-center">{level}</div>
                  ))}
                  <div className="font-medium text-center">Slots</div>
                  {spellSlotData.warlockSlots.map((slots, idx) => (
                    <div key={idx} className={`text-center ${slots > 0 ? 'text-purple font-medium' : 'text-muted'}`}>
                      {slots || '-'}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted mt-2">
                  Pact magic slots are regained on short rest and are all cast at the highest available level.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
    </div>
  )
}