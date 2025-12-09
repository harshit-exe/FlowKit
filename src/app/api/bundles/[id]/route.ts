import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/bundles/[id] - Get single bundle
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bundle = await prisma.bundle.findUnique({
      where: { id: params.id },
      include: {
        workflows: {
          include: {
            workflow: {
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

    if (!bundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 })
    }

    return NextResponse.json(bundle)
  } catch (error) {
    console.error("[BUNDLE_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/bundles/[id] - Update bundle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if bundle exists
    const existing = await prisma.bundle.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 })
    }

    // Check if slug is taken by another bundle
    if (slug !== existing.slug) {
      const slugTaken = await prisma.bundle.findUnique({
        where: { slug },
      })
      if (slugTaken) {
        return NextResponse.json({ error: "Slug already in use" }, { status: 400 })
      }
    }

    // Update bundle - delete existing workflow connections and recreate
    const bundle = await prisma.bundle.update({
      where: { id: params.id },
      data: {
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
        published,
        publishedAt: published && !existing.published ? new Date() : existing.publishedAt,
        workflows: {
          deleteMany: {}, // Remove all existing workflow connections
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

    return NextResponse.json(bundle)
  } catch (error) {
    console.error("[BUNDLE_PUT]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/bundles/[id] - Delete bundle
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bundle = await prisma.bundle.findUnique({
      where: { id: params.id },
    })

    if (!bundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 })
    }

    await prisma.bundle.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Bundle deleted successfully" })
  } catch (error) {
    console.error("[BUNDLE_DELETE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
