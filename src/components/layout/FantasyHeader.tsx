import { Link } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { VersionWatermark } from '../ui/version-watermark'
import { LegalModal } from '../ui/legal-modal'

interface FantasyHeaderProps {
  title: string
}

export function FantasyHeader({ title }: FantasyHeaderProps) {
  return (
    <header className="relative z-40 h-20 flex items-center justify-between px-16 bg-gradient-to-r from-ink/90 via-ink/95 to-ink/90 border-b-2 border-gold shadow-lg">
      {/* Left: App Logo */}
      <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <img 
          src={`${import.meta.env.BASE_URL}destiny-ledger-main-logo.png`} 
          alt="The Destiny Ledger" 
          className="w-14 h-14 drop-shadow-lg" 
        />
      </Link>

      {/* Center: Current Section Title */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <h1 className="text-2xl font-serif font-bold text-gold tracking-wider drop-shadow-lg">
          {title}
        </h1>
      </div>

      {/* Right: Version & Settings */}
      <div className="flex items-center gap-4">
        <LegalModal />
        <VersionWatermark />
        <Link 
          to="/settings"
          className="p-2 text-gold hover:text-panel transition-colors"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>
    </header>
  )
}