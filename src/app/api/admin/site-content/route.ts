import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FIELDS = [
  "brand",
  "greeting",
  "heroName",
  "heroTitle",
  "heroTagline",
  "testimonialQuote",
  "testimonialName",
  "testimonialRole",
  "resumeUrl",
  "resumeText",
] as const;

export async function GET() {
  const content = await prisma.siteContent.findFirst();
  return NextResponse.json(content ?? null);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();

  const data: Record<string, string> = {};
  for (const field of FIELDS) {
    if (typeof body[field] === "string") data[field] = body[field];
  }

  const existing = await prisma.siteContent.findFirst();
  const content = existing
    ? await prisma.siteContent.update({ where: { id: existing.id }, data })
    : await prisma.siteContent.create({ data });

  return NextResponse.json(content);
}