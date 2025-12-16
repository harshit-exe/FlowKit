import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import AdminSidebar from "@/components/admin/AdminSidebar"

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
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar user={session.user} />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 lg:p-10 max-w-7xl space-y-8">
          {children}
        </div>
      </main>
    </div>
  )
}
