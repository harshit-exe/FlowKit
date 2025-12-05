"use client"

import { useState, useEffect } from "react"
import AccessGate from "./AccessGate"

export default function AccessGateWrapper() {
  const [shouldShow, setShouldShow] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if access gate is enabled via environment variable
    const isEnabled = process.env.NEXT_PUBLIC_ENABLE_ACCESS_GATE === "true"

    if (!isEnabled) {
      setIsLoading(false)
      return
    }

    // Check if user has already authenticated (using localStorage for cross-tab persistence)
    const hasAccess = localStorage.getItem("flowkit_access")

    if (hasAccess === "true") {
      setShouldShow(false)
    } else {
      setShouldShow(true)
    }

    setIsLoading(false)
  }, [])

  // Don't render anything while loading to prevent flash
  if (isLoading) {
    return null
  }

  // Only show AccessGate if enabled and user hasn't authenticated
  if (!shouldShow) {
    return null
  }

  return <AccessGate />
}
