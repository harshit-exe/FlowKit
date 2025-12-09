import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    if (!query) {
      return NextResponse.json({ workflows: [], bundles: [], total: 0 })
    }

    const [workflows, bundles] = await Promise.all([
      prisma.workflow.findMany({
        where: {
          published: true,
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        },
        include: {
          categories: {
            include: { category: true },
          },
          tags: {
            include: { tag: true },
          },
        },
        orderBy: { views: "desc" },
        take: 50,
      }),
      prisma.bundle.findMany({
        where: {
          published: true,
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
            { objective: { contains: query } },
          ],
        },
        include: {
          _count: {
            select: {
              workflows: true,
            },
          },
        },
        orderBy: { views: "desc" },
        take: 20,
      }),
    ])

    return NextResponse.json({
      workflows,
      bundles,
      total: workflows.length + bundles.length,
    })
  } catch (error) {
    console.error("[SEARCH_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
