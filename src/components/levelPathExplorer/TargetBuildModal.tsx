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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-4xl w-full max-h-[80vh] overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 text-amber-900 shadow-2xl shadow-amber-900/40 p-8 before:absolute before:inset-0 before:rounded-sm before:border-4 before:border-amber-800/60 before:pointer-events-none before:shadow-[inset_0_2px_4px_rgba(180,83,9,0.3),inset_0_-2px_4px_rgba(180,83,9,0.2)] after:absolute after:inset-0 after:rounded-sm after:pointer-events-none after:bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(180,83,9,0.05)_100%)] after:opacity-40 [box-shadow:0_0_0_1px_rgb(180_83_9_/_0.4),0_0_0_2px_rgb(217_119_6_/_0.3),0_0_0_3px_rgb(180_83_9_/_0.2),0_20px_25px_-5px_rgb(0_0_0_/_0.3),0_10px_10px_-5px_rgb(0_0_0_/_0.2)]">
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-amber-800/30 mb-6">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-800" />
            <h2 className="text-xl font-bold text-amber-900 font-serif">Select Target Build</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-amber-200/80 hover:bg-amber-300/80 text-amber-800 hover:text-amber-900 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative z-10">
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