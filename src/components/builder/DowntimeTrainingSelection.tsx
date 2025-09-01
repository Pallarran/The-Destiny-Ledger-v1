import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { GraduationCap, BookOpen, Zap, Target, Plus, Trash2, Edit } from 'lucide-react'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { useState } from 'react'

export function DowntimeTrainingSelection() {
  const { currentBuild, addTrainingSession, removeTrainingSession } = useCharacterBuilderStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSessionName, setNewSessionName] = useState('')

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
                      <Button variant="outline" size="sm">
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