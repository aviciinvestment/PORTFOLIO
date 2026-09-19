"use client"

import { useEffect, useMemo, useRef } from "react"
import Matter from "matter-js"

const PALETTE = [
  "#FF5C00",
  "#0075FF",
  "#10b981",
  "#a855f7",
  "#f59e0b",
  "#06b6d4",
]

const POSITIONS = [
  { x: 110, y: 60 },
  { x: 260, y: 20 },
  { x: 200, y: 120 },
  { x: 310, y: 140 },
  { x: 60, y: 130 },
  { x: 330, y: 80 },
]

const FALLBACK = [
  { id: "react", label: "React" },
  { id: "nextjs", label: "Next.js" },
  { id: "tailwind", label: "Tailwind" },
]

export type PhysicsItem = { id: string; label: string }

type PillsItem = {
  id: string
  label: string
  glow: string
  pos: { x: number; y: number }
}

export function PhysicsSkills({ skills }: { skills?: PhysicsItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pillRefs = useRef<(HTMLDivElement | null)[]>([])

  const items: PillsItem[] = useMemo(() => {
    const source = skills && skills.length > 0 ? skills : FALLBACK
    return source.slice(0, PALETTE.length).map((skill, i) => ({
      id: skill.id,
      label: skill.label,
      glow: PALETTE[i % PALETTE.length],
      pos: POSITIONS[i % POSITIONS.length],
    }))
  }, [skills])

  useEffect(() => {
    if (!containerRef.current) return

    const engine = Matter.Engine.create()
    const world = engine.world

    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    const wallOptions = { isStatic: true, render: { visible: false } }

    Matter.World.add(world, [
      Matter.Bodies.rectangle(width / 2, height - 25, width * 2, 100, wallOptions),
      Matter.Bodies.rectangle(width / 2, -1000, width * 2, 100, wallOptions),
      Matter.Bodies.rectangle(-50, height / 2, 100, height * 2, wallOptions),
      Matter.Bodies.rectangle(width + 50, height / 2, 100, height * 2, wallOptions),
    ])

    const bodies = items.map((item, index) => {
      // Spawn items near the center top so they don't spawn outside walls on narrow screens
      const startX = (width / 2) + (Math.random() * 100 - 50);
      const startY = 50 + (index * 20);
      
      return Matter.Bodies.rectangle(startX, startY, 140, 50, {
        chamfer: { radius: 25 },
        restitution: 0.9,
        friction: 0.05,
        frictionAir: 0.005,
        density: 0.005,
      })
    })

    Matter.World.add(world, bodies)

    const mouse = Matter.Mouse.create(containerRef.current)
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.8,
        render: { visible: false },
      },
    })

    Matter.World.add(world, mouseConstraint)

    let animationFrameId: number

    const renderLoop = () => {
      Matter.Engine.update(engine, 1000 / 60)
      bodies.forEach((body, i) => {
        const domElement = pillRefs.current[i]
        if (domElement) {
          const { x, y } = body.position
          const angle = body.angle
          domElement.style.transform = `translate(${x - 70}px, ${y - 25}px) rotate(${angle}rad)`
        }
      })
      animationFrameId = requestAnimationFrame(renderLoop)
    }

    renderLoop()

    return () => {
      cancelAnimationFrame(animationFrameId)
      Matter.Engine.clear(engine)
    }
  }, [items])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-visible z-30 pointer-events-none">
      {items.map((item, i) => (
        <div
          key={item.id}
          ref={(el) => {
            pillRefs.current[i] = el
          }}
          className="absolute top-0 left-0 w-[140px] h-[50px] cursor-grab active:cursor-grabbing pointer-events-auto"
          style={{
            filter: `drop-shadow(0 20px 30px ${item.glow}50)`,
          }}
        >
          <div
            className="w-full h-full relative flex items-center justify-center rounded-full bg-[#0a0604]/60 backdrop-blur-xl overflow-hidden select-none"
            style={{
              boxShadow: `
                inset 0 2px 4px 0 rgba(255, 255, 255, 0.4),
                inset 0 -2px 4px 0 rgba(0, 0, 0, 0.8),
                inset 0 0 10px 0 ${item.glow}60
              `,
            }}
          >
            <div className="absolute top-[2px] left-1/2 -translate-x-1/2 w-[80%] h-[10px] rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

            <div className="relative z-10 text-white font-medium tracking-wide pointer-events-none">
              {item.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}