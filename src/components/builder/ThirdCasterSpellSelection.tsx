import React, { useMemo, useState } from 'react'
import { BookOpen, Search, X, Check, Info, AlertCircle } from 'lucide-react'
import { getSpellsByClass, type Spell } from '../../rules/srd/spells'

interface ThirdCasterSpellSelectionProps {
  subclassId: 'eldritch_knight' | 'arcane_trickster'
  level: number
  selectedSpells: string[]
  onSpellsChange: (spells: string[]) => void
  spellsKnown?: number
  cantripsKnown?: number
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

export const ThirdCasterSpellSelection: React.FC<ThirdCasterSpellSelectionProps> = ({
  subclassId,
  level,
  selectedSpells,
  onSpellsChange,
  spellsKnown,
  cantripsKnown
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<number | 'cantrip'>(1)
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null)
  
  // Get the base class for spell list (wizard for EK, wizard for AT)
  const baseSpellClass = subclassId === 'eldritch_knight' ? 'wizard' : 'wizard'
  
  // Define school restrictions
  const allowedSchools = useMemo(() => {
    if (subclassId === 'eldritch_knight') {
      return ['Abjuration', 'Evocation'] // EK restricted to Abjuration + Evocation
    } else {
      return ['Enchantment', 'Illusion'] // AT restricted to Enchantment + Illusion
    }
  }, [subclassId])
  
  // Get all available spells for this subclass
  const availableSpells = useMemo(() => {
    let spells = getSpellsByClass(baseSpellClass)
    
    // Filter by school restrictions for leveled spells
    spells = spells.filter((spell: Spell) => {
      // Cantrips: no school restriction
      if (spell.level === 0) return true
      
      // Level 1+ spells: must be from allowed schools, OR be one of the unrestricted picks
      return allowedSchools.includes(spell.school)
    })
    
    return spells
  }, [baseSpellClass, allowedSchools])
  
  // Calculate unrestricted spell picks (spells that can be from any school)
  const getUnrestrictedPicks = (totalLevel: number) => {
    if (subclassId === 'eldritch_knight') {
      // EK gets unrestricted picks at levels 8, 14, 20
      if (totalLevel >= 20) return 3
      if (totalLevel >= 14) return 2
      if (totalLevel >= 8) return 1
      return 0
    } else {
      // AT gets unrestricted picks at levels 8, 14, 20
      if (totalLevel >= 20) return 3
      if (totalLevel >= 14) return 2
      if (totalLevel >= 8) return 1
      return 0
    }
  }
  
  const unrestrictedPicks = getUnrestrictedPicks(level)
  
  // Filter spells by selected level and search query
  const filteredSpells = useMemo(() => {
    let spells = availableSpells
    
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
  
  // Separate selected spells into categories
  const selectedCantrips = selectedSpells.filter(id => {
    const spell = availableSpells.find((s: Spell) => s.id === id)
    return spell?.level === 0
  })
  
  const selectedLeveledSpells = selectedSpells.filter(id => {
    const spell = availableSpells.find((s: Spell) => s.id === id)
    return spell && spell.level > 0
  })
  
  const selectedUnrestrictedSpells = selectedLeveledSpells.filter(id => {
    const spell = availableSpells.find((s: Spell) => s.id === id)
    return spell && !allowedSchools.includes(spell.school)
  })
  
  const limits = {
    cantrips: cantripsKnown || 0,
    spells: spellsKnown || 0,
    unrestricted: unrestrictedPicks
  }
  
  const toggleSpell = (spellId: string) => {
    const spell = availableSpells.find((s: Spell) => s.id === spellId)
    if (!spell) return
    
    const isSelected = selectedSpells.includes(spellId)
    const isCantrip = spell.level === 0
    const isRestricted = allowedSchools.includes(spell.school)
    
    if (isSelected) {
      onSpellsChange(selectedSpells.filter(id => id !== spellId))
    } else {
      // Check limits
      if (isCantrip && selectedCantrips.length >= limits.cantrips) {
        return // Can't add more cantrips
      }
      if (!isCantrip && selectedLeveledSpells.length >= limits.spells) {
        return // Can't add more spells
      }
      if (!isCantrip && !isRestricted && selectedUnrestrictedSpells.length >= limits.unrestricted) {
        return // Can't add more unrestricted spells
      }
      
      onSpellsChange([...selectedSpells, spellId])
    }
  }
  
  const canSelectSpell = (spell: Spell) => {
    const isSelected = selectedSpells.includes(spell.id)
    if (isSelected) return true
    
    const isCantrip = spell.level === 0
    const isRestricted = allowedSchools.includes(spell.school)
    
    if (isCantrip && selectedCantrips.length >= limits.cantrips) return false
    if (!isCantrip && selectedLeveledSpells.length >= limits.spells) return false
    if (!isCantrip && !isRestricted && selectedUnrestrictedSpells.length >= limits.unrestricted) return false
    
    return true
  }
  
  // Calculate max spell level available (third caster progression)
  const maxSpellLevel = Math.min(4, Math.ceil((level - 1) / 6) + 1)
  
  const subclassName = subclassId === 'eldritch_knight' ? 'Eldritch Knight' : 'Arcane Trickster'
  const schoolNames = allowedSchools.join(' & ')
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">
            {subclassName} Spells
          </h3>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-600">
            Cantrips: {selectedCantrips.length}/{limits.cantrips}
          </span>
          <span className="text-gray-600">
            Spells: {selectedLeveledSpells.length}/{limits.spells}
          </span>
          {limits.unrestricted > 0 && (
            <span className="text-gray-600">
              Unrestricted: {selectedUnrestrictedSpells.length}/{limits.unrestricted}
            </span>
          )}
        </div>
      </div>
      
      {/* School Restrictions Info */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">School Restrictions:</p>
            <p>
              Level 1+ spells must be from <strong>{schoolNames}</strong> schools, 
              except for {limits.unrestricted} unrestricted pick{limits.unrestricted !== 1 ? 's' : ''} 
              {limits.unrestricted > 0 && ' (any school)'}
            </p>
          </div>
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
            const isExpanded = expandedSpell === spell.id
            const schoolInfo = SPELL_SCHOOLS[spell.school]
            const canSelect = canSelectSpell(spell)
            const isRestricted = spell.level === 0 || allowedSchools.includes(spell.school)
            
            return (
              <div
                key={spell.id}
                className={`border rounded-lg transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50'
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
                        : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{spell.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${schoolInfo.color}`}>
                          {schoolInfo.icon} {spell.school}
                        </span>
                        {!isRestricted && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            Unrestricted
                          </span>
                        )}
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
    </div>
  )
}