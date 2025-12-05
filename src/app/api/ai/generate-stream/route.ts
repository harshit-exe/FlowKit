import { NextResponse } from "next/server";
import { generateWorkflowWithAI, WorkflowGenerationProgress } from "@/lib/ai-workflow-builder";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, apiKey } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
    }

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    if (prompt.length > 500) {
      return NextResponse.json(
        { error: "Prompt too long (max 500 characters)" },
        { status: 400 }
      );
    }

    // Create a ReadableStream for SSE (Server-Sent Events)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const workflow = await generateWorkflowWithAI(
            prompt,
            (progress: WorkflowGenerationProgress) => {
              // Send progress updates as SSE
              const data = `data: ${JSON.stringify(progress)}\n\n`;
              controller.enqueue(encoder.encode(data));
            },
            apiKey // Pass user's API key
          );

          // Send final result
          const finalData = `data: ${JSON.stringify({
            step: "complete",
            message: "Workflow generated successfully!",
            workflow,
          })}\n\n`;
          controller.enqueue(encoder.encode(finalData));

          controller.close();
        } catch (error: any) {
          const errorData = `data: ${JSON.stringify({
            step: "error",
            message: error.message || "Failed to generate workflow",
          })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[AI_GENERATE_STREAM]", error);
    return NextResponse.json(
      { error: "Failed to generate workflow" },
      { status: 500 }
    );
  }
}
