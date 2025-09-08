import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Progress } from '../ui/progress'
import { usePartyOptimizerStore } from '../../stores/partyOptimizerStore'
import { useVaultStore } from '../../stores/vaultStore'
import { 
  Users, 
  Shield, 
  Sword, 
  Heart, 
  Zap, 
  Settings, 
  Play, 
  AlertCircle,
  Info,
  Plus,
  X,
  TrendingUp,
  Target
} from 'lucide-react'
import type { PartyRole } from '../../engine/partyOptimizer'
import type { BuildConfiguration, LevelEntry } from '../../stores/types'

export default function PartyOptimizer() {
  const { 
    selectedBuilds,
    config, 
    currentAnalysis, 
    isAnalyzing, 
    analysisError,
    addBuildToParty,
    removeBuildFromParty,
    clearParty,
 
    analyzeParty,
    saveAnalysisToHistory
  } = usePartyOptimizerStore()
  
  const { builds } = useVaultStore()
  const [selectedTab, setSelectedTab] = useState('composition')

  const handleAnalyze = async () => {
    await analyzeParty()
    if (currentAnalysis) {
      saveAnalysisToHistory(`Party Analysis ${new Date().toLocaleDateString()}`)
    }
  }

  const getRoleIcon = (role: PartyRole) => {
    switch (role) {
      case 'tank': return <Shield className="w-4 h-4" />
      case 'damage': return <Sword className="w-4 h-4" />
      case 'support': return <Heart className="w-4 h-4" />
      case 'control': return <Zap className="w-4 h-4" />
      case 'utility': return <Settings className="w-4 h-4" />
      case 'healer': return <Heart className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  const getRoleColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    if (score >= 4) return 'text-orange-600'
    return 'text-red-600'
  }

  const getSeverityColor = (severity: 'minor' | 'moderate' | 'major') => {
    switch (severity) {
      case 'minor': return 'text-yellow-600 bg-yellow-100'
      case 'moderate': return 'text-orange-600 bg-orange-100'
      case 'major': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Party Optimizer
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Analyze party composition, identify synergies, and optimize for balanced gameplay
          </p>
        </CardHeader>
        <CardContent>
          
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="composition">Composition</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            {/* Party Composition Tab */}
            <TabsContent value="composition" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Build Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Available Builds
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                    {builds.length === 0 ? (
                      <div className="text-sm text-muted-foreground text-center py-8">
                        No saved builds available. Create builds in the Character Builder first.
                      </div>
                    ) : (
                      builds.map((build: BuildConfiguration) => (
                        <div
                          key={build.id}
                          className="flex items-center justify-between p-3 border border-accent/20 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{build.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Level {Math.max(...(build.levelTimeline?.map((l: LevelEntry) => l.level) || [1]))}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addBuildToParty(build)}
                            disabled={selectedBuilds.length >= config.maxSize || selectedBuilds.some(b => b.id === build.id)}
                          >
                            Add
                          </Button>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Current Party */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Current Party ({selectedBuilds.length}/{config.maxSize})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedBuilds.length === 0 ? (
                      <div className="text-sm text-muted-foreground text-center py-8">
                        No party members selected. Add builds from the left panel.
                      </div>
                    ) : (
                      <>
                        {selectedBuilds.map((build) => (
                          <div
                            key={build.id}
                            className="flex items-center justify-between p-3 border border-accent/20 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm">{build.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Level {Math.max(...(build.levelTimeline?.map((l: LevelEntry) => l.level) || [1]))}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeBuildFromParty(build.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        
                        <div className="flex gap-2 pt-3">
                          <Button
                            variant="outline"
                            onClick={clearParty}
                            size="sm"
                          >
                            Clear All
                          </Button>
                          <Button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || selectedBuilds.length === 0}
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Play className="w-3 h-3" />
                            {isAnalyzing ? 'Analyzing...' : 'Analyze Party'}
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
                
              </div>

              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="w-4 h-4" />
                    Analyzing party composition and synergies...
                  </div>
                  <Progress value={50} className="w-full" />
                </div>
              )}

              {analysisError && (
                <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  <div>
                    <div className="font-medium">Analysis Error</div>
                    <div>{analysisError}</div>
                  </div>
                </div>
              )}
            </TabsContent>


            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-6">
              {currentAnalysis ? (
                <div className="space-y-6">
                  
                  {/* Overall Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Party Analysis Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-accent">{currentAnalysis.size}</div>
                          <div className="text-sm text-muted-foreground">Party Size</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-accent">{currentAnalysis.averageLevel.toFixed(1)}</div>
                          <div className="text-sm text-muted-foreground">Average Level</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-accent">{currentAnalysis.synergyScore.toFixed(1)}</div>
                          <div className="text-sm text-muted-foreground">Synergy Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-accent">{currentAnalysis.synergies.length}</div>
                          <div className="text-sm text-muted-foreground">Identified Synergies</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Role Coverage */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Role Coverage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(currentAnalysis.roleCoverage).map(([role, score]) => (
                          <div key={role} className="flex items-center gap-3">
                            {getRoleIcon(role as PartyRole)}
                            <div className="flex-1">
                              <div className="text-sm font-medium capitalize">{role}</div>
                              <div className="text-xs text-muted-foreground">
                                <span className={getRoleColor(score)}>
                                  {score}/10
                                </span>
                              </div>
                            </div>
                            <Progress value={score * 10} className="w-16 h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Party Members */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Party Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {currentAnalysis.members.map((member) => (
                          <div key={member.buildId} className="border border-accent/20 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-medium">{member.buildName}</div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  Level {member.level}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Role Badges */}
                            <div className="flex items-center gap-2 mb-3">
                              <Badge 
                                variant="default" 
                                className="text-sm flex items-center gap-1 bg-primary/10 text-primary border-primary/20"
                              >
                                {getRoleIcon(member.primaryRole)}
                                <span className="capitalize">{member.primaryRole}</span>
                              </Badge>
                              {member.secondaryRole && (
                                <Badge 
                                  variant="outline" 
                                  className="text-xs text-muted-foreground border-muted/30"
                                >
                                  {getRoleIcon(member.secondaryRole)}
                                  <span className="capitalize">{member.secondaryRole}</span>
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                              <div>
                                <div className="text-xs text-muted-foreground">DPR</div>
                                <div className="font-medium">{member.capabilities.averageDPR.toFixed(1)}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">AC</div>
                                <div className="font-medium">{member.capabilities.ac}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">HP</div>
                                <div className="font-medium">{member.capabilities.hitPoints}</div>
                              </div>
                            </div>
                            
                            {member.uniqueContributions.length > 0 && (
                              <div className="mt-3">
                                <div className="text-xs text-muted-foreground mb-1">Unique Contributions</div>
                                <div className="flex flex-wrap gap-1">
                                  {member.uniqueContributions.map((contribution) => (
                                    <Badge key={contribution} variant="outline" className="text-xs">
                                      {contribution}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Synergies */}
                  {currentAnalysis.synergies.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Party Synergies</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {currentAnalysis.synergies.map((synergy, index) => (
                            <div key={index} className="border border-accent/20 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium text-sm">{synergy.name}</div>
                                <Badge className="bg-accent/10 text-accent">
                                  {synergy.estimatedBenefit}/10 benefit
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">{synergy.description}</div>
                              {synergy.requirements && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Requirements: {synergy.requirements.join(', ')}
                                </div>
                              )}
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
                    No analysis results yet. Select party members and run the analysis.
                  </div>
                  <Button onClick={() => setSelectedTab('composition')} variant="outline">
                    Go to Composition
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              {currentAnalysis ? (
                <div className="space-y-6">
                  
                  {/* Weaknesses */}
                  {currentAnalysis.weaknesses.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Identified Weaknesses
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {currentAnalysis.weaknesses.map((weakness, index) => (
                            <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(weakness.severity)}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <div className="font-medium text-sm capitalize">
                                  {weakness.severity} {weakness.type.replace('_', ' ')}
                                </div>
                              </div>
                              <div className="text-sm mb-2">{weakness.description}</div>
                              <div className="text-sm">
                                <div className="font-medium mb-1">Suggestions:</div>
                                <ul className="list-disc list-inside space-y-1">
                                  {weakness.suggestions.map((suggestion, suggestionIndex) => (
                                    <li key={suggestionIndex}>{suggestion}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Optimization Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {currentAnalysis.recommendations.map((recommendation, index) => (
                          <div key={index} className="border border-accent/20 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  recommendation.priority === 'high' ? 'border-red-500 text-red-700' :
                                  recommendation.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                                  'border-gray-500 text-gray-700'
                                }`}
                              >
                                {recommendation.priority} priority
                              </Badge>
                              <div className="font-medium text-sm capitalize">
                                {recommendation.type.replace('_', ' ')}
                              </div>
                            </div>
                            <div className="text-sm mb-1">{recommendation.description}</div>
                            <div className="text-xs text-muted-foreground">
                              Expected improvement: {recommendation.expectedImprovement}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Run an analysis to see recommendations for your party composition.
                </div>
              )}
            </TabsContent>

          </Tabs>
          
        </CardContent>
      </Card>
    </div>
  )
}