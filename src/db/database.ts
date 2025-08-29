import Dexie, { type Table } from 'dexie'
import type { BuildConfiguration } from '../stores/types'

// Database version history
// v1: Initial schema
// v2: Add settings table

export interface PersistedBuild extends Omit<BuildConfiguration, 'createdAt' | 'updatedAt'> {
  // Convert Date objects to ISO strings for storage
  createdAt: string
  updatedAt: string
}

export interface PersistedSettings {
  id: string
  key: string
  value: any
  updatedAt: string
}

export class DestinyLedgerDB extends Dexie {
  builds!: Table<PersistedBuild>
  settings!: Table<PersistedSettings>
  
  constructor() {
    super('DestinyLedgerDB')
    
    this.version(1).stores({
      builds: 'id, name, currentLevel, createdAt, updatedAt',
      settings: 'id, key'
    })
  }
  
  // Helper methods
  async saveBuild(build: BuildConfiguration): Promise<void> {
    const persisted: PersistedBuild = {
      ...build,
      createdAt: build.createdAt instanceof Date ? build.createdAt.toISOString() : build.createdAt,
      updatedAt: build.updatedAt instanceof Date ? build.updatedAt.toISOString() : build.updatedAt
    }
    
    await this.builds.put(persisted)
  }
  
  async loadBuild(id: string): Promise<BuildConfiguration | undefined> {
    const persisted = await this.builds.get(id)
    if (!persisted) return undefined
    
    return {
      ...persisted,
      createdAt: new Date(persisted.createdAt),
      updatedAt: new Date(persisted.updatedAt)
    }
  }
  
  async loadAllBuilds(): Promise<BuildConfiguration[]> {
    const persisted = await this.builds.toArray()
    
    return persisted.map(build => ({
      ...build,
      createdAt: new Date(build.createdAt),
      updatedAt: new Date(build.updatedAt)
    }))
  }
  
  async deleteBuild(id: string): Promise<void> {
    await this.builds.delete(id)
  }
  
  async saveSetting(key: string, value: any): Promise<void> {
    await this.settings.put({
      id: key,
      key,
      value,
      updatedAt: new Date().toISOString()
    })
  }
  
  async loadSetting<T>(key: string): Promise<T | undefined> {
    const setting = await this.settings.get(key)
    return setting?.value as T | undefined
  }
  
  async deleteAllData(): Promise<void> {
    await this.transaction('rw', this.builds, this.settings, async () => {
      await this.builds.clear()
      await this.settings.clear()
    })
  }
  
  async getStorageUsage(): Promise<{ buildsCount: number; settingsCount: number; estimatedSize: number }> {
    const buildsCount = await this.builds.count()
    const settingsCount = await this.settings.count()
    
    // Estimate storage size (rough approximation)
    const builds = await this.builds.toArray()
    const estimatedSize = new Blob([JSON.stringify(builds)]).size
    
    return {
      buildsCount,
      settingsCount,
      estimatedSize
    }
  }
  
  async exportData(): Promise<string> {
    const builds = await this.loadAllBuilds()
    const settings: Record<string, any> = {}
    
    await this.settings.each(setting => {
      settings[setting.key] = setting.value
    })
    
    return JSON.stringify({
      version: 1,
      exportDate: new Date().toISOString(),
      builds,
      settings
    }, null, 2)
  }
  
  async importData(jsonData: string): Promise<{ buildsImported: number; settingsImported: number }> {
    const data = JSON.parse(jsonData)
    
    if (!data.version || !data.builds) {
      throw new Error('Invalid import data format')
    }
    
    let buildsImported = 0
    let settingsImported = 0
    
    // Import builds
    for (const build of data.builds) {
      await this.saveBuild(build)
      buildsImported++
    }
    
    // Import settings
    if (data.settings) {
      for (const [key, value] of Object.entries(data.settings)) {
        await this.saveSetting(key, value)
        settingsImported++
      }
    }
    
    return { buildsImported, settingsImported }
  }
}

// Create singleton instance
export const db = new DestinyLedgerDB()

// Initialize database on first load
if (typeof window !== 'undefined') {
  db.open().catch(err => {
    console.error('Failed to open database:', err)
  })
}