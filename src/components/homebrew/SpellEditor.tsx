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
  Eye,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Zap,
  Target,
  Clock,
  MapPin,
  Shield
} from 'lucide-react'
import type { 
  HomebrewSpell,
  HomebrewSpellDamage,
  HomebrewSpellHealing,
  ValidationResult
} from '../../types/homebrew'
import type { AbilityScore, DamageType } from '../../rules/types'
import { validateSpell } from '../../engine/homebrewValidation'

interface SpellEditorProps {
  initialSpell?: HomebrewSpell | null
  onSave: (spell: HomebrewSpell) => void
  onCancel: () => void
}

// D&D 5e spell schools
const SPELL_SCHOOLS = [
  'Abjuration', 'Conjuration', 'Divination', 'Enchantment',
  'Evocation', 'Illusion', 'Necromancy', 'Transmutation'
]

// D&D 5e classes
const SPELL_CLASSES = [
  'Artificer', 'Bard', 'Cleric', 'Druid', 'Paladin', 
  'Ranger', 'Sorcerer', 'Warlock', 'Wizard'
]

// Casting time units
const CASTING_TIME_UNITS = [
  { value: 'action', label: 'Action' },
  { value: 'bonus_action', label: 'Bonus Action' },
  { value: 'reaction', label: 'Reaction' },
  { value: 'minute', label: 'Minute(s)' },
  { value: 'hour', label: 'Hour(s)' }
]

// Range types
const RANGE_TYPES = [
  { value: 'self', label: 'Self' },
  { value: 'touch', label: 'Touch' },
  { value: 'ranged', label: 'Ranged' },
  { value: 'sight', label: 'Sight' },
  { value: 'unlimited', label: 'Unlimited' }
]

// Area of effect shapes
const AOE_SHAPES = [
  { value: 'sphere', label: 'Sphere' },
  { value: 'cube', label: 'Cube' },
  { value: 'cylinder', label: 'Cylinder' },
  { value: 'cone', label: 'Cone' },
  { value: 'line', label: 'Line' }
]

// Duration types
const DURATION_TYPES = [
  { value: 'instantaneous', label: 'Instantaneous' },
  { value: 'concentration', label: 'Concentration' },
  { value: 'timed', label: 'Timed' },
  { value: 'until_dispelled', label: 'Until Dispelled' },
  { value: 'permanent', label: 'Permanent' }
]

// Duration units
const DURATION_UNITS = [
  { value: 'round', label: 'Round(s)' },
  { value: 'minute', label: 'Minute(s)' },
  { value: 'hour', label: 'Hour(s)' },
  { value: 'day', label: 'Day(s)' }
]

// Ability scores for saves/attacks
const ABILITY_SCORES: AbilityScore[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
const ABILITY_NAMES = {
  'STR': 'Strength',
  'DEX': 'Dexterity',
  'CON': 'Constitution', 
  'INT': 'Intelligence',
  'WIS': 'Wisdom',
  'CHA': 'Charisma'
} as const

// Common damage types
const DAMAGE_TYPES: DamageType[] = [
  'acid', 'bludgeoning', 'cold', 'fire', 'force', 'lightning',
  'necrotic', 'piercing', 'poison', 'psychic', 'radiant', 
  'slashing', 'thunder'
]

// Saving throw results
const SAVE_RESULTS = [
  { value: 'half_damage', label: 'Half Damage' },
  { value: 'no_effect', label: 'No Effect' },
  { value: 'partial_effect', label: 'Partial Effect' }
]

export function SpellEditor({ initialSpell, onSave, onCancel }: SpellEditorProps) {
  const [spellData, setSpellData] = useState<HomebrewSpell>(() => {
    if (initialSpell) return initialSpell

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
      type: 'spell',
      level: 0,
      school: 'Evocation',
      castingTime: {
        amount: 1,
        unit: 'action'
      },
      range: {
        type: 'ranged',
        distance: 60,
        unit: 'feet'
      },
      components: {
        verbal: false,
        somatic: false,
        material: false
      },
      duration: {
        type: 'instantaneous'
      },
      classes: []
    }
  })

  const [activeSection, setActiveSection] = useState('basic')
  const [validation, setValidation] = useState<ValidationResult>({ valid: false, errors: [], warnings: [] })
  const [previewMode, setPreviewMode] = useState(false)

  // Validate spell data whenever it changes
  useEffect(() => {
    const result = validateSpell(spellData)
    setValidation(result)
  }, [spellData])

  const handleBasicChange = (field: keyof HomebrewSpell, value: any) => {
    setSpellData(prev => ({ ...prev, [field]: value, updatedAt: new Date() }))
  }

  const handleCastingTimeChange = (field: keyof HomebrewSpell['castingTime'], value: any) => {
    setSpellData(prev => ({
      ...prev,
      castingTime: { ...prev.castingTime, [field]: value },
      updatedAt: new Date()
    }))
  }

  const handleRangeChange = (field: keyof HomebrewSpell['range'], value: any) => {
    setSpellData(prev => ({
      ...prev,
      range: { ...prev.range, [field]: value },
      updatedAt: new Date()
    }))
  }

  const handleComponentsChange = (field: keyof HomebrewSpell['components'], value: any) => {
    setSpellData(prev => ({
      ...prev,
      components: { ...prev.components, [field]: value },
      updatedAt: new Date()
    }))
  }

  const handleDurationChange = (field: keyof HomebrewSpell['duration'], value: any) => {
    setSpellData(prev => ({
      ...prev,
      duration: { ...prev.duration, [field]: value },
      updatedAt: new Date()
    }))
  }

  const handleDamageChange = (field: keyof HomebrewSpellDamage, value: any) => {
    if (!spellData.damage) {
      setSpellData(prev => ({
        ...prev,
        damage: {
          dice: { count: 1, sides: 6 },
          type: 'fire'
        },
        updatedAt: new Date()
      }))
      return
    }

    if (field === 'dice') {
      setSpellData(prev => ({
        ...prev,
        damage: { ...prev.damage!, dice: { ...prev.damage!.dice, ...value } },
        updatedAt: new Date()
      }))
    } else {
      setSpellData(prev => ({
        ...prev,
        damage: { ...prev.damage!, [field]: value },
        updatedAt: new Date()
      }))
    }
  }

  const handleHealingChange = (field: keyof HomebrewSpellHealing, value: any) => {
    if (!spellData.healing) {
      setSpellData(prev => ({
        ...prev,
        healing: {
          dice: { count: 1, sides: 8 }
        },
        updatedAt: new Date()
      }))
      return
    }

    if (field === 'dice') {
      setSpellData(prev => ({
        ...prev,
        healing: { ...prev.healing!, dice: { ...prev.healing!.dice, ...value } },
        updatedAt: new Date()
      }))
    } else {
      setSpellData(prev => ({
        ...prev,
        healing: { ...prev.healing!, [field]: value },
        updatedAt: new Date()
      }))
    }
  }

  const toggleDamage = (enabled: boolean) => {
    if (enabled) {
      setSpellData(prev => ({
        ...prev,
        damage: {
          dice: { count: 1, sides: 6 },
          type: 'fire'
        },
        updatedAt: new Date()
      }))
    } else {
      setSpellData(prev => ({
        ...prev,
        damage: undefined,
        updatedAt: new Date()
      }))
    }
  }

  const toggleHealing = (enabled: boolean) => {
    if (enabled) {
      setSpellData(prev => ({
        ...prev,
        healing: {
          dice: { count: 1, sides: 8 }
        },
        updatedAt: new Date()
      }))
    } else {
      setSpellData(prev => ({
        ...prev,
        healing: undefined,
        updatedAt: new Date()
      }))
    }
  }

  const toggleSavingThrow = (enabled: boolean) => {
    if (enabled) {
      setSpellData(prev => ({
        ...prev,
        savingThrow: {
          ability: 'DEX',
          success: 'half_damage'
        },
        updatedAt: new Date()
      }))
    } else {
      setSpellData(prev => ({
        ...prev,
        savingThrow: undefined,
        updatedAt: new Date()
      }))
    }
  }

  const toggleAttackRoll = (enabled: boolean) => {
    if (enabled) {
      setSpellData(prev => ({
        ...prev,
        attackRoll: {
          type: 'ranged',
          abilityModifier: 'INT'
        },
        updatedAt: new Date()
      }))
    } else {
      setSpellData(prev => ({
        ...prev,
        attackRoll: undefined,
        updatedAt: new Date()
      }))
    }
  }

  const handleSave = () => {
    if (!spellData.name.trim()) {
      alert('Spell name is required')
      return
    }

    if (!spellData.classes || spellData.classes.length === 0) {
      alert('At least one class must be able to cast this spell')
      return
    }

    const finalData = {
      ...spellData,
      id: spellData.id || spellData.name.toLowerCase().replace(/\s+/g, '-'),
      name: spellData.name.trim(),
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

  const formatSpellComponents = () => {
    const components = []
    if (spellData.components.verbal) components.push('V')
    if (spellData.components.somatic) components.push('S')
    if (spellData.components.material) {
      if (spellData.components.materialComponent) {
        components.push(`M (${spellData.components.materialComponent})`)
      } else {
        components.push('M')
      }
    }
    return components.join(', ') || 'None'
  }

  const formatSpellRange = () => {
    if (spellData.range.type === 'self') return 'Self'
    if (spellData.range.type === 'touch') return 'Touch'
    if (spellData.range.type === 'sight') return 'Sight'
    if (spellData.range.type === 'unlimited') return 'Unlimited'
    if (spellData.range.type === 'ranged' && spellData.range.distance) {
      let range = `${spellData.range.distance} ${spellData.range.unit || 'feet'}`
      if (spellData.range.shape && spellData.range.size) {
        range += ` (${spellData.range.size}-foot ${spellData.range.shape})`
      }
      return range
    }
    return 'Ranged'
  }

  const formatSpellDuration = () => {
    if (spellData.duration.type === 'instantaneous') return 'Instantaneous'
    if (spellData.duration.type === 'until_dispelled') return 'Until dispelled'
    if (spellData.duration.type === 'permanent') return 'Permanent'
    if (spellData.duration.type === 'concentration' || spellData.duration.type === 'timed') {
      let duration = spellData.duration.type === 'concentration' ? 'Concentration, up to ' : ''
      if (spellData.duration.amount && spellData.duration.unit) {
        duration += `${spellData.duration.amount} ${spellData.duration.unit}`
        if (spellData.duration.amount > 1) duration += 's'
      }
      return duration || 'Special'
    }
    return 'Special'
  }

  if (previewMode) {
    return (
      <div className="space-y-6">
        <Panel>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-accent" />
              <div>
                <h2 className="text-2xl font-bold text-panel">Spell Preview</h2>
                <p className="text-muted">Preview of {spellData.name || 'Unnamed Spell'}</p>
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
                <h3 className="text-xl font-bold">{spellData.name || 'Unnamed Spell'}</h3>
                <Badge variant="secondary">
                  {spellData.level === 0 ? 'Cantrip' : `Level ${spellData.level}`}
                </Badge>
                <Badge variant="outline">{spellData.school}</Badge>
              </div>
              <p className="text-panel mb-4">{spellData.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Casting Time:</strong> {spellData.castingTime.amount} {spellData.castingTime.unit.replace('_', ' ')}</div>
                <div><strong>Range:</strong> {formatSpellRange()}</div>
                <div><strong>Components:</strong> {formatSpellComponents()}</div>
                <div><strong>Duration:</strong> {formatSpellDuration()}</div>
                <div className="md:col-span-2">
                  <strong>Classes:</strong> {spellData.classes.join(', ')}
                </div>
              </div>
            </div>

            {(spellData.damage || spellData.healing || spellData.savingThrow || spellData.attackRoll) && (
              <div>
                <h4 className="text-lg font-semibold text-panel mb-3">Spell Effects</h4>
                <div className="space-y-3">
                  {spellData.damage && (
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-red-500" />
                      <span className="text-sm">
                        <strong>Damage:</strong> {spellData.damage.dice.count}d{spellData.damage.dice.sides} {spellData.damage.type}
                        {spellData.damage.modifier && ` + modifier`}
                      </span>
                    </div>
                  )}
                  
                  {spellData.healing && (
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-sm">
                        <strong>Healing:</strong> {spellData.healing.dice.count}d{spellData.healing.dice.sides}
                        {spellData.healing.modifier && ` + modifier`}
                      </span>
                    </div>
                  )}
                  
                  {spellData.savingThrow && (
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">
                        <strong>Save:</strong> {ABILITY_NAMES[spellData.savingThrow.ability]} saving throw, {spellData.savingThrow.success.replace('_', ' ')} on success
                      </span>
                    </div>
                  )}
                  
                  {spellData.attackRoll && (
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">
                        <strong>Attack:</strong> {spellData.attackRoll.type} spell attack using {ABILITY_NAMES[spellData.attackRoll.abilityModifier]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {spellData.higherLevels && (
              <div>
                <h4 className="text-lg font-semibold text-panel mb-2">At Higher Levels</h4>
                <p className="text-sm text-panel">{spellData.higherLevels}</p>
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
            <BookOpen className="w-6 h-6 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-panel">
                {initialSpell ? 'Edit Spell' : 'Create New Spell'}
              </h2>
              <p className="text-muted">
                {spellData.name || 'Unnamed Spell'}
                {spellData.level !== undefined && ` • ${spellData.level === 0 ? 'Cantrip' : `Level ${spellData.level}`}`}
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
              {initialSpell ? 'Update' : 'Create'} Spell
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
            <TabsTrigger value="mechanics" className="gap-2">
              <Clock className="w-4 h-4" />
              Mechanics
            </TabsTrigger>
            <TabsTrigger value="effects" className="gap-2">
              <Zap className="w-4 h-4" />
              Effects
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <Target className="w-4 h-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-medium text-panel">Spell Name</label>
                  {getValidationIcon('name')}
                </div>
                <Input
                  value={spellData.name}
                  onChange={(e) => handleBasicChange('name', e.target.value)}
                  placeholder="e.g., Fireball"
                  className={getFieldErrors('name').length > 0 ? 'border-red-500' : ''}
                />
                {getFieldErrors('name').map((error, i) => (
                  <p key={i} className="text-sm text-red-600 mt-1">{error.message}</p>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-panel">Level</label>
                    {getValidationIcon('level')}
                  </div>
                  <Select
                    value={String(spellData.level)}
                    onValueChange={(value) => handleBasicChange('level', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Cantrip</SelectItem>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                        <SelectItem key={level} value={String(level)}>
                          Level {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getFieldErrors('level').map((error, i) => (
                    <p key={i} className="text-sm text-red-600 mt-1">{error.message}</p>
                  ))}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-panel">School</label>
                    {getValidationIcon('school')}
                  </div>
                  <Select
                    value={spellData.school}
                    onValueChange={(value) => handleBasicChange('school', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SPELL_SCHOOLS.map(school => (
                        <SelectItem key={school} value={school}>
                          {school}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getFieldErrors('school').map((error, i) => (
                    <p key={i} className="text-sm text-red-600 mt-1">{error.message}</p>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-panel">Description</label>
                {getValidationIcon('description')}
              </div>
              <Textarea
                value={spellData.description}
                onChange={(e) => handleBasicChange('description', e.target.value)}
                placeholder="Describe what the spell does, its visual effects, and how it works..."
                rows={4}
                className={getFieldErrors('description').length > 0 ? 'border-red-500' : ''}
              />
              {getFieldErrors('description').map((error, i) => (
                <p key={i} className="text-sm text-red-600 mt-1">{error.message}</p>
              ))}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-panel">Classes</label>
                {getValidationIcon('classes')}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SPELL_CLASSES.map((className) => (
                  <div key={className} className="flex items-center gap-2">
                    <Checkbox
                      id={`class-${className}`}
                      checked={spellData.classes.includes(className)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleBasicChange('classes', [...spellData.classes, className])
                        } else {
                          handleBasicChange('classes', spellData.classes.filter(c => c !== className))
                        }
                      }}
                    />
                    <label htmlFor={`class-${className}`} className="text-sm">
                      {className}
                    </label>
                  </div>
                ))}
              </div>
              {getFieldErrors('classes').map((error, i) => (
                <p key={i} className="text-sm text-red-600 mt-1">{error.message}</p>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-panel mb-2">Tags</label>
              <Input
                value={spellData.tags.join(', ')}
                onChange={(e) => handleBasicChange('tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                placeholder="damage, fire, area, combat (comma-separated)"
              />
            </div>
          </TabsContent>

          {/* Mechanics */}
          <TabsContent value="mechanics" className="space-y-6 mt-6">
            {/* Casting Time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Casting Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-panel mb-2">Amount</label>
                    <Input
                      type="number"
                      value={spellData.castingTime.amount}
                      onChange={(e) => handleCastingTimeChange('amount', parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-panel mb-2">Unit</label>
                    <Select
                      value={spellData.castingTime.unit}
                      onValueChange={(value) => handleCastingTimeChange('unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CASTING_TIME_UNITS.map(unit => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {spellData.castingTime.unit === 'reaction' && (
                  <div>
                    <label className="block text-sm font-medium text-panel mb-2">Reaction Trigger</label>
                    <Input
                      value={spellData.castingTime.condition || ''}
                      onChange={(e) => handleCastingTimeChange('condition', e.target.value)}
                      placeholder="e.g., which you take when you see a creature within range casting a spell"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Range */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Range
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-panel mb-2">Type</label>
                  <Select
                    value={spellData.range.type}
                    onValueChange={(value) => handleRangeChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RANGE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {spellData.range.type === 'ranged' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-panel mb-2">Distance</label>
                      <Input
                        type="number"
                        value={spellData.range.distance || ''}
                        onChange={(e) => handleRangeChange('distance', parseInt(e.target.value) || undefined)}
                        placeholder="60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-panel mb-2">Unit</label>
                      <Select
                        value={spellData.range.unit || 'feet'}
                        onValueChange={(value) => handleRangeChange('unit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feet">Feet</SelectItem>
                          <SelectItem value="miles">Miles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {spellData.range.type === 'ranged' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-panel mb-2">Area Shape (Optional)</label>
                      <Select
                        value={spellData.range.shape || ''}
                        onValueChange={(value) => handleRangeChange('shape', value || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {AOE_SHAPES.map(shape => (
                            <SelectItem key={shape.value} value={shape.value}>
                              {shape.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {spellData.range.shape && (
                      <div>
                        <label className="block text-sm font-medium text-panel mb-2">Area Size</label>
                        <Input
                          type="number"
                          value={spellData.range.size || ''}
                          onChange={(e) => handleRangeChange('size', parseInt(e.target.value) || undefined)}
                          placeholder="20"
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Components */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="verbal"
                      checked={spellData.components.verbal}
                      onCheckedChange={(checked) => handleComponentsChange('verbal', checked)}
                    />
                    <label htmlFor="verbal" className="text-sm">Verbal (V)</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="somatic"
                      checked={spellData.components.somatic}
                      onCheckedChange={(checked) => handleComponentsChange('somatic', checked)}
                    />
                    <label htmlFor="somatic" className="text-sm">Somatic (S)</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="material"
                      checked={spellData.components.material}
                      onCheckedChange={(checked) => handleComponentsChange('material', checked)}
                    />
                    <label htmlFor="material" className="text-sm">Material (M)</label>
                  </div>
                </div>

                {spellData.components.material && (
                  <div>
                    <label className="block text-sm font-medium text-panel mb-2">Material Component</label>
                    <Input
                      value={spellData.components.materialComponent || ''}
                      onChange={(e) => handleComponentsChange('materialComponent', e.target.value)}
                      placeholder="e.g., a pinch of sulfur and bat guano"
                    />
                  </div>
                )}

                {spellData.components.material && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-panel mb-2">Component Cost (gp)</label>
                      <Input
                        type="number"
                        value={spellData.components.costlyComponent?.cost || ''}
                        onChange={(e) => {
                          const cost = parseInt(e.target.value) || undefined
                          if (cost) {
                            handleComponentsChange('costlyComponent', { 
                              cost, 
                              consumed: spellData.components.costlyComponent?.consumed || false 
                            })
                          } else {
                            handleComponentsChange('costlyComponent', undefined)
                          }
                        }}
                        placeholder="0"
                      />
                    </div>
                    
                    {spellData.components.costlyComponent && (
                      <div className="flex items-center gap-2 mt-6">
                        <Checkbox
                          id="consumed"
                          checked={spellData.components.costlyComponent.consumed}
                          onCheckedChange={(checked) => {
                            handleComponentsChange('costlyComponent', {
                              ...spellData.components.costlyComponent!,
                              consumed: checked
                            })
                          }}
                        />
                        <label htmlFor="consumed" className="text-sm">Component is consumed</label>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Duration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Duration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-panel mb-2">Type</label>
                  <Select
                    value={spellData.duration.type}
                    onValueChange={(value) => handleDurationChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(spellData.duration.type === 'concentration' || spellData.duration.type === 'timed') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-panel mb-2">Amount</label>
                      <Input
                        type="number"
                        value={spellData.duration.amount || ''}
                        onChange={(e) => handleDurationChange('amount', parseInt(e.target.value) || undefined)}
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-panel mb-2">Unit</label>
                      <Select
                        value={spellData.duration.unit || 'minute'}
                        onValueChange={(value) => handleDurationChange('unit', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATION_UNITS.map(unit => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {spellData.duration.type === 'timed' && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="concentration"
                      checked={spellData.duration.concentration || false}
                      onCheckedChange={(checked) => handleDurationChange('concentration', checked)}
                    />
                    <label htmlFor="concentration" className="text-sm">Requires Concentration</label>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Effects */}
          <TabsContent value="effects" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold text-panel mb-4">Spell Effects</h3>
              <p className="text-sm text-muted mb-6">Define what mechanical effects this spell has</p>
            </div>

            {/* Damage */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Damage
                  </CardTitle>
                  <Checkbox
                    id="has-damage"
                    checked={!!spellData.damage}
                    onCheckedChange={toggleDamage}
                  />
                </div>
              </CardHeader>
              {spellData.damage && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-panel mb-2">Dice Count</label>
                      <Input
                        type="number"
                        value={spellData.damage.dice.count}
                        onChange={(e) => handleDamageChange('dice', { count: parseInt(e.target.value) || 1 })}
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-panel mb-2">Dice Size</label>
                      <Select
                        value={String(spellData.damage.dice.sides)}
                        onValueChange={(value) => handleDamageChange('dice', { sides: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4">d4</SelectItem>
                          <SelectItem value="6">d6</SelectItem>
                          <SelectItem value="8">d8</SelectItem>
                          <SelectItem value="10">d10</SelectItem>
                          <SelectItem value="12">d12</SelectItem>
                          <SelectItem value="20">d20</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-panel mb-2">Damage Type</label>
                      <Select
                        value={spellData.damage.type}
                        onValueChange={(value) => handleDamageChange('type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAMAGE_TYPES.map(type => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Healing */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Healing
                  </CardTitle>
                  <Checkbox
                    id="has-healing"
                    checked={!!spellData.healing}
                    onCheckedChange={toggleHealing}
                  />
                </div>
              </CardHeader>
              {spellData.healing && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-panel mb-2">Dice Count</label>
                      <Input
                        type="number"
                        value={spellData.healing.dice.count}
                        onChange={(e) => handleHealingChange('dice', { count: parseInt(e.target.value) || 1 })}
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-panel mb-2">Dice Size</label>
                      <Select
                        value={String(spellData.healing.dice.sides)}
                        onValueChange={(value) => handleHealingChange('dice', { sides: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4">d4</SelectItem>
                          <SelectItem value="6">d6</SelectItem>
                          <SelectItem value="8">d8</SelectItem>
                          <SelectItem value="10">d10</SelectItem>
                          <SelectItem value="12">d12</SelectItem>
                          <SelectItem value="20">d20</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Saving Throw */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Saving Throw
                  </CardTitle>
                  <Checkbox
                    id="has-save"
                    checked={!!spellData.savingThrow}
                    onCheckedChange={toggleSavingThrow}
                  />
                </div>
              </CardHeader>
              {spellData.savingThrow && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-panel mb-2">Ability</label>
                      <Select
                        value={spellData.savingThrow.ability}
                        onValueChange={(value) => {
                          setSpellData(prev => ({
                            ...prev,
                            savingThrow: { ...prev.savingThrow!, ability: value as AbilityScore },
                            updatedAt: new Date()
                          }))
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ABILITY_SCORES.map(ability => (
                            <SelectItem key={ability} value={ability}>
                              {ABILITY_NAMES[ability]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-panel mb-2">Success Result</label>
                      <Select
                        value={spellData.savingThrow.success}
                        onValueChange={(value) => {
                          setSpellData(prev => ({
                            ...prev,
                            savingThrow: { ...prev.savingThrow!, success: value as 'half_damage' | 'no_effect' | 'partial_effect' },
                            updatedAt: new Date()
                          }))
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SAVE_RESULTS.map(result => (
                            <SelectItem key={result.value} value={result.value}>
                              {result.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Attack Roll */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Attack Roll
                  </CardTitle>
                  <Checkbox
                    id="has-attack"
                    checked={!!spellData.attackRoll}
                    onCheckedChange={toggleAttackRoll}
                  />
                </div>
              </CardHeader>
              {spellData.attackRoll && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-panel mb-2">Attack Type</label>
                      <Select
                        value={spellData.attackRoll.type}
                        onValueChange={(value) => {
                          setSpellData(prev => ({
                            ...prev,
                            attackRoll: { ...prev.attackRoll!, type: value as 'melee' | 'ranged' },
                            updatedAt: new Date()
                          }))
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="melee">Melee</SelectItem>
                          <SelectItem value="ranged">Ranged</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-panel mb-2">Ability Modifier</label>
                      <Select
                        value={spellData.attackRoll.abilityModifier}
                        onValueChange={(value) => {
                          setSpellData(prev => ({
                            ...prev,
                            attackRoll: { ...prev.attackRoll!, abilityModifier: value as AbilityScore },
                            updatedAt: new Date()
                          }))
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ABILITY_SCORES.map(ability => (
                            <SelectItem key={ability} value={ability}>
                              {ABILITY_NAMES[ability]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>

          {/* Advanced */}
          <TabsContent value="advanced" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold text-panel mb-2">Advanced Settings</h3>
              <p className="text-sm text-muted mb-4">Additional configuration options for your spell</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-panel mb-2">At Higher Levels</label>
              <Textarea
                value={spellData.higherLevels || ''}
                onChange={(e) => handleBasicChange('higherLevels', e.target.value)}
                placeholder="Describe how the spell changes when cast using higher-level spell slots..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-panel mb-2">Author</label>
                <Input
                  value={spellData.author}
                  onChange={(e) => handleBasicChange('author', e.target.value)}
                  placeholder="Your name or handle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-panel mb-2">Version</label>
                <Input
                  value={spellData.version}
                  onChange={(e) => handleBasicChange('version', e.target.value)}
                  placeholder="1.0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-panel mb-2">Source</label>
                <Input
                  value={spellData.source}
                  onChange={(e) => handleBasicChange('source', e.target.value)}
                  placeholder="Homebrew, Custom, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-panel mb-2">Status</label>
                <Select value={spellData.status} onValueChange={(value) => handleBasicChange('status', value)}>
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