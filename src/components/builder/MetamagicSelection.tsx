import { cn } from '../../lib/utils'
import { Sparkles, Zap, Shield, Target, Clock, User, Eye, TrendingUp } from 'lucide-react'
import { metamagicOptions, type MetamagicOption } from '../../rules/srd/metamagic'

interface MetamagicSelectionProps {
  metamagicCount: number
  currentMetamagic?: string[]
  onMetamagicSelected: (metamagic: string[]) => void
  className?: string
}

const getMetamagicIcon = (tags: string[]) => {
  if (tags.includes('damage')) return Zap
  if (tags.includes('protection')) return Shield
  if (tags.includes('control')) return Target
  if (tags.includes('duration')) return Clock
  if (tags.includes('multi-target')) return User
  if (tags.includes('stealth')) return Eye
  if (tags.includes('enhancement')) return TrendingUp
  if (tags.includes('action-economy')) return Sparkles
  return Sparkles // default
}

const getMetamagicColor = (tags: string[]) => {
  if (tags.includes('damage')) return 'text-red-600 bg-red-50 border-red-200'
  if (tags.includes('protection')) return 'text-blue-600 bg-blue-50 border-blue-200'
  if (tags.includes('control')) return 'text-purple-600 bg-purple-50 border-purple-200'
  if (tags.includes('utility')) return 'text-green-600 bg-green-50 border-green-200'
  if (tags.includes('action-economy')) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  if (tags.includes('enhancement')) return 'text-orange-600 bg-orange-50 border-orange-200'
  return 'text-indigo-600 bg-indigo-50 border-indigo-200' // default
}

export function MetamagicSelection({ 
  metamagicCount, 
  currentMetamagic = [],
  onMetamagicSelected,
  className 
}: MetamagicSelectionProps) {
  const availableOptions = Object.values(metamagicOptions)
  const selectedMetamagic = new Set(currentMetamagic)
  
  const handleMetamagicToggle = (metamagicId: string) => {
    const newSelection = new Set(selectedMetamagic)
    
    if (newSelection.has(metamagicId)) {
      newSelection.delete(metamagicId)
    } else if (newSelection.size < metamagicCount) {
      newSelection.add(metamagicId)
    }
    
    onMetamagicSelected(Array.from(newSelection))
  }

  const isSelectable = (metamagicId: string) => {
    return selectedMetamagic.has(metamagicId) || selectedMetamagic.size < metamagicCount
  }

  // Group metamagic by primary tag for better organization
  const metamagicByCategory = availableOptions.reduce((acc, option) => {
    const primaryTag = option.tags[0] || 'other'
    if (!acc[primaryTag]) {
      acc[primaryTag] = []
    }
    acc[primaryTag].push(option)
    return acc
  }, {} as Record<string, MetamagicOption[]>)

  const categoryOrder = ['damage', 'control', 'utility', 'action-economy', 'enhancement', 'protection', 'other']

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Choose {metamagicCount} metamagic options ({currentMetamagic.length}/{metamagicCount} selected)
        </div>
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          Sorcery Points Required
        </div>
      </div>

      <div className="space-y-6">
        {categoryOrder.map(category => {
          const categoryOptions = metamagicByCategory[category]
          if (!categoryOptions || categoryOptions.length === 0) return null

          return (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 capitalize border-b border-gray-200 pb-1">
                {category === 'action-economy' ? 'Action Economy' : category === 'multi-target' ? 'Multi-Target' : category}
              </h4>
              
              <div className="grid grid-cols-1 gap-2">
                {categoryOptions.map((option) => {
                  const Icon = getMetamagicIcon(option.tags)
                  const isSelected = selectedMetamagic.has(option.id)
                  const canSelect = isSelectable(option.id)
                  const colorClass = getMetamagicColor(option.tags)
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleMetamagicToggle(option.id)}
                      disabled={!canSelect}
                      className={cn(
                        'p-3 border rounded-lg text-left transition-all group',
                        'hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                        isSelected
                          ? `${colorClass} ring-2 ring-indigo-500 shadow-sm`
                          : canSelect
                            ? 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50'
                            : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Icon 
                          className={cn(
                            'w-5 h-5 mt-0.5 flex-shrink-0',
                            isSelected 
                              ? colorClass.split(' ')[0] 
                              : 'text-gray-400 group-hover:text-indigo-500'
                          )} 
                        />
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium text-gray-900">
                              {option.name}
                            </h5>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              {option.sorceryPointCost}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {option.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              <strong>Effect:</strong> {option.effect}
                            </span>
                            <div className="flex gap-1">
                              {option.tags.map(tag => (
                                <span 
                                  key={tag}
                                  className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded capitalize"
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
            </div>
          )
        })}
      </div>

      {currentMetamagic.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Metamagic:</h4>
          <div className="flex flex-wrap gap-2">
            {currentMetamagic.map(metamagicId => {
              const option = metamagicOptions[metamagicId]
              if (!option) return null
              
              return (
                <span
                  key={metamagicId}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded"
                >
                  {option.name}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}