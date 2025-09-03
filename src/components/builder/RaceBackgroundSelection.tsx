import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { getAllRaces, getRace } from '../../rules/loaders'
import { Info } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { Race, Subrace } from '../../rules/srd/races'
import { getAllSkills } from '../../rules/srd/skills'
import { getAllFeats } from '../../rules/loaders'
import { getSpellsByClassAndLevel } from '../../rules/srd/spells'

// Draconic Ancestry Options for Dragonborn
const DRACONIC_ANCESTRIES = [
  { id: 'black', name: 'Black', damageType: 'Acid', breathWeapon: '5 by 30 ft. line (Dex. save)' },
  { id: 'blue', name: 'Blue', damageType: 'Lightning', breathWeapon: '5 by 30 ft. line (Dex. save)' },
  { id: 'brass', name: 'Brass', damageType: 'Fire', breathWeapon: '5 by 30 ft. line (Dex. save)' },
  { id: 'bronze', name: 'Bronze', damageType: 'Lightning', breathWeapon: '5 by 30 ft. line (Dex. save)' },
  { id: 'copper', name: 'Copper', damageType: 'Acid', breathWeapon: '5 by 30 ft. line (Dex. save)' },
  { id: 'gold', name: 'Gold', damageType: 'Fire', breathWeapon: '15 ft. cone (Dex. save)' },
  { id: 'green', name: 'Green', damageType: 'Poison', breathWeapon: '15 ft. cone (Con. save)' },
  { id: 'red', name: 'Red', damageType: 'Fire', breathWeapon: '15 ft. cone (Dex. save)' },
  { id: 'silver', name: 'Silver', damageType: 'Cold', breathWeapon: '15 ft. cone (Con. save)' },
  { id: 'white', name: 'White', damageType: 'Cold', breathWeapon: '15 ft. cone (Con. save)' }
]

// SRD Backgrounds
const BACKGROUNDS = [
  {
    id: 'acolyte',
    name: 'Acolyte',
    description: 'You have spent your life in the service of a temple.',
    skills: ['Insight', 'Religion'],
    languages: 2,
    feature: 'Shelter of the Faithful'
  },
  {
    id: 'criminal',
    name: 'Criminal',
    description: 'You are an experienced criminal with a history of breaking the law.',
    skills: ['Deception', 'Stealth'],
    tools: ['One type of gaming set', "Thieves' tools"],
    feature: 'Criminal Contact'
  },
  {
    id: 'folk_hero',
    name: 'Folk Hero', 
    description: 'You come from a humble social rank, rising to heroism.',
    skills: ['Animal Handling', 'Survival'],
    tools: ['One type of artisan\'s tools', 'Vehicles (land)'],
    feature: 'Rustic Hospitality'
  },
  {
    id: 'noble',
    name: 'Noble',
    description: 'You understand wealth, power, and privilege.',
    skills: ['History', 'Persuasion'],
    tools: ['One type of gaming set'],
    languages: 1,
    feature: 'Position of Privilege'
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'You spent years learning the lore of the multiverse.',
    skills: ['Arcana', 'History'],
    languages: 2,
    feature: 'Researcher'
  },
  {
    id: 'soldier',
    name: 'Soldier',
    description: 'War has been your life for as long as you care to remember.',
    skills: ['Athletics', 'Intimidation'],
    tools: ['One type of gaming set', 'Vehicles (land)'],
    feature: 'Military Rank'
  },
  {
    id: 'hermit',
    name: 'Hermit',
    description: 'You lived in seclusion for a formative part of your life.',
    skills: ['Medicine', 'Religion'],
    tools: ['Herbalism kit'],
    languages: 1,
    feature: 'Discovery'
  },
  {
    id: 'entertainer',
    name: 'Entertainer',
    description: 'You thrive in front of an audience.',
    skills: ['Acrobatics', 'Performance'],
    tools: ['Disguise kit', 'One type of musical instrument'],
    feature: 'By Popular Demand'
  },
  {
    id: 'guild_artisan',
    name: 'Guild Artisan',
    description: 'You are a member of an artisan\'s guild.',
    skills: ['Insight', 'Persuasion'],
    tools: ['One type of artisan\'s tools'],
    languages: 1,
    feature: 'Guild Membership'
  },
  {
    id: 'outlander',
    name: 'Outlander',
    description: 'You grew up in the wilds, far from civilization.',
    skills: ['Athletics', 'Survival'],
    tools: ['One type of musical instrument'],
    languages: 1,
    feature: 'Wanderer'
  }
]

export function RaceBackgroundSelection() {
  const { 
    currentBuild,
    setRace,
    setSubrace,
    setBackground,
    updateAbilityScores,
    setVariantHumanFeat,
    setVariantHumanSkill,
    setVariantHumanAbilities,
    setHalfElfSkills,
    setHalfElfAbilities,
    setDragonbornAncestry,
    setHighElfCantrip,
    getAllKnownFeats,
    getAllKnownSkills,
    getAllKnownSpells
  } = useCharacterBuilderStore()
  
  const [selectedRaceData, setSelectedRaceData] = useState<Race | null>(null)
  const [selectedSubrace, setSelectedSubraceState] = useState<Subrace | null>(null)
  
  const races = getAllRaces()
  
  // Load race data when selection changes
  useEffect(() => {
    if (currentBuild?.race) {
      const race = getRace(currentBuild.race)
      setSelectedRaceData(race || null)
      
      // Auto-select subrace if only one option
      if (race?.subraces && race.subraces.length === 1) {
        setSelectedSubraceState(race.subraces[0])
        setSubrace(race.subraces[0].id)
      }
    }
  }, [currentBuild?.race, setSubrace])

  // Load subrace data when subrace selection changes  
  useEffect(() => {
    if (currentBuild?.subrace && selectedRaceData) {
      const subrace = selectedRaceData.subraces?.find(s => s.id === currentBuild.subrace)
      if (subrace) {
        setSelectedSubraceState(subrace)
      }
    }
  }, [currentBuild?.subrace, selectedRaceData])
  
  // Apply racial ability score increases
  useEffect(() => {
    if (!selectedRaceData || !currentBuild || !currentBuild.baseAbilityScores) {
      console.log('Racial bonus calculation skipped:', { selectedRaceData: !!selectedRaceData, currentBuild: !!currentBuild, baseAbilityScores: !!currentBuild?.baseAbilityScores })
      return
    }
    
    console.log('Calculating racial bonuses:', { race: selectedRaceData.name, subrace: selectedSubrace?.name })
    
    // Calculate total ability score bonuses
    const racialBonuses: Record<string, number> = {}
    
    // Base race bonuses
    selectedRaceData.abilityScoreIncrease.forEach(asi => {
      racialBonuses[asi.ability] = (racialBonuses[asi.ability] || 0) + asi.bonus
    })
    
    // Subrace bonuses
    if (selectedSubrace?.abilityScoreIncrease) {
      selectedSubrace.abilityScoreIncrease.forEach(asi => {
        racialBonuses[asi.ability] = (racialBonuses[asi.ability] || 0) + asi.bonus
      })
    }
    
    // Calculate final scores from base scores + racial bonuses
    const updatedScores = { ...currentBuild.baseAbilityScores }
    Object.keys(updatedScores).forEach(key => {
      const ability = key as keyof typeof updatedScores
      updatedScores[ability] = updatedScores[ability] + (racialBonuses[ability] || 0)
    })
    
    console.log('Applying racial bonuses:', { racialBonuses, baseScores: currentBuild.baseAbilityScores, finalScores: updatedScores })
    updateAbilityScores(updatedScores)
  }, [selectedRaceData, selectedSubrace, currentBuild?.baseAbilityScores, updateAbilityScores])
  
  // Trigger validation when selections change
  useEffect(() => {
    if (currentBuild) {
      const { validateCurrentStep } = useCharacterBuilderStore.getState()
      validateCurrentStep()
    }
  }, [currentBuild?.race, currentBuild?.background, currentBuild?.subrace])
  
  if (!currentBuild) {
    return <div className="text-center text-muted">Loading race and background options...</div>
  }
  
  // Get all known items to prevent duplicates
  const knownFeats = getAllKnownFeats()
  const knownSkills = getAllKnownSkills()
  const knownSpells = getAllKnownSpells()
  
  const selectedBackground = BACKGROUNDS.find(b => b.id === currentBuild.background)
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-panel mb-2">Race & Background</h2>
        <p className="text-muted">
          Choose your character's race and background. Your race provides ability score bonuses and special traits, 
          while your background grants skills and roleplay features.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Race Selection Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-panel">Race</h3>
          
          {/* Race Selector */}
          <div className="space-y-2">
            <Label htmlFor="race-select">Select Race</Label>
            <Select value={currentBuild.race || ''} onValueChange={setRace}>
              <SelectTrigger id="race-select">
                <SelectValue placeholder="Choose a race..." />
              </SelectTrigger>
              <SelectContent>
                {races.map(race => (
                  <SelectItem key={race.id} value={race.id}>
                    {race.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Subrace Selector (if applicable) */}
          {selectedRaceData?.subraces && selectedRaceData.subraces.length > 1 && (
            <div className="space-y-2">
              <Label htmlFor="subrace-select">Select Subrace</Label>
              <Select 
                value={currentBuild.subrace || ''} 
                onValueChange={(value) => {
                  setSubrace(value)
                  const subrace = selectedRaceData.subraces?.find(s => s.id === value)
                  setSelectedSubraceState(subrace || null)
                }}
              >
                <SelectTrigger id="subrace-select">
                  <SelectValue placeholder="Choose a subrace..." />
                </SelectTrigger>
                <SelectContent>
                  {selectedRaceData.subraces.map(subrace => (
                    <SelectItem key={subrace.id} value={subrace.id}>
                      {subrace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Race Details Card */}
          {selectedRaceData && (
            <Card className="border-accent/20 bg-accent/5">
              <CardContent className="p-4 space-y-3">
                <div>
                  <div className="font-semibold text-panel mb-1">
                    {selectedRaceData.name}
                    {selectedSubrace && ` (${selectedSubrace.name})`}
                  </div>
                  <div className="text-sm text-muted">
                    {selectedSubrace?.description || selectedRaceData.description}
                  </div>
                </div>
                
                {/* Ability Score Increases */}
                <div>
                  <div className="text-xs font-medium text-muted mb-1">Ability Score Increases</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedRaceData.abilityScoreIncrease.map((asi, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {asi.ability} +{asi.bonus}
                      </Badge>
                    ))}
                    {selectedSubrace?.abilityScoreIncrease?.map((asi, idx) => (
                      <Badge key={`sub-${idx}`} variant="outline" className="text-xs">
                        {asi.ability} +{asi.bonus}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Racial Traits */}
                <div>
                  <div className="text-xs font-medium text-muted mb-1">Racial Traits</div>
                  <div className="space-y-1">
                    <div className="text-xs">
                      <span className="font-medium">Size:</span> {selectedRaceData.size}
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Speed:</span> {selectedRaceData.speed} ft.
                    </div>
                    {selectedRaceData.traits.map((trait, idx) => (
                      <div key={idx} className="text-xs">
                        <span className="font-medium">{trait.name}:</span> {trait.description}
                      </div>
                    ))}
                    {selectedSubrace?.traits.map((trait, idx) => (
                      <div key={`sub-trait-${idx}`} className="text-xs">
                        <span className="font-medium">{trait.name}:</span> {trait.description}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Languages */}
                {selectedRaceData.languages.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted mb-1">Languages</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedRaceData.languages.map((lang, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Variant Human Racial Choices */}
          {selectedRaceData?.id === 'variant_human' && (
            <div className="space-y-4">
              {/* Feat Selection */}
              <div className="space-y-2">
                <Label htmlFor="feat-select">Select Feat</Label>
                <Select 
                  value={currentBuild.variantHumanFeat || ''} 
                  onValueChange={setVariantHumanFeat}
                >
                  <SelectTrigger id="feat-select">
                    <SelectValue placeholder="Choose a feat..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllFeats().sort((a, b) => a.name.localeCompare(b.name)).map(feat => {
                      const isKnown = knownFeats.includes(feat.id)
                      return (
                        <SelectItem key={feat.id} value={feat.id} disabled={isKnown}>
                          <div className="flex items-center justify-between w-full">
                            <span className={isKnown ? "text-muted-foreground" : ""}>{feat.name}</span>
                            {isKnown && <span className="text-xs text-muted-foreground ml-2">(Known)</span>}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Skill Selection */}
              <div className="space-y-2">
                <Label htmlFor="skill-select">Select Skill</Label>
                <Select 
                  value={currentBuild.variantHumanSkill || ''} 
                  onValueChange={setVariantHumanSkill}
                >
                  <SelectTrigger id="skill-select">
                    <SelectValue placeholder="Choose a skill..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllSkills().map(skill => {
                      const isKnown = knownSkills.includes(skill.id)
                      return (
                        <SelectItem key={skill.id} value={skill.id} disabled={isKnown}>
                          <div className="flex items-center justify-between w-full">
                            <span className={isKnown ? "text-muted-foreground" : ""}>{skill.name}</span>
                            {isKnown && <span className="text-xs text-muted-foreground ml-2">(Known)</span>}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Ability Score Choices */}
              <div className="space-y-2">
                <Label>Select Two Different Abilities (+1 each)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="ability1-select" className="text-sm">First Ability</Label>
                    <Select 
                      value={currentBuild.variantHumanAbilities?.[0] || ''} 
                      onValueChange={(value) => {
                        const current = currentBuild.variantHumanAbilities || ['', '']
                        setVariantHumanAbilities([value, current[1]])
                      }}
                    >
                      <SelectTrigger id="ability1-select">
                        <SelectValue placeholder="Choose..." />
                      </SelectTrigger>
                      <SelectContent>
                        {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map(ability => (
                          <SelectItem key={ability} value={ability} disabled={currentBuild.variantHumanAbilities?.[1] === ability}>
                            {ability}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ability2-select" className="text-sm">Second Ability</Label>
                    <Select 
                      value={currentBuild.variantHumanAbilities?.[1] || ''} 
                      onValueChange={(value) => {
                        const current = currentBuild.variantHumanAbilities || ['', '']
                        setVariantHumanAbilities([current[0], value])
                      }}
                    >
                      <SelectTrigger id="ability2-select">
                        <SelectValue placeholder="Choose..." />
                      </SelectTrigger>
                      <SelectContent>
                        {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map(ability => (
                          <SelectItem key={ability} value={ability} disabled={currentBuild.variantHumanAbilities?.[0] === ability}>
                            {ability}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Dragonborn Draconic Ancestry */}
          {selectedRaceData?.id === 'dragonborn' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ancestry-select">Select Draconic Ancestry</Label>
                <Select 
                  value={currentBuild.dragonbornAncestry || ''} 
                  onValueChange={setDragonbornAncestry}
                >
                  <SelectTrigger id="ancestry-select">
                    <SelectValue placeholder="Choose your draconic ancestry..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DRACONIC_ANCESTRIES.map(ancestry => (
                      <SelectItem key={ancestry.id} value={ancestry.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{ancestry.name} Dragon</span>
                          <span className="text-xs text-muted-foreground">
                            {ancestry.damageType} damage • {ancestry.breathWeapon}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {currentBuild.dragonbornAncestry && (
                  <div className="mt-2">
                    {(() => {
                      const selected = DRACONIC_ANCESTRIES.find(a => a.id === currentBuild.dragonbornAncestry)
                      if (!selected) return null
                      return (
                        <div className="text-sm p-2 border rounded bg-muted/20">
                          <div className="font-medium text-panel">{selected.name} Dragon Ancestry</div>
                          <div className="text-xs text-muted mt-1">
                            <strong>Damage Resistance:</strong> {selected.damageType}
                          </div>
                          <div className="text-xs text-muted">
                            <strong>Breath Weapon:</strong> {selected.breathWeapon}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Half-Elf Choices */}
          {selectedRaceData?.id === 'half_elf' && (
            <div className="space-y-4">
              {/* Skill Selections */}
              <div className="space-y-2">
                <Label>Select Two Skills</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="half-elf-skill1-select" className="text-sm">First Skill</Label>
                    <Select 
                      value={currentBuild.halfElfSkills?.[0] || ''} 
                      onValueChange={(value) => {
                        const current = currentBuild.halfElfSkills || ['', '']
                        setHalfElfSkills([value, current[1]])
                      }}
                    >
                      <SelectTrigger id="half-elf-skill1-select">
                        <SelectValue placeholder="Choose..." />
                      </SelectTrigger>
                      <SelectContent>
                        {getAllSkills().map(skill => {
                          const isKnown = knownSkills.includes(skill.id)
                          const isSelectedAsSecond = currentBuild.halfElfSkills?.[1] === skill.id
                          return (
                            <SelectItem key={skill.id} value={skill.id} disabled={isKnown || isSelectedAsSecond}>
                              <div className="flex items-center justify-between w-full">
                                <span className={isKnown || isSelectedAsSecond ? "text-muted-foreground" : ""}>{skill.name}</span>
                                {isKnown && <span className="text-xs text-muted-foreground ml-2">(Known)</span>}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="half-elf-skill2-select" className="text-sm">Second Skill</Label>
                    <Select 
                      value={currentBuild.halfElfSkills?.[1] || ''} 
                      onValueChange={(value) => {
                        const current = currentBuild.halfElfSkills || ['', '']
                        setHalfElfSkills([current[0], value])
                      }}
                    >
                      <SelectTrigger id="half-elf-skill2-select">
                        <SelectValue placeholder="Choose..." />
                      </SelectTrigger>
                      <SelectContent>
                        {getAllSkills().map(skill => {
                          const isKnown = knownSkills.includes(skill.id)
                          const isSelectedAsFirst = currentBuild.halfElfSkills?.[0] === skill.id
                          return (
                            <SelectItem key={skill.id} value={skill.id} disabled={isKnown || isSelectedAsFirst}>
                              <div className="flex items-center justify-between w-full">
                                <span className={isKnown || isSelectedAsFirst ? "text-muted-foreground" : ""}>{skill.name}</span>
                                {isKnown && <span className="text-xs text-muted-foreground ml-2">(Known)</span>}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Ability Score Choices */}
              <div className="space-y-2">
                <Label>Select Two Different Abilities (+1 each)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="half-elf-ability1-select" className="text-sm">First Ability</Label>
                    <Select 
                      value={currentBuild.halfElfAbilities?.[0] || ''} 
                      onValueChange={(value) => {
                        const current = currentBuild.halfElfAbilities || ['', '']
                        setHalfElfAbilities([value, current[1]])
                      }}
                    >
                      <SelectTrigger id="half-elf-ability1-select">
                        <SelectValue placeholder="Choose..." />
                      </SelectTrigger>
                      <SelectContent>
                        {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].filter(ability => ability !== 'CHA').map(ability => (
                          <SelectItem key={ability} value={ability} disabled={currentBuild.halfElfAbilities?.[1] === ability}>
                            {ability}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="half-elf-ability2-select" className="text-sm">Second Ability</Label>
                    <Select 
                      value={currentBuild.halfElfAbilities?.[1] || ''} 
                      onValueChange={(value) => {
                        const current = currentBuild.halfElfAbilities || ['', '']
                        setHalfElfAbilities([current[0], value])
                      }}
                    >
                      <SelectTrigger id="half-elf-ability2-select">
                        <SelectValue placeholder="Choose..." />
                      </SelectTrigger>
                      <SelectContent>
                        {['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].filter(ability => ability !== 'CHA').map(ability => (
                          <SelectItem key={ability} value={ability} disabled={currentBuild.halfElfAbilities?.[0] === ability}>
                            {ability}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* High Elf Cantrip Selection */}
          {selectedRaceData?.id === 'elf' && selectedSubrace?.id === 'high_elf' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cantrip-select">Select Wizard Cantrip</Label>
                <Select 
                  value={currentBuild.highElfCantrip || ''} 
                  onValueChange={setHighElfCantrip}
                >
                  <SelectTrigger id="cantrip-select">
                    <SelectValue placeholder="Choose a wizard cantrip..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getSpellsByClassAndLevel('wizard', 0)
                      .map(spell => ({
                        ...spell,
                        id: spell.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
                      }))
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(cantrip => {
                        const isKnown = knownSpells.includes(cantrip.id)
                        return (
                          <SelectItem key={cantrip.id} value={cantrip.id} disabled={isKnown}>
                            <div className="flex flex-col">
                              <div className="flex items-center justify-between w-full">
                                <span className={`font-medium ${isKnown ? "text-muted-foreground" : ""}`}>{cantrip.name}</span>
                                {isKnown && <span className="text-xs text-muted-foreground ml-2">(Known)</span>}
                              </div>
                              <span className={`text-xs ${isKnown ? "text-muted-foreground" : "text-muted-foreground"}`}>
                                {cantrip.school} • {cantrip.castingTime}
                              </span>
                            </div>
                          </SelectItem>
                        )
                      })}
                  </SelectContent>
                </Select>
                {currentBuild.highElfCantrip && (() => {
                  const wizardCantrips = getSpellsByClassAndLevel('wizard', 0)
                  const selected = wizardCantrips.find(spell => 
                    spell.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') === currentBuild.highElfCantrip
                  )
                  if (!selected) return null
                  return (
                    <div className="mt-2 text-sm p-2 border rounded bg-muted/20">
                      <div className="font-medium text-panel">{selected.name}</div>
                      <div className="text-xs text-muted mt-1">
                        <strong>School:</strong> {selected.school} • <strong>Casting Time:</strong> {selected.castingTime}
                      </div>
                      <div className="text-xs text-muted mt-1">
                        {selected.description.length > 100 
                          ? `${selected.description.substring(0, 100)}...` 
                          : selected.description}
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          )}
        </div>
        
        {/* Background Selection Column */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-panel">Background</h3>
          
          {/* Background Selector */}
          <div className="space-y-2">
            <Label htmlFor="background-select">Select Background</Label>
            <Select value={currentBuild.background || ''} onValueChange={setBackground}>
              <SelectTrigger id="background-select">
                <SelectValue placeholder="Choose a background..." />
              </SelectTrigger>
              <SelectContent>
                {BACKGROUNDS.map(bg => (
                  <SelectItem key={bg.id} value={bg.id}>
                    {bg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Background Details Card */}
          {selectedBackground && (
            <Card className="border-emerald/20 bg-emerald/5">
              <CardContent className="p-4 space-y-3">
                <div>
                  <div className="font-semibold text-panel mb-1">{selectedBackground.name}</div>
                  <div className="text-sm text-muted">{selectedBackground.description}</div>
                </div>
                
                {/* Skills */}
                <div>
                  <div className="text-xs font-medium text-muted mb-1">Skill Proficiencies</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedBackground.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Tools & Languages */}
                {(selectedBackground.tools || selectedBackground.languages) && (
                  <div className="space-y-2">
                    {selectedBackground.tools && (
                      <div>
                        <div className="text-xs font-medium text-muted mb-1">Tool Proficiencies</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedBackground.tools.map((tool, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedBackground.languages && (
                      <div>
                        <div className="text-xs font-medium text-muted mb-1">Languages</div>
                        <Badge variant="secondary" className="text-xs">
                          {selectedBackground.languages} language{selectedBackground.languages > 1 ? 's' : ''} of your choice
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Feature */}
                <div>
                  <div className="text-xs font-medium text-muted mb-1">Feature</div>
                  <div className="flex items-center gap-1">
                    <Info className="w-3 h-3 text-gold" />
                    <span className="text-xs font-medium">{selectedBackground.feature}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}