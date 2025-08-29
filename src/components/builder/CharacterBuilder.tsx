import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBuilderStore } from '@/stores/builderStore'
import { AbilityScoreAssignment } from './AbilityScoreAssignment'
import { LevelTimeline } from './LevelTimeline'
import { EquipmentSelection } from './EquipmentSelection'
import { BuffSelection } from './BuffSelection'
import { BuildSummary } from './BuildSummary'
import type { CharacterBuild } from '@/rules/types'

export function CharacterBuilder() {
  const { currentBuild, createNewBuild, updateBuild, isDirty } = useBuilderStore()
  const [buildName, setBuildName] = useState(currentBuild?.name || '')

  const handleCreateNew = () => {
    const newBuild: Partial<CharacterBuild> = {
      name: buildName || 'New Build',
      race: 'variant-human',
      abilityScores: {
        STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8
      },
      levels: [{
        level: 1,
        classId: 'fighter',
        subclassId: null,
        features: [],
        spells: []
      }],
      equipment: {
        mainHand: null,
        offHand: null,
        armor: null,
        shield: false,
        other: []
      },
      buffs: [],
      settings: {
        fightingStyle: null,
        spellcastingAbility: null,
        gwmThreshold: 16,
        ssThreshold: 16
      }
    }
    createNewBuild(newBuild as CharacterBuild)
  }

  const handleNameChange = (name: string) => {
    setBuildName(name)
    if (currentBuild) {
      updateBuild({ name })
    }
  }

  if (!currentBuild) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <Card>
          <CardHeader>
            <CardTitle>Create New Character Build</CardTitle>
            <CardDescription>
              Start optimizing your D&D 5e character for maximum damage output
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="build-name">Build Name</Label>
              <Input
                id="build-name"
                placeholder="Enter build name..."
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateNew} className="w-full">
              Create Build
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Character Builder</h1>
          <p className="text-muted-foreground">
            Design and optimize your D&D 5e character build
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-sm text-amber-600 font-medium">
              Unsaved changes
            </span>
          )}
          <Input
            value={buildName}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-48"
            placeholder="Build name..."
          />
        </div>
      </div>

      <Tabs defaultValue="basics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="levels">Levels</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="buffs">Buffs</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="space-y-6">
          <AbilityScoreAssignment />
        </TabsContent>

        <TabsContent value="levels" className="space-y-6">
          <LevelTimeline />
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          <EquipmentSelection />
        </TabsContent>

        <TabsContent value="buffs" className="space-y-6">
          <BuffSelection />
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          <BuildSummary />
        </TabsContent>
      </Tabs>
    </div>
  )
}