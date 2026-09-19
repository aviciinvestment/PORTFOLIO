import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/skills/[id]">) {
  const { id } = await ctx.params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.icon === "string" || body.icon === null) data.icon = body.icon;
  if (typeof body.category === "string") data.category = body.category;
  if (typeof body.level === "number") data.level = body.level;
  if (typeof body.order === "number") data.order = body.order;

  try {
    const skill = await prisma.skill.update({ where: { id }, data });
    return NextResponse.json(skill);
  } catch {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/admin/skills/[id]">) {
  const { id } = await ctx.params;
  try {
    await prisma.skill.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  }
}