import { useState } from 'react'
import { Button } from './button'
import { Badge } from './badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './select'
import { 
  BookOpen, 
  Scroll, 
  Filter,
  Eye
} from 'lucide-react'
import { cn } from '../../lib/utils'

export type ContentFilter = 'all' | 'srd' | 'homebrew'

interface ContentFilterProps {
  currentFilter: ContentFilter
  onFilterChange: (filter: ContentFilter) => void
  homebrewCount?: number
  srdCount?: number
  totalCount?: number
  className?: string
  variant?: 'buttons' | 'dropdown' | 'compact'
}

export function ContentFilter({
  currentFilter,
  onFilterChange,
  homebrewCount = 0,
  srdCount = 0,
  totalCount = 0,
  className,
  variant = 'buttons'
}: ContentFilterProps) {
  
  if (variant === 'dropdown') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={currentFilter} onValueChange={(value) => onFilterChange(value as ContentFilter)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                All ({totalCount})
              </div>
            </SelectItem>
            <SelectItem value="srd">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                SRD ({srdCount})
              </div>
            </SelectItem>
            <SelectItem value="homebrew">
              <div className="flex items-center gap-2">
                <Scroll className="w-4 h-4" />
                Homebrew ({homebrewCount})
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Button
          variant={currentFilter === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange('all')}
        >
          All
        </Button>
        <Button
          variant={currentFilter === 'srd' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange('srd')}
        >
          <BookOpen className="w-3 h-3 mr-1" />
          SRD
        </Button>
        <Button
          variant={currentFilter === 'homebrew' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange('homebrew')}
          disabled={homebrewCount === 0}
        >
          <Scroll className="w-3 h-3 mr-1" />
          HB
        </Button>
      </div>
    )
  }

  // Default buttons variant
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="text-sm text-muted-foreground font-medium">Filter:</div>
      <div className="flex items-center gap-1">
        <Button
          variant={currentFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('all')}
          className="h-8"
        >
          <Eye className="w-4 h-4 mr-2" />
          All
          <Badge variant="secondary" className="ml-2">
            {totalCount}
          </Badge>
        </Button>
        
        <Button
          variant={currentFilter === 'srd' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('srd')}
          className="h-8"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          SRD
          <Badge variant="secondary" className="ml-2">
            {srdCount}
          </Badge>
        </Button>
        
        <Button
          variant={currentFilter === 'homebrew' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange('homebrew')}
          disabled={homebrewCount === 0}
          className="h-8"
        >
          <Scroll className="w-4 h-4 mr-2" />
          Homebrew
          <Badge variant="secondary" className="ml-2">
            {homebrewCount}
          </Badge>
        </Button>
      </div>
    </div>
  )
}

// Hook for managing content filtering
export function useContentFilter<T extends { id: string }>(
  items: T[],
  isHomebrewFn: (id: string) => boolean
) {
  const [filter, setFilter] = useState<ContentFilter>('all')
  
  const filteredItems = items.filter(item => {
    switch (filter) {
      case 'srd':
        return !isHomebrewFn(item.id)
      case 'homebrew':
        return isHomebrewFn(item.id)
      case 'all':
      default:
        return true
    }
  })
  
  const counts = {
    total: items.length,
    srd: items.filter(item => !isHomebrewFn(item.id)).length,
    homebrew: items.filter(item => isHomebrewFn(item.id)).length
  }
  
  return {
    filter,
    setFilter,
    filteredItems,
    counts
  }
}