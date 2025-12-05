import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const count = await prisma.waitlist.count()

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Waitlist count error:", error)
    return NextResponse.json({ count: 0 })
  }
}
