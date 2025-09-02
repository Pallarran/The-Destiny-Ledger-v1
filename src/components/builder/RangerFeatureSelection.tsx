import { cn } from '../../lib/utils'
import { TreePine, Target, Mountain, Waves, Sun, Snowflake, Leaf, Shield } from 'lucide-react'
import { favoredEnemies, naturalExplorerTerrains } from '../../rules/srd/rangerFeatures'

interface RangerFeatureSelectionProps {
  featureType: 'favored_enemy' | 'natural_explorer'
  currentSelection?: string
  onSelectionChanged: (selection: string | undefined) => void
  className?: string
}

const getFavoredEnemyIcon = (enemyId: string) => {
  switch (enemyId) {
    case 'beasts': return TreePine
    case 'humanoids': return Target
    case 'undead': return Shield
    case 'fiends': case 'celestials': return Shield
    case 'dragons': return Shield
    case 'giants': return Mountain
    case 'fey': return Leaf
    default: return Target
  }
}

const getTerrainIcon = (terrainId: string) => {
  switch (terrainId) {
    case 'forest': return TreePine
    case 'mountain': return Mountain
    case 'coast': return Waves
    case 'desert': return Sun
    case 'arctic': return Snowflake
    case 'grassland': return Leaf
    case 'swamp': return TreePine
    case 'underdark': return Mountain
    default: return TreePine
  }
}

const getFavoredEnemyColor = (tags: string[]) => {
  if (tags.includes('evil')) return 'text-red-600 bg-red-50 border-red-200'
  if (tags.includes('nature')) return 'text-green-600 bg-green-50 border-green-200'
  if (tags.includes('social')) return 'text-blue-600 bg-blue-50 border-blue-200'
  if (tags.includes('planar')) return 'text-purple-600 bg-purple-50 border-purple-200'
  if (tags.includes('magical')) return 'text-indigo-600 bg-indigo-50 border-indigo-200'
  return 'text-orange-600 bg-orange-50 border-orange-200'
}

const getTerrainColor = (tags: string[]) => {
  if (tags.includes('water')) return 'text-blue-600 bg-blue-50 border-blue-200'
  if (tags.includes('hot')) return 'text-red-600 bg-red-50 border-red-200'
  if (tags.includes('cold')) return 'text-cyan-600 bg-cyan-50 border-cyan-200'
  if (tags.includes('nature')) return 'text-green-600 bg-green-50 border-green-200'
  if (tags.includes('underground')) return 'text-gray-600 bg-gray-50 border-gray-200'
  return 'text-emerald-600 bg-emerald-50 border-emerald-200'
}

export function RangerFeatureSelection({ 
  featureType,
  currentSelection,
  onSelectionChanged,
  className 
}: RangerFeatureSelectionProps) {
  const isFavoredEnemy = featureType === 'favored_enemy'
  const availableOptions = Object.values(isFavoredEnemy ? favoredEnemies : naturalExplorerTerrains)
  
  const handleSelectionToggle = (selectionId: string) => {
    if (currentSelection === selectionId) {
      // Deselect if clicking the same option
      onSelectionChanged(undefined)
    } else {
      // Select new option
      onSelectionChanged(selectionId)
    }
  }

  const title = isFavoredEnemy ? 'Favored Enemy' : 'Natural Explorer'
  const subtitle = isFavoredEnemy 
    ? 'Choose a type of creature to gain tracking and knowledge benefits against'
    : 'Choose a terrain type where you excel at survival and navigation'

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {subtitle} {currentSelection ? '(1/1 selected)' : '(0/1 selected)'}
        </div>
        <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
          {title}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {availableOptions.map((option) => {
          const Icon = isFavoredEnemy 
            ? getFavoredEnemyIcon(option.id) 
            : getTerrainIcon(option.id)
          const isSelected = currentSelection === option.id
          const colorClass = isFavoredEnemy 
            ? getFavoredEnemyColor(option.tags)
            : getTerrainColor(option.tags)
          
          return (
            <button
              key={option.id}
              onClick={() => handleSelectionToggle(option.id)}
              className={cn(
                'w-full p-4 border rounded-lg text-left transition-all group',
                'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent',
                isSelected
                  ? `${colorClass} ring-2 ring-green-500 shadow-md`
                  : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
              )}
            >
              <div className="flex items-start gap-3">
                <Icon 
                  className={cn(
                    'w-6 h-6 mt-0.5 flex-shrink-0',
                    isSelected 
                      ? colorClass.split(' ')[0] 
                      : 'text-gray-400 group-hover:text-green-600'
                  )} 
                />
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-semibold text-gray-900">
                      {option.name}
                    </h5>
                    <div className="flex gap-1">
                      {option.tags.map((tag: string) => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs capitalize"
                        >
                          {tag.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {option.description}
                  </p>
                  
                  <div className="space-y-2">
                    <h6 className="text-sm font-semibold text-gray-800">Benefits:</h6>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {option.benefits.map((benefit: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1.5 w-1 h-1 rounded-full bg-current flex-shrink-0"></span>
                          <span className="leading-relaxed">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {currentSelection && (
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected {title}:</h4>
          <div className="flex gap-2">
            {(() => {
              const option = isFavoredEnemy 
                ? favoredEnemies[currentSelection] 
                : naturalExplorerTerrains[currentSelection]
              const Icon = isFavoredEnemy 
                ? getFavoredEnemyIcon(currentSelection) 
                : getTerrainIcon(currentSelection)
              return option ? (
                <span className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 text-sm rounded-md">
                  <Icon className="w-4 h-4" />
                  {option.name}
                </span>
              ) : null
            })()}
          </div>
        </div>
      )}
    </div>
  )
}