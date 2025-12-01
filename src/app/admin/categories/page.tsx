import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { workflows: true },
      },
    },
    orderBy: { order: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-600 mt-1">Manage workflow categories</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-xs text-gray-500">{category.slug}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{category._count.workflows} workflows</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{category.description}</p>
                  <div
                    className="mt-2 h-1 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
