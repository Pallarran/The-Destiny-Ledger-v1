import { cn } from '../../lib/utils'
import { Sword, Shield, Zap, Target, Users, Move3D } from 'lucide-react'
import { maneuvers, getManeuverProgression, type Maneuver } from '../../rules/srd/maneuvers'

interface ManeuverSelectionProps {
  level: number
  maneuverCount: number
  currentManeuvers?: string[]
  onManeuversSelected: (maneuvers: string[]) => void
  className?: string
}

const getManeuverIcon = (tags: string[]) => {
  if (tags.includes('damage')) return Sword
  if (tags.includes('defense')) return Shield
  if (tags.includes('control')) return Target
  if (tags.includes('support')) return Users
  if (tags.includes('utility')) return Zap
  if (tags.includes('positioning')) return Move3D
  return Sword // default
}

const getManeuverColor = (tags: string[]) => {
  if (tags.includes('damage')) return 'text-red-600 bg-red-50 border-red-200'
  if (tags.includes('defense')) return 'text-blue-600 bg-blue-50 border-blue-200'
  if (tags.includes('control')) return 'text-purple-600 bg-purple-50 border-purple-200'
  if (tags.includes('support')) return 'text-green-600 bg-green-50 border-green-200'
  if (tags.includes('utility')) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  if (tags.includes('positioning')) return 'text-cyan-600 bg-cyan-50 border-cyan-200'
  return 'text-gray-600 bg-gray-50 border-gray-200' // default
}

export function ManeuverSelection({ 
  level, 
  maneuverCount, 
  currentManeuvers = [],
  onManeuversSelected,
  className 
}: ManeuverSelectionProps) {
  const availableManeuvers = Object.values(maneuvers)
  const selectedManeuvers = new Set(currentManeuvers)
  
  const progression = getManeuverProgression(level)
  
  const handleManeuverToggle = (maneuverId: string) => {
    const newSelection = new Set(selectedManeuvers)
    
    if (newSelection.has(maneuverId)) {
      newSelection.delete(maneuverId)
    } else if (newSelection.size < maneuverCount) {
      newSelection.add(maneuverId)
    }
    
    onManeuversSelected(Array.from(newSelection))
  }

  const isSelectable = (maneuverId: string) => {
    return selectedManeuvers.has(maneuverId) || selectedManeuvers.size < maneuverCount
  }

  // Group maneuvers by primary tag for better organization
  const maneuversByCategory = availableManeuvers.reduce((acc, maneuver) => {
    const primaryTag = maneuver.tags[0] || 'other'
    if (!acc[primaryTag]) {
      acc[primaryTag] = []
    }
    acc[primaryTag].push(maneuver)
    return acc
  }, {} as Record<string, Maneuver[]>)

  const categoryOrder = ['damage', 'control', 'defense', 'support', 'utility', 'positioning', 'other']

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Choose {maneuverCount} maneuvers ({currentManeuvers.length}/{maneuverCount} selected)
        </div>
        {progression && (
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {progression.dice}d{progression.dieSize} superiority dice
          </div>
        )}
      </div>

      <div className="space-y-6">
        {categoryOrder.map(category => {
          const categoryManeuvers = maneuversByCategory[category]
          if (!categoryManeuvers || categoryManeuvers.length === 0) return null

          return (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 capitalize border-b border-gray-200 pb-1">
                {category === 'positioning' ? 'Movement' : category}
              </h4>
              
              <div className="grid grid-cols-1 gap-2">
                {categoryManeuvers.map((maneuver) => {
                  const Icon = getManeuverIcon(maneuver.tags)
                  const isSelected = selectedManeuvers.has(maneuver.id)
                  const canSelect = isSelectable(maneuver.id)
                  const colorClass = getManeuverColor(maneuver.tags)
                  
                  return (
                    <button
                      key={maneuver.id}
                      onClick={() => handleManeuverToggle(maneuver.id)}
                      disabled={!canSelect}
                      className={cn(
                        'p-3 border rounded-lg text-left transition-all group',
                        'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent',
                        isSelected
                          ? `${colorClass} ring-2 ring-orange-500 shadow-sm`
                          : canSelect
                            ? 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50'
                            : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Icon 
                          className={cn(
                            'w-5 h-5 mt-0.5 flex-shrink-0',
                            isSelected 
                              ? colorClass.split(' ')[0] 
                              : 'text-gray-400 group-hover:text-orange-500'
                          )} 
                        />
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-gray-900">
                              {maneuver.name}
                            </h5>
                            {maneuver.savingThrow && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                {maneuver.savingThrow.ability} save
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {maneuver.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              <strong>Effect:</strong> {maneuver.effect}
                            </span>
                            <div className="flex gap-1">
                              {maneuver.tags.map(tag => (
                                <span 
                                  key={tag}
                                  className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded capitalize"
                                >
                                  {tag}
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
            </div>
          )
        })}
      </div>

      {currentManeuvers.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Maneuvers:</h4>
          <div className="flex flex-wrap gap-2">
            {currentManeuvers.map(maneuverId => {
              const maneuver = maneuvers[maneuverId]
              if (!maneuver) return null
              
              return (
                <span
                  key={maneuverId}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded"
                >
                  {maneuver.name}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}