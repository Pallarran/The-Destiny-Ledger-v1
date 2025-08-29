import * as React from "react"
import { cn } from "../../lib/utils"

interface ChartFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
}

const ChartFrame = React.forwardRef<HTMLDivElement, ChartFrameProps>(
  ({ className, title, subtitle, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("panel p-4", className)}
        {...props}
      >
        {(title || subtitle) && (
          <div className="mb-4 text-center">
            {title && (
              <h3 className="text-lg font-semibold text-ink mb-1">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-muted">{subtitle}</p>
            )}
          </div>
        )}
        <div className="w-full h-full">
          {children}
        </div>
      </div>
    )
  }
)
ChartFrame.displayName = "ChartFrame"

export { ChartFrame }