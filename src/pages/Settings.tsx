import { useState, useEffect, useRef } from 'react'
import { Panel, PanelHeader } from '../components/ui/panel'
import { Button } from '../components/ui/button'
import { Slider } from '../components/ui/slider'
import { Switch } from '../components/ui/switch'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useSettingsStore } from '../stores/settingsStore'
import { useVaultStore } from '../stores/vaultStore'
import { 
  Settings as SettingsIcon,
  Palette,
  Database,
  BarChart3,
  AlertTriangle,
  Download,
  Upload,
  Trash2,
  CheckCircle,
  Info
} from 'lucide-react'

export function Settings() {
  const {
    roleWeights,
    defaultAbilityMethod,
    defaultPointBuyLimit,
    autoCalculateGWMSS,
    greedyResourceUse,
    theme,
    reducedMotion,
    showAdvancedTooltips,
    updateRoleWeight,
    updateDefaultAbilityMethod,
    updateDefaultPointBuyLimit,
    toggleAutoCalculateGWMSS,
    toggleGreedyResourceUse,
    setTheme,
    toggleReducedMotion,
    toggleAdvancedTooltips,
    resetToDefaults
  } = useSettingsStore()

  const { builds, deleteBuild } = useVaultStore()
  const [saveNotification, setSaveNotification] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Show save notification when settings change
  useEffect(() => {
    setSaveNotification(true)
    const timer = setTimeout(() => setSaveNotification(false), 2000)
    return () => clearTimeout(timer)
  }, [
    roleWeights,
    defaultAbilityMethod,
    defaultPointBuyLimit,
    autoCalculateGWMSS,
    greedyResourceUse,
    theme,
    reducedMotion,
    showAdvancedTooltips
  ])

  // Save settings to localStorage
  useEffect(() => {
    const settings = {
      roleWeights,
      defaultAbilityMethod,
      defaultPointBuyLimit,
      autoCalculateGWMSS,
      greedyResourceUse,
      theme,
      reducedMotion,
      showAdvancedTooltips
    }
    localStorage.setItem('destinyLedgerSettings', JSON.stringify(settings))
  }, [
    roleWeights,
    defaultAbilityMethod,
    defaultPointBuyLimit,
    autoCalculateGWMSS,
    greedyResourceUse,
    theme,
    reducedMotion,
    showAdvancedTooltips
  ])

  const handleExportBuilds = () => {
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      builds: builds,
      settings: {
        roleWeights,
        defaultAbilityMethod,
        defaultPointBuyLimit,
        autoCalculateGWMSS,
        greedyResourceUse,
        theme,
        reducedMotion,
        showAdvancedTooltips
      }
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `destiny-ledger-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportBuilds = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string)
        
        // Import builds
        if (importData.builds && Array.isArray(importData.builds)) {
          const vaultStore = useVaultStore.getState()
          importData.builds.forEach((build: any) => {
            // Check if build already exists
            const existing = builds.find(b => b.id === build.id)
            if (existing) {
              vaultStore.updateBuild(build.id, build)
            } else {
              vaultStore.addBuild(build)
            }
          })
        }

        // Import settings if available
        if (importData.settings) {
          const settingsStore = useSettingsStore.getState()
          settingsStore.loadSettings(importData.settings)
        }

        alert(`Successfully imported ${importData.builds?.length || 0} builds and settings!`)
      } catch (error) {
        console.error('Import failed:', error)
        alert('Failed to import file. Please check the file format.')
      }
    }
    reader.readAsText(file)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleResetAllData = () => {
    if (resetConfirm) {
      // Clear all builds
      builds.forEach(build => deleteBuild(build.id))
      
      // Reset settings
      resetToDefaults()
      
      // Clear localStorage
      localStorage.removeItem('destinyLedgerSettings')
      localStorage.removeItem('vaultBuilds')
      
      setResetConfirm(false)
      alert('All data has been reset successfully.')
    } else {
      setResetConfirm(true)
      setTimeout(() => setResetConfirm(false), 5000)
    }
  }

  const roleLabels = {
    social: 'Social',
    control: 'Control',
    exploration: 'Exploration',
    defense: 'Defense',
    support: 'Support',
    mobility: 'Mobility/Stealth'
  }

  const calculateStorageUsed = () => {
    const stored = JSON.stringify(localStorage)
    const sizeInBytes = new Blob([stored]).size
    return (sizeInBytes / 1024).toFixed(2)
  }

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader title="SETTINGS" />
        
        {/* Save Notification */}
        {saveNotification && (
          <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 z-50 animate-pulse">
            <CheckCircle className="w-4 h-4" />
            Settings saved
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Non-DPR Weights */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Non-DPR Role Weights
              </h3>
              <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground mb-4">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5" />
                  <p>Adjust how much weight to give to non-combat roles when evaluating builds.</p>
                </div>
              </div>
              <div className="space-y-4">
                {Object.entries(roleWeights).map(([role, weight]) => (
                  <div key={role} className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">
                        {roleLabels[role as keyof typeof roleLabels]}
                      </label>
                      <span className="text-sm text-muted">{weight.toFixed(1)}x</span>
                    </div>
                    <Slider
                      value={[weight]}
                      onValueChange={([value]) => updateRoleWeight(role as keyof typeof roleWeights, value)}
                      max={2}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
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
                  <Label htmlFor="ability-method">Default Ability Score Method</Label>
                  <Select
                    value={defaultAbilityMethod}
                    onValueChange={(value: any) => updateDefaultAbilityMethod(value)}
                  >
                    <SelectTrigger id="ability-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pointbuy">Point Buy</SelectItem>
                      <SelectItem value="standard">Standard Array</SelectItem>
                      <SelectItem value="manual">Manual Entry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="point-buy-limit">Default Point Buy Limit</Label>
                  <input 
                    id="point-buy-limit"
                    type="number" 
                    value={defaultPointBuyLimit}
                    onChange={(e) => updateDefaultPointBuyLimit(Number(e.target.value))}
                    min={20}
                    max={40}
                    className="w-full p-2 border border-border rounded-md bg-transparent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-gwm" className="flex-1 cursor-pointer">
                    Auto-calculate SS/GWM thresholds
                  </Label>
                  <Switch
                    id="auto-gwm"
                    checked={autoCalculateGWMSS}
                    onCheckedChange={toggleAutoCalculateGWMSS}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="greedy-resources" className="flex-1 cursor-pointer">
                    Greedy resource usage by default
                  </Label>
                  <Switch
                    id="greedy-resources"
                    checked={greedyResourceUse}
                    onCheckedChange={toggleGreedyResourceUse}
                  />
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
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={theme}
                    onValueChange={(value: any) => setTheme(value)}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern-fantasy">Modern Fantasy (Default)</SelectItem>
                      <SelectItem value="classic-dark">Classic Dark</SelectItem>
                      <SelectItem value="high-contrast">High Contrast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="reduced-motion" className="flex-1 cursor-pointer">
                    Reduced motion
                  </Label>
                  <Switch
                    id="reduced-motion"
                    checked={reducedMotion}
                    onCheckedChange={toggleReducedMotion}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="advanced-tooltips" className="flex-1 cursor-pointer">
                    Show advanced tooltips
                  </Label>
                  <Switch
                    id="advanced-tooltips"
                    checked={showAdvancedTooltips}
                    onCheckedChange={toggleAdvancedTooltips}
                  />
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
                  <Button variant="outline" onClick={handleExportBuilds}>
                    <Download className="w-4 h-4 mr-2" />
                    Export All Data
                  </Button>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportBuilds}
                    className="hidden"
                  />
                </div>

                <div className="p-4 border border-danger/20 rounded-lg bg-danger/5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-danger" />
                    <h4 className="font-medium text-danger">Danger Zone</h4>
                  </div>
                  <p className="text-sm text-muted mb-4">
                    {resetConfirm 
                      ? 'Are you sure? Click again to confirm deletion of ALL data.'
                      : 'This will permanently delete all your saved builds and settings. This action cannot be undone.'
                    }
                  </p>
                  <Button 
                    variant="destructive"
                    onClick={handleResetAllData}
                    className={resetConfirm ? 'animate-pulse' : ''}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {resetConfirm ? 'Click to Confirm Reset' : 'Reset All Data'}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted space-y-1">
                <p><strong>App Version:</strong> 1.0.0</p>
                <p><strong>Ruleset Version:</strong> SRD 5.1</p>
                <p><strong>Builds Stored:</strong> {builds.length}</p>
                <p><strong>Storage Used:</strong> {calculateStorageUsed()} KB / 5 MB</p>
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}