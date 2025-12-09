import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BundleForm } from "@/components/admin/BundleForm"

export default function NewBundlePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create Bundle</h1>
        <p className="text-muted-foreground mt-1">
          Create a new workflow bundle collection
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bundle Details</CardTitle>
        </CardHeader>
        <CardContent>
          <BundleForm />
        </CardContent>
      </Card>
    </div>
  )
}
