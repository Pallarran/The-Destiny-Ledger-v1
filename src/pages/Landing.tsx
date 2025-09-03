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
      icon: Archive,
      title: "Vault",
      description: "Store and manage character builds with search and export tools.",
      link: "/vault", 
      color: "text-blue-500"
    },
    {
      icon: User,
      title: "Character Builder",
      description: "Create optimized D&D 5e characters with multiclass progression and equipment.",
      link: "/builder",
      color: "text-accent"
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
    <div className="w-full h-full flex flex-col items-start overflow-hidden">
      {/* Compact centered layout */}
      <div className="text-center max-w-7xl mx-auto px-4 pt-4 pb-4 flex-shrink-0">
        {/* Logo - smaller for single frame */}
        <div className="mb-8">
          <img 
            src={`${import.meta.env.BASE_URL}destiny-ledger-logo-with-name.png`} 
            alt="The Destiny Ledger"
            className="mx-auto w-full h-auto drop-shadow-2xl"
            style={{ maxWidth: '320px' }}
          />
        </div>
        
        {/* Compact Description */}
        <div className="mb-10">
          <h1 className="text-3xl font-serif font-bold text-ink tracking-wide mb-4">
            Master the Art of Character Optimization
          </h1>
          <p className="text-lg text-ink/80 max-w-4xl mx-auto">
            The ultimate D&D 5e character optimizer featuring closed-form mathematical DPR calculations, 
            comprehensive build analysis, and multi-dimensional character comparison tools.
          </p>
        </div>

        {/* 6 Feature Cards in Single Row */}
        <div className="grid grid-cols-6 gap-4 overflow-visible">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Link 
                key={index}
                to={feature.link} 
                className="block bg-panel rounded-xl p-4 hover:shadow-xl transition-all duration-300 group border-2 border-gold hover:border-accent">
                <div className="text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gold/20 to-gold/5 rounded-xl flex items-center justify-center group-hover:from-gold/30 group-hover:to-gold/10 transition-all mb-3">
                      <IconComponent className={`w-6 h-6 ${feature.color} transition-colors drop-shadow-sm`} />
                    </div>
                    <h3 className="text-sm font-serif font-bold text-ink group-hover:text-gold transition-colors mb-2 tracking-wide leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-ink/70 leading-relaxed group-hover:text-ink/90 transition-colors line-clamp-3">
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
  )
}