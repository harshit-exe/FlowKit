import { prisma } from "@/lib/prisma"
import WorkflowGrid from "@/components/workflow/WorkflowGrid"
import { Metadata } from "next"
import { Pagination } from "@/components/ui/pagination"

export const metadata: Metadata = {
  title: "Free n8n Workflow Templates & Automation Library | FlowKit",
  description: "Browse 150+ free n8n workflow templates. Download production-ready n8n automation workflows. Open source n8n template library with integrations for Slack, Email, AI, and more.",
  keywords: "n8n workflows, n8n templates, free n8n workflows, n8n workflow library, n8n automation templates, open source workflows",
}

const ITEMS_PER_PAGE = 20

export default async function WorkflowsPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const currentPage = Number(searchParams.page) || 1
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  // Separate queries to avoid memory issues
  const [totalCount, workflows] = await Promise.all([
    // Lightweight count query
    prisma.workflow.count({
      where: { published: true },
    }),
    // Optimized data query with minimal joins
    prisma.workflow.findMany({
      where: { published: true },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        icon: true,
        thumbnail: true,
        difficulty: true,
        featured: true,
        indiaBadge: true,
        nodeCount: true,
        views: true,
        downloads: true,
        createdAt: true,
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                color: true,
              },
            },
          },
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: ITEMS_PER_PAGE,
      skip: skip,
    }),
  ])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  // Transform to match WorkflowWithRelations type
  const transformedWorkflows = workflows.map((workflow) => ({
    ...workflow,
    // Add missing fields with default values to match Workflow type
    videoUrl: null,
    workflowJson: {},
    useCases: [],
    setupSteps: [],
    credentialsRequired: [],
    nodes: [],
    published: true,
    updatedAt: workflow.createdAt,
    publishedAt: workflow.createdAt,
    // Transform nested relations to match expected type
    categories: workflow.categories.map((cat) => ({
      category: {
        ...cat.category,
        description: null,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })),
    tags: workflow.tags.map((t) => ({
      tag: {
        ...t.tag,
        createdAt: new Date(),
      },
    })),
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b-2 pb-6">
          <h1 className="text-4xl font-mono font-bold mb-2">ALL WORKFLOWS</h1>
          <p className="text-muted-foreground font-mono">
            Browse {totalCount} curated n8n workflows
          </p>
        </div>

        {/* Workflows Grid */}
        <WorkflowGrid
          workflows={transformedWorkflows as any}
          emptyMessage="No workflows available yet. Check back soon!"
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl="/workflows"
          totalItems={totalCount}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>
    </div>
  )
}
