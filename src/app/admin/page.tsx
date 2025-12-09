import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { Workflow as WorkflowIcon, Eye, Download, FolderOpen, Package } from "lucide-react"

export default async function AdminDashboard() {
  // Fetch statistics
  const [totalWorkflows, totalDownloads, totalViews, totalCategories, totalBundles] = await Promise.all([
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

  const stats = [
    {
      name: "Total Workflows",
      value: totalWorkflows,
      icon: WorkflowIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      name: "Bundles",
      value: totalBundles,
      icon: Package,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
    {
      name: "Total Views",
      value: totalViews._sum.views || 0,
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: "Total Downloads",
      value: totalDownloads._sum.downloads || 0,
      icon: Download,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      name: "Categories",
      value: totalCategories,
      icon: FolderOpen,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-white mt-1">Welcome to FlowKit admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-100">
                  {stat.name}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Workflows */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          {recentWorkflows.length === 0 ? (
            <p className="text-center text-gray-100 py-8">
              No workflows yet. Create your first workflow!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Views</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Downloads</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentWorkflows.map((workflow) => (
                    <tr key={workflow.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{workflow.name}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            workflow.published
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {workflow.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="py-3 px-4">{workflow.views}</td>
                      <td className="py-3 px-4">{workflow.downloads}</td>
                      <td className="py-3 px-4 text-gray-100">
                        {new Date(workflow.createdAt).toLocaleDateString()}
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
  )
}
