import { Link } from 'react-router-dom'
import { Panel } from '../components/ui/panel'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { 
  Archive, 
  User, 
  TrendingUp,
  Shield,
  Calculator,
  Users
} from 'lucide-react'

export function Landing() {
  const features = [
    {
      icon: User,
      title: "Character Builder",
      description: "Create and customize D&D 5e characters with multiple ability score methods, multiclass progression, and equipment optimization.",
      link: "/builder",
      color: "text-accent"
    },
    {
      icon: Archive,
      title: "Build Vault",
      description: "Store, organize, and manage your character builds with tags, search, and export functionality.",
      link: "/vault", 
      color: "text-accent"
    },
    {
      icon: Calculator,
      title: "DPR Laboratory",
      description: "Advanced mathematical damage per round analysis with probability distributions and optimization thresholds.",
      link: "/dpr",
      color: "text-emerald-500"
    },
    {
      icon: Users,
      title: "Build Comparison",
      description: "Multi-dimensional character analysis with radar charts, survivability metrics, and role effectiveness scoring.",
      link: "/compare",
      color: "text-blue-500"
    },
    {
      icon: TrendingUp,
      title: "Progression Optimizer", 
      description: "Strategic multiclass timing analysis for optimal ASI/feat decisions and power spike maximization.",
      link: "/explorer",
      color: "text-purple-500"
    },
    {
      icon: Shield,
      title: "Build Analysis",
      description: "Comprehensive character evaluation including combat effectiveness, utility capabilities, and optimization suggestions.",
      link: "/builder",
      color: "text-orange-500"
    }
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <Panel className="text-center py-12">
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src={`${import.meta.env.BASE_URL}destiny-ledger-logo-with-name.png`} 
              alt="The Destiny Ledger"
              className="mx-auto mb-6 max-w-md w-full h-auto"
            />
          </div>
          
          {/* App Description */}
          <div className="space-y-4 mb-12">
            <h1 className="text-2xl font-bold text-foreground">
              Master the Art of Character Optimization
            </h1>
            <p className="text-lg text-foreground/80 max-w-3xl mx-auto">
              The ultimate D&D 5e character optimizer featuring closed-form mathematical DPR calculations, 
              comprehensive build analysis, and multi-dimensional character comparison tools.
            </p>
          </div>

          {/* Call to Action */}
          <div className="flex justify-center gap-4 mb-12">
            <Button asChild variant="accent" size="lg">
              <Link to="/builder">
                <User className="w-5 h-5 mr-2" />
                Start Building
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/vault">
                <Archive className="w-5 h-5 mr-2" />
                View Vault
              </Link>
            </Button>
          </div>
        </div>
      </Panel>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group border-border/20"
              >
                <Link to={feature.link} className="block">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <IconComponent className={`w-6 h-6 ${feature.color} group-hover:scale-110 transition-transform`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2 text-foreground group-hover:text-accent transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-foreground/70 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}