/**
 * Portfolio Dashboard
 * Route: /portfolio/dashboard
 * 
 * User's portfolio management hub - REDESIGNED
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Sparkles,
  Eye,
  Download,
  Star,
  ExternalLink,
  Settings,
  TrendingUp,
  Award,
  Workflow as WorkflowIcon,
  ArrowRight,
} from 'lucide-react';
import { AddWorkflowDialog } from '@/components/portfolio/AddWorkflowDialog';
import { RemoveWorkflowButton } from '@/components/portfolio/RemoveWorkflowButton';

export default async function PortfolioDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/portfolio/dashboard');
  }

  // Get user with portfolio data
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email! },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      image: true,
      portfolioEnabled: true,
      totalWorkflows: true,
      totalViews: true,
      totalDownloads: true,
      communityRating: true,
      badges: {
        select: {
          id: true,
          badgeType: true,
          title: true,
          description: true,
          icon: true,
          color: true,
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
              name: true,
              slug: true,
              icon: true,
              difficulty: true,
              views: true,
              downloads: true,
              nodeCount: true,
            },
          },
        },
        orderBy: [
          { featured: 'desc' },
          { order: 'asc' },
        ],
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  // If portfolio not set up, redirect to setup
  if (!user.portfolioEnabled || !user.username) {
    redirect('/portfolio/setup');
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Grid Background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'url(/grid.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '112px 112px',
          opacity: 0.3,
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border-2 border-primary bg-primary/10 overflow-hidden">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-primary font-mono">
                  {(user.name || user.username).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold font-mono mb-1">
                {user.name || user.username}
              </h1>
              <p className="text-muted-foreground font-mono text-sm">
                @{user.username} • Portfolio Dashboard
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href={`/u/${user.username}`} target="_blank">
              <Button variant="outline" className="font-mono border-2">
                <ExternalLink className="w-4 h-4 mr-2" />
                VIEW PUBLIC
              </Button>
            </Link>
            <Link href="/portfolio/settings">
              <Button className="font-mono">
                <Settings className="w-4 h-4 mr-2" />
                SETTINGS
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 to-transparent">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <WorkflowIcon className="w-5 h-5 text-primary" />
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div className="text-3xl font-bold font-mono text-primary mb-1">
                {user.totalWorkflows}
              </div>
              <div className="text-xs font-mono text-muted-foreground uppercase">
                Workflows
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 bg-background/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold font-mono mb-1">
                {user.totalViews.toLocaleString()}
              </div>
              <div className="text-xs font-mono text-muted-foreground uppercase">
                Profile Views
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 bg-background/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Download className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold font-mono mb-1">
                {user.totalDownloads.toLocaleString()}
              </div>
              <div className="text-xs font-mono text-muted-foreground uppercase">
                Total Downloads
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 bg-background/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="text-3xl font-bold font-mono mb-1 flex items-center gap-2">
                {user.communityRating > 0 ? user.communityRating.toFixed(1) : 'N/A'}
              </div>
              <div className="text-xs font-mono text-muted-foreground uppercase">
                Community Rating
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges Section */}
        {user.badges.length > 0 && (
          <Card className="border-2 bg-background/50 backdrop-blur-sm mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold font-mono flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  YOUR BADGES
                </h2>
                <Badge variant="outline" className="font-mono">
                  {user.badges.length} Earned
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {user.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="border-2 p-4 hover:scale-105 transition-transform group cursor-help relative overflow-hidden"
                    style={{ borderColor: badge.color }}
                  >
                    <div
                      className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
                      style={{ backgroundColor: badge.color }}
                    />
                    <div className="relative">
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <div
                        className="text-xs font-mono font-bold mb-1"
                        style={{ color: badge.color }}
                      >
                        {badge.title.toUpperCase()}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {badge.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Workflows Section */}
        <Card className="border-2 bg-background/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-mono flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                PORTFOLIO WORKFLOWS
              </h2>
              <AddWorkflowDialog />
            </div>

            {user.portfolioWorkflows.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.portfolioWorkflows.map((entry) => (
                  <div
                    key={entry.id}
                    className="border-2 p-4 group hover:border-primary transition-all relative"
                  >
                    {entry.featured && (
                      <Badge className="absolute top-2 right-2 bg-primary/20 text-primary border-primary text-[10px]">
                        FEATURED
                      </Badge>
                    )}

                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{entry.workflow.icon || '⚡'}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-mono font-bold text-sm mb-1 truncate">
                          {entry.customTitle || entry.workflow.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="secondary" className="font-mono text-[10px]">
                            {entry.workflow.difficulty}
                          </Badge>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {entry.workflow.nodeCount} nodes
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {entry.workflow.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {entry.workflow.downloads}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/workflows/${entry.workflow.slug}`}
                            target="_blank"
                            className="flex-1"
                          >
                            <Button variant="outline" size="sm" className="w-full font-mono text-xs">
                              <ArrowRight className="w-3 h-3 mr-1" />
                              VIEW
                            </Button>
                          </Link>
                          <RemoveWorkflowButton portfolioWorkflowId={entry.id} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed">
                <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="font-mono font-bold mb-2">No Workflows in Portfolio</h3>
                <p className="text-sm font-mono text-muted-foreground mb-4">
                  Add your first workflow to showcase your work
                </p>
                <AddWorkflowDialog />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
