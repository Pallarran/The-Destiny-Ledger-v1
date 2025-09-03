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
    <div className="relative min-h-screen bg-bg">
      {/* Frame scaled down to appear thinner (zoomed out effect) */}
      <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
        <img 
          src="/The-Destiny-Ledger-v1/assets/ornate-frame.png" 
          alt=""
          className="w-full h-full"
          style={{ 
            objectFit: 'fill',
            transform: 'scale(0.8)',  // Zoom out effect to make frame appear thinner
          }}
        />
      </div>

      {/* Main content area with smaller margins for thinner frame border */}
      <div className="relative min-h-screen parchment-bg" style={{ margin: '30px 40px 30px 40px' }}>

        {/* Content inside frame - no top padding, title bar at frame edge */}
        <div className="relative h-full flex flex-col" style={{ 
          padding: '0px 20px 20px 20px',  // No top padding, title bar touches frame
        }}>
          {/* Title Bar - Inside frame at top */}
          <FantasyHeader currentPage={currentPage} isLandingPage={isLandingPage} />

          {/* Content area with spacing from title bar */}
          <div className="flex flex-1 mt-4" style={{ padding: '20px 0' }}>
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
    </div>
  )
}