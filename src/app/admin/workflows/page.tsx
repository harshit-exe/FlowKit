import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { Plus } from "lucide-react"
import { WorkflowsList } from "@/components/admin/WorkflowsList"
import { Pagination } from "@/components/ui/pagination"

const ITEMS_PER_PAGE = 20

export default async function AdminWorkflowsPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const currentPage = Number(searchParams.page) || 1
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  // Separate queries for better performance
  const [totalWorkflows, workflows] = await Promise.all([
    prisma.workflow.count(),
    prisma.workflow.findMany({
      take: ITEMS_PER_PAGE,
      skip: skip,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        thumbnail: true,
        difficulty: true,
        featured: true,
        published: true,
        views: true,
        downloads: true,
        createdAt: true,
        updatedAt: true,
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
      },
      orderBy: { createdAt: "desc" },
    }),
  ])

  const totalPages = Math.ceil(totalWorkflows / ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workflows</h1>
          <p className="text-muted-foreground mt-1">
            Manage all n8n workflows ({totalWorkflows} total)
          </p>
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
          <CardTitle>
            Workflows (Page {currentPage} of {totalPages})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {workflows.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No workflows yet</p>
              <Link href="/admin/workflows/new">
                <Button>Create your first workflow</Button>
              </Link>
            </div>
          ) : (
            <>
              <WorkflowsList workflows={workflows as any} />
              
              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/admin/workflows"
                totalItems={totalWorkflows}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
