import { NextResponse } from "next/server";
import { localChatStream } from "@/lib/chat-server";
import { prisma } from "@/lib/prisma";
import type { ChatMessage } from "@shared/chat/core";

export const runtime = "nodejs";

const MAX_SITE_CONTEXT = 24000;

async function buildLiveContext(): Promise<string> {
  try {
    const [site, skills, experiences, testimonials, projects] = await Promise.all([
      prisma.siteContent.findFirst(),
      prisma.skill.findMany({ orderBy: { order: "asc" } }),
      prisma.experience.findMany({ orderBy: { order: "asc" } }),
      prisma.testimonial.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
      prisma.project.findMany({ where: { published: true }, orderBy: { order: "asc" } }),
    ]);

    const parts: string[] = [];

    if (site) {
      // Note: site.resumeUrl is a large base64 data URL - NEVER include it in
      // chat context. It floods the token budget and hides the CV text.
      if (site.resumeText && site.resumeText.trim()) {
        parts.push(
          `Victory's CV/resume:\n${site.resumeText.trim().slice(0, 16000)}`
        );
      }
      parts.push(
        `Name: ${site.heroName}.\nRole: ${site.heroTitle}.\nTagline: ${site.heroTagline}.\nGreeting: ${site.greeting}.\nBrand: ${site.brand}.`
      );
      if (site.testimonialQuote) {
        parts.push(
          `Testimonial: "${site.testimonialQuote}" - ${site.testimonialName}, ${site.testimonialRole}.`
        );
      }
      if (site.contactEmail) parts.push(`Contact email: ${site.contactEmail}.`);
      if (site.whatsappUrl) parts.push(`WhatsApp: ${site.whatsappUrl}.`);
    }

    if (skills.length > 0) {
      parts.push(`Skills:\n- ${skills.map((s) => `${s.name} (${s.level}%)`).join("\n- ")}`);
    }

    if (experiences.length > 0) {
      parts.push(
        `Experience:\n- ${experiences
          .map((e) => `${e.role} at ${e.company} (${e.period})${e.description ? `: ${e.description}` : ""}`)
          .join("\n- ")}`
      );
    }

    if (projects.length > 0) {
      parts.push(
        `Projects:\n- ${projects
          .map((p) => `${p.title}${p.tags.length ? ` [${p.tags.join(", ")}]` : ""}: ${p.description}`)
          .join("\n- ")}`
      );
    }

    if (testimonials.length > 0) {
      parts.push(
        `Client testimonials:\n- ${testimonials
          .map((t) => `"${t.quote}" - ${t.name}, ${t.role}`)
          .join("\n- ")}`
      );
    }

    return parts.join("\n\n").slice(0, MAX_SITE_CONTEXT);
  } catch (error) {
    console.error("Failed to build live chat context:", error);
    return "";
  }
}

export async function POST(req: Request) {
  let messages: ChatMessage[];

  try {
    const body = (await req.json()) as { messages?: unknown };
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      throw new Error("invalid payload");
    }
    messages = body.messages as ChatMessage[];
  } catch {
    return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
  }

  // Save the latest user message to the database for the admin dashboard
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  if (lastUserMsg && lastUserMsg.content) {
    // Fire and forget - don't block the chat stream
    prisma.message
      .create({
        data: {
          name: "Chat User",
          email: "chatbot@victory.portfolio",
          subject: "AI Chat Inquiry",
          message: lastUserMsg.content.slice(0, 5000), // Protect against massive payloads
        },
      })
      .catch((err) => console.error("Failed to log chat message to DB:", err));
  }

  const liveContext = await buildLiveContext();
  const workerUrl = (process.env.CHAT_WORKER_URL ?? "").trim();

  if (workerUrl) {
    try {
      const upstream = await fetch(new URL("/chat", workerUrl), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, context: liveContext }),
      });

      if (!upstream.ok || !upstream.body) {
        return NextResponse.json({ error: "Chat worker is unavailable." }, { status: 502 });
      }

      return new NextResponse(upstream.body, {
        status: 200,
        headers: {
          "Content-Type": "application/x-ndjson",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } catch (error) {
      console.error("Chat worker proxy error:", error);
      return NextResponse.json({ error: "Chat worker is unavailable." }, { status: 502 });
    }
  }

  if (!process.env.NVIDIA_API_KEY) {
    return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
  }

  return new NextResponse(localChatStream(messages, liveContext), {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}