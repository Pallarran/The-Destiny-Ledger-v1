import { useState } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  Target, 
  Search, 
  BookOpen,
  X
} from 'lucide-react'
import { useVaultStore } from '../../stores/vaultStore'
import type { BuildConfiguration } from '../../stores/types'

interface TargetBuildModalProps {
  isOpen: boolean
  onClose: () => void
  selectedBuildId?: string
  onBuildSelect: (buildId: string) => void
}

export function TargetBuildModal({
  isOpen,
  onClose,
  selectedBuildId,
  onBuildSelect
}: TargetBuildModalProps) {
  const { builds } = useVaultStore()
  const [searchQuery, setSearchQuery] = useState('')

  // Filter builds based on search
  const filteredBuilds = builds.filter(build => 
    build.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    build.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Extract class breakdown from build
  const getClassBreakdown = (build: BuildConfiguration): Record<string, number> => {
    const breakdown: Record<string, number> = {}
    if (build.levelTimeline) {
      for (const entry of build.levelTimeline) {
        breakdown[entry.classId] = (breakdown[entry.classId] || 0) + 1
      }
    }
    return breakdown
  }

  const handleSelect = (buildId: string) => {
    onBuildSelect(buildId)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Select Target Build</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search builds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border rounded-md bg-transparent"
              autoFocus
            />
          </div>

          {/* Build List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredBuilds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No builds found</p>
                <p className="text-sm">Create builds in the Character Builder first</p>
              </div>
            ) : (
              filteredBuilds.map((build) => {
                const classBreakdown = getClassBreakdown(build)
                const isSelected = selectedBuildId === build.id
                
                return (
                  <div
                    key={build.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50 hover:bg-accent/5'
                    }`}
                    onClick={() => handleSelect(build.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{build.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Level {build.currentLevel} • {
                            Object.entries(classBreakdown)
                              .map(([classId, levels]) => `${classId} ${levels}`)
                              .join(' / ')
                          }
                        </div>
                        {build.tags && build.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {build.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {build.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{build.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="text-primary">
                          <Target className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={onClose}
            disabled={!selectedBuildId}
          >
            Confirm Selection
          </Button>
        </div>
      </div>
    </div>
  )
}