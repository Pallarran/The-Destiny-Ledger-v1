import { Link } from 'react-router-dom'
import { Panel } from '../components/ui/panel'
import { Button } from '../components/ui/button'
import { 
  Archive, 
  User, 
  BarChart3, 
  TrendingUp,
  Shield,
  Sword,
  Sparkles
} from 'lucide-react'

export function Landing() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Panel className="text-center py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold font-serif mb-4">
            Welcome to The Destiny Ledger
          </h1>
          <p className="text-lg text-muted mb-8">
            The ultimate D&D 5e character optimizer and damage per round (DPR) calculator.
            Build, analyze, and compare your characters with mathematical precision.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="flex flex-col items-center p-4">
              <User className="w-8 h-8 text-accent mb-2" />
              <h3 className="font-semibold mb-1">Character Builder</h3>
              <p className="text-sm text-muted text-center">Full character creation with classes, feats, and equipment</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <BarChart3 className="w-8 h-8 text-accent mb-2" />
              <h3 className="font-semibold mb-1">DPR Analysis</h3>
              <p className="text-sm text-muted text-center">Closed-form mathematical damage calculations</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <Shield className="w-8 h-8 text-accent mb-2" />
              <h3 className="font-semibold mb-1">Role Comparison</h3>
              <p className="text-sm text-muted text-center">Multi-dimensional analysis beyond just damage</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <TrendingUp className="w-8 h-8 text-accent mb-2" />
              <h3 className="font-semibold mb-1">Level Optimization</h3>
              <p className="text-sm text-muted text-center">Find the optimal leveling path for your build</p>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button asChild variant="accent" size="lg">
              <Link to="/builder">
                <User className="w-5 h-5 mr-2" />
                Create Build
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/vault">
                <Archive className="w-5 h-5 mr-2" />
                Open Vault
              </Link>
            </Button>
          </div>
        </div>
      </Panel>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Panel className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link to="/dpr" className="block">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">DPR Lab</h3>
                <p className="text-sm text-muted">
                  Analyze damage output across AC ranges with advantage states
                </p>
              </div>
            </div>
          </Link>
        </Panel>

        <Panel className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link to="/compare" className="block">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald/10 rounded-lg flex items-center justify-center">
                <Sword className="w-6 h-6 text-emerald" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Compare Builds</h3>
                <p className="text-sm text-muted">
                  Side-by-side comparison with radar charts and DPR overlays
                </p>
              </div>
            </div>
          </Link>
        </Panel>

        <Panel className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link to="/explorer" className="block">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Level Path Explorer</h3>
                <p className="text-sm text-muted">
                  Find optimal multiclass progression for maximum effectiveness
                </p>
              </div>
            </div>
          </Link>
        </Panel>
      </div>
    </div>
  )
}