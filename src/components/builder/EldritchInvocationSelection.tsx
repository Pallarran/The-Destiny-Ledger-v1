import { cn } from '../../lib/utils'
import { Zap, Shield, Eye, Users, Sword, Brain, Wind, Skull } from 'lucide-react'
import { eldritchInvocations, isInvocationAvailable, type EldritchInvocation } from '../../rules/srd/eldritchInvocations'

interface EldritchInvocationSelectionProps {
  invocationCount: number
  currentInvocations?: string[]
  onInvocationsSelected: (invocations: string[]) => void
  level: number
  pactBoon?: string
  className?: string
}

const getInvocationIcon = (tags: string[]) => {
  if (tags.includes('damage')) return Zap
  if (tags.includes('defense')) return Shield
  if (tags.includes('utility')) return Brain
  if (tags.includes('stealth')) return Eye
  if (tags.includes('control')) return Wind
  if (tags.includes('social')) return Users
  if (tags.includes('pact-blade')) return Sword
  if (tags.includes('debuff')) return Skull
  return Brain
}

const getInvocationColor = (tags: string[]) => {
  if (tags.includes('damage')) return 'text-red-600 bg-red-50 border-red-200'
  if (tags.includes('defense')) return 'text-blue-600 bg-blue-50 border-blue-200'
  if (tags.includes('control')) return 'text-purple-600 bg-purple-50 border-purple-200'
  if (tags.includes('utility')) return 'text-green-600 bg-green-50 border-green-200'
  if (tags.includes('social')) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  if (tags.includes('stealth')) return 'text-gray-600 bg-gray-50 border-gray-200'
  if (tags.includes('pact-blade') || tags.includes('pact-chain') || tags.includes('pact-tome')) return 'text-indigo-600 bg-indigo-50 border-indigo-200'
  return 'text-teal-600 bg-teal-50 border-teal-200'
}

export function EldritchInvocationSelection({ 
  invocationCount, 
  currentInvocations = [],
  onInvocationsSelected,
  level,
  pactBoon,
  className 
}: EldritchInvocationSelectionProps) {
  const availableOptions = Object.values(eldritchInvocations).filter(inv => 
    isInvocationAvailable(inv, level, pactBoon)
  )
  const selectedInvocations = new Set(currentInvocations)
  
  const handleInvocationToggle = (invocationId: string) => {
    const newSelection = new Set(selectedInvocations)
    
    if (newSelection.has(invocationId)) {
      newSelection.delete(invocationId)
    } else if (newSelection.size < invocationCount) {
      newSelection.add(invocationId)
    }
    
    onInvocationsSelected(Array.from(newSelection))
  }

  const isSelectable = (invocationId: string) => {
    return selectedInvocations.has(invocationId) || selectedInvocations.size < invocationCount
  }

  // Group invocations by primary tag for better organization
  const invocationsByCategory = availableOptions.reduce((acc, option) => {
    const primaryTag = option.tags[0] || 'other'
    if (!acc[primaryTag]) {
      acc[primaryTag] = []
    }
    acc[primaryTag].push(option)
    return acc
  }, {} as Record<string, EldritchInvocation[]>)

  const categoryOrder = ['damage', 'defense', 'control', 'utility', 'social', 'stealth', 'pact-blade', 'pact-chain', 'pact-tome', 'other']

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Choose {invocationCount} eldritch invocations ({currentInvocations.length}/{invocationCount} selected)
        </div>
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          Level {level} Available
        </div>
      </div>

      <div className="space-y-6">
        {categoryOrder.map(category => {
          const categoryOptions = invocationsByCategory[category]
          if (!categoryOptions || categoryOptions.length === 0) return null

          return (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 capitalize border-b border-gray-200 pb-1">
                {category === 'pact-blade' ? 'Pact of the Blade' : 
                 category === 'pact-chain' ? 'Pact of the Chain' : 
                 category === 'pact-tome' ? 'Pact of the Tome' : 
                 category}
              </h4>
              
              <div className="grid grid-cols-1 gap-2">
                {categoryOptions.map((option) => {
                  const Icon = getInvocationIcon(option.tags)
                  const isSelected = selectedInvocations.has(option.id)
                  const canSelect = isSelectable(option.id)
                  const colorClass = getInvocationColor(option.tags)
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleInvocationToggle(option.id)}
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
                            {option.prerequisites && (
                              <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">
                                {option.prerequisites}
                              </span>
                            )}
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

      {currentInvocations.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Invocations:</h4>
          <div className="flex flex-wrap gap-2">
            {currentInvocations.map(invocationId => {
              const option = eldritchInvocations[invocationId]
              if (!option) return null
              
              return (
                <span
                  key={invocationId}
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