import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { BuildConfiguration, VaultState } from './types'

interface VaultStoreState extends VaultState {
  // Actions
  addBuild: (build: BuildConfiguration) => void
  updateBuild: (id: string, updates: Partial<BuildConfiguration>) => void
  deleteBuild: (id: string) => void
  duplicateBuild: (id: string) => void
  selectBuild: (id: string) => void
  deselectBuild: (id: string) => void
  clearSelection: () => void
  setSearchQuery: (query: string) => void
  setSortBy: (sortBy: VaultState['sortBy']) => void
  toggleSortOrder: () => void
  loadBuilds: (builds: BuildConfiguration[]) => void
}

export const useVaultStore = create<VaultStoreState>()(
  immer((set, _get) => ({
    builds: [],
    selectedBuildIds: [],
    searchQuery: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    
    addBuild: (build) => {
      set((state) => {
        state.builds.push(build)
      })
    },
    
    updateBuild: (id, updates) => {
      set((state) => {
        const build = state.builds.find(b => b.id === id)
        if (build) {
          Object.assign(build, updates)
          build.updatedAt = new Date()
        }
      })
    },
    
    deleteBuild: (id) => {
      set((state) => {
        state.builds = state.builds.filter(b => b.id !== id)
        state.selectedBuildIds = state.selectedBuildIds.filter(bid => bid !== id)
      })
    },
    
    duplicateBuild: (id) => {
      set((state) => {
        const build = state.builds.find(b => b.id === id)
        if (build) {
          const duplicate: BuildConfiguration = {
            ...build,
            id: crypto.randomUUID(),
            name: `${build.name} (Copy)`,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          state.builds.push(duplicate)
        }
      })
    },
    
    selectBuild: (id) => {
      set((state) => {
        if (!state.selectedBuildIds.includes(id)) {
          state.selectedBuildIds.push(id)
        }
      })
    },
    
    deselectBuild: (id) => {
      set((state) => {
        state.selectedBuildIds = state.selectedBuildIds.filter(bid => bid !== id)
      })
    },
    
    clearSelection: () => {
      set((state) => {
        state.selectedBuildIds = []
      })
    },
    
    setSearchQuery: (query) => {
      set((state) => {
        state.searchQuery = query
      })
    },
    
    setSortBy: (sortBy) => {
      set((state) => {
        state.sortBy = sortBy
      })
    },
    
    toggleSortOrder: () => {
      set((state) => {
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc'
      })
    },
    
    loadBuilds: (builds) => {
      set((state) => {
        state.builds = builds
      })
    }
  }))
)

// Helper functions for filtering and sorting
export const getFilteredBuilds = (state: VaultStoreState): BuildConfiguration[] => {
  let filtered = [...state.builds]
  
  // Apply search filter
  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase()
    filtered = filtered.filter(build => 
      build.name.toLowerCase().includes(query) ||
      build.notes?.toLowerCase().includes(query)
    )
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    let comparison = 0
    
    switch (state.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'level':
        comparison = a.currentLevel - b.currentLevel
        break
      case 'createdAt':
        comparison = a.createdAt.getTime() - b.createdAt.getTime()
        break
      case 'updatedAt':
        comparison = a.updatedAt.getTime() - b.updatedAt.getTime()
        break
    }
    
    return state.sortOrder === 'asc' ? comparison : -comparison
  })
  
  return filtered
}