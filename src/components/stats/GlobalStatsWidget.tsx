"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, Download, Workflow, Users, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface GlobalStats {
  totalWorkflows: number
  totalDownloads: number
  totalViews: number
  activeUsers: number
  topCategories: Array<{ name: string; count: number }>
  trendingWorkflows: Array<{
    id: string
    name: string
    slug: string
    views: number
    downloads: number
  }>
}

interface GlobalStatsWidgetProps {
  className?: string
  variant?: "compact" | "full"
}

export default function GlobalStatsWidget({
  className,
  variant = "full",
}: GlobalStatsWidgetProps) {
  const [stats, setStats] = useState<GlobalStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats/global")
      if (!response.ok) throw new Error("Failed to fetch stats")
      
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch global stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className={cn("border-2 font-mono animate-pulse", className)}>
        <CardContent className="p-6">
          <div className="h-20 bg-muted/30 rounded" />
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const statItems = [
    {
      icon: Workflow,
      label: "Workflows",
      value: stats.totalWorkflows,
      color: "text-primary",
    },
    {
      icon: Download,
      label: "Downloads",
      value: stats.totalDownloads.toLocaleString(),
      color: "text-green-500",
    },
    {
      icon: Eye,
      label: "Views",
      value: stats.totalViews.toLocaleString(),
      color: "text-blue-500",
    },
    {
      icon: Users,
      label: "Users",
      value: stats.activeUsers.toLocaleString(),
      color: "text-purple-500",
    },
  ]

  if (variant === "compact") {
    return (
      <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
        {statItems.map((item) => (
          <Card key={item.label} className="border-2 font-mono">
            <CardContent className="p-4 flex items-center gap-3">
              <item.icon className={cn("h-5 w-5", item.color)} />
              <div>
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="text-xs text-muted-foreground uppercase">
                  {item.label}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <Card className={cn("border-2 font-mono", className)}>
      <CardContent className="p-6 space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center p-4 bg-muted/30 border-2 border-border space-y-2"
            >
              <item.icon className={cn("h-8 w-8", item.color)} />
              <div className="text-3xl font-bold text-foreground">
                {item.value}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Trending Section */}
        {stats.trendingWorkflows.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
              <TrendingUp className="h-4 w-4 text-primary" />
              Trending This Week
            </div>
            <div className="space-y-2">
              {stats.trendingWorkflows.slice(0, 3).map((workflow, index) => (
                <a
                  key={workflow.id}
                  href={`/workflows/${workflow.slug}`}
                  className="flex items-center justify-between p-3 bg-muted/20 border border-border hover:border-primary transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary">
                      #{index + 1}
                    </span>
                    <span className="text-sm group-hover:text-primary transition-colors line-clamp-1">
                      {workflow.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {workflow.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {workflow.downloads}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Top Categories */}
        {stats.topCategories.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="text-sm font-bold uppercase tracking-wider">
              Popular Categories
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.topCategories.slice(0, 5).map((category) => (
                <div
                  key={category.name}
                  className="px-3 py-1 bg-muted/30 border border-border text-xs font-mono"
                >
                  {category.name} ({category.count})
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
