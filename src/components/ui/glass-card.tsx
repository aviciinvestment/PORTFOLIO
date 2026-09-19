import * as React from "react"
import { cn } from "@/lib/utils"

const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "darker" | "amber" }
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl glass-panel p-6 relative overflow-hidden transition-all duration-300 hover:shadow-xl",
        variant === "darker" && "bg-black/20 dark:bg-black/40",
        variant === "amber" && "border-primary/30 shadow-primary/10",
        className
      )}
      {...props}
    />
  )
})
GlassCard.displayName = "GlassCard"

export { GlassCard }
