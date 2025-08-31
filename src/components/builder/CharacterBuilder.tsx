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

// Step components
import { AbilityScoreAssignment } from './AbilityScoreAssignment'
import { RaceBackgroundSelection } from './RaceBackgroundSelection' 
import { EnhancedLevelTimeline } from './EnhancedLevelTimeline'
import { EquipmentSelection } from './EquipmentSelection'
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

interface CharacterBuilderProps {
  buildId?: string
}

export function CharacterBuilder({ buildId }: CharacterBuilderProps) {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const navigate = useNavigate()
  const { addBuild, updateBuild: updateVaultBuild, builds } = useVaultStore()
  const { loadFromBuildConfiguration } = useCharacterBuilderStore()
  const { currentBuild: storedBuild, clearCurrentBuild } = useBuilderStore()
  
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
    const fromVault = searchParams.get('from') === 'vault'
    const isNew = searchParams.get('new') === 'true'
    console.log('CharacterBuilder useEffect - currentBuild:', currentBuild?.name, 'storedBuild:', storedBuild?.name, 'buildId:', buildId, 'fromVault:', fromVault, 'isNew:', isNew)
    
    // If explicitly creating new build (from vault "New Build" button or direct navigation)
    if (isNew || (!storedBuild && !buildId && !currentBuild)) {
      console.log('Creating fresh new build')
      createNewBuild()
      return
    }
    
    // If we have a storedBuild and came from vault, load it
    if (storedBuild && !currentBuild && (fromVault || buildId)) {
      console.log('Loading build from vault/store:', storedBuild.name)
      loadFromBuildConfiguration(storedBuild)
      // Clear the stored build to prevent reloading on next visit
      setTimeout(() => clearCurrentBuild(), 0)
      return
    }
    
    // Fallback: create new build if nothing else applies
    if (!currentBuild) {
      console.log('Creating fresh new build - fallback')
      createNewBuild()
    }
  }, [buildId, currentBuild, storedBuild, createNewBuild, loadFromBuildConfiguration, clearCurrentBuild, searchParams])

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
    if (currentBuild.enhancedLevelTimeline.length === 0) issues.push('No class levels defined')
    if (!buildName.trim()) issues.push('Build name required')
    
    // Check for concentration conflicts
    const activeBuffs = currentBuild.activeBuffs || []
    const round0Buffs = currentBuild.round0Buffs || []
    
    const activeConcentrationBuffs = activeBuffs
      .map((id: string) => buffs[id])
      .filter((buff: any) => buff?.concentration)
    
    const round0ConcentrationBuffs = round0Buffs
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
              
              {/* Build Status */}
              {(issues.length > 0 || isValid || globalErrors.length > 0) && (
                <div className="mt-2">
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

        
        {/* Horizontal Steps Navigation */}
        <div className="border-t border-border/20 pt-6">
          <div className="flex flex-wrap gap-2 justify-center">
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
                    <EquipmentSelection />
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
            
            {currentBuild.enhancedLevelTimeline.length > 0 ? (
              <div className="space-y-2">
                {[...currentBuild.enhancedLevelTimeline]
                  .sort((a, b) => a.level - b.level)
                  .map(entry => {
                    // Calculate class level for this entry
                    const classLevel = currentBuild.enhancedLevelTimeline
                      .filter(e => e.classId === entry.classId && e.level <= entry.level)
                      .length
                    
                    return (
                      <div key={entry.level} className="flex items-center gap-3 p-3 bg-panel/5 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-accent/10 text-accent rounded-full flex items-center justify-center text-xs font-bold">
                          {entry.level}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground capitalize">
                            {entry.classId.replace('_', ' ')} {classLevel}
                          </div>
                          <div className="text-xs text-muted">
                            {/* Class Features */}
                            {entry.features.length > 0 && (
                              <div className="mt-1">
                                {entry.features.map((feature, idx) => (
                                  <div key={idx} className="text-xs text-panel">
                                    • {feature.replace('_', ' ')}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Special Choices */}
                            <div className="mt-1 flex flex-wrap gap-1">
                              {entry.asiOrFeat && (
                                <span className="px-1 py-0.5 bg-accent/10 text-accent rounded text-xs">
                                  {entry.asiOrFeat === 'feat' ? `Feat: ${entry.featId || 'Chosen'}` : 'ASI'}
                                </span>
                              )}
                              {entry.fightingStyle && (
                                <span className="px-1 py-0.5 bg-emerald/10 text-emerald rounded text-xs">
                                  Style: {entry.fightingStyle.replace('_', ' ')}
                                </span>
                              )}
                              {entry.archetype && (
                                <span className="px-1 py-0.5 bg-gold/10 text-gold rounded text-xs">
                                  {entry.archetype.replace('_', ' ')}
                                </span>
                              )}
                            </div>

                            {/* Skills from Class (Level 1 only) */}
                            {entry.level === 1 && currentBuild.skillProficiencies && currentBuild.skillProficiencies.length > 0 && (
                              <div className="mt-1">
                                <span className="text-xs text-blue-500">
                                  Skills: {currentBuild.skillProficiencies.join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
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