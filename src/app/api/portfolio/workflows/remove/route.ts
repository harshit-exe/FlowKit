/**
 * Remove Workflow from Portfolio API
 * POST /api/portfolio/workflows/remove
 * Removes a workflow from user's portfolio
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { portfolioWorkflowId } = await req.json();

        if (!portfolioWorkflowId) {
            return NextResponse.json(
                { message: 'Portfolio workflow ID is required' },
                { status: 400 }
            );
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user?.email! },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        const portfolioWorkflow = await prisma.portfolioWorkflow.findUnique({
            where: { id: portfolioWorkflowId },
            select: { userId: true },
        });

        if (!portfolioWorkflow || portfolioWorkflow.userId !== user.id) {
            return NextResponse.json(
                { message: 'Not authorized to remove this workflow' },
                { status: 403 }
            );
        }

        // Remove from portfolio
        await prisma.portfolioWorkflow.delete({
            where: { id: portfolioWorkflowId },
        });

        // Update user stats
        await prisma.user.update({
            where: { id: user.id },
            data: {
                totalWorkflows: {
                    decrement: 1,
                },
            },
        });

        return NextResponse.json({
            message: 'Workflow removed from portfolio successfully',
        });
    } catch (error) {
        console.error('Remove workflow error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
