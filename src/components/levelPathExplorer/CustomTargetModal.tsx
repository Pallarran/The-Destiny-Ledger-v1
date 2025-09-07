import { useState } from 'react'
import { Button } from '../ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { 
  Target, 
  Plus,
  X,
  User,
  Settings
} from 'lucide-react'
import { classes } from '../../rules/srd/classes'
import { subclasses } from '../../rules/srd/subclasses'
import type { CustomTargetConfiguration, CustomTargetEntry, AbilityScoreMethod, AbilityId } from '../../stores/types'
import type { AbilityScoreArray } from '../../rules/types'

interface CustomTargetModalProps {
  isOpen: boolean
  onClose: () => void
  onTargetDefine: (target: CustomTargetConfiguration) => void
}

export function CustomTargetModal({
  isOpen,
  onClose,
  onTargetDefine
}: CustomTargetModalProps) {
  const [targetName, setTargetName] = useState('Custom Build Target')
  const [entries, setEntries] = useState<CustomTargetEntry[]>([
    { classId: '', levels: 1 }
  ])
  
  // Character basics
  const [race, setRace] = useState('human')
  const [subrace, setSubrace] = useState('')
  const [background, setBackground] = useState('')
  const [abilityMethod, setAbilityMethod] = useState<AbilityScoreMethod>('standard')
  const [baseAbilityScores, setBaseAbilityScores] = useState<AbilityScoreArray>({
    STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8
  })
  
  // Starting preferences
  const [startingWeaponPreference, setStartingWeaponPreference] = useState<'melee' | 'ranged' | 'versatile'>('melee')
  const [armorPreference, setArmorPreference] = useState<'light' | 'medium' | 'heavy' | 'none'>('medium')
  
  // Optimization priorities
  const [primaryAbility, setPrimaryAbility] = useState<AbilityId>('STR')
  const [secondaryAbility, setSecondaryAbility] = useState<AbilityId>('CON')
  const [featPreference, setFeatPreference] = useState<'power' | 'utility' | 'combat'>('power')
  const [multiclassStrategy, setMulticlassStrategy] = useState<'early' | 'late' | 'balanced'>('balanced')

  const totalLevel = entries.reduce((sum, entry) => sum + entry.levels, 0)
  
  // Get available classes as options
  const classOptions = Object.values(classes || {}).map(cls => ({
    id: cls.id,
    name: cls.name
  }))

  // Get subclasses for a given class
  const getSubclassOptions = (classId: string) => {
    return Object.values(subclasses || {})
      .filter(sub => sub.className === classId)
      .map(sub => ({
        id: sub.id,
        name: sub.name
      }))
  }

  const addEntry = () => {
    if (entries.length < 3) {
      setEntries([...entries, { classId: '', levels: 1 }])
    }
  }

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      setEntries(entries.filter((_, i) => i !== index))
    }
  }

  const updateEntry = (index: number, field: keyof CustomTargetEntry, value: string | number) => {
    const updatedEntries = [...entries]
    if (field === 'classId') {
      updatedEntries[index] = { 
        ...updatedEntries[index], 
        classId: value as string,
        subclassId: undefined // Reset subclass when class changes
      }
    } else if (field === 'subclassId') {
      updatedEntries[index] = { ...updatedEntries[index], subclassId: (value as string) || undefined }
    } else if (field === 'levels') {
      updatedEntries[index] = { ...updatedEntries[index], levels: Math.max(1, Math.min(20, value as number)) }
    }
    setEntries(updatedEntries)
  }

  const isValid = () => {
    return targetName.trim() !== '' &&
           entries.every(entry => entry.classId !== '' && entry.levels > 0) &&
           totalLevel > 0 &&
           totalLevel <= 20
  }

  const handleConfirm = () => {
    if (!isValid()) return
    
    const target: CustomTargetConfiguration = {
      name: targetName.trim(),
      entries: entries.filter(entry => entry.classId !== ''),
      totalLevel,
      race,
      subrace: subrace || undefined,
      background: background || undefined,
      baseAbilityScores,
      abilityMethod,
      startingWeaponPreference,
      armorPreference,
      optimizationPriority: {
        primaryAbility,
        secondaryAbility,
        featPreference,
        multiclassStrategy
      }
    }
    
    onTargetDefine(target)
    onClose()
    
    // Reset form
    setTargetName('Custom Build Target')
    setEntries([{ classId: '', levels: 1 }])
    setRace('human')
    setSubrace('')
    setBackground('')
    setAbilityMethod('standard')
    setBaseAbilityScores({ STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 })
    setStartingWeaponPreference('melee')
    setArmorPreference('medium')
    setPrimaryAbility('STR')
    setSecondaryAbility('CON')
    setFeatPreference('power')
    setMulticlassStrategy('balanced')
  }

  const handleCancel = () => {
    onClose()
    // Reset form
    setTargetName('Custom Build Target')
    setEntries([{ classId: '', levels: 1 }])
    setRace('human')
    setSubrace('')
    setBackground('')
    setAbilityMethod('standard')
    setBaseAbilityScores({ STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 })
    setStartingWeaponPreference('melee')
    setArmorPreference('medium')
    setPrimaryAbility('STR')
    setSecondaryAbility('CON')
    setFeatPreference('power')
    setMulticlassStrategy('balanced')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Define Custom Target</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Target Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Target Name
            </label>
            <input
              type="text"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder="Enter target build name..."
              className="w-full px-3 py-2 border rounded-md bg-transparent"
            />
          </div>

          {/* Class Composition */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="text-sm font-medium">Class Composition</label>
                <p className="text-xs text-muted-foreground">Define up to 3 classes for your multiclass build</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">Total: {totalLevel}/20</div>
                <div className="text-xs text-muted-foreground">{entries.length}/3 classes</div>
              </div>
            </div>
            
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <div key={index} className="relative">
                  {/* Class Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium">
                        {entry.classId ? classOptions.find(c => c.id === entry.classId)?.name : 'Class'} {index + 1}
                      </span>
                    </div>
                    {entries.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEntry(index)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Class Configuration */}
                  <div className="grid grid-cols-12 gap-3 p-3 border rounded-lg bg-card">
                    {/* Class Selection */}
                    <div className="col-span-5">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Class</label>
                      <Select
                        value={entry.classId}
                        onValueChange={(value) => updateEntry(index, 'classId', value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          {classOptions.map(cls => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Subclass Selection */}
                    <div className="col-span-5">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Subclass</label>
                      <Select
                        value={entry.subclassId || 'none'}
                        onValueChange={(value) => updateEntry(index, 'subclassId', value === 'none' ? '' : value)}
                        disabled={!entry.classId}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Optional..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {entry.classId && getSubclassOptions(entry.classId).map(sub => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Levels Input */}
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Levels</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={entry.levels}
                        onChange={(e) => updateEntry(index, 'levels', parseInt(e.target.value) || 1)}
                        className="w-full h-8 px-2 text-center border rounded-md bg-background text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Class Button */}
            {entries.length < 3 && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={addEntry}
                  className="w-full"
                  disabled={totalLevel >= 20}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add {entries.length === 1 ? 'Second' : 'Third'} Class
                </Button>
              </div>
            )}

            {/* Help Text */}
            <div className="mt-3 text-xs text-muted-foreground">
              <p>💡 Tip: Most multiclass builds use 2 classes. Add a third only if your build requires it.</p>
            </div>
          </div>

          {/* Character Basics */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4" />
              <h3 className="font-medium">Character Basics</h3>
              <p className="text-xs text-muted-foreground">Starting character details</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Race Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Race</label>
                <Select value={race} onValueChange={setRace}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select race..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="human">Human</SelectItem>
                    <SelectItem value="elf">Elf</SelectItem>
                    <SelectItem value="dwarf">Dwarf</SelectItem>
                    <SelectItem value="halfling">Halfling</SelectItem>
                    <SelectItem value="dragonborn">Dragonborn</SelectItem>
                    <SelectItem value="gnome">Gnome</SelectItem>
                    <SelectItem value="half-elf">Half-Elf</SelectItem>
                    <SelectItem value="half-orc">Half-Orc</SelectItem>
                    <SelectItem value="tiefling">Tiefling</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Background Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Background</label>
                <input
                  type="text"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  placeholder="e.g., Soldier, Noble..."
                  className="w-full px-3 py-2 border rounded-md bg-transparent text-sm"
                />
              </div>
            </div>

            {/* Ability Scores */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">Base Ability Scores</label>
                <Select value={abilityMethod} onValueChange={(value: AbilityScoreMethod) => setAbilityMethod(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Array</SelectItem>
                    <SelectItem value="pointbuy">Point Buy</SelectItem>
                    <SelectItem value="rolled">Rolled</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-6 gap-2">
                {Object.entries(baseAbilityScores).map(([ability, score]) => (
                  <div key={ability} className="text-center">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      {ability}
                    </label>
                    <input
                      type="number"
                      min="8"
                      max="18"
                      value={score}
                      onChange={(e) => setBaseAbilityScores(prev => ({
                        ...prev,
                        [ability]: parseInt(e.target.value) || 8
                      }))}
                      className="w-full h-8 px-2 text-center border rounded-md bg-background text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Optimization Preferences */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4" />
              <h3 className="font-medium">Optimization Preferences</h3>
              <p className="text-xs text-muted-foreground">Guide intelligent ASI/feat choices</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Primary Ability */}
              <div>
                <label className="block text-sm font-medium mb-2">Primary Ability</label>
                <Select value={primaryAbility} onValueChange={(value: AbilityId) => setPrimaryAbility(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STR">Strength (STR)</SelectItem>
                    <SelectItem value="DEX">Dexterity (DEX)</SelectItem>
                    <SelectItem value="CON">Constitution (CON)</SelectItem>
                    <SelectItem value="INT">Intelligence (INT)</SelectItem>
                    <SelectItem value="WIS">Wisdom (WIS)</SelectItem>
                    <SelectItem value="CHA">Charisma (CHA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Secondary Ability */}
              <div>
                <label className="block text-sm font-medium mb-2">Secondary Ability</label>
                <Select value={secondaryAbility} onValueChange={(value: AbilityId) => setSecondaryAbility(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STR">Strength (STR)</SelectItem>
                    <SelectItem value="DEX">Dexterity (DEX)</SelectItem>
                    <SelectItem value="CON">Constitution (CON)</SelectItem>
                    <SelectItem value="INT">Intelligence (INT)</SelectItem>
                    <SelectItem value="WIS">Wisdom (WIS)</SelectItem>
                    <SelectItem value="CHA">Charisma (CHA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Feat Preference */}
              <div>
                <label className="block text-sm font-medium mb-2">Feat Preference</label>
                <Select value={featPreference} onValueChange={(value: 'power' | 'utility' | 'combat') => setFeatPreference(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="power">Power (DPR-focused)</SelectItem>
                    <SelectItem value="utility">Utility (Versatility)</SelectItem>
                    <SelectItem value="combat">Combat (Survivability)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Multiclass Strategy */}
              <div>
                <label className="block text-sm font-medium mb-2">Multiclass Strategy</label>
                <Select value={multiclassStrategy} onValueChange={(value: 'early' | 'late' | 'balanced') => setMulticlassStrategy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="early">Early (Front-load)</SelectItem>
                    <SelectItem value="late">Late (Delayed)</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Starting Preferences */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Weapon Preference</label>
                <Select value={startingWeaponPreference} onValueChange={(value: 'melee' | 'ranged' | 'versatile') => setStartingWeaponPreference(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="melee">Melee</SelectItem>
                    <SelectItem value="ranged">Ranged</SelectItem>
                    <SelectItem value="versatile">Versatile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Armor Preference</label>
                <Select value={armorPreference} onValueChange={(value: 'light' | 'medium' | 'heavy' | 'none') => setArmorPreference(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light Armor</SelectItem>
                    <SelectItem value="medium">Medium Armor</SelectItem>
                    <SelectItem value="heavy">Heavy Armor</SelectItem>
                    <SelectItem value="none">No Armor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Validation Messages */}
          {totalLevel > 20 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <X className="w-4 h-4" />
                Total level cannot exceed 20 (currently {totalLevel})
              </div>
            </div>
          )}

          {entries.some(entry => !entry.classId) && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                ⚠️ Please select a class for all entries
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!isValid()}
          >
            Define Target
          </Button>
        </div>
      </div>
    </div>
  )
}