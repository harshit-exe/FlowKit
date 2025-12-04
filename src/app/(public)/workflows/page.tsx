import { prisma } from "@/lib/prisma"
import WorkflowGrid from "@/components/workflow/WorkflowGrid"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Free n8n Workflow Templates & Automation Library | FlowKit",
  description: "Browse 150+ free n8n workflow templates. Download production-ready n8n automation workflows. Open source n8n template library with integrations for Slack, Email, AI, and more.",
  keywords: "n8n workflows, n8n templates, free n8n workflows, n8n workflow library, n8n automation templates, open source workflows",
}

export default async function WorkflowsPage() {
  const workflows = await prisma.workflow.findMany({
    where: { published: true },
    include: {
      categories: {
        include: { category: true },
      },
      tags: {
        include: { tag: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">All Workflows</h1>
          <p className="text-gray-600 mt-2">
            Browse {workflows.length} curated n8n workflows
          </p>
        </div>

        {/* Workflows Grid */}
        <WorkflowGrid
          workflows={workflows}
          emptyMessage="No workflows available yet. Check back soon!"
        />
      </div>
    </div>
  )
}
