"use server";

import { prisma } from "@/lib/prisma";
import { updateWorkflowStatsOffsets, getWorkflowStatsOffsets } from "@/lib/stats";
import { revalidatePath } from "next/cache";

export async function updateWorkflowStatsOffsetsAction(
    workflowId: string,
    offsets: {
        views?: number;
        downloads?: number;
        upvotes?: number;
        downvotes?: number;
    }
) {
    await updateWorkflowStatsOffsets(workflowId, offsets);
    revalidatePath("/workflows/[slug]", "page");
    revalidatePath("/admin/workflows");
}

export async function getWorkflowRealStats(workflowId: string) {
    const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
        include: {
            votes: {
                select: { type: true },
            },
        },
    });

    if (!workflow) {
        throw new Error("Workflow not found");
    }

    const upvotes = workflow.votes.filter((v: { type: string }) => v.type === "UPVOTE").length;
    const downvotes = workflow.votes.filter((v: { type: string }) => v.type === "DOWNVOTE").length;

    const offsets = await getWorkflowStatsOffsets([workflowId]);
    const currentOffsets = offsets[workflowId] || {
        views: 0,
        downloads: 0,
        upvotes: 0,
        downvotes: 0,
    };

    return {
        real: {
            views: workflow.views,
            downloads: workflow.downloads,
            upvotes,
            downvotes,
        },
        offsets: currentOffsets,
    };
}
