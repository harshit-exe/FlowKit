/**
 * Admin API - Review Approval
 * POST /api/admin/portfolios/review
 * Approve or reject client reviews
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

        const { reviewId, action } = await req.json();

        if (!reviewId || !action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { message: 'Invalid parameters' },
                { status: 400 }
            );
        }

        if (action === 'approve') {
            // Approve the review
            await prisma.clientReview.update({
                where: { id: reviewId },
                data: { approved: true },
            });

            return NextResponse.json({
                message: 'Review approved successfully',
            });
        } else {
            // Delete the review (reject)
            await prisma.clientReview.delete({
                where: { id: reviewId },
            });

            return NextResponse.json({
                message: 'Review rejected and deleted',
            });
        }
    } catch (error) {
        console.error('Review approval error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
