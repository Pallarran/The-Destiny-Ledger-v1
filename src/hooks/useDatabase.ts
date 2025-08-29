import { useEffect } from 'react'
import { db } from '../db/database'
import { useVaultStore } from '../stores/vaultStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useBuilderStore } from '../stores/builderStore'
import type { AppSettings } from '../stores/types'

// Hook to sync vault store with database
export function useVaultSync() {
  const loadBuilds = useVaultStore(state => state.loadBuilds)
  
  useEffect(() => {
    // Load builds from database on mount
    db.loadAllBuilds().then(builds => {
      loadBuilds(builds)
    }).catch(err => {
      console.error('Failed to load builds from database:', err)
    })
  }, [loadBuilds])
}

// Hook to sync settings store with database
export function useSettingsSync() {
  const loadSettings = useSettingsStore(state => state.loadSettings)
  const settings = useSettingsStore()
  
  useEffect(() => {
    // Load settings from database on mount
    db.loadSetting<AppSettings>('appSettings').then(savedSettings => {
      if (savedSettings) {
        loadSettings(savedSettings)
      }
    }).catch(err => {
      console.error('Failed to load settings from database:', err)
    })
  }, [loadSettings])
  
  useEffect(() => {
    // Save settings to database when they change
    const saveTimeout = setTimeout(() => {
      const { 
        roleWeights, 
        defaultAbilityMethod, 
        defaultPointBuyLimit,
        autoCalculateGWMSS,
        greedyResourceUse,
        theme,
        reducedMotion,
        showAdvancedTooltips
      } = settings
      
      const appSettings: AppSettings = {
        roleWeights,
        defaultAbilityMethod,
        defaultPointBuyLimit,
        autoCalculateGWMSS,
        greedyResourceUse,
        theme,
        reducedMotion,
        showAdvancedTooltips
      }
      
      db.saveSetting('appSettings', appSettings).catch(err => {
        console.error('Failed to save settings to database:', err)
      })
    }, 500) // Debounce saves
    
    return () => clearTimeout(saveTimeout)
  }, [settings])
}

// Hook to save current build to database
export function useSaveBuild() {
  const currentBuild = useBuilderStore(state => state.currentBuild)
  const isDirty = useBuilderStore(state => state.isDirty)
  const updateBuild = useVaultStore(state => state.updateBuild)
  const addBuild = useVaultStore(state => state.addBuild)
  
  const saveBuild = async () => {
    if (!currentBuild) return
    
    try {
      await db.saveBuild(currentBuild)
      
      // Check if build exists in vault
      const existingBuilds = useVaultStore.getState().builds
      const exists = existingBuilds.some(b => b.id === currentBuild.id)
      
      if (exists) {
        updateBuild(currentBuild.id, currentBuild)
      } else {
        addBuild(currentBuild)
      }
      
      // Mark as clean in builder store
      useBuilderStore.setState({ isDirty: false })
      
      return true
    } catch (err) {
      console.error('Failed to save build:', err)
      return false
    }
  }
  
  // Auto-save when build is dirty
  useEffect(() => {
    if (isDirty && currentBuild) {
      const saveTimeout = setTimeout(() => {
        saveBuild()
      }, 2000) // Auto-save after 2 seconds of no changes
      
      return () => clearTimeout(saveTimeout)
    }
  }, [isDirty, currentBuild])
  
  return { saveBuild, isDirty }
}

export function useDatabase() {
  const saveBuild = async (build: any) => {
    await db.saveBuild(build)
  }
  return { saveBuild }
}

// Hook to load a build from database
export function useLoadBuild(buildId: string | undefined) {
  const loadBuild = useBuilderStore(state => state.loadBuild)
  
  useEffect(() => {
    if (!buildId) return
    
    db.loadBuild(buildId).then(build => {
      if (build) {
        loadBuild(build)
      }
    }).catch(err => {
      console.error('Failed to load build:', err)
    })
  }, [buildId, loadBuild])
}

// Hook to delete a build
export function useDeleteBuild() {
  const deleteBuildFromVault = useVaultStore(state => state.deleteBuild)
  
  const deleteBuild = async (buildId: string) => {
    try {
      await db.deleteBuild(buildId)
      deleteBuildFromVault(buildId)
      return true
    } catch (err) {
      console.error('Failed to delete build:', err)
      return false
    }
  }
  
  return deleteBuild
}

// Hook to get storage usage
export function useStorageUsage() {
  const [usage, setUsage] = useState<{
    buildsCount: number
    settingsCount: number
    estimatedSize: number
  }>({ buildsCount: 0, settingsCount: 0, estimatedSize: 0 })
  
  useEffect(() => {
    db.getStorageUsage().then(setUsage).catch(err => {
      console.error('Failed to get storage usage:', err)
    })
  }, [])
  
  return usage
}

// Import useState since we need it
import { useState } from 'react'