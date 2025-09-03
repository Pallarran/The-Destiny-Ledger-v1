import { Link } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { VersionWatermark } from '../ui/version-watermark'

interface FantasyHeaderProps {
  currentPage: string
  isLandingPage: boolean
}

export function FantasyHeader({ currentPage, isLandingPage }: FantasyHeaderProps) {
  return (
    <header className="relative shadow-lg rounded-t-lg" 
            style={{ backgroundColor: '#2A3441', zIndex: 10000, position: 'sticky', top: 0 }}>
      {/* Single Title Bar with everything */}
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left: Logo and App Name */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <img 
            src={`${import.meta.env.BASE_URL}destiny-ledger-main-logo.png`} 
            alt="The Destiny Ledger" 
            className="w-12 h-12 drop-shadow-lg" 
          />
          <div>
            <h1 className="text-lg font-serif font-bold text-accent tracking-wider drop-shadow-sm">
              THE DESTINY LEDGER
            </h1>
            <p className="text-xs text-gold uppercase tracking-widest">
              OPTIMIZE & COMPARE
            </p>
          </div>
        </Link>

        {/* Center: Section Title (only on non-landing pages) */}
        {!isLandingPage && (
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h2 className="text-xl font-serif font-bold text-white tracking-widest drop-shadow-md">
              {currentPage}
            </h2>
          </div>
        )}

        {/* Right: Version & Settings */}
        <div className="flex items-center gap-3">
          <VersionWatermark />
          <Link 
            to="/settings"
            className="p-2 text-gold hover:text-accent transition-colors rounded-lg hover:bg-slate-600/30"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}