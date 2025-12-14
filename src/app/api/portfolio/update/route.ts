/**
 * Portfolio Update API
 * PUT /api/portfolio/update
 * Update user portfolio profile information
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { message: 'Unauthorized. Please log in.' },
                { status: 401 }
            );
        }

        const { bio, location, websiteUrl, linkedinUrl, twitterHandle, githubUrl, portfolioTheme } = await req.json();

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, portfolioEnabled: true },
        });

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        // Check if portfolio exists
        if (!user.portfolioEnabled) {
            return NextResponse.json(
                { message: 'Portfolio not set up. Please create a portfolio first.' },
                { status: 400 }
            );
        }

        // Update user portfolio fields
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                bio: bio !== undefined ? bio : undefined,
                location: location !== undefined ? location : undefined,
                websiteUrl: websiteUrl !== undefined ? websiteUrl : undefined,
                linkedinUrl: linkedinUrl !== undefined ? linkedinUrl : undefined,
                twitterHandle: twitterHandle !== undefined ? twitterHandle : undefined,
                githubUrl: githubUrl !== undefined ? githubUrl : undefined,
                portfolioTheme: portfolioTheme !== undefined ? portfolioTheme : undefined,
            },
            select: {
                id: true,
                username: true,
                bio: true,
                location: true,
                websiteUrl: true,
                linkedinUrl: true,
                twitterHandle: true,
                githubUrl: true,
                portfolioTheme: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Portfolio updated successfully',
            portfolio: updatedUser,
        });
    } catch (error) {
        console.error('Portfolio update error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
