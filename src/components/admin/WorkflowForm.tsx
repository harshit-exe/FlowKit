"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Category, Tag, Workflow } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { workflowFormSchema, WorkflowFormValues } from "@/lib/validations/workflow"
import { generateSlug } from "@/lib/utils"
import { parseWorkflowJSON } from "@/lib/gemini"
import { Plus, X, FileJson, Sparkles, Loader2 } from "lucide-react"
import { CloudinaryImageUpload } from "@/components/admin/CloudinaryImageUpload"
import { AIButton } from "@/components/admin/AIButton"
import { RichTextEditor } from "@/components/admin/RichTextEditor"

interface WorkflowFormProps {
  initialData?: Workflow & {
    categories: { category: Category }[]
    tags: { tag: Tag }[]
  }
  categories: Category[]
  tags: Tag[]
}

export default function WorkflowForm({ initialData, categories, tags }: WorkflowFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false)
  const [thumbnailPrompt, setThumbnailPrompt] = useState<any>(null)
  const [showPromptDialog, setShowPromptDialog] = useState(false)

  // Initialize form with default values
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowFormSchema) as any,
    defaultValues: initialData
      ? {
          name: initialData.name,
          slug: initialData.slug,
          description: initialData.description,
          icon: initialData.icon || "",
          thumbnail: initialData.thumbnail || "",
          videoUrl: initialData.videoUrl || "",
          difficulty: initialData.difficulty,
          featured: initialData.featured,
          indiaBadge: initialData.indiaBadge,
          nodeCount: initialData.nodeCount,
          categoryIds: initialData.categories.map((c) => c.category.id),
          tagNames: initialData.tags.map((t) => t.tag.name),
          credentialsRequired: initialData.credentialsRequired as string[],
          nodes: initialData.nodes as string[],
          useCases: initialData.useCases as string[],
          setupSteps: initialData.setupSteps as string[],
          workflowJson: JSON.stringify(initialData.workflowJson, null, 2),
          published: initialData.published,
        }
      : {
          name: "",
          slug: "",
          description: "",
          icon: "",
          thumbnail: "",
          videoUrl: "",
          difficulty: "BEGINNER",
          featured: false,
          indiaBadge: false,
          nodeCount: 0,
          categoryIds: [],
          tagNames: [],
          credentialsRequired: [],
          nodes: [],
          useCases: [""],
          setupSteps: [""],
          workflowJson: "{}",
          published: false,
        },
  })

  const watchName = watch("name")
  const watchCategoryIds = watch("categoryIds")
  const watchTagNames = watch("tagNames")
  const watchUseCases = watch("useCases")
  const watchSetupSteps = watch("setupSteps")
  const watchCredentials = watch("credentialsRequired")
  const watchNodes = watch("nodes")

  // Auto-generate slug from name
  useEffect(() => {
    if (watchName && !initialData) {
      setValue("slug", generateSlug(watchName))
    }
  }, [watchName, setValue, initialData])

  // Handle Cloudinary thumbnail upload
  const handleThumbnailUpload = (url: string, publicId?: string) => {
    setValue("thumbnail", url)
    toast.success("Image uploaded successfully!")
  }

  // Dynamic array helpers
  const addArrayItem = (field: "useCases" | "setupSteps" | "credentialsRequired" | "nodes") => {
    const currentValue = watch(field)
    setValue(field, [...currentValue, ""])
  }

  const removeArrayItem = (field: "useCases" | "setupSteps" | "credentialsRequired" | "nodes", index: number) => {
    const currentValue = watch(field)
    setValue(
      field,
      currentValue.filter((_, i) => i !== index)
    )
  }

  const updateArrayItem = (field: "useCases" | "setupSteps" | "credentialsRequired" | "nodes", index: number, value: string) => {
    const currentValue = watch(field)
    const newValue = [...currentValue]
    newValue[index] = value
    setValue(field, newValue)
  }

  // Category selection toggle
  const toggleCategory = (categoryId: string) => {
    const current = watchCategoryIds || []
    if (current.includes(categoryId)) {
      setValue(
        "categoryIds",
        current.filter((id) => id !== categoryId)
      )
    } else {
      setValue("categoryIds", [...current, categoryId])
    }
  }

  // Tag input
  const [tagInput, setTagInput] = useState("")
  const addTag = () => {
    if (tagInput.trim()) {
      const current = watchTagNames || []
      if (!current.includes(tagInput.trim())) {
        setValue("tagNames", [...current, tagInput.trim()])
      }
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    const current = watchTagNames || []
    setValue(
      "tagNames",
      current.filter((t) => t !== tag)
    )
  }

  // Parse JSON and auto-fill fields
  const handleParseJSON = () => {
    const jsonString = watch("workflowJson")

    try {
      const parsed = parseWorkflowJSON(jsonString)

      // Update form values
      setValue("nodeCount", parsed.nodeCount)
      setValue("nodes", parsed.nodes)
      setValue("credentialsRequired", parsed.credentialsRequired)

      toast.success(`Parsed ${parsed.nodeCount} nodes and ${parsed.credentialsRequired.length} credentials!`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to parse JSON")
    }
  }

  // Generate AI thumbnail prompt
  const handleGenerateThumbnail = async () => {
    const name = watch("name")
    const jsonString = watch("workflowJson")

    if (!name || !jsonString) {
      toast.error("Please provide workflow name and JSON first")
      return
    }

    setIsGeneratingThumbnail(true)

    try {
      const response = await fetch("/api/ai/generate-thumbnail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflowName: name,
          workflowJson: jsonString,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to generate thumbnail prompt")
      }

      const data = await response.json()
      setThumbnailPrompt(data.prompt)
      setShowPromptDialog(true)
      toast.success("Thumbnail prompt generated! Copy it to use in AI Studio.")
    } catch (error) {
      console.error("Thumbnail prompt generation error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to generate thumbnail prompt")
    } finally {
      setIsGeneratingThumbnail(false)
    }
  }

  // Copy prompt to clipboard
  const copyPromptToClipboard = () => {
    if (thumbnailPrompt) {
      navigator.clipboard.writeText(JSON.stringify(thumbnailPrompt, null, 2))
      toast.success("Prompt copied to clipboard!")
    }
  }

  // Form submission
  const onSubmit: SubmitHandler<WorkflowFormValues> = async (data) => {
    setIsLoading(true)

    try {
      // Parse JSON
      let parsedJson
      try {
        parsedJson = typeof data.workflowJson === "string" ? JSON.parse(data.workflowJson) : data.workflowJson
      } catch {
        toast.error("Invalid workflow JSON")
        setIsLoading(false)
        return
      }

      const payload = {
        ...data,
        workflowJson: parsedJson,
      }

      const url = initialData ? `/api/workflows/${initialData.id}` : "/api/workflows"
      const method = initialData ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Failed to save workflow")
      }

      toast.success(initialData ? "Workflow updated successfully" : "Workflow created successfully")
      router.push("/admin/workflows")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-start gap-2">
                <Input id="name" {...register("name")} placeholder="Email Newsletter Automation" className="flex-1" />
                <AIButton
                  value={watch("name")}
                  onGenerate={(content) => setValue("name", content)}
                  fieldType="name"
                />
              </div>
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">
                Slug <span className="text-red-500">*</span>
              </Label>
              <Input id="slug" {...register("slug")} placeholder="email-newsletter-automation" />
              {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <AIButton
                value={watch("description")}
                onGenerate={(content) => setValue("description", content)}
                fieldType="description"
              />
            </div>
            <RichTextEditor
              value={watch("description")}
              onChange={(content) => setValue("description", content)}
              placeholder="Describe what this workflow does..."
              error={errors.description?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (Emoji)</Label>
              <Input id="icon" {...register("icon")} placeholder="📧" maxLength={2} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nodeCount">Node Count</Label>
              <Input
                id="nodeCount"
                type="number"
                {...register("nodeCount", { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">
                Difficulty <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(value) => setValue("difficulty", value as any)} defaultValue={watch("difficulty")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL (YouTube, Loom, etc.)</Label>
            <Input id="videoUrl" {...register("videoUrl")} placeholder="https://youtube.com/watch?v=..." />
            {errors.videoUrl && <p className="text-sm text-red-500">{errors.videoUrl.message}</p>}
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox id="featured" checked={watch("featured")} onCheckedChange={(checked) => setValue("featured", !!checked)} />
              <Label htmlFor="featured" className="cursor-pointer">
                Featured
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="indiaBadge" checked={watch("indiaBadge")} onCheckedChange={(checked) => setValue("indiaBadge", !!checked)} />
              <Label htmlFor="indiaBadge" className="cursor-pointer">
                India Badge 🇮🇳
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="published" checked={watch("published")} onCheckedChange={(checked) => setValue("published", !!checked)} />
              <Label htmlFor="published" className="cursor-pointer">
                Published
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Media</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateThumbnail}
              disabled={isGeneratingThumbnail || !watch("name") || !watch("workflowJson")}
              className="border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white transition-colors"
            >
              {isGeneratingThumbnail ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Prompt
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Generate an AI prompt for thumbnail creation - copy and use in Google AI Studio
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <CloudinaryImageUpload
            value={watch("thumbnail")}
            onChange={handleThumbnailUpload}
            folder="flowkit-workflows"
            label="Workflow Thumbnail"
            description="Upload a workflow thumbnail image (1200x630px recommended, max 10MB)"
          />

          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL (Optional)</Label>
            <Input id="videoUrl" {...register("videoUrl")} placeholder="https://youtube.com/..." />
          </div>
        </CardContent>
      </Card>

      {/* Categories & Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Categories & Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>
              Categories <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category.id}`}
                    checked={watchCategoryIds?.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <Label htmlFor={`cat-${category.id}`} className="cursor-pointer text-sm">
                    {category.icon} {category.name}
                  </Label>
                </div>
              ))}
            </div>
            {errors.categoryIds && <p className="text-sm text-red-500">{errors.categoryIds.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Enter tag name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {watchTagNames?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Credentials Required */}
          <div className="space-y-2">
            <Label>Credentials Required</Label>
            {watchCredentials?.map((cred, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={cred}
                  onChange={(e) => updateArrayItem("credentialsRequired", index, e.target.value)}
                  placeholder="e.g., Gmail OAuth, API Key"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeArrayItem("credentialsRequired", index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => addArrayItem("credentialsRequired")}>
              <Plus className="h-4 w-4 mr-2" /> Add Credential
            </Button>
          </div>

          {/* Nodes Used */}
          <div className="space-y-2">
            <Label>Nodes Used</Label>
            {watchNodes?.map((node, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={node}
                  onChange={(e) => updateArrayItem("nodes", index, e.target.value)}
                  placeholder="e.g., Gmail, HTTP Request, Google Sheets"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeArrayItem("nodes", index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => addArrayItem("nodes")}>
              <Plus className="h-4 w-4 mr-2" /> Add Node
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Use Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Use Cases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {watchUseCases?.map((useCase, index) => (
            <div key={index} className="space-y-2">
              <div className="flex gap-2 items-start">
                <Textarea
                  value={useCase}
                  onChange={(e) => updateArrayItem("useCases", index, e.target.value)}
                  placeholder="Describe a use case..."
                  rows={2}
                  className="flex-1"
                />
                <AIButton
                  value={useCase}
                  onGenerate={(content) => updateArrayItem("useCases", index, content)}
                  fieldType="useCase"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeArrayItem("useCases", index)}
                  disabled={watchUseCases.length === 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {errors.useCases && <p className="text-sm text-red-500">{errors.useCases.message}</p>}
          <Button type="button" variant="outline" onClick={() => addArrayItem("useCases")}>
            <Plus className="h-4 w-4 mr-2" /> Add Use Case
          </Button>
        </CardContent>
      </Card>

      {/* Setup Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {watchSetupSteps?.map((step, index) => (
            <div key={index} className="flex gap-2 items-start">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium mt-1">
                {index + 1}
              </span>
              <Textarea
                value={step}
                onChange={(e) => updateArrayItem("setupSteps", index, e.target.value)}
                placeholder="Describe setup step..."
                rows={2}
                className="flex-1"
              />
              <AIButton
                value={step}
                onGenerate={(content) => updateArrayItem("setupSteps", index, content)}
                fieldType="setupStep"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeArrayItem("setupSteps", index)}
                disabled={watchSetupSteps.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {errors.setupSteps && <p className="text-sm text-red-500">{errors.setupSteps.message}</p>}
          <Button type="button" variant="outline" onClick={() => addArrayItem("setupSteps")}>
            <Plus className="h-4 w-4 mr-2" /> Add Setup Step
          </Button>
        </CardContent>
      </Card>

      {/* Workflow JSON */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Workflow JSON <span className="text-red-500">*</span>
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleParseJSON}
              className="border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white transition-colors"
            >
              <FileJson className="h-4 w-4 mr-2" />
              Parse JSON
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Paste your n8n workflow JSON here. Click "Parse JSON" to automatically extract node count, nodes, and credentials.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            {...register("workflowJson")}
            placeholder='{"name": "My Workflow", "nodes": [], "connections": {}}'
            rows={12}
            className="font-mono text-sm"
          />
          {errors.workflowJson && <p className="text-sm text-red-500">{errors.workflowJson.message}</p>}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update Workflow" : "Create Workflow"}
        </Button>
      </div>

      {/* Thumbnail Prompt Dialog */}
      <Dialog open={showPromptDialog} onOpenChange={setShowPromptDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Thumbnail Prompt</DialogTitle>
            <DialogDescription>
              Copy this JSON prompt and paste it into Google AI Studio to generate your thumbnail image.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{JSON.stringify(thumbnailPrompt, null, 2)}</code>
              </pre>
              <Button
                onClick={copyPromptToClipboard}
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white"
              >
                Copy JSON
              </Button>
            </div>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm font-medium mb-2">How to use:</p>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Copy the JSON prompt above</li>
                <li>Go to <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-[#FF6B35] hover:underline">Google AI Studio</a></li>
                <li>Select Gemini 2.5 Flash Image model</li>
                <li>Paste the JSON prompt</li>
                <li>Generate the thumbnail image</li>
                <li>Download and upload it here</li>
              </ol>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  )
}
