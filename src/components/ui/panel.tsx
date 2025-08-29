import * as React from "react"
import { cn } from "../../lib/utils"

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {}

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("panel p-4 md:p-6", className)}
        {...props}
      />
    )
  }
)
Panel.displayName = "Panel"

interface PanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
}

const PanelHeader = React.forwardRef<HTMLDivElement, PanelHeaderProps>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between bg-ink text-panel px-4 py-2 -mx-4 md:-mx-6 -mt-4 md:-mt-6 mb-4", className)}
        {...props}
      >
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        {children}
      </div>
    )
  }
)
PanelHeader.displayName = "PanelHeader"

export { Panel, PanelHeader }