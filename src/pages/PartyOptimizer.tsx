import { Users } from 'lucide-react'
import PartyOptimizerComponent from '../components/optimizer/PartyOptimizer'

export function PartyOptimizer() {
  return (
    <div className="space-y-6">
      {/* Visual Header */}
      <div className="relative h-32 rounded-lg overflow-hidden bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 shadow-xl">
        <div className="absolute inset-0 bg-[url('/assets/pattern.svg')] opacity-10"></div>
        <div className="relative z-10 h-full flex items-center px-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <Users className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Party Optimizer</h1>
              <p className="text-white/80 text-sm mt-1">
                Analyze party composition, identify synergies, and optimize for balanced gameplay
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <PartyOptimizerComponent />
    </div>
  )
}