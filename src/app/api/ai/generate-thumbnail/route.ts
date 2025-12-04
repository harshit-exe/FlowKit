import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateThumbnailPrompt } from '@/lib/groq';

export async function POST(request: NextRequest) {
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
    const { workflowName, workflowJson } = body;

    if (!workflowName || !workflowJson) {
      return NextResponse.json(
        { error: 'Missing required fields: workflowName and workflowJson' },
        { status: 400 }
      );
    }

    // Parse workflow JSON if it's a string
    let parsedWorkflowJson;
    try {
      parsedWorkflowJson =
        typeof workflowJson === 'string'
          ? JSON.parse(workflowJson)
          : workflowJson;
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid workflow JSON' },
        { status: 400 }
      );
    }

    // Generate thumbnail prompt using Groq AI
    console.log('Generating thumbnail prompt with Groq AI...');
    const promptJson = await generateThumbnailPrompt(
      workflowName,
      parsedWorkflowJson
    );

    return NextResponse.json({
      success: true,
      prompt: promptJson,
    });
  } catch (error) {
    console.error('Thumbnail prompt generation error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate thumbnail prompt',
      },
      { status: 500 }
    );
  }
}
