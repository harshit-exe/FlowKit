import { prisma } from "@/lib/prisma"
import WorkflowGrid from "@/components/workflow/WorkflowGrid"
import { BundleGrid } from "@/components/bundle/BundleGrid"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Search n8n Workflows & Bundles | FlowKit",
  description: "Search free n8n workflow templates, bundles, and automation workflows. Find n8n templates for Slack, Email, AI automation, data sync, and more. Open source n8n workflow library.",
  keywords: "search n8n workflows, find n8n templates, n8n workflow search, n8n template search, search automation workflows, search bundles",
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const query = searchParams.q || ""

  const [workflows, bundles] = query
    ? await Promise.all([
        prisma.workflow.findMany({
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
        }),
        prisma.bundle.findMany({
          where: {
            published: true,
            OR: [
              { name: { contains: query } },
              { description: { contains: query } },
              { objective: { contains: query } },
            ],
          },
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            objective: true,
            icon: true,
            thumbnail: true,
            color: true,
            featured: true,
            views: true,
            createdAt: true,
            _count: {
              select: {
                workflows: true,
              },
            },
          },
          orderBy: { views: "desc" },
        }),
      ])
    : [[], []]

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

  const totalResults = workflows.length + bundles.length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-12">
        <div>
          <h1 className="text-4xl font-bold">Search Results</h1>
          {query && (
            <p className="text-gray-400 mt-2">
              Found {totalResults} {totalResults === 1 ? "result" : "results"} for "{query}"
            </p>
          )}
        </div>

        {/* Bundles Section */}
        {bundles.length > 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Bundles ({bundles.length})</h2>
              <p className="text-gray-400 mt-1">Curated workflow collections</p>
            </div>
            <BundleGrid bundles={bundles as any} />
          </div>
        )}

        {/* Workflows Section */}
        {workflows.length > 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Workflows ({workflows.length})</h2>
              <p className="text-gray-400 mt-1">Individual automation workflows</p>
            </div>
            <WorkflowGrid
              workflows={transformedWorkflows as any}
              emptyMessage=""
            />
          </div>
        )}

        {/* No Results */}
        {totalResults === 0 && query && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">
              No workflows or bundles found for "{query}"
            </p>
            <p className="text-gray-500 mt-2">Try searching with different keywords</p>
          </div>
        )}

        {/* Empty State */}
        {!query && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">Enter a search query to find workflows and bundles</p>
          </div>
        )}
      </div>
    </div>
  )
}
