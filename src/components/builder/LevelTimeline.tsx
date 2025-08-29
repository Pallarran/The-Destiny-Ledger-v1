import { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { Plus, Sword, BookOpen, Shield, Star } from 'lucide-react'

const MOCK_CLASSES = [
  { id: 'fighter', name: 'Fighter', icon: Sword, color: 'text-red-500' },
  { id: 'wizard', name: 'Wizard', icon: BookOpen, color: 'text-blue-500' },
  { id: 'rogue', name: 'Rogue', icon: Shield, color: 'text-purple-500' },
  { id: 'cleric', name: 'Cleric', icon: Star, color: 'text-yellow-500' }
]

export function LevelTimeline() {
  const { currentBuild, addLevel } = useCharacterBuilderStore()
  const [selectedClass, setSelectedClass] = useState('')
  
  if (!currentBuild) {
    return <div className="text-center text-muted">Loading class progression...</div>
  }
  
  const levels = currentBuild.enhancedLevelTimeline.sort((a, b) => a.level - b.level)
  const nextLevel = Math.max(...levels.map(l => l.level), 0) + 1
  
  const handleAddLevel = () => {
    if (selectedClass) {
      addLevel(selectedClass, nextLevel)
      setSelectedClass('')
    }
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-panel mb-2">Class Progression</h2>
        <p className="text-muted">
          Plan your character's advancement through levels. Choose classes and plan your progression.
        </p>
      </div>
      
      {/* Add Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Level {nextLevel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {MOCK_CLASSES.map(cls => (
              <Button
                key={cls.id}
                variant={selectedClass === cls.id ? "accent" : "outline"}
                onClick={() => setSelectedClass(cls.id)}
                className="justify-start"
              >
                <cls.icon className={`w-4 h-4 mr-2 ${cls.color}`} />
                {cls.name}
              </Button>
            ))}
          </div>
          
          <Button onClick={handleAddLevel} disabled={!selectedClass}>
            Add Level {nextLevel}
          </Button>
        </CardContent>
      </Card>
      
      {/* Level List */}
      {levels.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-panel mb-3">Level Progression</h3>
          <div className="space-y-3">
            {levels.map((entry) => {
              const classData = MOCK_CLASSES.find(c => c.id === entry.classId)
              const Icon = classData?.icon || Sword
              
              return (
                <Card key={entry.level}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-accent/10 text-accent rounded-full flex items-center justify-center text-sm font-bold">
                        {entry.level}
                      </div>
                      <Icon className={`w-5 h-5 ${classData?.color || 'text-accent'}`} />
                      <div className="flex-1">
                        <div className="font-medium">{classData?.name || entry.classId}</div>
                        <div className="text-sm text-muted">Level {entry.level}</div>
                      </div>
                      {entry.features.length > 0 && (
                        <Badge variant="outline">{entry.features.length} features</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Summary */}
      {levels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progression Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-panel">{Math.max(...levels.map(l => l.level), 0)}</div>
                <div className="text-sm text-muted">Total Level</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-panel">{new Set(levels.map(l => l.classId)).size}</div>
                <div className="text-sm text-muted">Classes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-panel">{levels.filter(l => l.asiOrFeat === 'feat').length}</div>
                <div className="text-sm text-muted">Feats</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-panel">{levels.filter(l => l.asiOrFeat === 'asi').length}</div>
                <div className="text-sm text-muted">ASIs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}