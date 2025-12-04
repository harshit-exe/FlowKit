import { notFound } from "next/navigation"
import WorkflowForm from "@/components/admin/WorkflowForm"
import { prisma } from "@/lib/prisma"

export default async function EditWorkflowPage({ params }: { params: { id: string } }) {
  const [workflow, categories, tags] = await Promise.all([
    prisma.workflow.findUnique({
      where: { id: params.id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
    }),
  ])

  if (!workflow) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Edit Workflow</h1>
        <p className="text-white-100 mt-1">Update workflow: {workflow.name}</p>
      </div>

      <WorkflowForm initialData={workflow} categories={categories} tags={tags} />
    </div>
  )
}
