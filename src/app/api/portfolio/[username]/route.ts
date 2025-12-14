/**
 * Public Portfolio API
 * GET /api/portfolio/[username]
 * Fetch public portfolio data for a user
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: { username: string } }
) {
    try {
        const { username } = params;

        if (!username) {
            return NextResponse.json(
                { message: 'Username is required' },
                { status: 400 }
            );
        }

        // Fetch user with all portfolio data
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                name: true,
                username: true,
                bio: true,
                image: true,
                location: true,
                websiteUrl: true,
                linkedinUrl: true,
                twitterHandle: true,
                githubUrl: true,
                portfolioEnabled: true,
                portfolioTheme: true,
                totalWorkflows: true,
                totalViews: true,
                totalDownloads: true,
                communityRating: true,
                createdAt: true,

                // Badges
                badges: {
                    select: {
                        id: true,
                        badgeType: true,
                        title: true,
                        description: true,
                        icon: true,
                        color: true,
                        earnedAt: true,
                    },
                    orderBy: {
                        earnedAt: 'desc',
                    },
                },

                // Portfolio workflows
                portfolioWorkflows: {
                    include: {
                        workflow: {
                            select: {
                                id: true,
                                slug: true,
                                name: true,
                                description: true,
                                icon: true,
                                thumbnail: true,
                                difficulty: true,
                                nodeCount: true,
                                views: true,
                                downloads: true,
                                useCases: true,
                                nodes: true,
                                createdAt: true,
                                published: true,
                            },
                        },
                    },
                    where: {
                        workflow: {
                            published: true,
                        },
                    },
                    orderBy: [
                        { featured: 'desc' },
                        { order: 'asc' },
                        { createdAt: 'desc' },
                    ],
                },

                // Client reviews (approved only)
                receivedReviews: {
                    where: {
                        approved: true,
                    },
                    select: {
                        id: true,
                        clientName: true,
                        clientCompany: true,
                        clientRole: true,
                        clientAvatar: true,
                        rating: true,
                        reviewText: true,
                        projectType: true,
                        verified: true,
                        featured: true,
                        createdAt: true,
                    },
                    orderBy: [
                        { featured: 'desc' },
                        { createdAt: 'desc' },
                    ],
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { message: 'Portfolio not found' },
                { status: 404 }
            );
        }

        // Check if portfolio is enabled
        if (!user.portfolioEnabled) {
            return NextResponse.json(
                { message: 'Portfolio is not public' },
                { status: 403 }
            );
        }

        // Update view count (async, don't wait)
        prisma.user.update({
            where: { id: user.id },
            data: {
                totalViews: {
                    increment: 1,
                },
            },
        }).catch((error) => {
            console.error('Error updating portfolio views:', error);
        });

        return NextResponse.json({
            portfolio: user,
        });
    } catch (error) {
        console.error('Portfolio fetch error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
