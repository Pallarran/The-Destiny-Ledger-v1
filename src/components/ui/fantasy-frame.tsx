import * as React from "react"
import { cn } from "../../lib/utils"

interface FantasyFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "ornate" | "card"
  title?: string
  showFrame?: boolean
}

const FantasyFrame = React.forwardRef<HTMLDivElement, FantasyFrameProps>(
  ({ className, variant = "default", title, showFrame = true, children, ...props }, ref) => {
    const baseClasses = {
      default: "fantasy-frame",
      ornate: "ornate-panel",
      card: "fantasy-card"
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses[variant],
          !showFrame && "border-0 shadow-etched bg-panel",
          className
        )}
        {...props}
      >
        {title && (
          <div className="fantasy-header -mx-6 -mt-6 mb-6 px-6 py-3 rounded-t-xl">
            <h2 className="text-xl font-serif font-semibold tracking-wide">
              {title}
            </h2>
          </div>
        )}
        {children}
      </div>
    )
  }
)
FantasyFrame.displayName = "FantasyFrame"

interface FantasyPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode
  title?: string
}

const FantasyPanel = React.forwardRef<HTMLDivElement, FantasyPanelProps>(
  ({ className, header, title, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("fantasy-card p-6", className)}
        {...props}
      >
        {(header || title) && (
          <div className="fantasy-header -mx-6 -mt-6 mb-6 px-6 py-4">
            {title && (
              <h3 className="text-lg font-serif font-semibold">
                {title}
              </h3>
            )}
            {header}
          </div>
        )}
        {children}
      </div>
    )
  }
)
FantasyPanel.displayName = "FantasyPanel"

export { FantasyFrame, FantasyPanel }