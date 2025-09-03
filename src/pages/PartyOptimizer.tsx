import { Panel } from '../components/ui/panel'
import PartyOptimizerComponent from '../components/optimizer/PartyOptimizer'

export function PartyOptimizer() {
  return (
    <div className="space-y-6">
      <Panel>
        <PartyOptimizerComponent />
      </Panel>
    </div>
  )
}