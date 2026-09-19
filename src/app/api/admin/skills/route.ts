import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const skills = await prisma.skill.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(skills);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const skill = await prisma.skill.create({
    data: {
      name: String(body.name ?? ""),
      icon: body.icon ? String(body.icon) : null,
      category: String(body.category ?? "frontend"),
      level: Number(body.level ?? 75),
      order: Number(body.order ?? 0),
    },
  });
  return NextResponse.json(skill, { status: 201 });
}