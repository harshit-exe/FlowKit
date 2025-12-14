import {
  Workflow as PrismaWorkflow,
  Category,
  Tag,
  Difficulty,
  Bundle,
  User as PrismaUser
} from "@prisma/client"

// Workflow with relations
export type WorkflowWithRelations = PrismaWorkflow & {
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

export type Workflow = {
  id: string
  slug: string
  name: string
  description: string
  icon?: string
  thumbnail?: string
  videoUrl?: string
  documentLink?: string
  author?: string
  authorUrl?: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  featured: boolean
  nodeCount: number
  views: number
  downloads: number
  workflowJson: any
  useCases: string[]
  setupSteps: string[]
  credentialsRequired: string[]
  nodes: string[]
  categories: { category: { id: string; name: string; slug: string } }[]
  tags: { tag: { id: string; name: string; slug: string } }[]
  published: boolean
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

// Portfolio Types
export type BadgeType =
  | 'VERIFIED_CREATOR'
  | 'TOP_CONTRIBUTOR'
  | 'EXPERT_LEVEL'
  | 'COMMUNITY_FAVORITE'
  | 'DOWNLOAD_CHAMPION'
  | 'EARLY_ADOPTER'
  | 'RISING_STAR';

export type UserBadge = {
  id: string;
  userId: string;
  badgeType: BadgeType;
  title: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: Date;
};

export type PortfolioWorkflow = {
  id: string;
  userId: string;
  workflowId: string;
  customTitle?: string | null;
  customDesc?: string | null;
  featured: boolean;
  order: number;
  addedAt: Date;
  workflow: Workflow;
};

export type ClientReview = {
  id: string;
  receiverId: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string | null;
  projectType?: string | null;
  rating: number;
  reviewText: string;
  approved: boolean;
  verified: boolean;
  createdAt: Date;
};

export type UserWithPortfolio = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  createdAt: Date;
  updatedAt: Date;
  // Portfolio fields
  username?: string | null;
  bio?: string | null;
  location?: string | null;
  websiteUrl?: string | null;
  linkedinUrl?: string | null;
  twitterHandle?: string | null;
  githubUrl?: string | null;
  portfolioEnabled?: boolean;
  portfolioTheme?: 'DARK' | 'LIGHT' | 'AUTO';
  totalWorkflows?: number;
  totalViews?: number;
  totalDownloads?: number;
  communityRating?: number;
  badges?: UserBadge[];
  portfolioWorkflows?: PortfolioWorkflow[];
  receivedReviews?: ClientReview[];
  _count?: {
    portfolioWorkflows?: number;
  };
};

export type ExtractedWorkflowMetadata = {
  name: string;
  nodeCount: number;
  connectionCount: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  nodes: string[];
  credentialsRequired: string[];
  description: string;
};

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
