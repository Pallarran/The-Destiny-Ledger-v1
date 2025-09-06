import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Panel } from '../ui/panel'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Save,
  X,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  Shield,
  BookOpen,
  Zap,
  Scroll
} from 'lucide-react'
import type { HomebrewSubclass, HomebrewSubclassFeature, ValidationResult } from '../../types/homebrew'
import { validateSubclass } from '../../engine/homebrewValidation'

interface SubclassEditorProps {
  initialSubclass?: HomebrewSubclass | null
  onSave: (subclass: HomebrewSubclass) => void
  onCancel: () => void
}

// Mock available classes for selection
const AVAILABLE_CLASSES = [
  { id: 'barbarian', name: 'Barbarian' },
  { id: 'bard', name: 'Bard' },
  { id: 'cleric', name: 'Cleric' },
  { id: 'druid', name: 'Druid' },
  { id: 'fighter', name: 'Fighter' },
  { id: 'monk', name: 'Monk' },
  { id: 'paladin', name: 'Paladin' },
  { id: 'ranger', name: 'Ranger' },
  { id: 'rogue', name: 'Rogue' },
  { id: 'sorcerer', name: 'Sorcerer' },
  { id: 'warlock', name: 'Warlock' },
  { id: 'wizard', name: 'Wizard' }
]

// Standard D&D 5e subclass feature levels
const SUBCLASS_FEATURE_LEVELS = [3, 7, 11, 15, 18, 20]

export function SubclassEditor({ initialSubclass, onSave, onCancel }: SubclassEditorProps) {
  const [subclassData, setSubclassData] = useState<HomebrewSubclass>(() => {
    if (initialSubclass) return initialSubclass
    
    return {
      id: '',
      name: '',
      source: 'Homebrew',
      description: '',
      author: 'User',
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft',
      tags: [],
      type: 'subclass',
      className: '',
      classId: '',
      flavorText: '',
      subclassFeatures: [],
      spellList: [],
      expandedSpellList: {}
    }
  })

  const [activeSection, setActiveSection] = useState('basic')
  const [validation, setValidation] = useState<ValidationResult>({ valid: false, errors: [], warnings: [] })
  const [previewMode, setPreviewMode] = useState(false)

  // Validate subclass data whenever it changes
  useEffect(() => {
    const result = validateSubclass(subclassData)
    setValidation(result)
  }, [subclassData])

  const handleBasicChange = (field: keyof HomebrewSubclass, value: any) => {
    setSubclassData(prev => ({ ...prev, [field]: value, updatedAt: new Date() }))
  }

  const handleClassSelection = (classId: string) => {
    const selectedClass = AVAILABLE_CLASSES.find(c => c.id === classId)
    if (selectedClass) {
      setSubclassData(prev => ({
        ...prev,
        classId,
        className: selectedClass.name,
        updatedAt: new Date()
      }))
    }
  }

  const handleFeatureChange = (index: number, field: keyof HomebrewSubclassFeature, value: any) => {
    setSubclassData(prev => {
      const features = [...prev.subclassFeatures]
      features[index] = { ...features[index], [field]: value }
      return { ...prev, subclassFeatures: features, updatedAt: new Date() }
    })
  }

  const addFeature = (level: number) => {
    const newFeature: HomebrewSubclassFeature = {
      level,
      name: '',
      description: '',
      mechanics: [],
      spellsGranted: [],
      choices: []
    }
    
    setSubclassData(prev => ({
      ...prev,
      subclassFeatures: [...prev.subclassFeatures, newFeature].sort((a, b) => a.level - b.level),
      updatedAt: new Date()
    }))
  }

  const removeFeature = (index: number) => {
    setSubclassData(prev => ({
      ...prev,
      subclassFeatures: prev.subclassFeatures.filter((_, i) => i !== index),
      updatedAt: new Date()
    }))
  }

  const handleSpellListChange = (spells: string) => {
    const spellArray = spells.split(',').map(s => s.trim()).filter(s => s.length > 0)
    setSubclassData(prev => ({
      ...prev,
      spellList: spellArray,
      updatedAt: new Date()
    }))
  }

  const handleSave = () => {
    if (!subclassData.name.trim()) {
      alert('Subclass name is required')
      return
    }
    
    if (!subclassData.classId) {
      alert('Parent class selection is required')
      return
    }

    const finalData = {
      ...subclassData,
      id: subclassData.id || `${subclassData.classId}-${subclassData.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: subclassData.name.trim(),
      updatedAt: new Date()
    }
    
    onSave(finalData)
  }

  const getValidationIcon = (field: string) => {
    const hasError = validation.errors.some(e => e.field === field)
    const hasWarning = validation.warnings.some(w => w.field === field)
    
    if (hasError) return <AlertCircle className="w-4 h-4 text-red-500" />
    if (hasWarning) return <AlertCircle className="w-4 h-4 text-yellow-500" />
    return <CheckCircle className="w-4 h-4 text-green-500" />
  }

  const getFieldErrors = (field: string) => {
    return validation.errors.filter(e => e.field === field)
  }


  if (previewMode) {
    return (
      <div className="space-y-6">
        <Panel>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-accent" />
              <div>
                <h2 className="text-2xl font-bold text-panel">Subclass Preview</h2>
                <p className="text-muted">Preview of {subclassData.name || 'Unnamed Subclass'}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setPreviewMode(false)} className="gap-2">
              <X className="w-4 h-4" />
              Exit Preview
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold">{subclassData.name || 'Unnamed Subclass'}</h3>
                <Badge variant="secondary">{subclassData.className} Subclass</Badge>
              </div>
              {subclassData.flavorText && (
                <p className="text-muted italic mb-4">{subclassData.flavorText}</p>
              )}
              <p className="text-panel">{subclassData.description}</p>
            </div>

            {subclassData.subclassFeatures.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-panel mb-4">Subclass Features</h4>
                <div className="space-y-4">
                  {subclassData.subclassFeatures.map((feature, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{feature.name}</CardTitle>
                          <Badge variant="outline">Level {feature.level}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{feature.description}</p>
                        {feature.spellsGranted && feature.spellsGranted.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-panel">Spells Granted:</p>
                            <p className="text-sm text-muted">{feature.spellsGranted.join(', ')}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {subclassData.spellList && subclassData.spellList.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-panel mb-3">Additional Spells</h4>
                <p className="text-sm text-muted">{subclassData.spellList.join(', ')}</p>
              </div>
            )}
          </div>
        </Panel>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Panel>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-panel">
                {initialSubclass ? 'Edit Subclass' : 'Create New Subclass'}
              </h2>
              <p className="text-muted">
                {subclassData.name || 'Unnamed Subclass'} 
                {subclassData.className && ` • ${subclassData.className} Subclass`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setPreviewMode(true)} className="gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button variant="outline" onClick={onCancel} className="gap-2">
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!validation.valid}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {initialSubclass ? 'Update' : 'Create'} Subclass
            </Button>
          </div>
        </div>

        {/* Validation Summary */}
        {(validation.errors.length > 0 || validation.warnings.length > 0) && (
          <div className="mt-4 p-3 border border-border rounded-lg bg-panel/5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
              <div className="text-sm">
                {validation.errors.length > 0 && (
                  <p className="text-red-600 mb-1">
                    {validation.errors.length} error{validation.errors.length !== 1 ? 's' : ''} must be fixed before saving
                  </p>
                )}
                {validation.warnings.length > 0 && (
                  <p className="text-yellow-600">
                    {validation.warnings.length} warning{validation.warnings.length !== 1 ? 's' : ''} to review
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Panel>

      {/* Editor Sections */}
      <Panel>
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Zap className="w-4 h-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="spells" className="gap-2">
              <Scroll className="w-4 h-4" />
              Spells
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <Shield className="w-4 h-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-medium text-panel">Subclass Name</label>
                  {getValidationIcon('name')}
                </div>
                <Input
                  value={subclassData.name}
                  onChange={(e) => handleBasicChange('name', e.target.value)}
                  placeholder="e.g., Circle of the Moon"
                  className={getFieldErrors('name').length > 0 ? 'border-red-500' : ''}
                />
                {getFieldErrors('name').map((error, i) => (
                  <p key={i} className="text-sm text-red-600 mt-1">{error.message}</p>
                ))}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-medium text-panel">Parent Class</label>
                  {getValidationIcon('classId')}
                </div>
                <Select value={subclassData.classId} onValueChange={handleClassSelection}>
                  <SelectTrigger className={getFieldErrors('classId').length > 0 ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select parent class..." />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_CLASSES.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldErrors('classId').map((error, i) => (
                  <p key={i} className="text-sm text-red-600 mt-1">{error.message}</p>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-panel">Description</label>
                {getValidationIcon('description')}
              </div>
              <Textarea
                value={subclassData.description}
                onChange={(e) => handleBasicChange('description', e.target.value)}
                placeholder="Describe the subclass's theme, abilities, and playstyle..."
                rows={4}
                className={getFieldErrors('description').length > 0 ? 'border-red-500' : ''}
              />
              {getFieldErrors('description').map((error, i) => (
                <p key={i} className="text-sm text-red-600 mt-1">{error.message}</p>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-panel mb-2">Flavor Text (Optional)</label>
              <Textarea
                value={subclassData.flavorText || ''}
                onChange={(e) => handleBasicChange('flavorText', e.target.value)}
                placeholder="Add atmospheric or lore text to enhance the subclass theme..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-panel mb-2">Tags</label>
              <Input
                value={subclassData.tags.join(', ')}
                onChange={(e) => handleBasicChange('tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                placeholder="magic, nature, support, damage (comma-separated)"
              />
            </div>
          </TabsContent>

          {/* Features */}
          <TabsContent value="features" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-panel">Subclass Features</h3>
                <p className="text-sm text-muted">Add features that define your subclass's unique abilities</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {SUBCLASS_FEATURE_LEVELS.map(level => (
                <Button
                  key={level}
                  variant="outline"
                  size="sm"
                  onClick={() => addFeature(level)}
                  className="gap-2"
                >
                  <Plus className="w-3 h-3" />
                  Level {level}
                </Button>
              ))}
            </div>

            {subclassData.subclassFeatures.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No subclass features added yet.</p>
                <p className="text-sm">Click a level button above to add your first feature!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {subclassData.subclassFeatures.map((feature, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Level {feature.level}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeature(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-panel mb-2">Feature Name</label>
                        <Input
                          value={feature.name}
                          onChange={(e) => handleFeatureChange(index, 'name', e.target.value)}
                          placeholder="e.g., Wild Shape Improvement"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-panel mb-2">Description</label>
                        <Textarea
                          value={feature.description}
                          onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                          placeholder="Describe what this feature does and how it works..."
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-panel mb-2">Spells Granted (Optional)</label>
                        <Input
                          value={feature.spellsGranted?.join(', ') || ''}
                          onChange={(e) => {
                            const spells = e.target.value.split(',').map(s => s.trim()).filter(s => s)
                            handleFeatureChange(index, 'spellsGranted', spells)
                          }}
                          placeholder="spell1, spell2, spell3 (comma-separated)"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Spells */}
          <TabsContent value="spells" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold text-panel mb-2">Spell Lists</h3>
              <p className="text-sm text-muted mb-4">Define additional spells available to this subclass</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-panel mb-2">Additional Spells Known</label>
              <Textarea
                value={subclassData.spellList?.join(', ') || ''}
                onChange={(e) => handleSpellListChange(e.target.value)}
                placeholder="List spells that this subclass adds to the class spell list (comma-separated)..."
                rows={4}
              />
              <p className="text-xs text-muted mt-1">
                These spells become available to all characters of this subclass
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-panel mb-2">Expanded Spell List by Level</label>
              <div className="text-sm text-muted mb-4">
                <p>Configure spells that become available at specific levels (future feature)</p>
              </div>
              <div className="bg-panel/5 border border-border rounded-lg p-6 text-center">
                <Scroll className="w-8 h-8 mx-auto mb-2 text-muted" />
                <p className="text-sm text-muted">Expanded spell list configuration coming soon</p>
              </div>
            </div>
          </TabsContent>

          {/* Advanced */}
          <TabsContent value="advanced" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold text-panel mb-2">Advanced Settings</h3>
              <p className="text-sm text-muted mb-4">Additional configuration options for your subclass</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-panel mb-2">Author</label>
                <Input
                  value={subclassData.author}
                  onChange={(e) => handleBasicChange('author', e.target.value)}
                  placeholder="Your name or handle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-panel mb-2">Version</label>
                <Input
                  value={subclassData.version}
                  onChange={(e) => handleBasicChange('version', e.target.value)}
                  placeholder="1.0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-panel mb-2">Source</label>
                <Input
                  value={subclassData.source}
                  onChange={(e) => handleBasicChange('source', e.target.value)}
                  placeholder="Homebrew, Custom, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-panel mb-2">Status</label>
                <Select value={subclassData.status} onValueChange={(value) => handleBasicChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-base font-semibold text-panel mb-3">Validation Results</h4>
              <div className="space-y-2">
                {validation.errors.map((error, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                    <div>
                      <span className="font-medium text-red-600">Error:</span>
                      <span className="ml-2">{error.message}</span>
                    </div>
                  </div>
                ))}
                
                {validation.warnings.map((warning, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <div>
                      <span className="font-medium text-yellow-600">Warning:</span>
                      <span className="ml-2">{warning.message}</span>
                    </div>
                  </div>
                ))}
                
                {validation.errors.length === 0 && validation.warnings.length === 0 && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>No validation issues found</span>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Panel>
    </div>
  )
}