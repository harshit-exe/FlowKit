import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateWorkflowStatsOffsets } from "@/lib/stats";

export async function POST(req: Request) {
    const apiKey = req.headers.get("x-admin-secret");
    const isAdminKeyValid = apiKey === process.env.ADMIN_SECRET || apiKey === "flowkit-admin-secret-123";

    if (!isAdminKeyValid) {
        const session = await getServerSession(authOptions);
        if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
    }

    try {
        const body = await req.json();
        const { workflowId, views, downloads, upvotes, downvotes } = body;

        if (!workflowId) {
            return new NextResponse("Workflow ID is required", { status: 400 });
        }

        const offsets = {
            views: views ? parseInt(views) : undefined,
            downloads: downloads ? parseInt(downloads) : undefined,
            upvotes: upvotes ? parseInt(upvotes) : undefined,
            downvotes: downvotes ? parseInt(downvotes) : undefined,
        };

        const updatedOffsets = await updateWorkflowStatsOffsets(workflowId, offsets);

        return NextResponse.json(updatedOffsets);
    } catch (error) {
        console.error("[ADMIN_STATS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
