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
    <header className="relative z-50 bg-ink shadow-xl border-b-4 border-gold">
      {/* Main Title Bar */}
      <div className="flex items-center justify-between px-12 py-4">
        {/* Left: Logo and App Name */}
        <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
          <img 
            src={`${import.meta.env.BASE_URL}destiny-ledger-main-logo.png`} 
            alt="The Destiny Ledger" 
            className="w-14 h-14 drop-shadow-xl" 
          />
          <div>
            <h1 className="text-xl font-serif font-bold text-gold tracking-wider">
              THE DESTINY LEDGER
            </h1>
            <p className="text-sm text-gold/80 uppercase tracking-widest">
              OPTIMIZE & COMPARE
            </p>
          </div>
        </Link>

        {/* Center: Section Title (only on non-landing pages) */}
        {!isLandingPage && (
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h2 className="text-2xl font-serif font-bold text-panel tracking-widest drop-shadow-lg">
              {currentPage}
            </h2>
          </div>
        )}

        {/* Right: Version & Settings */}
        <div className="flex items-center gap-4">
          <LegalModal />
          <VersionWatermark />
          <Link 
            to="/settings"
            className="p-3 text-gold hover:text-panel transition-colors rounded-lg hover:bg-gold/20 border border-gold/30 hover:border-gold/60"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}