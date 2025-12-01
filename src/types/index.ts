import { Workflow, Category, Tag, Difficulty } from "@prisma/client"

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
