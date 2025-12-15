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

        // Check if user has admin role
        const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN"
        if (!isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { workflowSlug, workflowName, description, setupSteps, credentialsRequired, nodes, difficulty, workflowJson } = body

        if (!workflowSlug || !workflowName) {
            return NextResponse.json(
                { error: "Workflow slug and name are required" },
                { status: 400 }
            )
        }

        // Build AI prompt to generate tutorial
        const prompt = `You are an expert n8n workflow tutorial creator. Generate a comprehensive, interactive tutorial for the following n8n workflow.

**Workflow Details:**
- Name: ${workflowName}
- Description: ${description || "N/A"}
- Difficulty: ${difficulty || "BEGINNER"}
- Setup Steps: ${JSON.stringify(setupSteps || [], null, 2)}
- Required Credentials: ${JSON.stringify(credentialsRequired || [], null, 2)}
- Nodes Used: ${JSON.stringify(nodes || [], null, 2)}

**Instructions:**
Create a tutorial with 5-10 steps that guides users through implementing this workflow. Each step should be detailed, actionable, and include helpful hints.

**Step Type Guidelines:**
- **INFO**: Introductory information, welcome messages, explanations
- **ACTION**: Steps requiring user action (downloading, configuring, connecting accounts)
- **VALIDATION**: Steps where users test or verify their setup
- **CHECKPOINT**: Completion milestone or major achievement

**Return a JSON object with this exact structure:**
{
  "id": "tutorial-${workflowSlug}",
  "workflowSlug": "${workflowSlug}",
  "title": "Complete Setup Guide for [workflow name]",
  "description": "Brief overview of what users will learn (2-3 sentences)",
  "difficulty": "${difficulty || "BEGINNER"}",
  "estimatedTime": "X minutes (estimate based on complexity)",
  "isAIGenerated": true,
  "steps": [
    {
      "id": "step-1",
      "order": 1,
      "title": "Clear, action-oriented title",
      "description": "Detailed description explaining what to do and why (2-4 sentences)",
      "type": "INFO|ACTION|VALIDATION|CHECKPOINT",
      "hints": [
        "Helpful hint 1 (troubleshooting or best practice)",
        "Helpful hint 2 (alternative approach or common mistake to avoid)",
        "Helpful hint 3 (optional - advanced tip or resource link)"
      ],
      "codeSnippet": "Optional: Step-by-step instructions in plain text format\\nUse \\\\n for line breaks\\n1. First step\\n2. Second step"
    }
  ]
}

**Guidelines:**
1. Start with an INFO step as welcome/introduction
2. Include ACTION steps for each credential setup and configuration
3. Add a VALIDATION step for testing the workflow
4. End with a CHECKPOINT step celebrating completion
5. Each step should have 2-4 helpful hints
6. Include code snippets for technical steps (authentication, configuration)
7. Make hints progressively more helpful (general → specific → detailed solution)
8. Use emojis sparingly in titles for visual appeal
9. Ensure descriptions are beginner-friendly but technically accurate
10. Estimate realistic time (1-2 min per simple step, 3-5 min for complex ones)

**Example Good Hints:**
- "Make sure you have admin access to your account before starting"
- "If you see an error, try refreshing and allowing pop-ups for OAuth"
- "For testing, use a dedicated test account rather than production data"

**Return ONLY valid JSON, no markdown formatting or explanations.**`

        console.log("[AI_TUTORIAL_GEN] Generating tutorial for:", workflowSlug)

        // Generate tutorial using AI
        const aiResponse = await generateAIContent(prompt, { jsonMode: true })

        // Parse AI response
        let tutorial
        try {
            // Remove markdown code blocks if present
            let cleanedResponse = aiResponse.trim()
            if (cleanedResponse.startsWith("```json")) {
                cleanedResponse = cleanedResponse.replace(/^```json\n/, "").replace(/\n```$/, "")
            } else if (cleanedResponse.startsWith("```")) {
                cleanedResponse = cleanedResponse.replace(/^```\n/, "").replace(/\n```$/, "")
            }

            tutorial = JSON.parse(cleanedResponse)
        } catch (parseError) {
            console.error("[AI_TUTORIAL_GEN] JSON parse error:", parseError)
            console.error("[AI_TUTORIAL_GEN] AI Response:", aiResponse)
            return NextResponse.json(
                { error: "Failed to parse AI response. Please try again." },
                { status: 500 }
            )
        }

        // Validate tutorial structure
        if (!tutorial.steps || !Array.isArray(tutorial.steps)) {
            return NextResponse.json(
                { error: "Invalid tutorial structure generated" },
                { status: 500 }
            )
        }

        // Ensure all steps have required fields
        tutorial.steps = tutorial.steps.map((step: any, index: number) => ({
            id: step.id || `step-${index + 1}`,
            order: step.order || index + 1,
            title: step.title || `Step ${index + 1}`,
            description: step.description || "",
            type: step.type || "INFO",
            hints: step.hints || [],
            codeSnippet: step.codeSnippet || undefined,
        }))

        console.log("[AI_TUTORIAL_GEN] Tutorial generated successfully with", tutorial.steps.length, "steps")

        return NextResponse.json({
            success: true,
            tutorial,
        })
    } catch (error) {
        console.error("[AI_TUTORIAL_GEN] Error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to generate tutorial" },
            { status: 500 }
        )
    }
}
