"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Copy, Download, Sparkles, Eye } from "lucide-react"
import { toast } from "sonner"
import { copyWorkflowJSON, downloadWorkflowJSON } from "@/lib/utils"
import { WorkflowProgress, ProgressStep } from "@/components/ui/workflow-progress"
import WorkflowVisualizer from "@/components/workflow/WorkflowVisualizer"

export default function AIBuilderPage() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null)
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  const examplePrompts = [
    "Send email when new row is added to Google Sheets",
    "Post to Slack when RSS feed updates",
    "Create Discord notification for new GitHub issues",
    "Send weekly summary email from aggregated data",
  ]

  const initializeSteps = () => {
    setProgressSteps([
      { id: "planning", label: "Planning Workflow Structure", status: "pending" },
      { id: "fetching_nodes", label: "Fetching Available Nodes", status: "pending" },
      { id: "building", label: "Building Workflow Nodes", status: "pending" },
      { id: "finalizing", label: "Finalizing Workflow", status: "pending" },
      { id: "validating", label: "Validating Structure", status: "pending" },
    ])
  }

  const updateStepStatus = (stepId: string, status: ProgressStep["status"]) => {
    setProgressSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, status } : step))
    )
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt")
      return
    }

    setIsGenerating(true)
    setGeneratedWorkflow(null)
    setShowPreview(false)
    initializeSteps()

    try {
      const response = await fetch("/api/ai/generate-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate workflow")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response body")
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6))

            // Update progress based on step
            if (data.step === "planning") {
              updateStepStatus("planning", "active")
              setCurrentMessage(data.message)
            } else if (data.step === "fetching_nodes") {
              updateStepStatus("planning", "completed")
              updateStepStatus("fetching_nodes", "active")
              setCurrentMessage(data.message)
            } else if (data.step.startsWith("building_node_")) {
              updateStepStatus("fetching_nodes", "completed")
              updateStepStatus("building", "active")
              // Update message with current node progress
              const nodeProgress = data.currentNode && data.nodeCount
                ? ` (${data.currentNode}/${data.nodeCount})`
                : '';
              setCurrentMessage(data.message || `Building workflow nodes${nodeProgress}...`)
            } else if (data.step === "finalizing") {
              updateStepStatus("building", "completed")
              updateStepStatus("finalizing", "active")
              setCurrentMessage(data.message)
            } else if (data.step === "validating") {
              updateStepStatus("finalizing", "completed")
              updateStepStatus("validating", "active")
              setCurrentMessage(data.message)
            } else if (data.step === "complete") {
              updateStepStatus("validating", "completed")
              setCurrentMessage("Workflow generated successfully!")
              setGeneratedWorkflow(data.workflow)
              setShowPreview(true)
              toast.success("Workflow generated successfully!")
            } else if (data.step === "error") {
              setCurrentMessage(data.message)
              toast.error(data.message)
              // Mark current active step as error
              setProgressSteps((prev) =>
                prev.map((step) =>
                  step.status === "active" ? { ...step, status: "error" } : step
                )
              )
            }
          }
        }
      }
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Failed to generate workflow")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    try {
      await copyWorkflowJSON(generatedWorkflow)
      toast.success("Workflow JSON copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy JSON")
    }
  }

  const handleDownload = () => {
    try {
      downloadWorkflowJSON(generatedWorkflow, generatedWorkflow.name || "workflow")
      toast.success("Workflow JSON downloaded!")
    } catch (error) {
      toast.error("Failed to download JSON")
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="text-sm px-4 py-1 font-mono border-2">
            <Sparkles className="h-3 w-3 mr-1" />
            POWERED BY GOOGLE GEMINI AI
          </Badge>
          <h1 className="text-5xl font-bold font-mono uppercase tracking-tight">
            AI WORKFLOW BUILDER
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-mono">
            Describe your automation in plain English, and let AI generate the perfect n8n workflow with validated nodes.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="border-2 font-mono">
              <CardHeader>
                <CardTitle className="font-mono uppercase tracking-wider">
                  DESCRIBE YOUR WORKFLOW
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="E.g., Send an email notification when a new row is added to Google Sheets..."
                  rows={6}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating}
                  className="font-mono border-2 resize-none"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full font-mono font-bold"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      GENERATING...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      GENERATE WORKFLOW
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Example Prompts */}
            <Card className="border-2 font-mono">
              <CardHeader>
                <CardTitle className="font-mono uppercase tracking-wider">
                  EXAMPLE PROMPTS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="w-full text-left p-3 border-2 border-border hover:border-primary transition-colors text-sm font-mono"
                      disabled={isGenerating}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div>
            {isGenerating ? (
              <Card className="border-2 font-mono">
                <CardHeader>
                  <CardTitle className="font-mono uppercase tracking-wider">
                    GENERATION PROGRESS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <WorkflowProgress
                    steps={progressSteps}
                    currentMessage={currentMessage}
                  />
                </CardContent>
              </Card>
            ) : generatedWorkflow ? (
              <div className="space-y-6">
                <Card className="border-2 font-mono">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-mono uppercase tracking-wider">
                        GENERATED WORKFLOW
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopy} className="font-mono border-2">
                          <Copy className="h-4 w-4 mr-1" />
                          COPY
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownload} className="font-mono border-2">
                          <Download className="h-4 w-4 mr-1" />
                          DOWNLOAD
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPreview(!showPreview)}
                          className="font-mono border-2"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {showPreview ? "HIDE" : "PREVIEW"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-semibold text-lg font-mono">{generatedWorkflow.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {generatedWorkflow.nodes?.length || 0} NODES • {Object.keys(generatedWorkflow.connections || {}).length} CONNECTIONS
                      </p>
                    </div>

                    <div className="bg-muted/30 p-4 border-2 border-border max-h-96 overflow-y-auto">
                      <pre className="text-xs font-mono">
                        <code>{JSON.stringify(generatedWorkflow, null, 2)}</code>
                      </pre>
                    </div>

                    <Button
                      onClick={() => {
                        setGeneratedWorkflow(null)
                        setPrompt("")
                        setShowPreview(false)
                      }}
                      variant="outline"
                      className="w-full font-mono border-2"
                    >
                      GENERATE ANOTHER
                    </Button>
                  </CardContent>
                </Card>

                {/* Workflow Visualizer */}
                {showPreview && (
                  <Card className="border-2 font-mono">
                    <CardHeader>
                      <CardTitle className="font-mono uppercase tracking-wider">
                        WORKFLOW PREVIEW
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <WorkflowVisualizer
                        workflowJson={generatedWorkflow}
                        className="w-full"
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="border-2 font-mono h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center space-y-4">
                  <Sparkles className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-lg font-medium font-mono uppercase">NO WORKFLOW GENERATED YET</p>
                    <p className="text-sm text-muted-foreground mt-1 font-mono">
                      Enter a prompt and click Generate to create your workflow
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* How It Works */}
        <Card className="border-2 font-mono">
          <CardHeader>
            <CardTitle className="font-mono uppercase tracking-wider">
              HOW IT WORKS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-primary text-primary-foreground border-2 border-primary flex items-center justify-center font-bold font-mono">
                  1
                </div>
                <h3 className="font-semibold font-mono uppercase text-sm">Plan Workflow</h3>
                <p className="text-xs text-muted-foreground font-mono">
                  AI analyzes your request and creates a step-by-step plan
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-primary text-primary-foreground border-2 border-primary flex items-center justify-center font-bold font-mono">
                  2
                </div>
                <h3 className="font-semibold font-mono uppercase text-sm">Fetch Nodes</h3>
                <p className="text-xs text-muted-foreground font-mono">
                  Retrieves validated n8n nodes from database
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-primary text-primary-foreground border-2 border-primary flex items-center justify-center font-bold font-mono">
                  3
                </div>
                <h3 className="font-semibold font-mono uppercase text-sm">Build Block-by-Block</h3>
                <p className="text-xs text-muted-foreground font-mono">
                  Generates each node incrementally with automatic connections
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-primary text-primary-foreground border-2 border-primary flex items-center justify-center font-bold font-mono">
                  4
                </div>
                <h3 className="font-semibold font-mono uppercase text-sm">Validate</h3>
                <p className="text-xs text-muted-foreground font-mono">
                  Validates structure and ensures all connections work
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-primary text-primary-foreground border-2 border-primary flex items-center justify-center font-bold font-mono">
                  5
                </div>
                <h3 className="font-semibold font-mono uppercase text-sm">Deploy</h3>
                <p className="text-xs text-muted-foreground font-mono">
                  Copy JSON and import directly into your n8n instance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
