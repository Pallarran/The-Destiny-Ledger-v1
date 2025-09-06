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
  Scroll,
  Shield,
  Sword,
  Zap,
  Crown,
  Lock
} from 'lucide-react'
import type { 
  HomebrewMagicItem,
  HomebrewItemProperty,
  ValidationResult
} from '../../types/homebrew'
import { validateMagicItem } from '../../engine/homebrewValidation'

interface ItemEditorProps {
  initialItem?: HomebrewMagicItem | null
  onSave: (item: HomebrewMagicItem) => void
  onCancel: () => void
}

// D&D 5e magic item types
const ITEM_TYPES = [
  { value: 'weapon', label: 'Weapon', icon: Sword },
  { value: 'armor', label: 'Armor', icon: Shield },
  { value: 'shield', label: 'Shield', icon: Shield },
  { value: 'wondrous_item', label: 'Wondrous Item', icon: Crown },
  { value: 'potion', label: 'Potion', icon: Scroll },
  { value: 'scroll', label: 'Scroll', icon: Scroll },
  { value: 'ring', label: 'Ring', icon: Crown },
  { value: 'rod', label: 'Rod', icon: Zap },
  { value: 'staff', label: 'Staff', icon: Zap },
  { value: 'wand', label: 'Wand', icon: Zap }
]

// D&D 5e magic item rarities
const ITEM_RARITIES = [
  { value: 'common', label: 'Common', color: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
  { value: 'uncommon', label: 'Uncommon', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  { value: 'rare', label: 'Rare', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  { value: 'very_rare', label: 'Very Rare', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  { value: 'legendary', label: 'Legendary', color: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  { value: 'artifact', label: 'Artifact', color: 'bg-red-500/10 text-red-600 border-red-500/20' }
]

// Property activation types
const ACTIVATION_TYPES = [
  { value: 'action', label: 'Action' },
  { value: 'bonus_action', label: 'Bonus Action' },
  { value: 'reaction', label: 'Reaction' }
]

// Property types
const PROPERTY_TYPES = [
  { value: 'constant', label: 'Constant', description: 'Always active effect' },
  { value: 'activated', label: 'Activated', description: 'Requires activation' },
  { value: 'charged', label: 'Charged', description: 'Uses charges' },
  { value: 'conditional', label: 'Conditional', description: 'Triggers under conditions' }
]

// Common attunement restrictions
const ATTUNEMENT_RESTRICTIONS = [
  'by a spellcaster',
  'by a cleric or paladin',
  'by a sorcerer, warlock, or wizard',
  'by a bard',
  'by a druid or ranger',
  'by a creature of good alignment',
  'by a creature of evil alignment',
  'by a creature of chaotic alignment',
  'by a creature of lawful alignment',
  'by a creature with proficiency in heavy armor',
  'by a creature with proficiency in martial weapons'
]

export function ItemEditor({ initialItem, onSave, onCancel }: ItemEditorProps) {
  const [itemData, setItemData] = useState<HomebrewMagicItem>(() => {
    if (initialItem) return initialItem

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
      type: 'magic_item',
      itemType: 'wondrous_item',
      rarity: 'uncommon',
      attunement: {
        required: false
      },
      properties: []
    }
  })

  const [activeSection, setActiveSection] = useState('basic')
  const [validation, setValidation] = useState<ValidationResult>({ valid: false, errors: [], warnings: [] })
  const [previewMode, setPreviewMode] = useState(false)

  // Validate item data whenever it changes
  useEffect(() => {
    const result = validateMagicItem(itemData)
    setValidation(result)
  }, [itemData])

  const handleBasicChange = (field: keyof HomebrewMagicItem, value: any) => {
    setItemData(prev => ({ ...prev, [field]: value, updatedAt: new Date() }))
  }

  const handleAttunementChange = (field: keyof HomebrewMagicItem['attunement'], value: any) => {
    setItemData(prev => ({
      ...prev,
      attunement: { ...prev.attunement, [field]: value },
      updatedAt: new Date()
    }))
  }

  const handleChargesChange = (field: keyof NonNullable<HomebrewMagicItem['charges']>, value: any) => {
    if (!itemData.charges) {
      setItemData(prev => ({
        ...prev,
        charges: {
          maximum: 1,
          regain: { amount: 1, condition: 'dawn' }
        },
        updatedAt: new Date()
      }))
      return
    }

    if (field === 'regain') {
      setItemData(prev => ({
        ...prev,
        charges: { ...prev.charges!, regain: { ...prev.charges!.regain, ...value } },
        updatedAt: new Date()
      }))
    } else {
      setItemData(prev => ({
        ...prev,
        charges: { ...prev.charges!, [field]: value },
        updatedAt: new Date()
      }))
    }
  }

  const toggleCharges = (enabled: boolean) => {
    if (enabled) {
      setItemData(prev => ({
        ...prev,
        charges: {
          maximum: 3,
          regain: { amount: 1, condition: 'at dawn' },
          rechargeCondition: 'The item regains 1 charge daily at dawn.'
        },
        updatedAt: new Date()
      }))
    } else {
      setItemData(prev => ({
        ...prev,
        charges: undefined,
        updatedAt: new Date()
      }))
    }
  }

  const toggleCurse = (enabled: boolean) => {
    if (enabled) {
      setItemData(prev => ({
        ...prev,
        curse: {
          description: 'This item is cursed.',
          removalCondition: 'The curse can be removed by a remove curse spell.'
        },
        updatedAt: new Date()
      }))
    } else {
      setItemData(prev => ({
        ...prev,
        curse: undefined,
        updatedAt: new Date()
      }))
    }
  }

  const addProperty = () => {
    const newProperty: HomebrewItemProperty = {
      name: '',
      description: '',
      type: 'constant',
      mechanics: []
    }
    
    setItemData(prev => ({
      ...prev,
      properties: [...prev.properties, newProperty],
      updatedAt: new Date()
    }))
  }

  const removeProperty = (index: number) => {
    setItemData(prev => ({
      ...prev,
      properties: prev.properties.filter((_, i) => i !== index),
      updatedAt: new Date()
    }))
  }

  const handlePropertyChange = (index: number, field: keyof HomebrewItemProperty, value: any) => {
    setItemData(prev => {
      const properties = [...prev.properties]
      properties[index] = { ...properties[index], [field]: value }
      return { ...prev, properties, updatedAt: new Date() }
    })
  }

  const handlePropertyActivationChange = (index: number, field: keyof NonNullable<HomebrewItemProperty['activation']>, value: any) => {
    setItemData(prev => {
      const properties = [...prev.properties]
      if (!properties[index].activation) {
        properties[index] = {
          ...properties[index],
          activation: { type: 'action' }
        }
      }
      properties[index] = {
        ...properties[index],
        activation: { ...properties[index].activation!, [field]: value }
      }
      return { ...prev, properties, updatedAt: new Date() }
    })
  }

  const handleSave = () => {
    if (!itemData.name.trim()) {
      alert('Item name is required')
      return
    }

    const finalData = {
      ...itemData,
      id: itemData.id || itemData.name.toLowerCase().replace(/\s+/g, '-'),
      name: itemData.name.trim(),
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

  const getRarityInfo = (rarity: string) => {
    return ITEM_RARITIES.find(r => r.value === rarity) || ITEM_RARITIES[1]
  }

  const getItemTypeInfo = (type: string) => {
    return ITEM_TYPES.find(t => t.value === type) || ITEM_TYPES[3]
  }

  if (previewMode) {
    const rarityInfo = getRarityInfo(itemData.rarity)
    const typeInfo = getItemTypeInfo(itemData.itemType)
    const TypeIcon = typeInfo.icon

    return (
      <div className="space-y-6">
        <Panel>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TypeIcon className="w-6 h-6 text-accent" />
              <div>
                <h2 className="text-2xl font-bold text-panel">Item Preview</h2>
                <p className="text-muted">Preview of {itemData.name || 'Unnamed Item'}</p>
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
                <h3 className="text-xl font-bold">{itemData.name || 'Unnamed Item'}</h3>
                <Badge variant="secondary" className={rarityInfo.color}>
                  {rarityInfo.label}
                </Badge>
                <Badge variant="outline">{typeInfo.label}</Badge>
              </div>
              <p className="text-panel mb-4">{itemData.description}</p>

              <div className="space-y-2 text-sm">
                {itemData.attunement.required && (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-accent" />
                    <span>
                      <strong>Requires Attunement</strong>
                      {itemData.attunement.restrictions && itemData.attunement.restrictions.length > 0 && (
                        <span className="ml-1">({itemData.attunement.restrictions.join(', ')})</span>
                      )}
                    </span>
                  </div>
                )}

                {itemData.charges && (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span>
                      <strong>Charges:</strong> {itemData.charges.maximum} maximum
                      {typeof itemData.charges.regain.amount === 'number' 
                        ? `, regains ${itemData.charges.regain.amount}`
                        : `, regains all charges`} {itemData.charges.regain.condition}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {itemData.properties.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-panel mb-4">Properties</h4>
                <div className="space-y-4">
                  {itemData.properties.map((property, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{property.name}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {PROPERTY_TYPES.find(t => t.value === property.type)?.label || property.type}
                          </Badge>
                          {property.activation && (
                            <Badge variant="secondary" className="text-xs">
                              {ACTIVATION_TYPES.find(t => t.value === property.activation?.type)?.label || property.activation.type}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{property.description}</p>
                        {property.activation?.condition && (
                          <p className="text-xs text-muted mt-2">
                            <strong>Condition:</strong> {property.activation.condition}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {itemData.curse && (
              <div>
                <h4 className="text-lg font-semibold text-panel mb-3 text-red-600">Curse</h4>
                <Card className="border-red-200 bg-red-50/50">
                  <CardContent className="pt-4">
                    <p className="text-sm text-red-800 mb-2">{itemData.curse.description}</p>
                    {itemData.curse.removalCondition && (
                      <p className="text-xs text-red-600">
                        <strong>Removal:</strong> {itemData.curse.removalCondition}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </Panel>
      </div>
    )
  }

  const rarityInfo = getRarityInfo(itemData.rarity)
  const typeInfo = getItemTypeInfo(itemData.itemType)
  const TypeIcon = typeInfo.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <Panel>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TypeIcon className="w-6 h-6 text-accent" />
            <div>
              <h2 className="text-2xl font-bold text-panel">
                {initialItem ? 'Edit Magic Item' : 'Create New Magic Item'}
              </h2>
              <p className="text-muted">
                {itemData.name || 'Unnamed Item'}
                {itemData.rarity && ` • ${rarityInfo.label} ${typeInfo.label}`}
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
              {initialItem ? 'Update' : 'Create'} Item
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
              <Scroll className="w-4 h-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="attunement" className="gap-2">
              <Lock className="w-4 h-4" />
              Attunement
            </TabsTrigger>
            <TabsTrigger value="properties" className="gap-2">
              <Zap className="w-4 h-4" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <Crown className="w-4 h-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* Basic Information */}
          <TabsContent value="basic" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-medium text-panel">Item Name</label>
                  {getValidationIcon('name')}
                </div>
                <Input
                  value={itemData.name}
                  onChange={(e) => handleBasicChange('name', e.target.value)}
                  placeholder="e.g., Flametongue Sword"
                  className={getFieldErrors('name').length > 0 ? 'border-red-500' : ''}
                />
                {getFieldErrors('name').map((error, i) => (
                  <p key={i} className="text-sm text-red-600 mt-1">{error.message}</p>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-panel">Type</label>
                    {getValidationIcon('itemType')}
                  </div>
                  <Select
                    value={itemData.itemType}
                    onValueChange={(value) => handleBasicChange('itemType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEM_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getFieldErrors('itemType').map((error, i) => (
                    <p key={i} className="text-sm text-red-600 mt-1">{error.message}</p>
                  ))}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-panel">Rarity</label>
                    {getValidationIcon('rarity')}
                  </div>
                  <Select
                    value={itemData.rarity}
                    onValueChange={(value) => handleBasicChange('rarity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEM_RARITIES.map(rarity => (
                        <SelectItem key={rarity.value} value={rarity.value}>
                          {rarity.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getFieldErrors('rarity').map((error, i) => (
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
                value={itemData.description}
                onChange={(e) => handleBasicChange('description', e.target.value)}
                placeholder="Describe the item's appearance, history, and general function..."
                rows={4}
                className={getFieldErrors('description').length > 0 ? 'border-red-500' : ''}
              />
              {getFieldErrors('description').map((error, i) => (
                <p key={i} className="text-sm text-red-600 mt-1">{error.message}</p>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-panel mb-2">Tags</label>
              <Input
                value={itemData.tags.join(', ')}
                onChange={(e) => handleBasicChange('tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                placeholder="weapon, fire, combat, utility (comma-separated)"
              />
            </div>
          </TabsContent>

          {/* Attunement */}
          <TabsContent value="attunement" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold text-panel mb-2">Attunement Settings</h3>
              <p className="text-sm text-muted mb-4">Configure whether this item requires attunement and any restrictions</p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Requires Attunement
                  </CardTitle>
                  <Checkbox
                    id="requires-attunement"
                    checked={itemData.attunement.required}
                    onCheckedChange={(checked) => handleAttunementChange('required', checked)}
                  />
                </div>
              </CardHeader>
              {itemData.attunement.required && (
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-panel mb-3">Attunement Restrictions (Optional)</label>
                    <div className="space-y-2">
                      {ATTUNEMENT_RESTRICTIONS.map((restriction, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Checkbox
                            id={`restriction-${index}`}
                            checked={itemData.attunement.restrictions?.includes(restriction) || false}
                            onCheckedChange={(checked) => {
                              const current = itemData.attunement.restrictions || []
                              if (checked) {
                                handleAttunementChange('restrictions', [...current, restriction])
                              } else {
                                handleAttunementChange('restrictions', current.filter(r => r !== restriction))
                              }
                            }}
                          />
                          <label htmlFor={`restriction-${index}`} className="text-sm">
                            {restriction}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-panel mb-2">Custom Restriction</label>
                    <Input
                      placeholder="e.g., by a creature with 13+ Strength"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const custom = e.currentTarget.value.trim()
                          const current = itemData.attunement.restrictions || []
                          if (!current.includes(custom)) {
                            handleAttunementChange('restrictions', [...current, custom])
                            e.currentTarget.value = ''
                          }
                        }
                      }}
                    />
                    <p className="text-xs text-muted mt-1">Press Enter to add</p>
                  </div>

                  {itemData.attunement.restrictions && itemData.attunement.restrictions.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-panel mb-2">Selected Restrictions</label>
                      <div className="flex flex-wrap gap-2">
                        {itemData.attunement.restrictions.map((restriction, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {restriction}
                            <button
                              onClick={() => {
                                const current = itemData.attunement.restrictions || []
                                handleAttunementChange('restrictions', current.filter(r => r !== restriction))
                              }}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Attunement Guidelines</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Common and Uncommon items typically don't require attunement</p>
                <p>• Rare, Very Rare, and Legendary items usually require attunement</p>
                <p>• Artifacts always require attunement</p>
                <p>• Items that provide ongoing benefits often require attunement</p>
                <p>• Simple consumables (potions, scrolls) don't require attunement</p>
              </div>
            </div>
          </TabsContent>

          {/* Properties */}
          <TabsContent value="properties" className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-panel">Item Properties</h3>
                <p className="text-sm text-muted">Define the magical effects and abilities this item provides</p>
              </div>
              <Button onClick={addProperty} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Property
              </Button>
            </div>

            {itemData.properties.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No properties defined yet.</p>
                <p className="text-sm">Click "Add Property" to define what this item does!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {itemData.properties.map((property, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Property {index + 1}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProperty(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-panel mb-2">Property Name</label>
                          <Input
                            value={property.name}
                            onChange={(e) => handlePropertyChange(index, 'name', e.target.value)}
                            placeholder="e.g., Flaming Blade"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-panel mb-2">Type</label>
                          <Select
                            value={property.type}
                            onValueChange={(value) => handlePropertyChange(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PROPERTY_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div>
                                    <div className="font-medium">{type.label}</div>
                                    <div className="text-xs text-muted">{type.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-panel mb-2">Description</label>
                        <Textarea
                          value={property.description}
                          onChange={(e) => handlePropertyChange(index, 'description', e.target.value)}
                          placeholder="Describe what this property does and how it works..."
                          rows={3}
                        />
                      </div>

                      {property.type === 'activated' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-panel mb-2">Activation</label>
                            <Select
                              value={property.activation?.type || 'action'}
                              onValueChange={(value) => handlePropertyActivationChange(index, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ACTIVATION_TYPES.map(type => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-panel mb-2">Condition (Optional)</label>
                            <Input
                              value={property.activation?.condition || ''}
                              onChange={(e) => handlePropertyActivationChange(index, 'condition', e.target.value)}
                              placeholder="e.g., when you hit with an attack"
                            />
                          </div>
                        </div>
                      )}

                      {property.type === 'conditional' && (
                        <div>
                          <label className="block text-sm font-medium text-panel mb-2">Trigger Condition</label>
                          <Input
                            value={property.activation?.condition || ''}
                            onChange={(e) => handlePropertyActivationChange(index, 'condition', e.target.value)}
                            placeholder="e.g., when you take damage, when you roll initiative"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Advanced */}
          <TabsContent value="advanced" className="space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold text-panel mb-2">Advanced Features</h3>
              <p className="text-sm text-muted mb-4">Configure charges, curses, and other advanced item features</p>
            </div>

            {/* Charges */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Charges
                  </CardTitle>
                  <Checkbox
                    id="has-charges"
                    checked={!!itemData.charges}
                    onCheckedChange={toggleCharges}
                  />
                </div>
              </CardHeader>
              {itemData.charges && (
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-panel mb-2">Maximum Charges</label>
                      <Input
                        type="number"
                        value={itemData.charges.maximum}
                        onChange={(e) => handleChargesChange('maximum', parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-panel mb-2">Charges Regained</label>
                      <Select
                        value={typeof itemData.charges.regain.amount === 'number' ? String(itemData.charges.regain.amount) : 'all'}
                        onValueChange={(value) => {
                          const amount = value === 'all' ? 'all' : parseInt(value)
                          handleChargesChange('regain', { amount })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="all">All</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-panel mb-2">Recharge Condition</label>
                    <Input
                      value={itemData.charges.regain.condition}
                      onChange={(e) => handleChargesChange('regain', { condition: e.target.value })}
                      placeholder="e.g., at dawn, when you finish a long rest"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-panel mb-2">Recharge Description</label>
                    <Textarea
                      value={itemData.charges.rechargeCondition || ''}
                      onChange={(e) => handleChargesChange('rechargeCondition', e.target.value)}
                      placeholder="Detailed description of how the item regains charges..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Curse */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    Cursed Item
                  </CardTitle>
                  <Checkbox
                    id="has-curse"
                    checked={!!itemData.curse}
                    onCheckedChange={toggleCurse}
                  />
                </div>
              </CardHeader>
              {itemData.curse && (
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-panel mb-2">Curse Description</label>
                    <Textarea
                      value={itemData.curse.description}
                      onChange={(e) => {
                        setItemData(prev => ({
                          ...prev,
                          curse: { ...prev.curse!, description: e.target.value },
                          updatedAt: new Date()
                        }))
                      }}
                      placeholder="Describe the curse's effects and how it manifests..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-panel mb-2">Curse Removal</label>
                    <Textarea
                      value={itemData.curse.removalCondition || ''}
                      onChange={(e) => {
                        setItemData(prev => ({
                          ...prev,
                          curse: { ...prev.curse!, removalCondition: e.target.value },
                          updatedAt: new Date()
                        }))
                      }}
                      placeholder="How can the curse be removed or broken..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-panel mb-2">Author</label>
                <Input
                  value={itemData.author}
                  onChange={(e) => handleBasicChange('author', e.target.value)}
                  placeholder="Your name or handle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-panel mb-2">Version</label>
                <Input
                  value={itemData.version}
                  onChange={(e) => handleBasicChange('version', e.target.value)}
                  placeholder="1.0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-panel mb-2">Source</label>
                <Input
                  value={itemData.source}
                  onChange={(e) => handleBasicChange('source', e.target.value)}
                  placeholder="Homebrew, Custom, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-panel mb-2">Status</label>
                <Select value={itemData.status} onValueChange={(value) => handleBasicChange('status', value)}>
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