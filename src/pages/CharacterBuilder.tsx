import { useState } from 'react'
import { Panel, PanelHeader } from '../components/ui/panel'
import { RuneCorners } from '../components/ui/rune-corners'
import { Button } from '../components/ui/button'
import { CharacterBuilderNew } from './CharacterBuilder_New'
import { 
  User, 
  Dices, 
  Sword, 
  Award, 
  Package, 
  FileText,
  Plus,
  X,
  AlertTriangle,
  Settings
} from 'lucide-react'

export function CharacterBuilder() {
  const [useNewBuilder, setUseNewBuilder] = useState(false)
  const [activeTab, setActiveTab] = useState('identity')
  const [showTimeline, setShowTimeline] = useState(true)

  // Show the new builder if requested
  if (useNewBuilder) {
    return <CharacterBuilderNew />
  }

  // Placeholder state - will be replaced with proper state management
  const [abilityScores] = useState({
    STR: 15,
    DEX: 14, 
    CON: 14,
    INT: 13,
    WIS: 13,
    CHA: 18
  })

  const tabs = [
    { id: 'identity', label: 'Identity', icon: User },
    { id: 'abilities', label: 'Ability Scores', icon: Dices },
    { id: 'classes', label: 'Class & Levels', icon: Award },
    { id: 'feats', label: 'Feats', icon: Award },
    { id: 'gear', label: 'Gear', icon: Package },
    { id: 'notes', label: 'Notes', icon: FileText }
  ]

  const levelTimeline = [
    { level: 1, class: 'Fighter', milestone: '1', description: 'Fighting Style, Second Wind' },
    { level: 3, class: 'Fighter', milestone: '3', description: 'Archetype: Battle Master' },
    { level: 4, class: 'Fighter', milestone: '4', description: 'ASI / Feat' },
    { level: 6, class: 'Fighter', milestone: '6', description: 'Extra Attack' },
    { level: 7, class: 'Fighter', milestone: '7', description: 'Battle Master Features' },
    { level: 8, class: 'Fighter', milestone: '8', description: 'ASI / Feat' },
    { level: 10, class: 'Rogue', milestone: '10', description: 'Sneak Attack +1d6' },
    { level: 11, class: 'Rogue', milestone: '11', description: 'ASI / Feat' },
    { level: 13, class: 'Rogue', milestone: '13', description: 'Archetype: Assassin' },
    { level: 20, class: 'Fighter', milestone: '20', description: 'Capstone' }
  ]

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader title="CHARACTER BUILDER" />
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Sir Kaelen</h2>
            <p className="text-muted">Race & Subrace: Human (Variant Human)</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUseNewBuilder(true)}
              className="text-accent border-accent hover:bg-accent/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Try Phase 3
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTimeline(!showTimeline)}
            >
              Level Timeline
              {showTimeline ? <X className="w-4 h-4 ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Tab Navigation */}
            <div className="flex border-b border-border mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'abilities' && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-sm font-medium">Method</span>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="method" className="text-accent" />
                    <span>Point Buy</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="method" defaultChecked className="text-accent" />
                    <span>Point Buy</span>
                  </label>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm">Manual</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  {Object.entries(abilityScores).map(([ability, value]) => (
                    <Panel key={ability} className="p-4 relative">
                      <RuneCorners />
                      <div className="text-center">
                        <div className="w-6 h-6 mx-auto mb-2">
                          <Sword className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-1">{ability}</h3>
                        <div className="text-3xl font-bold mb-4">{value}</div>
                        {ability === 'STR' && (
                          <div className="w-6 h-6 bg-gold rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-xs font-bold">!</span>
                          </div>
                        )}
                        <div className="flex justify-center gap-2">
                          <Button variant="ghost" size="icon" className="w-8 h-8">
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Panel>
                  ))}
                </div>

                <div className="mb-4">
                  <div className="text-sm mb-2">27/27 points spent</div>
                  <div className="w-full bg-border rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full w-full"></div>
                  </div>
                </div>

                {/* Validation Section */}
                <Panel className="bg-ink text-panel">
                  <PanelHeader title="Validation" className="text-panel" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gold">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">Concentration Conflict: Haste & Bless enabled</span>
                    </div>
                    <div className="flex items-center gap-2 text-danger">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">Missing Proficiency: Acrobatics</span>
                    </div>
                  </div>
                </Panel>
              </div>
            )}

            {/* Other tab content would go here */}
            {activeTab !== 'abilities' && (
              <div className="text-center py-12 text-muted">
                <FileText className="w-12 h-12 mx-auto mb-4" />
                <p>{tabs.find(t => t.id === activeTab)?.label} content coming soon...</p>
              </div>
            )}
          </div>

          {/* Level Timeline Sidebar */}
          {showTimeline && (
            <div className="w-80">
              <Panel className="h-fit">
                <PanelHeader title="Level Timeline">
                  <Button variant="ghost" size="icon" onClick={() => setShowTimeline(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </PanelHeader>
                
                <div className="space-y-3">
                  {levelTimeline.map((entry, index) => (
                    <div key={entry.level} className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-ink text-sm font-bold">
                          {entry.milestone}
                        </div>
                        {index < levelTimeline.length - 1 && (
                          <div className="w-0.5 h-6 bg-accent mt-1" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{entry.level}</span>
                          <span className="text-sm text-muted">{entry.class}</span>
                        </div>
                        <p className="text-xs text-muted">{entry.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          )}
        </div>
      </Panel>
    </div>
  )
}