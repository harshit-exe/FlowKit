import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, DownloadCloud, Youtube, FileText } from "lucide-react"
import { Metadata } from "next"
import WorkflowGrid from "@/components/workflow/WorkflowGrid"
import WorkflowActions from "@/components/workflow/WorkflowActions"
import WorkflowVisualizer from "@/components/workflow/WorkflowVisualizer"
import WorkflowJsonViewer from "@/components/workflow/WorkflowJsonViewer"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const workflow = await prisma.workflow.findUnique({
    where: { slug: params.slug },
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
    return {
      title: "Workflow Not Found | FlowKit",
      description: "The requested n8n workflow could not be found. Browse our library of 150+ free workflow templates.",
    }
  }

  // Clean HTML from description
  const cleanDescription = workflow.description?.replace(/<[^>]*>/g, '') || '';
  
  // Generate optimized meta description
  const metaDescription = cleanDescription.length > 155 
    ? cleanDescription.substring(0, 152) + '...'
    : cleanDescription;

  // Extract keywords from categories and tags
  const keywords = [
    workflow.name,
    'n8n workflow',
    'n8n template',
    'workflow automation',
    ...workflow.categories.map(c => c.category.name),
    ...workflow.tags.map(t => t.tag.name),
    workflow.difficulty,
    'free download',
    'production ready',
  ];

  const pageUrl = `https://www.flowkit.in/workflows/${workflow.slug}`;

  // Generate dynamic OG image
  const ogImageParams = new URLSearchParams({
    title: workflow.name,
    description: cleanDescription.slice(0, 100),
    type: 'workflow',
  });
  const ogImage = `https://www.flowkit.in/api/og?${ogImageParams.toString()}`;

  return {
    title: `${workflow.name} - Free n8n Workflow Template | FlowKit`,
    description: metaDescription,
    keywords: keywords.join(', '),
    authors: [{ name: 'FlowKit Team' }],
    openGraph: {
      type: 'article',
      url: pageUrl,
      title: `${workflow.name} - n8n Workflow Template`,
      description: metaDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: workflow.name,
        },
      ],
      siteName: 'FlowKit',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${workflow.name} - n8n Workflow`,
      description: metaDescription,
      images: [ogImage],
      creator: '@flowkit_in',
    },
    alternates: {
      canonical: pageUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
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

  // Fetch related workflows (optimized query)
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
    take: 3,
    orderBy: { views: "desc" },
  })

  // Transform to match expected type
  const transformedRelated = relatedWorkflows.map((wf) => ({
    ...wf,
    videoUrl: null,
    workflowJson: {},
    useCases: [],
    setupSteps: [],
    credentialsRequired: [],
    nodes: [],
    published: true,
    updatedAt: wf.createdAt,
    publishedAt: wf.createdAt,
    categories: wf.categories.map((cat) => ({
      category: {
        ...cat.category,
        description: null,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })),
    tags: wf.tags.map((t) => ({
      tag: {
        ...t.tag,
        createdAt: new Date(),
      },
    })),
  }))

  const useCases = workflow.useCases as string[]
  const setupSteps = workflow.setupSteps as string[]
  const credentialsRequired = workflow.credentialsRequired as string[]

  // Generate structured data for SEO
  const workflowSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "name": workflow.name,
    "description": workflow.description?.replace(/<[^>]*>/g, ''),
    "url": `https://www.flowkit.in/workflows/${workflow.slug}`,
    "programmingLanguage": "JSON",
    "codeRepository": "https://github.com/harshit-exe/FlowKit",
    "keywords": [
      ...workflow.categories.map(c => c.category.name),
      ...workflow.tags.map(t => t.tag.name),
      "n8n",
      "workflow",
      "automation"
    ],
    "dateCreated": workflow.createdAt.toISOString(),
    "dateModified": workflow.updatedAt.toISOString(),
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/DownloadAction",
        "userInteractionCount": workflow.downloads
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/ViewAction",
        "userInteractionCount": workflow.views
      }
    ],
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Cross-platform"
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `How to Set Up ${workflow.name}`,
    "description": workflow.description?.replace(/<[^>]*>/g, ''),
    "step": setupSteps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": `Step ${index + 1}`,
      "text": step
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.flowkit.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Workflows",
        "item": "https://www.flowkit.in/workflows"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": workflow.name,
        "item": `https://www.flowkit.in/workflows/${workflow.slug}`
      }
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(workflowSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
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
                <WorkflowJsonViewer workflowJson={workflow.workflowJson} />
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

            {/* Resources (Video & Documentation) */}
            {(workflow.videoUrl || workflow.documentLink) && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="font-mono uppercase tracking-wider">
                    RESOURCES
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {workflow.videoUrl && (
                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-start gap-2 border-2 font-mono hover:bg-red-50 hover:border-red-500 hover:text-red-600 transition-colors"
                    >
                      <a
                        href={workflow.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Youtube className="h-4 w-4" />
                        <span className="text-sm uppercase">Watch Video Tutorial</span>
                      </a>
                    </Button>
                  )}
                  {workflow.documentLink && (
                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-start gap-2 border-2 font-mono hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-colors"
                    >
                      <a
                        href={workflow.documentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="text-sm uppercase">View Documentation</span>
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

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
        {transformedRelated.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-mono uppercase tracking-wider">
              RELATED WORKFLOWS
            </h2>
            <WorkflowGrid workflows={transformedRelated as any} />
          </div>
        )}
      </div>
    </div>
  )
}
