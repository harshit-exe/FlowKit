import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import WorkflowGrid from "@/components/workflow/WorkflowGrid";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { StickyNavbar } from "@/components/ui/sticky-navbar";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if ((session.user as any).role === "ADMIN") {
    redirect("/admin");
  }

  const savedWorkflows = await prisma.savedWorkflow.findMany({
    where: {
      userId: (session.user as any).id,
    },
    include: {
      workflow: {
        include: {
          categories: {
            include: { category: true },
          },
          tags: {
            include: { tag: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Transform for grid
  const workflows = savedWorkflows.map((sw) => ({
    ...sw.workflow,
    categories: sw.workflow.categories.map((c) => ({ category: c.category })),
    tags: sw.workflow.tags.map((t) => ({ tag: t.tag })),
  }));

  return (
    <div className="min-h-screen bg-black">
      <StickyNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-mono">My Saved Workflows</h1>
              <p className="text-muted-foreground font-mono">
                Manage your collection of automation templates
              </p>
            </div>
          </div>

          {workflows.length > 0 ? (
            <WorkflowGrid workflows={workflows as any} />
          ) : (
            <Card className="border-dashed border-2 bg-transparent">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-bold font-mono mb-2">No saved workflows yet</h3>
                <p className="text-muted-foreground font-mono max-w-sm">
                  Browse the library and click the heart icon to save workflows for later.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
