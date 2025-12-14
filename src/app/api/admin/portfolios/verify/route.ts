/**
 * Admin API - Verify Creator
 * POST /api/admin/portfolios/verify
 * Awards VERIFIED_CREATOR badge to a user
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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

        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { message: 'User ID is required' },
                { status: 400 }
            );
        }

        // Check if badge already exists
        const existingBadge = await prisma.userBadge.findFirst({
            where: {
                userId,
                badgeType: 'VERIFIED_CREATOR',
            },
        });

        if (existingBadge) {
            return NextResponse.json(
                { message: 'User is already verified' },
                { status: 400 }
            );
        }

        // Award VERIFIED_CREATOR badge
        await prisma.userBadge.create({
            data: {
                userId,
                badgeType: 'VERIFIED_CREATOR',
                title: 'Verified Creator',
                description: 'Verified n8n workflow creator',
                icon: '✓',
                color: '#3B82F6',
            },
        });

        return NextResponse.json({
            message: 'Creator verified successfully',
        });
    } catch (error) {
        console.error('Verify creator error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
