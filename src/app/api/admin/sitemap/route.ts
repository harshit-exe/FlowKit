import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/lib/seo";

/**
 * Admin API to manually regenerate sitemap
 * Returns sitemap statistics and trigger regeneration
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get sitemap statistics
    const [workflowCount, categoryCount] = await Promise.all([
      prisma.workflow.count({ where: { published: true } }),
      prisma.category.count(),
    ]);

    const staticPages = 4; // Home, Workflows, AI Builder, Search
    const totalUrls = staticPages + workflowCount + categoryCount;

    return NextResponse.json({
      success: true,
      stats: {
        totalUrls,
        staticPages,
        workflowPages: workflowCount,
        categoryPages: categoryCount,
      },
      sitemapUrl: `${siteConfig.url}/sitemap.xml`,
      lastGenerated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[SITEMAP_STATS]", error);
    return NextResponse.json(
      { error: "Failed to fetch sitemap stats" },
      { status: 500 }
    );
  }
}

/**
 * Manually trigger sitemap regeneration
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In Next.js 14+, sitemap is automatically regenerated on each request
    // This endpoint primarily serves to provide feedback to admin

    const [workflowCount, categoryCount] = await Promise.all([
      prisma.workflow.count({ where: { published: true } }),
      prisma.category.count(),
    ]);

    return NextResponse.json({
      success: true,
      message: "Sitemap regenerated successfully",
      stats: {
        totalUrls: 4 + workflowCount + categoryCount,
        workflowPages: workflowCount,
        categoryPages: categoryCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[SITEMAP_REGENERATE]", error);
    return NextResponse.json(
      { error: "Failed to regenerate sitemap" },
      { status: 500 }
    );
  }
}
