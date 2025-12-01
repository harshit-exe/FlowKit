import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/workflows/[id] - Get single workflow
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: params.id },
      include: {
        categories: {
          include: { category: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    })

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
    }

    return NextResponse.json(workflow)
  } catch (error) {
    console.error("[WORKFLOW_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/workflows/[id] - Update workflow
export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    // Check if workflow exists
    const existing = await prisma.workflow.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
    }

    // Delete existing relations
    await prisma.workflowCategory.deleteMany({
      where: { workflowId: params.id },
    })
    await prisma.workflowTag.deleteMany({
      where: { workflowId: params.id },
    })

    // Create or connect tags
    const tagConnections = await Promise.all(
      tagNames.map(async (tagName: string) => {
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: {
            name: tagName,
            slug: tagName.toLowerCase().replace(/\s+/g, "-"),
          },
        })
        return { tag: { connect: { id: tag.id } } }
      })
    )

    // Update workflow
    const workflow = await prisma.workflow.update({
      where: { id: params.id },
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
        publishedAt: published && !existing.published ? new Date() : existing.publishedAt,
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

    return NextResponse.json(workflow)
  } catch (error) {
    console.error("[WORKFLOW_PUT]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/workflows/[id] - Delete workflow
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: params.id },
    })

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 })
    }

    await prisma.workflow.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Workflow deleted successfully" })
  } catch (error) {
    console.error("[WORKFLOW_DELETE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
