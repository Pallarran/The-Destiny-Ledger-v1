import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { 
  ChevronRight,
  Zap,
  Info,
  TrendingUp
} from 'lucide-react'
import type { LevelingPath } from '../../engine/targetBuildOptimizer'

interface FullLevelingSequenceProps {
  path: LevelingPath
}

export function FullLevelingSequence({ path }: FullLevelingSequenceProps) {
  const getClassColor = (classId: string) => {
    const colors = {
      'fighter': 'bg-red-100 text-red-800 border-red-200',
      'ranger': 'bg-green-100 text-green-800 border-green-200', 
      'rogue': 'bg-purple-100 text-purple-800 border-purple-200',
      'wizard': 'bg-blue-100 text-blue-800 border-blue-200',
      'cleric': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'barbarian': 'bg-orange-100 text-orange-800 border-orange-200',
      'paladin': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'warlock': 'bg-indigo-100 text-indigo-800 border-indigo-200'
    }
    return colors[classId as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getClassAbbrv = (classId: string) => {
    const abbrevs = {
      'fighter': 'FTR',
      'ranger': 'RGR', 
      'rogue': 'ROG',
      'wizard': 'WIZ',
      'cleric': 'CLR',
      'barbarian': 'BBR',
      'paladin': 'PAL',
      'warlock': 'WLK'
    }
    return abbrevs[classId as keyof typeof abbrevs] || classId.substring(0, 3).toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Complete Leveling Sequence
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Full level-by-level progression from 1 to {path.sequence.length}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {path.sequence.map((step, index) => {
            const isFirstOfClass = index === 0 || path.sequence[index - 1].classId !== step.classId
            const classLevel = path.sequence
              .slice(0, index + 1)
              .filter(s => s.classId === step.classId).length

            return (
              <div 
                key={index} 
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  step.powerSpike ? 'bg-yellow-50 border-yellow-200' : 'bg-background'
                }`}
              >
                {/* Level Number */}
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step.powerSpike ? 'bg-yellow-500 text-white' : 'bg-primary text-primary-foreground'
                  }`}>
                    {step.level}
                  </div>
                </div>

                {/* Class Badge */}
                <div className="flex-shrink-0">
                  <Badge 
                    variant="outline" 
                    className={`font-medium ${getClassColor(step.classId)}`}
                  >
                    {getClassAbbrv(step.classId)} {classLevel}
                  </Badge>
                </div>

                {/* Key Features */}
                <div className="flex-1 min-w-0">
                  {step.keyFeatures.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {step.keyFeatures.map((feature, featureIndex) => (
                        <Badge 
                          key={featureIndex}
                          variant="secondary" 
                          className="text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {isFirstOfClass ? `Start ${step.classId}` : `Continue ${step.classId}`}
                    </span>
                  )}
                </div>

                {/* Power Spike Indicator */}
                {step.powerSpike && (
                  <div className="flex-shrink-0" title="Power Spike Level">
                    <Zap className="w-4 h-4 text-yellow-600" />
                  </div>
                )}

                {/* Transition Arrow */}
                {index < path.sequence.length - 1 && (
                  <div className="flex-shrink-0 text-muted-foreground">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Sequence Notes */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium text-blue-900 mb-2">Sequence Notes</div>
              <ul className="text-blue-800 space-y-1">
                <li>• <Zap className="w-3 h-3 inline mr-1 text-yellow-600" /> indicates power spike levels</li>
                <li>• Level numbers show character level, class badges show class level</li>
                <li>• Key features highlight important abilities gained at each level</li>
                <li>• This sequence is optimized for: <strong>{path.name}</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-accent">{path.sequence.length}</div>
            <div className="text-xs text-muted-foreground">Total Levels</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-accent">
              {path.sequence.filter(s => s.powerSpike).length}
            </div>
            <div className="text-xs text-muted-foreground">Power Spikes</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-accent">
              {Object.keys(path.summary.classBreakdown).length}
            </div>
            <div className="text-xs text-muted-foreground">Classes</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}