import { Panel, PanelHeader } from '../components/ui/panel'
import PartyOptimizerComponent from '../components/optimizer/PartyOptimizer'
import { Users } from 'lucide-react'

export function PartyOptimizer() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Panel>
        <PanelHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Party Optimizer</h1>
              <p className="text-muted-foreground">
                Analyze party composition, identify synergies, and optimize your group's effectiveness
              </p>
            </div>
          </div>
        </PanelHeader>
        
        <PartyOptimizerComponent />
      </Panel>
    </div>
  )
}