import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { getWorkflowStatsOffsets, applyStatsOffsetsToWorkflows } from "@/lib/stats"
import { Workflow as WorkflowIcon, Eye, Download, FolderOpen, Package, Clock, Users, ArrowUpRight, Activity } from "lucide-react"

export default async function AdminDashboard() {
  // Fetch statistics
  const [totalWorkflows, totalDownloads, totalViews, totalCategories, totalBundles, pendingUsers, waitlistCount, totalUpvotes, totalDownvotes, registeredUsers] = await Promise.all([
    prisma.workflow.count(),
    prisma.workflow.aggregate({
      _sum: {
        downloads: true,
      },
    }),
    prisma.workflow.aggregate({
      _sum: {
        views: true,
      },
    }),
    prisma.category.count(),
    prisma.bundle.count(),
    prisma.waitlist.count({
      where: { hasAccessed: false },
    }),
    prisma.waitlist.count(),
    prisma.vote.count({ where: { type: "UPVOTE" } }),
    prisma.vote.count({ where: { type: "DOWNVOTE" } }),
    prisma.user.count(),
  ])

  // Fetch recent workflows
  const recentWorkflows = await prisma.workflow.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      published: true,
      views: true,
      downloads: true,
    },
  })

  // Fetch and calculate offsets
  const offsets = await getWorkflowStatsOffsets();
  let totalViewsOffset = 0;
  let totalDownloadsOffset = 0;
  let totalUpvotesOffset = 0;
  let totalDownvotesOffset = 0;

  Object.values(offsets).forEach(offset => {
    totalViewsOffset += offset.views || 0;
    totalDownloadsOffset += offset.downloads || 0;
    totalUpvotesOffset += offset.upvotes || 0;
    totalDownvotesOffset += offset.downvotes || 0;
  });

  // Calculate daily offsets (approx 1% of total offset for realism)
  const dailyViewsOffset = Math.floor(totalViewsOffset * 0.01) + 12;
  const dailyDownloadsOffset = Math.floor(totalDownloadsOffset * 0.01) + 5;

  // Apply offsets to recent workflows
  const recentWorkflowsWithOffsets = await applyStatsOffsetsToWorkflows(recentWorkflows);

  const stats = [
    {
      name: "Total Users",
      value: waitlistCount + registeredUsers,
      icon: Users,
      description: "Total Waitlist + Registered Users",
      gradient: "from-blue-500/20 via-blue-500/10 to-transparent",
      borderColor: "border-blue-500/50",
      iconColor: "text-blue-500",
    },
    {
      name: "Engagement",
      value: "Votes", // Placeholder, will use custom render
      customValue: (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-green-500">
            <ArrowUpRight className="h-4 w-4" />
            <span className="text-2xl font-bold">{(totalUpvotes + totalUpvotesOffset).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-red-500">
            <ArrowUpRight className="h-4 w-4 rotate-180" />
            <span className="text-2xl font-bold">{(totalDownvotes + totalDownvotesOffset).toLocaleString()}</span>
          </div>
        </div>
      ),
      icon: Activity,
      description: "Total Upvotes & Downvotes",
      gradient: "from-orange-500/20 via-orange-500/10 to-transparent",
      borderColor: "border-orange-500/50",
      iconColor: "text-orange-500",
    },
    {
      name: "Total Workflows",
      value: totalWorkflows,
      icon: WorkflowIcon,
      description: "Published & Drafts",
      gradient: "from-primary/20 via-primary/10 to-transparent",
      borderColor: "border-primary/50",
      iconColor: "text-primary",
    },
    {
      name: "Total Views",
      value: (totalViews._sum.views || 0) + totalViewsOffset,
      icon: Eye,
      description: "All time page views",
      gradient: "from-green-500/20 via-green-500/10 to-transparent",
      borderColor: "border-green-500/50",
      iconColor: "text-green-500",
      change: `+${dailyViewsOffset.toLocaleString()} today`,
      changeType: "positive",
    },
    {
      name: "Total Downloads",
      value: (totalDownloads._sum.downloads || 0) + totalDownloadsOffset,
      icon: Download,
      description: "Workflow downloads",
      gradient: "from-purple-500/20 via-purple-500/10 to-transparent",
      borderColor: "border-purple-500/50",
      iconColor: "text-purple-500",
      change: `+${dailyDownloadsOffset.toLocaleString()} today`,
      changeType: "positive",
    },
    {
      name: "Bundles",
      value: totalBundles,
      icon: Package,
      description: "Curated collections",
      gradient: "from-pink-500/20 via-pink-500/10 to-transparent",
      borderColor: "border-pink-500/50",
      iconColor: "text-pink-500",
    },
  ]

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground font-mono mt-1">Overview of your platform's performance.</p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full border">
          <Activity className="h-4 w-4 text-green-500 animate-pulse" />
          <span className="text-xs font-mono font-medium">System Operational</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name} className={`relative overflow-hidden border-2 transition-all hover:shadow-lg ${stat.borderColor}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-medium font-mono text-muted-foreground uppercase tracking-wider">
                  {stat.name}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-background/80 backdrop-blur-sm border shadow-sm ${stat.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-baseline gap-2">
                  {(stat as any).customValue ? (
                    (stat as any).customValue
                  ) : (
                    <div className="text-4xl font-bold font-mono tracking-tighter">
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-mono mt-2 flex items-center gap-1">
                  {stat.description}
                  {(stat as any).change && (
                    <span className={`ml-2 font-bold ${(stat as any).changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                      {(stat as any).change}
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Workflows */}
      <div className="grid gap-6">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-mono text-xl">Recent Workflows</CardTitle>
              <CardDescription className="font-mono">Latest workflows added to the platform</CardDescription>
            </div>
            <div className="p-2 bg-muted rounded-full">
              <WorkflowIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {recentWorkflowsWithOffsets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/10">
                <WorkflowIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium font-mono">No workflows yet</p>
                <p className="text-sm text-muted-foreground font-mono">Create your first workflow to get started.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-mono text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                      <th className="text-left py-3 px-4 font-mono text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-4 font-mono text-xs font-medium text-muted-foreground uppercase tracking-wider">Views</th>
                      <th className="text-left py-3 px-4 font-mono text-xs font-medium text-muted-foreground uppercase tracking-wider">Downloads</th>
                      <th className="text-left py-3 px-4 font-mono text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                      <th className="text-right py-3 px-4 font-mono text-xs font-medium text-muted-foreground uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentWorkflowsWithOffsets.map((workflow) => (
                      <tr key={workflow.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-medium font-mono">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[200px]">{workflow.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              workflow.published
                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            }`}
                          >
                            {workflow.published ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-sm text-muted-foreground">{workflow.views.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono text-sm text-muted-foreground">{workflow.downloads.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono text-sm text-muted-foreground">
                          {new Date(workflow.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a 
                            href={`/workflows/${workflow.slug}`} 
                            target="_blank" 
                            className="inline-flex items-center justify-center p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </a>
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
    </div>
  )
}
