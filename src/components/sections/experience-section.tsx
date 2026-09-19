"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Experience = {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string | null;
  order: number;
};

export function ExperienceSection({
  initialExperience
}: {
  initialExperience: Experience[]
}) {
  const [experiences] = useState<Experience[]>(initialExperience);
  const [error] = useState<string | null>(null);

  return (
    <section id="experience" className="relative z-10 py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-14"
        >
          <p className="text-[#ff5c00] text-sm font-semibold tracking-widest uppercase mb-3">
            Where I have been
          </p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Experience</h2>
        </motion.div>

        {error && (
          <p className="text-white/40 text-sm bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            {error} — add experience from the{" "}
            <a href="/admin" className="text-[#ff5c00] underline">
              admin panel
            </a>
            .
          </p>
        )}

        {!error && experiences.length === 0 && (
          <p className="text-white/40 text-sm">
            No experience yet — add it from the{" "}
            <a href="/admin" className="text-[#ff5c00] underline">
              admin panel
            </a>
            .
          </p>
        )}

        <div className="relative pl-8 md:pl-10">
          <div className="absolute left-[7px] md:left-[9px] top-2 bottom-2 w-px bg-gradient-to-b from-[#ff5c00]/70 via-white/15 to-transparent" />

          <div className="space-y-10">
            {experiences.map((x, i) => (
              <motion.div
                key={x.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
                className="relative"
              >
                <span className="absolute -left-8 md:-left-10 top-2 w-[15px] h-[15px] rounded-full bg-[#ff5c00] border-4 border-[#0a0604] shadow-[0_0_12px_rgba(255,92,0,0.7)]" />
                <div className="group bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 hover:border-[#ff5c00]/40 transition-all">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{x.role}</h3>
                    <span className="text-xs text-[#ff5c00] font-medium">{x.period}</span>
                  </div>
                  <p className="text-white/60 mb-3">{x.company}</p>
                  {x.description && (
                    <p className="text-white/50 text-sm leading-relaxed">{x.description}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}