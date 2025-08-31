import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Progress } from '../ui/progress'
import { useCombatOptimizerStore } from '../../stores/combatOptimizerStore'
import { useCharacterBuilderStore } from '../../stores/characterBuilderStore'
import { 
  Zap, 
  Target, 
  Clock, 
  TrendingUp, 
  Settings, 
  Play, 
  RotateCcw,
  AlertCircle,
  Info
} from 'lucide-react'

export default function CombatRoundOptimizer() {
  const { 
    config, 
    currentResult, 
    isOptimizing, 
    optimizationError,
    setConfig, 
    resetConfig, 
    optimizeBuild,
    saveResultToHistory
  } = useCombatOptimizerStore()
  
  const { currentBuild, exportToBuildConfiguration } = useCharacterBuilderStore()
  const [selectedStrategy, setSelectedStrategy] = useState(0)

  const handleOptimize = async () => {
    if (!currentBuild) return
    
    const buildConfig = exportToBuildConfiguration()
    if (buildConfig) {
      await optimizeBuild(buildConfig)
      saveResultToHistory(buildConfig.id)
    }
  }

  const formatDamage = (damage: number) => damage.toFixed(1)
  const formatEfficiency = (efficiency: number) => efficiency.toFixed(2)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Combat Round Optimizer
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Optimize action sequences across 3 combat rounds for maximum effectiveness
          </p>
        </CardHeader>
        <CardContent>
          
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            {/* Configuration Tab */}
            <TabsContent value="config" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Target Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Target Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    <div className="space-y-2">
                      <Label>Target AC: {config.targetAC}</Label>
                      <Slider
                        value={[config.targetAC]}
                        onValueChange={([value]) => setConfig({ targetAC: value })}
                        min={8}
                        max={25}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Number of Targets: {config.numberOfTargets}</Label>
                      <Slider
                        value={[config.numberOfTargets]}
                        onValueChange={([value]) => setConfig({ numberOfTargets: value })}
                        min={1}
                        max={8}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Target Type</Label>
                      <Select 
                        value={config.targetType} 
                        onValueChange={(value: 'single' | 'group' | 'mixed') => setConfig({ targetType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single Target</SelectItem>
                          <SelectItem value="group">Group (Clustered)</SelectItem>
                          <SelectItem value="mixed">Mixed Engagement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Advantage State</Label>
                      <Select 
                        value={config.advantageState} 
                        onValueChange={(value: 'normal' | 'advantage' | 'disadvantage') => setConfig({ advantageState: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="disadvantage">Disadvantage</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="advantage">Advantage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                  </CardContent>
                </Card>

                {/* Strategy Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Strategy Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    <div className="space-y-2">
                      <Label>Resource Strategy</Label>
                      <Select 
                        value={config.resourceStrategy} 
                        onValueChange={(value: 'conservative' | 'balanced' | 'aggressive') => setConfig({ resourceStrategy: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conservative">Conservative</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="aggressive">Aggressive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="nova-damage">Allow Nova Damage</Label>
                      <Switch
                        id="nova-damage"
                        checked={config.allowNovaDamage}
                        onCheckedChange={(checked) => setConfig({ allowNovaDamage: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="prioritize-control">Prioritize Control</Label>
                      <Switch
                        id="prioritize-control"
                        checked={config.prioritizeControl}
                        onCheckedChange={(checked) => setConfig({ prioritizeControl: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="prioritize-survivability">Prioritize Survivability</Label>
                      <Switch
                        id="prioritize-survivability"
                        checked={config.prioritizeSurvivability}
                        onCheckedChange={(checked) => setConfig({ prioritizeSurvivability: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="include-reactions">Include Reactions</Label>
                      <Switch
                        id="include-reactions"
                        checked={config.includeReactions}
                        onCheckedChange={(checked) => setConfig({ includeReactions: checked })}
                      />
                    </div>
                    
                  </CardContent>
                </Card>
                
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={resetConfig}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Configuration
                </Button>
                
                <Button
                  onClick={handleOptimize}
                  disabled={isOptimizing || !currentBuild}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {isOptimizing ? 'Optimizing...' : 'Optimize Combat'}
                </Button>
              </div>

              {isOptimizing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Analyzing action combinations...
                  </div>
                  <Progress value={50} className="w-full" />
                </div>
              )}

              {optimizationError && (
                <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <div>
                    <div className="font-medium">Optimization Error</div>
                    <div>{optimizationError}</div>
                  </div>
                </div>
              )}
              
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-6">
              {currentResult ? (
                <div className="space-y-6">
                  
                  {/* Overall Results */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Optimization Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-accent">
                            {formatDamage(currentResult.totalExpectedDamage)}
                          </div>
                          <div className="text-sm text-muted-foreground">Total Damage (3 rounds)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-accent">
                            {formatDamage(currentResult.totalExpectedDamage / 3)}
                          </div>
                          <div className="text-sm text-muted-foreground">Damage per Round</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-accent">
                            {formatEfficiency(currentResult.resourceEfficiency)}
                          </div>
                          <div className="text-sm text-muted-foreground">Resource Efficiency</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Round by Round */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Round-by-Round Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {currentResult.roundPlans.map((round) => (
                          <div key={round.roundNumber} className="border border-accent/20 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-medium">Round {round.roundNumber}</div>
                              <Badge className="bg-accent/10 text-accent">
                                {formatDamage(round.expectedDamage)} damage
                              </Badge>
                            </div>
                            
                            {round.actions.length > 0 ? (
                              <div className="space-y-2 text-sm">
                                {round.actions.map((actionPlan, actionIndex) => (
                                  <div key={actionIndex} className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {actionPlan.action.actionType}
                                    </Badge>
                                    <span>{actionPlan.action.name}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                Basic weapon attack sequence (optimization in progress)
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Alternative Strategies */}
                  {currentResult.alternativeStrategies && currentResult.alternativeStrategies.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Alternative Strategies</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {currentResult.alternativeStrategies.map((strategy, strategyIndex) => (
                            <div 
                              key={strategyIndex}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedStrategy === strategyIndex ? 'border-accent bg-accent/5' : 'border-accent/20'
                              }`}
                              onClick={() => setSelectedStrategy(strategyIndex)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="font-medium">{strategy.name}</div>
                                <Badge>{formatDamage(strategy.totalDamage)} total damage</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {strategy.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    No optimization results yet. Configure your parameters and run the optimizer.
                  </div>
                  <Button onClick={() => setConfig({})} variant="outline">
                    Go to Configuration
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-6">
              {currentResult ? (
                <div className="space-y-6">
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Combat Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        This optimization assumes a {config.roundsToOptimize}-round combat encounter against 
                        AC {config.targetAC} target(s) with {config.advantageState} conditions.
                      </div>
                      
                      <div className="space-y-2">
                        <div className="font-medium text-sm">Key Insights:</div>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Average damage per round: {formatDamage(currentResult.totalExpectedDamage / 3)}</li>
                          <li>Resource efficiency: {formatEfficiency(currentResult.resourceEfficiency)} damage per resource point</li>
                          <li>Strategy: {config.resourceStrategy} resource usage</li>
                          {config.prioritizeControl && <li>Prioritizing control effects over pure damage</li>}
                          {config.prioritizeSurvivability && <li>Prioritizing survivability over damage output</li>}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                  
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Run an optimization to see detailed analysis.
                </div>
              )}
            </TabsContent>

          </Tabs>
          
        </CardContent>
      </Card>
    </div>
  )
}