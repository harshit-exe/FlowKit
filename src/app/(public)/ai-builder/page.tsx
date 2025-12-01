"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Copy, Download, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { copyWorkflowJSON, downloadWorkflowJSON } from "@/lib/utils"

export default function AIBuilderPage() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedWorkflow, setGeneratedWorkflow] = useState<any>(null)

  const examplePrompts = [
    "Send email when new row is added to Google Sheets",
    "Post to Twitter when RSS feed updates",
    "Create Slack notification for new GitHub issues",
    "Sync contacts between Airtable and HubSpot",
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate workflow")
      }

      setGeneratedWorkflow(data.workflow)
      toast.success("Workflow generated successfully!")
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
          <Badge className="text-sm px-4 py-1">
            <Sparkles className="h-3 w-3 mr-1" />
            Powered by Google Gemini AI
          </Badge>
          <h1 className="text-5xl font-bold">AI Workflow Builder</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Describe your automation in plain English, and let AI generate the n8n workflow for you.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Describe Your Workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="E.g., Send an email notification when a new row is added to Google Sheets..."
                  rows={6}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating}
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Workflow
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Example Prompts */}
            <Card>
              <CardHeader>
                <CardTitle>Example Prompts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors text-sm"
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
            {generatedWorkflow ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Generated Workflow</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopy}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-lg">{generatedWorkflow.name}</p>
                    <p className="text-sm text-gray-600">
                      {generatedWorkflow.nodes?.length || 0} nodes
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="text-xs">
                      <code>{JSON.stringify(generatedWorkflow, null, 2)}</code>
                    </pre>
                  </div>

                  <Button
                    onClick={() => {
                      setGeneratedWorkflow(null)
                      setPrompt("")
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Generate Another
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center min-h-[400px]">
                <CardContent className="text-center space-y-4">
                  <Sparkles className="h-16 w-16 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">No workflow generated yet</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Enter a prompt and click Generate to create your workflow
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <h3 className="font-semibold">Describe Your Automation</h3>
                <p className="text-sm text-gray-600">
                  Tell us what you want to automate in plain English
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <h3 className="font-semibold">AI Generates Workflow</h3>
                <p className="text-sm text-gray-600">
                  Our AI creates a complete n8n workflow JSON for you
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <h3 className="font-semibold">Copy & Deploy</h3>
                <p className="text-sm text-gray-600">
                  Copy the JSON and import it directly into your n8n instance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
