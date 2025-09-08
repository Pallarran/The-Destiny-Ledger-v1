import React, { useState } from 'react'
import { BookOpen, Sparkles, Wand2, Zap, Info, X } from 'lucide-react'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { type BuilderLevelEntry } from '../../types/character'

interface MulticlassSpellSummaryProps {
  currentLevel: number
}

// Info bubble component for inline display
export const MulticlassSpellInfo: React.FC<MulticlassSpellSummaryProps> = ({ currentLevel }) => {
  const [showDetails, setShowDetails] = useState(false)
  const { currentBuild } = useCharacterBuilderStore()
  
  if (!currentBuild?.enhancedLevelTimeline) return null

  // Get all levels up to current level
  const relevantLevels = currentBuild.enhancedLevelTimeline.filter(
    (entry: BuilderLevelEntry) => entry.level <= currentLevel
  )

  // Categorize classes by caster type
  const casterTypes = {
    full: ['wizard', 'cleric', 'bard', 'sorcerer', 'druid'],
    half: ['paladin', 'ranger', 'artificer'],
    third: [], // Handled separately by subclass
    warlock: ['warlock']
  }

  // Count levels by caster type
  const casterLevels: Record<string, number> = {}
  const classDetails: Record<string, { levels: number; spells: string[]; type: string }> = {}

  relevantLevels.forEach((entry: BuilderLevelEntry) => {
    const classId = entry.classId
    
    // Initialize class tracking
    if (!classDetails[classId]) {
      classDetails[classId] = { levels: 0, spells: [], type: '' }
    }
    classDetails[classId].levels++
    classDetails[classId].spells.push(...(entry.spellChoices || []))

    // Determine caster type
    if (casterTypes.full.includes(classId)) {
      casterLevels.full = (casterLevels.full || 0) + 1
      classDetails[classId].type = 'Full Caster'
    } else if (casterTypes.half.includes(classId)) {
      casterLevels.half = (casterLevels.half || 0) + 1
      classDetails[classId].type = 'Half Caster'
    } else if (classId === 'fighter' && entry.subclassId === 'eldritch_knight') {
      casterLevels.third = (casterLevels.third || 0) + 1
      classDetails[classId].type = 'Third Caster (Eldritch Knight)'
    } else if (classId === 'rogue' && entry.subclassId === 'arcane_trickster') {
      casterLevels.third = (casterLevels.third || 0) + 1
      classDetails[classId].type = 'Third Caster (Arcane Trickster)'
    } else if (classId === 'warlock') {
      casterLevels.warlock = (casterLevels.warlock || 0) + 1
      classDetails[classId].type = 'Warlock (Pact Magic)'
    }
  })

  // Calculate multiclass caster level
  const multiclassCasterLevel = 
    (casterLevels.full || 0) + 
    Math.floor((casterLevels.half || 0) / 2) + 
    Math.floor((casterLevels.third || 0) / 3)

  // Check if this is actually a multiclass with casters
  const totalCasterClasses = Object.keys(classDetails).filter(
    classId => classDetails[classId].type.includes('Caster') || classId === 'warlock'
  ).length
  
  if (totalCasterClasses <= 1) return null

  return (
    <>
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors relative z-10"
        title="View multiclass spellcasting details"
      >
        <Info className="w-4 h-4" />
        <span className="text-sm font-medium">Multiclass Info</span>
      </button>
      
      {showDetails && (
        <>
          {/* Backdrop to catch clicks outside */}
          <div 
            className="fixed inset-0 z-[9998]" 
            onClick={() => setShowDetails(false)}
          />
          {/* Parchment Modal with fixed positioning */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 max-w-[90vw] max-h-[80vh] overflow-y-auto bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 text-amber-900 shadow-2xl shadow-amber-900/40 z-[9999] p-6 space-y-4 relative before:absolute before:inset-0 before:rounded-sm before:border-4 before:border-amber-800/60 before:pointer-events-none before:shadow-[inset_0_2px_4px_rgba(180,83,9,0.3),inset_0_-2px_4px_rgba(180,83,9,0.2)] after:absolute after:inset-0 after:rounded-sm after:pointer-events-none after:bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(180,83,9,0.05)_100%)] after:opacity-40 [box-shadow:0_0_0_1px_rgb(180_83_9_/_0.4),0_0_0_2px_rgb(217_119_6_/_0.3),0_0_0_3px_rgb(180_83_9_/_0.2),0_20px_25px_-5px_rgb(0_0_0_/_0.3),0_10px_10px_-5px_rgb(0_0_0_/_0.2)]">
          <div className="relative z-10 flex items-center justify-between mb-3 pb-3 border-b border-amber-800/30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-800" />
              <h3 className="font-bold text-amber-900 font-serif">Multiclass Spellcasting Summary</h3>
            </div>
            <button
              onClick={() => setShowDetails(false)}
              className="p-1 rounded-full bg-amber-200/80 hover:bg-amber-300/80 text-amber-800 hover:text-amber-900 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Spell Slot Information */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="w-4 h-4 text-purple-600" />
              <h4 className="font-medium text-gray-800">Spell Slots</h4>
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>Multiclass Caster Level:</strong> {multiclassCasterLevel}</p>
              <p className="text-xs mt-1">
                Calculated from: {casterLevels.full ? `${casterLevels.full} full caster levels` : ''}
                {casterLevels.half ? ` + ${Math.floor(casterLevels.half / 2)} from ${casterLevels.half} half caster levels` : ''}
                {casterLevels.third ? ` + ${Math.floor(casterLevels.third / 3)} from ${casterLevels.third} third caster levels` : ''}
              </p>
              {casterLevels.warlock && (
                <p className="text-xs mt-1 text-orange-600">
                  <Zap className="w-3 h-3 inline mr-1" />
                  Warlock pact magic slots are separate and don't combine with other spell slots
                </p>
              )}
            </div>
          </div>

          {/* Class Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-gray-800">Spells by Class</h4>
            </div>
            {Object.entries(classDetails).map(([classId, details]) => {
              if (!details.type.includes('Caster') && classId !== 'warlock') return null
              
              const cantrips = details.spells.filter(spellId => 
                spellId.includes('cantrip') || 
                ['fire_bolt', 'ray_of_frost', 'mage_hand', 'minor_illusion', 'prestidigitation', 'guidance', 'sacred_flame'].includes(spellId)
              )
              const leveledSpells = details.spells.filter(spellId => !cantrips.includes(spellId))
              
              return (
                <div key={classId} className="bg-gray-50 rounded p-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-900 capitalize">{classId}</span>
                      <span className="text-xs text-gray-500 ml-2">({details.type})</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Level {details.levels}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {cantrips.length > 0 && <span>{cantrips.length} cantrips</span>}
                    {cantrips.length > 0 && leveledSpells.length > 0 && <span>, </span>}
                    {leveledSpells.length > 0 && (
                      <span>
                        {leveledSpells.length} spell{leveledSpells.length === 1 ? '' : 's'}
                        {classId === 'wizard' ? ' in spellbook' : 
                         ['artificer', 'cleric', 'druid', 'paladin'].includes(classId) ? ' (can prepare any from class list)' : 
                         ' known'}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Important Notes */}
          <div className="text-xs text-gray-600 border-t border-gray-200 pt-2">
            <p><strong>Note:</strong> Spell slots come from your combined caster level, but spells known/prepared are determined by individual class levels.</p>
            {classDetails.wizard && (
              <p className="mt-1"><strong>Wizard:</strong> Use spell preparation section to choose which spells from your spellbook to prepare daily.</p>
            )}
          </div>
        </div>
        </>
      )}
    </>
  )
}

// Keep original component for backward compatibility
export const MulticlassSpellSummary: React.FC<MulticlassSpellSummaryProps> = ({ currentLevel }) => {
  const { currentBuild } = useCharacterBuilderStore()
  
  if (!currentBuild?.enhancedLevelTimeline) return null

  // Get all levels up to current level
  const relevantLevels = currentBuild.enhancedLevelTimeline.filter(
    (entry: BuilderLevelEntry) => entry.level <= currentLevel
  )

  // Categorize classes by caster type
  const casterTypes = {
    full: ['wizard', 'cleric', 'bard', 'sorcerer', 'druid'],
    half: ['paladin', 'ranger', 'artificer'],
    third: [], // Handled separately by subclass
    warlock: ['warlock']
  }

  // Count levels by caster type
  const casterLevels: Record<string, number> = {}
  const classDetails: Record<string, { levels: number; spells: string[]; type: string }> = {}

  relevantLevels.forEach((entry: BuilderLevelEntry) => {
    const classId = entry.classId
    
    // Initialize class tracking
    if (!classDetails[classId]) {
      classDetails[classId] = { levels: 0, spells: [], type: '' }
    }
    classDetails[classId].levels++
    classDetails[classId].spells.push(...(entry.spellChoices || []))

    // Determine caster type
    if (casterTypes.full.includes(classId)) {
      casterLevels.full = (casterLevels.full || 0) + 1
      classDetails[classId].type = 'Full Caster'
    } else if (casterTypes.half.includes(classId)) {
      casterLevels.half = (casterLevels.half || 0) + 1
      classDetails[classId].type = 'Half Caster'
    } else if (classId === 'fighter' && entry.subclassId === 'eldritch_knight') {
      casterLevels.third = (casterLevels.third || 0) + 1
      classDetails[classId].type = 'Third Caster (Eldritch Knight)'
    } else if (classId === 'rogue' && entry.subclassId === 'arcane_trickster') {
      casterLevels.third = (casterLevels.third || 0) + 1
      classDetails[classId].type = 'Third Caster (Arcane Trickster)'
    } else if (classId === 'warlock') {
      casterLevels.warlock = (casterLevels.warlock || 0) + 1
      classDetails[classId].type = 'Warlock (Pact Magic)'
    }
  })

  // Check if this is actually a multiclass with casters
  const totalCasterClasses = Object.keys(classDetails).filter(
    classId => classDetails[classId].type.includes('Caster') || classId === 'warlock'
  ).length
  
  if (totalCasterClasses <= 1) return null

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">Multiclass Spellcasting Summary</h3>
      </div>

      {/* Spell Slot Information */}
      <div className="bg-white rounded-lg p-3 border border-purple-100">
        <div className="flex items-center gap-2 mb-2">
          <Wand2 className="w-4 h-4 text-purple-600" />
          <h4 className="font-medium text-gray-800">Spell Slots</h4>
        </div>
        <div className="text-sm text-gray-600">
          <p><strong>Multiclass Caster Level:</strong> {casterLevels.full ? `${casterLevels.full} full caster levels` : ''}</p>
          <p className="text-xs mt-1">
            Calculated from: {casterLevels.full ? `${casterLevels.full} full caster levels` : ''}
            {casterLevels.half ? ` + ${Math.floor(casterLevels.half / 2)} from ${casterLevels.half} half caster levels` : ''}
            {casterLevels.third ? ` + ${Math.floor(casterLevels.third / 3)} from ${casterLevels.third} third caster levels` : ''}
          </p>
          {casterLevels.warlock && (
            <p className="text-xs mt-1 text-orange-600">
              <Zap className="w-3 h-3 inline mr-1" />
              Warlock pact magic slots are separate and don't combine with other spell slots
            </p>
          )}
        </div>
      </div>

      {/* Class Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <h4 className="font-medium text-gray-800">Spells by Class</h4>
        </div>
        {Object.entries(classDetails).map(([classId, details]) => {
          if (!details.type.includes('Caster') && classId !== 'warlock') return null
          
          const cantrips = details.spells.filter(spellId => 
            spellId.includes('cantrip') || 
            ['fire_bolt', 'ray_of_frost', 'mage_hand', 'minor_illusion', 'prestidigitation', 'guidance', 'sacred_flame'].includes(spellId)
          )
          const leveledSpells = details.spells.filter(spellId => !cantrips.includes(spellId))
          
          return (
            <div key={classId} className="bg-white rounded p-2 border border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-900 capitalize">{classId}</span>
                  <span className="text-xs text-gray-500 ml-2">({details.type})</span>
                </div>
                <div className="text-sm text-gray-600">
                  Level {details.levels}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {cantrips.length > 0 && <span>{cantrips.length} cantrips</span>}
                {cantrips.length > 0 && leveledSpells.length > 0 && <span>, </span>}
                {leveledSpells.length > 0 && (
                  <span>
                    {leveledSpells.length} spell{leveledSpells.length === 1 ? '' : 's'}
                    {classId === 'wizard' ? ' in spellbook' : 
                     ['artificer', 'cleric', 'druid', 'paladin'].includes(classId) ? ' (can prepare any from class list)' : 
                     ' known'}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Important Notes */}
      <div className="text-xs text-gray-600 border-t border-purple-100 pt-2">
        <p><strong>Note:</strong> Spell slots come from your combined caster level, but spells known/prepared are determined by individual class levels.</p>
        {classDetails.wizard && (
          <p className="mt-1"><strong>Wizard:</strong> Use spell preparation section to choose which spells from your spellbook to prepare daily.</p>
        )}
      </div>
    </div>
  )
}