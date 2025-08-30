import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { Info } from 'lucide-react'
import { getClass } from '../../rules/loaders'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'

interface ClassSkillSelectionProps {
  classId: string
  level: number
  onSkillsSelected?: (skills: string[]) => void
}

export function ClassSkillSelection({ classId, level, onSkillsSelected }: ClassSkillSelectionProps) {
  const { currentBuild, setSkillProficiencies } = useCharacterBuilderStore()
  const [selectedSkills, setSelectedSkills] = useState<string[]>(currentBuild?.skillProficiencies || [])
  
  const classData = getClass(classId)
  
  if (!classData || level !== 1) {
    return null // Only show skill selection at level 1
  }
  
  const availableSkills = classData.skillChoices || []
  const maxSkills = classData.skillChoiceCount || 2
  
  // Get skills from background
  const backgroundSkills: string[] = [] // This would come from background data
  
  useEffect(() => {
    if (onSkillsSelected) {
      onSkillsSelected(selectedSkills)
    }
    setSkillProficiencies(selectedSkills)
  }, [selectedSkills, onSkillsSelected, setSkillProficiencies])
  
  const handleSkillToggle = (skill: string, checked: boolean) => {
    if (checked && selectedSkills.length < maxSkills) {
      setSelectedSkills([...selectedSkills, skill])
    } else if (!checked) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill))
    }
  }
  
  const remainingChoices = maxSkills - selectedSkills.length
  
  return (
    <Card className="border-gold/20 bg-gold/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-gold" />
            <span>Class Skill Proficiencies</span>
          </div>
          <Badge variant={remainingChoices > 0 ? "outline" : "default"} className="text-xs">
            {remainingChoices > 0 
              ? `Choose ${remainingChoices} more` 
              : `${maxSkills} selected`}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted mb-2">
          As a {classData.name}, choose {maxSkills} skills from the list below:
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {availableSkills.map(skill => {
            const isSelected = selectedSkills.includes(skill)
            const isFromBackground = backgroundSkills.includes(skill)
            const canSelect = isSelected || (remainingChoices > 0 && !isFromBackground)
            
            return (
              <div key={skill} className="flex items-center space-x-2">
                <Checkbox
                  id={`skill-${skill}`}
                  checked={isSelected}
                  disabled={!canSelect || isFromBackground}
                  onCheckedChange={(checked: boolean) => handleSkillToggle(skill, checked)}
                />
                <Label
                  htmlFor={`skill-${skill}`}
                  className={`text-xs cursor-pointer ${
                    isFromBackground ? 'text-muted line-through' : ''
                  } ${!canSelect && !isSelected ? 'text-muted/50' : ''}`}
                >
                  {skill}
                  {isFromBackground && (
                    <span className="ml-1 text-[10px] text-muted">(Background)</span>
                  )}
                </Label>
              </div>
            )
          })}
        </div>
        
        {backgroundSkills.length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-[10px] text-muted">
              Skills from background are automatically granted and don't count against your class choices.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}