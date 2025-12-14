/**
 * Public User Portfolio Page
 * Route: /u/[username]
 * 
 * Displays a user's public portfolio with:
 * - Profile header (avatar, bio, stats, badges)
 * - Workflow showcase grid
 * - Client reviews carousel
 * - Social links and share options
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PortfolioShareButton } from '@/components/portfolio/PortfolioShareButton';
import {
  MapPin,
  Link as LinkIcon,
  Twitter,
  Github,
  Linkedin,
  Share2,
  Workflow,
  Download,
  Eye,
  Star,
  Sparkles,
} from 'lucide-react';

interface PageProps {
  params: {
    username: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = params;
  
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      name: true,
      bio: true,
      image: true,
      totalWorkflows: true,
      portfolioEnabled: true,
    },
  });

  if (!user || !user.portfolioEnabled) {
    return {
      title: 'Portfolio Not Found | FlowKit',
    };
  }

  return {
    title: `${user.name || username}'s Portfolio | FlowKit`,
    description:
      user.bio ||
      `Check out ${user.totalWorkflows} n8n automation workflows by ${user.name || username} on FlowKit`,
    openGraph: {
      title: `${user.name || username}'s Portfolio | FlowKit`,
      description:
        user.bio ||
        `Check out ${user.totalWorkflows} n8n workflows by ${user.name || username}`,
      images: user.image ? [user.image] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${user.name || username}'s Portfolio | FlowKit`,
      description:
        user.bio ||
        `${user.totalWorkflows} n8n automation workflows`,
    },
  };
}

export default async function UserPortfolioPage({ params }: PageProps) {
  const { username } = params;

  // Fetch user portfolio data
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

  // Handle not found or private portfolio
  if (!user || !user.portfolioEnabled) {
    notFound();
  }

  // Calculate average rating from reviews
  const avgRating =
    user.receivedReviews.length > 0
      ? user.receivedReviews.reduce((sum, review) => sum + review.rating, 0) /
        user.receivedReviews.length
      : 0;

  return (
    <div className="relative min-h-screen bg-black">
      {/* Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'url(/grid.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '112px 112px',
          opacity: 0.3,
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="border-2 bg-background/50 backdrop-blur-sm p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar */}
              <div className="shrink-0">
                <div className="w-32 h-32 border-2 border-primary bg-primary/10 overflow-hidden relative">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-primary">
                      {(user.name || username).charAt(0).toUpperCase()}
                    </div>
                  )}
                  {user.badges.some((b) => b.badgeType === 'VERIFIED_CREATOR') && (
                    <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-black"
                      title="Verified Creator"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-mono font-bold mb-1">
                      {user.name || username}
                    </h1>
                    <p className="text-sm font-mono text-muted-foreground">
                      @{username}
                    </p>
                  </div>

              <PortfolioShareButton 
                username={username}
                userName={user.name || username}
              />
            </div>

            {user.bio && (
                  <p className="text-muted-foreground font-mono mb-4 max-w-2xl">
                    {user.bio}
                  </p>
                )}

                {/* Location & Links */}
                <div className="flex flex-wrap items-center gap-4 mb-6 text-sm font-mono">
                  {user.location && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {user.location}
                    </div>
                  )}
                  {user.websiteUrl && (
                    <a
                      href={user.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Website
                    </a>
                  )}
                  {user.linkedinUrl && (
                    <a
                      href={user.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                  {user.twitterHandle && (
                    <a
                      href={`https://twitter.com/${user.twitterHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter
                    </a>
                  )}
                  {user.githubUrl && (
                    <a
                      href={user.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border-2 bg-background/30 p-3 text-center">
                    <div className="text-2xl font-bold font-mono text-primary">
                      {user.totalWorkflows}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                      WORKFLOWS
                    </div>
                  </div>
                  <div className="border-2 bg-background/30 p-3 text-center">
                    <div className="text-2xl font-bold font-mono">
                      {user.totalViews.toLocaleString()}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                      TOTAL VIEWS
                    </div>
                  </div>
                  <div className="border-2 bg-background/30 p-3 text-center">
                    <div className="text-2xl font-bold font-mono">
                      {user.totalDownloads.toLocaleString()}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                      DOWNLOADS
                    </div>
                  </div>
                  <div className="border-2 bg-background/30 p-3 text-center">
                    <div className="text-2xl font-bold font-mono flex items-center justify-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
                    </div>
                    <div className="text-xs font-mono text-muted-foreground">
                      AVG RATING
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Badges */}
            {user.badges.length > 0 && (
              <div className="mt-6 pt-6 border-t-2">
                <h3 className="text-sm font-mono font-bold mb-3">ACHIEVEMENTS</h3>
                <div className="flex flex-wrap gap-3">
                  {user.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="border-2 px-3 py-2 flex items-center gap-2 hover:scale-105 transition-transform group cursor-help"
                      style={{ borderColor: badge.color }}
                      title={badge.description}
                    >
                      <span className="text-xl">{badge.icon}</span>
                      <span
                        className="text-xs font-mono font-bold"
                        style={{ color: badge.color }}
                      >
                        {badge.title.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Workflows Section */}
        {user.portfolioWorkflows.length > 0 && (
          <div className="max-w-6xl mx-auto mb-12">
            <div className="mb-6">
              <h2 className="text-3xl font-mono font-bold mb-2">
                WORKFLOWS
              </h2>
              <p className="text-muted-foreground font-mono">
                Browse {user.portfolioWorkflows.length} automation{' '}
                {user.portfolioWorkflows.length === 1 ? 'workflow' : 'workflows'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.portfolioWorkflows.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/workflows/${entry.workflow.slug}`}
                  className="group block"
                >
                  <div className="border-2 bg-background/50 backdrop-blur-sm hover:border-primary transition-all duration-300 h-full flex flex-col">
                    {/* Icon/Thumbnail */}
                    <div className="aspect-video w-full border-b-2 flex items-center justify-center bg-muted/30">
                      {entry.workflow.thumbnail ? (
                        <img
                          src={entry.workflow.thumbnail}
                          alt={entry.workflow.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Workflow className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      {entry.featured && (
                        <Badge className="bg-primary/20 text-primary border-primary mb-2 w-fit">
                          FEATURED
                        </Badge>
                      )}
                      
                      <h3 className="font-mono font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {entry.customTitle || entry.workflow.name}
                      </h3>

                      <p
                        className="text-sm text-muted-foreground font-mono line-clamp-2 mb-4 flex-1"
                        dangerouslySetInnerHTML={{
                          __html: entry.customDesc || entry.workflow.description,
                        }}
                      />

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {entry.workflow.difficulty}
                        </Badge>
                        <Badge variant="outline" className="font-mono text-xs">
                          {entry.workflow.nodeCount} nodes
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {entry.workflow.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {entry.workflow.downloads}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Client Reviews Section */}
        {user.receivedReviews.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h2 className="text-3xl font-mono font-bold mb-2">
                CLIENT REVIEWS
              </h2>
              <p className="text-muted-foreground font-mono">
                Testimonials from {user.receivedReviews.length} satisfied{' '}
                {user.receivedReviews.length === 1 ? 'client' : 'clients'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {user.receivedReviews.map((review) => (
                <div
                  key={review.id}
                  className="border-2 bg-background/50 backdrop-blur-sm p-6"
                >
                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-sm font-mono text-muted-foreground mb-4 italic">
                    "{review.reviewText}"
                  </p>

                  {/* Client Info */}
                  <div className="flex items-center gap-3 pt-4 border-t-2">
                    <div className="w-10 h-10 border-2 border-muted overflow-hidden">
                      {review.clientAvatar ? (
                        <img
                          src={review.clientAvatar}
                          alt={review.clientName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-lg font-bold">
                          {review.clientName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-mono font-bold text-sm flex items-center gap-2">
                        {review.clientName}
                        {review.verified && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0">
                            VERIFIED
                          </Badge>
                        )}
                      </div>
                      {review.clientRole && review.clientCompany && (
                        <div className="text-xs font-mono text-muted-foreground">
                          {review.clientRole} at {review.clientCompany}
                        </div>
                      )}
                      {review.projectType && (
                        <div className="text-xs font-mono text-primary mt-1">
                          Project: {review.projectType}
                        </div>
                      )}
                    </div>
                  </div>

                  {review.featured && (
                    <Badge className="mt-3 bg-primary/20 text-primary border-primary text-[10px]">
                      FEATURED REVIEW
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {user.portfolioWorkflows.length === 0 && user.receivedReviews.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="border-2 bg-background/50 backdrop-blur-sm p-12">
              <Workflow className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-mono font-bold mb-2">
                COMING SOON
              </h3>
              <p className="text-muted-foreground font-mono">
                {user.name || username} is just getting started. Check back soon for amazing workflows!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
