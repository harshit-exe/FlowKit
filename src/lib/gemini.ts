import { GoogleGenerativeAI } from "@google/generative-ai"

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable")
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
})

export async function generateWorkflow(prompt: string): Promise<any> {
  const systemPrompt = `You are an n8n workflow generator. Generate a valid n8n workflow JSON based on the user's request.

The workflow must follow this exact structure:
{
  "name": "Workflow Name",
  "nodes": [
    {
      "parameters": {},
      "id": "unique-id",
      "name": "Node Name",
      "type": "n8n-nodes-base.nodeName",
      "typeVersion": 1,
      "position": [x, y]
    }
  ],
  "connections": {},
  "settings": {
    "executionOrder": "v1"
  }
}

Important:
- Return ONLY valid JSON, no markdown or explanations
- Include at least one trigger node and one action node
- Use realistic n8n node types (e.g., Webhook, HTTP Request, Set, etc.)
- Make sure all node IDs are unique
- Ensure connections reference valid node IDs

User Request: ${prompt}

Generate the workflow JSON now:`

  try {
    const result = await geminiModel.generateContent(systemPrompt)
    const response = result.response
    const text = response.text()

    // Try to extract JSON from the response
    let jsonText = text.trim()

    // Remove markdown code blocks if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\n/, "").replace(/\n```$/, "")
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\n/, "").replace(/\n```$/, "")
    }

    // Parse and return JSON
    const workflowJson = JSON.parse(jsonText)
    return workflowJson
  } catch (error) {
    console.error("Gemini generation error:", error)
    throw new Error("Failed to generate workflow")
  }
}
