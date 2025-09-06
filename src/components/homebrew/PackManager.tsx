import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Panel } from '../ui/panel'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { 
  Download,
  Upload,
  Package,
  FileText,
  Eye,
  X,
  Check,
  Trash2,
  Share2,
  Info
} from 'lucide-react'
import type { HomebrewPack } from '../../types/homebrew'

interface PackManagerProps {
  onClose: () => void
}

// Mock homebrew content for demonstration
const mockHomebrewContent = {
  classes: [
    { id: 'mystic', name: 'Mystic', type: 'class', author: 'User', status: 'published' },
    { id: 'artificer-extended', name: 'Artificer (Extended)', type: 'class', author: 'User', status: 'draft' }
  ],
  subclasses: [
    { id: 'oath-of-redemption', name: 'Oath of Redemption', type: 'subclass', author: 'User', status: 'published' },
    { id: 'school-of-chronurgy', name: 'School of Chronurgy', type: 'subclass', author: 'User', status: 'testing' }
  ],
  feats: [
    { id: 'elemental-adept-extended', name: 'Elemental Adept (Extended)', type: 'feat', author: 'User', status: 'published' },
    { id: 'metamagic-mastery', name: 'Metamagic Mastery', type: 'feat', author: 'User', status: 'draft' }
  ],
  spells: [
    { id: 'time-stop-lesser', name: 'Lesser Time Stop', type: 'spell', author: 'User', status: 'published' },
    { id: 'elemental-weapon-improved', name: 'Improved Elemental Weapon', type: 'spell', author: 'User', status: 'testing' }
  ],
  magicItems: [
    { id: 'staff-of-power-enhanced', name: 'Enhanced Staff of Power', type: 'item', author: 'User', status: 'published' },
    { id: 'ring-of-spell-storing-major', name: 'Major Ring of Spell Storing', type: 'item', author: 'User', status: 'draft' }
  ]
}

// Mock imported packs
const mockImportedPacks: HomebrewPack[] = [
  {
    name: 'Elemental Magic Expansion',
    version: '1.2.0',
    author: 'CommunityCreator',
    description: 'A comprehensive collection of elemental-themed classes, spells, and magic items.',
    classes: [],
    subclasses: [],
    feats: [],
    spells: [],
    magicItems: [],
    createdAt: new Date('2024-01-15')
  },
  {
    name: 'Martial Arts Master',
    version: '2.0.1',
    author: 'FightingFan',
    description: 'Expanded martial combat options including new fighting styles and techniques.',
    classes: [],
    subclasses: [],
    feats: [],
    spells: [],
    magicItems: [],
    createdAt: new Date('2024-02-20')
  }
]

export function PackManager({ onClose }: PackManagerProps) {
  const [activeTab, setActiveTab] = useState('export')
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({})
  const [packData, setPackData] = useState({
    name: '',
    version: '1.0.0',
    author: 'User',
    description: ''
  })
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importedPacks, setImportedPacks] = useState<HomebrewPack[]>(mockImportedPacks)
  const [previewPack, setPreviewPack] = useState<HomebrewPack | null>(null)

  const handleItemToggle = (category: string, itemId: string) => {
    const key = `${category}-${itemId}`
    setSelectedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSelectAll = (category: string) => {
    const items = mockHomebrewContent[category as keyof typeof mockHomebrewContent]
    const updates: Record<string, boolean> = {}
    items.forEach(item => {
      const key = `${category}-${item.id}`
      updates[key] = true
    })
    setSelectedItems(prev => ({ ...prev, ...updates }))
  }

  const handleDeselectAll = (category: string) => {
    const items = mockHomebrewContent[category as keyof typeof mockHomebrewContent]
    const updates: Record<string, boolean> = {}
    items.forEach(item => {
      const key = `${category}-${item.id}`
      updates[key] = false
    })
    setSelectedItems(prev => ({ ...prev, ...updates }))
  }

  const getSelectedCount = (category: string) => {
    const items = mockHomebrewContent[category as keyof typeof mockHomebrewContent]
    return items.filter(item => selectedItems[`${category}-${item.id}`]).length
  }

  const getTotalSelectedCount = () => {
    return Object.values(selectedItems).filter(Boolean).length
  }

  const handleExportPack = () => {
    if (!packData.name.trim()) {
      alert('Pack name is required')
      return
    }

    if (getTotalSelectedCount() === 0) {
      alert('Please select at least one item to export')
      return
    }

    // Create the homebrew pack
    const pack: HomebrewPack = {
      name: packData.name,
      version: packData.version,
      author: packData.author,
      description: packData.description,
      classes: mockHomebrewContent.classes.filter(item => selectedItems[`classes-${item.id}`]) as any[],
      subclasses: mockHomebrewContent.subclasses.filter(item => selectedItems[`subclasses-${item.id}`]) as any[],
      feats: mockHomebrewContent.feats.filter(item => selectedItems[`feats-${item.id}`]) as any[],
      spells: mockHomebrewContent.spells.filter(item => selectedItems[`spells-${item.id}`]) as any[],
      magicItems: mockHomebrewContent.magicItems.filter(item => selectedItems[`magicItems-${item.id}`]) as any[],
      createdAt: new Date()
    }

    // Export as JSON file
    const jsonData = JSON.stringify(pack, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${packData.name.toLowerCase().replace(/\s+/g, '-')}-v${packData.version}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    alert(`Exported "${packData.name}" successfully!`)
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImportFile(file)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const pack: HomebrewPack = JSON.parse(content)
          
          // Validate pack structure
          if (!pack.name || !pack.version || !pack.author) {
            alert('Invalid pack format: missing required fields')
            return
          }

          setPreviewPack(pack)
        } catch (error) {
          alert('Failed to parse pack file. Please ensure it\'s a valid JSON file.')
        }
      }
      reader.readAsText(file)
    }
  }

  const handleImportConfirm = () => {
    if (!previewPack) return

    // Add to imported packs list
    setImportedPacks(prev => [previewPack, ...prev])
    setPreviewPack(null)
    setImportFile(null)
    
    alert(`Successfully imported "${previewPack.name}"!`)
  }

  const handleRemovePack = (packName: string) => {
    if (confirm(`Are you sure you want to remove "${packName}"?`)) {
      setImportedPacks(prev => prev.filter(pack => pack.name !== packName))
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      published: 'bg-green-500/10 text-green-600 border-green-500/20',
      draft: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      testing: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    }

    return (
      <Badge variant="outline" className={`text-xs ${colors[status as keyof typeof colors] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPackContentSummary = (pack: HomebrewPack) => {
    const counts = [
      { label: 'Classes', count: pack.classes.length },
      { label: 'Subclasses', count: pack.subclasses.length },
      { label: 'Feats', count: pack.feats.length },
      { label: 'Spells', count: pack.spells.length },
      { label: 'Items', count: pack.magicItems.length }
    ].filter(item => item.count > 0)

    return counts.map(item => `${item.count} ${item.label}`).join(', ') || 'No content'
  }

  return (
    <div className="space-y-6">
      <Panel>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-panel">Homebrew Pack Manager</h2>
              <p className="text-muted">Export your content or import community packs</p>
            </div>
          </div>
          <Button variant="outline" onClick={onClose} className="gap-2">
            <X className="w-4 h-4" />
            Close
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="export" className="gap-2">
              <Download className="w-4 h-4" />
              Export Pack
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <Upload className="w-4 h-4" />
              Import Pack
            </TabsTrigger>
            <TabsTrigger value="manage" className="gap-2">
              <Package className="w-4 h-4" />
              Manage Packs
            </TabsTrigger>
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold text-panel mb-2">Create Homebrew Pack</h3>
              <p className="text-sm text-muted mb-4">Bundle your homebrew content into a shareable pack</p>
            </div>

            {/* Pack Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pack Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-panel mb-2">Pack Name</label>
                    <Input
                      value={packData.name}
                      onChange={(e) => setPackData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., My Awesome Homebrew"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-panel mb-2">Version</label>
                    <Input
                      value={packData.version}
                      onChange={(e) => setPackData(prev => ({ ...prev, version: e.target.value }))}
                      placeholder="1.0.0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-panel mb-2">Author</label>
                  <Input
                    value={packData.author}
                    onChange={(e) => setPackData(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Your name or handle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-panel mb-2">Description</label>
                  <Textarea
                    value={packData.description}
                    onChange={(e) => setPackData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this pack contains and its theme..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Select Content to Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(mockHomebrewContent).map(([category, items]) => {
                  const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
                  const selectedCount = getSelectedCount(category)
                  
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-panel">{categoryName}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {selectedCount}/{items.length}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectAll(category)}
                            className="text-xs"
                          >
                            Select All
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeselectAll(category)}
                            className="text-xs"
                          >
                            Deselect All
                          </Button>
                        </div>
                      </div>
                      
                      {items.length === 0 ? (
                        <p className="text-sm text-muted py-4">No {category} created yet</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {items.map((item) => {
                            const key = `${category}-${item.id}`
                            const isSelected = selectedItems[key]
                            
                            return (
                              <div
                                key={item.id}
                                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                                  isSelected 
                                    ? 'bg-accent/10 border-accent' 
                                    : 'border-border hover:bg-panel/5'
                                }`}
                                onClick={() => handleItemToggle(category, item.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                                    isSelected 
                                      ? 'bg-accent border-accent text-white' 
                                      : 'border-border'
                                  }`}>
                                    {isSelected && <Check className="w-3 h-3" />}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{item.name}</p>
                                    <p className="text-xs text-muted">by {item.author}</p>
                                  </div>
                                </div>
                                {getStatusBadge(item.status)}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Export Summary */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-panel">Ready to Export</p>
                    <p className="text-sm text-muted">
                      {getTotalSelectedCount()} items selected
                    </p>
                  </div>
                  <Button onClick={handleExportPack} className="gap-2" disabled={getTotalSelectedCount() === 0}>
                    <Download className="w-4 h-4" />
                    Export Pack
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold text-panel mb-2">Import Homebrew Pack</h3>
              <p className="text-sm text-muted mb-4">Import community-created homebrew packs</p>
            </div>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upload Pack File</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-panel mb-2">Select JSON Pack File</label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="block w-full text-sm text-panel file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent file:text-white hover:file:bg-accent/90"
                  />
                </div>

                {importFile && (
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <FileText className="w-4 h-4" />
                    <span>Selected: {importFile.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pack Preview */}
            {previewPack && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Pack Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-panel">Name</p>
                      <p className="text-sm">{previewPack.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-panel">Version</p>
                      <p className="text-sm">{previewPack.version}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-panel">Author</p>
                      <p className="text-sm">{previewPack.author}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-panel">Created</p>
                      <p className="text-sm">{previewPack.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>

                  {previewPack.description && (
                    <div>
                      <p className="text-sm font-medium text-panel mb-1">Description</p>
                      <p className="text-sm text-muted">{previewPack.description}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-panel mb-1">Contents</p>
                    <p className="text-sm text-muted">{getPackContentSummary(previewPack)}</p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setPreviewPack(null)}>
                      Cancel
                    </Button>
                    <Button onClick={handleImportConfirm} className="gap-2">
                      <Upload className="w-4 h-4" />
                      Import Pack
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Import Guidelines
              </h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Only import packs from trusted sources</p>
                <p>• Review pack contents before importing</p>
                <p>• Imported content may override existing items with the same ID</p>
                <p>• Pack files should be valid JSON format</p>
              </div>
            </div>
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold text-panel mb-2">Manage Imported Packs</h3>
              <p className="text-sm text-muted mb-4">View and manage your imported homebrew packs</p>
            </div>

            {importedPacks.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12 text-muted">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No packs imported yet.</p>
                    <p className="text-sm">Import some packs to see them here!</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {importedPacks.map((pack, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-panel">{pack.name}</h4>
                            <Badge variant="secondary" className="text-xs">v{pack.version}</Badge>
                          </div>
                          <p className="text-sm text-muted mb-2">by {pack.author}</p>
                          {pack.description && (
                            <p className="text-sm mb-3">{pack.description}</p>
                          )}
                          <p className="text-xs text-muted">{getPackContentSummary(pack)}</p>
                          <p className="text-xs text-muted">Imported {pack.createdAt.toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="gap-2">
                            <Share2 className="w-4 h-4" />
                            Share
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 text-destructive hover:text-destructive"
                            onClick={() => handleRemovePack(pack.name)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Panel>
    </div>
  )
}