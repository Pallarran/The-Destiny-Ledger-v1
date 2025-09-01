import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { GraduationCap, BookOpen, Zap, Target, Plus, Trash2, Edit, Save, X, Search } from 'lucide-react'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { useState } from 'react'
import type { DowntimeTrainingSession } from '../../types/downtimeTraining'
import type { AbilityScore, AbilityScoreArray } from '../../rules/types'
import { feats } from '../../rules/srd/feats'
import { getAllSkills } from '../../rules/srd/skills'

export function DowntimeTrainingSelection() {
  const { currentBuild, addTrainingSession, removeTrainingSession, updateTrainingSession } = useCharacterBuilderStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSessionName, setNewSessionName] = useState('')
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)

  const handleAddSession = () => {
    if (newSessionName.trim()) {
      addTrainingSession({
        name: newSessionName.trim(),
        description: '',
        featsTrained: [],
        abilityImprovements: {},
        skillsTrained: [],
        expertiseGained: [],
        weaponTraining: []
      })
      setNewSessionName('')
      setShowAddForm(false)
    }
  }

  const sessions = currentBuild?.downtimeTraining?.sessions || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-panel mb-2">Downtime Training</h2>
        <p className="text-muted">
          Train your character during downtime between adventures. Gain feats, improve abilities beyond normal limits, 
          learn new skills, and develop weapon expertise.
        </p>
      </div>

      {/* Training Sessions Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Training Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted opacity-50" />
              <p className="text-muted mb-4">No training sessions yet</p>
              {!showAddForm ? (
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Training Session
                </Button>
              ) : (
                <div className="inline-flex items-center gap-2 max-w-md">
                  <input
                    type="text"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="Session name (e.g., Chapter 2 Downtime)"
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddSession()
                      if (e.key === 'Escape') {
                        setShowAddForm(false)
                        setNewSessionName('')
                      }
                    }}
                    autoFocus
                  />
                  <Button onClick={handleAddSession} size="sm">
                    Add
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowAddForm(false)
                      setNewSessionName('')
                    }} 
                    variant="outline" 
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{session.name}</h3>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingSessionId(session.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => removeTrainingSession(session.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {session.description && (
                    <p className="text-sm text-muted mb-3">{session.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {session.featsTrained.length > 0 && (
                      <Badge variant="secondary">
                        {session.featsTrained.length} feat{session.featsTrained.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                    {Object.keys(session.abilityImprovements).length > 0 && (
                      <Badge variant="secondary">
                        Ability improvements
                      </Badge>
                    )}
                    {session.skillsTrained.length > 0 && (
                      <Badge variant="secondary">
                        {session.skillsTrained.length} skill{session.skillsTrained.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                    {session.expertiseGained.length > 0 && (
                      <Badge variant="secondary">
                        {session.expertiseGained.length} expertise
                      </Badge>
                    )}
                    {session.weaponTraining.length > 0 && (
                      <Badge variant="secondary">
                        {session.weaponTraining.length} weapon training
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              <div className="text-center pt-2">
                {!showAddForm ? (
                  <Button
                    onClick={() => setShowAddForm(true)}
                    variant="outline"
                    className="inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Another Session
                  </Button>
                ) : (
                  <div className="inline-flex items-center gap-2 max-w-md">
                    <input
                      type="text"
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      placeholder="Session name (e.g., Chapter 3 Downtime)"
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddSession()
                        if (e.key === 'Escape') {
                          setShowAddForm(false)
                          setNewSessionName('')
                        }
                      }}
                      autoFocus
                    />
                    <Button onClick={handleAddSession} size="sm">
                      Add
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowAddForm(false)
                        setNewSessionName('')
                      }} 
                      variant="outline" 
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Session Editor */}
      {editingSessionId && (
        <TrainingSessionEditor
          session={sessions.find(s => s.id === editingSessionId)!}
          onSave={(updates) => {
            updateTrainingSession(editingSessionId, updates)
            setEditingSessionId(null)
          }}
          onCancel={() => setEditingSessionId(null)}
        />
      )}

      {/* Training Categories Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ability Training */}
        <Card className="opacity-75">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-4 h-4" />
              Ability Training
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted mb-3">
              Improve ability scores beyond their normal limits through intensive training.
            </p>
            <div className="text-xs text-muted">
              <strong>Abilities can exceed 20</strong> through downtime training
            </div>
          </CardContent>
        </Card>

        {/* Weapon Training */}
        <Card className="opacity-75">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="w-4 h-4" />
              Weapon Training
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted mb-3">
              Develop expertise with specific weapon types, gaining attack and damage bonuses.
            </p>
            <div className="text-xs text-muted">
              Up to +3 attack/damage with trained weapons
            </div>
          </CardContent>
        </Card>

        {/* Feat Training */}
        <Card className="opacity-75">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="w-4 h-4" />
              Feat Training
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted mb-3">
              Learn new feats through dedicated study and practice during downtime.
            </p>
          </CardContent>
        </Card>

        {/* Skill Training */}
        <Card className="opacity-75">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="w-4 h-4" />
              Skill Training
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted mb-3">
              Gain proficiency in new skills or upgrade existing proficiencies to expertise.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-xs text-muted text-center p-4 bg-accent/5 rounded-lg border border-accent/20">
        <strong>Note:</strong> This system is optional and designed for campaigns that allow 
        character advancement during downtime periods between major story chapters.
      </div>
    </div>
  )
}

// Training Session Editor Component
interface TrainingSessionEditorProps {
  session: DowntimeTrainingSession
  onSave: (updates: Partial<DowntimeTrainingSession>) => void
  onCancel: () => void
}

function TrainingSessionEditor({ session, onSave, onCancel }: TrainingSessionEditorProps) {
  const [name, setName] = useState(session.name)
  const [description, setDescription] = useState(session.description || '')
  const [abilityImprovements, setAbilityImprovements] = useState<Partial<AbilityScoreArray>>(session.abilityImprovements)
  const [weaponTraining, setWeaponTraining] = useState(session.weaponTraining)
  const [featsTrained, setFeatsTrained] = useState<string[]>(session.featsTrained)
  const [skillsTrained, setSkillsTrained] = useState<string[]>(session.skillsTrained)
  const [expertiseGained, setExpertiseGained] = useState<string[]>(session.expertiseGained)
  const [featSearchTerm, setFeatSearchTerm] = useState('')
  const [skillSearchTerm, setSkillSearchTerm] = useState('')

  const handleSave = () => {
    onSave({
      name: name.trim(),
      description: description.trim(),
      abilityImprovements,
      weaponTraining,
      featsTrained,
      skillsTrained,
      expertiseGained
    })
  }

  const handleAbilityChange = (ability: AbilityScore, value: number) => {
    setAbilityImprovements(prev => ({
      ...prev,
      [ability]: value > 0 ? value : undefined
    }))
  }

  const addWeaponTraining = () => {
    setWeaponTraining(prev => [
      ...prev,
      { weaponType: '', attackBonus: 1, damageBonus: 1 }
    ])
  }

  const updateWeaponTraining = (index: number, updates: Partial<typeof weaponTraining[0]>) => {
    setWeaponTraining(prev => prev.map((wt, i) => 
      i === index ? { ...wt, ...updates } : wt
    ))
  }

  const removeWeaponTraining = (index: number) => {
    setWeaponTraining(prev => prev.filter((_, i) => i !== index))
  }

  // Feat helper functions
  const availableFeats = Object.values(feats).filter(feat => 
    !featsTrained.includes(feat.id) &&
    feat.name.toLowerCase().includes(featSearchTerm.toLowerCase())
  )

  const addFeatTrained = (featId: string) => {
    if (!featsTrained.includes(featId)) {
      setFeatsTrained(prev => [...prev, featId])
    }
  }

  const removeFeatTrained = (featId: string) => {
    setFeatsTrained(prev => prev.filter(id => id !== featId))
  }

  // Skill helper functions
  const allSkills = getAllSkills()
  const availableSkills = allSkills.filter(skill => 
    !skillsTrained.includes(skill.name) &&
    skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase())
  )

  const availableExpertiseSkills = allSkills.filter(skill => 
    !expertiseGained.includes(skill.name) &&
    skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase())
  )

  const addSkillTrained = (skillName: string) => {
    if (!skillsTrained.includes(skillName)) {
      setSkillsTrained(prev => [...prev, skillName])
    }
  }

  const removeSkillTrained = (skillName: string) => {
    setSkillsTrained(prev => prev.filter(name => name !== skillName))
  }

  const addExpertiseGained = (skillName: string) => {
    if (!expertiseGained.includes(skillName)) {
      setExpertiseGained(prev => [...prev, skillName])
    }
  }

  const removeExpertiseGained = (skillName: string) => {
    setExpertiseGained(prev => prev.filter(name => name !== skillName))
  }

  return (
    <Card className="border-2 border-accent">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Edit Training Session</span>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} size="sm">
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button onClick={onCancel} variant="outline" size="sm">
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium block mb-1">Session Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="e.g., Chapter 2 Downtime"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="Brief description of the training period..."
              rows={2}
            />
          </div>
        </div>

        {/* Ability Score Training */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Ability Score Training
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as AbilityScore[]).map(ability => (
              <div key={ability} className="space-y-1">
                <label className="text-xs font-medium block">{ability}</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={abilityImprovements[ability] || 0}
                  onChange={(e) => handleAbilityChange(ability, parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-2">
            Each point increases the ability score by 1 (can exceed 20). Recommended: 1-2 points per session.
          </p>
        </div>

        {/* Weapon Training */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Weapon Training
            </h3>
            <Button onClick={addWeaponTraining} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add Weapon
            </Button>
          </div>
          
          {weaponTraining.length === 0 ? (
            <p className="text-sm text-muted text-center py-4">
              No weapon training configured. Click "Add Weapon" to start.
            </p>
          ) : (
            <div className="space-y-3">
              {weaponTraining.map((wt, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={wt.weaponType}
                      onChange={(e) => updateWeaponTraining(index, { weaponType: e.target.value })}
                      placeholder="Weapon type (e.g., longsword, shortbow)"
                      className="flex-1 px-2 py-1 border rounded text-sm mr-2"
                    />
                    <Button
                      onClick={() => removeWeaponTraining(index)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium block mb-1">Attack Bonus</label>
                      <input
                        type="number"
                        min="0"
                        max="3"
                        value={wt.attackBonus}
                        onChange={(e) => updateWeaponTraining(index, { attackBonus: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1">Damage Bonus</label>
                      <input
                        type="number"
                        min="0"
                        max="3"
                        value={wt.damageBonus}
                        onChange={(e) => updateWeaponTraining(index, { damageBonus: parseInt(e.target.value) || 0 })}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-xs text-muted">
                Training bonuses stack with magic weapon bonuses. Max +3 each for attack and damage.
              </p>
            </div>
          )}
        </div>

        {/* Feat Training */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Feat Training
            </h3>
          </div>

          {/* Selected Feats */}
          {featsTrained.length > 0 && (
            <div className="mb-3">
              <label className="text-xs font-medium block mb-2">Selected Feats</label>
              <div className="flex flex-wrap gap-2">
                {featsTrained.map(featId => {
                  const feat = feats[featId]
                  return feat ? (
                    <div key={featId} className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded">
                      <span className="text-sm">{feat.name}</span>
                      <Button
                        onClick={() => removeFeatTrained(featId)}
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0 hover:bg-destructive/20"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          )}

          {/* Feat Search and Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-2 top-2.5 text-muted" />
                <input
                  type="text"
                  value={featSearchTerm}
                  onChange={(e) => setFeatSearchTerm(e.target.value)}
                  placeholder="Search feats..."
                  className="w-full pl-8 pr-3 py-2 border rounded text-sm"
                />
              </div>
            </div>

            {availableFeats.length > 0 ? (
              <div className="max-h-48 overflow-y-auto space-y-2 border rounded p-2">
                {availableFeats.slice(0, 10).map(feat => (
                  <div key={feat.id} className="flex items-start justify-between p-2 hover:bg-accent/5 rounded">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{feat.name}</h4>
                      <p className="text-xs text-muted line-clamp-2">{feat.description}</p>
                    </div>
                    <Button
                      onClick={() => addFeatTrained(feat.id)}
                      size="sm"
                      variant="outline"
                      className="ml-2"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {availableFeats.length > 10 && (
                  <p className="text-xs text-muted text-center py-2">
                    Showing first 10 results. Continue typing to narrow search.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted text-center py-4">
                {featSearchTerm ? 'No feats match your search.' : 'All feats have been selected.'}
              </p>
            )}
          </div>
        </div>

        {/* Skill Training */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Skill Training
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Proficiencies */}
            <div>
              <h4 className="text-xs font-medium mb-2">New Skill Proficiencies</h4>
              
              {skillsTrained.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {skillsTrained.map(skillName => (
                      <div key={skillName} className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded">
                        <span className="text-sm">{skillName}</span>
                        <Button
                          onClick={() => removeSkillTrained(skillName)}
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0 hover:bg-destructive/20"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-2 top-2.5 text-muted" />
                  <input
                    type="text"
                    value={skillSearchTerm}
                    onChange={(e) => setSkillSearchTerm(e.target.value)}
                    placeholder="Search skills..."
                    className="w-full pl-8 pr-3 py-2 border rounded text-sm"
                  />
                </div>

                {availableSkills.length > 0 ? (
                  <div className="max-h-32 overflow-y-auto space-y-1 border rounded p-1">
                    {availableSkills.slice(0, 8).map(skill => (
                      <div key={skill.name} className="flex items-center justify-between p-1 hover:bg-accent/5 rounded">
                        <div>
                          <span className="text-sm font-medium">{skill.name}</span>
                          <span className="text-xs text-muted ml-2">({skill.ability})</span>
                        </div>
                        <Button
                          onClick={() => addSkillTrained(skill.name)}
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted text-center py-3">
                    {skillSearchTerm ? 'No skills match your search.' : 'All skills have been selected.'}
                  </p>
                )}
              </div>
            </div>

            {/* Skill Expertise */}
            <div>
              <h4 className="text-xs font-medium mb-2">Skill Expertise</h4>
              
              {expertiseGained.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {expertiseGained.map(skillName => (
                      <div key={skillName} className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded">
                        <span className="text-sm">{skillName}</span>
                        <Button
                          onClick={() => removeExpertiseGained(skillName)}
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0 hover:bg-destructive/20"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {availableExpertiseSkills.length > 0 ? (
                  <div className="max-h-32 overflow-y-auto space-y-1 border rounded p-1">
                    {availableExpertiseSkills.slice(0, 8).map(skill => (
                      <div key={skill.name} className="flex items-center justify-between p-1 hover:bg-accent/5 rounded">
                        <div>
                          <span className="text-sm font-medium">{skill.name}</span>
                          <span className="text-xs text-muted ml-2">({skill.ability})</span>
                        </div>
                        <Button
                          onClick={() => addExpertiseGained(skill.name)}
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted text-center py-3">
                    All skills have expertise or are filtered out.
                  </p>
                )}
              </div>
              <p className="text-xs text-muted mt-2">
                Double proficiency bonus for these skills
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}