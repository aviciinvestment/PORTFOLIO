import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const socials = await prisma.social.findMany({
      orderBy: { order: "asc" },
    })
    return NextResponse.json(socials)
  } catch (error) {
    console.error("Error fetching socials:", error)
    return NextResponse.json({ error: "Failed to fetch socials" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { platform, url, icon, order, active } = body

    const newSocial = await prisma.social.create({
      data: {
        platform,
        url,
        icon,
        order: order || 0,
        active: active !== undefined ? active : true,
      },
    })
    return NextResponse.json(newSocial)
  } catch (error) {
    console.error("Error creating social:", error)
    return NextResponse.json({ error: "Failed to create social" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, platform, url, icon, order, active } = body

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const updatedSocial = await prisma.social.update({
      where: { id },
      data: {
        platform,
        url,
        icon,
        order,
        active,
      },
    })
    return NextResponse.json(updatedSocial)
  } catch (error) {
    console.error("Error updating social:", error)
    return NextResponse.json({ error: "Failed to update social" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    await prisma.social.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting social:", error)
    return NextResponse.json({ error: "Failed to delete social" }, { status: 500 })
  }
}
