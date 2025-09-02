import { Link } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { VersionWatermark } from '../ui/version-watermark'
import { LegalModal } from '../ui/legal-modal'

interface FantasyHeaderProps {
  title: string
}

export function FantasyHeader({ title }: FantasyHeaderProps) {
  return (
    <header className="relative z-40 flex items-center justify-between py-4">
      {/* Left: App Logo */}
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
        <img 
          src={`${import.meta.env.BASE_URL}destiny-ledger-main-logo.png`} 
          alt="The Destiny Ledger" 
          className="w-16 h-16 drop-shadow-xl" 
        />
      </Link>

      {/* Center: Current Section Title */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <h1 className="text-2xl font-serif font-bold text-ink tracking-widest">
          {title}
        </h1>
      </div>

      {/* Right: Version & Settings */}
      <div className="flex items-center gap-3 text-sm">
        <LegalModal />
        <VersionWatermark />
        <Link 
          to="/settings"
          className="p-2 text-ink hover:text-gold transition-colors rounded-lg hover:bg-ink/10"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>
    </header>
  )
}