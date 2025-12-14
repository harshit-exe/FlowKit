/**
 * Admin Portfolio Management
 * Route: /admin/portfolios
 * 
 * Features:
 * - View all portfolios in bento grid layout
 * - Verify creators (award VERIFIED_CREATOR badge)
 * - Approve/reject client reviews
 * - Award custom badges to users
 * - Stats overview
 */

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sparkles,
  User,
  Award,
  MessageSquare,
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import { VerifyCreatorButton } from '@/components/admin/VerifyCreatorButton';
import { ReviewApprovalButtons } from '@/components/admin/ReviewApprovalButtons';
import { AwardBadgeButton } from '@/components/admin/AwardBadgeButton';

export default async function AdminPortfoliosPage() {
  // Fetch all users with portfolios
  const portfolioUsers = await prisma.user.findMany({
    where: {
      portfolioEnabled: true,
    },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      image: true,
      totalWorkflows: true,
      totalViews: true,
      totalDownloads: true,
      communityRating: true,
      createdAt: true,
      badges: {
        select: {
          id: true,
          badgeType: true,
          title: true,
          icon: true,
          color: true,
        },
      },
      portfolioWorkflows: {
        select: {
          id: true,
        },
      },
      receivedReviews: {
        where: {
          approved: false,
        },
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Get pending reviews for approval
  const pendingReviews = await prisma.clientReview.findMany({
    where: {
      approved: false,
    },
    include: {
      receiver: {
        select: {
          name: true,
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Calculate stats
  const stats = {
    totalPortfolios: portfolioUsers.length,
    totalWorkflows: portfolioUsers.reduce((sum, u) => sum + u.totalWorkflows, 0),
    totalViews: portfolioUsers.reduce((sum, u) => sum + u.totalViews, 0),
    pendingReviews: pendingReviews.length,
    verifiedCreators: portfolioUsers.filter((u) =>
      u.badges.some((b) => b.badgeType === 'VERIFIED_CREATOR')
    ).length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          Portfolio Management
        </h1>
        <p className="text-muted-foreground">
          Manage user portfolios, verify creators, approve reviews, and award badges
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Total Portfolios
                </p>
                <p className="text-2xl font-bold">{stats.totalPortfolios}</p>
              </div>
              <User className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Verified Creators
                </p>
                <p className="text-2xl font-bold">{stats.verifiedCreators}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Total Workflows
                </p>
                <p className="text-2xl font-bold">{stats.totalWorkflows}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Total Views
                </p>
                <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Pending Reviews
                </p>
                <p className="text-2xl font-bold text-orange-500">{stats.pendingReviews}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reviews Section */}
      {pendingReviews.length > 0 && (
        <Card className="border-orange-500/30">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              Pending Review Approvals ({pendingReviews.length})
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pendingReviews.map((review) => (
                <div
                  key={review.id}
                  className="border rounded-lg p-4 flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{review.clientName}</span>
                      {review.verified && (
                        <Badge variant="secondary" className="text-xs">
                          VERIFIED EMAIL
                        </Badge>
                      )}
                      <span className="text-muted-foreground text-sm">
                        for{' '}
                        <Link
                          href={`/u/${review.receiver.username}`}
                          className="text-primary hover:underline"
                          target="_blank"
                        >
                          @{review.receiver.username}
                        </Link>
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2 italic">
                      "{review.reviewText}"
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Rating: {review.rating}/5 ⭐</span>
                      {review.clientCompany && (
                        <span>Company: {review.clientCompany}</span>
                      )}
                      {review.projectType && <span>Project: {review.projectType}</span>}
                    </div>
                  </div>

                  <ReviewApprovalButtons reviewId={review.id} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolios Grid - Bento Layout */}
      <div>
        <h2 className="text-2xl font-bold mb-4">All Portfolios</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolioUsers.map((user) => {
            const isVerified = user.badges.some((b) => b.badgeType === 'VERIFIED_CREATOR');

            return (
              <Card
                key={user.id}
                className="border-2 hover:border-primary transition-colors overflow-hidden"
              >
                <CardContent className="p-6">
                  {/* User Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 border-2 border-primary bg-primary/10 overflow-hidden relative shrink-0">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || user.username!}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary">
                          {(user.name || user.username)!.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {isVerified && (
                        <div
                          className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5 border-2 border-background"
                          title="Verified Creator"
                        >
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">
                        {user.name || user.username}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        @{user.username}
                      </p>
                      {user.bio && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="bg-muted/30 rounded p-2">
                      <div className="text-lg font-bold text-primary">
                        {user.totalWorkflows}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase">
                        Workflows
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded p-2">
                      <div className="text-lg font-bold">{user.totalViews}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">
                        Views
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded p-2">
                      <div className="text-lg font-bold">
                        {user.badges.length}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase">
                        Badges
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  {user.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {user.badges.slice(0, 3).map((badge) => (
                        <div
                          key={badge.id}
                          className="border px-2 py-1 text-xs flex items-center gap-1"
                          style={{ borderColor: badge.color }}
                          title={badge.title}
                        >
                          <span>{badge.icon}</span>
                        </div>
                      ))}
                      {user.badges.length > 3 && (
                        <div className="border px-2 py-1 text-xs text-muted-foreground">
                          +{user.badges.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pending Reviews Badge */}
                  {user.receivedReviews.length > 0 && (
                    <Badge variant="outline" className="mb-4 border-orange-500 text-orange-500">
                      {user.receivedReviews.length} Pending Review
                      {user.receivedReviews.length !== 1 ? 's' : ''}
                    </Badge>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Link
                        href={`/u/${user.username}`}
                        target="_blank"
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Portfolio
                        </Button>
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {!isVerified && (
                        <VerifyCreatorButton userId={user.id} />
                      )}
                      <AwardBadgeButton userId={user.id} userName={user.name || user.username!} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {portfolioUsers.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-bold mb-2">No Portfolios Yet</h3>
              <p className="text-muted-foreground">
                Portfolios will appear here once users create them
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
