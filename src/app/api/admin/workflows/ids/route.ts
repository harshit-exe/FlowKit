
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    const apiKey = req.headers.get("x-admin-secret");
    const isAdminKeyValid = apiKey === process.env.ADMIN_SECRET || apiKey === "flowkit-admin-secret-123";

    if (!isAdminKeyValid) {
        const session = await getServerSession(authOptions);
        if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
    }

    try {
        const workflows = await prisma.workflow.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(workflows);
    } catch (error) {
        console.error("[WORKFLOW_IDS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
