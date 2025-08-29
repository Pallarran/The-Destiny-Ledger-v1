import { Panel, PanelHeader } from '../components/ui/panel'
import { Button } from '../components/ui/button'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  User,
  Calendar,
  Star
} from 'lucide-react'

export function BuildVault() {
  // Placeholder data - will be replaced with actual state management
  const builds = [
    {
      id: '1',
      name: 'Sir Kaelen (Battle Master)',
      classes: 'Fighter 6 / Rogue 3',
      level: 9,
      lastEdited: '2 hours ago',
      favorite: true
    },
    {
      id: '2', 
      name: 'Lyra (Gloom Stalker)',
      classes: 'Ranger 11',
      level: 11,
      lastEdited: '1 day ago',
      favorite: false
    },
    {
      id: '3',
      name: 'Bartholomew (Life Cleric)', 
      classes: 'Cleric 8',
      level: 8,
      lastEdited: '3 days ago',
      favorite: true
    }
  ]

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHeader title="Build Vault" />
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search builds..."
                className="pl-10 pr-4 py-2 border border-border rounded-md bg-transparent focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          
          <Button asChild variant="accent">
            <Link to="/builder">
              <Plus className="w-4 h-4 mr-2" />
              New Build
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {builds.map((build) => (
            <Panel key={build.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-accent" />
                  <span className="text-sm text-muted">Level {build.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  {build.favorite && (
                    <Star className="w-4 h-4 text-gold fill-current" />
                  )}
                  <Button variant="ghost" size="icon" className="w-6 h-6">
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <h3 className="font-semibold mb-1">{build.name}</h3>
              <p className="text-sm text-muted mb-3">{build.classes}</p>
              
              <div className="flex items-center gap-2 text-xs text-muted">
                <Calendar className="w-3 h-3" />
                Last edited {build.lastEdited}
              </div>
            </Panel>
          ))}
        </div>

        {builds.length === 0 && (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No builds yet</h3>
            <p className="text-muted mb-4">
              Create your first character build to get started with optimization
            </p>
            <Button asChild variant="accent">
              <Link to="/builder">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Build
              </Link>
            </Button>
          </div>
        )}
      </Panel>
    </div>
  )
}