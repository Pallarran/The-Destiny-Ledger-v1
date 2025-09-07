import { Button } from '../ui/button'
import { 
  Zap,
  Shield,
  Sparkles,
  BarChart3,
  TrendingUp,
  X
} from 'lucide-react'
import { getGoalsByCategory } from '../../engine/targetBuildOptimizer'

interface OptimizationGoalModalProps {
  isOpen: boolean
  onClose: () => void
  selectedGoalId?: string
  onGoalSelect: (goalId: string) => void
}

export function OptimizationGoalModal({
  isOpen,
  onClose,
  selectedGoalId,
  onGoalSelect
}: OptimizationGoalModalProps) {
  const categories = [
    { id: 'combat', name: 'Combat', icon: Zap, goals: getGoalsByCategory('combat') },
    { id: 'survival', name: 'Survival', icon: Shield, goals: getGoalsByCategory('survival') },
    { id: 'utility', name: 'Utility', icon: Sparkles, goals: getGoalsByCategory('utility') },
    { id: 'balanced', name: 'Balanced', icon: BarChart3, goals: getGoalsByCategory('balanced') }
  ]

  const handleSelect = (goalId: string) => {
    onGoalSelect(goalId)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Select Optimization Goal</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 max-h-96 overflow-y-auto">
          <p className="text-sm text-muted-foreground mb-6">
            Choose what the leveling path should optimize for. Each goal produces different leveling sequences.
          </p>
          
          <div className="space-y-6">
            {categories.map(category => (
              <div key={category.id}>
                <div className="flex items-center gap-2 mb-3">
                  <category.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {category.name}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {category.goals.map(goal => (
                    <button
                      key={goal.id}
                      onClick={() => handleSelect(goal.id)}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        selectedGoalId === goal.id
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-border hover:border-primary/50 hover:bg-accent/5'
                      }`}
                    >
                      <div className="font-medium text-sm">{goal.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {goal.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={onClose}
            disabled={!selectedGoalId}
          >
            Confirm Selection
          </Button>
        </div>
      </div>
    </div>
  )
}