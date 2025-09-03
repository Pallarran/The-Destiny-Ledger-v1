import { useState } from 'react'
import { Info } from 'lucide-react'

interface VersionWatermarkProps {
  className?: string
}

export function VersionWatermark({ className = '' }: VersionWatermarkProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  
  // Fallback values in case the build process doesn't inject them
  const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.4.0'
  const gitHash = typeof __GIT_HASH__ !== 'undefined' ? __GIT_HASH__ : 'unknown'
  const buildDate = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : new Date().toISOString()
  
  const formatBuildDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Unknown'
    }
  }
  
  return (
    <div 
      className={`relative inline-flex items-center gap-1 ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="text-xs text-white font-mono hidden sm:inline">
        v{version}
      </span>
      <span className="text-xs text-white/60 font-mono hidden md:inline">
        ({gitHash})
      </span>
      <Info className="w-3 h-3 text-white/40 hover:text-white/70 transition-colors cursor-help" />
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 z-50 bg-ink text-panel text-xs rounded-lg border border-border/20 shadow-lg p-3 min-w-48">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted">Version:</span>
              <span className="font-mono">v{version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Build:</span>
              <span className="font-mono">{gitHash}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Built:</span>
              <span className="text-xs">{formatBuildDate(buildDate)}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-border/20 text-xs text-muted">
            Phase 4: Enhanced DPR Lab
          </div>
          
          {/* Tooltip arrow */}
          <div className="absolute -top-1 right-4 w-2 h-2 bg-ink border-l border-t border-border/20 transform rotate-45"></div>
        </div>
      )}
    </div>
  )
}