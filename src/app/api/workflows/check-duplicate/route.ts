import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { workflowJson } = await request.json()

        if (!workflowJson) {
            return NextResponse.json({ error: "Workflow JSON is required" }, { status: 400 })
        }

        // Parse stringified JSON if necessary
        let parsedJson = workflowJson
        if (typeof workflowJson === 'string') {
            try {
                parsedJson = JSON.parse(workflowJson)
            } catch (e) {
                return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 })
            }
        }

        // Check for exact JSON match
        // Note: This relies on MySQL's JSON comparison which should handle whitespace but might be sensitive to key order
        const existing = await prisma.workflow.findFirst({
            where: {
                workflowJson: {
                    equals: parsedJson
                }
            },
            select: {
                id: true,
                name: true,
                slug: true
            }
        })

        if (existing) {
            return NextResponse.json({
                exists: true,
                workflow: existing
            })
        }

        return NextResponse.json({ exists: false })
    } catch (error) {
        console.error("[WORKFLOW_CHECK_DUPLICATE]", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
