import { prisma } from "@/lib/prisma"
import WorkflowGrid from "@/components/workflow/WorkflowGrid"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Search n8n Workflows & Templates | FlowKit",
  description: "Search free n8n workflow templates and automation workflows. Find n8n templates for Slack, Email, AI automation, data sync, and more. Open source n8n workflow library.",
  keywords: "search n8n workflows, find n8n templates, n8n workflow search, n8n template search, search automation workflows",
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q || ""

  const workflows = query
    ? await prisma.workflow.findMany({
        where: {
          published: true,
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        },
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
        orderBy: { views: "desc" },
      })
    : []

  // Transform to match WorkflowWithRelations type
  const transformedWorkflows = workflows.map((workflow) => ({
    ...workflow,
    videoUrl: null,
    workflowJson: {},
    useCases: [],
    setupSteps: [],
    credentialsRequired: [],
    nodes: [],
    published: true,
    updatedAt: workflow.createdAt,
    publishedAt: workflow.createdAt,
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
        <div>
          <h1 className="text-4xl font-bold">Search Results</h1>
          {query && (
            <p className="text-gray-600 mt-2">
              Found {workflows.length} {workflows.length === 1 ? "workflow" : "workflows"} for "{query}"
            </p>
          )}
        </div>

        <WorkflowGrid
          workflows={transformedWorkflows as any}
          emptyMessage={query ? `No workflows found for "${query}"` : "Enter a search query to find workflows"}
        />
      </div>
    </div>
  )
}
