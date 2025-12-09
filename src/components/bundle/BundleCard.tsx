"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Package } from "lucide-react"
import { useState } from "react"

interface BundleCardProps {
  bundle: {
    id: string
    slug: string
    name: string
    description: string
    objective: string
    icon?: string | null
    thumbnail?: string | null
    color: string
    featured: boolean
    views: number
    _count: {
      workflows: number
    }
  }
}

export default function BundleCard({ bundle }: BundleCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <Link href={`/bundles/${bundle.slug}`}>
      <Card className="h-full hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-[#FF6B35]/50">
        {/* Thumbnail */}
        {bundle.thumbnail && !imageError ? (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted relative">
            <Image
              src={bundle.thumbnail}
              alt={bundle.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              loading="lazy"
              quality={85}
              onError={() => setImageError(true)}
            />
            {/* Featured Badge */}
            {bundle.featured && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-[#FF6B35] hover:bg-[#FF6B35] text-white border-0">
                  Featured
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted relative flex items-center justify-center">
            <Package className="h-16 w-16 text-gray-600" />
            {bundle.featured && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-[#FF6B35] hover:bg-[#FF6B35] text-white border-0">
                  Featured
                </Badge>
              </div>
            )}
          </div>
        )}

        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              {bundle.icon && <span className="text-2xl flex-shrink-0">{bundle.icon}</span>}
              <CardTitle className="text-lg line-clamp-1">{bundle.name}</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-gray-400 line-clamp-2">
            {bundle.objective}
          </p>

          {/* Workflow Count */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              <Package className="h-3 w-3 mr-1" />
              {bundle._count.workflows} Workflows
            </Badge>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {bundle.views}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Bundle
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
