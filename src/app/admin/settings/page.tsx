import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { AISettings } from "@/components/admin/AISettings"
import { getActiveProvider } from "@/lib/ai-provider"

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions)
  const activeProvider = await getActiveProvider()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-100 mt-1">Admin panel configuration</p>
      </div>

      <AISettings initialProvider={activeProvider} />

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-100">Name</p>
            <p className="text-base">{session?.user?.name || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-100">Email</p>
            <p className="text-base">{session?.user?.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-100">Role</p>
            <Badge>{session?.user?.role}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-100">Application Version</p>
            <p className="text-base">1.0.0</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-100">Environment</p>
            <Badge variant="outline">{process.env.NODE_ENV}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
