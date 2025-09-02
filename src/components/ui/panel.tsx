import * as React from "react"
import { cn } from "../../lib/utils"

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "fantasy" | "ornate"
}

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "panel",
      fantasy: "fantasy-card",
      ornate: "ornate-panel"
    }

    return (
      <div
        ref={ref}
        className={cn(variantClasses[variant], "p-4 md:p-6", className)}
        {...props}
      />
    )
  }
)
Panel.displayName = "Panel"

interface PanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  variant?: "default" | "fantasy"
}

const PanelHeader = React.forwardRef<HTMLDivElement, PanelHeaderProps>(
  ({ className, title, children, variant = "default", ...props }, ref) => {
    const headerClasses = variant === "fantasy" 
      ? "fantasy-header flex items-center justify-between px-4 py-3 -mx-4 md:-mx-6 -mt-4 md:-mt-6 mb-4 rounded-t-xl"
      : "flex items-center justify-between bg-ink text-panel px-4 py-2 -mx-4 md:-mx-6 -mt-4 md:-mt-6 mb-4"

    const titleClasses = variant === "fantasy"
      ? "text-lg font-serif font-semibold tracking-wide"
      : "text-lg font-semibold"

    return (
      <div
        ref={ref}
        className={cn(headerClasses, className)}
        {...props}
      >
        {title && <h2 className={titleClasses}>{title}</h2>}
        {children}
      </div>
    )
  }
)
PanelHeader.displayName = "PanelHeader"

export { Panel, PanelHeader }