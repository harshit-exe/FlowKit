"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Download } from "lucide-react"
import { toast } from "sonner"
import { copyWorkflowJSON, downloadWorkflowJSON } from "@/lib/utils"

interface WorkflowActionsProps {
  workflowJson: any
  workflowSlug: string
  workflowId: string
}

export default function WorkflowActions({ workflowJson, workflowSlug, workflowId }: WorkflowActionsProps) {
  const [isCopying, setIsCopying] = useState(false)

  const handleCopy = async () => {
    setIsCopying(true)
    try {
      await copyWorkflowJSON(workflowJson)
      toast.success("Workflow JSON copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy JSON")
    } finally {
      setIsCopying(false)
    }
  }

  const handleDownload = async () => {
    try {
      // Track download
      await fetch(`/api/download/${workflowId}`, { method: "POST" })

      // Download file
      downloadWorkflowJSON(workflowJson, workflowSlug)
      toast.success("Workflow JSON downloaded!")
    } catch (error) {
      toast.error("Failed to download JSON")
    }
  }

  return (
    <div className="flex flex-wrap gap-4">
      <Button size="lg" onClick={handleCopy} disabled={isCopying} className="gap-2">
        <Copy className="h-4 w-4" />
        {isCopying ? "Copying..." : "Copy JSON"}
      </Button>
      <Button size="lg" variant="outline" onClick={handleDownload} className="gap-2">
        <Download className="h-4 w-4" />
        Download JSON
      </Button>
    </div>
  )
}
