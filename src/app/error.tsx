"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-background to-orange-50">
      <div className="text-center space-y-6 p-8 max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Something went wrong!</h2>
          <p className="text-gray-600">
            We encountered an unexpected error. Please try again.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={reset} size="lg">
            Try Again
          </Button>
          <Button onClick={() => (window.location.href = "/")} variant="outline" size="lg">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
