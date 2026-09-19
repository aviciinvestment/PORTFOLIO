"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface LiquidGlassPillProps {
  children: ReactNode
  glowColor: string
  className?: string
  delay?: number
}

export function LiquidGlassPill({ children, glowColor, className = "", delay = 0 }: LiquidGlassPillProps) {
  return (
    <motion.div
      drag
      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
      dragElastic={0.4}
      whileDrag={{ scale: 1.1, cursor: "grabbing" }}
      animate={{ y: [0, -10, 0] }}
      transition={{ 
        y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
        scale: { type: "spring", stiffness: 300, damping: 20 }
      }}
      className={`relative cursor-grab rounded-full p-[2px] ${className}`}
      style={{
        // The outer glowing shadow casting on the wall
        filter: `drop-shadow(0 20px 30px ${glowColor}50)`,
      }}
    >
      {/* The Glass Body */}
      <div 
        className="relative flex items-center justify-center rounded-full px-6 py-3 bg-[#0a0604]/60 backdrop-blur-xl overflow-hidden"
        style={{
          boxShadow: `
            inset 0 2px 4px 0 rgba(255, 255, 255, 0.4), /* Top inner highlight */
            inset 0 -2px 4px 0 rgba(0, 0, 0, 0.8),      /* Bottom inner shadow */
            inset 0 0 10px 0 ${glowColor}60             /* Subtle colored inner glow */
          `
        }}
      >
        {/* Top edge reflection curve */}
        <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-[80%] h-[10px] rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10 text-white font-medium tracking-wide">
          {children}
        </div>
      </div>
    </motion.div>
  )
}
