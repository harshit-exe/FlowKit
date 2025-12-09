"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Loader2, Plus, X, Sparkles, Image as ImageIcon, Wand2 } from "lucide-react"
import { toast } from "sonner"
import { BundleFormData } from "@/types"
import { CloudinaryImageUpload } from "@/components/admin/CloudinaryImageUpload"

interface BundleFormProps {
  bundle?: any // Existing bundle for editing
}

export function BundleForm({ bundle }: BundleFormProps) {
  const router = useRouter()
  const isEditing = !!bundle

  // Form state
  const [formData, setFormData] = useState<BundleFormData>({
    name: bundle?.name || "",
    slug: bundle?.slug || "",
    description: bundle?.description || "",
    objective: bundle?.objective || "",
    icon: bundle?.icon || "",
    thumbnail: bundle?.thumbnail || "",
    aiImagePrompt: bundle?.aiImagePrompt || "",
    color: bundle?.color || "#667eea",
    featured: bundle?.featured || false,
    order: bundle?.order || 0,
    benefits: bundle?.benefits ? (Array.isArray(bundle.benefits) ? bundle.benefits : []) : [],
    targetAudience: bundle?.targetAudience || "",
    estimatedTime: bundle?.estimatedTime || "",
    workflowIds: bundle?.workflows?.map((w: any) => w.workflow.id) || [],
    published: bundle?.published || false,
  })

  const [newBenefit, setNewBenefit] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const [workflows, setWorkflows] = useState<any[]>([])
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(true)

  // Load workflows
  useEffect(() => {
    async function loadWorkflows() {
      try {
        const response = await fetch("/api/workflows?published=true&limit=100")
        const data = await response.json()
        setWorkflows(data.workflows || [])
      } catch (error) {
        console.error("Failed to load workflows:", error)
        toast.error("Failed to load workflows")
      } finally {
        setIsLoadingWorkflows(false)
      }
    }
    loadWorkflows()
  }, [])

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditing && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setFormData((prev) => ({ ...prev, slug }))
    }
  }, [formData.name, isEditing])

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()],
      }))
      setNewBenefit("")
    }
  }

  const handleRemoveBenefit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }))
  }

  const toggleWorkflow = (workflowId: string) => {
    setFormData((prev) => {
      const isSelected = prev.workflowIds.includes(workflowId)
      return {
        ...prev,
        workflowIds: isSelected
          ? prev.workflowIds.filter((id) => id !== workflowId)
          : [...prev.workflowIds, workflowId],
      }
    })
  }

  const handleThumbnailUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, thumbnail: url }))
    toast.success("Image uploaded successfully!")
  }

  const handleGenerateImagePrompt = async () => {
    if (!formData.name) {
      toast.error("Please enter a bundle name first")
      return
    }

    setIsGeneratingPrompt(true)
    try {
      const response = await fetch(`/api/bundles/${bundle?.id || "temp"}/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bundleName: formData.name,
          bundleDescription: formData.description,
          bundleObjective: formData.objective,
          workflowCount: formData.workflowIds.length,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate prompt")

      const data = await response.json()
      const promptText = JSON.stringify(data.prompt, null, 2)
      setFormData((prev) => ({ ...prev, aiImagePrompt: promptText }))
      toast.success("AI image prompt generated!")
    } catch (error) {
      toast.error("Failed to generate AI prompt")
    } finally {
      setIsGeneratingPrompt(false)
    }
  }

  const handleAutoFill = async () => {
    if (formData.workflowIds.length === 0) {
      toast.error("Please select at least one workflow first")
      return
    }

    setIsAutoFilling(true)
    try {
      // Get selected workflows data
      const selectedWorkflows = workflows.filter((w) => formData.workflowIds.includes(w.id))

      // Auto-generate name if empty
      const autoName = formData.name ||
        `${selectedWorkflows.length}-Workflow ${selectedWorkflows[0]?.categories?.[0]?.category?.name || 'Automation'} Bundle`

      // Auto-generate description based on workflows
      const workflowDescriptions = selectedWorkflows
        .map((w) => `<strong>${w.name}</strong>: ${w.description.substring(0, 100)}`)
        .join("<br><br>")
      const autoDescription = formData.description ||
        `This comprehensive bundle includes ${selectedWorkflows.length} powerful workflows:<br><br>${workflowDescriptions.substring(0, 500)}${workflowDescriptions.length > 500 ? '...' : ''}`

      // Auto-generate objective
      const workflowNames = selectedWorkflows.map((w) => w.name).join(", ")
      const autoObjective = formData.objective ||
        `Streamline your automation with ${selectedWorkflows.length} essential workflows designed to work together seamlessly`

      // Auto-generate benefits
      const autoBenefits = formData.benefits.length === 0 ? [
        `${selectedWorkflows.length} pre-configured workflows ready to use`,
        "Save hours of manual setup and configuration",
        "Proven automation patterns from the community",
        "Complete end-to-end solution",
        "Easy integration with your existing tools",
      ] : formData.benefits

      // Auto-generate target audience based on categories
      const categories = selectedWorkflows
        .flatMap((w) => w.categories?.map((c: any) => c.category.name) || [])
        .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
      const autoAudience = formData.targetAudience || (
        categories.length > 0
          ? `Perfect for ${categories.slice(0, 2).join(" & ")} professionals`
          : "Automation enthusiasts and professionals"
      )

      // Auto-generate icon based on first workflow
      const autoIcon = formData.icon || selectedWorkflows[0]?.icon || "📦"

      setFormData((prev) => ({
        ...prev,
        name: autoName,
        description: autoDescription,
        objective: autoObjective,
        benefits: autoBenefits,
        targetAudience: autoAudience,
        estimatedTime: prev.estimatedTime || "30 minutes",
        icon: autoIcon,
      }))

      toast.success("✨ Auto-filled bundle details! Review and adjust as needed.")
    } catch (error) {
      toast.error("Failed to auto-fill")
    } finally {
      setIsAutoFilling(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.slug || !formData.description || !formData.objective) {
      toast.error("Please fill in all required fields")
      return
    }

    if (formData.workflowIds.length === 0) {
      toast.error("Please select at least one workflow")
      return
    }

    setIsSubmitting(true)

    try {
      const url = isEditing ? `/api/bundles/${bundle.id}` : "/api/bundles"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save bundle")
      }

      toast.success(`Bundle ${isEditing ? "updated" : "created"} successfully!`)
      router.push("/admin/bundles")
      router.refresh()
    } catch (error) {
      console.error("Submit error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save bundle")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AI Auto-Fill Button */}
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleAutoFill}
          disabled={isAutoFilling || formData.workflowIds.length === 0}
          variant="outline"
          className="gap-2"
        >
          {isAutoFilling ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Auto-filling...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              AI Auto-Fill Details
            </>
          )}
        </Button>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Bundle Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="E.g., E-commerce Complete Automation Bundle"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="e-commerce-complete-automation-bundle"
            required
          />
        </div>
      </div>

      {/* Icon and Color */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="icon">Icon (Emoji)</Label>
          <Input
            id="icon"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="📦"
            maxLength={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Theme Color</Label>
          <div className="flex gap-2">
            <Input
              id="color"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="h-10 w-20"
            />
            <Input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="#667eea"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="order">Display Order</Label>
          <Input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            min="0"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the bundle..."
          rows={3}
          required
        />
      </div>

      {/* Objective */}
      <div className="space-y-2">
        <Label htmlFor="objective">Main Objective *</Label>
        <Textarea
          id="objective"
          value={formData.objective}
          onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
          placeholder="What is the main goal of this bundle? E.g., 'Automate your entire e-commerce operations from order processing to customer support'"
          rows={2}
          required
        />
      </div>

      {/* Benefits */}
      <div className="space-y-2">
        <Label>Key Benefits</Label>
        <div className="flex gap-2">
          <Input
            value={newBenefit}
            onChange={(e) => setNewBenefit(e.target.value)}
            placeholder="Add a benefit..."
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddBenefit())}
          />
          <Button type="button" onClick={handleAddBenefit} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.benefits.map((benefit, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {benefit}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleRemoveBenefit(index)}
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* Target Audience & Estimated Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetAudience">Target Audience</Label>
          <Input
            id="targetAudience"
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            placeholder="E.g., E-commerce store owners"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedTime">Estimated Setup Time</Label>
          <Input
            id="estimatedTime"
            value={formData.estimatedTime}
            onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
            placeholder="E.g., 30 minutes"
          />
        </div>
      </div>

      {/* AI Image Generation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="aiImagePrompt">AI Image Prompt</Label>
          <Button
            type="button"
            onClick={handleGenerateImagePrompt}
            disabled={isGeneratingPrompt}
            variant="outline"
            size="sm"
          >
            {isGeneratingPrompt ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" />Generate AI Prompt</>
            )}
          </Button>
        </div>
        <Textarea
          id="aiImagePrompt"
          value={formData.aiImagePrompt}
          onChange={(e) => setFormData({ ...formData, aiImagePrompt: e.target.value })}
          placeholder="AI-generated image prompt will appear here..."
          rows={6}
          className="font-mono text-sm"
        />
      </div>

      {/* Thumbnail Upload */}
      <div className="space-y-2">
        <CloudinaryImageUpload
          value={formData.thumbnail}
          onChange={handleThumbnailUpload}
          folder="flowkit-bundles"
          label="Bundle Thumbnail"
          description="Upload a thumbnail image for this bundle (max 10MB, JPG/PNG/WebP/GIF)"
        />
        <div className="mt-2">
          <Label htmlFor="thumbnailUrl">Or enter URL directly</Label>
          <Input
            id="thumbnailUrl"
            value={formData.thumbnail}
            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
            placeholder="https://..."
            className="mt-1"
          />
        </div>
      </div>

      {/* Workflow Selection */}
      <div className="space-y-2">
        <Label>Select Workflows * ({formData.workflowIds.length} selected)</Label>
        {isLoadingWorkflows ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Card className="p-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className="flex items-center space-x-2 p-2 hover:bg-muted rounded"
                >
                  <Checkbox
                    id={`workflow-${workflow.id}`}
                    checked={formData.workflowIds.includes(workflow.id)}
                    onCheckedChange={() => toggleWorkflow(workflow.id)}
                  />
                  <Label
                    htmlFor={`workflow-${workflow.id}`}
                    className="flex items-center gap-2 flex-1 cursor-pointer"
                  >
                    {workflow.icon && <span>{workflow.icon}</span>}
                    <span className="text-sm">{workflow.name}</span>
                  </Label>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Flags */}
      <div className="flex gap-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, featured: !!checked }))
            }
          />
          <Label htmlFor="featured" className="cursor-pointer">
            Featured Bundle
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="published"
            checked={formData.published}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, published: !!checked }))
            }
          />
          <Label htmlFor="published" className="cursor-pointer">
            Published
          </Label>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditing ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{isEditing ? "Update Bundle" : "Create Bundle"}</>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
