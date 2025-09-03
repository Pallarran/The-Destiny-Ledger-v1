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
    <div className="relative min-h-screen bg-bg flex flex-col">
      {/* Title Bar - Outside the frame at top */}
      <FantasyHeader currentPage={currentPage} isLandingPage={isLandingPage} />

      {/* Main content area with frame */}
      <div className="flex-1 relative parchment-bg" style={{ margin: '20px 40px 40px 40px' }}>
        {/* Ornate frame around content area only */}
        <div className="absolute inset-0 pointer-events-none z-40">
          <img 
            src="/The-Destiny-Ledger-v1/assets/ornate-frame.png" 
            alt=""
            className="w-full h-full"
            style={{ 
              objectFit: 'fill',
            }}
          />
        </div>

        {/* Content inside frame */}
        <div className="relative h-full flex" style={{ 
          padding: '60px 80px',  // Padding inside the frame
        }}>
          {/* Sidebar - only show on non-landing pages */}
          {!isLandingPage && <FantasySidebar />}
          
          {/* Main content */}
          <main className={`flex-1 overflow-y-auto ${!isLandingPage ? 'ml-8' : ''}`}>
            <div className={isLandingPage ? 'h-full flex items-center justify-center' : 'max-w-7xl mx-auto'}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}