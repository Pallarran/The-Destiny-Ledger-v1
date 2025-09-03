import React, { useMemo, useState } from 'react'
import { BookOpen, Sparkles, Search, X, Check, Info } from 'lucide-react'
import { getSpellsByClass, type Spell } from '../../rules/srd/spells'
import { classes } from '../../rules/srd/classes'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'

interface SpellSelectionProps {
  classId: string
  level: number
  selectedSpells: string[]
  onSpellsChange: (spells: string[]) => void
  spellsKnown?: number
  cantripsKnown?: number
  subclassId?: string
  previousSpells?: string[] // Spells known from previous levels
  newCantripsToLearn?: number // Number of new cantrips to learn this level
  newSpellsToLearn?: number // Number of new spells to learn this level
}

const SPELL_SCHOOLS: Record<string, { color: string; icon: string }> = {
  Abjuration: { color: 'bg-blue-100 text-blue-700', icon: '🛡️' },
  Conjuration: { color: 'bg-purple-100 text-purple-700', icon: '✨' },
  Divination: { color: 'bg-indigo-100 text-indigo-700', icon: '👁️' },
  Enchantment: { color: 'bg-pink-100 text-pink-700', icon: '💝' },
  Evocation: { color: 'bg-red-100 text-red-700', icon: '🔥' },
  Illusion: { color: 'bg-violet-100 text-violet-700', icon: '🎭' },
  Necromancy: { color: 'bg-gray-100 text-gray-700', icon: '💀' },
  Transmutation: { color: 'bg-green-100 text-green-700', icon: '🔄' }
}

export const SpellSelection: React.FC<SpellSelectionProps> = ({
  classId,
  level,
  selectedSpells,
  onSpellsChange,
  spellsKnown,
  cantripsKnown,
  subclassId,
  newCantripsToLearn = 0,
  newSpellsToLearn = 0
}) => {
  const { getAllKnownSpells, getClassProgressionSpells } = useCharacterBuilderStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<number | 'cantrip'>(1)
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null)
  
  const classData = classes[classId]
  const isPreparedCaster = ['cleric', 'druid', 'paladin'].includes(classId.toLowerCase())
  
  // Get all available spells for this class
  const availableSpells = useMemo(() => {
    let spells = getSpellsByClass(classId)
    
    // Add subclass spells if applicable (e.g., domain spells for clerics)
    if (subclassId) {
      // TODO: Add subclass spell lists
    }
    
    return spells
  }, [classId, subclassId])
  
  // Get all globally known spells to prevent duplicates
  const globalKnownSpells = getAllKnownSpells()
  
  // Get class progression spells (excludes racial spells) for limit calculations
  const classProgressionSpells = getClassProgressionSpells()
  // Note: racialSpells kept for future use if needed
  // const racialSpells = getRacialSpells()
  
  // Filter spells by selected level and search query
  const filteredSpells = useMemo(() => {
    let spells = availableSpells
    
    // DON'T filter out known spells - show them as checked instead
    // This allows users to see what they've already learned
    
    // Filter by level
    if (selectedLevel === 'cantrip') {
      spells = spells.filter((s: Spell) => s.level === 0)
    } else {
      spells = spells.filter((s: Spell) => s.level === selectedLevel)
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      spells = spells.filter((s: Spell) => 
        s.name.toLowerCase().includes(query) ||
        s.school.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.tags.some((tag: string) => tag.toLowerCase().includes(query))
      )
    }
    
    return spells.sort((a: Spell, b: Spell) => a.name.localeCompare(b.name))
  }, [availableSpells, selectedLevel, searchQuery])
  
  // Calculate spell limits based on class and level
  const getSpellLimits = () => {
    // Use the new progression values if available (shows only NEW spells to learn this level)
    if (newCantripsToLearn > 0 || newSpellsToLearn > 0) {
      return {
        cantrips: newCantripsToLearn,
        spells: newSpellsToLearn
      }
    }
    
    // Legacy logic for backward compatibility (shows total spells known)
    const limits = {
      cantrips: cantripsKnown || 0,
      spells: spellsKnown || 0
    }
    
    // For prepared casters (not wizard), they have cantrips known but no spell limit (they prepare from entire list)
    if (isPreparedCaster && !spellsKnown) {
      // Prepared casters don't have a limit on spells known, only on cantrips
      // They prepare from their entire spell list each day
      limits.spells = 999 // Effectively unlimited for selection purposes
    }
    
    // Wizards have spells in spellbook (from spellsKnown) but it's not about preparation here
    // The spellsKnown for wizard represents spells in their spellbook
    
    return limits
  }
  
  const limits = getSpellLimits()
  
  // For limits, only count class progression spells, not racial spells
  const selectedCantrips = selectedSpells.filter(id => {
    const spell = availableSpells.find((s: Spell) => s.id === id)
    return spell?.level === 0
  })
  const selectedLeveledSpells = selectedSpells.filter(id => {
    const spell = availableSpells.find((s: Spell) => s.id === id)
    return spell && spell.level > 0
  })
  
  // Count class progression cantrips/spells separately (exclude racial spells from limits)
  const classProgressionCantrips = classProgressionSpells.filter((spellId: string) => {
    const spell = availableSpells.find((s: Spell) => s.id === spellId)
    return spell?.level === 0
  })
  const classProgressionLeveledSpells = classProgressionSpells.filter((spellId: string) => {
    const spell = availableSpells.find((s: Spell) => s.id === spellId)
    return spell && spell.level > 0
  })
  
  const toggleSpell = (spellId: string) => {
    const spell = availableSpells.find((s: Spell) => s.id === spellId)
    if (!spell) return
    
    const isSelected = selectedSpells.includes(spellId)
    const isCantrip = spell.level === 0
    
    if (isSelected) {
      onSpellsChange(selectedSpells.filter(id => id !== spellId))
    } else {
      // Check limits (only count class progression spells, not racial spells)
      if (isCantrip && classProgressionCantrips.length + selectedCantrips.length >= limits.cantrips) {
        return // Can't add more cantrips
      }
      if (!isCantrip && classProgressionLeveledSpells.length + selectedLeveledSpells.length >= limits.spells) {
        return // Can't add more spells
      }
      
      onSpellsChange([...selectedSpells, spellId])
    }
  }
  
  // Calculate max spell level available
  const maxSpellLevel = Math.min(9, Math.ceil(level / 2))
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">
            {newCantripsToLearn > 0 || newSpellsToLearn > 0 
              ? `Learn New Spells (Level ${level})`
              : classId === 'wizard' 
                ? 'Add to Spellbook'
                : isPreparedCaster 
                  ? 'Select Cantrips' 
                  : 'Known Spells'
            }
          </h3>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {newCantripsToLearn > 0 && (
            <span className="text-gray-600">
              New Cantrips: {selectedCantrips.length}/{newCantripsToLearn}
            </span>
          )}
          {newSpellsToLearn > 0 && (
            <span className="text-gray-600">
              New Spells: {selectedLeveledSpells.length}/{newSpellsToLearn}
            </span>
          )}
          {newCantripsToLearn === 0 && newSpellsToLearn === 0 && (
            <>
              <span className="text-gray-600">
                Cantrips: {classProgressionCantrips.length + selectedCantrips.length}/{limits.cantrips}
              </span>
              <span className="text-gray-600">
                {classId === 'wizard' 
                  ? `Spells in Spellbook: ${classProgressionLeveledSpells.length + selectedLeveledSpells.length}/${limits.spells}`
                  : isPreparedCaster
                    ? `Cantrip Selections: ${classProgressionLeveledSpells.length + selectedLeveledSpells.length}/${limits.spells}`
                    : `Spells: ${classProgressionLeveledSpells.length + selectedLeveledSpells.length}/${limits.spells}`
                }
              </span>
            </>
          )}
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search spells by name, school, or effect..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Level Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setSelectedLevel('cantrip')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selectedLevel === 'cantrip'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cantrips
          </button>
          {Array.from({ length: maxSpellLevel }, (_, i) => i + 1).map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedLevel === lvl
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Level {lvl}
            </button>
          ))}
        </div>
      </div>
      
      {/* Spell List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredSpells.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No spells found matching your criteria
          </div>
        ) : (
          filteredSpells.map((spell) => {
            const isSelected = selectedSpells.includes(spell.id)
            const isAlreadyKnown = globalKnownSpells.includes(spell.id) && !isSelected
            const isExpanded = expandedSpell === spell.id
            const schoolInfo = SPELL_SCHOOLS[spell.school]
            const isCantrip = spell.level === 0
            const canSelect = isAlreadyKnown 
              ? false // Already known spells can't be toggled
              : isCantrip 
                ? selectedCantrips.length < limits.cantrips || isSelected
                : selectedLeveledSpells.length < limits.spells || isSelected
            
            return (
              <div
                key={spell.id}
                className={`border rounded-lg transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50'
                    : isAlreadyKnown
                    ? 'border-green-300 bg-green-50'
                    : canSelect
                    ? 'border-gray-200 hover:border-gray-300'
                    : 'border-gray-200 opacity-50'
                }`}
              >
                <div
                  className={`p-3 ${canSelect ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  onClick={() => canSelect && toggleSpell(spell.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? 'bg-purple-600 border-purple-600'
                        : isAlreadyKnown
                        ? 'bg-green-600 border-green-600'
                        : 'border-gray-300'
                    }`}>
                      {(isSelected || isAlreadyKnown) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{spell.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${schoolInfo.color}`}>
                          {schoolInfo.icon} {spell.school}
                        </span>
                        {spell.tags.includes('ritual') && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            Ritual
                          </span>
                        )}
                        {spell.tags.includes('concentration') && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            Concentration
                          </span>
                        )}
                        {isAlreadyKnown && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Known
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex gap-4">
                          <span><strong>Cast:</strong> {spell.castingTime}</span>
                          <span><strong>Range:</strong> {spell.range}</span>
                          <span><strong>Duration:</strong> {spell.duration}</span>
                        </div>
                        <div className="line-clamp-2">{spell.description}</div>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedSpell(isExpanded ? null : spell.id)
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="px-3 pb-3 border-t border-gray-200">
                    <div className="mt-3 text-sm text-gray-700 space-y-2">
                      <p><strong>Components:</strong> {spell.components}</p>
                      <p>{spell.description}</p>
                      {spell.atHigherLevels && (
                        <p><strong>At Higher Levels:</strong> {spell.atHigherLevels}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
      
      {/* Helper Text */}
      {isPreparedCaster && (
        <div className="text-xs text-gray-500 italic">
          <Sparkles className="inline w-3 h-3 mr-1" />
          As a {classData?.name}, you prepare spells from your entire spell list each long rest
        </div>
      )}
    </div>
  )
}