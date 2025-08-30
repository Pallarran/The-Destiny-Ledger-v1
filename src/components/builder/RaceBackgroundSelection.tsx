import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { getAllRaces, getRace } from '../../rules/loaders'
import { Info } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { Race, Subrace } from '../../rules/srd/races'

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
    updateAbilityScores
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
  
  // Apply racial ability score increases
  useEffect(() => {
    if (!selectedRaceData || !currentBuild || !currentBuild.baseAbilityScores) return
    
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
    
    updateAbilityScores(updatedScores)
  }, [selectedRaceData, selectedSubrace, currentBuild?.baseAbilityScores])
  
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