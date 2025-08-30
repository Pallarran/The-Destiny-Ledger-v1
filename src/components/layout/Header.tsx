import { Link } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { VersionWatermark } from '../ui/version-watermark'

export function Header() {
  return (
    <header className="bg-bg border-b border-border/20 px-4 py-3">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src={`${import.meta.env.BASE_URL}destiny-ledger-main-logo.png`} alt="The Destiny Ledger" className="w-12 h-12" />
          <div>
            <h1 className="text-xl font-bold text-panel font-serif">THE DESTINY LEDGER</h1>
            <p className="text-xs text-muted uppercase tracking-wider">OPTIMIZE & COMPARE</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <VersionWatermark />
          <Link 
            to="/settings"
            className="p-2 text-muted hover:text-panel transition-colors"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}