import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { GraduationCap, BookOpen, Zap, Target, Plus } from 'lucide-react'

export function DowntimeTrainingSelection() {
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
          <div className="text-center py-8">
            <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted opacity-50" />
            <p className="text-muted mb-4">No training sessions yet</p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
              <Plus className="w-4 h-4" />
              Add Training Session
            </button>
          </div>
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