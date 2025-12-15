"use client"

import { ExternalResource } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, BookOpen, Video, GraduationCap, Users } from "lucide-react"

interface ExternalResourcesListProps {
  resources: ExternalResource[]
}

const getResourceIcon = (type: ExternalResource["type"]) => {
  switch (type) {
    case "documentation":
      return <BookOpen className="h-4 w-4" />
    case "video":
      return <Video className="h-4 w-4" />
    case "tutorial":
      return <GraduationCap className="h-4 w-4" />
    case "community":
      return <Users className="h-4 w-4" />
    default:
      return <ExternalLink className="h-4 w-4" />
  }
}

const getResourceColor = (type: ExternalResource["type"]) => {
  switch (type) {
    case "documentation":
      return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
    case "video":
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
    case "tutorial":
      return "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800"
    case "community":
      return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
    default:
      return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800"
  }
}

export default function ExternalResourcesList({ resources }: ExternalResourcesListProps) {
  if (!resources || resources.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-sm font-mono font-bold text-muted-foreground uppercase">
        📚 Helpful Resources:
      </p>
      <div className="grid gap-2">
        {resources.map((resource, idx) => (
          <Card
            key={idx}
            className={`border-2 transition-all hover:shadow-md cursor-pointer ${getResourceColor(
              resource.type
            )}`}
            onClick={() => window.open(resource.url, "_blank")}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">{getResourceIcon(resource.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-medium line-clamp-1">
                    {resource.title}
                  </p>
                  <Badge variant="outline" className="font-mono text-xs mt-1">
                    {resource.type}
                  </Badge>
                </div>
                <ExternalLink className="h-4 w-4 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
