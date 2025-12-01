import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import {
  Workflow,
  TrendingUp,
  Zap,
  Shield,
  ArrowRight,
  Check,
  Sparkles,
  Globe,
  Clock,
  Star,
} from "lucide-react"

export default async function HomePage() {
  // Fetch data for homepage
  const [featuredWorkflows, categories, totalWorkflows, recentWorkflows] = await Promise.all([
    prisma.workflow.findMany({
      where: {
        featured: true,
        published: true,
      },
      include: {
        categories: {
          include: { category: true },
        },
      },
      take: 6,
      orderBy: { views: "desc" },
    }),
    prisma.category.findMany({
      include: {
        _count: {
          select: { workflows: true },
        },
      },
      orderBy: { order: "asc" },
    }),
    prisma.workflow.count({
      where: { published: true },
    }),
    prisma.workflow.findMany({
      where: { published: true },
      include: {
        categories: {
          include: { category: true },
        },
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
  ])

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Badge */}
            <div className="flex items-center justify-center gap-2">
              <Badge className="bg-india-saffron text-white border-0 text-sm px-4 py-1.5">
                <Globe className="h-3 w-3 mr-1" />
                Made in India
              </Badge>
              <Badge variant="outline" className="text-sm px-4 py-1.5 border-primary-200">
                <Star className="h-3 w-3 mr-1 fill-primary text-primary" />
                {totalWorkflows}+ Premium Workflows
              </Badge>
            </div>

            {/* Heading */}
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="block text-gray-900">Automate Everything</span>
                <span className="block mt-2 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 bg-clip-text text-transparent">
                  With n8n Workflows
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Production-ready automation workflows for modern teams. Built by developers, for developers.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link href="/workflows">
                <Button size="lg" className="text-lg h-14 px-8 bg-primary hover:bg-primary-600 shadow-lg shadow-primary-500/30">
                  Explore Workflows
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/ai-builder">
                <Button size="lg" variant="outline" className="text-lg h-14 px-8 border-2 hover:bg-gray-50">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Try AI Builder
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">{totalWorkflows}+</div>
                <div className="text-sm text-gray-600 mt-1">Workflows</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">8</div>
                <div className="text-sm text-gray-600 mt-1">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-600 mt-1">Open Source</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose FlowKit?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Quality over quantity. Every workflow is tested and production-ready.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 border-gray-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Production Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Every workflow is tested, documented, and ready to deploy to your n8n instance immediately.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-100 shadow-sm hover:shadow-xl hover:border-secondary-100 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">Well Documented</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Complete setup guides, use cases, and step-by-step instructions for every workflow.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-100 shadow-sm hover:shadow-xl hover:border-accent/30 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-yellow-600 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">AI Powered</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Generate custom workflows using our AI builder powered by Google Gemini.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Workflows */}
      {featuredWorkflows.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  Featured Workflows
                </h2>
                <p className="text-lg text-gray-600">Hand-picked workflows for common use cases</p>
              </div>
              <Link href="/workflows">
                <Button variant="outline" className="hidden sm:flex">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredWorkflows.map((workflow) => (
                <Link key={workflow.id} href={`/workflows/${workflow.slug}`}>
                  <Card className="h-full group border-2 border-gray-100 hover:border-primary-200 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden">
                    {workflow.thumbnail && (
                      <div className="aspect-video w-full overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50">
                        <div className="w-full h-full flex items-center justify-center">
                          <Workflow className="h-16 w-16 text-primary-300 group-hover:scale-110 transition-transform" />
                        </div>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                          {workflow.name}
                        </CardTitle>
                        {workflow.indiaBadge && <span className="text-lg">🇮🇳</span>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {workflow.difficulty}
                        </Badge>
                        {workflow.categories.slice(0, 1).map((cat) => (
                          <Badge key={cat.category.id} variant="outline" className="text-xs">
                            {cat.category.name}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-2">{workflow.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-gray-600">
              Find the perfect workflow for your automation needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <Card className="text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-gray-100 h-full">
                  <CardHeader className="pb-4">
                    <div className="flex justify-center mb-4">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                        style={{ backgroundColor: `${category.color}15` }}
                      >
                        {category.icon}
                      </div>
                    </div>
                    <CardTitle className="text-base font-semibold">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Badge variant="secondary" className="text-xs">
                      {category._count.workflows} workflows
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-secondary-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Start automating in minutes</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Automate Your Workflow?
          </h2>
          <p className="text-xl mb-10 opacity-90">
            Join thousands of developers using FlowKit to streamline their automation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/workflows">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg h-14 px-8 bg-white text-primary hover:bg-gray-100 shadow-xl"
              >
                Browse All Workflows
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/ai-builder">
              <Button
                size="lg"
                variant="outline"
                className="text-lg h-14 px-8 border-2 border-white text-white hover:bg-white/10"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Try AI Builder
              </Button>
            </Link>
          </div>

          {/* Features list */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-left">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold">100% Open Source</div>
                <div className="text-sm opacity-80">MIT License, use freely</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold">Always Updated</div>
                <div className="text-sm opacity-80">New workflows weekly</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold">Community Driven</div>
                <div className="text-sm opacity-80">Built by developers</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
