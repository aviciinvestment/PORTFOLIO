"use client"

import { useState } from "react"
import { ExternalLink } from "lucide-react"

type Social = {
  id: string
  platform: string
  url: string
  icon: string | null
  order: number
  active: boolean
}

export function Footer({
  initialSocials
}: {
  initialSocials: Social[]
}) {
  const [socials] = useState<Social[]>(initialSocials)

  return (
    <footer id="connect" className="w-full border-t border-white/10 bg-[#0a0604] py-8 mt-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-white/40 text-sm">
          © {new Date().getFullYear()} Victory Portfolio. All rights reserved.
        </div>
        
        {socials.length > 0 && (
          <div className="flex items-center gap-6">
            {socials.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-[#ff5c00] transition-colors flex items-center gap-1.5 text-sm font-medium"
              >
                {social.platform}
                <ExternalLink className="w-3.5 h-3.5 opacity-50" />
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  )
}
