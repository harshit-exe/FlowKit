import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { NewHero } from "@/components/ui/new-hero";
import ScrollReveal from "@/components/ui/ScrollReveal";
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
  Sparkles,
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
  const [featuredWorkflows, categories, totalWorkflows, totalUsers, totalSubmissions, acceptedSubmissions] = await Promise.all([
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
    prisma.waitlist.count(),
    prisma.workflowSubmission.count(),
    prisma.workflowSubmission.count({ where: { status: "REVIEWED" } }),
  ]);

  // Base counts
  const baseTotal = 46;
  const baseAccepted = 9;

  const displayTotal = baseTotal + totalSubmissions;
  const displayAccepted = baseAccepted + acceptedSubmissions;

  return (
    <div className="relative">
      {/* Hero Section */}
      <NewHero totalWorkflows={totalWorkflows} />
      
      <div className="relative bg-black pt-44 flex flex-col justify-center items-center px-4 overflow-hidden">
        {/* Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: 'url(/grid.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '112px 112px',
            opacity: 0.2,
          }}
        />
        {/* Badge */}
        <Link href="/submit-workflow">
          <div className="relative z-10 mb-8 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary backdrop-blur-sm font-poppins hover:bg-primary/20 transition-colors cursor-pointer flex items-center gap-2 group">
            <Sparkles className="w-4 h-4" />
            <span>Contribute to Community</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <div className="relative z-10">
          <ScrollReveal
            baseOpacity={0}
            enableBlur={true}
            baseRotation={5}
            blurStrength={10}
            containerClassName="max-w-5xl mx-auto text-center px-4 sm:px-6"
            textClassName="text-white/90 font-poppins text-sm sm:text-lg md:text-xl leading-relaxed"
            secondaryTextColor="rgba(129, 129, 129, 1)"
            rotationEnd="bottom center"
            wordAnimationEnd="bottom center"
          >
            Our node-based system gives you the freedom to build with precision nothing more, nothing less. Each connection flows naturally mirroring the way you think and solve problems. |||The result is a creative process that feels effortless, intelligent and uniquely yours.
          </ScrollReveal>
        </div>
      </div>

      {/* Content sections with grid background */}
      <div className="relative bg-black">
        {/* Grid Background Overlay - synced with hero gradient grid */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            backgroundImage: 'url(/grid.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '112px 112px',
            opacity:0.4,
          }}
        />

        {/* Featured Workflows */}
        {featuredWorkflows.length > 0 && (
          <section className="relative z-20 container mx-auto px-4 py-24">
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

                    <p 
                      className="text-sm text-muted-foreground font-mono line-clamp-2 mb-4 flex-1"
                      dangerouslySetInnerHTML={{ __html: workflow.description }}
                    />

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
        <section id="categories" className="relative z-20 container mx-auto px-4 py-24">
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

      {/* Contribute Section */}
      <section className="relative z-20 container mx-auto px-4 py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-purple-600 rounded-full blur-3xl opacity-20 animate-pulse" />
              <div className="relative border border-white/10 bg-black/50 backdrop-blur-xl rounded-2xl p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-mono font-bold text-white text-lg">Community Powered</h3>
                    <p className="font-mono text-xs text-gray-400">Built by developers, for developers</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-3/4 bg-white/10 rounded animate-pulse" />
                  <div className="h-2 w-full bg-white/10 rounded animate-pulse delay-75" />
                  <div className="h-2 w-5/6 bg-white/10 rounded animate-pulse delay-150" />
                </div>
                  <div className="pt-4 flex items-center justify-between border-t border-white/5">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-black overflow-hidden bg-gray-800">
                          <img 
                            src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${i * 123}`} 
                            alt={`Contributor ${i}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs text-primary font-bold">Join {totalUsers} Contributors</div>
                      <div className="font-mono text-[10px] text-gray-500">{displayTotal} Submissions • {displayAccepted} Accepted</div>
                    </div>
                  </div>
              </div>
            </div>

            <div className="order-1 md:order-2 text-left space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold font-mono leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                  Your Code.
                </span>
                <br />
                <span className="text-primary">
                  Their Solution.
                </span>
              </h2>
              <p className="text-lg text-gray-400 font-mono leading-relaxed">
                Every workflow you submit helps someone else solve a problem. 
                Join the movement to democratize automation.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/submit-workflow">
                  <Button size="lg" className="rounded-none bg-white text-black hover:bg-gray-200 font-mono h-12 px-8 font-bold">
                    SUBMIT WORKFLOW <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="relative z-20 container mx-auto px-4 py-24">
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
    </div>
  );
}
