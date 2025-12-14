/**
 * Extract Workflow Metadata from n8n JSON
 * POST /api/portfolio/workflows/extract
 * Uses AI to extract metadata from n8n workflow JSON
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { workflowJson } = await req.json();

        if (!workflowJson || !workflowJson.nodes) {
            return NextResponse.json(
                { message: 'Invalid workflow JSON' },
                { status: 400 }
            );
        }

        // Extract metadata from n8n workflow JSON
        const nodes = workflowJson.nodes || [];
        const connections = workflowJson.connections || {};
        const name = workflowJson.name || 'Untitled Workflow';
        const nodeCount = nodes.length;
        const connectionCount = Object.keys(connections).length;

        // Determine difficulty based on node count and complexity
        let difficulty = 'BEGINNER';
        if (nodeCount > 15 || connectionCount > 10) {
            difficulty = 'ADVANCED';
        } else if (nodeCount > 8 || connectionCount > 5) {
            difficulty = 'INTERMEDIATE';
        }

        // Extract node types used
        const nodeTypes = nodes.map((node: any) => node.type).filter(Boolean);
        const uniqueNodeTypes = [...new Set(nodeTypes)];

        // Extract credentials required
        const credentialsRequired = uniqueNodeTypes
            .filter((type: string) =>
                !['n8n-nodes-base.start', 'n8n-nodes-base.noOp', 'n8n-nodes-base.set'].includes(type)
            )
            .map((type: string) => type.replace('n8n-nodes-base.', ''));

        return NextResponse.json({
            name,
            nodeCount,
            connectionCount,
            difficulty,
            nodes: uniqueNodeTypes,
            credentialsRequired,
            description: workflowJson.meta?.instanceId
                ? `n8n workflow with ${nodeCount} nodes`
                : name,
        });
    } catch (error) {
        console.error('Extract metadata error:', error);
        return NextResponse.json(
            { message: 'Failed to extract metadata' },
            { status: 500 }
        );
    }
}
