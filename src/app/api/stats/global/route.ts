import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/stats/global - Fetch global platform statistics
export async function GET() {
    try {
        // Fetch all statistics in parallel for better performance
        const [
            totalWorkflows,
            downloadStats,
            viewStats,
            activeUsers,
            topCategories,
            trendingWorkflows,
        ] = await Promise.all([
            // Total published workflows
            prisma.workflow.count({
                where: { published: true },
            }),

            // Total downloads
            prisma.workflow.aggregate({
                _sum: {
                    downloads: true,
                },
                where: { published: true },
            }),

            // Total views
            prisma.workflow.aggregate({
                _sum: {
                    views: true,
                },
                where: { published: true },
            }),

            // Active users (waitlist count)
            prisma.waitlist.count(),

            // Top 5 categories by workflow count
            prisma.category.findMany({
                select: {
                    name: true,
                    _count: {
                        select: {
                            workflows: true,
                        },
                    },
                },
                orderBy: {
                    workflows: {
                        _count: "desc",
                    },
                },
                take: 5,
            }),

            // Trending workflows (last 7 days, sorted by views + downloads)
            prisma.workflow.findMany({
                where: {
                    published: true,
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                    },
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    views: true,
                    downloads: true,
                },
                orderBy: [
                    { downloads: "desc" },
                    { views: "desc" },
                ],
                take: 5,
            }),
        ])

        // Format top categories
        const formattedCategories = topCategories.map((cat) => ({
            name: cat.name,
            count: cat._count.workflows,
        }))

        return NextResponse.json({
            totalWorkflows,
            totalDownloads: downloadStats._sum.downloads || 0,
            totalViews: viewStats._sum.views || 0,
            activeUsers,
            topCategories: formattedCategories,
            trendingWorkflows,
        })
    } catch (error) {
        console.error("[GLOBAL_STATS]", error)
        return NextResponse.json(
            { error: "Failed to fetch global statistics" },
            { status: 500 }
        )
    }
}
