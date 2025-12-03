import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { MynaHero } from "@/components/ui/myna-hero";
import {
  Workflow,
  TrendingUp,
  Zap,
  Shield,
  ArrowRight,
  Database,
  Mail,
  MessageSquare,
  Code,
  Users,
  Bot,
} from "lucide-react";

// Category icon mapping
const categoryIcons: Record<string, any> = {
  automation: Workflow,
  communication: MessageSquare,
  productivity: TrendingUp,
  data: Database,
  marketing: Mail,
  development: Code,
  social: Users,
  ai: Bot,
};

export default async function HomePage() {
  // Fetch data for homepage
  const [featuredWorkflows, categories, totalWorkflows] = await Promise.all([
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
  ]);

  return (
    <div className="relative">
      {/* Hero Section */}
      <MynaHero totalWorkflows={totalWorkflows} />

      {/* Featured Workflows */}
      {featuredWorkflows.length > 0 && (
        <section className="container mx-auto px-4 py-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-mono font-bold mb-4">
              FEATURED WORKFLOWS
            </h2>
            <p className="text-lg text-muted-foreground font-mono">
              Hand-picked workflows for common automation tasks
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {featuredWorkflows.map((workflow) => (
              <Link
                key={workflow.id}
                href={`/workflows/${workflow.slug}`}
                className="group block"
              >
                <div className="border-2 bg-background/50 backdrop-blur-sm hover:border-primary transition-all duration-300 h-full flex flex-col">
                  {/* Workflow Icon */}
                  <div className="aspect-video w-full border-b-2 flex items-center justify-center bg-muted/30">
                    <Workflow className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-mono font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {workflow.name}
                      </h3>
                      {workflow.indiaBadge && (
                        <Badge className="bg-india-saffron text-white border-0 shrink-0">
                          IN
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground font-mono line-clamp-2 mb-4 flex-1">
                      {workflow.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {workflow.difficulty}
                      </Badge>
                      {workflow.categories.slice(0, 1).map((cat) => (
                        <Badge
                          key={cat.category.id}
                          variant="outline"
                          className="font-mono text-xs"
                        >
                          {cat.category.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/workflows">
              <Button
                variant="outline"
                className="rounded-none font-mono border-2"
              >
                VIEW ALL WORKFLOWS <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-mono font-bold mb-4">
            BROWSE BY CATEGORY
          </h2>
          <p className="text-lg text-muted-foreground font-mono">
            Find workflows organized by use case
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {categories.map((category) => {
            const IconComponent =
              categoryIcons[category.slug.toLowerCase()] || Workflow;

            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group"
              >
                <div className="border-2 bg-background/50 backdrop-blur-sm hover:border-primary transition-all duration-300 p-6 text-center h-full flex flex-col items-center justify-center">
                  <div
                    className="w-16 h-16 rounded-none flex items-center justify-center mb-4 border-2"
                    style={{
                      borderColor: category.color,
                      backgroundColor: `${category.color}15`,
                    }}
                  >
                    <IconComponent
                      className="h-8 w-8"
                      style={{ color: category.color }}
                    />
                  </div>

                  <h3 className="font-mono font-bold text-sm mb-2 group-hover:text-primary transition-colors">
                    {category.name.toUpperCase()}
                  </h3>

                  <Badge variant="secondary" className="font-mono text-xs">
                    {category._count.workflows}
                  </Badge>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="border-2 border-primary bg-primary/5 backdrop-blur-sm p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-mono font-bold mb-6">
            READY TO AUTOMATE?
          </h2>
          <p className="text-xl font-mono text-muted-foreground mb-10 max-w-2xl mx-auto">
            Stop building from scratch. Deploy production-ready workflows in
            minutes.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link href="/workflows">
              <Button
                size="lg"
                className="rounded-none bg-primary hover:bg-primary/90 font-mono text-lg h-14 px-8"
              >
                BROWSE WORKFLOWS <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/ai-builder">
              <Button
                size="lg"
                variant="outline"
                className="rounded-none font-mono text-lg h-14 px-8 border-2"
              >
                <Zap className="mr-2 h-5 w-5" />
                TRY AI BUILDER
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 border-2 border-primary bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-mono font-bold text-sm mb-1">
                  PRODUCTION READY
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  Tested and documented
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 border-2 border-primary bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-mono font-bold text-sm mb-1">
                  ALWAYS UPDATED
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  New workflows weekly
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 border-2 border-primary bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Code className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-mono font-bold text-sm mb-1">
                  100% OPEN SOURCE
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  MIT License
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
