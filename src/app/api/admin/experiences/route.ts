import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const experiences = await prisma.experience.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(experiences);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const experience = await prisma.experience.create({
    data: {
      role: String(body.role ?? ""),
      company: String(body.company ?? ""),
      period: String(body.period ?? ""),
      description: body.description ? String(body.description) : null,
      order: Number(body.order ?? 0),
    },
  });
  return NextResponse.json(experience, { status: 201 });
}