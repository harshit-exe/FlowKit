import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import WorkflowGrid from "@/components/workflow/WorkflowGrid"
import { Metadata } from "next"
import { Pagination } from "@/components/ui/pagination"

const ITEMS_PER_PAGE = 12

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  })

  if (!category) {
    return {
      title: "Category Not Found",
    }
  }

  const categoryDescription = category.description || `Browse ${category.name} n8n workflow templates - production-ready automation workflows`
  const pageUrl = `https://www.flowkit.in/category/${category.slug}`

  // Generate dynamic OG image
  const ogImageParams = new URLSearchParams({
    title: `${category.icon} ${category.name} Workflows`,
    description: categoryDescription.slice(0, 100),
    type: 'category',
  })
  const ogImage = `https://www.flowkit.in/api/og?${ogImageParams.toString()}`

  return {
    title: `${category.name} n8n Workflows | FlowKit`,
    description: categoryDescription,
    keywords: `${category.name} workflows, ${category.name} n8n templates, ${category.name} automation, n8n ${category.name.toLowerCase()}`,
    openGraph: {
      title: `${category.name} n8n Workflows | FlowKit`,
      description: categoryDescription,
      url: pageUrl,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${category.name} Workflows`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} n8n Workflows | FlowKit`,
      description: categoryDescription,
      images: [ogImage],
      creator: '@flowkit_in',
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}

export default async function CategoryPage({ 
  params,
  searchParams,
}: { 
  params: { slug: string }
  searchParams: { page?: string }
}) {
  const currentPage = Number(searchParams.page) || 1
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      _count: {
        select: { workflows: true },
      },
    },
  })

  if (!category) {
    notFound()
  }

  // Parallel queries for better performance
  const [totalCount, workflows] = await Promise.all([
    prisma.workflow.count({
      where: {
        published: true,
        categories: {
          some: {
            categoryId: category.id,
          },
        },
      },
    }),
    prisma.workflow.findMany({
      where: {
        published: true,
        categories: {
          some: {
            categoryId: category.id,
          },
        },
      },
      select: { id: true },
      orderBy: { createdAt: "desc" },
      take: ITEMS_PER_PAGE,
      skip: skip,
    }),
  ])

  // Step 2: Fetch full details for the IDs
  const workflowsData = await prisma.workflow.findMany({
    where: {
      id: { in: workflows.map((w) => w.id) },
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
  })

  // Re-order workflows to match the sorted IDs
  const workflowsWithDetails = workflows.map((w) => 
    workflowsData.find((wd) => wd.id === w.id)!
  )

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  // Transform to match expected type
  const transformedWorkflows = workflowsWithDetails.map((workflow) => ({
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
        {/* Category Header */}
        <div className="text-center space-y-4 border-b-2 pb-6">
          <div className="text-6xl">{category.icon}</div>
          <h1 className="text-4xl font-bold font-mono uppercase">{category.name}</h1>
          {category.description && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-mono">
              {category.description}
            </p>
          )}
          <p className="text-muted-foreground font-mono">
            {totalCount} {totalCount === 1 ? "workflow" : "workflows"}
          </p>
        </div>

        {/* Workflows Grid */}
        <WorkflowGrid
          workflows={transformedWorkflows as any}
          emptyMessage="No workflows in this category yet"
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl={`/category/${params.slug}`}
          totalItems={totalCount}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>
    </div>
  )
}
