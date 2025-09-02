import { cn } from '../../lib/utils'
import { Skull, Zap, Users, Eye, Shield, Crown } from 'lucide-react'
import { allMysticArcanumSpells } from '../../rules/srd/mysticArcanum'

interface MysticArcanumSelectionProps {
  spellLevel: number
  currentSpell?: string
  onSpellSelected: (spellId: string | undefined) => void
  className?: string
}

const getSpellIcon = (tags: string[]) => {
  if (tags.includes('damage')) return Zap
  if (tags.includes('control')) return Shield
  if (tags.includes('social')) return Users
  if (tags.includes('utility')) return Eye
  if (tags.includes('necromancy') || tags.includes('death')) return Skull
  if (tags.includes('summoning')) return Users
  return Crown // Mystic Arcanum default
}

const getSpellColor = (tags: string[]) => {
  if (tags.includes('damage')) return 'text-red-600 bg-red-50 border-red-200'
  if (tags.includes('control')) return 'text-purple-600 bg-purple-50 border-purple-200'
  if (tags.includes('utility')) return 'text-green-600 bg-green-50 border-green-200'
  if (tags.includes('social')) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  if (tags.includes('necromancy') || tags.includes('death')) return 'text-gray-800 bg-gray-50 border-gray-300'
  if (tags.includes('summoning')) return 'text-blue-600 bg-blue-50 border-blue-200'
  return 'text-purple-700 bg-purple-100 border-purple-300' // Mystic Arcanum theme
}

const getSchoolColor = (school: string) => {
  const schoolColors: Record<string, string> = {
    abjuration: 'text-blue-700 bg-blue-100',
    conjuration: 'text-orange-700 bg-orange-100',
    divination: 'text-indigo-700 bg-indigo-100',
    enchantment: 'text-pink-700 bg-pink-100',
    evocation: 'text-red-700 bg-red-100',
    necromancy: 'text-gray-700 bg-gray-100',
    transmutation: 'text-green-700 bg-green-100',
    illusion: 'text-purple-700 bg-purple-100'
  }
  return schoolColors[school] || 'text-gray-700 bg-gray-100'
}

export function MysticArcanumSelection({ 
  spellLevel, 
  currentSpell,
  onSpellSelected,
  className 
}: MysticArcanumSelectionProps) {
  const availableSpells = Object.values(allMysticArcanumSpells[spellLevel as keyof typeof allMysticArcanumSpells] || {})
  
  const handleSpellToggle = (spellId: string) => {
    if (currentSpell === spellId) {
      // Deselect if clicking the same spell
      onSpellSelected(undefined)
    } else {
      // Select new spell
      onSpellSelected(spellId)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Choose your {spellLevel === 6 ? '6th' : spellLevel === 7 ? '7th' : spellLevel === 8 ? '8th' : '9th'}-level Mystic Arcanum spell
          {currentSpell ? ' (1/1 selected)' : ' (0/1 selected)'}
        </div>
        <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
          1/Long Rest
        </div>
      </div>

      <div className="space-y-3">
        {availableSpells.map((spell) => {
          const Icon = getSpellIcon(spell.tags)
          const isSelected = currentSpell === spell.id
          const colorClass = getSpellColor(spell.tags)
          const schoolColorClass = getSchoolColor(spell.school)
          
          return (
            <button
              key={spell.id}
              onClick={() => handleSpellToggle(spell.id)}
              className={cn(
                'w-full p-4 border rounded-lg text-left transition-all group',
                'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                isSelected
                  ? `${colorClass} ring-2 ring-purple-500 shadow-md`
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
              )}
            >
              <div className="flex items-start gap-3">
                <Icon 
                  className={cn(
                    'w-6 h-6 mt-0.5 flex-shrink-0',
                    isSelected 
                      ? colorClass.split(' ')[0] 
                      : 'text-gray-400 group-hover:text-purple-600'
                  )} 
                />
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <h5 className="font-semibold text-gray-900 text-lg">
                        {spell.name}
                      </h5>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded capitalize ${schoolColorClass}`}>
                          {spell.school}
                        </span>
                        <span className="text-xs px-2 py-1 bg-purple-600 text-white rounded font-medium">
                          Level {spell.level}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {spell.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex-1">
                      <span className="text-gray-600">
                        <strong>Effect:</strong> {spell.effect}
                      </span>
                    </div>
                    <div className="flex gap-1 ml-4">
                      {spell.tags.map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs capitalize"
                        >
                          {tag.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {currentSpell && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Mystic Arcanum:</h4>
          <div className="flex gap-2">
            {(() => {
              const spell = availableSpells.find(s => s.id === currentSpell)
              return spell ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-md">
                  <Crown className="w-3 h-3" />
                  {spell.name} (Level {spell.level})
                </span>
              ) : null
            })()}
          </div>
        </div>
      )}
    </div>
  )
}