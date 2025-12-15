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

        // Build AI prompt with credential provider database
        const prompt = `You are an expert n8n workflow tutorial creator. Generate a comprehensive, interactive tutorial for the following n8n workflow.

**Workflow Details:**
- Name: ${workflowName}
- Description: ${description || "N/A"}
- Difficulty: ${difficulty || "BEGINNER"}
- Setup Steps: ${JSON.stringify(setupSteps || [], null, 2)}
- Required Credentials: ${JSON.stringify(credentialsRequired || [], null, 2)}
- Nodes Used: ${JSON.stringify(nodes || [], null, 2)}

**CREDENTIAL PROVIDER DATABASE:**

Use this database to generate credentialLinks for steps that require API credentials. Match the workflow's credentialsRequired to these providers:

Google/Gmail/Google Sheets:
- name: "Google OAuth2"
- provider: "Google"
- setupUrl: "https://console.cloud.google.com/apis/credentials"
- documentationUrl: "https://developers.google.com/identity/protocols/oauth2"
- requiredPermissions: ["Google Sheets API", "Gmail API", "Google Drive API"] (pick relevant ones)

LinkedIn:
- name: "LinkedIn API"
- provider: "LinkedIn"
- setupUrl: "https://www.linkedin.com/developers/apps"
- documentationUrl: "https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication"
- requiredPermissions: ["r_liteprofile", "w_member_social", "r_organization_social"]

Facebook/Instagram:
- name: "Facebook App Credentials"
- provider: "Facebook"
- setupUrl: "https://developers.facebook.com/apps"
- documentationUrl: "https://developers.facebook.com/docs/facebook-login"
- requiredPermissions: ["pages_messaging", "instagram_manage_messages", "pages_manage_metadata"]

Slack:
- name: "Slack OAuth"
- provider: "Slack"
- setupUrl: "https://api.slack.com/apps"
- documentationUrl: "https://api.slack.com/authentication"
- requiredPermissions: ["chat:write", "channels:read", "users:read"]

GitHub:
- name: "GitHub Personal Access Token"
- provider: "GitHub"
- setupUrl: "https://github.com/settings/tokens"
- documentationUrl: "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens"
- requiredPermissions: ["repo", "workflow", "admin:org"]

OpenAI/ChatGPT:
- name: "OpenAI API Key"
- provider: "OpenAI"
- setupUrl: "https://platform.openai.com/api-keys"
- documentationUrl: "https://platform.openai.com/docs/api-reference/authentication"

Twitter:
- name: "Twitter API"
- provider: "Twitter"
- setupUrl: "https://developer.twitter.com/en/portal/projects-and-apps"
- documentationUrl: "https://developer.twitter.com/en/docs/authentication"
- requiredPermissions: ["tweet.read", "tweet.write", "users.read"]

Airtable:
- name: "Airtable Personal Access Token"
- provider: "Airtable"
- setupUrl: "https://airtable.com/create/tokens"
- documentationUrl: "https://airtable.com/developers/web/api/authentication"

Notion:
- name: "Notion Integration"
- provider: "Notion"
- setupUrl: "https://www.notion.so/my-integrations"
- documentationUrl: "https://developers.notion.com/docs/authorization"

**EXTERNAL RESOURCES DATABASE:**

Always include these for relevant nodes:

For ANY workflow:
- title: "n8n [NodeName] Documentation"
- url: "https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.[nodename]/"
- type: "documentation"

For OAuth/API setups:
- title: "[Provider] API Documentation"
- url: [from provider database above]
- type: "documentation"

For complex setups:
- title: "n8n Community Forum"
- url: "https://community.n8n.io/"
- type: "community"

**INSTRUCTIONS:**

Create a tutorial with 5-10 steps. For EVERY step that involves setting up credentials:

1. **MUST include credentialLinks array** with provider details from database above
2. **MUST include setupInstructions** in credentialLinks (5-10 clear steps)
3. **MUST include externalResources** with n8n docs + provider docs

**JSON Structure (COPY THIS EXACTLY):**

{
  "id": "tutorial-${workflowSlug}",
  "workflowSlug": "${workflowSlug}",
  "title": "Complete Setup Guide: [workflow name]",
  "description": "Brief overview (2-3 sentences)",
  "difficulty": "${difficulty || "BEGINNER"}",
  "estimatedTime": "X minutes",
  "isAIGenerated": true,
  "steps": [
    {
      "id": "step-1",
      "order": 1,
      "title": "Welcome! 👋",
      "description": "Introduction...",
      "type": "INFO",
      "hints": ["hint1", "hint2", "hint3"]
    },
    {
      "id": "step-2",
      "order": 2,
      "title": "🔐 Set Up [Provider] Credentials",
      "description": "Connect your account...",
      "type": "ACTION",
      "codeSnippet": "1. Click node\\n2. Select credential\\n3. Follow setup link below",
      "credentialLinks": [
        {
          "name": "Provider Name",
          "provider": "Provider",
          "setupUrl": "https://...",
          "documentationUrl": "https://...",
          "requiredPermissions": ["perm1", "perm2"],
          "setupInstructions": "**Title:**\\n\\n1. Step one\\n2. Step two\\n3. Step three"
        }
      ],
      "externalResources": [
        {
          "title": "n8n Node Docs",
          "url": "https://docs.n8n.io/...",
          "type": "documentation"
        }
      ],
      "hints": ["hint1", "hint2", "hint3"]
    }
  ]
}

**CRITICAL RULES:**
1. If workflow uses Google/Gmail → MUST include Google OAuth credentialLink
2. If workflow uses LinkedIn → MUST include LinkedIn API credentialLink
3. If workflow uses Facebook/Instagram → MUST include Facebook App credentialLink
4. setupInstructions must be detailed (5-10 numbered steps)
5. Always include 2-3 externalResources per credential step
6. Use emojis in step titles (🔐 for credentials, ✉️ for email, etc.)
7. Match requiredPermissions to what the workflow actually needs

**Return ONLY valid JSON with credentialLinks and externalResources included. No markdown formatting.**`

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

        // Ensure all steps have required fields (preserve credentialLinks and externalResources if present)
        tutorial.steps = tutorial.steps.map((step: any, index: number) => ({
            id: step.id || `step-${index + 1}`,
            order: step.order || index + 1,
            title: step.title || `Step ${index + 1}`,
            description: step.description || "",
            type: step.type || "INFO",
            hints: step.hints || [],
            codeSnippet: step.codeSnippet || undefined,
            credentialLinks: step.credentialLinks || undefined, // NEW: Preserve AI-generated credential links
            externalResources: step.externalResources || undefined, // NEW: Preserve AI-generated resources
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
