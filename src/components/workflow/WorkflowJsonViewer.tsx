"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react"

interface WorkflowJsonViewerProps {
  workflowJson: any
}

export default function WorkflowJsonViewer({ workflowJson }: WorkflowJsonViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const jsonString = JSON.stringify(workflowJson, null, 2)
  const preview = jsonString.slice(0, 500) + (jsonString.length > 500 ? "..." : "")

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 font-mono text-xs"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="mr-2 h-3 w-3" />
              COPIED
            </>
          ) : (
            <>
              <Copy className="mr-2 h-3 w-3" />
              COPY JSON
            </>
          )}
        </Button>
      </div>
      
      <div className="bg-muted/30 p-4 border-2 border-border overflow-auto max-h-96 text-sm font-mono rounded-md">
        <pre className="whitespace-pre">
          <code>{isExpanded ? jsonString : preview}</code>
        </pre>
        
        {jsonString.length > 500 && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="font-mono text-xs"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="mr-2 h-3 w-3" />
                  SHOW LESS
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-3 w-3" />
                  SHOW FULL JSON ({Math.round(jsonString.length / 1024)}KB)
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
