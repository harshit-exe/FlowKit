import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import WorkflowGrid from "@/components/workflow/WorkflowGrid"
import { Metadata } from "next"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  })

  if (!category) {
    return {
      title: "Category Not Found",
    }
  }

  return {
    title: `${category.name} Workflows | FlowKit`,
    description: category.description || `Browse ${category.name} workflows`,
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
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

  const workflows = await prisma.workflow.findMany({
    where: {
      published: true,
      categories: {
        some: {
          categoryId: category.id,
        },
      },
    },
    include: {
      categories: {
        include: { category: true },
      },
      tags: {
        include: { tag: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        {/* Category Header */}
        <div className="text-center space-y-4">
          <div className="text-6xl">{category.icon}</div>
          <h1 className="text-4xl font-bold">{category.name}</h1>
          {category.description && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{category.description}</p>
          )}
          <p className="text-gray-500">
            {category._count.workflows} {category._count.workflows === 1 ? "workflow" : "workflows"}
          </p>
        </div>

        {/* Workflows Grid */}
        <WorkflowGrid
          workflows={workflows}
          emptyMessage="No workflows in this category yet"
        />
      </div>
    </div>
  )
}
