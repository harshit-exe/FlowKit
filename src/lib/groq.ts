import Groq from "groq-sdk";

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY environment variable");
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

interface ThumbnailPrompt {
  style: string;
  theme: string;
  layout: {
    background: string;
    main_visual: string;
    iconography: string[];
    text: {
      title: string;
      subtitle: string;
      font_style: string;
      placement: string;
    };
  };
  vibe: string;
  lighting: string;
  colors: string[];
  quality: string;
}

/**
 * Generate thumbnail prompt using Groq AI
 */
export async function generateThumbnailPrompt(
  workflowName: string,
  workflowJson: any
): Promise<ThumbnailPrompt> {
  try {
    const groq = getGroqClient();

    // Analyze workflow to extract key information
    const nodes = workflowJson.nodes || [];
    const nodeTypes = nodes
      .map((node: any) => {
        if (node.type) {
          const parts = node.type.split('.');
          return parts[parts.length - 1];
        }
        return node.name || 'Unknown';
      })
      .slice(0, 5); // Get first 5 nodes

    const systemPrompt = `You are an expert UI/UX designer creating thumbnail prompts for n8n workflow templates.
Your thumbnails must follow FlowKit's brand identity:
- Main brand color: #FF6B35 (orange)
- Supporting colors: Dark theme with white/gray text
- Style: Modern, clean, tech-focused, professional
- Vibe: Automation-driven, trustworthy, innovative

Generate a detailed JSON prompt for creating a workflow thumbnail that:
1. Reflects the workflow's purpose and key nodes
2. Uses FlowKit's orange theme (#FF6B35) prominently
3. Includes relevant iconography for the workflow type
4. Has a modern, professional look
5. Is suitable for display in a dark-themed interface

Return ONLY valid JSON in this exact format:
{
  "style": "modern, high-contrast, minimal",
  "theme": "<workflow theme>",
  "layout": {
    "background": "<background description with colors>",
    "main_visual": "<main visual elements>",
    "iconography": ["icon1", "icon2", "icon3"],
    "text": {
      "title": "<workflow title>",
      "subtitle": "n8n Workflow Template",
      "font_style": "bold, rounded, tech",
      "placement": "bottom center"
    }
  },
  "vibe": "professional, automation-driven, trustworthy",
  "lighting": "soft shadows, glossy highlights",
  "colors": ["#FF6B35", "#FFFFFF", "#additional colors"],
  "quality": "4K, sharp, crisp edges"
}`;

    const userPrompt = `Create a thumbnail prompt for this n8n workflow:

Workflow Name: ${workflowName}
Key Nodes: ${nodeTypes.join(', ')}
Total Nodes: ${nodes.length}

Generate a JSON prompt that captures the essence of this workflow while using FlowKit's orange brand color (#FF6B35) as the primary theme.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "{}";
    const prompt = JSON.parse(responseText);

    return prompt as ThumbnailPrompt;
  } catch (error) {
    console.error("Groq AI error:", error);
    throw new Error("Failed to generate thumbnail prompt");
  }
}
