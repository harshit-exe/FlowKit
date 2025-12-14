/**
 * Portfolio Setup API
 * POST /api/portfolio/setup
 * Initialize user portfolio with username and basic settings
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateUsername, isUsernameAvailable, checkAndAwardBadges } from '@/lib/portfolio';

export async function POST(req: Request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { message: 'Unauthorized. Please log in.' },
                { status: 401 }
            );
        }

        const { username, bio, location, websiteUrl, linkedinUrl, twitterHandle, githubUrl, portfolioTheme } = await req.json();

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, username: true, portfolioEnabled: true },
        });

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        // Check if portfolio already exists
        if (user.portfolioEnabled && user.username) {
            return NextResponse.json(
                { message: 'Portfolio already exists' },
                { status: 400 }
            );
        }

        // Validate username if provided
        if (username) {
            if (username.length < 3 || username.length > 30) {
                return NextResponse.json(
                    { message: 'Username must be between 3 and 30 characters' },
                    { status: 400 }
                );
            }

            if (!/^[a-z0-9_]+$/.test(username)) {
                return NextResponse.json(
                    { message: 'Username can only contain lowercase letters, numbers, and underscores' },
                    { status: 400 }
                );
            }

            const available = await isUsernameAvailable(username);
            if (!available) {
                return NextResponse.json(
                    { message: 'Username already taken' },
                    { status: 400 }
                );
            }
        } else {
            return NextResponse.json(
                { message: 'Username is required' },
                { status: 400 }
            );
        }

        // Update user with portfolio fields
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                username,
                bio: bio || null,
                location: location || null,
                websiteUrl: websiteUrl || null,
                linkedinUrl: linkedinUrl || null,
                twitterHandle: twitterHandle || null,
                githubUrl: githubUrl || null,
                portfolioEnabled: true,
                portfolioTheme: portfolioTheme || 'default',
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
                portfolioEnabled: true,
                portfolioTheme: true,
            },
        });

        // Award RISING_STAR badge if eligible
        await checkAndAwardBadges(user.id);

        return NextResponse.json({
            success: true,
            message: 'Portfolio created successfully',
            portfolio: updatedUser,
        });
    } catch (error) {
        console.error('Portfolio setup error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
