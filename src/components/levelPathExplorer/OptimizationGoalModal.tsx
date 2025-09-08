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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-2xl w-full max-h-[80vh] overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 text-amber-900 shadow-2xl shadow-amber-900/40 p-8 before:absolute before:inset-0 before:rounded-sm before:border-4 before:border-amber-800/60 before:pointer-events-none before:shadow-[inset_0_2px_4px_rgba(180,83,9,0.3),inset_0_-2px_4px_rgba(180,83,9,0.2)] after:absolute after:inset-0 after:rounded-sm after:pointer-events-none after:bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(180,83,9,0.05)_100%)] after:opacity-40 [box-shadow:0_0_0_1px_rgb(180_83_9_/_0.4),0_0_0_2px_rgb(217_119_6_/_0.3),0_0_0_3px_rgb(180_83_9_/_0.2),0_20px_25px_-5px_rgb(0_0_0_/_0.3),0_10px_10px_-5px_rgb(0_0_0_/_0.2)]">
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-amber-800/30 mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-800" />
            <h2 className="text-xl font-bold text-amber-900 font-serif">Select Optimization Goal</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-amber-200/80 hover:bg-amber-300/80 text-amber-800 hover:text-amber-900 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative z-10 max-h-96 overflow-y-auto">
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