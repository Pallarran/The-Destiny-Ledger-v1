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
    <div className="relative min-h-screen bg-bg">
      {/* Full-screen ornate frame - fixed positioning with proper aspect ratio */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <img 
          src="/The-Destiny-Ledger-v1/assets/ornate-frame.png" 
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{ 
            objectFit: 'contain',
            transform: 'scale(1.15)',  // Slightly scale up to ensure edges are covered
          }}
        />
      </div>

      {/* Safe zone container - accounts for frame thickness */}
      <div className="relative min-h-screen" style={{ 
        padding: '60px',  // Uniform padding to stay inside frame
        paddingTop: '40px',
        paddingBottom: '40px'
      }}>
        {/* Inner viewport with parchment background */}
        <div className="relative min-h-full bg-panel/95 rounded-lg shadow-2xl overflow-hidden"
             style={{ 
               backgroundImage: 'url(/The-Destiny-Ledger-v1/assets/parchment-texture.png)',
               backgroundSize: 'cover',
               backgroundBlendMode: 'multiply',
               minHeight: 'calc(100vh - 80px)'
             }}>
          
          {/* Fantasy Header */}
          <FantasyHeader title={currentTitle} />

          {/* Content area with sidebar */}
          <div className="flex" style={{ minHeight: 'calc(100vh - 160px)' }}>
            <FantasySidebar />
            
            {/* Main content */}
            <main className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}