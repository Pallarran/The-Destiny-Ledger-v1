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
  X
} from 'lucide-react'
import { classes } from '../../rules/srd/classes'
import { subclasses } from '../../rules/srd/subclasses'
import type { CustomTargetConfiguration, CustomTargetEntry } from '../../stores/types'

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
      totalLevel
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
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Define Custom Target</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-96">
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