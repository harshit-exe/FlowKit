/**
 * Admin API - Award Badge
 * POST /api/admin/portfolios/badge
 * Award custom badges to users
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BadgeType } from '@prisma/client';

const BADGE_CONFIG: Record<string, { title: string; description: string; icon: string; color: string }> = {
    TOP_CONTRIBUTOR: {
        title: 'Top Contributor',
        description: 'Outstanding contribution to the community',
        icon: '🏆',
        color: '#FFD700',
    },
    EXPERT_LEVEL: {
        title: 'Expert Level',
        description: 'Achieved expert status in workflow creation',
        icon: '⭐',
        color: '#FF6B6B',
    },
    COMMUNITY_FAVORITE: {
        title: 'Community Favorite',
        description: 'Loved by the community',
        icon: '❤️',
        color: '#FF69B4',
    },
    DOWNLOAD_CHAMPION: {
        title: 'Download Champion',
        description: 'Workflows downloaded over 1000 times',
        icon: '📥',
        color: '#4CAF50',
    },
    EARLY_ADOPTER: {
        title: 'Early Adopter',
        description: 'One of the first portfolio creators',
        icon: '🚀',
        color: '#2196F3',
    },
    RISING_STAR: {
        title: 'Rising Star',
        description: 'Fast-growing portfolio',
        icon: '✨',
        color: '#FFC107',
    },
};

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Check admin auth
        if (!session || ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'SUPER_ADMIN')) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { userId, badgeType } = await req.json();

        if (!userId || !badgeType || !BADGE_CONFIG[badgeType]) {
            return NextResponse.json(
                { message: 'Invalid parameters' },
                { status: 400 }
            );
        }

        // Check if badge already exists
        const existingBadge = await prisma.userBadge.findFirst({
            where: {
                userId,
                badgeType: badgeType as BadgeType,
            },
        });

        if (existingBadge) {
            return NextResponse.json(
                { message: 'User already has this badge' },
                { status: 400 }
            );
        }

        // Award badge
        const config = BADGE_CONFIG[badgeType];
        await prisma.userBadge.create({
            data: {
                userId,
                badgeType: badgeType as BadgeType,
                title: config.title,
                description: config.description,
                icon: config.icon,
                color: config.color,
            },
        });

        return NextResponse.json({
            message: 'Badge awarded successfully',
        });
    } catch (error) {
        console.error('Award badge error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
