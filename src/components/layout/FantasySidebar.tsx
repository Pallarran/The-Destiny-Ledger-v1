import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { 
  Archive, 
  User, 
  BarChart3, 
  GitCompare, 
  TrendingUp,
  Users
} from 'lucide-react'

const navigation = [
  { name: 'Character Builder', href: '/builder', icon: User },
  { name: 'Vault', href: '/vault', icon: Archive },
  { name: 'DPR Lab', href: '/dpr', icon: BarChart3 },
  { name: 'Compare', href: '/compare', icon: GitCompare },
  { name: 'Level Path', href: '/explorer', icon: TrendingUp },
  { name: 'Party', href: '/party', icon: Users },
]

export function FantasySidebar() {
  const location = useLocation()

  return (
    <aside className="relative z-30 w-56 flex-shrink-0 border-r-2 border-gold/30">
      {/* Parchment scroll background */}
      <div className="h-full bg-panel/50" 
           style={{ 
             backgroundImage: 'url(/The-Destiny-Ledger-v1/assets/parchment-texture.png)',
             backgroundSize: 'cover',
             backgroundBlendMode: 'multiply',
             backgroundOpacity: 0.8
           }}>
        {/* Decorative top curl */}
        <div className="h-2 bg-gradient-to-b from-gold/30 to-transparent" />
        
        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <h2 className="text-lg font-serif font-bold text-ink mb-4 text-center border-b border-gold/30 pb-2">
            NAVIGATION
          </h2>
          
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200",
                  "border border-transparent",
                  isActive
                    ? "bg-gold/20 text-ink border-gold/50 shadow-md font-semibold"
                    : "text-ink/70 hover:text-ink hover:bg-gold/10 hover:border-gold/30"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5",
                  isActive && "text-gold drop-shadow"
                )} />
                <span className="font-serif">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Decorative bottom curl */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-gold/30 to-transparent" />
      </div>
    </aside>
  )
}