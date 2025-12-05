import { WorkflowWithRelations } from "@/types"
import WorkflowCard from "./WorkflowCard"

interface WorkflowGridProps {
  workflows: WorkflowWithRelations[]
  emptyMessage?: string
}

export default function WorkflowGrid({
  workflows,
  emptyMessage = "No workflows found",
}: WorkflowGridProps) {
  if (workflows.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workflows.map((workflow) => (
        <WorkflowCard key={workflow.id} workflow={workflow} />
      ))}
    </div>
  )
}
