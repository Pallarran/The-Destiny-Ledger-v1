import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { User, Scroll, Crown, TreePine, Flame, Moon, Star, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'

// Mock race data - in a real app this would come from a data service
const MOCK_RACES = [
  {
    id: 'human_variant',
    name: 'Human (Variant)',
    description: 'Versatile and ambitious, humans are the most common race',
    features: ['+1 to two abilities', 'Free feat', 'Extra skill'],
    icon: User
  },
  {
    id: 'elf_high',
    name: 'High Elf',
    description: 'Graceful and intelligent, masters of magic',
    features: ['+2 DEX, +1 INT', 'Cantrip', 'Weapon proficiencies'],
    icon: Star
  },
  {
    id: 'dwarf_mountain',
    name: 'Mountain Dwarf',
    description: 'Hardy and strong, skilled in combat and crafting',
    features: ['+2 CON, +2 STR', 'Armor proficiencies', 'Tool proficiencies'],
    icon: Crown
  },
  {
    id: 'halfling_lightfoot',
    name: 'Lightfoot Halfling',
    description: 'Small and nimble, naturally lucky',
    features: ['+2 DEX, +1 CHA', 'Lucky', 'Naturally Stealthy'],
    icon: TreePine
  },
  {
    id: 'dragonborn',
    name: 'Dragonborn',
    description: 'Draconic heritage grants breath weapons and resistance',
    features: ['+2 STR, +1 CHA', 'Breath Weapon', 'Damage Resistance'],
    icon: Flame
  },
  {
    id: 'tiefling',
    name: 'Tiefling',
    description: 'Infernal heritage grants magical abilities',
    features: ['+2 CHA, +1 INT', 'Infernal Legacy', 'Hellish Resistance'],
    icon: Moon
  }
]

const MOCK_BACKGROUNDS = [
  {
    id: 'acolyte',
    name: 'Acolyte',
    description: 'Served in a temple to a god or pantheon',
    features: ['Insight & Religion skills', 'Languages', 'Shelter of the Faithful']
  },
  {
    id: 'criminal',
    name: 'Criminal',
    description: 'Experienced in breaking the law',
    features: ['Deception & Stealth skills', 'Tool proficiencies', 'Criminal Contact']
  },
  {
    id: 'folk_hero',
    name: 'Folk Hero', 
    description: 'Champion of the common people',
    features: ['Animal Handling & Survival skills', 'Tool proficiencies', 'Rustic Hospitality']
  },
  {
    id: 'noble',
    name: 'Noble',
    description: 'Born to wealth and privilege',
    features: ['History & Persuasion skills', 'Gaming set', 'Position of Privilege']
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'Spent years studying ancient lore',
    features: ['Arcana & History skills', 'Languages', 'Researcher']
  },
  {
    id: 'soldier',
    name: 'Soldier',
    description: 'Trained for war and battle',
    features: ['Athletics & Intimidation skills', 'Vehicle proficiency', 'Military Rank']
  }
]

export function RaceBackgroundSelection() {
  const { 
    currentBuild,
    setRace,
    setBackground
  } = useCharacterBuilderStore()
  
  const [showRaceOptions, setShowRaceOptions] = useState(false)
  const [showBackgroundOptions, setShowBackgroundOptions] = useState(false)
  
  if (!currentBuild) {
    return <div className="text-center text-muted">Loading race and background options...</div>
  }
  
  const selectedRace = MOCK_RACES.find(r => r.id === currentBuild.race)
  const selectedBackground = MOCK_BACKGROUNDS.find(b => b.id === currentBuild.background)
  
  // Trigger validation when selections change
  useEffect(() => {
    if (currentBuild) {
      const { validateCurrentStep } = useCharacterBuilderStore.getState()
      validateCurrentStep()
    }
  }, [currentBuild, currentBuild?.race, currentBuild?.background])
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-panel mb-2">Race & Background</h2>
        <p className="text-muted">
          Choose your character&apos;s race and background. These determine starting traits, proficiencies, and roleplay opportunities.
        </p>
      </div>
      
      {/* Race Selection */}
      <div>
        <h3 className="text-lg font-semibold text-panel mb-3">Choose a Race</h3>
        
        {/* Race Selector Button */}
        <Button
          variant="outline"
          onClick={() => setShowRaceOptions(!showRaceOptions)}
          className="w-full justify-between mb-3"
        >
          {selectedRace ? (
            <div className="flex items-center gap-2">
              <selectedRace.icon className="w-4 h-4" />
              {selectedRace.name}
            </div>
          ) : (
            'Select a race...'
          )}
          <ChevronDown className="w-4 h-4" />
        </Button>
        
        {/* Race Options */}
        {showRaceOptions && (
          <Card className="mb-3">
            <CardContent className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {MOCK_RACES.map((race) => {
                  const Icon = race.icon
                  const isSelected = currentBuild.race === race.id
                  
                  return (
                    <Button
                      key={race.id}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => {
                        setRace(race.id)
                        setShowRaceOptions(false)
                      }}
                      className="justify-start h-auto p-3"
                    >
                      <Icon className="w-4 h-4 mr-2 shrink-0" />
                      <div className="text-left">
                        <div className="font-medium">{race.name}</div>
                        <div className="text-xs opacity-70">{race.features[0]}</div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Selected Race Details */}
        {selectedRace && (
          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <selectedRace.icon className="w-6 h-6 text-accent mt-1" />
                <div className="flex-1">
                  <div className="font-semibold text-panel mb-1">{selectedRace.name}</div>
                  <div className="text-sm text-muted mb-3">{selectedRace.description}</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedRace.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Background Selection */}
      <div>
        <h3 className="text-lg font-semibold text-panel mb-3">Choose a Background</h3>
        
        {/* Background Selector Button */}
        <Button
          variant="outline"
          onClick={() => setShowBackgroundOptions(!showBackgroundOptions)}
          className="w-full justify-between mb-3"
        >
          {selectedBackground ? (
            <div className="flex items-center gap-2">
              <Scroll className="w-4 h-4" />
              {selectedBackground.name}
            </div>
          ) : (
            'Select a background...'
          )}
          <ChevronDown className="w-4 h-4" />
        </Button>
        
        {/* Background Options */}
        {showBackgroundOptions && (
          <Card className="mb-3">
            <CardContent className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {MOCK_BACKGROUNDS.map((background) => {
                  const isSelected = currentBuild.background === background.id
                  
                  return (
                    <Button
                      key={background.id}
                      variant={isSelected ? "secondary" : "outline"}
                      onClick={() => {
                        setBackground(background.id)
                        setShowBackgroundOptions(false)
                      }}
                      className="justify-start h-auto p-3"
                    >
                      <Scroll className="w-4 h-4 mr-2 shrink-0" />
                      <div className="text-left">
                        <div className="font-medium">{background.name}</div>
                        <div className="text-xs opacity-70">{background.features[0]}</div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Selected Background Details */}
        {selectedBackground && (
          <Card className="border-emerald/20 bg-emerald/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Scroll className="w-6 h-6 text-emerald mt-1" />
                <div className="flex-1">
                  <div className="font-semibold text-panel mb-1">{selectedBackground.name}</div>
                  <div className="text-sm text-muted mb-3">{selectedBackground.description}</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedBackground.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
    </div>
  )
}