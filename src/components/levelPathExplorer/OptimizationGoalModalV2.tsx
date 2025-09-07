import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { getOptimizationGoalsV2 } from '../../engine/targetBuildOptimizerV2'
import type { OptimizationGoalV2 } from '../../engine/targetBuildOptimizerV2'
import { cn } from '../../lib/utils'
import { 
  Swords, 
  Shield, 
  Target,
  Zap,
  BookOpen,
  TrendingUp
} from 'lucide-react'

interface OptimizationGoalModalV2Props {
  isOpen: boolean
  onClose: () => void
  selectedGoalId?: string
  onGoalSelect: (goalId: string) => void
}

export function OptimizationGoalModalV2({
  isOpen,
  onClose,
  selectedGoalId,
  onGoalSelect
}: OptimizationGoalModalV2Props) {
  const goals = getOptimizationGoalsV2()
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'combat': return <Swords className="w-4 h-4" />
      case 'survival': return <Shield className="w-4 h-4" />
      case 'utility': return <BookOpen className="w-4 h-4" />
      case 'balanced': return <TrendingUp className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'combat': return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'survival': return 'text-green-500 bg-green-500/10 border-green-500/20'
      case 'utility': return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      case 'balanced': return 'text-purple-500 bg-purple-500/10 border-purple-500/20'
      default: return ''
    }
  }

  const handleSelect = (goalId: string) => {
    onGoalSelect(goalId)
    onClose()
  }

  // Group goals by category
  const goalsByCategory = goals.reduce((acc, goal) => {
    if (!acc[goal.category]) acc[goal.category] = []
    acc[goal.category].push(goal)
    return acc
  }, {} as Record<string, OptimizationGoalV2[]>)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle>Select Optimization Goal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {Object.entries(goalsByCategory).map(([category, categoryGoals]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${getCategoryColor(category)}`}>
                  {getCategoryIcon(category)}
                </div>
                <h3 className="font-medium capitalize">{category}</h3>
              </div>
              
              <div className="grid gap-2">
                {categoryGoals.map(goal => (
                  <Button
                    key={goal.id}
                    variant={selectedGoalId === goal.id ? 'default' : 'outline'}
                    className={cn(
                      "w-full justify-start text-left h-auto py-3 border transition-all",
                      selectedGoalId === goal.id 
                        ? "bg-primary text-primary-foreground border-primary shadow-md" 
                        : "bg-card hover:bg-muted/50 border-border text-foreground"
                    )}
                    onClick={() => handleSelect(goal.id)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{goal.name}</span>
                          {selectedGoalId === goal.id && (
                            <Badge variant="secondary" className="text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-normal">
                          {goal.description}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}