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
import { Checkbox } from '../ui/checkbox'
import { 
  Save,
  X,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  Wand2,
  BookOpen,
  Zap,
  Star,
  Target
} from 'lucide-react'
import type { 
  HomebrewFeat, 
  HomebrewFeatBenefit, 
  HomebrewPrerequisite,
  ValidationResult
} from '../../types/homebrew'
import type { AbilityScore } from '../../rules/types'
import { validateFeat } from '../../engine/homebrewValidation'

interface FeatEditorProps {
  initialFeat?: HomebrewFeat | null
  onSave: (feat: HomebrewFeat) => void
  onCancel: () => void
}

// D&D 5e ability scores
const ABILITY_SCORES: AbilityScore[] = [
  'STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'
]

// Ability score display names
const ABILITY_NAMES = {
  'STR': 'Strength',
  'DEX': 'Dexterity', 
  'CON': 'Constitution',
  'INT': 'Intelligence',
  'WIS': 'Wisdom',
  'CHA': 'Charisma'
} as const

// Common feat prerequisites
const PREREQUISITE_TYPES = [
  { id: 'ability_score', name: 'Ability Score' },
  { id: 'level', name: 'Character Level' },
  { id: 'class', name: 'Class' },
  { id: 'race', name: 'Race' },
  { id: 'feat', name: 'Other Feat' },
  { id: 'skill', name: 'Skill Proficiency' },
  { id: 'spell', name: 'Spell Known' }
] as const

// Common D&D classes for prerequisites
const COMMON_CLASSES = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 
  'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 
  'Warlock', 'Wizard'
]

// Common skills
const COMMON_SKILLS = [
  'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics',
  'Deception', 'History', 'Insight', 'Intimidation',
  'Investigation', 'Medicine', 'Nature', 'Perception',
  'Performance', 'Persuasion', 'Religion', 'Sleight of Hand',
  'Stealth', 'Survival'
]

export function FeatEditor({ initialFeat, onSave, onCancel }: FeatEditorProps) {
  const [featData, setFeatData] = useState<HomebrewFeat>(() => {
    if (initialFeat) return initialFeat
    
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
      type: 'feat',
      prerequisites: [],
      abilityScoreIncrease: undefined,
      benefits: [],
      mechanics: []
    }
  })

  const [activeSection, setActiveSection] = useState('basic')
  const [validation, setValidation] = useState<ValidationResult>({ valid: false, errors: [], warnings: [] })
  const [previewMode, setPreviewMode] = useState(false)

  // Validate feat data whenever it changes
  useEffect(() => {
    const result = validateFeat(featData)
    setValidation(result)
  }, [featData])

  const handleBasicChange = (field: keyof HomebrewFeat, value: any) => {
    setFeatData(prev => ({ ...prev, [field]: value, updatedAt: new Date() }))
  }

  const handleAbilityScoreIncreaseToggle = (enabled: boolean) => {
    if (enabled) {
      setFeatData(prev => ({
        ...prev,
        abilityScoreIncrease: {
          count: 1,
          choices: [...ABILITY_SCORES],
          maximum: 20
        },
        updatedAt: new Date()
      }))
    } else {
      setFeatData(prev => ({
        ...prev,
        abilityScoreIncrease: undefined,
        updatedAt: new Date()
      }))
    }
  }

  const handleASIChange = (field: 'count' | 'maximum', value: number) => {
    if (!featData.abilityScoreIncrease) return
    
    setFeatData(prev => ({
      ...prev,
      abilityScoreIncrease: {
        ...prev.abilityScoreIncrease!,
        [field]: value
      },
      updatedAt: new Date()
    }))
  }

  const handleASIChoicesChange = (choices: AbilityScore[]) => {
    if (!featData.abilityScoreIncrease) return
    
    setFeatData(prev => ({
      ...prev,
      abilityScoreIncrease: {
        ...prev.abilityScoreIncrease!,
        choices
      },
      updatedAt: new Date()
    }))
  }

  const addPrerequisite = () => {
    const newPrerequisite: HomebrewPrerequisite = {
      type: 'ability_score',
      value: 'STR',
      minimum: 13
    }
    
    setFeatData(prev => ({
      ...prev,
      prerequisites: [...(prev.prerequisites || []), newPrerequisite],
      updatedAt: new Date()
    }))
  }

  const removePrerequisite = (index: number) => {
    setFeatData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites?.filter((_, i) => i !== index) || [],
      updatedAt: new Date()
    }))
  }

  const handlePrerequisiteChange = (index: number, field: keyof HomebrewPrerequisite, value: any) => {
    setFeatData(prev => {
      const prerequisites = [...(prev.prerequisites || [])]
      prerequisites[index] = { ...prerequisites[index], [field]: value }
      return { ...prev, prerequisites, updatedAt: new Date() }
    })
  }

  const addBenefit = () => {
    const newBenefit: HomebrewFeatBenefit = {
      description: '',
      mechanics: []
    }
    
    setFeatData(prev => ({
      ...prev,
      benefits: [...prev.benefits, newBenefit],
      updatedAt: new Date()
    }))
  }

  const removeBenefit = (index: number) => {
    setFeatData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
      updatedAt: new Date()
    }))
  }

  const handleBenefitChange = (index: number, field: keyof HomebrewFeatBenefit, value: any) => {
    setFeatData(prev => {
      const benefits = [...prev.benefits]
      benefits[index] = { ...benefits[index], [field]: value }
      return { ...prev, benefits, updatedAt: new Date() }
    })
  }

  const handleSave = () => {
    if (!featData.name.trim()) {
      alert('Feat name is required')
      return
    }

    const finalData = {
      ...featData,
      id: featData.id || featData.name.toLowerCase().replace(/\s+/g, '-'),
      name: featData.name.trim(),
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
              <Wand2 className="w-6 h-6 text-accent" />
              <div>
                <h2 className="text-2xl font-bold text-panel">Feat Preview</h2>
                <p className="text-muted">Preview of {featData.name || 'Unnamed Feat'}</p>
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
                <h3 className="text-xl font-bold">{featData.name || 'Unnamed Feat'}</h3>
                <Badge variant="secondary">Feat</Badge>
              </div>
              <p className="text-panel">{featData.description}</p>
            </div>

            {featData.prerequisites && featData.prerequisites.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-panel mb-3">Prerequisites</h4>
                <div className="space-y-2">
                  {featData.prerequisites.map((prereq, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-accent" />
                      <span className="text-sm">
                        {prereq.type === 'ability_score' && `${ABILITY_NAMES[prereq.value as AbilityScore] || prereq.value} ${prereq.minimum}+`}
                        {prereq.type === 'level' && `Character Level ${prereq.value}+`}
                        {prereq.type === 'class' && `${prereq.value} class`}
                        {prereq.type === 'race' && `${prereq.value} race`}
                        {prereq.type === 'feat' && `${prereq.value} feat`}
                        {prereq.type === 'skill' && `Proficiency in ${prereq.value}`}
                        {prereq.type === 'spell' && `Knowledge of ${prereq.value} spell`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {featData.abilityScoreIncrease && (
              <div>
                <h4 className="text-lg font-semibold text-panel mb-3">Ability Score Increase</h4>
                <p className="text-sm text-panel">
                  Increase {featData.abilityScoreIncrease.choices.length === 6 ? 'any ability score' : 
                  featData.abilityScoreIncrease.choices.map(s => ABILITY_NAMES[s] || s).join(', ')} by {featData.abilityScoreIncrease.count}, 
                  to a maximum of {featData.abilityScoreIncrease.maximum}.
                </p>
              </div>
            )}

            {featData.benefits.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-panel mb-4">Benefits</h4>
                <div className="space-y-3">
                  {featData.benefits.map((benefit, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <p className="text-sm">{benefit.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
            <Wand2 className="w-6 h-6 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-panel">
                {initialFeat ? 'Edit Feat' : 'Create New Feat'}
              </h2>
              <p className="text-muted">
                {featData.name || 'Unnamed Feat'}
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
              {initialFeat ? 'Update' : 'Create'} Feat
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
            <TabsTrigger value="prerequisites" className="gap-2">
              <Target className="w-4 h-4" />
              Prerequisites
            </TabsTrigger>
            <TabsTrigger value="benefits" className="gap-2">
              <Star className="w-4 h-4" />
              Benefits
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <Zap className="w-4 h-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-medium text-panel">Feat Name</label>
                  {getValidationIcon('name')}
                </div>
                <Input
                  value={featData.name}
                  onChange={(e) => handleBasicChange('name', e.target.value)}
                  placeholder="e.g., Elemental Adept"
                  className={getFieldErrors('name').length > 0 ? 'border-red-500' : ''}
                />
                {getFieldErrors('name').map((error, i) => (
                  <p key={i} className="text-sm text-red-600 mt-1">{error.message}</p>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-panel mb-2">Tags</label>
                <Input
                  value={featData.tags.join(', ')}
                  onChange={(e) => handleBasicChange('tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                  placeholder="combat, magic, utility (comma-separated)"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-panel">Description</label>
                {getValidationIcon('description')}
              </div>
              <Textarea
                value={featData.description}
                onChange={(e) => handleBasicChange('description', e.target.value)}
                placeholder="Describe what this feat does and how it enhances character abilities..."
                rows={4}
                className={getFieldErrors('description').length > 0 ? 'border-red-500' : ''}
              />
              {getFieldErrors('description').map((error, i) => (
                <p key={i} className="text-sm text-red-600 mt-1">{error.message}</p>
              ))}
            </div>

            {/* Ability Score Increase */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="asi-toggle"
                  checked={!!featData.abilityScoreIncrease}
                  onCheckedChange={handleAbilityScoreIncreaseToggle}
                />
                <label htmlFor="asi-toggle" className="text-sm font-medium text-panel">
                  Provides Ability Score Increase
                </label>
              </div>

              {featData.abilityScoreIncrease && (
                <div className="ml-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-panel mb-2">Increase Amount</label>
                      <Select
                        value={String(featData.abilityScoreIncrease.count)}
                        onValueChange={(value) => handleASIChange('count', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">+1</SelectItem>
                          <SelectItem value="2">+2</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-panel mb-2">Maximum Score</label>
                      <Input
                        type="number"
                        value={featData.abilityScoreIncrease.maximum}
                        onChange={(e) => handleASIChange('maximum', parseInt(e.target.value) || 20)}
                        min="10"
                        max="30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-panel mb-3">Ability Score Choices</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {ABILITY_SCORES.map((ability) => (
                        <div key={ability} className="flex items-center gap-2">
                          <Checkbox
                            id={`asi-${ability}`}
                            checked={featData.abilityScoreIncrease!.choices.includes(ability)}
                            onCheckedChange={(checked) => {
                              const current = featData.abilityScoreIncrease!.choices
                              if (checked) {
                                handleASIChoicesChange([...current, ability])
                              } else {
                                handleASIChoicesChange(current.filter(a => a !== ability))
                              }
                            }}
                          />
                          <label htmlFor={`asi-${ability}`} className="text-sm">
                            {ABILITY_NAMES[ability]}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Prerequisites */}
          <TabsContent value="prerequisites" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-panel">Prerequisites</h3>
                <p className="text-sm text-muted">Define requirements that characters must meet to take this feat</p>
              </div>
              <Button onClick={addPrerequisite} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Prerequisite
              </Button>
            </div>

            {featData.prerequisites && featData.prerequisites.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No prerequisites defined.</p>
                <p className="text-sm">This feat can be taken by any character!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {featData.prerequisites?.map((prereq, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-medium text-panel">Prerequisite {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePrerequisite(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-panel mb-2">Type</label>
                          <Select
                            value={prereq.type}
                            onValueChange={(value) => handlePrerequisiteChange(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PREREQUISITE_TYPES.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-panel mb-2">
                            {prereq.type === 'ability_score' ? 'Ability Score' :
                             prereq.type === 'level' ? 'Level' :
                             prereq.type === 'class' ? 'Class' :
                             prereq.type === 'race' ? 'Race' :
                             prereq.type === 'feat' ? 'Feat' :
                             prereq.type === 'skill' ? 'Skill' :
                             prereq.type === 'spell' ? 'Spell' : 'Value'}
                          </label>
                          {prereq.type === 'ability_score' ? (
                            <Select
                              value={String(prereq.value)}
                              onValueChange={(value) => handlePrerequisiteChange(index, 'value', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ABILITY_SCORES.map((ability) => (
                                  <SelectItem key={ability} value={ability}>
                                    {ABILITY_NAMES[ability]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : prereq.type === 'class' ? (
                            <Select
                              value={String(prereq.value)}
                              onValueChange={(value) => handlePrerequisiteChange(index, 'value', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select class..." />
                              </SelectTrigger>
                              <SelectContent>
                                {COMMON_CLASSES.map((cls) => (
                                  <SelectItem key={cls} value={cls}>
                                    {cls}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : prereq.type === 'skill' ? (
                            <Select
                              value={String(prereq.value)}
                              onValueChange={(value) => handlePrerequisiteChange(index, 'value', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select skill..." />
                              </SelectTrigger>
                              <SelectContent>
                                {COMMON_SKILLS.map((skill) => (
                                  <SelectItem key={skill} value={skill}>
                                    {skill}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={String(prereq.value)}
                              onChange={(e) => handlePrerequisiteChange(index, 'value', e.target.value)}
                              placeholder={
                                prereq.type === 'level' ? '1' :
                                prereq.type === 'race' ? 'Elf' :
                                prereq.type === 'feat' ? 'Magic Initiate' :
                                prereq.type === 'spell' ? 'Fireball' : 'Value'
                              }
                            />
                          )}
                        </div>
                      </div>

                      {(prereq.type === 'ability_score' || prereq.type === 'level') && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-panel mb-2">Minimum Value</label>
                          <Input
                            type="number"
                            value={prereq.minimum || ''}
                            onChange={(e) => handlePrerequisiteChange(index, 'minimum', parseInt(e.target.value) || undefined)}
                            placeholder={prereq.type === 'ability_score' ? '13' : '1'}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Benefits */}
          <TabsContent value="benefits" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-panel">Feat Benefits</h3>
                <p className="text-sm text-muted">Define the specific benefits this feat provides</p>
              </div>
              <Button onClick={addBenefit} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Benefit
              </Button>
            </div>

            {featData.benefits.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No benefits defined yet.</p>
                <p className="text-sm">Click "Add Benefit" to define what this feat does!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {featData.benefits.map((benefit, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Benefit {index + 1}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBenefit(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-panel mb-2">Description</label>
                        <Textarea
                          value={benefit.description}
                          onChange={(e) => handleBenefitChange(index, 'description', e.target.value)}
                          placeholder="Describe what this benefit does..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Advanced */}
          <TabsContent value="advanced" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold text-panel mb-2">Advanced Settings</h3>
              <p className="text-sm text-muted mb-4">Additional configuration options for your feat</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-panel mb-2">Author</label>
                <Input
                  value={featData.author}
                  onChange={(e) => handleBasicChange('author', e.target.value)}
                  placeholder="Your name or handle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-panel mb-2">Version</label>
                <Input
                  value={featData.version}
                  onChange={(e) => handleBasicChange('version', e.target.value)}
                  placeholder="1.0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-panel mb-2">Source</label>
                <Input
                  value={featData.source}
                  onChange={(e) => handleBasicChange('source', e.target.value)}
                  placeholder="Homebrew, Custom, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-panel mb-2">Status</label>
                <Select value={featData.status} onValueChange={(value) => handleBasicChange('status', value)}>
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