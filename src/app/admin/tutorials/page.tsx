"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Sparkles, Loader2, Save, Eye, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import { Tutorial } from "@/types"

export default function TutorialsAdminPage() {
  const [workflows, setWorkflows] = useState<any[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<any | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedTutorial, setGeneratedTutorial] = useState<Tutorial | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Fetch workflows on mount
  useEffect(() => {
    fetchWorkflows()
  }, [])

  const fetchWorkflows = async () => {
    try {
      const res = await fetch("/api/workflows?published=true&limit=100")
      const data = await res.json()
      setWorkflows(data.workflows || [])
    } catch (error) {
      toast.error("Failed to load workflows")
    }
  }

  const handleGenerateTutorial = async () => {
    if (!selectedWorkflow) return

    setIsGenerating(true)
    try {
      const res = await fetch("/api/tutorials/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowSlug: selectedWorkflow.slug,
          workflowName: selectedWorkflow.name,
          description: selectedWorkflow.description,
          setupSteps: selectedWorkflow.setupSteps,
          credentialsRequired: selectedWorkflow.credentialsRequired,
          nodes: selectedWorkflow.nodes,
          difficulty: selectedWorkflow.difficulty,
          workflowJson: selectedWorkflow.workflowJson,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setGeneratedTutorial(data.tutorial)
        toast.success("Tutorial generated successfully!")
      } else {
        toast.error(data.error || "Failed to generate tutorial")
      }
    } catch (error) {
      toast.error("Failed to generate tutorial")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveTutorial = async () => {
    if (!generatedTutorial) return

    setIsSaving(true)
    try {
      const res = await fetch("/api/tutorials/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorial: generatedTutorial }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success(data.message)
        setGeneratedTutorial(null)
        setSelectedWorkflow(null)
      } else {
        toast.error(data.error || "Failed to save tutorial")
      }
    } catch (error) {
      toast.error("Failed to save tutorial")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditStep = (stepIndex: number, field: string, value: any) => {
    if (!generatedTutorial) return

    const updatedSteps = [...generatedTutorial.steps]
    updatedSteps[stepIndex] = {
      ...updatedSteps[stepIndex],
      [field]: value,
    }

    setGeneratedTutorial({
      ...generatedTutorial,
      steps: updatedSteps,
    })
  }

  const handleAddStep = () => {
    if (!generatedTutorial) return

    const newStep = {
      id: `step-${generatedTutorial.steps.length + 1}`,
      order: generatedTutorial.steps.length + 1,
      title: "New Step",
      description: "Enter step description...",
      type: "INFO" as const,
      hints: [],
    }

    setGeneratedTutorial({
      ...generatedTutorial,
      steps: [...generatedTutorial.steps, newStep],
    })
  }

  const handleDeleteStep = (stepIndex: number) => {
    if (!generatedTutorial) return

    const updatedSteps = generatedTutorial.steps.filter((_, idx) => idx !== stepIndex)
    // Reorder remaining steps
    const reorderedSteps = updatedSteps.map((step, idx) => ({
      ...step,
      id: `step-${idx + 1}`,
      order: idx + 1,
    }))

    setGeneratedTutorial({
      ...generatedTutorial,
      steps: reorderedSteps,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-mono uppercase tracking-tight">
            AI Tutorial Generator
          </h1>
          <p className="text-muted-foreground font-mono mt-1">
            Generate interactive tutorials for workflows using AI
          </p>
        </div>
      </div>

      {/* Workflow Selector */}
      {!generatedTutorial && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="font-mono uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Step 1: Select Workflow
            </CardTitle>
            <CardDescription className="font-mono">
              Choose a workflow to generate a tutorial for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {workflows.map((workflow) => (
                <Card
                  key={workflow.id}
                  className={`cursor-pointer transition-all border-2 ${
                    selectedWorkflow?.id === workflow.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedWorkflow(workflow)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <p className="font-bold font-mono text-sm line-clamp-2">
                        {workflow.name}
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {workflow.difficulty}
                        </Badge>
                        <Badge variant="outline" className="font-mono text-xs">
                          {workflow.nodeCount} nodes
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedWorkflow && (
              <div className="pt-4 border-t">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-bold font-mono mb-2">Selected Workflow:</p>
                    <p className="text-sm font-mono text-primary">{selectedWorkflow.name}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-1">
                      {selectedWorkflow.slug}
                    </p>
                  </div>
                  <Button
                    onClick={handleGenerateTutorial}
                    disabled={isGenerating}
                    size="lg"
                    className="font-mono gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Tutorial with AI
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generated Tutorial Preview */}
      {generatedTutorial && (
        <div className="space-y-4">
          {/* Tutorial Metadata */}
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="font-mono uppercase tracking-wider flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Step 2: Review & Edit Tutorial
              </CardTitle>
              <CardDescription className="font-mono">
                AI has generated {generatedTutorial.steps.length} steps. Review and customize before saving.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-mono uppercase text-xs">Title</Label>
                  <Input
                    value={generatedTutorial.title}
                    onChange={(e) =>
                      setGeneratedTutorial({ ...generatedTutorial, title: e.target.value })
                    }
                    className="font-mono"
                  />
                </div>
                <div>
                  <Label className="font-mono uppercase text-xs">Estimated Time</Label>
                  <Input
                    value={generatedTutorial.estimatedTime}
                    onChange={(e) =>
                      setGeneratedTutorial({ ...generatedTutorial, estimatedTime: e.target.value })
                    }
                    className="font-mono"
                  />
                </div>
              </div>
              <div>
                <Label className="font-mono uppercase text-xs">Description</Label>
                <Textarea
                  value={generatedTutorial.description}
                  onChange={(e) =>
                    setGeneratedTutorial({ ...generatedTutorial, description: e.target.value })
                  }
                  className="font-mono"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tutorial Steps */}
          <div className="space-y-3">
            {generatedTutorial.steps.map((step, index) => (
              <Card key={step.id} className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="font-mono text-lg flex items-center gap-2">
                        <span className="text-primary">Step {step.order}</span>
                        <Badge variant="outline" className="font-mono">
                          {step.type}
                        </Badge>
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteStep(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="font-mono uppercase text-xs">Title</Label>
                    <Input
                      value={step.title}
                      onChange={(e) => handleEditStep(index, "title", e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label className="font-mono uppercase text-xs">Description</Label>
                    <Textarea
                      value={step.description}
                      onChange={(e) => handleEditStep(index, "description", e.target.value)}
                      className="font-mono"
                      rows={3}
                    />
                  </div>
                  {step.codeSnippet && (
                    <div>
                      <Label className="font-mono uppercase text-xs">Instructions</Label>
                      <Textarea
                        value={step.codeSnippet}
                        onChange={(e) => handleEditStep(index, "codeSnippet", e.target.value)}
                        className="font-mono text-xs"
                        rows={4}
                      />
                    </div>
                  )}
                  <div>
                    <Label className="font-mono uppercase text-xs mb-2 block">
                      Hints ({step.hints?.length || 0})
                    </Label>
                    <div className="space-y-2">
                      {step.hints?.map((hint, hintIndex) => (
                        <div key={hintIndex} className="flex gap-2">
                          <span className="text-xs font-mono text-muted-foreground pt-2">
                            {hintIndex + 1}.
                          </span>
                          <Input
                            value={hint}
                            onChange={(e) => {
                              const newHints = [...(step.hints || [])]
                              newHints[hintIndex] = e.target.value
                              handleEditStep(index, "hints", newHints)
                            }}
                            className="font-mono text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="outline"
              onClick={handleAddStep}
              className="w-full font-mono gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Step
            </Button>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setGeneratedTutorial(null)
                setSelectedWorkflow(null)
              }}
              className="font-mono"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTutorial}
              disabled={isSaving}
              size="lg"
              className="font-mono gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Tutorial to File
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <Card className="border-2 border-primary">
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg font-mono font-bold">AI is analyzing your workflow...</p>
              <p className="text-sm font-mono text-muted-foreground text-center max-w-md">
                This may take 30-60 seconds. We're generating personalized steps, hints, and instructions based on your workflow's complexity.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
