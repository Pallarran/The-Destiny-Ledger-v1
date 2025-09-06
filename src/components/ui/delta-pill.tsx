import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface DeltaPillProps {
  value: number
  className?: string
  showIcon?: boolean
  precision?: number
  additionalMetrics?: {
    hitChanceDelta?: number
    critChanceDelta?: number
  }
}

export function DeltaPill({ value, className, showIcon = true, precision = 1, additionalMetrics }: DeltaPillProps) {
  const isPositive = value > 0.05 // Small threshold to avoid floating point noise
  const isNegative = value < -0.05
  const isNeutral = !isPositive && !isNegative
  
  const formattedValue = Math.abs(value).toFixed(precision)
  
  const baseClasses = "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full"
  
  let colorClasses: string
  let icon = null
  
  if (isPositive) {
    colorClasses = "bg-green-500/10 text-green-600 border border-green-500/20"
    icon = showIcon ? <TrendingUp className="w-3 h-3" /> : null
  } else if (isNegative) {
    colorClasses = "bg-red-500/10 text-red-600 border border-red-500/20"
    icon = showIcon ? <TrendingDown className="w-3 h-3" /> : null
  } else {
    colorClasses = "bg-muted/10 text-muted border border-muted/20"
    icon = showIcon ? <Minus className="w-3 h-3" /> : null
  }
  
  const hasAdditionalMetrics = additionalMetrics && (
    additionalMetrics.hitChanceDelta !== undefined || additionalMetrics.critChanceDelta !== undefined
  )
  
  return (
    <span 
      className={cn(baseClasses, colorClasses, className)}
      title={hasAdditionalMetrics ? 
        `DPR: ${isPositive ? '+' : isNegative ? '−' : '±'}${formattedValue}` + 
        (additionalMetrics?.hitChanceDelta ? ` | Hit: ${additionalMetrics.hitChanceDelta > 0 ? '+' : ''}${(additionalMetrics.hitChanceDelta * 100).toFixed(1)}%` : '') +
        (additionalMetrics?.critChanceDelta ? ` | Crit: ${additionalMetrics.critChanceDelta > 0 ? '+' : ''}${(additionalMetrics.critChanceDelta * 100).toFixed(1)}%` : '')
        : undefined
      }
    >
      {icon}
      <span>
        {isPositive && '+'}
        {isNegative && '−'}
        {isNeutral ? '±' : ''}
        {formattedValue} DPR
      </span>
    </span>
  )
}