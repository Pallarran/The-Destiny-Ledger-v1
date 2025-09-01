import { useState } from 'react'
import { Badge } from './badge'
import { Button } from './button'
import { ChevronDown, ChevronUp, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContextualRevealProps {
  show: boolean
  title?: string
  description?: string
  alwaysShow?: boolean
  expandable?: boolean
  className?: string
  children: React.ReactNode
}

/**
 * Component that conditionally reveals content based on build context
 * Helps reduce UI clutter by showing only relevant options
 */
export function ContextualReveal({
  show,
  title,
  description,
  alwaysShow = false,
  expandable = false,
  className,
  children
}: ContextualRevealProps) {
  const [isExpanded, setIsExpanded] = useState(!expandable)
  
  // Always render if alwaysShow is true, otherwise check show condition
  if (!show && !alwaysShow) {
    return null
  }
  
  // Simple reveal without expand/collapse
  if (!expandable) {
    return (
      <div className={cn("space-y-2", className)}>
        {(title || description) && (
          <div className="flex items-center gap-2">
            {title && (
              <h4 className="text-sm font-medium text-foreground">{title}</h4>
            )}
            {description && (
              <div className="flex items-center gap-1">
                <Info className="w-3 h-3 text-muted" />
                <span className="text-xs text-muted">{description}</span>
              </div>
            )}
            {show && (
              <Badge variant="secondary" className="text-xs">
                Contextually Available
              </Badge>
            )}
          </div>
        )}
        {children}
      </div>
    )
  }
  
  // Expandable reveal
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {title && (
            <h4 className="text-sm font-medium text-foreground">{title}</h4>
          )}
          {description && (
            <div className="flex items-center gap-1">
              <Info className="w-3 h-3 text-muted" />
              <span className="text-xs text-muted">{description}</span>
            </div>
          )}
          {show && (
            <Badge variant="secondary" className="text-xs">
              Contextually Available
            </Badge>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 px-2"
        >
          {isExpanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="pl-2 border-l-2 border-muted/20">
          {children}
        </div>
      )}
    </div>
  )
}

interface ContextualSectionProps {
  show: boolean
  fallbackMessage?: string
  className?: string
  children: React.ReactNode
}

/**
 * Section that shows/hides entirely based on context
 * Useful for larger sections that should be completely hidden
 */
export function ContextualSection({
  show,
  fallbackMessage = "These options will appear when relevant to your build",
  className,
  children
}: ContextualSectionProps) {
  if (!show) {
    return (
      <div className={cn("text-center py-4 text-muted-foreground", className)}>
        <Info className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">{fallbackMessage}</p>
      </div>
    )
  }
  
  return <div className={className}>{children}</div>
}