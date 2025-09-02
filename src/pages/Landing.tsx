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
    <div className="space-y-12">
      {/* Main content area */}
      <div className="text-center">
        <div className="max-w-5xl mx-auto">
          {/* Logo */}
          <div className="mb-12">
            <img 
              src={`${import.meta.env.BASE_URL}destiny-ledger-logo-with-name.png`} 
              alt="The Destiny Ledger"
              className="mx-auto w-full h-auto drop-shadow-2xl"
              style={{ maxWidth: '450px' }}
            />
          </div>
          
          {/* App Description */}
          <div className="space-y-6 mb-16">
            <h1 className="text-4xl font-serif font-bold text-ink tracking-wide">
              Master the Art of Character Optimization
            </h1>
            <p className="text-xl text-ink/80 max-w-4xl mx-auto leading-relaxed">
              The ultimate D&D 5e character optimizer featuring closed-form mathematical DPR calculations, 
              comprehensive build analysis, and multi-dimensional character comparison tools.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <Link 
                  key={index}
                  to={feature.link} 
                  className="block bg-ink/5 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-ink/10 group border border-ink/10 hover:border-gold/50">
                  <div className="text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-gold/20 to-gold/5 rounded-2xl flex items-center justify-center group-hover:from-gold/30 group-hover:to-gold/10 transition-all mb-6 border border-gold/20">
                        <IconComponent className={`w-10 h-10 ${feature.color} group-hover:scale-110 transition-transform drop-shadow-sm`} />
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-ink group-hover:text-gold transition-colors mb-3 tracking-wide">
                        {feature.title}
                      </h3>
                      <p className="text-base text-ink/70 leading-relaxed group-hover:text-ink/90 transition-colors">
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