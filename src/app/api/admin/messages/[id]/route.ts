import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/messages/[id]">
) {
  const { id } = await ctx.params;
  const body = await request.json();

  const data: Record<string, unknown> = {};
  if (typeof body.read === "boolean") data.read = body.read;

  try {
    const message = await prisma.message.update({ where: { id }, data });
    return NextResponse.json(message);
  } catch {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/admin/messages/[id]">
) {
  const { id } = await ctx.params;
  try {
    await prisma.message.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }
}