import { useState } from 'react'
import { ClassEditor } from '../components/homebrew/ClassEditor'
import { Panel } from '../components/ui/panel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { 
  Scroll,
  Wand2,
  Shield,
  Swords,
  BookOpen,
  Plus,
  Import,
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

// Homebrew content categories
const CONTENT_CATEGORIES = [
  { id: 'classes', name: 'Classes', icon: Swords, description: 'Custom character classes with subclasses' },
  { id: 'subclasses', name: 'Subclasses', icon: Shield, description: 'Specialized archetypes for existing classes' },
  { id: 'feats', name: 'Feats', icon: Wand2, description: 'Character abilities and special talents' },
  { id: 'spells', name: 'Spells', icon: BookOpen, description: 'Custom magic and supernatural abilities' },
  { id: 'items', name: 'Magic Items', icon: Scroll, description: 'Weapons, armor, and magical objects' }
] as const

type ContentCategory = typeof CONTENT_CATEGORIES[number]['id']

// Mock homebrew content for UI development
const mockHomebrewContent = {
  classes: [
    { id: 'artificer-extended', name: 'Artificer (Extended)', type: 'class', author: 'User', status: 'published' },
    { id: 'mystic', name: 'Mystic', type: 'class', author: 'User', status: 'draft' }
  ],
  subclasses: [
    { id: 'oath-of-redemption', name: 'Oath of Redemption', type: 'subclass', author: 'User', status: 'published' },
    { id: 'school-of-chronurgy', name: 'School of Chronurgy', type: 'subclass', author: 'User', status: 'testing' }
  ],
  feats: [
    { id: 'elemental-adept-extended', name: 'Elemental Adept (Extended)', type: 'feat', author: 'User', status: 'published' },
    { id: 'metamagic-mastery', name: 'Metamagic Mastery', type: 'feat', author: 'User', status: 'draft' }
  ],
  spells: [
    { id: 'time-stop-lesser', name: 'Lesser Time Stop', type: 'spell', author: 'User', status: 'published' },
    { id: 'elemental-weapon-improved', name: 'Improved Elemental Weapon', type: 'spell', author: 'User', status: 'testing' }
  ],
  items: [
    { id: 'staff-of-power-enhanced', name: 'Enhanced Staff of Power', type: 'item', author: 'User', status: 'published' },
    { id: 'ring-of-spell-storing-major', name: 'Major Ring of Spell Storing', type: 'item', author: 'User', status: 'draft' }
  ]
}

export function HomebrewEditor() {
  const [activeCategory, setActiveCategory] = useState<ContentCategory>('classes')
  const [selectedContent, setSelectedContent] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  const getStatusBadge = (status: string) => {
    const variants = {
      published: 'default',
      draft: 'secondary', 
      testing: 'outline'
    } as const
    
    const colors = {
      published: 'bg-green-500/10 text-green-600 border-green-500/20',
      draft: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      testing: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    }

    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || 'secondary'} 
        className={`text-xs ${colors[status as keyof typeof colors] || ''}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const currentContent = mockHomebrewContent[activeCategory] || []

  const handleCreateNew = () => {
    setEditingItem(null)
    setIsEditing(true)
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setIsEditing(true)
  }

  const handleSave = (data: any) => {
    console.log('Saving:', data)
    // TODO: Implement actual save logic
    setIsEditing(false)
    setEditingItem(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingItem(null)
  }

  // Show editor if editing
  if (isEditing && activeCategory === 'classes') {
    return (
      <ClassEditor
        initialClass={editingItem}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Panel>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-panel mb-2">Homebrew Editor</h2>
            <p className="text-muted">
              Create and manage custom D&D 5e content. Design your own classes, feats, spells, and magic items 
              with built-in validation and preview systems.
            </p>
          </div>
          
          <div className="flex items-center gap-2 ml-6">
            <Button variant="outline" size="sm" className="gap-2">
              <Import className="w-4 h-4" />
              Import Pack
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export All
            </Button>
          </div>
        </div>
      </Panel>

      {/* Content Categories */}
      <Panel>
        <Tabs value={activeCategory} onValueChange={(value) => setActiveCategory(value as ContentCategory)}>
          <TabsList className="grid w-full grid-cols-5">
            {CONTENT_CATEGORIES.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                <category.icon className="w-4 h-4" />
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {CONTENT_CATEGORIES.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <div className="flex items-start gap-6">
                {/* Content List */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-panel flex items-center gap-2">
                        <category.icon className="w-5 h-5" />
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted">{category.description}</p>
                    </div>
                    <Button size="sm" className="gap-2" onClick={handleCreateNew}>
                      <Plus className="w-4 h-4" />
                      Create New
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {currentContent.length === 0 ? (
                      <div className="text-center py-12 text-muted">
                        <category.icon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No custom {category.name.toLowerCase()} created yet.</p>
                        <p className="text-sm">Click "Create New" to get started!</p>
                      </div>
                    ) : (
                      currentContent.map((item) => (
                        <div 
                          key={item.id}
                          className={`flex items-center justify-between p-4 border border-border rounded-lg transition-colors cursor-pointer ${
                            selectedContent === item.id 
                              ? 'bg-panel/10 border-accent' 
                              : 'hover:bg-panel/5'
                          }`}
                          onClick={() => setSelectedContent(item.id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-medium">{item.name}</h4>
                              {getStatusBadge(item.status)}
                            </div>
                            <p className="text-sm text-muted">
                              by {item.author} • {item.type}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Eye className="w-3 h-3" />
                              Preview
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="gap-1"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEdit(item)
                              }}
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive">
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick Actions Sidebar */}
                <div className="w-64 shrink-0">
                  <div className="bg-panel/5 rounded-lg p-4">
                    <h4 className="font-semibold text-panel mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start gap-2"
                        onClick={handleCreateNew}
                      >
                        <Plus className="w-4 h-4" />
                        Create {category.name.slice(0, -1)}
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                        <Import className="w-4 h-4" />
                        Import from JSON
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                        <BookOpen className="w-4 h-4" />
                        Browse Templates
                      </Button>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="text-sm text-muted">
                      <p className="font-medium mb-2">Content Stats</p>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Published:</span>
                          <span>{currentContent.filter(item => item.status === 'published').length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Drafts:</span>
                          <span>{currentContent.filter(item => item.status === 'draft').length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Testing:</span>
                          <span>{currentContent.filter(item => item.status === 'testing').length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Panel>

      {/* Getting Started Guide */}
      {currentContent.length === 0 && (
        <Panel>
          <div className="text-center py-8">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted" />
            <h3 className="text-xl font-semibold text-panel mb-2">Getting Started with Homebrew</h3>
            <p className="text-muted mb-6 max-w-2xl mx-auto">
              The Homebrew Editor lets you create custom D&D 5e content that integrates seamlessly with the character builder. 
              All content is validated against D&D 5e rules and can be shared with other users.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Edit className="w-6 h-6 text-accent" />
                </div>
                <h4 className="font-medium mb-2">Create Content</h4>
                <p className="text-sm text-muted">Use our visual editors to design classes, feats, spells, and items</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-6 h-6 text-accent" />
                </div>
                <h4 className="font-medium mb-2">Test & Preview</h4>
                <p className="text-sm text-muted">Preview your content and test it with the character builder</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Download className="w-6 h-6 text-accent" />
                </div>
                <h4 className="font-medium mb-2">Share & Export</h4>
                <p className="text-sm text-muted">Export homebrew packs to share with friends and the community</p>
              </div>
            </div>
          </div>
        </Panel>
      )}
    </div>
  )
}