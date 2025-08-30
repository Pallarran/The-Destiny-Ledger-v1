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
  
  // Tag management
  addTag: (buildId: string, tag: string) => void
  removeTag: (buildId: string, tag: string) => void
  setSelectedTags: (tags: string[]) => void
  toggleTag: (tag: string) => void
  getAllTags: () => string[]
  
  // Import/Export
  exportBuilds: () => string
  exportBuild: (id: string) => string | null
  importBuilds: (jsonData: string) => { success: boolean; message: string; imported?: number }
  importBuild: (jsonData: string) => { success: boolean; message: string }
}

// Storage key for localStorage persistence
const VAULT_STORAGE_KEY = 'destiny-ledger-vault'

// Sample builds to populate empty vault
const getSampleBuilds = (): BuildConfiguration[] => [
  {
    id: 'sample-gwm-fighter',
    name: 'Great Weapon Fighter',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    race: 'human_variant',
    abilityMethod: 'pointbuy',
    abilityScores: { STR: 16, DEX: 14, CON: 15, INT: 10, WIS: 13, CHA: 8 },
    pointBuyLimit: 27,
    levelTimeline: [
      { level: 1, classId: 'fighter', features: [], featId: 'great_weapon_master' },
      { level: 2, classId: 'fighter', features: [] },
      { level: 3, classId: 'fighter', features: [] },
      { level: 4, classId: 'fighter', features: [], asiOrFeat: 'asi' },
      { level: 5, classId: 'fighter', features: [] }
    ],
    currentLevel: 5,
    mainHandWeapon: 'greatsword',
    weaponEnhancements: [],
    activeBuffs: [],
    round0Buffs: [],
    tags: ['Fighter', 'DPS', 'Sample']
  },
  {
    id: 'sample-ss-ranger',
    name: 'Sharpshooter Ranger',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    race: 'human_variant', 
    abilityMethod: 'pointbuy',
    abilityScores: { STR: 8, DEX: 16, CON: 14, INT: 12, WIS: 15, CHA: 10 },
    pointBuyLimit: 27,
    levelTimeline: [
      { level: 1, classId: 'ranger', features: [], featId: 'sharpshooter' },
      { level: 2, classId: 'ranger', features: [] },
      { level: 3, classId: 'ranger', features: [] },
      { level: 4, classId: 'ranger', features: [], asiOrFeat: 'asi' }
    ],
    currentLevel: 4,
    mainHandWeapon: 'shortsword',
    rangedWeapon: 'longbow',
    weaponEnhancements: [],
    activeBuffs: ['hunters_mark'],
    round0Buffs: [],
    tags: ['Ranger', 'Archery', 'Sample'],
    notes: 'Focused on ranged damage with Hunter\'s Mark'
  }
]

// Load builds from localStorage
const loadBuildsFromStorage = (): BuildConfiguration[] => {
  try {
    const stored = localStorage.getItem(VAULT_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      const builds = parsed.builds?.map((build: any) => ({
        ...build,
        createdAt: build.createdAt ? new Date(build.createdAt) : new Date(),
        updatedAt: build.updatedAt ? new Date(build.updatedAt) : new Date()
      })) || []
      
      // Return stored builds if any exist
      if (builds.length > 0) {
        return builds
      }
    }
  } catch (error) {
    console.warn('Failed to load builds from localStorage:', error)
  }
  
  // Return sample builds if no stored builds exist
  return getSampleBuilds()
}

// Save builds to localStorage
const saveBuildsToStorage = (builds: BuildConfiguration[]) => {
  try {
    // Convert dates to ISO strings for JSON serialization
    const serializedBuilds = builds.map(build => ({
      ...build,
      createdAt: build.createdAt instanceof Date ? build.createdAt.toISOString() : build.createdAt,
      updatedAt: build.updatedAt instanceof Date ? build.updatedAt.toISOString() : build.updatedAt
    }))
    
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify({
      builds: serializedBuilds,
      lastSaved: new Date().toISOString()
    }))
  } catch (error) {
    console.warn('Failed to save builds to localStorage:', error)
  }
}

// Initialize store with builds from storage/samples
const initialBuilds = loadBuildsFromStorage()

// Save initial sample builds to localStorage if needed
if (initialBuilds.length > 0) {
  try {
    const stored = localStorage.getItem(VAULT_STORAGE_KEY)
    if (!stored) {
      saveBuildsToStorage(initialBuilds)
    }
  } catch (error) {
    console.warn('Failed to save initial builds:', error)
  }
}

export const useVaultStore = create<VaultStoreState>()(
  immer((set, get) => ({
    builds: initialBuilds,
    selectedBuildIds: [],
    searchQuery: '',
    selectedTags: [],
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    
    addBuild: (build) => {
      set((state) => {
        state.builds.push(build)
        saveBuildsToStorage(state.builds)
      })
    },
    
    updateBuild: (id, updates) => {
      set((state) => {
        const build = state.builds.find(b => b.id === id)
        if (build) {
          Object.assign(build, updates)
          build.updatedAt = new Date()
          saveBuildsToStorage(state.builds)
        }
      })
    },
    
    deleteBuild: (id) => {
      set((state) => {
        state.builds = state.builds.filter(b => b.id !== id)
        state.selectedBuildIds = state.selectedBuildIds.filter(bid => bid !== id)
        saveBuildsToStorage(state.builds)
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
          saveBuildsToStorage(state.builds)
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
        saveBuildsToStorage(state.builds)
      })
    },
    
    // Tag management
    addTag: (buildId, tag) => {
      set((state) => {
        const build = state.builds.find(b => b.id === buildId)
        if (build) {
          if (!build.tags) build.tags = []
          if (!build.tags.includes(tag)) {
            build.tags.push(tag)
            build.updatedAt = new Date()
            saveBuildsToStorage(state.builds)
          }
        }
      })
    },
    
    removeTag: (buildId, tag) => {
      set((state) => {
        const build = state.builds.find(b => b.id === buildId)
        if (build && build.tags) {
          build.tags = build.tags.filter(t => t !== tag)
          build.updatedAt = new Date()
          saveBuildsToStorage(state.builds)
        }
      })
    },
    
    setSelectedTags: (tags) => {
      set((state) => {
        state.selectedTags = tags
      })
    },
    
    toggleTag: (tag) => {
      set((state) => {
        if (state.selectedTags.includes(tag)) {
          state.selectedTags = state.selectedTags.filter(t => t !== tag)
        } else {
          state.selectedTags.push(tag)
        }
      })
    },
    
    getAllTags: () => {
      const { builds } = get()
      const allTags = new Set<string>()
      builds.forEach(build => {
        build.tags?.forEach(tag => allTags.add(tag))
      })
      return Array.from(allTags).sort()
    },
    
    // Import/Export
    exportBuilds: () => {
      const { builds } = get()
      return JSON.stringify({
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        buildCount: builds.length,
        builds: builds
      }, null, 2)
    },
    
    exportBuild: (id) => {
      const { builds } = get()
      const build = builds.find(b => b.id === id)
      if (!build) return null
      
      return JSON.stringify({
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        build: build
      }, null, 2)
    },
    
    importBuilds: (jsonData) => {
      try {
        const parsed = JSON.parse(jsonData)
        
        // Validate the data structure
        if (!parsed.builds || !Array.isArray(parsed.builds)) {
          return { success: false, message: 'Invalid file format: missing builds array' }
        }
        
        // Convert dates and validate each build
        const builds = parsed.builds.map((build: any) => ({
          ...build,
          createdAt: build.createdAt ? new Date(build.createdAt) : new Date(),
          updatedAt: build.updatedAt ? new Date(build.updatedAt) : new Date(),
          // Generate new IDs to avoid conflicts
          id: crypto.randomUUID()
        }))
        
        set((state) => {
          state.builds.push(...builds)
          saveBuildsToStorage(state.builds)
        })
        
        return { 
          success: true, 
          message: `Successfully imported ${builds.length} builds`, 
          imported: builds.length 
        }
      } catch (error) {
        return { 
          success: false, 
          message: `Failed to import builds: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }
      }
    },
    
    importBuild: (jsonData) => {
      try {
        const parsed = JSON.parse(jsonData)
        
        // Handle both single build and builds array format
        const buildData = parsed.build || parsed
        
        if (!buildData.id || !buildData.name) {
          return { success: false, message: 'Invalid build format: missing required fields' }
        }
        
        const build: BuildConfiguration = {
          ...buildData,
          createdAt: buildData.createdAt ? new Date(buildData.createdAt) : new Date(),
          updatedAt: buildData.updatedAt ? new Date(buildData.updatedAt) : new Date(),
          id: crypto.randomUUID() // Generate new ID to avoid conflicts
        }
        
        set((state) => {
          state.builds.push(build)
          saveBuildsToStorage(state.builds)
        })
        
        return { success: true, message: `Successfully imported build "${build.name}"` }
      } catch (error) {
        return { 
          success: false, 
          message: `Failed to import build: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }
      }
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
      build.notes?.toLowerCase().includes(query) ||
      build.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }
  
  // Apply tag filter
  if (state.selectedTags.length > 0) {
    filtered = filtered.filter(build =>
      state.selectedTags.every(selectedTag =>
        build.tags?.includes(selectedTag)
      )
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