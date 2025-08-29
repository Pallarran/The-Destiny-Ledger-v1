import { Panel, PanelHeader } from '../components/ui/panel'
import { ChartFrame } from '../components/ui/chart-frame'
// Icons imported from recharts components
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'

export function Compare() {
  // Placeholder data
  const dprData = [
    { ac: 10, kaelen: 145, lyra: 120, bartholomew: 80 },
    { ac: 12, kaelen: 140, lyra: 115, bartholomew: 75 },
    { ac: 14, kaelen: 130, lyra: 105, bartholomew: 65 },
    { ac: 15, kaelen: 120, lyra: 95, bartholomew: 55 },
    { ac: 16, kaelen: 110, lyra: 85, bartholomew: 45 },
    { ac: 18, kaelen: 80, lyra: 65, bartholomew: 25 },
    { ac: 20, kaelen: 50, lyra: 45, bartholomew: 15 },
    { ac: 25, kaelen: 15, lyra: 20, bartholomew: 5 },
    { ac: 30, kaelen: 5, lyra: 10, bartholomew: 0 }
  ]

  const radarData = [
    { axis: 'Social', kaelen: 45, lyra: 60, bartholomew: 90 },
    { axis: 'Defense', kaelen: 75, lyra: 65, bartholomew: 85 },
    { axis: 'Mobility/Stealth', kaelen: 55, lyra: 85, bartholomew: 30 },
    { axis: 'Support', kaelen: 25, lyra: 40, bartholomew: 95 },
    { axis: 'Exploration', kaelen: 60, lyra: 95, bartholomew: 70 },
    { axis: 'Control', kaelen: 85, lyra: 70, bartholomew: 60 }
  ]

  const builds = [
    { 
      id: 1, 
      name: 'Sir Kaelen', 
      subclass: '(Battle Master)', 
      active: true, 
      color: '#1E40AF',
      totalDpr: 185.5,
      avgDpr: 61.9
    },
    { 
      id: 2, 
      name: 'Lyra', 
      subclass: '(Gloom Stalker)', 
      active: true, 
      color: '#059669',
      totalDpr: 176.6,
      avgDpr: 58.9
    },
    { 
      id: 3, 
      name: 'Bartholomew', 
      subclass: '(Life Cleric)', 
      active: true, 
      color: '#C8A86B',
      totalDpr: 76.6,
      avgDpr: 25.5
    }
  ]

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader title="COMPARE BUILDS" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Radar Chart */}
          <div className="lg:col-span-5">
            <ChartFrame title="Non-DPR Roles">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis 
                    dataKey="axis" 
                    tick={{ fontSize: 11, fill: 'var(--ink)' }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]}
                    tickCount={6}
                    tick={{ fontSize: 10, fill: 'var(--muted)' }}
                  />
                  <Radar
                    name="Sir Kaelen"
                    dataKey="kaelen"
                    stroke="#1E40AF"
                    fill="#1E40AF"
                    fillOpacity={0.35}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Lyra"
                    dataKey="lyra"
                    stroke="#059669"
                    fill="#059669"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Bartholomew"
                    dataKey="bartholomew"
                    stroke="#C8A86B"
                    fill="#C8A86B"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </ChartFrame>
          </div>

          {/* DPR Comparison Chart */}
          <div className="lg:col-span-7">
            <ChartFrame title="DPR Comparison">
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
                    dataKey="kaelen" 
                    stroke="#1E40AF" 
                    strokeWidth={3}
                    name="Sir Kaelen"
                    dot={{ fill: '#1E40AF', strokeWidth: 0, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lyra" 
                    stroke="#059669" 
                    strokeWidth={3}
                    name="Lyra"
                    dot={{ fill: '#059669', strokeWidth: 0, r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bartholomew" 
                    stroke="#C8A86B" 
                    strokeWidth={3}
                    name="Bartholomew"
                    dot={{ fill: '#C8A86B', strokeWidth: 0, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartFrame>
          </div>
        </div>

        {/* Build Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          {builds.map((build) => (
            <Panel key={build.id} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: build.color }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{build.name}</h3>
                  <p className="text-sm text-muted">{build.subclass}</p>
                </div>
                <input 
                  type="checkbox" 
                  defaultChecked={build.active}
                  className="rounded"
                />
              </div>
            </Panel>
          ))}
        </div>

        {/* SS/GWM Breakpoint Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Panel className="bg-ink text-panel">
            <PanelHeader title="SS/GWM Breakpoints & Stats" className="text-panel bg-ink border-b border-border/20" />
            
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

              <div className="border-t border-border/20 pt-3 mt-4">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Total 1 Round DPR:</span>
                    <span className="font-bold">15.5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average DPR / Round:</span>
                    <span className="font-bold">6.9</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Round 1 DPR Breakdown:</span>
                    <span>80 DPR</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Round 2 DPR Breakdown:</span>
                    <span>58 DPR</span>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel className="bg-ink text-panel">
            <PanelHeader title="SS/GWM Breakpoints & Stats" className="text-panel bg-ink border-b border-border/20" />
            
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div><strong>Weapon</strong></div>
                <div><strong>Longbow +1</strong></div>
                <div></div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>Feat</div>
                <div>Sharpshooter</div>
                <div className="text-right">18</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>Optimal w/+10 Damage up nd</div>
                <div></div>
                <div className="text-right">12</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>Optimal w/o +10 Damage AC</div>
                <div></div>
                <div className="text-right">18</div>
              </div>

              <div className="border-t border-border/20 pt-3 mt-4">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Total 5 Round DPR:</span>
                    <span className="font-bold">76.6</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average DPR / Round:</span>
                    <span className="font-bold">61.9</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Round 2 DPR Breakdown:</span>
                    <span>99 DPR</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Round 1 DPR Breakdown:</span>
                    <span>5.6 DPR</span>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </Panel>
    </div>
  )
}