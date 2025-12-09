import { Workflow, Category, Tag, Difficulty, Bundle } from "@prisma/client"

// Workflow with relations
export type WorkflowWithRelations = Workflow & {
  categories: {
    category: Category
  }[]
  tags: {
    tag: Tag
  }[]
}

// Category with workflow count
export type CategoryWithCount = Category & {
  _count: {
    workflows: number
  }
}

// Workflow form data
export interface WorkflowFormData {
  name: string
  slug: string
  description: string
  icon?: string
  thumbnail?: string
  videoUrl?: string
  documentLink?: string
  difficulty: Difficulty
  featured: boolean
  indiaBadge: boolean
  nodeCount: number
  categoryIds: string[]
  tagNames: string[]
  credentialsRequired: string[]
  nodes: string[]
  useCases: string[]
  setupSteps: string[]
  workflowJson: any
  published: boolean
}

// Search params
export interface SearchParams {
  q?: string
  category?: string
  difficulty?: string
  tags?: string
  page?: string
  sort?: string
}

// Bundle with relations
export type BundleWithRelations = Bundle & {
  workflows: {
    workflow: WorkflowWithRelations
    order: number
  }[]
  _count?: {
    workflows: number
  }
}

// Bundle form data
export interface BundleFormData {
  name: string
  slug: string
  description: string
  objective: string
  icon?: string
  thumbnail?: string
  aiImagePrompt?: string
  color: string
  featured: boolean
  order: number
  benefits: string[]
  targetAudience?: string
  estimatedTime?: string
  workflowIds: string[]
  published: boolean
}
