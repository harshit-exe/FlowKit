import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateAIContent } from "@/lib/ai-provider"

export async function POST(request: Request) {
    try {
        // Check admin authentication
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { workflows } = body

        if (!workflows || !Array.isArray(workflows) || workflows.length === 0) {
            return NextResponse.json(
                { error: "No workflows provided" },
                { status: 400 }
            )
        }

        // Construct a rich prompt for the AI
        const workflowDetails = workflows.map((w, i) => `
Workflow ${i + 1}:
- Name: ${w.name}
- Description: ${w.description}
- Categories: ${w.categories?.map((c: any) => c.category.name).join(", ") || "None"}
`).join("\n")

        const prompt = `You are a marketing expert for an automation workflow platform. Create a compelling bundle definition for the following selected workflows:

${workflowDetails}

Generate a JSON object with the following fields:
1. "name": A creative, catchy, and professional name for this bundle (NOT just "X Workflow Bundle"). It should reflect the combined value (e.g., "E-commerce Power Pack", "Social Media Mastery Suite").
2. "description": A comprehensive, persuasive description (HTML allowed, use <br> for line breaks) that explains why these workflows are better together. Mention specific workflows by name.
3. "objective": A clear, single-sentence main goal of this bundle.
4. "benefits": An array of 5 distinct, benefit-driven bullet points (strings).
5. "targetAudience": A specific description of who this is for (e.g., "Marketing Agencies & Freelancers").
6. "estimatedTime": A realistic total setup time estimate (e.g., "45 minutes").
7. "icon": A single emoji that best represents this bundle.

Return ONLY valid JSON.
`

        const aiResponse = await generateAIContent(prompt, { jsonMode: true })

        // Parse the response
        let generatedData
        try {
            let cleanJson = aiResponse.trim()
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.replace(/^```json\n/, "").replace(/\n```$/, "")
            } else if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.replace(/^```\n/, "").replace(/\n```$/, "")
            }
            generatedData = JSON.parse(cleanJson)
        } catch (e) {
            console.error("Failed to parse AI response:", aiResponse)
            return NextResponse.json(
                { error: "Failed to generate valid bundle data" },
                { status: 500 }
            )
        }

        return NextResponse.json({ data: generatedData })
    } catch (error) {
        console.error("Bundle autofill error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
