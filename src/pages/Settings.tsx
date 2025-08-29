import { Panel, PanelHeader } from '../components/ui/panel'
import { Button } from '../components/ui/button'
import { 
  Settings as SettingsIcon,
  Palette,
  Database,
  BarChart3,
  AlertTriangle,
  Download,
  Upload,
  Trash2
} from 'lucide-react'

export function Settings() {
  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader title="SETTINGS" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Non-DPR Weights */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Non-DPR Role Weights
              </h3>
              <div className="space-y-4">
                {['Social', 'Control', 'Exploration', 'Defense', 'Support', 'Mobility/Stealth'].map((role) => (
                  <div key={role} className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">{role}</label>
                      <span className="text-sm text-muted">1.0x</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Default Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Default Ability Score Method</label>
                  <select className="w-full p-2 border border-border rounded-md bg-transparent">
                    <option>Point Buy</option>
                    <option>Standard Array</option>
                    <option>Manual Entry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Default Point Buy Limit</label>
                  <input 
                    type="number" 
                    defaultValue={27}
                    className="w-full p-2 border border-border rounded-md bg-transparent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Auto-calculate SS/GWM thresholds</label>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Greedy resource usage by default</label>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* UI and Data */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                UI Theme
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <select className="w-full p-2 border border-border rounded-md bg-transparent">
                    <option>Modern Fantasy (Default)</option>
                    <option>Classic Dark</option>
                    <option>High Contrast</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Reduced motion</label>
                  <input type="checkbox" className="rounded" />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Show advanced tooltips</label>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Management
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Builds
                  </Button>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Builds
                  </Button>
                </div>

                <div className="p-4 border border-danger/20 rounded-lg bg-danger/5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-danger" />
                    <h4 className="font-medium text-danger">Danger Zone</h4>
                  </div>
                  <p className="text-sm text-muted mb-4">
                    This will permanently delete all your saved builds and settings. This action cannot be undone.
                  </p>
                  <Button variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reset All Data
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted space-y-1">
                <p><strong>App Version:</strong> 1.0.0</p>
                <p><strong>Ruleset Version:</strong> SRD 5.1</p>
                <p><strong>Builds Stored:</strong> 3</p>
                <p><strong>Storage Used:</strong> 2.3 KB / 5 MB</p>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}