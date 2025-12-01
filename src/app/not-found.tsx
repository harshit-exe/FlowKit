import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Page Not Found</h2>
          <p className="text-gray-600">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Link href="/workflows">
            <Button size="lg" variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Browse Workflows
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
