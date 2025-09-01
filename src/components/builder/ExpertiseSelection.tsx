import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { Crown, Info } from 'lucide-react'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'

interface ExpertiseSelectionProps {
  level: number
  expertiseCount: number // Number of skills to choose for expertise
  currentExpertise?: string[] // Current selections
  onExpertiseSelected: (skills: string[]) => void
  className?: string
}

export function ExpertiseSelection({ 
  level, 
  expertiseCount, 
  currentExpertise = [],
  onExpertiseSelected,
  className 
}: ExpertiseSelectionProps) {
  const { currentBuild } = useCharacterBuilderStore()
  
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>(currentExpertise)
  
  // Get available skills for expertise (must already be proficient)
  const availableSkills = currentBuild?.skillProficiencies || []
  
  // Get skills that already have expertise (from earlier levels or other sources)
  const existingExpertise = new Set<string>()
  currentBuild?.levelTimeline?.forEach(entry => {
    if (entry.level < level && entry.expertiseChoices) {
      entry.expertiseChoices.forEach(skill => existingExpertise.add(skill))
    }
  })
  
  // Include downtime training expertise
  currentBuild?.downtimeTraining?.trainedSkillExpertise?.forEach(skill => {
    existingExpertise.add(skill)
  })
  
  const eligibleSkills = availableSkills.filter(skill => !existingExpertise.has(skill))
  
  const handleExpertiseToggle = (skill: string, checked: boolean) => {
    let newSelection: string[]
    if (checked && selectedExpertise.length < expertiseCount) {
      newSelection = [...selectedExpertise, skill]
    } else if (!checked) {
      newSelection = selectedExpertise.filter(s => s !== skill)
    } else {
      return // No change if trying to add beyond limit
    }
    
    setSelectedExpertise(newSelection)
    onExpertiseSelected(newSelection)
  }
  
  const remainingChoices = expertiseCount - selectedExpertise.length
  
  if (eligibleSkills.length === 0) {
    return (
      <Card className={`border-purple-500/20 bg-purple-500/5 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-600" />
            Expertise Selection (Level {level})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <Crown className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No skills available for expertise.</p>
            <p className="text-xs">You must have skill proficiency to gain expertise.</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className={`border-purple-500/20 bg-purple-500/5 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-purple-600" />
          Expertise Selection (Level {level})
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="w-4 h-4" />
          <span>Choose {expertiseCount} skills to double your proficiency bonus</span>
          {remainingChoices > 0 && (
            <Badge variant="outline" className="text-xs">
              {remainingChoices} remaining
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {eligibleSkills.map(skill => {
            const isSelected = selectedExpertise.includes(skill)
            const isDisabled = !isSelected && remainingChoices === 0
            
            return (
              <div key={skill} className="flex items-center space-x-2">
                <Checkbox
                  id={`expertise-${skill}`}
                  checked={isSelected}
                  disabled={isDisabled}
                  onCheckedChange={(checked) => handleExpertiseToggle(skill, !!checked)}
                />
                <Label 
                  htmlFor={`expertise-${skill}`}
                  className={`text-sm ${isDisabled ? 'text-muted-foreground' : ''} ${isSelected ? 'font-medium text-purple-700' : ''}`}
                >
                  {skill.charAt(0).toUpperCase() + skill.slice(1)}
                  {isSelected && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      Expert
                    </Badge>
                  )}
                </Label>
              </div>
            )
          })}
        </div>
        
        {existingExpertise.size > 0 && (
          <div className="pt-3 border-t">
            <Label className="text-sm font-medium text-muted-foreground">
              Already Expert:
            </Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {Array.from(existingExpertise).map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill.charAt(0).toUpperCase() + skill.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="pt-3 border-t text-xs text-muted-foreground">
          <p><strong>Expertise:</strong> Your proficiency bonus is doubled for ability checks using these skills.</p>
          <p>Current proficiency bonus: +{Math.ceil((currentBuild?.currentLevel || 1) / 4) + 1}</p>
          <p>Expertise bonus: +{(Math.ceil((currentBuild?.currentLevel || 1) / 4) + 1) * 2}</p>
        </div>
      </CardContent>
    </Card>
  )
}