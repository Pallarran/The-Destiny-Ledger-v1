import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { 
  Zap,
  Shield,
  Sparkles,
  BarChart3,
  TrendingUp
} from 'lucide-react'
import { getGoalsByCategory } from '../../engine/targetBuildOptimizer'

interface OptimizationGoalSelectorProps {
  selectedGoalId?: string
  onGoalSelect: (goalId: string) => void
}

export function OptimizationGoalSelector({
  selectedGoalId,
  onGoalSelect
}: OptimizationGoalSelectorProps) {

  // Group goals by category for better organization
  const categories = [
    { id: 'combat', name: 'Combat', icon: Zap, goals: getGoalsByCategory('combat') },
    { id: 'survival', name: 'Survival', icon: Shield, goals: getGoalsByCategory('survival') },
    { id: 'utility', name: 'Utility', icon: Sparkles, goals: getGoalsByCategory('utility') },
    { id: 'balanced', name: 'Balanced', icon: BarChart3, goals: getGoalsByCategory('balanced') }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Optimization Goal
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          What should the leveling path optimize for?
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map(category => (
          <div key={category.id}>
            <div className="flex items-center gap-2 mb-2">
              <category.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {category.name}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {category.goals.map(goal => (
                <Button
                  key={goal.id}
                  variant={selectedGoalId === goal.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onGoalSelect(goal.id)}
                  className="justify-start h-auto p-3 text-left"
                >
                  <div>
                    <div className="font-medium text-sm">{goal.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {goal.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}