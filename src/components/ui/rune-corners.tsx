import * as React from "react"
import { cn } from "../../lib/utils"

interface RuneCornersProps extends React.HTMLAttributes<HTMLDivElement> {
  opacity?: number
}

const RuneCorners = React.forwardRef<HTMLDivElement, RuneCornersProps>(
  ({ className, opacity = 0.4, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("absolute inset-0 pointer-events-none", className)}
        style={{ opacity }}
        {...props}
      >
        {/* Top Left Rune Corner */}
        <svg
          className="absolute top-2 left-2 w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 3l6 6M3 3v6M3 3h6" />
          <circle cx="7" cy="7" r="1" fill="currentColor" />
        </svg>

        {/* Top Right Rune Corner */}
        <svg
          className="absolute top-2 right-2 w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M21 3l-6 6M21 3v6M21 3h-6" />
          <circle cx="17" cy="7" r="1" fill="currentColor" />
        </svg>

        {/* Bottom Left Rune Corner */}
        <svg
          className="absolute bottom-2 left-2 w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 21l6-6M3 21v-6M3 21h6" />
          <circle cx="7" cy="17" r="1" fill="currentColor" />
        </svg>

        {/* Bottom Right Rune Corner */}
        <svg
          className="absolute bottom-2 right-2 w-6 h-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M21 21l-6-6M21 21v-6M21 21h-6" />
          <circle cx="17" cy="17" r="1" fill="currentColor" />
        </svg>
      </div>
    )
  }
)
RuneCorners.displayName = "RuneCorners"

export { RuneCorners }