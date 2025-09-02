import { cn } from '../../lib/utils'
import { Sword, Users, BookOpen, Eye, Crown } from 'lucide-react'
import { pactBoons } from '../../rules/srd/pactBoons'

interface PactBoonSelectionProps {
  currentPactBoon?: string
  onPactBoonSelected: (pactBoonId: string | undefined) => void
  className?: string
}

const getPactBoonIcon = (pactBoonId: string) => {
  switch (pactBoonId) {
    case 'blade': return Sword
    case 'chain': return Users
    case 'tome': return BookOpen
    default: return Crown
  }
}

const getPactBoonColor = (pactBoonId: string) => {
  switch (pactBoonId) {
    case 'blade': return 'text-red-600 bg-red-50 border-red-200'
    case 'chain': return 'text-green-600 bg-green-50 border-green-200'
    case 'tome': return 'text-blue-600 bg-blue-50 border-blue-200'
    default: return 'text-purple-600 bg-purple-50 border-purple-200'
  }
}

export function PactBoonSelection({ 
  currentPactBoon,
  onPactBoonSelected,
  className 
}: PactBoonSelectionProps) {
  const availableBoons = Object.values(pactBoons)
  
  const handleBoonToggle = (pactBoonId: string) => {
    if (currentPactBoon === pactBoonId) {
      // Deselect if clicking the same boon
      onPactBoonSelected(undefined)
    } else {
      // Select new boon
      onPactBoonSelected(pactBoonId)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Choose your Pact Boon {currentPactBoon ? '(1/1 selected)' : '(0/1 selected)'}
        </div>
        <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
          Level 3 Feature
        </div>
      </div>

      <div className="space-y-3">
        {availableBoons.map((boon) => {
          const Icon = getPactBoonIcon(boon.id)
          const isSelected = currentPactBoon === boon.id
          const colorClass = getPactBoonColor(boon.id)
          
          return (
            <button
              key={boon.id}
              onClick={() => handleBoonToggle(boon.id)}
              className={cn(
                'w-full p-4 border rounded-lg text-left transition-all group',
                'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                isSelected
                  ? `${colorClass} ring-2 ring-purple-500 shadow-md`
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
              )}
            >
              <div className="flex items-start gap-4">
                <Icon 
                  className={cn(
                    'w-8 h-8 mt-1 flex-shrink-0',
                    isSelected 
                      ? colorClass.split(' ')[0] 
                      : 'text-gray-400 group-hover:text-purple-600'
                  )} 
                />
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-bold text-gray-900 text-lg">
                      {boon.name}
                    </h5>
                    <div className="flex gap-1">
                      {boon.tags.map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs capitalize"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {boon.description}
                  </p>
                  
                  <div className="space-y-2">
                    <h6 className="text-sm font-semibold text-gray-800">Benefits:</h6>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {boon.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-purple-600 mt-1.5 w-1 h-1 rounded-full bg-current flex-shrink-0"></span>
                          <span className="leading-relaxed">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {boon.relatedInvocations.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-start gap-2 text-xs text-gray-600">
                        <Eye className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">Related Invocations: </span>
                          <span className="capitalize">
                            {boon.relatedInvocations.map(inv => inv.replace('_', ' ')).join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {currentPactBoon && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Pact Boon:</h4>
          <div className="flex gap-2">
            {(() => {
              const boon = pactBoons[currentPactBoon]
              const Icon = getPactBoonIcon(currentPactBoon)
              return boon ? (
                <span className="inline-flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-800 text-sm rounded-md">
                  <Icon className="w-4 h-4" />
                  {boon.name}
                </span>
              ) : null
            })()}
          </div>
        </div>
      )}
    </div>
  )
}