import { useState, useEffect } from 'react'
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
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const handleAnalyze = async () => {
    try {
      await analyzeParty()
      if (currentAnalysis) {
        saveAnalysisToHistory(`Party Analysis ${new Date().toLocaleDateString()}`)
        // Show success message and auto-switch to Analysis tab
        setShowSuccessMessage(true)
        setSelectedTab('analysis')
      }
    } catch (error) {
      console.error('Party analysis failed:', error)
    }
  }

  // Hide success message after 3 seconds
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showSuccessMessage])

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
          {/* Success Message */}
          {showSuccessMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-md flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span className="text-sm">Party analysis completed successfully! Results shown in the Analysis tab.</span>
            </div>
          )}
          
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
                  <Card className="bg-gradient-to-r from-primary/5 via-background to-accent/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-primary" />
                        Party Analysis Overview
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Key metrics and statistics for your party composition
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center space-y-2 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                          <Users className="w-8 h-8 text-blue-600 mx-auto" />
                          <div className="text-3xl font-bold text-blue-700">{currentAnalysis.size}</div>
                          <div className="text-sm font-medium text-blue-600">Party Members</div>
                        </div>
                        <div className="text-center space-y-2 p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                          <TrendingUp className="w-8 h-8 text-green-600 mx-auto" />
                          <div className="text-3xl font-bold text-green-700">{currentAnalysis.averageLevel.toFixed(1)}</div>
                          <div className="text-sm font-medium text-green-600">Average Level</div>
                        </div>
                        <div className="text-center space-y-2 p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                          <Zap className="w-8 h-8 text-purple-600 mx-auto" />
                          <div className="text-3xl font-bold text-purple-700">{currentAnalysis.synergyScore.toFixed(1)}</div>
                          <div className="text-sm font-medium text-purple-600">Synergy Score</div>
                        </div>
                        <div className="text-center space-y-2 p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                          <Target className="w-8 h-8 text-orange-600 mx-auto" />
                          <div className="text-3xl font-bold text-orange-700">{currentAnalysis.synergies.length}</div>
                          <div className="text-sm font-medium text-orange-600">Synergies Found</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Role Coverage */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Role Coverage Analysis
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        How well your party covers each essential role
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(currentAnalysis.roleCoverage).map(([role, score]) => (
                          <div key={role} className="space-y-3 p-4 rounded-lg border border-border/50 bg-gradient-to-br from-background to-muted/20">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${score >= 8 ? 'bg-green-100 text-green-700' : score >= 6 ? 'bg-yellow-100 text-yellow-700' : score >= 4 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                {getRoleIcon(role as PartyRole)}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold capitalize text-base">{role}</div>
                                <div className="text-sm text-muted-foreground">
                                  {score >= 8 ? 'Excellent' : score >= 6 ? 'Good' : score >= 4 ? 'Adequate' : 'Needs Improvement'}
                                </div>
                              </div>
                              <div className={`text-xl font-bold ${getRoleColor(score)}`}>
                                {score.toFixed(1)}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Progress value={score * 10} className="h-3" />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>0</span>
                                <span className="font-medium">Score: {score}/10</span>
                                <span>10</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Party Members */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Party Member Details
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Detailed breakdown of each party member's capabilities and contributions
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {currentAnalysis.members.map((member) => (
                          <div key={member.buildId} className="border border-border/60 rounded-xl p-5 bg-gradient-to-br from-card to-muted/30 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                              <div className="font-bold text-lg text-foreground">{member.buildName}</div>
                              <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                                Level {member.level}
                              </Badge>
                            </div>
                            
                            {/* Role Badges */}
                            <div className="flex items-center gap-2 mb-4">
                              <Badge 
                                variant="default" 
                                className="text-sm flex items-center gap-2 px-3 py-1.5 font-medium bg-primary/15 text-primary border-primary/30 hover:bg-primary/20"
                              >
                                {getRoleIcon(member.primaryRole)}
                                <span className="capitalize">{member.primaryRole}</span>
                              </Badge>
                              {member.secondaryRole && (
                                <Badge 
                                  variant="outline" 
                                  className="text-sm flex items-center gap-1 px-2 py-1 text-muted-foreground border-muted/50"
                                >
                                  {getRoleIcon(member.secondaryRole)}
                                  <span className="capitalize">{member.secondaryRole}</span>
                                </Badge>
                              )}
                            </div>
                            
                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                              <div className="text-center">
                                <div className="flex items-center justify-center mb-1">
                                  <Sword className="w-4 h-4 text-red-600" />
                                </div>
                                <div className="text-lg font-bold text-red-700">{member.capabilities.averageDPR.toFixed(1)}</div>
                                <div className="text-xs text-muted-foreground">DPR</div>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center mb-1">
                                  <Shield className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="text-lg font-bold text-blue-700">{member.capabilities.ac}</div>
                                <div className="text-xs text-muted-foreground">AC</div>
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center mb-1">
                                  <Heart className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="text-lg font-bold text-green-700">{member.capabilities.hitPoints}</div>
                                <div className="text-xs text-muted-foreground">HP</div>
                              </div>
                            </div>
                            
                            {/* Unique Contributions */}
                            {member.uniqueContributions.length > 0 && (
                              <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                  <Zap className="w-3 h-3" />
                                  Unique Abilities
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {member.uniqueContributions.slice(0, 3).map((contribution) => (
                                    <Badge key={contribution} variant="outline" className="text-xs px-2 py-0.5 bg-accent/10 text-accent border-accent/30">
                                      {contribution}
                                    </Badge>
                                  ))}
                                  {member.uniqueContributions.length > 3 && (
                                    <Badge variant="outline" className="text-xs px-2 py-0.5 bg-muted text-muted-foreground">
                                      +{member.uniqueContributions.length - 3} more
                                    </Badge>
                                  )}
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