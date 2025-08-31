import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { magicItems } from '../../rules/srd/magicItems'
import { getAttunementStatus } from '../../rules/attunement'
import { AlertTriangle, Sparkles, Info, Plus, Trash2 } from 'lucide-react'

const RARITY_COLORS = {
  common: 'bg-gray-100 text-gray-800',
  uncommon: 'bg-green-100 text-green-800', 
  rare: 'bg-blue-100 text-blue-800',
  very_rare: 'bg-purple-100 text-purple-800',
  legendary: 'bg-orange-100 text-orange-800',
  artifact: 'bg-red-100 text-red-800'
}

const RARITY_DISPLAY = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  very_rare: 'Very Rare',
  legendary: 'Legendary',
  artifact: 'Artifact'
}

export default function MagicItemSelection() {
  const { currentBuild, updateBuild } = useCharacterBuilderStore()
  const [selectedItemId, setSelectedItemId] = useState<string>('')
  
  if (!currentBuild) return null
  
  const equippedItems = currentBuild.equipment?.magicItems || []
  const attunedItems = currentBuild.equipment?.attunedItems || []
  const attunementStatus = getAttunementStatus(currentBuild as any)

  const addMagicItem = () => {
    if (!selectedItemId || equippedItems.includes(selectedItemId)) return

    const newEquippedItems = [...equippedItems, selectedItemId]
    updateBuild({
      equipment: {
        ...currentBuild.equipment,
        magicItems: newEquippedItems,
        attunedItems: attunedItems // Keep existing attunements
      }
    })
    setSelectedItemId('')
  }

  const removeMagicItem = (itemId: string) => {
    const newEquippedItems = equippedItems.filter(id => id !== itemId)
    const newAttunedItems = attunedItems.filter(id => id !== itemId)
    
    updateBuild({
      equipment: {
        ...currentBuild.equipment,
        magicItems: newEquippedItems,
        attunedItems: newAttunedItems
      }
    })
  }

  const toggleAttunement = (itemId: string) => {
    const item = magicItems[itemId]
    if (!item?.attunement) return // Can't attune to non-attunement items

    const isCurrentlyAttuned = attunedItems.includes(itemId)
    let newAttunedItems

    if (isCurrentlyAttuned) {
      // Remove attunement
      newAttunedItems = attunedItems.filter(id => id !== itemId)
    } else {
      // Add attunement (even if over limit - show warning)
      newAttunedItems = [...attunedItems, itemId]
    }

    updateBuild({
      equipment: {
        ...currentBuild.equipment,
        attunedItems: newAttunedItems
      }
    })
  }

  const availableItems = Object.values(magicItems).filter(item => 
    !equippedItems.includes(item.id)
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Magic Items & Attunement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Attunement Status */}
          <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Attunement Slots</div>
              <div className="text-sm">
                {attunementStatus.currentAttunements} / {attunementStatus.maxSlots} used
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  attunementStatus.hasOverlimit ? 'bg-danger' : 'bg-accent'
                }`}
                style={{ 
                  width: `${Math.min(100, (attunementStatus.currentAttunements / attunementStatus.maxSlots) * 100)}%` 
                }}
              />
            </div>
            
            {attunementStatus.warning && (
              <div className="mt-2 p-2 bg-danger/10 border border-danger/20 rounded text-sm text-danger flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {attunementStatus.warning}
              </div>
            )}
          </div>

          {/* Add New Item */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Add Magic Item</Label>
            <div className="flex gap-2">
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose a magic item..." />
                </SelectTrigger>
                <SelectContent>
                  {availableItems.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center gap-2">
                        <span>{item.name}</span>
                        <Badge className={`text-xs ${RARITY_COLORS[item.rarity]}`}>
                          {RARITY_DISPLAY[item.rarity]}
                        </Badge>
                        {item.attunement && (
                          <Badge variant="outline" className="text-xs">
                            Attunement
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={addMagicItem} 
                disabled={!selectedItemId}
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Equipped Items */}
          {equippedItems.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Equipped Magic Items</Label>
              <div className="space-y-2">
                {equippedItems.map(itemId => {
                  const item = magicItems[itemId]
                  if (!item) return null
                  
                  const isAttuned = attunedItems.includes(itemId)
                  const canToggleAttunement = item.attunement
                  
                  return (
                    <Card key={itemId} className="border-l-4 border-l-accent/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.name}</span>
                              <Badge className={`text-xs ${RARITY_COLORS[item.rarity]}`}>
                                {RARITY_DISPLAY[item.rarity]}
                              </Badge>
                              {isAttuned && (
                                <Badge className="bg-accent/10 text-accent text-xs">
                                  Attuned
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                            
                            {canToggleAttunement && (
                              <div className="flex items-center gap-2 mt-2">
                                <Switch
                                  id={`attune-${itemId}`}
                                  checked={isAttuned}
                                  onCheckedChange={() => toggleAttunement(itemId)}
                                />
                                <Label htmlFor={`attune-${itemId}`} className="text-xs">
                                  Require Attunement
                                </Label>
                                {isAttuned && attunementStatus.hasOverlimit && (
                                  <AlertTriangle className="w-4 h-4 text-danger ml-1" />
                                )}
                              </div>
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMagicItem(itemId)}
                            className="text-danger hover:text-danger"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Attunement Rules:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Most characters can attune to 3 magic items maximum</li>
                  <li>• Artificers gain additional slots: +1 at 10th, +2 at 14th, +3 at 18th level</li>
                  <li>• Some magic items require attunement to function</li>
                  <li>• Attuning takes a short rest, breaking attunement is instantaneous</li>
                </ul>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}