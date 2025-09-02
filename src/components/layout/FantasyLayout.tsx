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
  const currentPage = pageTitles[location.pathname] || 'THE DESTINY LEDGER'
  const isLandingPage = location.pathname === '/'

  return (
    <div className="relative min-h-screen parchment-bg overflow-hidden">
      {/* Full-screen ornate frame */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <img 
          src="/The-Destiny-Ledger-v1/assets/ornate-frame.png" 
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{ 
            objectFit: 'fill',
            padding: '8px',  // Small padding to prevent edge clipping
          }}
        />
      </div>

      {/* Content directly on parchment */}
      <div className="relative min-h-screen flex flex-col" style={{ 
        padding: '80px 100px',  // Account for frame thickness
      }}>
        {/* Fantasy Header with Title Bar */}
        <FantasyHeader currentPage={currentPage} isLandingPage={isLandingPage} />

        {/* Content area */}
        <div className="flex flex-1" style={{ minHeight: isLandingPage ? 'calc(100vh - 200px)' : 'auto' }}>
          {/* Sidebar - only show on non-landing pages */}
          {!isLandingPage && <FantasySidebar />}
          
          {/* Main content */}
          <main className={`flex-1 overflow-y-auto ${!isLandingPage ? 'ml-8' : ''}`}>
            <div className={isLandingPage ? 'h-full flex items-center justify-center' : 'max-w-7xl mx-auto pt-6'}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}