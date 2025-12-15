import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params

        // Fetch tutorial from database with all relations
        const tutorial = await prisma.tutorial.findUnique({
            where: {
                workflowSlug: slug,
                isPublished: true
            },
            include: {
                steps: {
                    orderBy: {
                        order: 'asc'
                    },
                    include: {
                        credentialLinks: true,
                        externalResources: true
                    }
                }
            }
        })

        if (!tutorial) {
            return NextResponse.json(
                { error: "Tutorial not found" },
                { status: 404 }
            )
        }

        // Transform to match expected format (with id strings for steps)
        const transformedTutorial = {
            id: `tutorial-${slug}`,
            workflowSlug: tutorial.workflowSlug,
            title: tutorial.title,
            description: tutorial.description,
            difficulty: tutorial.difficulty,
            estimatedTime: tutorial.estimatedTime,
            isAIGenerated: tutorial.isAIGenerated,
            steps: tutorial.steps.map(step => ({
                id: `step-${step.order}`,
                order: step.order,
                title: step.title,
                description: step.description,
                type: step.type,
                codeSnippet: step.codeSnippet,
                imageUrl: step.imageUrl,
                videoUrl: step.videoUrl,
                hints: step.hints as string[] || [],
                credentialLinks: step.credentialLinks.map(cred => ({
                    name: cred.name,
                    provider: cred.provider,
                    setupUrl: cred.setupUrl,
                    documentationUrl: cred.documentationUrl,
                    requiredPermissions: cred.requiredPermissions as string[] || [],
                    setupInstructions: cred.setupInstructions
                })),
                externalResources: step.externalResources.map(resource => ({
                    title: resource.title,
                    url: resource.url,
                    type: resource.type
                }))
            }))
        }

        return NextResponse.json({
            success: true,
            tutorial: transformedTutorial
        })
    } catch (error) {
        console.error("[TUTORIAL_GET] Error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch tutorial" },
            { status: 500 }
        )
    }
}
