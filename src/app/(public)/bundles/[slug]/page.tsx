import { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import WorkflowCard from "@/components/workflow/WorkflowCard"
import { CheckCircle2, Clock, Users, Package, Eye, Download, Sparkles } from "lucide-react"

interface BundlePageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: BundlePageProps): Promise<Metadata> {
  const bundle = await prisma.bundle.findUnique({
    where: { slug: params.slug, published: true },
  })

  if (!bundle) {
    return {
      title: "Bundle Not Found",
    }
  }

  const bundleDescription = bundle.objective || bundle.description
  const pageUrl = `https://www.flowkit.in/bundles/${bundle.slug}`

  // Generate dynamic OG image
  const ogImageParams = new URLSearchParams({
    title: `${bundle.icon || '📦'} ${bundle.name}`,
    description: bundleDescription.slice(0, 100),
    type: 'bundle',
  })
  const ogImage = `https://www.flowkit.in/api/og?${ogImageParams.toString()}`

  return {
    title: `${bundle.name} - n8n Workflow Bundle | FlowKit`,
    description: bundleDescription,
    keywords: `${bundle.name} bundle, n8n workflow collection, ${bundle.name} automation, workflow bundle`,
    openGraph: {
      title: `${bundle.name} - Workflow Bundle | FlowKit`,
      description: bundleDescription,
      url: pageUrl,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${bundle.name} Bundle`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${bundle.name} - Workflow Bundle | FlowKit`,
      description: bundleDescription,
      images: [ogImage],
      creator: '@flowkit_in',
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}

export default async function BundlePage({ params }: BundlePageProps) {
  const bundle = await prisma.bundle.findUnique({
    where: { slug: params.slug, published: true },
    include: {
      workflows: {
        include: {
          workflow: {
            include: {
              categories: {
                include: {
                  category: true,
                },
              },
              tags: {
                include: {
                  tag: true,
                },
              },
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  })

  if (!bundle) {
    notFound()
  }

  // Increment view count
  await prisma.bundle.update({
    where: { id: bundle.id },
    data: { views: { increment: 1 } },
  })

  // Calculate stats
  const totalDownloads = bundle.workflows.reduce((sum, w) => sum + w.workflow.downloads, 0)
  const totalNodes = bundle.workflows.reduce((sum, w) => sum + w.workflow.nodeCount, 0)
  const benefits = (Array.isArray(bundle.benefits) ? bundle.benefits : []) as string[]

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section with Background */}
      <div className="relative overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        {bundle.thumbnail && (
          <div className="absolute inset-0 h-[500px]">
            <Image
              src={bundle.thumbnail}
              alt={bundle.name}
              fill
              className="object-cover"
              quality={90}
              priority
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, transparent 0%, ${bundle.color}20 50%, #000 100%)`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
          </div>
        )}

        {/* Hero Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
          <div className="max-w-4xl">
            {/* Badges */}
            <div className="flex items-center gap-3 mb-6">
              {bundle.featured && (
                <Badge className="bg-[#FF6B35] hover:bg-[#FF6B35] text-white border-0 gap-1">
                  <Sparkles className="h-3 w-3" />
                  Featured Bundle
                </Badge>
              )}
              <Badge
                variant="secondary"
                className="gap-1"
                style={{ backgroundColor: `${bundle.color}20`, color: bundle.color }}
              >
                <Package className="h-3 w-3" />
                {bundle.workflows.length} Workflows Included
              </Badge>
            </div>

            {/* Title */}
            <div className="flex items-start gap-4 mb-6">
              {bundle.icon && <span className="text-6xl">{bundle.icon}</span>}
              <div className="flex-1">
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                  {bundle.name}
                </h1>
                <p className="text-xl text-gray-300 leading-relaxed">{bundle.objective}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap items-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-gray-400">
                <Eye className="h-5 w-5" />
                <span>{bundle.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Download className="h-5 w-5" />
                <span>{totalDownloads.toLocaleString()} downloads</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Package className="h-5 w-5" />
                <span>{totalNodes} total nodes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">About This Bundle</h2>
              <div
                className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: bundle.description }}
              />
            </section>

            {/* Key Benefits */}
            {benefits.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6">Key Benefits</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <Card
                      key={index}
                      className="border-2 hover:shadow-lg transition-all duration-200"
                      style={{ borderColor: `${bundle.color}30` }}
                    >
                      <CardContent className="flex items-start gap-3 p-4">
                        <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: bundle.color }} />
                        <p className="text-gray-300">{String(benefit)}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Included Workflows */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">
                Included Workflows ({bundle.workflows.length})
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {bundle.workflows.map((bw, index) => (
                  <div key={bw.workflow.id} className="relative">
                    <div className="absolute -left-4 top-8 w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#F7931E] flex items-center justify-center text-white font-bold text-sm z-10">
                      {index + 1}
                    </div>
                    <WorkflowCard workflow={bw.workflow as any} />
                  </div>
                ))}
              </div>
            </section>

            {/* How It Works */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">How to Get Started</h2>
              <div className="space-y-4">
                <Card className="border-l-4" style={{ borderLeftColor: bundle.color }}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#F7931E] flex items-center justify-center text-white font-bold">
                        1
                      </div>
                      <div>
                        <h3 className="font-bold text-white mb-2">Browse the workflows</h3>
                        <p className="text-gray-400">
                          Review each workflow in the bundle to understand what they do
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4" style={{ borderLeftColor: bundle.color }}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#F7931E] flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <div>
                        <h3 className="font-bold text-white mb-2">Import to n8n</h3>
                        <p className="text-gray-400">
                          Click on each workflow and use the &quot;Import to n8n&quot; button to add them to your instance
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4" style={{ borderLeftColor: bundle.color }}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#F7931E] flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      <div>
                        <h3 className="font-bold text-white mb-2">Configure & activate</h3>
                        <p className="text-gray-400">
                          Set up your credentials and configure each workflow according to your needs
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Bundle Info Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Bundle Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {bundle.targetAudience && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-400 mb-1">Target Audience</p>
                      <p className="text-white">{bundle.targetAudience}</p>
                    </div>
                  </div>
                )}

                {bundle.estimatedTime && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-400 mb-1">Setup Time</p>
                      <p className="text-white">{bundle.estimatedTime}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Workflows</p>
                    <p className="text-white">{bundle.workflows.length} workflows</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Download className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Total Downloads</p>
                    <p className="text-white">{totalDownloads.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Eye className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-400 mb-1">Views</p>
                    <p className="text-white">{bundle.views.toLocaleString()}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Link href="/bundles">
                    <Button variant="outline" className="w-full">
                      ← Browse All Bundles
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: bundle.name,
            description: bundle.objective,
            image: bundle.thumbnail,
            url: `https://flowkit.com/bundles/${bundle.slug}`,
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: bundle.workflows.length,
              itemListElement: bundle.workflows.map((bw, index) => ({
                "@type": "ListItem",
                position: index + 1,
                item: {
                  "@type": "SoftwareApplication",
                  name: bw.workflow.name,
                  description: bw.workflow.description,
                },
              })),
            },
          }),
        }}
      />
    </div>
  )
}
