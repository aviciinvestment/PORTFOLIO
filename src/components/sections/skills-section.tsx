"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Skill = {
  id: string;
  name: string;
  icon: string | null;
  category: string;
  level: number;
  order: number;
};

const CATEGORY_ORDER = ["frontend", "backend", "design", "other"];
const CATEGORY_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  design: "Design",
  other: "Other",
};

export function SkillsSection({
  initialSkills
}: {
  initialSkills: Skill[]
}) {
  const [skills] = useState<Skill[]>(initialSkills);
  const [error] = useState<string | null>(null);

  const ownCategory = (c: string) => (CATEGORY_ORDER.includes(c) ? c : "other");
  const categories = CATEGORY_ORDER.filter((c) =>
    skills.some((s) => ownCategory(s.category) === c)
  );

  return (
    <section id="skills" className="relative z-10 py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-14"
        >
          <p className="text-[#ff5c00] text-sm font-semibold tracking-widest uppercase mb-3">
            What I work with
          </p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Skills</h2>
        </motion.div>

        {error && (
          <p className="text-white/40 text-sm bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
            {error} — add skills from the{" "}
            <a href="/admin" className="text-[#ff5c00] underline">
              admin panel
            </a>
            .
          </p>
        )}

        {!error && skills.length === 0 && (
          <p className="text-white/40 text-sm">
            No skills yet — add them from the{" "}
            <a href="/admin" className="text-[#ff5c00] underline">
              admin panel
            </a>
            .
          </p>
        )}

        {categories.map((category) => (
          <div key={category} className="mb-12 last:mb-0">
            <h3 className="text-lg font-semibold text-white/70 mb-6 flex items-center gap-3">
              <span className="w-8 h-px bg-[#ff5c00]" />
              {CATEGORY_LABELS[category] ?? category}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills
                .filter((s) => ownCategory(s.category) === category)
                .map((skill, i) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
                    className="group bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5 hover:border-[#ff5c00]/40 hover:bg-white/[0.07] transition-all"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl leading-none">
                        {skill.icon ?? "◆"}
                      </span>
                      <div>
                        <p className="font-medium">{skill.name}</p>
                        <p className="text-xs text-white/40">
                          {CATEGORY_LABELS[skill.category] ?? skill.category}
                        </p>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.min(Math.max(skill.level, 0), 100)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-[#ff5c00] to-amber-400 shadow-[0_0_12px_rgba(255,92,0,0.6)]"
                      />
                    </div>
                    <p className="text-xs text-white/40 mt-2">
                      {Math.min(Math.max(skill.level, 0), 100)}%
                    </p>
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}