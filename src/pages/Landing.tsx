import { Link } from 'react-router-dom'
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
    <div className="space-y-8">
      {/* Main content area - no panel needed since whole app is framed */}
      <div className="text-center">
        <div className="max-w-6xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src={`${import.meta.env.BASE_URL}destiny-ledger-logo-with-name.png`} 
              alt="The Destiny Ledger"
              className="mx-auto mb-4 w-full h-auto drop-shadow-2xl"
              style={{ maxWidth: '400px' }}
            />
          </div>
          
          {/* App Description */}
          <div className="space-y-4 mb-12 bg-panel/90 backdrop-blur-sm rounded-lg p-8 shadow-xl border-2 border-gold/30">
            <h1 className="text-3xl font-serif font-bold text-ink">
              Master the Art of Character Optimization
            </h1>
            <p className="text-lg text-ink/90 max-w-4xl mx-auto font-medium">
              The ultimate D&D 5e character optimizer featuring closed-form mathematical DPR calculations, 
              comprehensive build analysis, and multi-dimensional character comparison tools.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <Link 
                  key={index}
                  to={feature.link} 
                  className="block bg-panel/90 backdrop-blur-sm rounded-lg p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-gold/20 hover:border-gold/50 group">
                  <div className="text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex-shrink-0 w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center group-hover:bg-gold/20 transition-colors mb-4 border-2 border-gold/30">
                        <IconComponent className={`w-8 h-8 ${feature.color} group-hover:scale-110 transition-transform`} />
                      </div>
                      <h3 className="text-xl font-serif font-bold text-ink group-hover:text-gold transition-colors mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-ink/80 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}