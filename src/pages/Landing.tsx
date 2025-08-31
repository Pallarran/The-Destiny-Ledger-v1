import { Link } from 'react-router-dom'
import { Panel } from '../components/ui/panel'
import { Card, CardContent } from '../components/ui/card'
import { 
  Archive, 
  User, 
  TrendingUp,
  Calculator,
  GitCompare,
  Users
} from 'lucide-react'

export function Landing() {
  const features = [
    {
      icon: User,
      title: "Character Builder",
      description: "Create optimized D&D 5e characters with multiclass progression and equipment.",
      link: "/builder",
      color: "text-accent"
    },
    {
      icon: Archive,
      title: "Vault",
      description: "Store and manage character builds with search and export tools.",
      link: "/vault", 
      color: "text-blue-500"
    },
    {
      icon: Calculator,
      title: "DPR Lab",
      description: "Mathematical damage analysis with probability distributions.",
      link: "/dpr",
      color: "text-emerald-500"
    },
    {
      icon: GitCompare,
      title: "Compare",
      description: "Multi-dimensional build analysis with radar charts and scoring.",
      link: "/compare",
      color: "text-purple-500"
    },
    {
      icon: TrendingUp,
      title: "Level Path Explorer", 
      description: "Optimize multiclass timing and ASI/feat decisions for power spikes.",
      link: "/explorer",
      color: "text-orange-500"
    },
    {
      icon: Users,
      title: "Party Optimizer",
      description: "Balance team compositions and optimize party synergies.",
      link: "/party",
      color: "text-cyan-500"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Panel */}
      <Panel className="text-center py-8">
        <div className="max-w-6xl mx-auto">
          {/* Logo */}
          <div className="mb-6">
            <img 
              src={`${import.meta.env.BASE_URL}destiny-ledger-logo-with-name.png`} 
              alt="The Destiny Ledger"
              className="mx-auto mb-4 max-w-md w-full h-auto"
            />
          </div>
          
          {/* App Description */}
          <div className="space-y-3 mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Master the Art of Character Optimization
            </h1>
            <p className="text-lg text-foreground/80 max-w-4xl mx-auto">
              The ultimate D&D 5e character optimizer featuring closed-form mathematical DPR calculations, 
              comprehensive build analysis, and multi-dimensional character comparison tools.
            </p>
          </div>

          {/* Feature Cards in Single Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <Card 
                  key={index} 
                  className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group border-border/20"
                >
                  <Link to={feature.link} className="block">
                    <CardContent className="p-4 text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors mb-3">
                          <IconComponent className={`w-6 h-6 ${feature.color} group-hover:scale-110 transition-transform`} />
                        </div>
                        <h3 className="font-semibold text-sm mb-2 text-foreground group-hover:text-accent transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-xs text-foreground/70 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              )
            })}
          </div>
        </div>
      </Panel>
    </div>
  )
}