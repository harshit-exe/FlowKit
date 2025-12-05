import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, DownloadCloud } from "lucide-react"
import { Metadata } from "next"
import WorkflowGrid from "@/components/workflow/WorkflowGrid"
import WorkflowActions from "@/components/workflow/WorkflowActions"
import WorkflowVisualizer from "@/components/workflow/WorkflowVisualizer"

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
            <div className="flex-1">
              <h1 className="text-4xl font-bold font-mono uppercase tracking-tight">
                {workflow.name}
              </h1>
              <p 
                className="text-xl text-muted-foreground font-mono mt-2"
                dangerouslySetInnerHTML={{ __html: workflow.description }}
              />
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="font-mono">
              {workflow.difficulty}
            </Badge>
            {workflow.featured && (
              <Badge className="font-mono bg-primary">FEATURED</Badge>
            )}
            {workflow.indiaBadge && (
              <Badge variant="outline" className="font-mono border-2">
                IN • INDIA
              </Badge>
            )}
            {workflow.categories.map((cat) => (
              <Badge key={cat.category.id} variant="outline" className="font-mono border-2">
                {cat.category.name.toUpperCase()}
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
            {/* Workflow Visualizer */}
            <Card className="border-2 font-mono">
              <CardHeader>
                <CardTitle className="font-mono uppercase tracking-wider">
                  WORKFLOW VISUALIZATION
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <WorkflowVisualizer
                  workflowJson={workflow.workflowJson}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Use Cases */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="font-mono uppercase tracking-wider">
                  USE CASES
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {useCases.map((useCase, index) => (
                    <li key={index} className="flex gap-2 font-mono">
                      <span className="text-primary font-bold">•</span>
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Setup Steps */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="font-mono uppercase tracking-wider">
                  SETUP STEPS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {setupSteps.map((step, index) => (
                    <li key={index} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground border-2 border-primary flex items-center justify-center font-bold font-mono">
                        {index + 1}
                      </span>
                      <span className="pt-1 font-mono">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Workflow JSON */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="font-mono uppercase tracking-wider">
                  WORKFLOW JSON
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-4 border-2 border-border overflow-auto max-h-96 text-sm font-mono">
                  <pre className="whitespace-pre">
                    <code>{JSON.stringify(workflow.workflowJson, null, 2)}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="font-mono uppercase tracking-wider">
                  STATISTICS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 font-mono">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span className="text-xs uppercase">Views</span>
                  </div>
                  <span className="font-bold">{workflow.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DownloadCloud className="h-4 w-4" />
                    <span className="text-xs uppercase">Downloads</span>
                  </div>
                  <span className="font-bold">{workflow.downloads}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs uppercase">
                    Nodes
                  </span>
                  <span className="font-bold">{workflow.nodeCount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Credentials */}
            {credentialsRequired.length > 0 && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="font-mono uppercase tracking-wider">
                    CREDENTIALS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {credentialsRequired.map((cred, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary border border-primary"></span>
                        <span className="text-sm font-mono">{cred}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {workflow.tags.length > 0 && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="font-mono uppercase tracking-wider">
                    TAGS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {workflow.tags.map((tag) => (
                      <Badge
                        key={tag.tag.id}
                        variant="outline"
                        className="font-mono"
                      >
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
            <h2 className="text-2xl font-bold font-mono uppercase tracking-wider">
              RELATED WORKFLOWS
            </h2>
            <WorkflowGrid workflows={relatedWorkflows} />
          </div>
        )}
      </div>
    </div>
  )
}
