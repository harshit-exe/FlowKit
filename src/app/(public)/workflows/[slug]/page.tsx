import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getWorkflowStatsOffsets, applyStatsOffsetsToWorkflows } from "@/lib/stats"
import { getCachedWorkflow } from "@/lib/workflow-cache"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, DownloadCloud, Youtube, FileText, User, ThumbsUp, ThumbsDown, GraduationCap } from "lucide-react"
import { Metadata } from "next"
import WorkflowGrid from "@/components/workflow/WorkflowGrid"
import WorkflowActions from "@/components/workflow/WorkflowActions"
import WorkflowVisualizer from "@/components/workflow/WorkflowVisualizer"
import WorkflowJsonViewer from "@/components/workflow/WorkflowJsonViewer"
import CommentsSection from "@/components/workflow/CommentsSection"
import VoteComponent from "@/components/workflow/VoteComponent"
import SaveButton from "@/components/workflow/SaveButton"

import TutorialSection from "@/components/tutorial/TutorialSection"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const workflow = await getCachedWorkflow(params.slug)

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
    ...workflow.categories.map((c: any) => c.category.name),
    ...workflow.tags.map((t: any) => t.tag.name),
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

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function WorkflowDetailPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  
  // 1. Fetch workflow (Critical Path) - Cached
  const workflow = await getCachedWorkflow(params.slug)

  if (!workflow) {
    notFound()
  }

  // 2. Parallel Fetching of Secondary Data
  // - User Status (Vote/Save)
  // - Stats Offsets
  // - Related Workflows
  const categoryIds = workflow.categories.map((c: any) => c.categoryId)

  const [userStatus, statsOffsets, relatedWorkflows, workflowJsonData] = await Promise.all([
    // Fetch User Status
    (async () => {
      if (!session?.user?.email) return { isSaved: false, userVote: null };
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      if (!user) return { isSaved: false, userVote: null };
      
      const [savedWorkflow, vote] = await Promise.all([
        prisma.savedWorkflow.findUnique({
          where: { userId_workflowId: { userId: user.id, workflowId: workflow.id } },
        }),
        (prisma as any).vote.findUnique({
          where: { userId_workflowId: { userId: user.id, workflowId: workflow.id } },
        }),
      ]);
      
      return { 
        isSaved: !!savedWorkflow, 
        userVote: vote?.type as "UPVOTE" | "DOWNVOTE" | null 
      };
    })(),

    // Fetch Stats Offsets
    getWorkflowStatsOffsets([workflow.id]),

    // Fetch Related Workflows
    prisma.workflow.findMany({
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
    }),

    // Fetch Workflow JSON (Heavy Blob)
    prisma.workflow.findUnique({
      where: { id: workflow.id },
      select: { workflowJson: true }
    })
  ]);

  const { isSaved, userVote } = userStatus;
  // Merge workflowJson
  const workflowWithJson = { ...workflow, workflowJson: workflowJsonData?.workflowJson || {} };

  // Calculate vote counts
  let upvotes = workflow.votes.filter((v: { type: string }) => v.type === "UPVOTE").length;
  let downvotes = workflow.votes.filter((v: { type: string }) => v.type === "DOWNVOTE").length;

  // Apply stats offsets
  const workflowOffsets = statsOffsets[workflow.id] || {};

  if (workflowOffsets.views) workflow.views += workflowOffsets.views;
  if (workflowOffsets.downloads) workflow.downloads += workflowOffsets.downloads;
  if (workflowOffsets.upvotes) upvotes += workflowOffsets.upvotes;
  if (workflowOffsets.downvotes) downvotes += workflowOffsets.downvotes;
  
  // Apply save offset if applicable
  if (workflowOffsets.saves && workflow._count) {
     workflow._count.savedBy += workflowOffsets.saves;
  }

  // Increment view count (fire and forget)
  prisma.workflow.update({
    where: { id: workflow.id },
    data: { views: { increment: 1 } },
  }).catch(() => {})

  // Apply stats offsets to related workflows
  const relatedWorkflowsWithOffsets = await applyStatsOffsetsToWorkflows(relatedWorkflows);

  // Transform to match expected type
  const transformedRelated = relatedWorkflowsWithOffsets.map((wf) => ({
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
        updatedAt: new Date(),
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
      ...workflow.categories.map((c: any) => c.category.name),
      ...workflow.tags.map((t: any) => t.tag.name),
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
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/LikeAction",
        "userInteractionCount": upvotes
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
            {workflow.categories.map((cat: any) => (
              <Badge key={cat.category.id} variant="outline" className="font-mono border-2">
                {cat.category.name.toUpperCase()}
              </Badge>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <WorkflowActions
              workflowJson={workflowWithJson.workflowJson}
              workflowSlug={workflow.slug}
              workflowId={workflow.id}
            />
            <SaveButton 
              workflowId={workflow.id} 
              initialSaved={isSaved} 
            />
          </div>
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
                  workflowJson={workflowWithJson.workflowJson}
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

            {/* Interactive Tutorial */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="font-mono uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  INTERACTIVE TUTORIAL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TutorialSection workflowSlug={workflow.slug} />
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
                <WorkflowJsonViewer workflowJson={workflowWithJson.workflowJson} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator */}
            {workflow.author && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="font-mono uppercase tracking-wider">
                    CREATOR
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      {workflow.authorUrl ? (
                        (() => {
                          const rawUrl = workflow.authorUrl?.trim() || "";
                          const isMailto = rawUrl.toLowerCase().startsWith("mailto:");
                          const isEmailLike = rawUrl.includes("@") && !rawUrl.includes("://");
                          
                          if (isMailto || isEmailLike) {
                            const href = isMailto ? rawUrl : `mailto:${rawUrl}`;
                            return (
                              <a
                                href={href}
                                className="font-bold font-mono hover:text-primary transition-colors flex items-center gap-1 group"
                              >
                                {workflow.author}
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">✉️</span>
                              </a>
                            );
                          }

                          return (
                            <a
                              href={rawUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold font-mono hover:text-primary transition-colors flex items-center gap-1 group"
                            >
                              {workflow.author}
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">↗</span>
                            </a>
                          );
                        })()
                      ) : (
                        <span className="font-bold font-mono">{workflow.author}</span>
                      )}
                      <span className="text-xs text-muted-foreground font-mono uppercase">
                        Workflow Author
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Statistics */}
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
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="text-xs uppercase">Saves</span>
                  </div>
                  <span className="font-bold">{workflow._count.savedBy}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-xs uppercase">Upvotes</span>
                  </div>
                  <span className="font-bold text-green-600">+{upvotes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ThumbsDown className="h-4 w-4" />
                    <span className="text-xs uppercase">Downvotes</span>
                  </div>
                  <span className="font-bold text-red-600">-{downvotes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs uppercase">
                    Nodes
                  </span>
                  <span className="font-bold">{workflow.nodeCount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Vote this Workflow */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="font-mono uppercase tracking-wider">
                  EVALUATION
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <VoteComponent 
                  workflowId={workflow.id} 
                  initialUserVote={userVote}
                  initialUpvotes={upvotes}
                  initialDownvotes={downvotes}
                />
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
                    {workflow.tags.map((tag: any) => (
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

        {/* Comments Section */}
        <div className="mt-12">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="font-mono uppercase tracking-wider">
                COMMENTS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CommentsSection workflowId={workflow.id} />
            </CardContent>
          </Card>
        </div>

        {/* Related Workflows */}
        {transformedRelated.length > 0 && (
          <section>
            <h2 className="text-2xl font-mono font-bold mb-6">Related Workflows</h2>
            <WorkflowGrid workflows={transformedRelated as any} />
          </section>
        )}
      </div>
    </div>
  )
}

