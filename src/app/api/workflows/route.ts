import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/workflows - List all workflows
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const published = searchParams.get("published")

    const where: any = {}
    if (published !== null) {
      where.published = published === "true"
    }

    const [workflows, total] = await Promise.all([
      prisma.workflow.findMany({
        where,
        include: {
          categories: {
            include: {
              category: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.workflow.count({ where }),
    ])

    return NextResponse.json({
      workflows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("[WORKFLOWS_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/workflows - Create new workflow
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
      icon,
      thumbnail,
      videoUrl,
      difficulty,
      featured,
      indiaBadge,
      nodeCount,
      categoryIds,
      tagNames,
      credentialsRequired,
      nodes,
      useCases,
      setupSteps,
      workflowJson,
      published,
    } = body

    // Check if slug already exists
    const existing = await prisma.workflow.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json({ error: "Workflow with this slug already exists" }, { status: 400 })
    }

    // Create or connect tags (deduplicate first)
    const uniqueTagNames: string[] = Array.from(new Set(tagNames.map((name: string) => name.trim()).filter(Boolean)));

    const tagConnections = await Promise.all(
      uniqueTagNames.map(async (tagName: string) => {
        const tagSlug = tagName.toLowerCase().replace(/\s+/g, "-");

        // Try to find existing tag by slug first
        let tag = await prisma.tag.findUnique({
          where: { slug: tagSlug },
        });

        // If not found, create it
        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: tagName,
              slug: tagSlug,
            },
          });
        }

        return { tag: { connect: { id: tag.id } } };
      })
    );

    // Create workflow
    const workflow = await prisma.workflow.create({
      data: {
        name,
        slug,
        description,
        icon,
        thumbnail,
        videoUrl,
        difficulty,
        featured,
        indiaBadge,
        nodeCount,
        workflowJson,
        useCases,
        setupSteps,
        credentialsRequired,
        nodes,
        published,
        publishedAt: published ? new Date() : null,
        categories: {
          create: categoryIds.map((categoryId: string) => ({
            category: {
              connect: { id: categoryId },
            },
          })),
        },
        tags: {
          create: tagConnections,
        },
      },
      include: {
        categories: {
          include: { category: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    })

    return NextResponse.json(workflow, { status: 201 })
  } catch (error) {
    console.error("[WORKFLOWS_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
