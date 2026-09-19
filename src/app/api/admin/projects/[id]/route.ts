import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/projects/[id]">) {
  const { id } = await ctx.params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title;
  if (typeof body.description === "string") data.description = body.description;
  if (typeof body.image === "string" || body.image === null) data.image = body.image;
  if (Array.isArray(body.tags)) data.tags = body.tags.map(String);
  if (typeof body.liveUrl === "string" || body.liveUrl === null)
    data.liveUrl = body.liveUrl;
  if (typeof body.repoUrl === "string" || body.repoUrl === null) data.repoUrl = body.repoUrl;
  if (typeof body.order === "number") data.order = body.order;
  if (typeof body.published === "boolean") data.published = body.published;

  try {
    const project = await prisma.project.update({ where: { id }, data });
    return NextResponse.json(project);
  } catch {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/admin/projects/[id]">) {
  const { id } = await ctx.params;
  try {
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
}