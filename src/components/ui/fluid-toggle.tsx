"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FluidToggleProps {
  isOn: boolean
  onToggle: () => void
  labelLeft?: string
  labelRight?: string
  className?: string
}

export function FluidToggle({
  isOn,
  onToggle,
  labelLeft = "Sleep",
  labelRight = "Work",
  className,
}: FluidToggleProps) {
  return (
    <div
      className={cn(
        "relative flex items-center w-64 h-24 p-2 rounded-full cursor-pointer overflow-hidden backdrop-blur-md border border-white/20 transition-colors duration-500",
        isOn ? "bg-primary/20 justify-end" : "bg-white/10 dark:bg-black/30 justify-start",
        className
      )}
      onClick={onToggle}
    >
      {/* Background glowing effect inside the track */}
      <div className={cn("absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-500", isOn && "opacity-100")} />
      
      {/* Labels */}
      <div className="absolute inset-0 z-10 flex w-full items-center justify-around font-medium text-lg tracking-wide pointer-events-none">
        <span className={cn("transition-colors duration-300", !isOn ? "text-foreground font-semibold" : "text-foreground/50")}>{labelLeft}</span>
        <span className={cn("transition-colors duration-300", isOn ? "text-foreground font-semibold" : "text-foreground/50")}>{labelRight}</span>
      </div>

      {/* The fluid glass orb */}
      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
        className={cn(
          "relative z-20 w-20 h-20 rounded-full flex items-center justify-center shadow-lg backdrop-blur-2xl border",
          isOn ? "border-primary/50 shadow-primary/40 bg-gradient-to-br from-primary/80 to-primary/20" : "border-white/30 bg-gradient-to-br from-white/40 to-white/10"
        )}
      >
        {/* Inner orb reflection for 3D effect */}
        <div className="absolute top-1 left-2 w-10 h-6 bg-white/40 rounded-full blur-[2px] opacity-70" />
        <div className="absolute bottom-2 right-2 w-8 h-4 bg-black/20 rounded-full blur-[2px] opacity-50" />
        <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
      </motion.div>
    </div>
  )
}
