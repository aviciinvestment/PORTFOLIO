import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/experiences/[id]">
) {
  const { id } = await ctx.params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (typeof body.role === "string") data.role = body.role;
  if (typeof body.company === "string") data.company = body.company;
  if (typeof body.period === "string") data.period = body.period;
  if (typeof body.description === "string" || body.description === null)
    data.description = body.description;
  if (typeof body.order === "number") data.order = body.order;

  try {
    const experience = await prisma.experience.update({ where: { id }, data });
    return NextResponse.json(experience);
  } catch {
    return NextResponse.json({ error: "Experience not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/admin/experiences/[id]">
) {
  const { id } = await ctx.params;
  try {
    await prisma.experience.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Experience not found" }, { status: 404 });
  }
}