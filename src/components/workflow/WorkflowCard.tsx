import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Download } from "lucide-react"
import { WorkflowWithRelations } from "@/types"

interface WorkflowCardProps {
  workflow: WorkflowWithRelations
}

export default function WorkflowCard({ workflow }: WorkflowCardProps) {
  return (
    <Link href={`/workflows/${workflow.slug}`}>
      <Card className="h-full hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-[#FF6B35]/50">
        {/* Thumbnail */}
        {workflow.thumbnail && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img
              src={workflow.thumbnail}
              alt={workflow.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              {workflow.icon && <span className="text-2xl flex-shrink-0">{workflow.icon}</span>}
              <CardTitle className="text-lg line-clamp-1">{workflow.name}</CardTitle>
            </div>
            {workflow.indiaBadge && <span className="text-xl flex-shrink-0">🇮🇳</span>}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2">{workflow.description}</p>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
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

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {workflow.views}
              </span>
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {workflow.downloads}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {workflow.difficulty}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
