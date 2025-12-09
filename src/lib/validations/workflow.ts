import { z } from "zod"

export const workflowFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  slug: z.string().min(3, "Slug must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
  icon: z.string().optional(),
  thumbnail: z.string().optional(),
  videoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  documentLink: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  featured: z.boolean().default(false),
  indiaBadge: z.boolean().default(false),
  nodeCount: z.number().int().min(0).default(0),
  categoryIds: z.array(z.string()).min(1, "Select at least one category"),
  tagNames: z.array(z.string()),
  credentialsRequired: z.array(z.string()),
  nodes: z.array(z.string()),
  useCases: z.array(z.string()).min(1, "Add at least one use case"),
  setupSteps: z.array(z.string()).min(1, "Add at least one setup step"),
  workflowJson: z.string().refine(
    (val) => {
      try {
        JSON.parse(val)
        return true
      } catch {
        return false
      }
    },
    {
      message: "Must be valid JSON",
    }
  ),
  published: z.boolean().default(false),
})

export type WorkflowFormValues = z.infer<typeof workflowFormSchema>
