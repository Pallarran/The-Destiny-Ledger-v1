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
  Trash2
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
  const classOptions = Object.values(classes).map(cls => ({
    id: cls.id,
    name: cls.name
  }))

  // Get subclasses for a given class
  const getSubclassOptions = (classId: string) => {
    return Object.values(subclasses)
      .filter(sub => sub.className === classId)
      .map(sub => ({
        id: sub.id,
        name: sub.name
      }))
  }

  const addEntry = () => {
    setEntries([...entries, { classId: '', levels: 1 }])
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
      updatedEntries[index] = { ...updatedEntries[index], subclassId: value as string }
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

          {/* Class Entries */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">
                Class Composition
              </label>
              <div className="text-sm text-muted-foreground">
                Total Level: {totalLevel}/20
              </div>
            </div>
            
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  {/* Class Selection */}
                  <div className="flex-1">
                    <Select
                      value={entry.classId}
                      onValueChange={(value) => updateEntry(index, 'classId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class..." />
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
                  <div className="flex-1">
                    <Select
                      value={entry.subclassId || ''}
                      onValueChange={(value) => updateEntry(index, 'subclassId', value)}
                      disabled={!entry.classId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Subclass (optional)..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {entry.classId && getSubclassOptions(entry.classId).map(sub => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Levels Input */}
                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={entry.levels}
                      onChange={(e) => updateEntry(index, 'levels', parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-2 text-center border rounded-md bg-transparent"
                    />
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeEntry(index)}
                    disabled={entries.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add Entry Button */}
            <Button
              variant="outline"
              onClick={addEntry}
              className="w-full mt-3"
              disabled={totalLevel >= 20}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Class
            </Button>
          </div>

          {/* Validation Messages */}
          {totalLevel > 20 && (
            <div className="text-sm text-red-600 dark:text-red-400">
              Total level cannot exceed 20
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