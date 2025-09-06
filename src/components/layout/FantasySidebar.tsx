import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { 
  Archive, 
  User, 
  BarChart3, 
  GitCompare, 
  TrendingUp,
  Users,
  Scroll
} from 'lucide-react'

const navigation = [
  { name: 'Vault', href: '/vault', icon: Archive },
  { name: 'Character Builder', href: '/builder', icon: User },
  { name: 'DPR Lab', href: '/dpr', icon: BarChart3 },
  { name: 'Compare', href: '/compare', icon: GitCompare },
  { name: 'Level Path', href: '/explorer', icon: TrendingUp },
  { name: 'Party', href: '/party', icon: Users },
  { name: 'Homebrew', href: '/homebrew', icon: Scroll },
]

export function FantasySidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 flex-shrink-0">
      {/* Elegant Navigation Menu */}
      <nav className="space-y-2 pt-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-4 px-6 py-4 text-base font-serif transition-all duration-200 rounded-r-full",
                isActive
                  ? "bg-ink/15 text-accent font-bold border-r-4 border-gold shadow-lg transform translate-x-2"
                  : "text-ink/80 hover:text-ink hover:bg-ink/5 hover:translate-x-1"
              )}
            >
              <item.icon className={cn(
                "w-6 h-6",
                isActive ? "text-accent drop-shadow-sm" : "text-ink/70"
              )} />
              <span className="tracking-wide">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}