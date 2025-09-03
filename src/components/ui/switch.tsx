import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-gold/30 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-accent data-[state=checked]:border-accent data-[state=unchecked]:bg-ink/20 data-[state=unchecked]:border-gold/30 shadow-lg",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full bg-panel shadow-lg ring-0 transition-all duration-300 data-[state=checked]:translate-x-5 data-[state=checked]:shadow-xl data-[state=unchecked]:translate-x-0 data-[state=checked]:bg-white"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }