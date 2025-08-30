import { useEffect } from 'react'
import { Panel, PanelHeader } from '../components/ui/panel'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Link, useNavigate } from 'react-router-dom'
import { useVaultStore, getFilteredBuilds } from '../stores/vaultStore'
import { useBuilderStore } from '../stores/builderStore'
import { formatDistanceToNow } from 'date-fns'
import { 
  Plus, 
  Search, 
  Filter, 
  User,
  Calendar,
  Copy,
  Trash2,
  Play,
  Download,
  Upload,
  FileJson
} from 'lucide-react'

export function BuildVault() {
  // Simplified approach - get stores separately and safely
  const vaultState = useVaultStore()
  const { loadBuild } = useBuilderStore()
  const navigate = useNavigate()
  
  if (!vaultState) {
    return (
      <div className="space-y-6">
        <Panel>
          <PanelHeader title="Build Vault" />
          <div className="text-center py-12">
            <p className="text-muted">Loading vault...</p>
          </div>
        </Panel>
      </div>
    )
  }
  
  const {
    searchQuery, 
    setSearchQuery, 
    deleteBuild, 
    duplicateBuild,
    setSortBy,
    sortBy,
    toggleSortOrder,
    sortOrder,
    exportBuilds,
    exportBuild,
    importBuilds,
    clearSampleBuilds,
    builds: rawBuilds = []
  } = vaultState
  
  // Apply filtering and sorting
  let builds = []
  try {
    builds = getFilteredBuilds(vaultState)
  } catch (error) {
    console.error('Error in getFilteredBuilds:', error)
    builds = Array.isArray(rawBuilds) ? rawBuilds : []
  }
  builds = Array.isArray(builds) ? builds : []

  // Clean up any remaining sample builds on component load
  useEffect(() => {
    clearSampleBuilds()
  }, [clearSampleBuilds])

  const handleLoadBuild = (buildId: string) => {
    const build = builds.find(b => b.id === buildId)
    if (build) {
      loadBuild(build)
      navigate('/builder')
    }
  }

  const getClassSummary = (build: any) => {
    const classCount = build.levelTimeline?.reduce((acc: any, entry: any) => {
      acc[entry.classId] = (acc[entry.classId] || 0) + 1
      return acc
    }, {}) || {}
    
    return Object.entries(classCount)
      .map(([classId, count]) => `${classId} ${count}`)
      .join(' / ')
  }

  const formatLastEdited = (date: Date | string) => {
    try {
      // Ensure we have a valid Date object
      const dateObj = date instanceof Date ? date : new Date(date)
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date:', date)
        return 'Unknown'
      }
      
      return formatDistanceToNow(dateObj, { addSuffix: true })
    } catch (error) {
      console.error('Date formatting error:', error, 'Date:', date)
      return 'Unknown'
    }
  }

  const handleExportAll = () => {
    if (builds.length === 0) {
      alert('No builds to export')
      return
    }
    
    const jsonData = exportBuilds()
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `destiny-ledger-builds-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportBuild = (buildId: string) => {
    const jsonData = exportBuild(buildId)
    if (!jsonData) {
      alert('Failed to export build')
      return
    }
    
    const build = builds.find(b => b.id === buildId)
    const filename = build ? `${build.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json` : 'build.json'
    
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string
            const result = importBuilds(content)
            if (result.success) {
              alert(`✓ ${result.message}`)
            } else {
              alert(`✗ ${result.message}`)
            }
          } catch (error) {
            alert('Failed to read file')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border rounded-md bg-transparent focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-border rounded-md bg-transparent focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
            >
              <option value="updatedAt">Last Modified</option>
              <option value="createdAt">Created Date</option>
              <option value="name">Name</option>
              <option value="level">Level</option>
            </select>
            <Button variant="outline" size="sm" onClick={toggleSortOrder}>
              <Filter className="w-4 h-4 mr-2" />
              {sortOrder === 'desc' ? '↓' : '↑'}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportAll} disabled={builds.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
            <Button asChild variant="accent">
              <Link to="/builder">
                <Plus className="w-4 h-4 mr-2" />
                New Build
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {builds && builds.length > 0 && builds.map((build) => (
            <Card key={build?.id || Math.random()} className="p-4 hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-0">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-accent" />
                    <span className="text-sm text-muted">Level {build?.currentLevel || 1}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-6 h-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (build?.id) handleLoadBuild(build.id)
                      }}
                      title="Load build"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-6 h-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (build?.id) duplicateBuild(build.id)
                      }}
                      title="Duplicate build"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-6 h-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (build?.id) handleExportBuild(build.id)
                      }}
                      title="Export build"
                    >
                      <FileJson className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-6 h-6 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (build?.id && build?.name && confirm(`Delete "${build.name}"? This cannot be undone.`)) {
                          deleteBuild(build.id)
                        }
                      }}
                      title="Delete build"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div onClick={() => build?.id && handleLoadBuild(build.id)}>
                  <h3 className="font-semibold mb-1">{build?.name || 'Unnamed Build'}</h3>
                  <p className="text-sm text-muted mb-3">
                    {getClassSummary(build) || `${build?.race || 'Unknown'} Character`}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Calendar className="w-3 h-3" />
                    Last edited {build?.updatedAt ? formatLastEdited(build.updatedAt) : 'Unknown'}
                  </div>
                </div>
              </CardContent>
            </Card>
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