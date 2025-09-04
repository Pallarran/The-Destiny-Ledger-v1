import React, { useMemo, useState } from 'react'
import { BookOpen, Search, X, Check, Info } from 'lucide-react'
import { getSpellsByClass, type Spell } from '../../rules/srd/spells'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'

interface PreparedCasterSpellPreparationProps {
  classId: string
  level: number
  preparedSpells: string[]
  onPreparedSpellsChange: (spells: string[]) => void
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

export const PreparedCasterSpellPreparation: React.FC<PreparedCasterSpellPreparationProps> = ({
  classId,
  level,
  preparedSpells,
  onPreparedSpellsChange
}) => {
  const { currentBuild } = useCharacterBuilderStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<number>(1)
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null)
  
  // Get ability modifier for the appropriate spellcasting ability
  const getAbilityModifier = (score: number) => Math.floor((score - 10) / 2)
  const abilityScores = currentBuild?.finalAbilityScores || currentBuild?.abilityScores || {}
  
  let spellcastingModifier = 0
  let abilityName = ''
  
  if (classId === 'cleric' || classId === 'druid' || classId === 'ranger') {
    spellcastingModifier = getAbilityModifier((abilityScores as any).WIS || 10)
    abilityName = 'WIS'
  } else if (classId === 'paladin') {
    spellcastingModifier = getAbilityModifier((abilityScores as any).CHA || 10)
    abilityName = 'CHA'
  } else if (classId === 'artificer') {
    spellcastingModifier = getAbilityModifier((abilityScores as any).INT || 10)
    abilityName = 'INT'
  }
  
  // Calculate number of spells that can be prepared
  const maxPreparedSpells = Math.max(1, level + spellcastingModifier)
  
  // Get all class spells (entire spell list available for preparation)
  const allClassSpells = useMemo(() => getSpellsByClass(classId), [classId])
  
  // Filter to only show spells that can be cast at this level (no cantrips - they're separately chosen)
  const preparableSpells = useMemo(() => {
    return allClassSpells.filter((spell: Spell) => {
      // Only show spells the character can cast
      let maxSpellLevel: number
      if (classId === 'artificer') {
        // Artificers get spells at level 2, not level 1
        maxSpellLevel = Math.min(5, Math.floor(level / 2))
      } else {
        // Other prepared casters (clerics, druids, paladins)
        maxSpellLevel = Math.min(9, Math.ceil(level / 2))
      }
      return spell.level > 0 && spell.level <= maxSpellLevel
    })
  }, [allClassSpells, level, classId])
  
  // Filter spells by selected level and search query
  const filteredSpells = useMemo(() => {
    let spells = preparableSpells
    
    // Filter by level
    spells = spells.filter((s: Spell) => s.level === selectedLevel)
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      spells = spells.filter((s: Spell) => 
        s.name.toLowerCase().includes(query) ||
        s.school.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
      )
    }
    
    return spells.sort((a: Spell, b: Spell) => a.name.localeCompare(b.name))
  }, [preparableSpells, selectedLevel, searchQuery])
  
  const toggleSpell = (spellId: string) => {
    const isSelected = preparedSpells.includes(spellId)
    
    if (isSelected) {
      onPreparedSpellsChange(preparedSpells.filter(id => id !== spellId))
    } else {
      if (preparedSpells.length >= maxPreparedSpells) {
        return // Can't prepare more spells
      }
      onPreparedSpellsChange([...preparedSpells, spellId])
    }
  }
  
  // Calculate max spell level available
  const maxSpellLevel = classId === 'artificer' 
    ? Math.min(5, Math.floor(level / 2))  // Artificers get spells at level 2, not level 1
    : Math.min(9, Math.ceil(level / 2))
  
  const className = classId.charAt(0).toUpperCase() + classId.slice(1)
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Prepare {className} Spells</h3>
        </div>
        <div className="text-sm text-gray-600">
          Prepared: {preparedSpells.length}/{maxPreparedSpells} ({className} Level {level} + {abilityName} {spellcastingModifier >= 0 ? '+' : ''}{spellcastingModifier})
        </div>
      </div>
      
      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <Info className="inline w-4 h-4 mr-1" />
        You can prepare {maxPreparedSpells} spells from the {classId} spell list. You can cast these spells using your spell slots.
        You can change your prepared spells after a long rest.
      </div>
      
      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${classId} spells...`}
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
          {Array.from({ length: maxSpellLevel }, (_, i) => i + 1).map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              disabled={!preparableSpells.some((s: Spell) => s.level === lvl)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedLevel === lvl
                  ? 'bg-white text-purple-600 shadow-sm'
                  : preparableSpells.some((s: Spell) => s.level === lvl)
                    ? 'text-gray-600 hover:text-gray-900'
                    : 'text-gray-400 cursor-not-allowed'
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
            {preparableSpells.some((s: Spell) => s.level === selectedLevel) 
              ? 'No spells found matching your criteria'
              : `No level ${selectedLevel} spells available`
            }
          </div>
        ) : (
          filteredSpells.map((spell) => {
            const isSelected = preparedSpells.includes(spell.id)
            const isExpanded = expandedSpell === spell.id
            const schoolInfo = SPELL_SCHOOLS[spell.school]
            const canSelect = preparedSpells.length < maxPreparedSpells || isSelected
            
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