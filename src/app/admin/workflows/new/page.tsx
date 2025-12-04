import WorkflowForm from "@/components/admin/WorkflowForm"
import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/card"

export default async function NewWorkflowPage() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      orderBy: { order: "asc" },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Create New Workflow</h1>
        <p className="text-gray-100 mt-1">Add a new n8n workflow to the library</p>
      </div>

      <WorkflowForm categories={categories} tags={tags} />
    </div>
  )
}
