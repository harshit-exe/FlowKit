import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, DownloadCloud } from "lucide-react"
import { Metadata } from "next"
import WorkflowGrid from "@/components/workflow/WorkflowGrid"
import WorkflowActions from "@/components/workflow/WorkflowActions"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const workflow = await prisma.workflow.findUnique({
    where: { slug: params.slug },
  })

  if (!workflow) {
    return {
      title: "Workflow Not Found",
    }
  }

  return {
    title: `${workflow.name} | FlowKit`,
    description: workflow.description,
  }
}

export default async function WorkflowDetailPage({ params }: { params: { slug: string } }) {
  // Fetch workflow
  const workflow = await prisma.workflow.findUnique({
    where: { slug: params.slug, published: true },
    include: {
      categories: {
        include: { category: true },
      },
      tags: {
        include: { tag: true },
      },
    },
  })

  if (!workflow) {
    notFound()
  }

  // Increment view count (fire and forget)
  prisma.workflow.update({
    where: { id: workflow.id },
    data: { views: { increment: 1 } },
  }).catch(() => {})

  // Fetch related workflows
  const categoryIds = workflow.categories.map((c) => c.categoryId)
  const relatedWorkflows = await prisma.workflow.findMany({
    where: {
      AND: [
        { id: { not: workflow.id } },
        { published: true },
        {
          categories: {
            some: {
              categoryId: {
                in: categoryIds,
              },
            },
          },
        },
      ],
    },
    include: {
      categories: {
        include: { category: true },
      },
      tags: {
        include: { tag: true },
      },
    },
    take: 3,
    orderBy: { views: "desc" },
  })

  const useCases = workflow.useCases as string[]
  const setupSteps = workflow.setupSteps as string[]
  const credentialsRequired = workflow.credentialsRequired as string[]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            {workflow.icon && <span className="text-5xl">{workflow.icon}</span>}
            <div className="flex-1">
              <h1 className="text-4xl font-bold">{workflow.name}</h1>
              <p className="text-xl text-gray-600 mt-2">{workflow.description}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{workflow.difficulty}</Badge>
            {workflow.featured && <Badge>Featured</Badge>}
            {workflow.indiaBadge && <Badge variant="outline">🇮🇳 Made in India</Badge>}
            {workflow.categories.map((cat) => (
              <Badge key={cat.category.id} variant="outline">
                {cat.category.icon} {cat.category.name}
              </Badge>
            ))}
          </div>

          {/* Action Buttons */}
          <WorkflowActions
            workflowJson={workflow.workflowJson}
            workflowSlug={workflow.slug}
            workflowId={workflow.id}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Thumbnail */}
            {workflow.thumbnail && (
              <img
                src={workflow.thumbnail}
                alt={workflow.name}
                className="w-full rounded-lg shadow-lg"
              />
            )}

            {/* Use Cases */}
            <Card>
              <CardHeader>
                <CardTitle>Use Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {useCases.map((useCase, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Setup Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Setup Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {setupSteps.map((step, index) => (
                    <li key={index} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </span>
                      <span className="pt-1">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Workflow JSON */}
            <Card>
              <CardHeader>
                <CardTitle>Workflow JSON</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{JSON.stringify(workflow.workflowJson, null, 2)}</code>
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="h-4 w-4" />
                    <span>Views</span>
                  </div>
                  <span className="font-semibold">{workflow.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <DownloadCloud className="h-4 w-4" />
                    <span>Downloads</span>
                  </div>
                  <span className="font-semibold">{workflow.downloads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Node Count</span>
                  <span className="font-semibold">{workflow.nodeCount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Credentials */}
            {credentialsRequired.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Credentials Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {credentialsRequired.map((cred, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                        <span className="text-sm">{cred}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {workflow.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {workflow.tags.map((tag) => (
                      <Badge key={tag.tag.id} variant="outline">
                        {tag.tag.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Related Workflows */}
        {relatedWorkflows.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Related Workflows</h2>
            <WorkflowGrid workflows={relatedWorkflows} />
          </div>
        )}
      </div>
    </div>
  )
}
