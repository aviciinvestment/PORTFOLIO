import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const siteContent = await prisma.siteContent.findFirst()
    return NextResponse.json(siteContent || {})
  } catch (error) {
    console.error("Error fetching site settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, resumeUrl } = body

    // We only care about updating resumeUrl for now
    let updatedContent
    
    if (id) {
      updatedContent = await prisma.siteContent.update({
        where: { id },
        data: { resumeUrl },
      })
    } else {
      // If no settings exist yet, create them
      updatedContent = await prisma.siteContent.create({
        data: { resumeUrl },
      })
    }

    return NextResponse.json(updatedContent)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
