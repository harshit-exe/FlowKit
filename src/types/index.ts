import { Workflow, Category, Tag, Difficulty, Bundle } from "@prisma/client"

// Re-export Difficulty for use in other files
export type { Difficulty }


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

// Tutorial types for file-based system
export type TutorialStepType = "INFO" | "ACTION" | "VALIDATION" | "CHECKPOINT"

export interface CredentialLink {
  name: string                    // e.g., "LinkedIn API Key"
  provider: string                // e.g., "LinkedIn", "Google"
  setupUrl: string                // Direct link to get credentials
  documentationUrl?: string       // Official docs
  requiredPermissions?: string[]  // List of permissions needed
  setupInstructions?: string      // Brief setup guide
}

export interface ExternalResource {
  title: string                   // e.g., "n8n LinkedIn Node Docs"
  url: string
  type: "documentation" | "video" | "tutorial" | "community"
}

export interface TutorialStep {
  id: string
  order: number
  title: string
  description: string
  type: TutorialStepType
  hints?: string[]
  imageUrl?: string
  videoUrl?: string
  codeSnippet?: string
  validation?: Record<string, any>
  // NEW: Credential setup links
  credentialLinks?: CredentialLink[]
  // NEW: External resources
  externalResources?: ExternalResource[]
}

export interface Tutorial {
  id: string
  workflowSlug: string
  title: string
  description: string
  difficulty: Difficulty
  estimatedTime: string
  isAIGenerated: boolean
  steps: TutorialStep[]
}

export interface TutorialProgress {
  tutorialId: string
  currentStep: number
  completedSteps: string[] // Step IDs
  isCompleted: boolean
  startedAt: string // ISO date
  lastAccessedAt: string // ISO date
  completedAt?: string // ISO date
}
