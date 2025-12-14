/**
 * Add Workflow to Portfolio API
 * POST /api/portfolio/workflows/add
 * Adds a workflow to user's portfolio
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

        const { workflowId, customTitle, customDesc, featured } = await req.json();

        if (!workflowId) {
            return NextResponse.json(
                { message: 'Workflow ID is required' },
                { status: 400 }
            );
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user?.email! },
            select: {
                id: true,
                portfolioEnabled: true,
                portfolioWorkflows: {
                    select: { id: true },
                },
            },
        });

        if (!user || !user.portfolioEnabled) {
            return NextResponse.json(
                { message: 'Portfolio not enabled' },
                { status: 400 }
            );
        }

        // Check if workflow exists
        const workflow = await prisma.workflow.findUnique({
            where: { id: workflowId },
            select: { id: true, published: true },
        });

        if (!workflow || !workflow.published) {
            return NextResponse.json(
                { message: 'Workflow not found or not published' },
                { status: 404 }
            );
        }

        // Check if already added
        const existing = await prisma.portfolioWorkflow.findFirst({
            where: {
                userId: user.id,
                workflowId,
            },
        });

        if (existing) {
            return NextResponse.json(
                { message: 'Workflow already in portfolio' },
                { status: 400 }
            );
        }

        // Add to portfolio
        const maxOrder = user.portfolioWorkflows.length;

        await prisma.portfolioWorkflow.create({
            data: {
                userId: user.id,
                workflowId,
                customTitle: customTitle || null,
                customDesc: customDesc || null,
                featured: featured || false,
                order: maxOrder,
            },
        });

        // Update user stats
        await prisma.user.update({
            where: { id: user.id },
            data: {
                totalWorkflows: {
                    increment: 1,
                },
            },
        });

        return NextResponse.json({
            message: 'Workflow added to portfolio successfully',
        });
    } catch (error) {
        console.error('Add workflow error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
