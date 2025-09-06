import { Badge } from './badge'
import { Scroll } from 'lucide-react'
import { cn } from '../../lib/utils'

interface HomebrewBadgeProps {
  variant?: 'default' | 'outline' | 'secondary' | 'small'
  className?: string
  showIcon?: boolean
}

export function HomebrewBadge({ variant = 'default', className, showIcon = true }: HomebrewBadgeProps) {
  const isSmall = variant === 'small'
  
  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "bg-purple-500/10 text-purple-700 border-purple-500/20 hover:bg-purple-500/20 transition-colors",
        "dark:bg-purple-400/10 dark:text-purple-300 dark:border-purple-400/20",
        isSmall && "px-1.5 py-0.5 text-xs",
        className
      )}
    >
      {showIcon && <Scroll className={cn("mr-1", isSmall ? "w-3 h-3" : "w-4 h-4")} />}
      Homebrew
    </Badge>
  )
}

interface ContentWithHomebrewProps {
  name: string
  isHomebrew: boolean
  children?: React.ReactNode
  className?: string
  badgeVariant?: 'default' | 'outline' | 'secondary' | 'small'
  showHomebrewIcon?: boolean
}

export function ContentWithHomebrew({ 
  name, 
  isHomebrew, 
  children, 
  className,
  badgeVariant = 'small',
  showHomebrewIcon = true
}: ContentWithHomebrewProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex-1">{name}</span>
      {isHomebrew && (
        <HomebrewBadge 
          variant={badgeVariant} 
          showIcon={showHomebrewIcon}
        />
      )}
      {children}
    </div>
  )
}

// Helper function to determine if content is homebrew
export function isHomebrewContent(id: string): boolean {
  // SRD content typically has lowercase IDs with underscores
  // Homebrew content typically has more descriptive IDs or specific patterns
  // This is a simple heuristic - could be enhanced with explicit tagging
  
  // Check if ID contains common homebrew patterns
  const homebrewPatterns = [
    /^homebrew[-_]/i,  // starts with homebrew-
    /[-_]homebrew/i,   // contains -homebrew
    /^custom[-_]/i,    // starts with custom-
    /[-_]custom/i,     // contains -custom
    /[A-Z].*[A-Z]/,    // camelCase or PascalCase (common in homebrew)
    /^[a-z]+[A-Z]/,    // camelCase
  ]
  
  return homebrewPatterns.some(pattern => pattern.test(id))
}

// Enhanced version that checks against actual homebrew store
export function isFromHomebrewStore(id: string, contentType: 'class' | 'subclass' | 'feat' | 'spell' | 'magicItem'): boolean {
  try {
    // Import homebrew store to check if content exists in homebrew storage
    const { homebrewStore } = require('../../engine/homebrewLoader')
    
    switch (contentType) {
      case 'class':
        return homebrewStore.getClass(id) !== undefined
      case 'subclass':
        return homebrewStore.getSubclass(id) !== undefined
      case 'feat':
        return homebrewStore.getFeat(id) !== undefined
      case 'spell':
        return homebrewStore.getSpell(id) !== undefined
      case 'magicItem':
        return homebrewStore.getMagicItem(id) !== undefined
      default:
        return false
    }
  } catch (error) {
    // Fallback to pattern matching if store access fails
    return isHomebrewContent(id)
  }
}