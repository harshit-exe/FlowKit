import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { Plus, Pencil, Trash2, Eye } from "lucide-react"

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
          <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
          <p className="text-gray-600 mt-1">Manage all n8n workflows</p>
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
              <p className="text-gray-500 mb-4">No workflows yet</p>
              <Link href="/admin/workflows/new">
                <Button>Create your first workflow</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Categories</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Stats</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workflows.map((workflow) => (
                    <tr key={workflow.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {workflow.icon && <span className="text-lg">{workflow.icon}</span>}
                          <div>
                            <p className="font-medium">{workflow.name}</p>
                            <p className="text-sm text-gray-500">{workflow.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {workflow.categories.slice(0, 2).map((cat) => (
                            <Badge key={cat.category.id} variant="outline" className="text-xs">
                              {cat.category.icon} {cat.category.name}
                            </Badge>
                          ))}
                          {workflow.categories.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{workflow.categories.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={workflow.published ? "default" : "secondary"}
                            className="w-fit text-xs"
                          >
                            {workflow.published ? "Published" : "Draft"}
                          </Badge>
                          {workflow.featured && (
                            <Badge variant="outline" className="w-fit text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" /> {workflow.views}
                            </span>
                            <span>↓ {workflow.downloads}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(workflow.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <Link href={`/workflows/${workflow.slug}`} target="_blank">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/workflows/${workflow.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
