"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Download, Mail, Menu, Quote, X } from "lucide-react"
import { PhysicsSkills } from "@/components/ui/physics-skills"

type SiteContent = {
  brand: string
  greeting: string
  heroName: string
  heroTitle: string
  heroTagline: string
  resumeUrl: string | null
}

type Testimonial = {
  id: string
  name: string
  role: string
  quote: string
  active: boolean
}

const FALLBACK_CONTENT: SiteContent = {
  brand: "noah.",
  greeting: "Hey I am",
  heroName: "Sammy",
  heroTitle: "Web Developer",
  heroTagline: "I design websites using Figma and develop them to bring to live",
  resumeUrl: null,
}

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: "fallback-1",
    name: "Angelina Jolie",
    role: "Business owner",
    quote: "Working with Sammy was so good, he is so professional and would work with him again",
    active: true,
  }
]

export function HomeClient({
  initialSite,
  initialTestimonials,
  initialSkills,
}: {
  initialSite: SiteContent | null
  initialTestimonials: Testimonial[]
  initialSkills: { id: string; name: string }[]
}) {
  const [pills] = useState<{ id: string; label: string }[]>(
    initialSkills.map((s) => ({ id: s.id, label: s.name }))
  )
  const [site] = useState<SiteContent>(
    initialSite || FALLBACK_CONTENT
  )
  const [testimonials] = useState<Testimonial[]>(
    initialTestimonials.length > 0 ? initialTestimonials : FALLBACK_TESTIMONIALS
  )
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  const NAV_LINKS = ['Home', 'Skills', 'Experience', 'Connect']

  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setTestimonialIndex(prev => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  return (
    <>
      {/* Main Container */}
      <div id="home" className="max-w-7xl mx-auto px-6 md:px-12 py-8 relative z-10 flex flex-col min-h-screen">
        
        {/* Navbar */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-between items-center w-full"
        >
          <div className="text-2xl font-bold tracking-tight min-w-0 truncate">{site?.brand ?? FALLBACK_CONTENT.brand}</div>
          
          <nav className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-6 py-3 backdrop-blur-md">
            {NAV_LINKS.map((item, i) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                onClick={() => setMenuOpen(false)}
                className={`px-4 text-sm font-medium transition-colors hover:text-white ${i === 0 ? 'text-[#ff5c00]' : 'text-white/60'}`}
              >
                {item}
              </a>
            ))}
          </nav>
          
          <div className="flex items-center gap-3">
            {site?.resumeUrl ? (
              <a href={site.resumeUrl} download="resume.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors rounded-full px-4 md:px-6 py-3 text-sm font-medium backdrop-blur-md">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download Resume</span>
              </a>
            ) : (
              <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors rounded-full px-4 md:px-6 py-3 text-sm font-medium backdrop-blur-md opacity-50 cursor-not-allowed" title="No resume available">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download Resume</span>
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((s) => !s)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="md:hidden p-3 rounded-full bg-white/5 border border-white/10 text-white/80 hover:text-white transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </motion.header>

        {/* Mobile dropdown menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-4 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-md"
            >
              {NAV_LINKS.map((item, i) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-white/10 ${i === 0 ? 'text-[#ff5c00]' : 'text-white/70'}`}
                >
                  {item}
                </a>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <div className="flex-1 flex flex-col lg:flex-row items-center mt-8 lg:mt-0 gap-10 lg:gap-0">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="w-full lg:w-1/2 flex flex-col justify-center space-y-6 md:space-y-8 relative z-20"
          >
            <div className="space-y-4 text-center lg:text-left flex flex-col items-center lg:items-start">
              <h2 className="text-xl md:text-3xl text-white/80 font-medium tracking-wide">
                {site?.greeting ?? FALLBACK_CONTENT.greeting}{" "}
                <span className="text-[#ff5c00] font-semibold">
                  {site?.heroName ?? FALLBACK_CONTENT.heroName}
                </span>
              </h2>
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight leading-[1.1]">
                {site?.heroTitle ?? FALLBACK_CONTENT.heroTitle}
              </h1>
              <p className="text-white/60 text-base md:text-xl max-w-md leading-relaxed mt-4 md:mt-6">
                {site?.heroTagline ?? FALLBACK_CONTENT.heroTagline}
              </p>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-4 pt-2 md:pt-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#ff5c00] hover:bg-[#ff5c00]/90 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-medium tracking-wide shadow-[0_0_20px_rgba(255,92,0,0.4)] transition-all"
              >
                Hire Me
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 md:p-4 rounded-full backdrop-blur-md transition-all"
              >
                <Mail className="w-5 h-5 text-white/80" />
              </motion.button>
            </div>

            {/* Testimonial Glass Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="mt-10 md:mt-16 mx-auto lg:mx-0 w-full max-w-sm bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl relative overflow-hidden h-[200px] md:h-[220px]"
            >
              {/* Inner subtle glow */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#ff5c00]/20 rounded-full blur-2xl" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonialIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 p-5 md:p-6 flex flex-col justify-center"
                >
                  <Quote className="w-6 h-6 md:w-8 md:h-8 text-white/40 mb-3 md:mb-4 relative z-10 shrink-0" />
                  <p className="text-white/80 text-xs md:text-sm leading-relaxed mb-4 md:mb-6 relative z-10 line-clamp-3">
                    {testimonials[testimonialIndex]?.quote}
                  </p>
                  
                  <div className="flex items-center gap-3 relative z-10 shrink-0 mt-auto">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 border border-white/30 overflow-hidden shrink-0">
                      <div className="w-full h-full bg-gradient-to-tr from-gray-500 to-gray-300" /> {/* Placeholder avatar */}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs md:text-sm font-semibold truncate">
                        {testimonials[testimonialIndex]?.name}
                      </h4>
                      <p className="text-[10px] md:text-xs text-white/50 truncate">
                        {testimonials[testimonialIndex]?.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Right Content - 3D Character & Elements */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="w-full lg:w-1/2 relative flex justify-center items-center h-[400px] md:h-[550px]"
          >
            {/* Concentric Circles Background (Wireframe) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <div className="w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full border border-white/30" />
              <div className="absolute w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full border border-white/20" />
              <div className="absolute w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full border border-white/10" />
            </div>

            {/* Character */}
            <div className="relative z-10 w-[280px] h-[320px] md:w-[450px] md:h-[500px] flex items-center justify-center pointer-events-none -translate-y-5 md:-translate-y-10">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full rounded-b-full flex items-end justify-center relative drop-shadow-[0_20px_50px_rgba(255,92,0,0.15)]"
              >
                {/* 3D Character Image */}
                <Image 
                  src="/sammy_3d.png" 
                  alt="3D Avatar of Sammy" 
                  fill
                  className="object-contain object-bottom absolute bottom-0"
                  style={{ maskImage: 'linear-gradient(to top, transparent 2%, black 30%)', WebkitMaskImage: 'linear-gradient(to top, transparent 2%, black 30%)' }}
                />
              </motion.div>
            </div>

            {/* Interactive Physics Sandbox for Skills */}
            <PhysicsSkills skills={pills} />

          </motion.div>
        </div>
      </div>
    </>
  )
}
