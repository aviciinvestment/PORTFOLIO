"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, FolderGit2 } from "lucide-react";

type Project = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  tags: string[];
  liveUrl: string | null;
  repoUrl: string | null;
};

export function ProjectsSection({
  initialProjects
}: {
  initialProjects: Project[]
}) {
  const [projects] = useState<Project[]>(initialProjects);

  return (
    <section id="projects" className="relative z-10 py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-14"
        >
          <p className="text-[#ff5c00] text-sm font-semibold tracking-widest uppercase mb-3">
            Some things I have built
          </p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Projects</h2>
        </motion.div>

        {projects.length === 0 && (
          <p className="text-white/40 text-sm">
            No projects yet — add them from the{" "}
            <a href="/admin" className="text-[#ff5c00] underline">
              admin panel
            </a>
            .
          </p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
              className="group bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden hover:border-[#ff5c00]/40 hover:bg-white/[0.07] transition-all"
            >
              <div className="relative aspect-video overflow-hidden bg-white/5">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl text-white/15 font-bold select-none">
                    {String(p.title.charAt(0) ?? "◆").toUpperCase()}
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2 truncate">{p.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-3">
                  {p.description}
                </p>

                {p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] text-white/50 border border-white/10 bg-white/5 px-2 py-0.5 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {(p.liveUrl || p.repoUrl) && (
                  <div className="flex items-center gap-3">
                    {p.liveUrl && (
                      <a
                        href={p.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#ff5c00] hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Live site
                      </a>
                    )}
                    {p.repoUrl && (
                      <a
                        href={p.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white transition-colors"
                      >
                        <FolderGit2 className="w-3.5 h-3.5" /> Repo
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}