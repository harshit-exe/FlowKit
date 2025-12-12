import { prisma } from "@/lib/prisma";

export interface WorkflowStatsOffsets {
    [workflowId: string]: {
        views?: number;
        downloads?: number;
        upvotes?: number;
        downvotes?: number;
    };
}

const SETTING_KEY = "workflow_stats_offsets";

export async function getWorkflowStatsOffsets(): Promise<WorkflowStatsOffsets> {
    const setting = await prisma.systemSetting.findUnique({
        where: { key: SETTING_KEY },
    });

    if (!setting) return {};

    try {
        return JSON.parse(setting.value) as WorkflowStatsOffsets;
    } catch (error) {
        console.error("Failed to parse workflow stats offsets:", error);
        return {};
    }
}

export async function updateWorkflowStatsOffsets(
    workflowId: string,
    offsets: {
        views?: number;
        downloads?: number;
        upvotes?: number;
        downvotes?: number;
    }
) {
    const currentOffsets = await getWorkflowStatsOffsets();

    const newOffsets = {
        ...currentOffsets,
        [workflowId]: {
            ...currentOffsets[workflowId],
            ...offsets,
        },
    };

    await prisma.systemSetting.upsert({
        where: { key: SETTING_KEY },
        update: { value: JSON.stringify(newOffsets) },
        create: {
            key: SETTING_KEY,
            value: JSON.stringify(newOffsets),
            description: "Offsets for workflow statistics (views, downloads, votes)",
        },
    });

    return newOffsets;
}
