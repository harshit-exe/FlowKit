"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="relative w-14 h-7 rounded-full bg-border animate-pulse" />
    )
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex items-center w-14 h-7 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      style={{
        backgroundColor: isDark ? '#FF6B35' : '#d1d5db'
      }}
      aria-label="Toggle theme"
    >
      {/* Sliding Circle */}
      <span
        className="inline-block w-5 h-5 rounded-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out"
        style={{
          transform: isDark ? 'translateX(28px)' : 'translateX(2px)'
        }}
      />

      {/* Icons */}
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 transition-opacity duration-300">
        <Sun
          className={`h-3.5 w-3.5 transition-opacity ${
            isDark ? 'opacity-0' : 'opacity-100 text-orange-600'
          }`}
          strokeWidth={2.5}
        />
      </span>
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 transition-opacity duration-300">
        <Moon
          className={`h-3.5 w-3.5 transition-opacity ${
            isDark ? 'opacity-100 text-white' : 'opacity-0'
          }`}
          strokeWidth={2.5}
        />
      </span>
    </button>
  )
}
