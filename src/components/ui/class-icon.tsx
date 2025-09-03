import { cn } from "@/lib/utils"

interface ClassIconProps {
  className: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  alt?: string
  fallback?: React.ReactNode
}

const SIZE_CLASSES = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

// Map class names to icon filenames
const CLASS_ICON_MAP: Record<string, string> = {
  artificer: 'Artificer_arcane_blue.png',
  barbarian: 'Barbarian_arcane_blue.png',
  bard: 'Bard_arcane_blue.png',
  cleric: 'Cleric_arcane_blue.png',
  druid: 'Druid_arcane_blue.png',
  fighter: 'Fighter_arcane_blue.png',
  monk: 'Monk_arcane_blue.png',
  paladin: 'Paladin_arcane_blue.png',
  ranger: 'Ranger_arcane_blue.png',
  rogue: 'Rogue_arcane_blue.png',
  sorcerer: 'Sorcerer_arcane_blue.png',
  warlock: 'Warlock_arcane_blue.png',
  wizard: 'Wizard_arcane_blue.png'
}

export function ClassIcon({ className, size = 'md', alt, fallback }: ClassIconProps) {
  const normalizedClassName = className.toLowerCase()
  const iconFileName = CLASS_ICON_MAP[normalizedClassName]
  
  if (!iconFileName) {
    return fallback || null
  }
  
  const iconPath = `${import.meta.env.BASE_URL}assets/class-icons/${iconFileName}`
  const altText = alt || `${className} class icon`
  
  return (
    <img
      src={iconPath}
      alt={altText}
      className={cn(
        SIZE_CLASSES[size],
        "object-contain drop-shadow-sm"
      )}
    />
  )
}

// Helper function to get primary class from build configuration
export function getPrimaryClass(build: any): string | null {
  // Check for levelTimeline (vault builds) or levels (other builds)
  const timeline = build?.levelTimeline || build?.levels
  if (!timeline || timeline.length === 0) {
    return null
  }
  
  // Count levels per class
  const classLevels: Record<string, number> = {}
  
  for (const level of timeline) {
    const classId = level.classId
    classLevels[classId] = (classLevels[classId] || 0) + 1
  }
  
  // Find class with most levels
  let primaryClass = null
  let maxLevels = 0
  
  for (const [classId, levels] of Object.entries(classLevels)) {
    if (levels > maxLevels) {
      maxLevels = levels
      primaryClass = classId
    }
  }
  
  return primaryClass
}