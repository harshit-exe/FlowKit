import { NextResponse } from "next/server";
import { generateAIContent } from "@/lib/ai-provider";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { workflowJson } = body;

        if (!workflowJson) {
            return NextResponse.json(
                { error: "Workflow JSON is required" },
                { status: 400 }
            );
        }

        // Parse the workflow JSON
        let parsedWorkflow;
        try {
            parsedWorkflow = typeof workflowJson === "string"
                ? JSON.parse(workflowJson)
                : workflowJson;
        } catch (error) {
            return NextResponse.json(
                { error: "Invalid JSON format" },
                { status: 400 }
            );
        }

        const prompt = `You are an expert n8n workflow analyst. Analyze this workflow JSON and generate comprehensive metadata for a workflow marketplace.

Workflow JSON:
${JSON.stringify(parsedWorkflow, null, 2)}

Generate a complete analysis with the following structure (return ONLY valid JSON, no markdown):

{
  "name": "SEO-friendly workflow name (max 60 chars)",
  "description": "Rich HTML description with <p>, <strong>, <em> tags. 2-3 paragraphs explaining what it does, benefits, and key features. Make it compelling and SEO-friendly (150-200 words)",
  "icon": "Single relevant emoji that represents this workflow",
  "difficulty": "BEGINNER | INTERMEDIATE | ADVANCED (based on complexity)",
  "nodeCount": number of nodes in the workflow,
  "nodes": ["List of all node types used, e.g., Gmail, HTTP Request, Google Sheets"],
  "credentialsRequired": ["List of credentials needed, e.g., Gmail OAuth, Slack API, Google Sheets OAuth"],
  "useCases": [
    "Use case 1: Detailed scenario where this workflow is useful (2-3 sentences)",
    "Use case 2: Another practical application (2-3 sentences)",
    "Use case 3: Third use case (2-3 sentences)",
    "Use case 4: Fourth use case if applicable (2-3 sentences)",
    "Use case 5: Fifth use case if applicable (2-3 sentences)"
  ],
  "setupSteps": [
    "First setup instruction with clear action items",
    "Second setup instruction",
    "Third setup instruction",
    "Fourth setup instruction if needed",
    "Fifth setup instruction if needed",
    "Additional steps as needed"
  ],
  "tags": ["5-10 relevant SEO tags like 'automation', 'email', 'slack', 'productivity', etc."]
}

IMPORTANT GUIDELINES:
1. **Name**: Make it descriptive and SEO-friendly. Include key integrations.
2. **Description**: Write in HTML with proper formatting. Make it compelling for users searching for automation solutions.
3. **Icon**: Choose ONE emoji that best represents the workflow's primary function.
4. **Difficulty**: 
   - BEGINNER: 1-3 nodes, simple trigger-action
   - INTERMEDIATE: 4-6 nodes, some logic/conditions
   - ADVANCED: 7+ nodes, complex logic, multiple integrations
5. **Nodes**: Extract actual node types from the JSON (look for "type" field in nodes array)
6. **Credentials**: Identify what auth/credentials are needed based on the nodes used
7. **Use Cases**: Provide 3-5 DETAILED, real-world scenarios. Each should be 2-3 sentences explaining WHO would use it and WHY.
8. **Setup Steps**: Provide 5-8 clear, actionable steps. Include credential setup, node configuration, and testing. DO NOT include "Step 1", "Step 2" prefixes. Just the instruction text.
9. **Tags**: Include relevant keywords for SEO (integrations, use cases, industries)

Return ONLY the JSON object, no markdown formatting, no explanations.`;

        const text = await generateAIContent(prompt, { jsonMode: true });

        // Clean markdown if present (handled by generateAIContent usually but good to be safe if provider returns raw text)
        let jsonText = text.trim();
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.replace(/^```json\n/, "").replace(/\n```$/, "");
        } else if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/^```\n/, "").replace(/\n```$/, "");
        }

        const analysis = JSON.parse(jsonText);

        // Post-processing to remove "Step X" prefixes if AI ignored instructions
        if (analysis.setupSteps && Array.isArray(analysis.setupSteps)) {
            analysis.setupSteps = analysis.setupSteps.map((step: string) =>
                step.replace(/^(Step\s*\d+[:.]\s*)/i, "")
            );
        }

        return NextResponse.json({
            success: true,
            data: analysis,
        });
    } catch (error) {
        console.error("[AI_COMPLETE_AUTOFILL]", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Failed to analyze workflow"
            },
            { status: 500 }
        );
    }
}
