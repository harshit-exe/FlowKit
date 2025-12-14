/**
 * Portfolio Utility Functions
 * Handles username generation, stats calculation, badge checking, and portfolio sharing
 */

import { prisma } from '@/lib/prisma';
import { BadgeType } from '@prisma/client';

// Types
export interface UserStats {
    totalWorkflows: number;
    totalViews: number;
    totalDownloads: number;
    communityRating: number;
}

export interface ShareMetadata {
    url: string;
    title: string;
    description: string;
    image: string;
}

/**
 * Generate username suggestions based on name and email
 * Returns array of available username options
 */
export async function generateUsername(
    name: string,
    email: string
): Promise<string[]> {
    const suggestions: string[] = [];

    // Clean the name (remove spaces, special chars, convert to lowercase)
    const cleanName = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);

    // Extract username part from email
    const emailUsername = email
        .split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);

    // Generate suggestions
    const baseSuggestions = [
        cleanName,
        emailUsername,
        `${cleanName}${Math.floor(Math.random() * 100)}`,
        `${emailUsername}${Math.floor(Math.random() * 100)}`,
        `${cleanName}_n8n`,
        `${emailUsername}_automation`,
    ];

    // Check availability for each suggestion
    for (const suggestion of baseSuggestions) {
        if (suggestion && suggestion.length >= 3) {
            const isAvailable = await isUsernameAvailable(suggestion);
            if (isAvailable) {
                suggestions.push(suggestion);
            }
        }

        // Return first 3 available suggestions
        if (suggestions.length >= 3) break;
    }

    // If no suggestions are available, generate random ones
    if (suggestions.length === 0) {
        for (let i = 0; i < 3; i++) {
            const randomUsername = `user${Math.random().toString(36).substring(2, 10)}`;
            suggestions.push(randomUsername);
        }
    }

    return suggestions;
}

/**
 * Check if a username is available
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
    try {
        // Username must be at least 3 characters and max 30
        if (username.length < 3 || username.length > 30) {
            return false;
        }

        // Username can only contain alphanumeric and underscores
        if (!/^[a-z0-9_]+$/.test(username)) {
            return false;
        }

        // Check if username already exists
        const existingUser = await prisma.user.findUnique({
            where: { username },
            select: { id: true },
        });

        return !existingUser;
    } catch (error) {
        console.error('Error checking username availability:', error);
        return false;
    }
}

/**
 * Calculate user portfolio stats from their workflows
 */
export async function calculateUserStats(userId: string): Promise<UserStats> {
    try {
        // Get all workflows in user's portfolio
        const portfolioWorkflows = await prisma.portfolioWorkflow.findMany({
            where: { userId },
            include: {
                workflow: {
                    select: {
                        views: true,
                        downloads: true,
                        votes: true,
                    },
                },
            },
        });

        let totalViews = 0;
        let totalDownloads = 0;
        let totalUpvotes = 0;
        let totalVotes = 0;

        for (const entry of portfolioWorkflows) {
            totalViews += entry.workflow.views;
            totalDownloads += entry.workflow.downloads;

            // Calculate upvotes
            const upvotes = entry.workflow.votes.filter(
                (v) => v.type === 'UPVOTE'
            ).length;
            const downvotes = entry.workflow.votes.filter(
                (v) => v.type === 'DOWNVOTE'
            ).length;

            totalUpvotes += upvotes;
            totalVotes += upvotes + downvotes;
        }

        // Calculate community rating (percentage of upvotes)
        const communityRating =
            totalVotes > 0 ? (totalUpvotes / totalVotes) * 5 : 0;

        return {
            totalWorkflows: portfolioWorkflows.length,
            totalViews,
            totalDownloads,
            communityRating: Math.round(communityRating * 10) / 10, // Round to 1 decimal
        };
    } catch (error) {
        console.error('Error calculating user stats:', error);
        return {
            totalWorkflows: 0,
            totalViews: 0,
            totalDownloads: 0,
            communityRating: 0,
        };
    }
}

/**
 * Check eligibility and auto-award badges to a user
 * Returns newly awarded badges
 */
export async function checkAndAwardBadges(userId: string): Promise<any[]> {
    try {
        const newBadges: any[] = [];

        // Get user's current badges
        const existingBadges = await prisma.userBadge.findMany({
            where: { userId },
            select: { badgeType: true },
        });

        const hasBadge = (type: BadgeType) =>
            existingBadges.some((b) => b.badgeType === type);

        // Calculate stats
        const stats = await calculateUserStats(userId);

        // Check TOP_CONTRIBUTOR (10+ workflows)
        if (stats.totalWorkflows >= 10 && !hasBadge('TOP_CONTRIBUTOR')) {
            const badge = await prisma.userBadge.create({
                data: {
                    userId,
                    badgeType: 'TOP_CONTRIBUTOR',
                    title: 'Top Contributor',
                    description: 'Published 10+ workflows to portfolio',
                    icon: '🏆',
                    color: '#10b981',
                },
            });
            newBadges.push(badge);
        }

        // Check EXPERT_LEVEL (50+ workflows)
        if (stats.totalWorkflows >= 50 && !hasBadge('EXPERT_LEVEL')) {
            const badge = await prisma.userBadge.create({
                data: {
                    userId,
                    badgeType: 'EXPERT_LEVEL',
                    title: 'Expert Level',
                    description: 'Published 50+ workflows to portfolio',
                    icon: '💎',
                    color: '#8b5cf6',
                },
            });
            newBadges.push(badge);
        }

        // Check DOWNLOAD_CHAMPION (1000+ downloads)
        if (stats.totalDownloads >= 1000 && !hasBadge('DOWNLOAD_CHAMPION')) {
            const badge = await prisma.userBadge.create({
                data: {
                    userId,
                    badgeType: 'DOWNLOAD_CHAMPION',
                    title: 'Download Champion',
                    description: '1000+ total workflow downloads',
                    icon: '⭐',
                    color: '#f59e0b',
                },
            });
            newBadges.push(badge);
        }

        // Check COMMUNITY_FAVORITE (100+ upvotes)
        const totalUpvotes = await prisma.vote.count({
            where: {
                type: 'UPVOTE',
                workflow: {
                    portfolioEntries: {
                        some: { userId },
                    },
                },
            },
        });

        if (totalUpvotes >= 100 && !hasBadge('COMMUNITY_FAVORITE')) {
            const badge = await prisma.userBadge.create({
                data: {
                    userId,
                    badgeType: 'COMMUNITY_FAVORITE',
                    title: 'Community Favorite',
                    description: '100+ upvotes across all workflows',
                    icon: '❤️',
                    color: '#ef4444',
                },
            });
            newBadges.push(badge);
        }

        // Check RISING_STAR (first 100 users with portfolios)
        if (!hasBadge('RISING_STAR')) {
            const portfolioUsersCount = await prisma.user.count({
                where: { portfolioEnabled: true },
            });

            if (portfolioUsersCount <= 100) {
                const badge = await prisma.userBadge.create({
                    data: {
                        userId,
                        badgeType: 'RISING_STAR',
                        title: 'Rising Star',
                        description: 'Among first 100 FlowKit creators',
                        icon: '🌟',
                        color: '#06b6d4',
                    },
                });
                newBadges.push(badge);
            }
        }

        return newBadges;
    } catch (error) {
        console.error('Error checking and awarding badges:', error);
        return [];
    }
}

/**
 * Generate share metadata for a portfolio
 */
export async function generateShareMetadata(
    username: string
): Promise<ShareMetadata | null> {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                name: true,
                bio: true,
                image: true,
                totalWorkflows: true,
            },
        });

        if (!user) return null;

        const baseUrl = process.env.NEXTAUTH_URL || 'https://flowkit.in';

        return {
            url: `${baseUrl}/u/${username}`,
            title: `${user.name || username}'s n8n Portfolio | FlowKit`,
            description:
                user.bio ||
                `Check out ${user.totalWorkflows} automation workflows by ${user.name || username} on FlowKit`,
            image: user.image || `${baseUrl}/og-image.png`,
        };
    } catch (error) {
        console.error('Error generating share metadata:', error);
        return null;
    }
}

/**
 * Generate QR code data URL for portfolio
 */
export async function generatePortfolioQR(username: string): Promise<string> {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://flowkit.in';
    const portfolioUrl = `${baseUrl}/u/${username}`;

    // Use a simple QR code API (you can replace with a library like 'qrcode')
    // For now, using Google Charts API as a quick solution
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(portfolioUrl)}`;

    return qrCodeUrl;
}
