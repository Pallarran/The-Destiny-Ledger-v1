import { Button } from '../ui/button'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../ui/dialog'
import { 
  Zap,
  Shield,
  Sparkles,
  BarChart3,
  TrendingUp
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-800" />
            Select Optimization Goal
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto">
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={onClose}
            disabled={!selectedGoalId}
          >
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}