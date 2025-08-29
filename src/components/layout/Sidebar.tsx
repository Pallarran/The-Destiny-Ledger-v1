import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { 
  Home, 
  Archive, 
  User, 
  BarChart3, 
  GitCompare, 
  TrendingUp,
  Settings
} from 'lucide-react'

const navigation = [
  { name: 'Landing', href: '/', icon: Home },
  { name: 'Build Vault', href: '/vault', icon: Archive },
  { name: 'Character Builder', href: '/builder', icon: User },
  { name: 'DPR Lab', href: '/dpr', icon: BarChart3 },
  { name: 'Compare Builds', href: '/compare', icon: GitCompare },
  { name: 'Level Path Explorer', href: '/explorer', icon: TrendingUp },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 bg-bg border-r border-border/20 min-h-[calc(100vh-80px)]">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-ink glow"
                  : "text-muted hover:text-panel hover:bg-panel/5"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}