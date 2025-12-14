/**
 * Add User's Own Workflow to Portfolio
 * POST /api/portfolio/workflows/add-own
 * Creates a workflow from user's n8n JSON and adds to portfolio
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Difficulty } from '@prisma/client';

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        + '-' + Math.random().toString(36).substring(2, 8);
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { workflowJson, title, description, featured, extractedData } = await req.json();

        if (!workflowJson || !title || !description || !extractedData) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user?.email! },
            select: {
                id: true,
                name: true,
                username: true,
                portfolioEnabled: true,
                _count: {
                    select: {
                        portfolioWorkflows: true,
                    },
                },
            },
        });

        if (!user || !user.portfolioEnabled) {
            return NextResponse.json(
                { message: 'Portfolio not enabled' },
                { status: 400 }
            );
        }

        // Generate slug
        const slug = generateSlug(title);

        // Create workflow in database
        const workflow = await prisma.workflow.create({
            data: {
                slug,
                name: title,
                description: description,
                workflowJson: workflowJson,
                author: user.name || user.username || 'Anonymous',
                authorUrl: user.username ? `https://flowkit.in/u/${user.username}` : null,
                difficulty: (extractedData.difficulty || 'BEGINNER') as Difficulty,
                nodeCount: extractedData.nodeCount || 0,
                nodes: extractedData.nodes || [],
                credentialsRequired: extractedData.credentialsRequired || [],
                useCases: [],
                setupSteps: [],
                published: false, // User's own workflows are not published to main library
                featured: false,
                indiaBadge: false,
            },
        });

        // Add to portfolio
        await prisma.portfolioWorkflow.create({
            data: {
                userId: user.id,
                workflowId: workflow.id,
                featured: featured || false,
                order: user._count.portfolioWorkflows,
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
            workflowId: workflow.id,
            slug: workflow.slug,
        });
    } catch (error) {
        console.error('Add own workflow error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
