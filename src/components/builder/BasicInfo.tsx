import { useState, useEffect } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Textarea } from '../ui/textarea'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { FileText, User } from 'lucide-react'

export function BasicInfo() {
  const {
    currentBuild,
    updateBuild
  } = useCharacterBuilderStore()
  
  const [buildName, setBuildName] = useState(currentBuild?.name || '')
  const [buildNotes, setBuildNotes] = useState(currentBuild?.notes || '')
  
  useEffect(() => {
    if (currentBuild) {
      setBuildName(currentBuild.name)
      setBuildNotes(currentBuild.notes || '')
    }
  }, [currentBuild])
  
  // Trigger validation when component mounts or values change
  useEffect(() => {
    if (currentBuild) {
      const { validateCurrentStep } = useCharacterBuilderStore.getState()
      validateCurrentStep()
    }
  }, [currentBuild, buildName, buildNotes])
  
  const handleNameChange = (value: string) => {
    setBuildName(value)
    if (currentBuild) {
      updateBuild({ name: value })
    }
  }
  
  const handleNotesChange = (value: string) => {
    setBuildNotes(value)
    if (currentBuild) {
      updateBuild({ notes: value })
    }
  }
  
  if (!currentBuild) {
    return <div className="text-center text-muted">Loading build information...</div>
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-panel mb-2">Build Information</h2>
        <p className="text-muted">
          Start by giving your character build a name and optional notes to help you remember your concept.
        </p>
      </div>
      
      {/* Build Name */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5" />
            Build Name
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="build-name">Character Build Name *</Label>
            <Input
              id="build-name"
              placeholder="e.g., Elven Archer, Tank Paladin, Sneaky Rogue..."
              value={buildName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="text-lg"
            />
            <p className="text-xs text-muted">
              This will help you identify your build in the vault and exports.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Build Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5" />
            Build Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="build-notes">Notes (Optional)</Label>
            <Textarea
              id="build-notes"
              placeholder="Describe your character concept, backstory, strategy, or any other notes..."
              value={buildNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted">
              Add any notes about your build strategy, roleplay concept, or optimization goals.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}