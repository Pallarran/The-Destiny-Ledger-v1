import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { User, Scroll, Crown, TreePine, Flame, Moon, Star } from 'lucide-react'

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
  
  if (!currentBuild) return null
  
  const selectedRace = MOCK_RACES.find(r => r.id === currentBuild.race)
  const selectedBackground = MOCK_BACKGROUNDS.find(b => b.id === currentBuild.background)
  
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
        {selectedRace && (
          <Card className="mb-4 border-accent/20 bg-accent/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <selectedRace.icon className="w-6 h-6 text-accent" />
                <div>
                  <div className="font-semibold text-panel">{selectedRace.name}</div>
                  <div className="text-sm text-muted">{selectedRace.description}</div>
                </div>
                <Badge className="ml-auto bg-accent/10 text-accent border-accent/20">Selected</Badge>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_RACES.map((race) => {
            const Icon = race.icon
            const isSelected = currentBuild.race === race.id
            
            return (
              <Card 
                key={race.id}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'ring-2 ring-accent border-accent/20 bg-accent/5' 
                    : 'hover:border-accent/30 hover:shadow-md'
                }`}
                onClick={() => setRace(race.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-accent" />
                    <CardTitle className="text-base">{race.name}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    {race.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {race.features.map((feature, index) => (
                      <div key={index} className="text-xs text-muted bg-panel/5 rounded px-2 py-1">
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
      
      {/* Background Selection */}
      <div>
        <h3 className="text-lg font-semibold text-panel mb-3">Choose a Background</h3>
        {selectedBackground && (
          <Card className="mb-4 border-emerald/20 bg-emerald/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Scroll className="w-6 h-6 text-emerald" />
                <div>
                  <div className="font-semibold text-panel">{selectedBackground.name}</div>
                  <div className="text-sm text-muted">{selectedBackground.description}</div>
                </div>
                <Badge variant="secondary" className="ml-auto bg-emerald/10 text-emerald border-emerald/20">
                  Selected
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_BACKGROUNDS.map((background) => {
            const isSelected = currentBuild.background === background.id
            
            return (
              <Card 
                key={background.id}
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'ring-2 ring-emerald border-emerald/20 bg-emerald/5' 
                    : 'hover:border-emerald/30 hover:shadow-md'
                }`}
                onClick={() => setBackground(background.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Scroll className="w-5 h-5 text-emerald" />
                    <CardTitle className="text-base">{background.name}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    {background.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {background.features.map((feature, index) => (
                      <div key={index} className="text-xs text-muted bg-panel/5 rounded px-2 py-1">
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
      
      {/* Selection Summary */}
      {(selectedRace || selectedBackground) && (
        <Card>
          <CardHeader>
            <CardTitle>Character Origin Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-panel mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Race
                </h4>
                {selectedRace ? (
                  <div>
                    <div className="font-medium">{selectedRace.name}</div>
                    <div className="text-sm text-muted mb-2">{selectedRace.description}</div>
                    <div className="space-y-1">
                      {selectedRace.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs mr-1 mb-1">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted italic">No race selected</div>
                )}
              </div>
              
              <div>
                <h4 className="font-semibold text-panel mb-2 flex items-center gap-2">
                  <Scroll className="w-4 h-4" />
                  Background
                </h4>
                {selectedBackground ? (
                  <div>
                    <div className="font-medium">{selectedBackground.name}</div>
                    <div className="text-sm text-muted mb-2">{selectedBackground.description}</div>
                    <div className="space-y-1">
                      {selectedBackground.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs mr-1 mb-1">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted italic">No background selected</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}