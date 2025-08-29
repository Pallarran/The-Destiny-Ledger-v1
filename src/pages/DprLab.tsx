import { Panel, PanelHeader } from '../components/ui/panel'
import { ChartFrame } from '../components/ui/chart-frame'
import { 
  AlertTriangle
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function DprLab() {
  // Placeholder data - will be replaced with actual DPR calculations
  const dprData = [
    { ac: 10, normal: 145, advantage: 170, disadvantage: 120 },
    { ac: 12, normal: 140, advantage: 165, disadvantage: 115 },
    { ac: 14, normal: 130, advantage: 155, disadvantage: 105 },
    { ac: 15, normal: 120, advantage: 145, disadvantage: 95 },
    { ac: 16, normal: 110, advantage: 135, disadvantage: 85 },
    { ac: 17, normal: 95, advantage: 120, disadvantage: 70 },
    { ac: 18, normal: 80, advantage: 105, disadvantage: 55 },
    { ac: 20, normal: 50, advantage: 75, disadvantage: 25 },
    { ac: 25, normal: 15, advantage: 30, disadvantage: 5 },
    { ac: 30, normal: 5, advantage: 15, disadvantage: 0 }
  ]

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader title="DPR LAB" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-4">
            <Panel className="bg-ink text-panel">
              <PanelHeader title="Simulation Config" className="text-panel bg-ink border-b border-border/20" />
              
              <div className="space-y-6">
                {/* Advantage Settings */}
                <div>
                  <h4 className="font-medium mb-3">Advantage</h4>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="advantage" defaultChecked />
                      <span>Normal</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="advantage" />
                      <span>Advantage</span>
                    </label>
                    <input type="checkbox" className="ml-4" />
                  </div>
                </div>

                {/* AC Range */}
                <div>
                  <h4 className="font-medium mb-3">AC Range Advantage Disadvantage</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <span>10</span>
                    <div className="flex-1 bg-border rounded-full h-2 relative">
                      <div className="bg-accent h-2 rounded-full w-3/4"></div>
                    </div>
                    <span>30</span>
                    <input type="checkbox" />
                  </div>
                </div>

                {/* Round 0 Pre-Buffs */}
                <div>
                  <h4 className="font-medium mb-3">Round 0 Pre-Buffs</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded border border-border/20">
                      <span>Haste (Self-Cast)</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="flex items-center gap-2 text-danger text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Concentration conflict: Only one can to active</span>
                    </div>
                  </div>
                </div>

                {/* Round 0 Pre-Buffs */}
                <div>
                  <h4 className="font-medium mb-3">Round 0 Pre-Buffs</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-danger">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">Bless</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="text-sm text-muted">Hex / Hunter's Mark</div>
                  </div>
                </div>

                {/* Additional Options */}
                <div className="space-y-3">
                  <div className="text-sm">
                    <strong>Greedy Resource Use (Default: On)</strong>
                  </div>
                  <div className="text-sm">
                    <strong>Auto SS/GWM (Default: On)</strong>
                  </div>
                </div>
              </div>
            </Panel>
          </div>

          {/* Chart Panel */}
          <div className="lg:col-span-8">
            <ChartFrame title="Expected Damage Per Round (DPR)">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dprData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="ac" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'var(--muted)' }}
                    label={{ value: 'Target AC (10-30)', position: 'insideBottom', offset: -10, style: { textAnchor: 'middle', fill: 'var(--muted)' } }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'var(--muted)' }}
                    label={{ value: 'Damage', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'var(--muted)' } }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--panel)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--ink)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="normal" 
                    stroke="var(--ink)" 
                    strokeWidth={3}
                    name="Normal"
                    dot={{ fill: 'var(--ink)', strokeWidth: 0, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="advantage" 
                    stroke="var(--accent)" 
                    strokeWidth={3}
                    name="Advantage"
                    dot={{ fill: 'var(--accent)', strokeWidth: 0, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartFrame>
          </div>
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* SS/GWM Breakpoints */}
          <Panel className="bg-ink text-panel">
            <PanelHeader title="SS/GWM Breakpoints" className="text-panel bg-ink border-b border-border/20" />
            
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><strong>Weapon</strong></div>
                <div><strong>Longbow +1</strong></div>
                <div></div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>Feat</div>
                <div>Sharpshooter</div>
                <div className="text-right">17</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>Optimal w/+10 Damage up AC</div>
                <div></div>
                <div className="text-right">17</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>Optimal w/o +10 Damage from AC</div>
                <div></div>
                <div className="text-right">18</div>
              </div>
            </div>
          </Panel>

          {/* DPR Summary */}
          <Panel className="bg-panel">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-lg font-bold">185.7</div>
                  <div className="text-sm text-muted">Total 3-Round DPR:</div>
                </div>
                <div>
                  <div className="text-lg font-bold">61.9</div>
                  <div className="text-sm text-muted">Average DPR / Round:</div>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Round 1 DPR Breakdown:</span>
                  <span>62.1 DPR</span>
                </div>
                <div className="flex justify-between">
                  <span>Round 2 DPR Breakdown:</span>
                  <span>55.3 DPR</span>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </Panel>
    </div>
  )
}