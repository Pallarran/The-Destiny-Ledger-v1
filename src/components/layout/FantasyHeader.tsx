import { Link } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { VersionWatermark } from '../ui/version-watermark'
import { LegalModal } from '../ui/legal-modal'

interface FantasyHeaderProps {
  currentPage: string
  isLandingPage: boolean
}

export function FantasyHeader({ currentPage, isLandingPage }: FantasyHeaderProps) {
  return (
    <header className="relative z-40 bg-ink/95 border-b-2 border-gold/60 shadow-lg">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-8 py-3">
        {/* Left: Logo and App Name */}
        <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
          <img 
            src={`${import.meta.env.BASE_URL}destiny-ledger-main-logo.png`} 
            alt="The Destiny Ledger" 
            className="w-12 h-12 drop-shadow-lg" 
          />
          <div>
            <h1 className="text-lg font-serif font-bold text-gold tracking-wider">
              THE DESTINY LEDGER
            </h1>
            <p className="text-xs text-gold/70 uppercase tracking-widest">
              OPTIMIZE & COMPARE
            </p>
          </div>
        </Link>

        {/* Right: Version & Settings */}
        <div className="flex items-center gap-3">
          <LegalModal />
          <VersionWatermark />
          <Link 
            to="/settings"
            className="p-2 text-gold hover:text-panel transition-colors rounded-lg hover:bg-gold/10"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Section Title Bar (only show on non-landing pages) */}
      {!isLandingPage && (
        <div className="bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 border-t border-gold/30">
          <div className="text-center py-2">
            <h2 className="text-xl font-serif font-bold text-ink tracking-widest">
              {currentPage}
            </h2>
          </div>
        </div>
      )}
    </header>
  )
}