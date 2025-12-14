/**
 * Workflow Search API
 * GET /api/workflows/search?q={query}
 * Search workflows for adding to portfolio
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json({ workflows: [] });
        }

        const workflows = await prisma.workflow.findMany({
            where: {
                published: true,
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                name: true,
                description: true,
                slug: true,
                difficulty: true,
                nodeCount: true,
            },
            take: 10,
            orderBy: {
                views: 'desc',
            },
        });

        return NextResponse.json({ workflows });
    } catch (error) {
        console.error('Workflow search error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
