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
      {/* Main framed area - moved to screen edges */}
      <div className="relative min-h-screen parchment-bg" style={{ margin: '4px 6px 6px 6px' }}>
        {/* Ornate frame around entire content area - thinner but positioned at edges */}
        <div className="absolute pointer-events-none z-40" 
             style={{
               top: '-15%',
               left: '-15%', 
               right: '-15%',
               bottom: '-15%'
             }}>
          <img 
            src="/The-Destiny-Ledger-v1/assets/ornate-frame.png" 
            alt=""
            className="w-full h-full"
            style={{ 
              objectFit: 'fill',
              transform: 'scale(0.75)',  // Make frame thinner
            }}
          />
        </div>

        {/* Content inside frame */}
        <div className="relative h-full flex flex-col" style={{ 
          padding: '50px 70px',  // Increased padding to center content better within scaled frame
        }}>
          {/* Title Bar - Inside frame at top */}
          <FantasyHeader currentPage={currentPage} isLandingPage={isLandingPage} />

          {/* Content area */}
          <div className="flex flex-1 mt-6">
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