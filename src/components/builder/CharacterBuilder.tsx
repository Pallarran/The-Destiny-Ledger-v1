import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Panel } from '../ui/panel'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { Tabs, TabsList, TabsContent, TabsTrigger } from '../ui/tabs'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { useVaultStore } from '../../stores/vaultStore'
import { useBuilderStore } from '../../stores/builderStore'
import { BUILDER_STEPS } from '../../types/character'
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  RotateCcw, 
  AlertTriangle,
  CheckCircle,
  User,
  Dices,
  Zap,
  Sword,
  FileText,
  Users
} from 'lucide-react'

// Step components
import { BasicInfo } from './BasicInfo'
import { AbilityScoreAssignment } from './AbilityScoreAssignment'
import { RaceBackgroundSelection } from './RaceBackgroundSelection' 
import { LevelTimeline } from './LevelTimeline'
import { EquipmentSelection } from './EquipmentSelection'
import { BuffSelection } from './BuffSelection'
import { BuildSummary } from './BuildSummary'

const STEP_ICONS = {
  'basic-info': User,
  'ability-scores': Dices,
  'race-background': Users,
  'class-progression': Zap,
  'equipment': Sword,
  'summary': FileText
}

const STEP_LABELS = {
  'basic-info': 'Build Info',
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
  const navigate = useNavigate()
  const { addBuild, updateBuild, builds } = useVaultStore()
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
    clearDirty
  } = useCharacterBuilderStore()
  
  useEffect(() => {
    console.log('CharacterBuilder useEffect - currentBuild:', currentBuild?.name, 'storedBuild:', storedBuild?.name)
    
    // If we have a stored build and no current build, load it
    if (storedBuild && !currentBuild) {
      console.log('Loading build from vault:', storedBuild.name)
      loadFromBuildConfiguration(storedBuild)
      // Clear immediately to prevent reload loops
      setTimeout(() => clearCurrentBuild(), 0)
      return // Exit early to prevent creating new build
    }
    
    // Only create new build if we have no current build and no stored build
    if (!currentBuild && !storedBuild) {
      console.log('Creating new build - no stored or current build')
      if (buildId) {
        console.warn('Loading build by ID not yet implemented')
      }
      createNewBuild()
    }
  }, [buildId, currentBuild, storedBuild, createNewBuild, loadFromBuildConfiguration, clearCurrentBuild])
  
  const handleStepChange = (step: string) => {
    goToStep(step as any)
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
        updateBuild(buildConfig.id, buildConfig)
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
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <Panel>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-panel mb-1">{currentBuild.name}</h1>
            <p className="text-sm text-muted">
              Step {BUILDER_STEPS.indexOf(currentStep) + 1} of {BUILDER_STEPS.length}: {STEP_LABELS[currentStep]}
            </p>
          </div>
          
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
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted mb-2">
            <span>Overall Progress</span>
            <span>{Math.round(getStepProgress())}% Complete</span>
          </div>
          <Progress value={getStepProgress()} className="h-2" />
        </div>
        
        {/* Global Errors */}
        {globalErrors.length > 0 && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-2">
              <AlertTriangle className="w-4 h-4" />
              Build Validation Errors
            </div>
            <ul className="text-sm text-destructive space-y-1">
              {globalErrors.map((error, index) => (
                <li key={index} className="ml-4">• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </Panel>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step Navigation Sidebar */}
        <div className="lg:col-span-3">
          <Panel>
            <h3 className="font-semibold text-panel mb-4">Build Steps</h3>
            <div className="space-y-2">
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
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
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
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-current/10">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{STEP_LABELS[step]}</div>
                      <div className="text-xs opacity-70">
                        {isCompleted ? 'Complete' : isActive ? 'Current' : 'Pending'}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </Panel>
        </div>
        
        {/* Step Content */}
        <div className="lg:col-span-9">
          <Panel>
            <Tabs value={currentStep} onValueChange={handleStepChange}>
              <TabsList className="hidden" />
              
              <TabsContent value="basic-info" className="mt-0">
                <BasicInfo />
              </TabsContent>
              
              <TabsContent value="ability-scores" className="mt-0">
                <AbilityScoreAssignment />
              </TabsContent>
              
              <TabsContent value="race-background" className="mt-0">
                <RaceBackgroundSelection />
              </TabsContent>
              
              <TabsContent value="class-progression" className="mt-0">
                <LevelTimeline />
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
      </div>
    </div>
  )
}