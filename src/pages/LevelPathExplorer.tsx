import { Panel, PanelHeader } from '../components/ui/panel'
import { Button } from '../components/ui/button'
import { 
  Settings, 
  Target,
  Award
} from 'lucide-react'

export function LevelPathExplorer() {
  // Placeholder data
  const pathOptions = [
    {
      id: 1,
      name: "Fighter/Rogue (Optimal DPR)",
      levels: "Fighter 6 → Rogue 4 → Fighter 8 → Rogue 2",
      finalDpr: 185.7,
      milestones: ["Extra Attack (5)", "Sneak Attack +3d6 (9)", "ASI (12)", "Capstone (20)"]
    },
    {
      id: 2,
      name: "Pure Fighter (Consistent)",
      levels: "Fighter 1-20",
      finalDpr: 172.3,
      milestones: ["Extra Attack (5)", "Second Extra (11)", "Capstone (20)"]
    },
    {
      id: 3,
      name: "Fighter/Ranger (Utility)",
      levels: "Fighter 5 → Ranger 3 → Fighter 11 → Ranger 1",
      finalDpr: 168.9,
      milestones: ["Extra Attack (5)", "Hunter's Mark (8)", "Third Attack (16)"]
    }
  ]

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader title="LEVEL PATH EXPLORER" />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Configuration Panel */}
          <div>
            <Panel className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Constraints
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Objective</label>
                  <select className="w-full p-2 border border-border rounded-md bg-transparent">
                    <option>Maximize L20 DPR</option>
                    <option>Maximize Tier Average</option>
                    <option>Custom Mix</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Max Classes</label>
                  <select className="w-full p-2 border border-border rounded-md bg-transparent">
                    <option>3</option>
                    <option>2</option>
                    <option>1</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Must-Hit Milestones</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" defaultChecked />
                      Extra Attack by Level 5
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" />
                      Sneak Attack +2d6 by Level 8
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" />
                      Good at Social by Level 10
                    </label>
                  </div>
                </div>

                <Button variant="accent" className="w-full">
                  <Target className="w-4 h-4 mr-2" />
                  Optimize Paths
                </Button>
              </div>
            </Panel>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Path Candidates</h3>
                <span className="text-sm text-muted">{pathOptions.length} options found</span>
              </div>

              {pathOptions.map((path) => (
                <Panel key={path.id} className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold mb-1">{path.name}</h4>
                      <p className="text-sm text-muted">{path.levels}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-accent">{path.finalDpr}</div>
                      <div className="text-xs text-muted">L20 DPR</div>
                    </div>
                  </div>

                  {/* DPR Sparkline Placeholder */}
                  <div className="mb-4">
                    <div className="h-12 bg-border/20 rounded flex items-end justify-center gap-1 p-2">
                      {Array.from({ length: 20 }, (_, i) => (
                        <div
                          key={i}
                          className="bg-accent/60 rounded-sm flex-1"
                          style={{ height: `${20 + Math.random() * 60}%` }}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-muted text-center mt-1">Level 1-20 DPR Progression</div>
                  </div>

                  {/* Milestones */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-gold" />
                      <span className="text-sm font-medium">Key Milestones</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {path.milestones.map((milestone, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-gold/10 text-gold text-xs rounded-md border border-gold/20"
                        >
                          {milestone}
                        </span>
                      ))}
                    </div>
                  </div>
                </Panel>
              ))}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}