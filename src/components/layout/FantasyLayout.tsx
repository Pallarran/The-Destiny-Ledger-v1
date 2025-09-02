import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { FantasyHeader } from './FantasyHeader'
import { FantasySidebar } from './FantasySidebar'

interface FantasyLayoutProps {
  children: ReactNode
}

const pageTitles: Record<string, string> = {
  '/': 'WELCOME',
  '/builder': 'CHARACTER BUILDER',
  '/vault': 'BUILD VAULT',
  '/dpr': 'DPR LABORATORY',
  '/compare': 'COMPARE BUILDS',
  '/explorer': 'LEVEL PATH EXPLORER',
  '/party': 'PARTY OPTIMIZER',
  '/settings': 'SETTINGS'
}

export function FantasyLayout({ children }: FantasyLayoutProps) {
  const location = useLocation()
  const currentTitle = pageTitles[location.pathname] || 'THE DESTINY LEDGER'

  return (
    <div className="relative min-h-screen bg-bg overflow-hidden">
      {/* Full-screen ornate frame */}
      <div className="absolute inset-0 pointer-events-none z-50">
        <img 
          src="/The-Destiny-Ledger-v1/assets/ornate-frame.png" 
          alt=""
          className="w-full h-full object-fill"
        />
      </div>

      {/* Main content area with parchment background */}
      <div className="relative min-h-screen parchment-bg">
        {/* Fantasy Header */}
        <FantasyHeader title={currentTitle} />

        {/* Content area with sidebar */}
        <div className="flex" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <FantasySidebar />
          
          {/* Main content */}
          <main className="flex-1 p-8 overflow-y-auto" style={{ paddingLeft: '60px', paddingRight: '60px' }}>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}