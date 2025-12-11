import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import AdminNav from "@/components/admin/AdminNav"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav user={session.user} />
      <main className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
