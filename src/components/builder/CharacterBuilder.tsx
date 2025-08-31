import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Panel } from '../ui/panel'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Tabs, TabsList, TabsContent, TabsTrigger } from '../ui/tabs'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { useVaultStore } from '../../stores/vaultStore'
import { useBuilderStore } from '../../stores/builderStore'
import { BUILDER_STEPS } from '../../types/character'
import { buffs } from '../../rules/srd/buffs'
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle,
  Dices,
  Zap,
  Sword,
  FileText,
  Users
} from 'lucide-react'
import { getClass } from '../../rules/loaders'
import { subclasses } from '../../rules/srd/subclasses'
import { feats } from '../../rules/srd/feats'
import { getAttunementStatus } from '../../rules/attunement'

// Step components
import { AbilityScoreAssignment } from './AbilityScoreAssignment'
import { RaceBackgroundSelection } from './RaceBackgroundSelection' 
import { EnhancedLevelTimeline } from './EnhancedLevelTimeline'
import { EquipmentSelection } from './EquipmentSelection'
import MagicItemSelection from './MagicItemSelection'
import { BuffSelection } from './BuffSelection'
import { BuildSummary } from './BuildSummary'

const STEP_ICONS = {
  'ability-scores': Dices,
  'race-background': Users,
  'class-progression': Zap,
  'equipment': Sword,
  'summary': FileText
}

const STEP_LABELS = {
  'ability-scores': 'Ability Scores',
  'race-background': 'Race & Background',
  'class-progression': 'Class Progression',
  'equipment': 'Equipment',
  'summary': 'Summary'
}

export function CharacterBuilder() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const navigate = useNavigate()
  const { addBuild, updateBuild: updateVaultBuild, builds } = useVaultStore()
  const { loadFromBuildConfiguration } = useCharacterBuilderStore()
  const { currentBuild: storedBuild } = useBuilderStore()
  
  // Note: buildId is for potential future use for direct build URLs
  
  const {
    currentBuild,
    isDirty,
    currentStep,
    canProceed,
    canGoBack,
    stepValidation,
    globalErrors,
    createNewBuild,
    exportToBuildConfiguration,
    goToStep,
    nextStep,
    previousStep,
    validateCurrentStep,
    validateAllSteps,
    resetBuild,
    clearDirty,
    updateBuild
  } = useCharacterBuilderStore()

  // Build info state
  const [buildName, setBuildName] = useState(currentBuild?.name || '')
  const [buildNotes, setBuildNotes] = useState(currentBuild?.notes || '')
  
  useEffect(() => {
    const isNew = searchParams.get('new') === 'true'
    console.log('CharacterBuilder useEffect - currentBuild:', currentBuild?.name, 'storedBuild:', storedBuild?.name, 'isNew:', isNew)
    
    // If explicitly requesting a new build (from vault New Build button)
    if (isNew && !currentBuild) {
      console.log('Creating fresh new build - explicit request')
      createNewBuild()
      return
    }
    
    // If we have a stored build (from vault or previous session), load it
    if (storedBuild && !currentBuild) {
      console.log('Loading stored build:', storedBuild.name)
      loadFromBuildConfiguration(storedBuild)
      return
    }
    
    // If we have neither, create a new build
    if (!currentBuild && !storedBuild) {
      console.log('No existing build found - creating new build')
      createNewBuild()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBuild, storedBuild, searchParams])

  // Update build info state when current build changes
  useEffect(() => {
    if (currentBuild) {
      setBuildName(currentBuild.name || '')
      setBuildNotes(currentBuild.notes || '')
    }
  }, [currentBuild?.name, currentBuild?.notes])
  
  const handleStepChange = (step: string) => {
    goToStep(step as any)
  }

  const handleNameChange = (name: string) => {
    setBuildName(name)
    updateBuild({ name })
  }

  const handleNotesChange = (notes: string) => {
    setBuildNotes(notes)
    updateBuild({ notes })
  }
  
  const handleNextStep = () => {
    if (validateCurrentStep()) {
      nextStep()
    }
  }
  
  const handlePreviousStep = () => {
    previousStep()
  }
  
  const handleSave = async () => {
    if (!currentBuild) return
    
    const isValid = validateAllSteps()
    if (!isValid) {
      console.warn('Build has validation errors but saving anyway')
    }
    
    const buildConfig = exportToBuildConfiguration()
    if (buildConfig) {
      // Check if this build already exists in the vault
      const existingBuild = builds.find(b => b.id === buildConfig.id)
      
      if (existingBuild) {
        // Update existing build
        console.log('Updating existing build:', buildConfig.name)
        updateVaultBuild(buildConfig.id, buildConfig)
      } else {
        // Add new build
        console.log('Adding new build:', buildConfig.name)
        addBuild(buildConfig)
      }
      
      clearDirty()
      navigate('/vault')
    }
  }
  
  const handleReset = () => {
    if (confirm('Are you sure you want to reset this build? All progress will be lost.')) {
      resetBuild()
      createNewBuild()
    }
  }
  
  const getStepProgress = () => {
    const completedSteps = BUILDER_STEPS.filter(step => stepValidation[step]).length
    return (completedSteps / BUILDER_STEPS.length) * 100
  }

  // Validation logic for top box
  const getValidationStatus = () => {
    if (!currentBuild) return { isValid: false, issues: [] }
    
    const issues = []
    if (!currentBuild.race) issues.push('Race not selected')
    if (!(currentBuild.enhancedLevelTimeline || []).length) issues.push('No class levels defined')
    if (!buildName.trim()) issues.push('Build name required')
    
    // Check for concentration conflicts
    const activeBuffs = currentBuild.activeBuffs || []
    const round0Buffs = currentBuild.round0Buffs || []
    
    const activeConcentrationBuffs = (activeBuffs || [])
      .map((id: string) => buffs[id])
      .filter((buff: any) => buff?.concentration)
    
    const round0ConcentrationBuffs = (round0Buffs || [])
      .map((id: string) => buffs[id])
      .filter((buff: any) => buff?.concentration)
    
    if (activeConcentrationBuffs.length > 1) {
      issues.push(`Multiple concentration spells in combat (${activeConcentrationBuffs.map((b: any) => b.name).join(', ')})`)
    }
    
    if (round0ConcentrationBuffs.length > 1) {
      issues.push(`Multiple concentration spells in round 0 (${round0ConcentrationBuffs.map((b: any) => b.name).join(', ')})`)
    }
    
    if (activeConcentrationBuffs.length > 0 && round0ConcentrationBuffs.length > 0) {
      issues.push('Round 0 concentration conflicts with combat concentration')
    }
    
    // Check for attunement limit violations
    const attunementStatus = getAttunementStatus(currentBuild as any)
    if (attunementStatus.hasOverlimit) {
      issues.push(attunementStatus.warning || 'Too many attuned magic items')
    }
    
    const isValid = validateAllSteps() && issues.length === 0
    return { isValid, issues }
  }
  
  // Show loading state instead of early return to avoid hooks issues
  if (!currentBuild) {
    return (
      <div className="space-y-6">
        <Panel className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted">Loading character builder...</p>
          </div>
        </Panel>
      </div>
    )
  }

  const { isValid, issues } = getValidationStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Panel>
        {/* Top Section: Build Info and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Build Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buildName">Build Name *</Label>
                <Input
                  id="buildName"
                  value={buildName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter build name"
                />
              </div>
              <div>
                <Label htmlFor="buildNotes">Notes (Optional)</Label>
                <Input
                  id="buildNotes"
                  value={buildNotes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Build notes or description"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 lg:items-end">
            <div className="flex items-center gap-2">
              {isDirty && (
                <Badge variant="secondary" className="bg-orange/10 text-orange border-orange/20">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Unsaved Changes
                </Badge>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-destructive hover:bg-destructive/5"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              
              <Button
                variant="accent"
                size="sm"
                onClick={handleSave}
                disabled={!currentBuild}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Build
              </Button>
            </div>

            {/* Condensed Progress */}
            <div className="text-right">
              <div className="flex items-center gap-2 text-xs text-muted mb-1">
                <span>Step {BUILDER_STEPS.indexOf(currentStep) + 1} of {BUILDER_STEPS.length}: {STEP_LABELS[currentStep]}</span>
                <span>•</span>
                <span>{Math.round(getStepProgress())}% Complete</span>
              </div>
              <Progress value={getStepProgress()} className="h-1 w-48" />
            </div>
          </div>
        </div>

        {/* Horizontal Steps Navigation & Build Status */}
        <div className="border-t border-border/20 pt-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Step Navigation */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {BUILDER_STEPS.map((step, index) => {
                const Icon = STEP_ICONS[step]
                const isActive = step === currentStep
                const isCompleted = stepValidation[step]
                const isPrevious = index < BUILDER_STEPS.indexOf(currentStep)
                
                return (
                  <button
                    key={step}
                    onClick={() => handleStepChange(step)}
                    disabled={!isPrevious && !isActive && !isCompleted}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-accent/10 text-accent border border-accent/20' 
                        : isCompleted 
                        ? 'bg-emerald/5 text-emerald hover:bg-emerald/10' 
                        : 'text-muted hover:bg-panel/5 hover:text-panel'
                    } ${
                      !isPrevious && !isActive && !isCompleted 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-current/10">
                      {isCompleted ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <Icon className="w-3 h-3" />
                      )}
                    </div>
                    <span className="hidden sm:inline">{STEP_LABELS[step]}</span>
                  </button>
                )
              })}
            </div>

            {/* Build Status */}
            <div className="flex-shrink-0 lg:max-w-sm">
              {(issues.length > 0 || isValid || globalErrors.length > 0) && (
                <div>
                  {issues.length > 0 && (
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-2">
                      <div className="flex items-center gap-2 text-destructive text-xs font-medium mb-1">
                        <AlertTriangle className="w-3 h-3" />
                        Issues to Address
                      </div>
                      <ul className="text-xs text-destructive space-y-1">
                        {issues.map((issue, index) => (
                          <li key={index} className="ml-3">• {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {isValid && issues.length === 0 && globalErrors.length === 0 && (
                    <div className="bg-emerald/5 border border-emerald/20 rounded-lg p-2">
                      <div className="flex items-center gap-2 text-emerald text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Build is valid and ready to save!
                      </div>
                    </div>
                  )}

                  {globalErrors.length > 0 && (
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-2">
                      <div className="flex items-center gap-2 text-destructive text-xs font-medium mb-1">
                        <AlertTriangle className="w-3 h-3" />
                        Build Validation Errors
                      </div>
                      <ul className="text-xs text-destructive space-y-1">
                        {globalErrors.map((error, index) => (
                          <li key={index} className="ml-3">• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Panel>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step Content */}
        <div className="lg:col-span-9">
          <Panel>
            <Tabs value={currentStep} onValueChange={handleStepChange}>
              <TabsList className="hidden" />
              
              <TabsContent value="ability-scores" className="mt-0">
                <AbilityScoreAssignment />
              </TabsContent>
              
              <TabsContent value="race-background" className="mt-0">
                <RaceBackgroundSelection />
              </TabsContent>
              
              <TabsContent value="class-progression" className="mt-0">
                <EnhancedLevelTimeline />
              </TabsContent>
              
              <TabsContent value="equipment" className="mt-0">
                <Tabs defaultValue="gear" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="gear">Equipment</TabsTrigger>
                    <TabsTrigger value="buffs">Buffs & Spells</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="gear" className="mt-4">
                    <div className="space-y-6">
                      <EquipmentSelection />
                      <MagicItemSelection />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="buffs" className="mt-4">
                    <BuffSelection />
                  </TabsContent>
                </Tabs>
              </TabsContent>
              
              <TabsContent value="summary" className="mt-0">
                <BuildSummary />
              </TabsContent>
            </Tabs>
            
            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/20">
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                disabled={!canGoBack}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-muted">
                  Step {BUILDER_STEPS.indexOf(currentStep) + 1} of {BUILDER_STEPS.length}
                </p>
              </div>
              
              <Button
                variant="accent"
                onClick={handleNextStep}
                disabled={!canProceed}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Panel>
        </div>

        {/* Level Progression Sidebar */}
        <div className="lg:col-span-3">
          <Panel>
            <h3 className="font-semibold text-foreground mb-4">Level Progression</h3>
            
            {(currentBuild.enhancedLevelTimeline || []).length > 0 ? (
              <div className="space-y-2">
                {[...(currentBuild.enhancedLevelTimeline || [])]
                  .sort((a, b) => a.level - b.level)
                  .map(entry => {
                    const classData = getClass(entry.classId)
                    const classLevel = (currentBuild.enhancedLevelTimeline || [])
                      .filter(e => e.classId === entry.classId && e.level <= entry.level)
                      .length
                    const classFeatures = classData?.features?.[classLevel] || []
                    
                    // Get all features for this level
                    const features = []
                    
                    // Skills (only at level 1)
                    if (entry.level === 1 && currentBuild?.skillProficiencies && currentBuild.skillProficiencies.length > 0) {
                      features.push(`Skills: ${currentBuild.skillProficiencies.join(', ')}`)
                    }
                    
                    // Fighting Style
                    if (entry.fightingStyle) {
                      const fightingStyleName = classData?.fightingStyles?.find((fs: any) => fs.id === entry.fightingStyle)?.name || entry.fightingStyle
                      features.push(`Fighting Style: ${fightingStyleName}`)
                    }
                    
                    // Archetype
                    if (entry.archetype) {
                      const archetypeName = Object.values(subclasses).find((sub: any) => sub.id === entry.archetype)?.name || entry.archetype
                      features.push(`Archetype: ${archetypeName}`)
                    }
                    
                    // ASI or Feat
                    if (entry.asiOrFeat === 'asi' && entry.abilityIncreases) {
                      const asiString = Object.entries(entry.abilityIncreases)
                        .map(([ability, increase]) => `${ability} +${increase}`)
                        .join(', ')
                      features.push(`ASI: ${asiString}`)
                    } else if (entry.asiOrFeat === 'feat' && entry.featId) {
                      const featName = Object.values(feats).find((f: any) => f.id === entry.featId)?.name || entry.featId
                      
                      // Check if this is a half-feat with ability score increases
                      if (entry.abilityIncreases) {
                        const asiString = Object.entries(entry.abilityIncreases)
                          .map(([ability, increase]) => `${ability} +${increase}`)
                          .join(', ')
                        features.push(`Feat: ${featName} (${asiString})`)
                      } else {
                        features.push(`Feat: ${featName}`)
                      }
                    }
                    
                    // Class Features (automatic ones)
                    const autoFeatures = classFeatures.filter((f: any) => 
                      f.rulesKey !== 'fighting_style' && f.rulesKey !== 'asi' && f.rulesKey !== 'archetype' && f.rulesKey !== 'archetype_feature'
                    )
                    autoFeatures.forEach((feature: any) => {
                      features.push(`Class: ${feature.name}`)
                    })
                    
                    // Archetype Features
                    const archetypeFeatures = classFeatures.filter((f: any) => f.rulesKey === 'archetype_feature')
                    if (archetypeFeatures.length > 0 && entry.archetype) {
                      const subclass = Object.values(subclasses).find((sub: any) => sub.id === entry.archetype)
                      if (subclass && subclass.features) {
                        const subclassFeatures = subclass.features.filter((f: any) => f.level === classLevel)
                        subclassFeatures.forEach((feature: any) => {
                          features.push(`Archetype: ${feature.name}`)
                        })
                      }
                    }
                    
                    return (
                      <div key={entry.level} className="flex flex-col gap-1 p-3 bg-accent/5 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="text-blue-500 text-lg font-bold">
                            {entry.level}
                          </div>
                          <div className="text-sm text-foreground font-medium">
                            {classData?.name || entry.classId} {classLevel}
                          </div>
                        </div>
                        <div className="ml-8 flex flex-wrap gap-1">
                          {features.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            ) : (
              <div className="text-center py-8 text-muted">
                <div className="text-sm">No levels added yet</div>
                <div className="text-xs">Go to Class Progression to add levels</div>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}