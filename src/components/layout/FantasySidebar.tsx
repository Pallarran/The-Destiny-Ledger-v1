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
    <aside className="w-64 flex-shrink-0">
      {/* Elegant Navigation Menu */}
      <nav className="space-y-2">
        <h2 className="text-xl font-serif font-bold text-ink mb-6 text-center tracking-wider">
          NAVIGATION
        </h2>
        
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-4 px-6 py-4 text-base font-serif transition-all duration-200 rounded-r-full",
                isActive
                  ? "bg-ink/15 text-ink font-bold border-r-4 border-gold shadow-lg transform translate-x-2"
                  : "text-ink/80 hover:text-ink hover:bg-ink/5 hover:translate-x-1"
              )}
            >
              <item.icon className={cn(
                "w-6 h-6",
                isActive ? "text-gold drop-shadow-sm" : "text-ink/70"
              )} />
              <span className="tracking-wide">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}