import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    return NextResponse.json(
      { isAdmin: false, error: "ADMIN_EMAIL is not configured." },
      { status: 500 },
    );
  }

  let email: string | undefined;
  try {
    const body = await request.json();
    email = typeof body?.email === "string" ? body.email : undefined;
  } catch {
    email = undefined;
  }

  return NextResponse.json({ isAdmin: email === adminEmail });
}