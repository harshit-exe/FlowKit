import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { Plus } from "lucide-react"
import { BundlesList } from "@/components/admin/BundlesList"
import { Pagination } from "@/components/ui/pagination"

const ITEMS_PER_PAGE = 20

export default async function AdminBundlesPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const currentPage = Number(searchParams.page) || 1
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  // Fetch bundles with workflow count
  const [totalBundles, bundlesData] = await Promise.all([
    prisma.bundle.count(),
    prisma.bundle.findMany({
      take: ITEMS_PER_PAGE,
      skip: skip,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        objective: true,
        thumbnail: true,
        icon: true,
        color: true,
        featured: true,
        published: true,
        order: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            workflows: true,
          },
        },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
  ])

  // Serialize dates for client component
  const bundles = bundlesData.map((bundle) => ({
    ...bundle,
    createdAt: bundle.createdAt.toISOString(),
    updatedAt: bundle.updatedAt.toISOString(),
  }))

  const totalPages = Math.ceil(totalBundles / ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bundles</h1>
          <p className="text-muted-foreground mt-1">
            Manage workflow bundles & collections ({totalBundles} total)
          </p>
        </div>
        <Link href="/admin/bundles/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Bundle
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Bundles (Page {currentPage} of {totalPages || 1})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bundles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No bundles yet</p>
              <Link href="/admin/bundles/new">
                <Button>Create your first bundle</Button>
              </Link>
            </div>
          ) : (
            <>
              <BundlesList bundles={bundles} />

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  baseUrl="/admin/bundles"
                  totalItems={totalBundles}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
