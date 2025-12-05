import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import EmailManagement from "@/components/admin/EmailManagement"
import { Card } from "@/components/ui/card"
import { Users, Mail, CheckCircle, Clock } from "lucide-react"

async function getWaitlistStats() {
  const [totalUsers, accessedUsers, recentSignups] = await Promise.all([
    prisma.waitlist.count(),
    prisma.waitlist.count({
      where: { hasAccessed: true }
    }),
    prisma.waitlist.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        email: true,
        hasAccessed: true,
        createdAt: true,
        accessedAt: true,
      }
    })
  ])

  return {
    totalUsers,
    accessedUsers,
    pendingUsers: totalUsers - accessedUsers,
    recentSignups
  }
}

export default async function EmailsAdminPage() {
  const stats = await getWaitlistStats()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-mono font-bold mb-2">EMAIL MANAGEMENT</h1>
        <p className="text-muted-foreground font-mono text-sm">
          Manage waitlist, send announcements, and test email delivery
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-2 bg-card/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 border-2 border-primary bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-3xl font-mono font-bold">{stats.totalUsers}</div>
              <div className="text-xs font-mono text-muted-foreground uppercase">
                Total Users
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2 bg-card/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 border-2 border-green-500 bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <div className="text-3xl font-mono font-bold text-green-500">{stats.accessedUsers}</div>
              <div className="text-xs font-mono text-muted-foreground uppercase">
                Accessed
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-2 bg-card/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 border-2 border-yellow-500 bg-yellow-500/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <div className="text-3xl font-mono font-bold text-yellow-500">{stats.pendingUsers}</div>
              <div className="text-xs font-mono text-muted-foreground uppercase">
                Pending
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Email Management Component */}
      <Suspense fallback={<div>Loading...</div>}>
        <EmailManagement stats={stats} />
      </Suspense>
    </div>
  )
}
