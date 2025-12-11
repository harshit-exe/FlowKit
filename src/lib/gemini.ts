import { GoogleGenerativeAI } from "@google/generative-ai"

function getGeminiModel() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY environment variable")
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
  })
}

import { generateAIContent } from "./ai-provider"

// ... (keep getGeminiModel for internal use or image generation if needed, or remove if unused)
// Actually getGeminiModel is used by generateThumbnailImage so keep it but maybe not export it or keep as is.

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
    const text = await generateAIContent(systemPrompt, { jsonMode: true });

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
    console.error("AI generation error:", error)
    throw new Error("Failed to generate workflow")
  }
}

/**
 * Generate SEO-friendly content using Gemini 2.5 Flash
 */
export async function generateSEOContent(
  prompt: string,
  fieldType: string,
  currentContent?: string
): Promise<string> {
  try {
    let systemPrompt = '';

    switch (fieldType) {
      case 'name':
        systemPrompt = `You are an SEO expert for n8n workflow templates. Generate a concise, SEO-friendly workflow name that:
- Is 3-8 words long
- Includes relevant keywords for search engines
- Is clear and descriptive
- Uses proper capitalization
- Targets n8n workflow searchers

${currentContent ? `Current name: ${currentContent}\n` : ''}
User input: ${prompt}

Return ONLY the optimized workflow name, nothing else.`;
        break;

      case 'description':
        systemPrompt = `You are an SEO expert for n8n workflow templates. Generate an SEO-optimized workflow description that:
- Is 150-200 characters long
- Includes relevant keywords naturally (n8n, workflow, automation, etc.)
- Explains what the workflow does clearly
- Has correct grammar and punctuation
- Is compelling and informative

${currentContent ? `Current description: ${currentContent}\n` : ''}
User input: ${prompt}

Return ONLY the optimized description, nothing else.`;
        break;

      case 'useCase':
        systemPrompt = `You are an SEO expert for n8n workflow templates. Generate an SEO-optimized use case that:
- Is 1-2 sentences
- Includes relevant keywords
- Describes a practical application
- Has correct grammar
- Is compelling

${currentContent ? `Current use case: ${currentContent}\n` : ''}
User input: ${prompt}

Return ONLY the optimized use case, nothing else.`;
        break;

      case 'setupStep':
        systemPrompt = `You are an SEO expert for n8n workflow templates. Generate a clear setup step that:
- Is concise and actionable
- Has correct grammar
- Uses proper technical terminology
- Is easy to follow

${currentContent ? `Current step: ${currentContent}\n` : ''}
User input: ${prompt}

Return ONLY the optimized setup step, nothing else.`;
        break;

      default:
        systemPrompt = `You are an SEO expert. Optimize this content for SEO while maintaining clarity and correct grammar:

${currentContent ? `Current content: ${currentContent}\n` : ''}
User input: ${prompt}

Return ONLY the optimized content, nothing else.`;
    }

    const text = await generateAIContent(systemPrompt);
    return text.trim();
  } catch (error) {
    console.error('AI error:', error);
    throw new Error('Failed to generate SEO content');
  }
}

/**
 * Extract workflow data from n8n JSON
 */
export function parseWorkflowJSON(jsonString: string): {
  nodeCount: number;
  nodes: string[];
  credentialsRequired: string[];
} {
  try {
    const workflow = JSON.parse(jsonString);

    // Extract nodes
    const nodes = workflow.nodes || [];
    const nodeCount = nodes.length;

    // Extract unique node types/names
    const nodeNames = nodes.map((node: any) => {
      // Try to get a human-readable name
      if (node.name) return node.name;
      if (node.type) {
        // Convert node type to readable name (e.g., 'n8n-nodes-base.gmail' -> 'Gmail')
        const typeParts = node.type.split('.');
        const nodeName = typeParts[typeParts.length - 1];
        return nodeName
          .split(/(?=[A-Z])/)
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
      return 'Unknown Node';
    });

    // Extract credentials from nodes
    const credentialsSet = new Set<string>();

    nodes.forEach((node: any) => {
      // Check for credentials in node parameters
      if (node.credentials) {
        Object.keys(node.credentials).forEach(credType => {
          // Convert credential type to readable name
          const credName = credType
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
          credentialsSet.add(credName);
        });
      }

      // Check for common credential patterns in node type
      if (node.type) {
        const nodeType = node.type.toLowerCase();

        // Map common node types to their credentials
        const credentialMappings: Record<string, string> = {
          'gmail': 'Gmail OAuth2',
          'googlesheets': 'Google Sheets API',
          'googlecalendar': 'Google Calendar API',
          'googledrive': 'Google Drive API',
          'slack': 'Slack API',
          'twitter': 'Twitter API',
          'linkedin': 'LinkedIn OAuth2',
          'facebook': 'Facebook Graph API',
          'hubspot': 'HubSpot API',
          'salesforce': 'Salesforce OAuth2',
          'twilio': 'Twilio API',
          'stripe': 'Stripe API',
          'mysql': 'MySQL Database',
          'postgres': 'PostgreSQL Database',
          'mongodb': 'MongoDB Database',
          'aws': 'AWS Credentials',
          's3': 'AWS S3',
          'openai': 'OpenAI API Key',
          'anthropic': 'Anthropic API Key',
        };

        Object.entries(credentialMappings).forEach(([key, value]) => {
          if (nodeType.includes(key)) {
            credentialsSet.add(value);
          }
        });
      }
    });

    return {
      nodeCount,
      nodes: Array.from(new Set(nodeNames)),
      credentialsRequired: Array.from(credentialsSet),
    };
  } catch (error) {
    console.error('JSON parsing error:', error);
    throw new Error('Invalid workflow JSON format');
  }
}

/**
 * Generate thumbnail image using Gemini 2.5 Flash Image
 */
export async function generateThumbnailImage(promptJson: any): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing GEMINI_API_KEY environment variable");
    }

    // Convert JSON prompt to text description
    const textPrompt = `Create a professional workflow thumbnail image with the following specifications:

Style: ${promptJson.style}
Theme: ${promptJson.theme}
Background: ${promptJson.layout.background}
Main Visual: ${promptJson.layout.main_visual}
Icons: ${promptJson.layout.iconography.join(', ')}
Title: ${promptJson.layout.text.title}
Subtitle: ${promptJson.layout.text.subtitle}
Font Style: ${promptJson.layout.text.font_style}
Text Placement: ${promptJson.layout.text.placement}
Vibe: ${promptJson.vibe}
Lighting: ${promptJson.lighting}
Colors: ${promptJson.colors.join(', ')}
Quality: ${promptJson.quality}

Create a high-quality, professional thumbnail that captures this workflow's essence.`;

    // Try different model names that support image generation
    const MODEL_ID = "gemini-exp-1206"; // Experimental model with image generation
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: textPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE"],
      },
    };

    console.log("Sending request to Gemini API...");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    console.log("Parsing response...");
    const data = await response.json();

    console.log("Response structure:", JSON.stringify(data, null, 2).substring(0, 1000));

    // Extract image data from response
    let imageData = "";

    if (data.candidates?.[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          imageData = part.inlineData.data;
          console.log("Found image data in inlineData.data");
          break;
        }
        if (part.inline_data?.data) {
          imageData = part.inline_data.data;
          console.log("Found image data in inline_data.data");
          break;
        }
      }
    }

    if (!imageData) {
      console.error("Full response:", JSON.stringify(data, null, 2));
      throw new Error("No image data received from Gemini API. The model may not support image generation or the response format is different.");
    }

    console.log("Image data received, length:", imageData.length);
    // Return base64 image data
    return `data:image/png;base64,${imageData}`;
  } catch (error) {
    console.error("Gemini image generation error:", error);
    throw new Error("Failed to generate thumbnail image");
  }
}
