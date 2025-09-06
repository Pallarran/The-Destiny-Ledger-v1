import { useState, useEffect, useCallback } from 'react'
import { homebrewStore, getIntegratedHomebrewContent } from '../engine/homebrewLoader'
import type {
  HomebrewClass,
  HomebrewSubclass,
  HomebrewFeat,
  HomebrewSpell,
  HomebrewMagicItem,
  HomebrewPack,
  ValidationResult
} from '../types/homebrew'

// Hook for managing homebrew content
export function useHomebrew() {
  const [homebrewContent, setHomebrewContent] = useState(() => getIntegratedHomebrewContent())
  const [isLoading, setIsLoading] = useState(false)

  // Update homebrew content when store changes
  useEffect(() => {
    const unsubscribe = homebrewStore.subscribe(() => {
      setHomebrewContent(getIntegratedHomebrewContent())
    })

    return unsubscribe
  }, [])

  // Add homebrew content
  const addClass = useCallback(async (homebrewClass: HomebrewClass): Promise<ValidationResult> => {
    setIsLoading(true)
    try {
      const result = homebrewStore.addClass(homebrewClass)
      return result
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addSubclass = useCallback(async (subclass: HomebrewSubclass): Promise<ValidationResult> => {
    setIsLoading(true)
    try {
      const result = homebrewStore.addSubclass(subclass)
      return result
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addFeat = useCallback(async (feat: HomebrewFeat): Promise<ValidationResult> => {
    setIsLoading(true)
    try {
      const result = homebrewStore.addFeat(feat)
      return result
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addSpell = useCallback(async (spell: HomebrewSpell): Promise<ValidationResult> => {
    setIsLoading(true)
    try {
      const result = homebrewStore.addSpell(spell)
      return result
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addMagicItem = useCallback(async (item: HomebrewMagicItem): Promise<ValidationResult> => {
    setIsLoading(true)
    try {
      const result = homebrewStore.addMagicItem(item)
      return result
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Remove homebrew content
  const removeClass = useCallback((id: string): boolean => {
    return homebrewStore.removeClass(id)
  }, [])

  const removeSubclass = useCallback((id: string): boolean => {
    return homebrewStore.removeSubclass(id)
  }, [])

  const removeFeat = useCallback((id: string): boolean => {
    return homebrewStore.removeFeat(id)
  }, [])

  const removeSpell = useCallback((id: string): boolean => {
    return homebrewStore.removeSpell(id)
  }, [])

  const removeMagicItem = useCallback((id: string): boolean => {
    return homebrewStore.removeMagicItem(id)
  }, [])

  // Pack management
  const addPack = useCallback((pack: HomebrewPack): void => {
    setIsLoading(true)
    try {
      homebrewStore.addPack(pack)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removePack = useCallback((name: string): boolean => {
    return homebrewStore.removePack(name)
  }, [])

  const getAllPacks = useCallback((): HomebrewPack[] => {
    return homebrewStore.getAllPacks()
  }, [])

  // Search and filtering
  const searchContent = useCallback((query: string) => {
    return homebrewStore.searchContent(query)
  }, [])

  const getContentByStatus = useCallback((status: 'draft' | 'testing' | 'published') => {
    return homebrewStore.getContentByStatus(status)
  }, [])

  // Export functionality
  const exportAllAsPack = useCallback((packInfo: {
    name: string
    version: string
    author: string
    description: string
  }): HomebrewPack => {
    return homebrewStore.exportAllAsPack(packInfo)
  }, [])

  // Clear all content
  const clearAll = useCallback((): void => {
    homebrewStore.clearAll()
  }, [])

  // Get statistics
  const getStats = useCallback(() => {
    return {
      classes: homebrewStore.getAllClasses().length,
      subclasses: homebrewStore.getAllSubclasses().length,
      feats: homebrewStore.getAllFeats().length,
      spells: homebrewStore.getAllSpells().length,
      magicItems: homebrewStore.getAllMagicItems().length,
      packs: homebrewStore.getAllPacks().length,
      total: homebrewStore.getAllClasses().length +
             homebrewStore.getAllSubclasses().length +
             homebrewStore.getAllFeats().length +
             homebrewStore.getAllSpells().length +
             homebrewStore.getAllMagicItems().length
    }
  }, [])

  return {
    // Content
    homebrewContent,
    isLoading,

    // Add content
    addClass,
    addSubclass,
    addFeat,
    addSpell,
    addMagicItem,

    // Remove content
    removeClass,
    removeSubclass,
    removeFeat,
    removeSpell,
    removeMagicItem,

    // Pack management
    addPack,
    removePack,
    getAllPacks,

    // Search and filtering
    searchContent,
    getContentByStatus,

    // Utilities
    exportAllAsPack,
    clearAll,
    getStats
  }
}

// Hook for getting raw homebrew content (not converted)
export function useRawHomebrew() {
  const [rawContent, setRawContent] = useState({
    classes: homebrewStore.getAllClasses(),
    subclasses: homebrewStore.getAllSubclasses(),
    feats: homebrewStore.getAllFeats(),
    spells: homebrewStore.getAllSpells(),
    magicItems: homebrewStore.getAllMagicItems(),
    packs: homebrewStore.getAllPacks()
  })

  useEffect(() => {
    const unsubscribe = homebrewStore.subscribe(() => {
      setRawContent({
        classes: homebrewStore.getAllClasses(),
        subclasses: homebrewStore.getAllSubclasses(),
        feats: homebrewStore.getAllFeats(),
        spells: homebrewStore.getAllSpells(),
        magicItems: homebrewStore.getAllMagicItems(),
        packs: homebrewStore.getAllPacks()
      })
    })

    return unsubscribe
  }, [])

  return rawContent
}

// Hook for specific homebrew content by ID
export function useHomebrewContent<T extends 'class' | 'subclass' | 'feat' | 'spell' | 'magicItem'>(
  type: T,
  id: string
): T extends 'class' ? HomebrewClass | undefined :
   T extends 'subclass' ? HomebrewSubclass | undefined :
   T extends 'feat' ? HomebrewFeat | undefined :
   T extends 'spell' ? HomebrewSpell | undefined :
   T extends 'magicItem' ? HomebrewMagicItem | undefined :
   never {
  
  const [content, setContent] = useState(() => {
    switch (type) {
      case 'class':
        return homebrewStore.getClass(id)
      case 'subclass':
        return homebrewStore.getSubclass(id)
      case 'feat':
        return homebrewStore.getFeat(id)
      case 'spell':
        return homebrewStore.getSpell(id)
      case 'magicItem':
        return homebrewStore.getMagicItem(id)
      default:
        return undefined
    }
  })

  useEffect(() => {
    const unsubscribe = homebrewStore.subscribe(() => {
      switch (type) {
        case 'class':
          setContent(homebrewStore.getClass(id))
          break
        case 'subclass':
          setContent(homebrewStore.getSubclass(id))
          break
        case 'feat':
          setContent(homebrewStore.getFeat(id))
          break
        case 'spell':
          setContent(homebrewStore.getSpell(id))
          break
        case 'magicItem':
          setContent(homebrewStore.getMagicItem(id))
          break
      }
    })

    return unsubscribe
  }, [type, id])

  return content as any
}

export default useHomebrew