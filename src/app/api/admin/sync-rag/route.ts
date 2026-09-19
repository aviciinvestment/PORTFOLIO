import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPineconeIndex } from "@/lib/pinecone";
import { generateEmbedding } from "@/lib/embeddings";

interface Chunk {
  id: string;
  text: string;
  metadata: Record<string, string>;
}

async function upsertToPinecone(chunks: Chunk[]) {
  const vectors: {
    id: string;
    values: number[];
    metadata: { text: string } & Record<string, string>;
  }[] = [];

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk.text, "passage");
    vectors.push({
      id: chunk.id,
      values: embedding,
      metadata: {
        text: chunk.text,
        ...chunk.metadata,
      },
    });
  }

  const index = getPineconeIndex();
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.upsert({ records: batch });
  }

  return vectors.length;
}

function chunkText(text: string, maxLen = 1200): string[] {
  const paragraphs = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if ((current + "\n" + para).length > maxLen && current) {
      chunks.push(current);
      current = para;
    } else {
      current = current ? current + "\n" + para : para;
    }
  }
  if (current) chunks.push(current);

  return chunks;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || !body.sync) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const [site, skills, experiences, testimonials] = await Promise.all([
      prisma.siteContent.findFirst(),
      prisma.skill.findMany(),
      prisma.experience.findMany(),
      prisma.testimonial.findMany(),
    ]);

    const chunks: Chunk[] = [];

    if (site) {
      chunks.push({
        id: "site-about",
        text: `About Victory: ${site.heroName} is a ${site.heroTitle}. Greeting: ${site.greeting}. Tagline: ${site.heroTagline}.`,
        metadata: { type: "about" },
      });
      chunks.push({
        id: "site-hero",
        text: `Victory's Headline: ${site.heroTitle}. Name: ${site.heroName}. Summary: ${site.heroTagline}${site.brand ? ` Brand: ${site.brand}` : ""}`,
        metadata: { type: "hero" },
      });
      chunks.push({
        id: "site-testimonial",
        text: `Testimonial highlight: "${site.testimonialQuote}" - ${site.testimonialName}, ${site.testimonialRole}.`,
        metadata: { type: "testimonial" },
      });

      if (site.resumeText && site.resumeText.trim()) {
        const cvSections = chunkText(site.resumeText);
        cvSections.forEach((section, i) => {
          chunks.push({
            id: `cv-${i}`,
            text: `From Victory's CV/Resume (section ${i + 1}):\n${section}`,
            metadata: { type: "cv" },
          });
        });
      }
    }

    skills.forEach((skill) => {
      chunks.push({
        id: `skill-${skill.id}`,
        text: `Skill: ${skill.name}. Proficiency: ${skill.level}% (${skill.category}).`,
        metadata: { type: "skill", name: skill.name, category: skill.category },
      });
    });

    experiences.forEach((exp) => {
      chunks.push({
        id: `exp-${exp.id}`,
        text: `Experience: ${exp.role} at ${exp.company} (${exp.period}). Description: ${exp.description ?? ""}`,
        metadata: { type: "experience", company: exp.company, role: exp.role },
      });
    });

    testimonials.forEach((test) => {
      chunks.push({
        id: `testimonial-${test.id}`,
        text: `Testimonial by ${test.name} (${test.role}): "${test.quote}"`,
        metadata: { type: "testimonial", author: test.name },
      });
    });

    const count = await upsertToPinecone(chunks);
    return NextResponse.json({ success: true, message: `Synced ${count} items to Pinecone.` });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Sync Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}