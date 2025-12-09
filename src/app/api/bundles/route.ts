import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/bundles - List all bundles
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const published = searchParams.get("published")
    const featured = searchParams.get("featured")

    const where: any = {}
    if (published !== null) {
      where.published = published === "true"
    }
    if (featured !== null) {
      where.featured = featured === "true"
    }

    const [bundles, total] = await Promise.all([
      prisma.bundle.findMany({
        where,
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          objective: true,
          icon: true,
          thumbnail: true,
          color: true,
          featured: true,
          order: true,
          views: true,
          benefits: true,
          targetAudience: true,
          estimatedTime: true,
          createdAt: true,
          published: true,
          _count: {
            select: {
              workflows: true,
            },
          },
          workflows: {
            select: {
              order: true,
              workflow: {
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  icon: true,
                  thumbnail: true,
                  difficulty: true,
                },
              },
            },
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.bundle.count({ where }),
    ])

    return NextResponse.json({
      bundles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("[BUNDLES_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/bundles - Create new bundle
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      slug,
      description,
      objective,
      icon,
      thumbnail,
      aiImagePrompt,
      color,
      featured,
      order,
      benefits,
      targetAudience,
      estimatedTime,
      workflowIds,
      published,
    } = body

    // Check if slug already exists
    const existing = await prisma.bundle.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json({ error: "Bundle with this slug already exists" }, { status: 400 })
    }

    // Create bundle
    const bundle = await prisma.bundle.create({
      data: {
        name,
        slug,
        description,
        objective,
        icon,
        thumbnail,
        aiImagePrompt,
        color: color || "#667eea",
        featured: featured || false,
        order: order || 0,
        benefits: benefits || [],
        targetAudience,
        estimatedTime,
        published: published || false,
        publishedAt: published ? new Date() : null,
        workflows: {
          create: workflowIds.map((workflowId: string, index: number) => ({
            workflow: {
              connect: { id: workflowId },
            },
            order: index,
          })),
        },
      },
      include: {
        workflows: {
          include: {
            workflow: {
              select: {
                id: true,
                slug: true,
                name: true,
                icon: true,
                thumbnail: true,
                difficulty: true,
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            workflows: true,
          },
        },
      },
    })

    return NextResponse.json(bundle, { status: 201 })
  } catch (error) {
    console.error("[BUNDLES_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
