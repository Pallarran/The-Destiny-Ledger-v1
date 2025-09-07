import { useState, useEffect } from 'react'
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
  X
} from 'lucide-react'
import { classes } from '../../rules/srd/classes'
import { subclasses } from '../../rules/srd/subclasses'
import type { CustomTargetConfiguration, CustomTargetEntry, AbilityId, BuildConfiguration } from '../../stores/types'

interface CustomTargetModalProps {
  isOpen: boolean
  onClose: () => void
  onTargetDefine: (target: CustomTargetConfiguration) => void
  sourceBuild?: BuildConfiguration // The build we're extending from
}

export function CustomTargetModal({
  isOpen,
  onClose,
  onTargetDefine,
  sourceBuild
}: CustomTargetModalProps) {
  const [targetName, setTargetName] = useState('Custom Build Target')
  const [entries, setEntries] = useState<CustomTargetEntry[]>([
    { classId: '', levels: 1 }
  ])
  

  // Helper function to infer weapon preference from build equipment
  const inferWeaponPreference = (build: BuildConfiguration): 'melee' | 'ranged' | 'versatile' => {
    if (build.rangedWeapon) return 'ranged'
    if (build.mainHandWeapon) {
      // Simple heuristic - could be enhanced with actual weapon data
      const weapon = build.mainHandWeapon.toLowerCase()
      if (weapon.includes('bow') || weapon.includes('crossbow') || weapon.includes('dart')) return 'ranged'
      if (weapon.includes('versatile') || weapon.includes('longsword')) return 'versatile'
    }
    return 'melee' // Default
  }

  // Helper function to infer armor preference from build equipment
  const inferArmorPreference = (build: BuildConfiguration): 'light' | 'medium' | 'heavy' | 'none' => {
    if (!build.armor) return 'none'
    const armor = build.armor.toLowerCase()
    if (armor.includes('leather') || armor.includes('studded')) return 'light'
    if (armor.includes('chain') || armor.includes('scale') || armor.includes('breastplate')) return 'medium'
    if (armor.includes('plate') || armor.includes('splint') || armor.includes('ring')) return 'heavy'
    return 'medium' // Default
  }

  // Helper function to get primary ability from actual build analysis
  const inferPrimaryAbility = (build: BuildConfiguration): AbilityId => {
    // Analyze actual ability scores to find the highest relevant combat ability
    if (build.abilityScores) {
      const combat_abilities: AbilityId[] = ['STR', 'DEX', 'INT', 'WIS', 'CHA']
      const sortedAbilities = combat_abilities.sort((a, b) => 
        (build.abilityScores[b] || 8) - (build.abilityScores[a] || 8)
      )
      
      // Check for clear ability focus patterns
      const highestScore = build.abilityScores[sortedAbilities[0]] || 8
      const secondHighestScore = build.abilityScores[sortedAbilities[1]] || 8
      
      // If there's a clear highest ability with a significant gap, use it
      if (highestScore >= secondHighestScore + 2) {
        return sortedAbilities[0]
      }
    }
    
    // Analyze fighting style for clear indicators
    const fightingStyleEntry = build.levelTimeline?.find(entry => entry.fightingStyle)
    if (fightingStyleEntry?.fightingStyle) {
      const style = fightingStyleEntry.fightingStyle.toLowerCase()
      if (style.includes('archery') || style.includes('archer')) return 'DEX'
      if (style.includes('defense') || style.includes('protection')) {
        // Look at weapon choice for defense/protection users
        if (build.rangedWeapon) return 'DEX'
        return 'STR'
      }
    }
    
    // Analyze weapon choices
    if (build.rangedWeapon) return 'DEX'
    if (build.mainHandWeapon) {
      const weapon = build.mainHandWeapon.toLowerCase()
      // Finesse weapons typically use DEX
      if (weapon.includes('rapier') || weapon.includes('shortsword') || 
          weapon.includes('scimitar') || weapon.includes('dagger')) return 'DEX'
      // Heavy weapons typically use STR  
      if (weapon.includes('greatsword') || weapon.includes('maul') || 
          weapon.includes('greataxe')) return 'STR'
    }
    
    // Fall back to class defaults only if no clear pattern
    if (!build.levelTimeline || build.levelTimeline.length === 0) return 'STR'
    
    const primaryClass = build.levelTimeline[0].classId
    const classToAbility: Record<string, AbilityId> = {
      'fighter': 'STR', // Will be overridden by weapon/style analysis above
      'barbarian': 'STR',
      'paladin': 'STR',
      'ranger': 'DEX',
      'rogue': 'DEX',
      'monk': 'DEX',
      'wizard': 'INT',
      'sorcerer': 'CHA',
      'warlock': 'CHA',
      'bard': 'CHA',
      'cleric': 'WIS',
      'druid': 'WIS'
    }
    return classToAbility[primaryClass] || 'STR'
  }

  // Auto-populate form when sourceBuild changes
  useEffect(() => {
    if (sourceBuild) {
      // Set target name based on source build
      setTargetName(`${sourceBuild.name} (Extended)`)
      
      // Initialize entries to extend the current build to level 20
      if (sourceBuild.levelTimeline) {
        const classBreakdown: Record<string, number> = {}
        sourceBuild.levelTimeline.forEach(entry => {
          classBreakdown[entry.classId] = (classBreakdown[entry.classId] || 0) + 1
        })
        
        const remainingLevels = 20 - sourceBuild.currentLevel
        const numClasses = Object.keys(classBreakdown).length
        
        const initialEntries = Object.entries(classBreakdown).map(([classId, levels]) => ({
          classId,
          levels: levels + Math.floor(remainingLevels / numClasses),
          subclassId: sourceBuild.levelTimeline.find(e => e.classId === classId)?.subclassId
        }))
        
        // Distribute any remaining levels to the first class
        const distributedLevels = initialEntries.reduce((sum, entry) => sum + entry.levels, 0) - sourceBuild.currentLevel
        if (distributedLevels < remainingLevels && initialEntries.length > 0) {
          initialEntries[0].levels += remainingLevels - distributedLevels
        }
        
        if (initialEntries.length > 0) {
          setEntries(initialEntries)
        }
      }
    }
  }, [sourceBuild])

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
      // Auto-populate from source build
      race: sourceBuild?.race || 'human',
      subrace: sourceBuild?.subrace,
      background: sourceBuild?.background,
      baseAbilityScores: sourceBuild?.baseAbilityScores || { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 },
      abilityMethod: sourceBuild?.abilityMethod || 'standard',
      startingWeaponPreference: sourceBuild ? inferWeaponPreference(sourceBuild) : 'melee',
      armorPreference: sourceBuild ? inferArmorPreference(sourceBuild) : 'medium',
      optimizationPriority: {
        primaryAbility: sourceBuild ? inferPrimaryAbility(sourceBuild) : 'STR',
        secondaryAbility: 'CON', // Generally good default
        featPreference: 'power', // Will be determined by optimization goal
        multiclassStrategy: 'balanced'
      }
    }
    
    onTargetDefine(target)
    onClose()
    
    // Reset form
    setTargetName('Custom Build Target')
    setEntries([{ classId: '', levels: 1 }])
  }

  const handleCancel = () => {
    onClose()
    // Reset form
    setTargetName('Custom Build Target')
    setEntries([{ classId: '', levels: 1 }])
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