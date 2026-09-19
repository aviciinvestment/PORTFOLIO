import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const project = await prisma.project.create({
    data: {
      title: String(body.title ?? ""),
      description: String(body.description ?? ""),
      image: body.image ? String(body.image) : null,
      tags: Array.isArray(body.tags)
        ? body.tags.map(String)
        : String(body.tags ?? "")
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean),
      liveUrl: body.liveUrl ? String(body.liveUrl) : null,
      repoUrl: body.repoUrl ? String(body.repoUrl) : null,
      order: Number(body.order ?? 0),
      published: Boolean(body.published ?? true),
    },
  });
  return NextResponse.json(project, { status: 201 });
}