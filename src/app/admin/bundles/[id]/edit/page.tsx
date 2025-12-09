import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BundleForm } from "@/components/admin/BundleForm"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function EditBundlePage({ params }: { params: { id: string } }) {
  const bundleData = await prisma.bundle.findUnique({
    where: { id: params.id },
    include: {
      workflows: {
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
              thumbnail: true,
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  })

  if (!bundleData) {
    notFound()
  }

  // Serialize dates for client component
  const bundle = {
    ...bundleData,
    createdAt: bundleData.createdAt.toISOString(),
    updatedAt: bundleData.updatedAt.toISOString(),
    publishedAt: bundleData.publishedAt?.toISOString() || null,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Edit Bundle</h1>
        <p className="text-muted-foreground mt-1">
          Update bundle: {bundle.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bundle Details</CardTitle>
        </CardHeader>
        <CardContent>
          <BundleForm bundle={bundle} />
        </CardContent>
      </Card>
    </div>
  )
}
