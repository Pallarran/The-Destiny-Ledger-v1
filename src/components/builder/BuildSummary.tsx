import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { getRace, getClass } from '../../rules/loaders'
import type { ClassDefinition } from '../../rules/types'
import { getAllSkills, getProficiencyBonus } from '../../rules/srd/skills'
import { armor } from '../../rules/srd/armor'
import { 
  Dices, 
  Sword,
  Shield,
  Brain,
  Sparkles,
  User
} from 'lucide-react'

export function BuildSummary() {
  const { 
    currentBuild
  } = useCharacterBuilderStore()
  
  if (!currentBuild) {
    return <div className="text-center text-muted">Loading character sheet...</div>
  }
  
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
    const isProficient = currentBuild.skillProficiencies?.includes(skill.name) || 
                        backgroundSkills.includes(skill.name) || 
                        false
    // TODO: Add expertise tracking
    const hasExpertise = false
    
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
      
    </div>
  )
}