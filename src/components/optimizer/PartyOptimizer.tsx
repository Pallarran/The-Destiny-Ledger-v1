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
      saveAnalysisToHistory(`Party Analysis ${new Date().toLocaleDateString()}`)
      // Show success message and auto-switch to Analysis tab
      setShowSuccessMessage(true)
      setSelectedTab('analysis')
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
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-lg">
              <TabsTrigger 
                value="composition" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                <Users className="w-4 h-4" />
                Party Setup
                {selectedTab === 'composition' && <div className="w-2 h-2 bg-primary-foreground rounded-full ml-1"></div>}
              </TabsTrigger>
              <TabsTrigger 
                value="analysis" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                <TrendingUp className="w-4 h-4" />
                Analysis & Recommendations
                {selectedTab === 'analysis' && <div className="w-2 h-2 bg-primary-foreground rounded-full ml-1"></div>}
              </TabsTrigger>
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


            {/* Analysis Tab - Compact layout with side-by-side sections */}
            <TabsContent value="analysis" className="space-y-4">
              {currentAnalysis ? (
                <div className="space-y-4">
                  
                  {/* Top Row: Key Metrics + Role Coverage */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    
                    {/* Overall Analysis - Compact */}
                    <Card className="bg-gradient-to-r from-primary/5 via-background to-accent/5 border-primary/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          Party Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center space-y-1 p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                            <Users className="w-6 h-6 text-blue-600 mx-auto" />
                            <div className="text-2xl font-bold text-blue-700">{currentAnalysis.size}</div>
                            <div className="text-xs font-medium text-blue-600">Members</div>
                          </div>
                          <div className="text-center space-y-1 p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                            <TrendingUp className="w-6 h-6 text-green-600 mx-auto" />
                            <div className="text-2xl font-bold text-green-700">{currentAnalysis.averageLevel.toFixed(1)}</div>
                            <div className="text-xs font-medium text-green-600">Avg Level</div>
                          </div>
                          <div className="text-center space-y-1 p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                            <Zap className="w-6 h-6 text-purple-600 mx-auto" />
                            <div className="text-2xl font-bold text-purple-700">{currentAnalysis.synergyScore.toFixed(1)}</div>
                            <div className="text-xs font-medium text-purple-600">Synergy</div>
                          </div>
                          <div className="text-center space-y-1 p-3 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                            <Target className="w-6 h-6 text-orange-600 mx-auto" />
                            <div className="text-2xl font-bold text-orange-700">{currentAnalysis.synergies.length}</div>
                            <div className="text-xs font-medium text-orange-600">Combos</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Role Coverage - Compact */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          Role Coverage
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {Object.entries(currentAnalysis.roleCoverage).map(([role, score]) => (
                            <div key={role} className="flex items-center gap-3">
                              <div className={`p-1.5 rounded ${score >= 8 ? 'bg-green-100 text-green-700' : score >= 6 ? 'bg-yellow-100 text-yellow-700' : score >= 4 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                {getRoleIcon(role as PartyRole)}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium capitalize text-sm">{role}</div>
                                <div className="relative">
                                  <Progress 
                                    value={Math.min(score * 10, 100)} 
                                    className={`h-2 ${
                                      score >= 8 ? '[&>div]:bg-green-500' : 
                                      score >= 6 ? '[&>div]:bg-yellow-500' : 
                                      score >= 4 ? '[&>div]:bg-orange-500' : 
                                      '[&>div]:bg-red-500'
                                    }`} 
                                  />
                                </div>
                              </div>
                              <div className={`text-sm font-bold ${getRoleColor(score)} min-w-[2.5rem] text-right`}>
                                {score.toFixed(1)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                  </div>

                  {/* Bottom Row: Issues & Recommendations + Party Members */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    
                    {/* Issues & Recommendations - Compact */}
                    {(currentAnalysis.weaknesses.length > 0 || currentAnalysis.recommendations.length > 0) && (
                      <Card className="bg-gradient-to-r from-amber-50/50 via-background to-red-50/50 border-amber-200/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                            Issues & Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="max-h-96 overflow-y-auto space-y-3">
                          
                          {/* Weaknesses - Compact */}
                          {currentAnalysis.weaknesses.map((weakness, index) => (
                            <div key={`weakness-${index}`} className={`p-3 rounded-lg border-l-2 ${
                              weakness.severity === 'major' ? 'bg-red-50 border-l-red-500' :
                              weakness.severity === 'moderate' ? 'bg-orange-50 border-l-orange-500' :
                              'bg-yellow-50 border-l-yellow-500'
                            }`}>
                              <div className="flex items-start gap-2">
                                <AlertCircle className={`w-3 h-3 mt-0.5 ${
                                  weakness.severity === 'major' ? 'text-red-600' :
                                  weakness.severity === 'moderate' ? 'text-orange-600' :
                                  'text-yellow-600'
                                }`} />
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={`text-xs ${getSeverityColor(weakness.severity)}`}>
                                      {weakness.severity}
                                    </Badge>
                                    <span className="font-medium text-xs capitalize">
                                      {weakness.type.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <p className="text-xs text-foreground/80">{weakness.description}</p>
                                  <div className="text-xs text-muted-foreground">
                                    Solutions: {weakness.suggestions.join(' • ')}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Recommendations - Compact */}
                          {currentAnalysis.recommendations.map((recommendation, index) => (
                            <div key={`rec-${index}`} className="p-3 rounded-lg bg-blue-50 border border-blue-200 border-l-2 border-l-blue-500">
                              <div className="flex items-start gap-2">
                                <Info className="w-3 h-3 text-blue-600 mt-0.5" />
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={`text-xs ${
                                      recommendation.priority === 'high' ? 'border-red-500 text-red-700 bg-red-50' :
                                      recommendation.priority === 'medium' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                                      'border-gray-500 text-gray-700 bg-gray-50'
                                    }`}>
                                      {recommendation.priority}
                                    </Badge>
                                    <span className="font-medium text-xs capitalize">
                                      {recommendation.type.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <p className="text-xs text-foreground/80">{recommendation.description}</p>
                                  <div className="text-xs text-blue-600 font-medium">
                                    Expected: {recommendation.expectedImprovement}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                        </CardContent>
                      </Card>
                    )}

                    {/* Party Members - Compact */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Party Members
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="max-h-96 overflow-y-auto space-y-3">
                        {currentAnalysis.members.map((member) => (
                          <div key={member.buildId} className="border border-border/60 rounded-lg p-3 bg-gradient-to-br from-card to-muted/30">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-sm">{member.buildName}</div>
                              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                L{member.level}
                              </Badge>
                            </div>
                            
                            {/* Role Badges - Compact */}
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="default" className="text-xs flex items-center gap-1 px-2 py-0.5 bg-primary/15 text-primary">
                                {getRoleIcon(member.primaryRole)}
                                {member.primaryRole}
                              </Badge>
                              {member.secondaryRole && (
                                <Badge variant="outline" className="text-xs flex items-center gap-1 px-1 py-0.5">
                                  {getRoleIcon(member.secondaryRole)}
                                  {member.secondaryRole}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Stats - Compact */}
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-1 text-red-600">
                                <Sword className="w-3 h-3" />
                                {member.capabilities.averageDPR.toFixed(0)} DPR
                              </div>
                              <div className="flex items-center gap-1 text-blue-600">
                                <Shield className="w-3 h-3" />
                                {member.capabilities.ac} AC
                              </div>
                              <div className="flex items-center gap-1 text-green-600">
                                <Heart className="w-3 h-3" />
                                {member.capabilities.hitPoints} HP
                              </div>
                            </div>
                            
                            {/* Unique Contributions - Compact */}
                            {member.uniqueContributions.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {member.uniqueContributions.slice(0, 2).map((contribution) => (
                                  <Badge key={contribution} variant="outline" className="text-xs px-1.5 py-0 bg-accent/10">
                                    {contribution}
                                  </Badge>
                                ))}
                                {member.uniqueContributions.length > 2 && (
                                  <Badge variant="outline" className="text-xs px-1.5 py-0 bg-muted">
                                    +{member.uniqueContributions.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    
                  </div>

                  {/* Synergies Section - If needed */}
                  {currentAnalysis.synergies.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          Party Synergies
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {currentAnalysis.synergies.map((synergy, index) => (
                            <div key={index} className="border border-accent/20 rounded-lg p-3 bg-gradient-to-br from-purple-50/30 to-accent/5">
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-medium text-sm">{synergy.name}</div>
                                <Badge className="bg-accent/10 text-accent text-xs">
                                  {synergy.estimatedBenefit}/10
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">{synergy.description}</div>
                              {synergy.requirements && (
                                <div className="text-xs text-muted-foreground mt-1 italic">
                                  Requires: {synergy.requirements.join(', ')}
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


          </Tabs>
          
        </CardContent>
      </Card>
    </div>
  )
}