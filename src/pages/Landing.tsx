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
          <div className="mb-8">
            <img 
              src={`${import.meta.env.BASE_URL}destiny-ledger-logo-with-name.png`} 
              alt="The Destiny Ledger"
              className="mx-auto mb-6 max-w-md w-full h-auto"
            />
          </div>
          
          <div className="space-y-6 mb-8">
            <p className="text-xl text-panel font-medium">
              Master the Art of Character Optimization
            </p>
            <p className="text-lg text-muted max-w-3xl mx-auto">
              The ultimate D&D 5e character optimizer featuring closed-form mathematical DPR calculations, 
              comprehensive build analysis, and multi-dimensional character comparison tools. 
              Transform your character concepts into mathematically optimized powerhouses.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="flex flex-col items-center p-6 bg-panel/5 rounded-lg border border-border/10">
              <User className="w-10 h-10 text-accent mb-3" />
              <h3 className="font-semibold mb-2 text-panel">Advanced Builder</h3>
              <p className="text-sm text-muted text-center">Comprehensive character creation with ability score methods, multiclass progression, and equipment optimization</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-panel/5 rounded-lg border border-border/10">
              <BarChart3 className="w-10 h-10 text-accent mb-3" />
              <h3 className="font-semibold mb-2 text-panel">Mathematical DPR</h3>
              <p className="text-sm text-muted text-center">Closed-form probability calculations with Great Weapon Master and Sharpshooter threshold analysis</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-panel/5 rounded-lg border border-border/10">
              <Shield className="w-10 h-10 text-accent mb-3" />
              <h3 className="font-semibold mb-2 text-panel">Build Comparison</h3>
              <p className="text-sm text-muted text-center">Multi-dimensional analysis including survivability, utility, and role effectiveness metrics</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-panel/5 rounded-lg border border-border/10">
              <TrendingUp className="w-10 h-10 text-accent mb-3" />
              <h3 className="font-semibold mb-2 text-panel">Path Optimization</h3>
              <p className="text-sm text-muted text-center">Advanced multiclass progression analysis to maximize effectiveness at every level</p>
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
        <Panel className="hover:shadow-lg transition-shadow cursor-pointer hover:border-accent/20 transition-all">
          <Link to="/dpr" className="block p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-panel">DPR Laboratory</h3>
                <p className="text-sm text-muted">
                  Advanced damage analysis with probability distributions, AC scaling curves, 
                  and optimization threshold calculations for feat synergies
                </p>
              </div>
            </div>
          </Link>
        </Panel>

        <Panel className="hover:shadow-lg transition-shadow cursor-pointer hover:border-accent/20 transition-all">
          <Link to="/compare" className="block p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald/10 rounded-lg flex items-center justify-center">
                <Sword className="w-7 h-7 text-emerald" />
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-panel">Build Comparison Engine</h3>
                <p className="text-sm text-muted">
                  Multi-dimensional build analysis with radar charts, DPR overlays, 
                  and role effectiveness scoring across combat scenarios
                </p>
              </div>
            </div>
          </Link>
        </Panel>

        <Panel className="hover:shadow-lg transition-shadow cursor-pointer hover:border-accent/20 transition-all">
          <Link to="/explorer" className="block p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gold/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-gold" />
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-panel">Progression Optimizer</h3>
                <p className="text-sm text-muted">
                  Strategic level path analysis for optimal multiclass timing, 
                  ASI/feat decisions, and power spike maximization
                </p>
              </div>
            </div>
          </Link>
        </Panel>
      </div>
    </div>
  )
}