import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Groq from 'groq-sdk';

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY environment variable");
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

interface BundleImagePrompt {
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const isAdmin =
      session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bundleName, bundleDescription, bundleObjective, workflowCount } = body;

    if (!bundleName) {
      return NextResponse.json(
        { error: 'Missing required field: bundleName' },
        { status: 400 }
      );
    }

    // Generate bundle image prompt using Groq AI
    console.log('Generating bundle image prompt with Groq AI...');
    const groq = getGroqClient();

    const systemPrompt = `You are an expert UI/UX designer creating image prompts for n8n workflow bundle collections.
Your images must follow FlowKit's brand identity:
- Main brand color: #FF6B35 (orange)
- Supporting colors: Dark theme with white/gray text
- Style: Modern, clean, tech-focused, professional
- Vibe: Automation-driven, trustworthy, innovative, complete solution

Generate a detailed JSON prompt for creating a bundle thumbnail that:
1. Represents a COLLECTION of workflows (not a single workflow)
2. Uses FlowKit's orange theme (#FF6B35) with gradient effects
3. Includes iconography suggesting completeness and bundled value
4. Has a premium, professional look (bundles are more valuable than single workflows)
5. Is suitable for display in a dark-themed interface
6. Emphasizes the "all-in-one solution" concept

Return ONLY valid JSON in this exact format:
{
  "style": "modern, gradient, premium, high-contrast",
  "theme": "<bundle theme>",
  "layout": {
    "background": "<background with gradient description>",
    "main_visual": "<main visual elements showing bundled concept>",
    "iconography": ["icon1", "icon2", "icon3"],
    "text": {
      "title": "<bundle title>",
      "subtitle": "Complete Workflow Bundle",
      "font_style": "bold, gradient, premium",
      "placement": "center or bottom"
    }
  },
  "vibe": "premium, complete solution, professional, trustworthy",
  "lighting": "soft glow, gradient overlays, premium shine",
  "colors": ["#FF6B35", "#F7931E", "#FFFFFF", "#additional colors"],
  "quality": "4K, sharp, premium finish"
}`;

    const userPrompt = `Create an image prompt for this n8n workflow bundle:

Bundle Name: ${bundleName}
${bundleDescription ? `Description: ${bundleDescription}` : ''}
${bundleObjective ? `Objective: ${bundleObjective}` : ''}
Number of Workflows: ${workflowCount || 'Multiple'}

Generate a JSON prompt that captures the premium, complete-solution nature of this bundle while using FlowKit's orange brand color (#FF6B35) with gradient effects for a premium look.`;

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
    const prompt: BundleImagePrompt = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      prompt: prompt,
    });
  } catch (error) {
    console.error('Bundle image prompt generation error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate bundle image prompt',
      },
      { status: 500 }
    );
  }
}
