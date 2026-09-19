import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const content = await prisma.siteContent.findFirst();
  return NextResponse.json(content ?? null);
}