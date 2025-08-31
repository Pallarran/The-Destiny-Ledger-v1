import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { AppSettings } from './types'

interface SettingsState extends AppSettings {
  // Actions
  updateRoleWeight: (role: keyof AppSettings['roleWeights'], weight: number) => void
  updateDefaultAbilityMethod: (method: AppSettings['defaultAbilityMethod']) => void
  updateDefaultPointBuyLimit: (limit: number) => void
  toggleAutoCalculateGWMSS: () => void
  toggleGreedyResourceUse: () => void
  setTheme: (theme: AppSettings['theme']) => void
  toggleReducedMotion: () => void
  toggleAdvancedTooltips: () => void
  resetToDefaults: () => void
  loadSettings: (settings: AppSettings) => void
}

const defaultSettings: AppSettings = {
  roleWeights: {
    social: 1.0,
    control: 1.0,
    exploration: 1.0,
    defense: 1.0,
    support: 1.0,
    mobility: 1.0
  },
  defaultAbilityMethod: 'pointbuy',
  defaultPointBuyLimit: 27,
  autoCalculateGWMSS: true,
  greedyResourceUse: true,
  theme: 'modern-fantasy',
  reducedMotion: false,
  showAdvancedTooltips: true
}

export const useSettingsStore = create<SettingsState>()(
  immer((set) => ({
    ...defaultSettings,
    
    updateRoleWeight: (role, weight) => {
      set((state) => {
        state.roleWeights[role] = Math.max(0, Math.min(2, weight))
      })
    },
    
    updateDefaultAbilityMethod: (method) => {
      set((state) => {
        state.defaultAbilityMethod = method
      })
    },
    
    updateDefaultPointBuyLimit: (limit) => {
      set((state) => {
        state.defaultPointBuyLimit = Math.max(20, Math.min(40, limit))
      })
    },
    
    toggleAutoCalculateGWMSS: () => {
      set((state) => {
        state.autoCalculateGWMSS = !state.autoCalculateGWMSS
      })
    },
    
    toggleGreedyResourceUse: () => {
      set((state) => {
        state.greedyResourceUse = !state.greedyResourceUse
      })
    },
    
    setTheme: (theme) => {
      set((state) => {
        state.theme = theme
        // Apply theme to document root
        document.documentElement.setAttribute('data-theme', theme)
      })
    },
    
    toggleReducedMotion: () => {
      set((state) => {
        state.reducedMotion = !state.reducedMotion
        // Apply to document root
        document.documentElement.classList.toggle('reduce-motion', !state.reducedMotion)
      })
    },
    
    toggleAdvancedTooltips: () => {
      set((state) => {
        state.showAdvancedTooltips = !state.showAdvancedTooltips
      })
    },
    
    resetToDefaults: () => {
      set((state) => {
        Object.assign(state, defaultSettings)
        document.documentElement.setAttribute('data-theme', defaultSettings.theme)
        document.documentElement.classList.remove('reduce-motion')
      })
    },
    
    loadSettings: (settings) => {
      set((state) => {
        Object.assign(state, settings)
        document.documentElement.setAttribute('data-theme', settings.theme)
        document.documentElement.classList.toggle('reduce-motion', settings.reducedMotion)
      })
    }
  }))
)

// Initialize settings from localStorage on first load
if (typeof window !== 'undefined') {
  try {
    const storedSettings = localStorage.getItem('destinyLedgerSettings')
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings) as AppSettings
      console.log('Loading settings from localStorage:', parsedSettings)
      // Apply settings to the store
      useSettingsStore.setState(parsedSettings)
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', parsedSettings.theme)
      // Apply reduced motion if needed
      if (parsedSettings.reducedMotion) {
        document.documentElement.classList.add('reduce-motion')
      }
    } else {
      console.log('No stored settings found, using defaults:', defaultSettings)
      // If no stored settings, save defaults
      localStorage.setItem('destinyLedgerSettings', JSON.stringify(defaultSettings))
      document.documentElement.setAttribute('data-theme', defaultSettings.theme)
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error)
    // Fall back to defaults
    document.documentElement.setAttribute('data-theme', defaultSettings.theme)
  }
}