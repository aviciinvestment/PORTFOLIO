import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [projects, skills, experiences, messages, unread] = await Promise.all([
    prisma.project.count(),
    prisma.skill.count(),
    prisma.experience.count(),
    prisma.message.count(),
    prisma.message.count({ where: { read: false } }),
  ]);

  return NextResponse.json({
    projects,
    skills,
    experiences,
    messages,
    unread,
  });
}