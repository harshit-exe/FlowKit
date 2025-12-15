import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
    try {
        // Check admin authentication
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check if user has admin role
        const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { tutorial } = body

        if (!tutorial || !tutorial.workflowSlug) {
            return NextResponse.json(
                { error: "Tutorial data and workflowSlug are required" },
                { status: 400 }
            )
        }

        console.log("[TUTORIAL_SAVE] Saving tutorial for workflow:", tutorial.workflowSlug)

        // Upsert tutorial to database
        const savedTutorial = await prisma.tutorial.upsert({
            where: {
                workflowSlug: tutorial.workflowSlug
            },
            update: {
                title: tutorial.title,
                description: tutorial.description,
                difficulty: tutorial.difficulty,
                estimatedTime: tutorial.estimatedTime,
                isAIGenerated: tutorial.isAIGenerated || false,
                isPublished: true,
                // Delete existing steps and recreate (simpler than complex update logic)
                steps: {
                    deleteMany: {},
                    create: tutorial.steps.map((step: any) => ({
                        order: step.order,
                        title: step.title,
                        description: step.description,
                        type: step.type,
                        codeSnippet: step.codeSnippet,
                        imageUrl: step.imageUrl,
                        videoUrl: step.videoUrl,
                        hints: step.hints || [],
                        credentialLinks: step.credentialLinks ? {
                            create: step.credentialLinks.map((cred: any) => ({
                                name: cred.name,
                                provider: cred.provider,
                                setupUrl: cred.setupUrl,
                                documentationUrl: cred.documentationUrl,
                                requiredPermissions: cred.requiredPermissions || [],
                                setupInstructions: cred.setupInstructions
                            }))
                        } : undefined,
                        externalResources: step.externalResources ? {
                            create: step.externalResources.map((resource: any) => ({
                                title: resource.title,
                                url: resource.url,
                                type: resource.type
                            }))
                        } : undefined
                    }))
                }
            },
            create: {
                workflowSlug: tutorial.workflowSlug,
                title: tutorial.title,
                description: tutorial.description,
                difficulty: tutorial.difficulty,
                estimatedTime: tutorial.estimatedTime,
                isAIGenerated: tutorial.isAIGenerated || false,
                isPublished: true,
                steps: {
                    create: tutorial.steps.map((step: any) => ({
                        order: step.order,
                        title: step.title,
                        description: step.description,
                        type: step.type,
                        codeSnippet: step.codeSnippet,
                        imageUrl: step.imageUrl,
                        videoUrl: step.videoUrl,
                        hints: step.hints || [],
                        credentialLinks: step.credentialLinks ? {
                            create: step.credentialLinks.map((cred: any) => ({
                                name: cred.name,
                                provider: cred.provider,
                                setupUrl: cred.setupUrl,
                                documentationUrl: cred.documentationUrl,
                                requiredPermissions: cred.requiredPermissions || [],
                                setupInstructions: cred.setupInstructions
                            }))
                        } : undefined,
                        externalResources: step.externalResources ? {
                            create: step.externalResources.map((resource: any) => ({
                                title: resource.title,
                                url: resource.url,
                                type: resource.type
                            }))
                        } : undefined
                    }))
                }
            }
        })

        console.log("[TUTORIAL_SAVE] Tutorial saved to database:", savedTutorial.id)

        return NextResponse.json({
            success: true,
            message: "Tutorial saved to database successfully",
            tutorialId: savedTutorial.id
        })
    } catch (error) {
        console.error("[TUTORIAL_SAVE] Error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to save tutorial" },
            { status: 500 }
        )
    }
}

export async function DELETE(request: Request) {
    try {
        // Check admin authentication
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check if user has admin role
        const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const slug = searchParams.get("slug")

        if (!slug) {
            return NextResponse.json(
                { error: "Workflow slug is required" },
                { status: 400 }
            )
        }

        // Delete tutorial from database (cascade will delete steps, credentials, resources)
        const deletedTutorial = await prisma.tutorial.delete({
            where: {
                workflowSlug: slug
            }
        })

        console.log(`[TUTORIAL_DELETE] Deleted tutorial: ${deletedTutorial.id}`)

        return NextResponse.json({
            success: true,
            message: "Tutorial deleted successfully",
        })
    } catch (error) {
        console.error("[TUTORIAL_DELETE] Error:", error)

        // Handle not found case
        if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
            return NextResponse.json(
                { error: "Tutorial not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to delete tutorial" },
            { status: 500 }
        )
    }
}
