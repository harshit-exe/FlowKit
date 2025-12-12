import { prisma } from "@/lib/prisma";

export interface WorkflowStatsOffsets {
    [workflowId: string]: {
        views?: number;
        downloads?: number;
        upvotes?: number;
        downvotes?: number;
        saves?: number;
    };
}

const SETTING_PREFIX = "workflow_stats_";

export async function getWorkflowStatsOffsets(workflowIds?: string[]): Promise<WorkflowStatsOffsets> {
    const whereClause = workflowIds
        ? { key: { in: workflowIds.map((id) => `${SETTING_PREFIX}${id}`) } }
        : { key: { startsWith: SETTING_PREFIX } };

    const settings = await prisma.systemSetting.findMany({
        where: whereClause,
    });

    const offsets: WorkflowStatsOffsets = {};

    settings.forEach((setting) => {
        try {
            const workflowId = setting.key.replace(SETTING_PREFIX, "");
            offsets[workflowId] = JSON.parse(setting.value);
        } catch (error) {
            console.error(`Failed to parse stats for ${setting.key}:`, error);
        }
    });

    return offsets;
}

export async function updateWorkflowStatsOffsets(
    workflowId: string,
    offsets: {
        views?: number;
        downloads?: number;
        upvotes?: number;
        downvotes?: number;
        saves?: number;
    }
) {
    // Fetch existing offsets for this specific workflow to merge
    const key = `${SETTING_PREFIX}${workflowId}`;
    const existingSetting = await prisma.systemSetting.findUnique({
        where: { key },
    });

    let currentWorkflowOffsets = {};
    if (existingSetting) {
        try {
            currentWorkflowOffsets = JSON.parse(existingSetting.value);
        } catch (e) {
            // ignore error
        }
    }

    const newWorkflowOffsets = {
        ...currentWorkflowOffsets,
        ...offsets,
    };

    await prisma.systemSetting.upsert({
        where: { key },
        update: { value: JSON.stringify(newWorkflowOffsets) },
        create: {
            key,
            value: JSON.stringify(newWorkflowOffsets),
            description: `Stats offsets for workflow ${workflowId}`,
        },
    });

    // Return the full map state (though we only updated one, the caller might expect the full map or just the updated one. 
    // The previous implementation returned the full map. 
    // For performance, we should probably just return the updated one, but let's stick to the interface if possible or update callers.
    // Actually, the previous return value was `newOffsets` (the full map). 
    // Let's check usage. `updateWorkflowStatsOffsetsAction` calls it but doesn't return the value to the client.
    // `SystemHealthMonitor` re-fetches via `getWorkflowRealStats`.
    // So we can just return the updated offsets for this workflow.
    return { [workflowId]: newWorkflowOffsets };
}

export async function applyStatsOffsetsToWorkflows<T extends { id: string; views: number; downloads: number }>(
    workflows: T[]
): Promise<T[]> {
    if (workflows.length === 0) return workflows;

    const ids = workflows.map((w) => w.id);
    const offsets = await getWorkflowStatsOffsets(ids);

    return workflows.map((workflow) => {
        const offset = offsets[workflow.id];
        if (!offset) return workflow;

        return {
            ...workflow,
            views: workflow.views + (offset.views || 0),
            downloads: workflow.downloads + (offset.downloads || 0),
            // We need to handle saves. If the workflow has a `saves` property or `_count.savedBy`, we should update it.
            // But `applyStatsOffsetsToWorkflows` is generic.
            // Let's defer this specific update until I verify the property name.
            // For now, I'll just add the property if it exists in the offset, but I need to know where to put it.
            ...(offset.saves !== undefined && (workflow as any)._count?.savedBy !== undefined && {
                _count: {
                    ...(workflow as any)._count,
                    savedBy: (workflow as any)._count.savedBy + offset.saves
                }
            }),
        };
    });
}
