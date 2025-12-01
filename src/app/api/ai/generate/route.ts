import { NextResponse } from "next/server"
import { generateWorkflow } from "@/lib/gemini"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt" }, { status: 400 })
    }

    if (prompt.length > 500) {
      return NextResponse.json({ error: "Prompt too long (max 500 characters)" }, { status: 400 })
    }

    const workflowJson = await generateWorkflow(prompt)

    return NextResponse.json({
      success: true,
      workflow: workflowJson,
    })
  } catch (error) {
    console.error("[AI_GENERATE]", error)
    return NextResponse.json(
      { error: "Failed to generate workflow. Please try again." },
      { status: 500 }
    )
  }
}
