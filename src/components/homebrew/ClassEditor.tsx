import { useState, useEffect } from 'react'
import { Panel } from '../ui/panel'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { validateClass } from '../../engine/homebrewValidation'
import { 
  Save, 
  Eye, 
  AlertCircle, 
  CheckCircle, 
  Plus, 
  X
} from 'lucide-react'
import type { HomebrewClass, ValidationResult } from '../../types/homebrew'
import type { AbilityScore } from '../../rules/types'

interface ClassEditorProps {
  initialClass?: Partial<HomebrewClass>
  onSave: (classData: HomebrewClass) => void
  onCancel: () => void
}

export function ClassEditor({ initialClass, onSave, onCancel }: ClassEditorProps) {
  const [classData, setClassData] = useState<Partial<HomebrewClass>>({
    type: 'class',
    name: '',
    id: '',
    source: 'Homebrew',
    description: '',
    author: '',
    version: '1.0.0',
    status: 'draft',
    tags: [],
    hitDie: 8,
    primaryAbility: [],
    savingThrowProficiencies: [],
    skillProficiencies: {
      count: 2,
      choices: []
    },
    armorProficiencies: [],
    weaponProficiencies: [],
    toolProficiencies: [],
    startingEquipment: [],
    classFeatures: [],
    subclassLevels: [3],
    subclassFeatureLevels: [3, 7, 15, 18],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...initialClass
  })

  const [validation, setValidation] = useState<ValidationResult>({ valid: false, errors: [], warnings: [] })
  const [activeSection, setActiveSection] = useState<string>('basic')

  // Auto-generate ID from name
  useEffect(() => {
    if (classData.name && !initialClass?.id) {
      const generatedId = classData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
      setClassData(prev => ({ ...prev, id: generatedId }))
    }
  }, [classData.name, initialClass])

  // Validate on changes
  useEffect(() => {
    if (classData.type === 'class') {
      const result = validateClass(classData as HomebrewClass)
      setValidation(result)
    }
  }, [classData])

  const abilityScores: AbilityScore[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
  const hitDieOptions = [6, 8, 10, 12]
  
  const skillOptions = [
    'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception',
    'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine',
    'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion',
    'Sleight of Hand', 'Stealth', 'Survival'
  ]

  const handleSave = () => {
    if (validation.valid && classData.type === 'class') {
      onSave(classData as HomebrewClass)
    }
  }

  const handleAbilityToggle = (ability: AbilityScore, field: 'primaryAbility' | 'savingThrowProficiencies') => {
    setClassData(prev => {
      const current = prev[field] as AbilityScore[] || []
      const isSelected = current.includes(ability)
      
      let updated: AbilityScore[]
      if (isSelected) {
        updated = current.filter(a => a !== ability)
      } else {
        updated = [...current, ability]
      }
      
      // Limit saving throws to exactly 2
      if (field === 'savingThrowProficiencies' && updated.length > 2) {
        updated = updated.slice(-2)
      }
      
      return { ...prev, [field]: updated }
    })
  }

  const handleSkillToggle = (skill: string) => {
    setClassData(prev => {
      const current = prev.skillProficiencies?.choices || []
      const isSelected = current.includes(skill)
      
      const updated = isSelected 
        ? current.filter(s => s !== skill)
        : [...current, skill]
      
      return {
        ...prev,
        skillProficiencies: {
          ...prev.skillProficiencies,
          count: prev.skillProficiencies?.count || 2,
          choices: updated
        }
      }
    })
  }

  const addTag = (tag: string) => {
    if (tag.trim() && !classData.tags?.includes(tag.trim())) {
      setClassData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag.trim()]
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setClassData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }))
  }

  const sections = [
    { id: 'basic', name: 'Basic Info' },
    { id: 'abilities', name: 'Abilities' },
    { id: 'proficiencies', name: 'Proficiencies' },
    { id: 'features', name: 'Class Features' },
    { id: 'subclass', name: 'Subclass Settings' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Panel>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-panel mb-2">
              {initialClass ? 'Edit Class' : 'Create New Class'}
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {validation.valid ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">Valid</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600">
                      {validation.errors.length} error{validation.errors.length !== 1 ? 's' : ''}
                    </span>
                  </>
                )}
              </div>
              {validation.warnings.length > 0 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-600">
                    {validation.warnings.length} warning{validation.warnings.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="outline" className="gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!validation.valid}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save Class
            </Button>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-12 gap-6">
        {/* Section Navigation */}
        <div className="col-span-3">
          <Panel className="sticky top-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-panel mb-4">Sections</h3>
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    activeSection === section.id 
                      ? 'bg-accent/10 text-accent font-medium' 
                      : 'text-muted hover:text-foreground hover:bg-panel/5'
                  }`}
                >
                  {section.name}
                </button>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            {/* Validation Summary */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Validation</h4>
              {validation.errors.map((error, idx) => (
                <div key={idx} className="text-xs text-red-600 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{error.message}</span>
                </div>
              ))}
              {validation.warnings.map((warning, idx) => (
                <div key={idx} className="text-xs text-yellow-600 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{warning.message}</span>
                </div>
              ))}
              {validation.valid && validation.warnings.length === 0 && (
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>All validations passed</span>
                </div>
              )}
            </div>
          </Panel>
        </div>

        {/* Main Content */}
        <div className="col-span-9">
          <Panel>
            {activeSection === 'basic' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-panel">Basic Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="class-name">Class Name</Label>
                    <Input
                      id="class-name"
                      value={classData.name || ''}
                      onChange={(e) => setClassData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter class name..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="class-id">Class ID</Label>
                    <Input
                      id="class-id"
                      value={classData.id || ''}
                      onChange={(e) => setClassData(prev => ({ ...prev, id: e.target.value }))}
                      placeholder="unique_class_id"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={classData.description || ''}
                    onChange={(e) => setClassData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the class, its role, and flavor..."
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={classData.author || ''}
                      onChange={(e) => setClassData(prev => ({ ...prev, author: e.target.value }))}
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={classData.version || ''}
                      onChange={(e) => setClassData(prev => ({ ...prev, version: e.target.value }))}
                      placeholder="1.0.0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={classData.status} 
                      onValueChange={(value) => setClassData(prev => ({ ...prev, status: value as any }))}
                    >
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
                
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {classData.tags?.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button onClick={() => removeTag(tag)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add tag and press Enter..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTag((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = ''
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {activeSection === 'abilities' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-panel">Abilities & Core Stats</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Hit Die</Label>
                    <Select 
                      value={classData.hitDie?.toString()} 
                      onValueChange={(value) => setClassData(prev => ({ ...prev, hitDie: parseInt(value) }))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {hitDieOptions.map(die => (
                          <SelectItem key={die} value={die.toString()}>d{die}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Primary Abilities</Label>
                    <p className="text-sm text-muted mb-2">
                      Select the main ability scores for this class (typically 1-2)
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {abilityScores.map(ability => (
                        <button
                          key={ability}
                          onClick={() => handleAbilityToggle(ability, 'primaryAbility')}
                          className={`px-3 py-2 rounded border transition-colors ${
                            classData.primaryAbility?.includes(ability)
                              ? 'bg-accent text-white border-accent'
                              : 'border-border hover:border-accent'
                          }`}
                        >
                          {ability}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Saving Throw Proficiencies</Label>
                    <p className="text-sm text-muted mb-2">
                      Select exactly 2 saving throw proficiencies
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {abilityScores.map(ability => (
                        <button
                          key={ability}
                          onClick={() => handleAbilityToggle(ability, 'savingThrowProficiencies')}
                          className={`px-3 py-2 rounded border transition-colors ${
                            classData.savingThrowProficiencies?.includes(ability)
                              ? 'bg-accent text-white border-accent'
                              : 'border-border hover:border-accent'
                          }`}
                        >
                          {ability}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'proficiencies' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-panel">Proficiencies</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Skill Proficiencies</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="skill-count">Number of Skills</Label>
                        <Select
                          value={classData.skillProficiencies?.count?.toString()}
                          onValueChange={(value) => setClassData(prev => ({
                            ...prev,
                            skillProficiencies: {
                              ...prev.skillProficiencies,
                              count: parseInt(value),
                              choices: prev.skillProficiencies?.choices || []
                            }
                          }))}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map(num => (
                              <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Available Skills</Label>
                        <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto">
                          {skillOptions.map(skill => (
                            <label key={skill} className="flex items-center gap-2 text-sm">
                              <Checkbox
                                checked={classData.skillProficiencies?.choices?.includes(skill)}
                                onCheckedChange={() => handleSkillToggle(skill)}
                              />
                              {skill}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'features' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-panel">Class Features</h3>
                  <Button size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Feature
                  </Button>
                </div>
                
                <div className="text-center py-12 text-muted">
                  <p>Class feature editor will be implemented next.</p>
                  <p className="text-sm mt-2">This will include level-based features, mechanics, and choices.</p>
                </div>
              </div>
            )}

            {activeSection === 'subclass' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-panel">Subclass Configuration</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subclass Selection Levels</Label>
                    <p className="text-sm text-muted">
                      Levels at which players choose subclass options
                    </p>
                    <Input
                      value={classData.subclassLevels?.join(', ') || ''}
                      onChange={(e) => {
                        const levels = e.target.value.split(',').map(l => parseInt(l.trim())).filter(l => !isNaN(l))
                        setClassData(prev => ({ ...prev, subclassLevels: levels }))
                      }}
                      placeholder="3, 7, 15, 18"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Subclass Feature Levels</Label>
                    <p className="text-sm text-muted">
                      Levels at which subclasses gain features
                    </p>
                    <Input
                      value={classData.subclassFeatureLevels?.join(', ') || ''}
                      onChange={(e) => {
                        const levels = e.target.value.split(',').map(l => parseInt(l.trim())).filter(l => !isNaN(l))
                        setClassData(prev => ({ ...prev, subclassFeatureLevels: levels }))
                      }}
                      placeholder="3, 7, 15, 18"
                    />
                  </div>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}