import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { Plus } from "lucide-react"
import { WorkflowsList } from "@/components/admin/WorkflowsList"

export default async function AdminWorkflowsPage() {
  const workflows = await prisma.workflow.findMany({
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workflows</h1>
          <p className="text-muted-foreground mt-1">Manage all n8n workflows</p>
        </div>
        <Link href="/admin/workflows/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Workflows ({workflows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {workflows.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No workflows yet</p>
              <Link href="/admin/workflows/new">
                <Button>Create your first workflow</Button>
              </Link>
            </div>
          ) : (
            <WorkflowsList workflows={workflows} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
