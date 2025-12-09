import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { BundleGrid } from "@/components/bundle/BundleGrid"
import { Sparkles, Package } from "lucide-react"

export const metadata: Metadata = {
  title: "Workflow Bundles - Complete Automation Solutions | FlowKit",
  description:
    "Discover curated workflow bundles - complete automation solutions combining multiple workflows to solve complex business challenges in minutes.",
  openGraph: {
    title: "Workflow Bundles - Complete Automation Solutions | FlowKit",
    description:
      "Discover curated workflow bundles - complete automation solutions combining multiple workflows to solve complex business challenges in minutes.",
    type: "website",
  },
}

export default async function BundlesPage() {
  const [bundlesData, featuredBundlesData] = await Promise.all([
    prisma.bundle.findMany({
      where: { published: true },
      include: {
        _count: {
          select: {
            workflows: true,
          },
        },
        workflows: {
          select: {
            workflow: {
              select: {
                id: true,
                downloads: true,
              },
            },
          },
        },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    prisma.bundle.findMany({
      where: { published: true, featured: true },
      include: {
        _count: {
          select: {
            workflows: true,
          },
        },
        workflows: {
          select: {
            workflow: {
              select: {
                id: true,
                downloads: true,
              },
            },
          },
        },
      },
      orderBy: [{ order: "asc" }, { views: "desc" }],
      take: 3,
    }),
  ])

  // Serialize bundles for client components
  const bundles = bundlesData.map(bundle => ({
    ...bundle,
    createdAt: bundle.createdAt.toISOString(),
    updatedAt: bundle.updatedAt.toISOString(),
  }))

  const featuredBundles = featuredBundlesData.map(bundle => ({
    ...bundle,
    createdAt: bundle.createdAt.toISOString(),
    updatedAt: bundle.updatedAt.toISOString(),
  }))

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#FF6B35]/10 via-background to-background">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B35]/10 rounded-full border border-[#FF6B35]/20">
              <Package className="h-4 w-4 text-[#FF6B35]" />
              <span className="text-sm font-medium text-[#FF6B35]">Curated Collections</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
              Workflow <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#F7931E]">Bundles</span>
            </h1>

            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Complete automation solutions combining multiple workflows to solve complex business challenges in minutes
            </p>

            <div className="flex items-center justify-center gap-8 pt-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{bundles.length}</p>
                <p className="text-sm text-gray-400">Bundles Available</p>
              </div>
              <div className="h-12 w-px bg-gray-800" />
              <div className="text-center">
                <p className="text-3xl font-bold text-white">
                  {bundles.reduce((acc, b) => acc + b._count.workflows, 0)}
                </p>
                <p className="text-sm text-gray-400">Total Workflows</p>
              </div>
              <div className="h-12 w-px bg-gray-800" />
              <div className="text-center">
                <p className="text-3xl font-bold text-white">
                  {bundles.reduce((acc, b) => acc + b.workflows.reduce((sum, w) => sum + w.workflow.downloads, 0), 0)}
                </p>
                <p className="text-sm text-gray-400">Downloads</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Bundles */}
      {featuredBundles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-6 w-6 text-[#FF6B35]" />
            <h2 className="text-3xl font-bold text-white">Featured Bundles</h2>
          </div>
          <BundleGrid bundles={featuredBundles} />
        </section>
      )}

      {/* All Bundles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center gap-2 mb-8">
          <Package className="h-6 w-6 text-[#FF6B35]" />
          <h2 className="text-3xl font-bold text-white">All Bundles</h2>
        </div>

        {bundles.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400">No bundles available yet</p>
          </div>
        ) : (
          <BundleGrid bundles={bundles} />
        )}
      </section>
    </div>
  )
}
