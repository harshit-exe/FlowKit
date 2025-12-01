import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/download/[id] - Track download
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.workflow.update({
      where: { id: params.id },
      data: { downloads: { increment: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DOWNLOAD_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
