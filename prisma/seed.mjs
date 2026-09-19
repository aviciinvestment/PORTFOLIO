import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const projectCount = await prisma.project.count();
  if (projectCount === 0) {
    await prisma.project.createMany({
      data: [
        {
          title: "Lumina Dashboard",
          description:
            "A real-time analytics dashboard with live charts, user management and dark mode. Built with Next.js and Tailwind.",
          image: "/projects/lumina.png",
          tags: ["Next.js", "Tailwind", "PostgreSQL", "Prisma"],
          liveUrl: "https://lumina.example.com",
          repoUrl: "https://github.com/sammy/lumina",
          order: 1,
          published: true,
        },
        {
          title: "Nova Commerce",
          description:
            "A headless e-commerce storefront with Stripe payments, inventory sync and blazing-fast product pages.",
          image: "/projects/nova.png",
          tags: ["React", "Stripe", "GraphQL", "Redis"],
          liveUrl: "https://nova.example.com",
          repoUrl: "https://github.com/sammy/nova",
          order: 2,
          published: true,
        },
        {
          title: "Pulse Fitness App",
          description:
            "A workout tracking PWA with offline support, progress analytics and social sharing.",
          image: "/projects/pulse.png",
          tags: ["Next.js", "PWA", "TypeScript"],
          order: 3,
          published: false,
        },
      ],
    });
  }

  const skillCount = await prisma.skill.count();
  if (skillCount === 0) {
    await prisma.skill.createMany({
      data: [
        { name: "React", icon: "⚛️", category: "frontend", level: 95, order: 1 },
        { name: "Next.js", icon: "▲", category: "frontend", level: 92, order: 2 },
        { name: "TypeScript", icon: "📘", category: "frontend", level: 90, order: 3 },
        { name: "Tailwind CSS", icon: "🎨", category: "frontend", level: 96, order: 4 },
        { name: "Node.js", icon: "🟢", category: "backend", level: 88, order: 5 },
        { name: "PostgreSQL", icon: "🐘", category: "backend", level: 85, order: 6 },
        { name: "Prisma", icon: "⚙️", category: "backend", level: 84, order: 7 },
        { name: "Figma", icon: "🎯", category: "design", level: 90, order: 8 },
      ],
    });
  }

  const experienceCount = await prisma.experience.count();
  if (experienceCount === 0) {
    await prisma.experience.createMany({
      data: [
        {
          role: "Senior Web Developer",
          company: "Freelance",
          period: "2022 — Present",
          description:
            "Designing websites with Figma and developing them into high-performance, accessible web apps.",
          order: 1,
        },
        {
          role: "Frontend Developer",
          company: "TechCorp",
          period: "2020 — 2022",
          description:
            "Built and maintained the company design system and several marketing sites.",
          order: 2,
        },
      ],
    });
  }

  const messageCount = await prisma.message.count();
  if (messageCount === 0) {
    await prisma.message.createMany({
      data: [
        {
          name: "Angelina Jolie",
          email: "angelina@example.com",
          subject: "New project inquiry",
          message:
            "Working with Sammy was so good, he's so professional and would work with him again.",
          read: true,
        },
        {
          name: "John Carter",
          email: "john@example.com",
          subject: "Contract question",
          message: "Hi Sammy, do you have availability next month for a small landing page?",
          read: false,
        },
      ],
    });
  }

  const siteContentCount = await prisma.siteContent.count();
  if (siteContentCount === 0) {
    await prisma.siteContent.create({ data: {} });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });