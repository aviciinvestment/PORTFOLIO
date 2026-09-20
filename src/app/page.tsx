import { prisma } from "@/lib/prisma";
import { HomeClient } from "@/components/home-client";
import { SkillsSection } from "@/components/sections/skills-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { Footer } from "@/components/footer";

// Disable static caching so we always fetch the latest data from the DB
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  const [site, skills, projects, experience, testimonials, socials] = await Promise.all([
    prisma.siteContent.findFirst(),
    prisma.skill.findMany({ orderBy: { order: "asc" } }),
    prisma.project.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    }),
    prisma.experience.findMany({ orderBy: { order: "asc" } }),
    prisma.testimonial.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    }),
    prisma.social.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#0a0604] text-[#f8fafc] relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#d9480f]/20 rounded-full blur-[120px] pointer-events-none translate-x-1/4 -translate-y-1/4" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#d9480f]/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/4 translate-y-1/4" />

      {/* 
        Pass server-fetched data to the Client Components so there is no
        loading state flash on the frontend.
      */}
      <HomeClient
        initialSite={site}
        initialSkills={skills}
        initialTestimonials={testimonials}
      />
      <SkillsSection initialSkills={skills} />
      <ProjectsSection initialProjects={projects} />
      <ExperienceSection initialExperience={experience} />
      <Footer initialSocials={socials} />
    </main>
  );
}
